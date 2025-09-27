import os
from typing import List, Dict, Optional

import dspy

from .corpus import load_fedlex_corpus
from .retrieval import build_bm25_retriever, search as bm25_search
from .semantic_retrieval import build_embeddings_retriever, search as semantic_search
from .answerer import AnswerWithCitations
from model_builder import build_lm


class LawRAGService:
    """End-to-end service for Swiss law Q&A with citations."""

    def __init__(
        self,
        *,
        fedlex_dir: Optional[str] = None,
        index_limit: Optional[int] = None,
        model_name: str = "apertus-70b-com",
        num_docs: int = 10,
        document_context_length: int = 10000,
        retrieval: str = "bm25",
        embedding_model: str = "ollama/nomic-embed-text:latest",
        embedding_dimensions: int = 512,
        answer_languages: Optional[List[str]] = None,
    ) -> None:
        self._fedlex_dir = fedlex_dir or os.environ.get(
            "FEDLEX_DIR", os.path.join(os.getcwd(), "data/fedlex-assets")
        )
        self._index_limit = index_limit or int(
            os.environ.get("FEDLEX_INDEX_LIMIT", "500")
        )
        self._num_docs = num_docs
        self._document_context_length = document_context_length
        self._retrieval = (retrieval or os.environ.get("RETRIEVAL", "bm25")).lower()
        self._embedding_model = os.environ.get("EMBEDDING_MODEL", embedding_model)
        self._embedding_dimensions = int(
            os.environ.get("EMBEDDING_DIMENSIONS", str(embedding_dimensions))
        )
        # Language selection for BM25 answering: ["de"], ["fr"], ["it"], or ["de","fr","it"]
        langs = answer_languages or [os.environ.get("RAG_LANG", "de")]
        # Normalize and validate
        normalized: List[str] = []
        for lang in langs:
            lc = (lang or "de").lower()
            if lc in ("de", "fr", "it"):
                normalized.append(lc)
        self._answer_languages = normalized or ["de"]

        lm = build_lm(model_name, 4096)
        dspy.configure(lm=lm)

        # Load corpus
        self.documents, self.corpus, self.corpus_entries = load_fedlex_corpus(
            self._fedlex_dir, index_limit=self._index_limit
        )
        if not self.documents:
            raise RuntimeError(
                "No HTML documents found. Place files under 'fedlex-assets/' or set FEDLEX_DIR."
            )

        # Build retriever(s)
        if self._retrieval == "semantic":
            self.emb_retriever, _ = build_embeddings_retriever(
                self.corpus,
                embedding_model=self._embedding_model,
                dimensions=self._embedding_dimensions,
                default_k=self._num_docs,
            )

            def _search(q: str, k: int) -> List[Dict]:
                return semantic_search(
                    q,
                    k,
                    retriever=self.emb_retriever,
                    corpus_entries=self.corpus_entries,
                    documents=self.documents,
                    corpus_texts=self.corpus,
                    document_context_length=self._document_context_length,
                )

        else:
            # Build per-language corpora and retrievers
            lang_to_texts: Dict[str, List[str]] = {"de": [], "fr": [], "it": []}
            lang_to_entries: Dict[str, List[Dict]] = {"de": [], "fr": [], "it": []}

            for idx, entry in enumerate(self.corpus_entries):
                doc = self.documents[entry["doc_idx"]]
                lang = doc.get("lang", "de")
                if lang not in ("de", "fr", "it"):
                    lang = "de"
                lang_to_texts[lang].append(self.corpus[idx])
                lang_to_entries[lang].append(entry)

            # Create retrievers for each language
            self.bm25_by_lang = {}
            self.stopwords_by_lang = {"de": "de", "fr": "fr", "it": "it"}
            stemmer_name = {"de": "german", "fr": "french", "it": "italian"}

            for lang in ("de", "fr", "it"):
                texts = lang_to_texts[lang]
                entries = lang_to_entries[lang]
                if texts:
                    retriever, stemmer, _ = build_bm25_retriever(
                        texts,
                        stemmer_lang=stemmer_name[lang],
                        stopwords_lang=self.stopwords_by_lang[lang],
                    )
                else:
                    retriever, stemmer = None, None  # type: ignore
                self.bm25_by_lang[lang] = {
                    "retriever": retriever,
                    "stemmer": stemmer,
                    "entries": entries,
                    "texts": texts,
                }

            def _search(q: str, k: int, lang: Optional[str] = None) -> List[Dict]:
                # If a specific language is provided, search only that retriever
                def run_one(lcode: str) -> List[Dict]:
                    cfg = self.bm25_by_lang.get(lcode, {})
                    retr = cfg.get("retriever")
                    stem = cfg.get("stemmer")
                    entries = cfg.get("entries")
                    if not retr or not stem or not entries:
                        return []
                    return bm25_search(
                        q,
                        k,
                        retriever=retr,
                        stemmer=stem,
                        corpus_entries=entries,  # entries mapped to language-specific texts
                        documents=self.documents,
                        document_context_length=self._document_context_length,
                        stopwords_lang=self.stopwords_by_lang.get(lcode, "de"),
                    )

                if lang in ("de", "fr", "it"):
                    return run_one(lang)

                # Otherwise, aggregate results from all languages and return top-k
                combined: List[Dict] = []
                for lcode in ("de", "fr", "it"):
                    combined.extend(run_one(lcode))

                # Deduplicate by (doc_id, article_ref) keeping highest score
                best_by_key: Dict[tuple, Dict] = {}
                for h in combined:
                    key = (h.get("doc_id"), h.get("article_ref"))
                    prev = best_by_key.get(key)
                    if not prev or float(h.get("score", 0.0)) > float(
                        prev.get("score", 0.0)
                    ):
                        best_by_key[key] = h

                deduped = list(best_by_key.values())

                # Re-apply official boost for ranking across languages
                def boosted(hit: Dict) -> float:
                    base = float(hit.get("score", 0.0))
                    kind = hit.get("source_kind")
                    return base * 1.25 if kind == "official" else base

                deduped.sort(key=boosted, reverse=True)
                return deduped[:k]

        # expose search closure for rebuilding answerer later
        self._search = _search  # type: ignore[assignment]

        # Answerer
        self.answerer = AnswerWithCitations(
            num_docs=self._num_docs,
            search_fn=self._search,
            documents=self.documents,
            search_languages=self._answer_languages,
        )

    def ask(self, question: str) -> Dict:
        pred = self.answerer(question=question)
        return {
            "answer": getattr(pred, "answer", ""),
            "citations": getattr(pred, "citations", []),
            "retrieved": getattr(pred, "retrieved", []),
            "search_query": getattr(pred, "search_query", question),
            "confidence": float(getattr(pred, "confidence", 0.5)),
            "article_refs": getattr(pred, "article_refs", []),
            "article_quotes": getattr(pred, "article_quotes", []),
        }
