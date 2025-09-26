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
        model_name: str = "gpt-4o-mini",
        num_docs: int = 5,
        document_context_length: int = 10000,
        retrieval: str = "bm25",
        embedding_model: str = "ollama/nomic-embed-text:latest",
        embedding_dimensions: int = 512,
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

        lm = build_lm(model_name)
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
            self.retriever, self.stemmer, _ = build_bm25_retriever(self.corpus)

            def _search(q: str, k: int) -> List[Dict]:
                return bm25_search(
                    q,
                    k,
                    retriever=self.retriever,
                    stemmer=self.stemmer,
                    corpus_entries=self.corpus_entries,
                    documents=self.documents,
                    document_context_length=self._document_context_length,
                )

        # Answerer
        self.answerer = AnswerWithCitations(
            num_docs=self._num_docs, search_fn=_search, documents=self.documents
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
