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


def _infer_lang(file_path: str) -> str:
    """Infer document language from path parts.

    - 'de' -> German
    - 'fr' -> French
    - 'it' -> Italian
    Defaults to 'de' if none found.
    """
    norm_path = os.path.normpath(file_path)
    parts = set(norm_path.split(os.sep))
    if "fr" in parts:
        return "fr"
    if "it" in parts:
        return "it"
    if "de" in parts:
        return "de"
    return "de"


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
        title, text, abbr, short_title = extract_title_and_text(
            html_str, fallback_title=fallback_title
        )
        if not text:
            continue
        # Extract article spans to support precise citations
        raw_articles = extract_articles_from_text(text, default_abbr=abbr)
        # Determine a stable law marker: prefer abbreviation, else short title, else full title
        law_marker = abbr or (short_title.strip() if short_title else None) or title
        # Normalize each article reference to include a law marker when missing
        articles = []
        for art in raw_articles:
            ref = art.get("ref", "").strip()
            if ref:
                has_marker = False
                if abbr and abbr in ref:
                    has_marker = True
                if not has_marker and law_marker and law_marker in ref:
                    has_marker = True
                if not has_marker and law_marker:
                    ref = f"{ref} {law_marker}".strip()
            articles.append(
                {
                    "ref": ref,
                    "text": art.get("text", ""),
                    "law_marker": law_marker,
                }
            )
        documents.append(
            {
                "id": file_path,
                "title": title,
                "abbr": abbr,
                "short_title": short_title,
                "law_marker": law_marker,
                "text": text,
                "articles": articles,
                "source_kind": _infer_source_kind(file_path),
                "lang": _infer_lang(file_path),
            }
        )

    # Index both full text and (lightweight) article spans for better recall
    corpus_texts: List[str] = []
    corpus_entries: List[Dict] = []  # aligns 1:1 with corpus_texts
    for doc_idx, doc in enumerate(documents):
        corpus_texts.append(f"{doc['title']} | {doc['text']}")
        corpus_entries.append({"doc_idx": doc_idx, "kind": "doc"})
        for art in doc.get("articles", []):
            # Ensure the law marker is present in the indexed text to aid semantic mapping
            law_marker = art.get("law_marker") or doc.get("law_marker") or doc["title"]
            corpus_texts.append(
                f"{doc['title']} | {art['ref']} | {law_marker} | {art['text']}"
            )
            corpus_entries.append(
                {
                    "doc_idx": doc_idx,
                    "kind": "article",
                    "article_ref": art["ref"],
                    "article_text": art["text"],
                    "law_marker": law_marker,
                }
            )
    return documents, corpus_texts, corpus_entries
