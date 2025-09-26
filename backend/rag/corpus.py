import os
import glob
from typing import List, Dict, Tuple, Optional

from .html_utils import extract_title_and_text, extract_articles_from_text


def _infer_source_kind(file_path: str) -> str:
    """Infer whether a Fedlex HTML file is an official law text or reference.

    - cc, oc -> official
    - fga -> reference
    """
    norm_path = os.path.normpath(file_path)
    parts = set(norm_path.split(os.sep))
    if "cc" in parts or "oc" in parts:
        return "official"
    if "fga" in parts:
        return "reference"
    return "unknown"


def load_fedlex_corpus(
    directory_path: str, index_limit: Optional[int] = None
) -> Tuple[List[Dict], List[str], List[Dict]]:
    """Load HTML files from `directory_path`.

    Returns a tuple of:
    - documents: list of {id, title, text}
    - corpus_texts: list of strings used for BM25 indexing (title | text)
    - corpus_entries: metadata aligned with corpus_texts
    """
    html_files = glob.glob(os.path.join(directory_path, "**", "*.html"), recursive=True)

    # Exclude French and Italian folders (e.g., .../fr/... or .../it/...)
    def _contains_lang_dir(p: str) -> bool:
        parts = os.path.normpath(p).split(os.sep)
        return "fr" in parts or "it" in parts

    html_files = [p for p in html_files if not _contains_lang_dir(p)]

    if index_limit is not None:
        html_files = html_files[:index_limit]

    documents: List[Dict] = []
    for file_path in html_files:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                html_str = f.read()
        except FileNotFoundError:
            continue

        fallback_title = os.path.splitext(os.path.basename(file_path))[0]
        title, text, abbr = extract_title_and_text(
            html_str, fallback_title=fallback_title
        )
        if not text:
            continue
        # Extract article spans to support precise citations
        articles = extract_articles_from_text(text, default_abbr=abbr)
        documents.append(
            {
                "id": file_path,
                "title": title,
                "abbr": abbr,
                "text": text,
                "articles": articles,
                "source_kind": _infer_source_kind(file_path),
            }
        )

    # Index both full text and (lightweight) article spans for better recall
    corpus_texts: List[str] = []
    corpus_entries: List[Dict] = []  # aligns 1:1 with corpus_texts
    for doc_idx, doc in enumerate(documents):
        corpus_texts.append(f"{doc['title']} | {doc['text']}")
        corpus_entries.append({"doc_idx": doc_idx, "kind": "doc"})
        for art in doc.get("articles", []):
            corpus_texts.append(f"{doc['title']} | {art['ref']} | {art['text']}")
            corpus_entries.append(
                {
                    "doc_idx": doc_idx,
                    "kind": "article",
                    "article_ref": art["ref"],
                    "article_text": art["text"],
                }
            )
    return documents, corpus_texts, corpus_entries
