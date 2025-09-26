import os
from fastapi import FastAPI
from typing import Optional

from rag import LawRAGService


app = FastAPI(title="Swiss Law RAG API", version="0.1.0")


_service: Optional[LawRAGService] = None


def get_service(num_docs: Optional[int] = None) -> LawRAGService:
    global _service
    # Allow changing num_docs per request while reusing heavy corpus + retriever
    if _service is None:
        fedlex_dir = os.environ.get("FEDLEX_DIR")
        index_limit = (
            int(os.environ["FEDLEX_INDEX_LIMIT"])
            if os.environ.get("FEDLEX_INDEX_LIMIT")
            else None
        )
        model_name = os.environ.get("RAG_MODEL", "gpt-4o-mini")
        _service = LawRAGService(
            fedlex_dir=fedlex_dir,
            index_limit=index_limit,
            model_name=model_name,
            num_docs=num_docs or int(os.environ.get("RAG_NUM_DOCS", "5")),
        )
    else:
        if num_docs is not None and num_docs != _service._num_docs:
            # Rebuild only the answerer with new k; keep corpus and retriever
            _service._num_docs = num_docs
            _service.answerer = _service.answerer.__class__(
                num_docs=_service._num_docs,
                search_fn=lambda q, k: _service.answerer._search_fn(q, k),
                documents=_service.documents,
            )
    return _service


@app.post("/ask")
def ask(question: str, num_docs: Optional[int] = None):
    service = get_service(num_docs=num_docs)
    result = service.ask(question)
    return result
