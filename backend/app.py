import os
from fastapi import FastAPI
from typing import Optional

from rag import LawRAGService


app = FastAPI(title="Swiss Law RAG API", version="0.1.0")


_service: Optional[LawRAGService] = None


def get_service(
    num_docs: Optional[int] = None, retrieval: Optional[str] = None
) -> LawRAGService:
    global _service
    # Allow changing retrieval and num_docs per request while reusing heavy corpus
    desired_retrieval = (retrieval or os.environ.get("RETRIEVAL", "bm25")).lower()
    if _service is None or getattr(_service, "_retrieval", "bm25") != desired_retrieval:
        fedlex_dir = os.environ.get("FEDLEX_DIR")
        index_limit = (
            int(os.environ["FEDLEX_INDEX_LIMIT"])
            if os.environ.get("FEDLEX_INDEX_LIMIT")
            else None
        )
        # apertus-70b-com
        # llama3.2:3b
        model_name = os.environ.get("RAG_MODEL", "gpt-4o-mini")
        _service = LawRAGService(
            fedlex_dir=fedlex_dir,
            index_limit=index_limit,
            model_name=model_name,
            num_docs=num_docs or int(os.environ.get("RAG_NUM_DOCS", "10")),
            retrieval=desired_retrieval,
        )
    else:
        if num_docs is not None and num_docs != _service._num_docs:
            # Rebuild only the answerer with new k; keep corpus and retriever
            _service._num_docs = num_docs
            _service.answerer = _service.answerer.__class__(
                num_docs=_service._num_docs,
                search_fn=lambda q, k, lang_code=None: _service._search(
                    q, k, lang_code
                ),
                documents=_service.documents,
                search_languages=getattr(_service, "_answer_languages", ["de"]),
            )
    return _service


@app.post("/ask")
def ask(
    question: str,
    num_docs: Optional[int] = None,
    retrieval: Optional[str] = "bm25",
    lang: Optional[str] = "de",  # "de", "fr", "it", or "all"
):
    service = get_service(num_docs=num_docs, retrieval=retrieval)
    # Update answer languages dynamically per request
    if retrieval == "bm25":
        if lang == "all":
            service._answer_languages = ["de", "fr", "it"]
        elif lang in ("de", "fr", "it"):
            service._answer_languages = [lang]
        else:
            service._answer_languages = ["de"]
        # Rebuild only the answerer to apply language selection
        service.answerer = service.answerer.__class__(
            num_docs=service._num_docs,
            search_fn=lambda q, k, lang_code=None: service._search(q, k, lang_code),
            documents=service.documents,
            search_languages=service._answer_languages,
        )
    result = service.ask(question)
    return result
