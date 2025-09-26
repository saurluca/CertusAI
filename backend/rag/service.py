import os
from typing import List, Dict, Optional

import dspy

from .corpus import load_fedlex_corpus
from .retrieval import build_bm25_retriever, search as bm25_search
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
    ) -> None:
        self._fedlex_dir = fedlex_dir or os.environ.get(
            "FEDLEX_DIR", os.path.join(os.getcwd(), "data/fedlex-assets")
        )
        self._index_limit = index_limit or int(
            os.environ.get("FEDLEX_INDEX_LIMIT", "500")
        )
        self._num_docs = num_docs
        self._document_context_length = document_context_length

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

        # Build retriever
        self.retriever, self.stemmer, _ = build_bm25_retriever(self.corpus)

        # Search function closure
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
