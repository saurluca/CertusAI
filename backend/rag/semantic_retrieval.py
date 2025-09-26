from typing import List, Dict, Tuple, Any

import dotenv

import dspy

dotenv.load_dotenv()


def build_embeddings_retriever(
    corpus_texts: List[str],
    *,
    embedding_model: str = "ollama/nomic-embed-text:latest",
    dimensions: int = 512,
    default_k: int = 5,
) -> Tuple[dspy.retrievers.Embeddings, dspy.Embedder]:
    """Create a simple semantic retriever using DSPy embeddings.

    Returns the DSPy `Embeddings` retriever and the underlying embedder.
    """
    # embedder = dspy.Embedder(
    #     embedding_model, dimensions=dimensions, api_key=os.getenv("OPENROUTER_API_KEY")
    # )
    embedder = dspy.Embedder(
        embedding_model,
        # dimensions=dimensions,
        api_key="",
        api_base="http://100.116.24.45:11434",
    )
    retriever = dspy.retrievers.Embeddings(
        embedder=embedder, corpus=corpus_texts, k=default_k
    )
    return retriever, embedder


def search(
    query: str,
    k: int,
    *,
    retriever: Any,
    corpus_entries: List[Dict],
    documents: List[Dict],
    corpus_texts: List[str],
    document_context_length: int = 10000,
) -> List[Dict]:
    """Run a semantic search over `corpus_texts` and map back to document metadata.

    The return schema mirrors the BM25 `search` to keep the answerer interchangeable.
    """
    if not documents:
        return []

    # Execute the DSPy embeddings search, being permissive about call signatures.
    try:
        results = retriever(query, k=k)
    except TypeError:
        try:
            results = retriever(query=query, k=k)
        except Exception:
            results = retriever(query)

    # Normalize results into a list of (text, score) pairs.
    normalized: List[Tuple[str, float]] = []
    if isinstance(results, list):
        for item in results:
            text: str = ""
            score: float = 0.0
            if isinstance(item, dict):
                text = (
                    item.get("text")
                    or item.get("document")
                    or item.get("content")
                    or item.get("value")
                    or ""
                )
                try:
                    score = float(item.get("score", 0.0))
                except Exception:
                    score = 0.0
            elif isinstance(item, (tuple, list)) and len(item) >= 1:
                text = str(item[0])
                if len(item) >= 2:
                    try:
                        score = float(item[1])
                    except Exception:
                        score = 0.0
            else:
                text = str(item)
            if text:
                normalized.append((text, score))
    else:
        # Fallback: just coerce to string
        normalized.append((str(results), 0.0))

    # Map retrieved texts back to corpus indices (best-effort exact match).
    # Keep simple for now; duplicates will pick the first match.
    hits: List[Dict] = []
    taken_indices = set()
    for text, score in normalized:
        idx = None
        try:
            idx = corpus_texts.index(text)
        except ValueError:
            # If exact string wasn't found (e.g., retriever returns trimmed text), skip.
            continue
        if idx in taken_indices:
            continue
        taken_indices.add(idx)
        entry = corpus_entries[idx]
        doc = documents[entry["doc_idx"]]

        if entry["kind"] == "article":
            snippet = (
                entry["article_text"][:document_context_length]
                .replace("\n", " ")
                .strip()
            )
            article_ref = entry.get("article_ref")
            law_marker = entry.get("law_marker")
        else:
            snippet = doc["text"][:document_context_length].replace("\n", " ").strip()
            article_ref = None
            law_marker = doc.get("law_marker")
        source_kind = doc.get("source_kind", "unknown")

        hits.append(
            {
                "doc_id": doc["id"],
                "title": doc["title"],
                "abbr": doc.get("abbr"),
                "law_marker": law_marker
                or doc.get("abbr")
                or doc.get("short_title")
                or doc.get("title"),
                "snippet": snippet,
                "score": float(score),
                "article_ref": article_ref,
                "source_kind": source_kind,
            }
        )

    # Respect k limit and return
    return hits[:k]
