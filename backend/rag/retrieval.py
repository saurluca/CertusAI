from typing import List, Dict, Tuple

import bm25s
import Stemmer


def build_bm25_retriever(
    corpus_texts: List[str],
    *,
    stemmer_lang: str = "german",
    stopwords_lang: str = "de",
) -> Tuple[bm25s.BM25, Stemmer.Stemmer, List[List[str]]]:
    stemmer = Stemmer.Stemmer(stemmer_lang)
    corpus_tokens = bm25s.tokenize(
        corpus_texts, stopwords=stopwords_lang, stemmer=stemmer
    )
    retriever = bm25s.BM25(k1=0.9, b=0.4)
    retriever.index(corpus_tokens)
    return retriever, stemmer, corpus_tokens


def search(
    query: str,
    k: int,
    *,
    retriever: bm25s.BM25,
    stemmer: Stemmer.Stemmer,
    corpus_entries: List[Dict],
    documents: List[Dict],
    document_context_length: int = 10000,
    stopwords_lang: str = "de",
) -> List[Dict]:
    if not documents:
        return []
    tokens = bm25s.tokenize(
        query, stopwords=stopwords_lang, stemmer=stemmer, show_progress=False
    )
    results, scores = retriever.retrieve(tokens, k=k, n_threads=1, show_progress=False)
    hits: List[Dict] = []
    raw_hits: List[Dict] = []
    for corpus_idx, score in zip(results[0], scores[0]):
        entry = corpus_entries[corpus_idx]
        doc = documents[entry["doc_idx"]]
        if entry["kind"] == "article":
            snippet = (
                entry["article_text"][:document_context_length]
                .replace("\n", " ")
                .strip()
            )
            article_ref = entry.get("article_ref")
        else:
            snippet = doc["text"][:document_context_length].replace("\n", " ").strip()
            article_ref = None
        source_kind = doc.get("source_kind", "unknown")
        lang = doc.get("lang", "de")
        raw_hits.append(
            {
                "doc_id": doc["id"],
                "title": doc["title"],
                "abbr": doc.get("abbr"),
                "snippet": snippet,
                "score": float(score),
                "article_ref": article_ref,
                "source_kind": source_kind,
                "lang": lang,
            }
        )

    # Prefer official law texts (cc/oc) over reference texts (fga)
    def boosted(h: Dict) -> float:
        base = h["score"]
        kind = h.get("source_kind")
        if kind == "official":
            return base * 1.25
        return base

    raw_hits.sort(key=boosted, reverse=True)
    return raw_hits[:k]
