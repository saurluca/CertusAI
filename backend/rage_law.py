# %%
"""
RAG for Swiss law using DSPy.
Simple prototype that indexes local HTML files (fedlex-assets) and answers questions
with citations to retrieved sources.

References:
- DSPy: https://dspy.ai/
- DSPy Multi-hop search tutorial: https://dspy.ai/tutorials/multihop_search/
"""

import os
import re
import glob
import dspy
import bm25s
import Stemmer
from html.parser import HTMLParser
from model_builder import build_lm


lm = build_lm("apertus-70b-com")
dspy.configure(lm=lm)

NUM_DOCS_TO_LOAD = 500


# -----------------------------
# HTML loading and cleaning
# -----------------------------
class HTMLToTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self._in_title = False
        self._in_law_title = False
        self._title_chunks: list[str] = []
        self._law_title_chunks: list[str] = []
        self._text_chunks: list[str] = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "title":
            self._in_title = True
        if tag.lower() == "h1":
            # look for classes like 'erlasstitel' or 'botschafttitel'
            klass = None
            for k, v in attrs:
                if k.lower() == "class":
                    klass = v or ""
                    break
            if klass:
                classes = {c.strip() for c in klass.split()}
                if "erlasstitel" in classes or "botschafttitel" in classes:
                    self._in_law_title = True

    def handle_endtag(self, tag):
        if tag.lower() == "title":
            self._in_title = False
        if tag.lower() == "h1" and self._in_law_title:
            self._in_law_title = False

    def handle_data(self, data):
        if not data:
            return
        if self._in_title:
            self._title_chunks.append(data)
        elif self._in_law_title:
            self._law_title_chunks.append(data)
        else:
            self._text_chunks.append(data)

    def get_title(self) -> str:
        title = " ".join(self._title_chunks).strip()
        title = re.sub(r"\s+", " ", title)
        return title

    def get_law_title(self) -> str:
        law_title = " ".join(self._law_title_chunks).strip()
        law_title = re.sub(r"\s+", " ", law_title)
        return law_title

    def get_text(self) -> str:
        text = " ".join(self._text_chunks)
        text = re.sub(r"\s+", " ", text)
        return text.strip()


def extract_title_and_text(html_content: str, fallback_title: str) -> tuple[str, str]:
    parser = HTMLToTextParser()
    parser.feed(html_content)
    # Prefer the law-specific title if present, then <title>, then fallback
    title = parser.get_law_title() or parser.get_title() or fallback_title
    text = parser.get_text()
    return title, text


def load_fedlex_corpus(
    directory_path: str, index_limit: int | None = None
) -> tuple[list[dict], list[str]]:
    """Load HTML files from `directory_path`.

    Returns a tuple of:
    - documents: list of {id, title, text}
    - corpus_texts: list of strings used for BM25 indexing (title | text)
    """
    html_files = glob.glob(os.path.join(directory_path, "**", "*.html"), recursive=True)

    # Exclude French and Italian folders (e.g., .../fr/... or .../it/...)
    def _contains_lang_dir(p: str) -> bool:
        parts = os.path.normpath(p).split(os.sep)
        return "fr" in parts or "it" in parts

    html_files = [p for p in html_files if not _contains_lang_dir(p)]

    if index_limit is not None:
        html_files = html_files[:index_limit]

    documents: list[dict] = []
    for file_path in html_files:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                html_str = f.read()
        except FileNotFoundError:
            continue

        fallback_title = os.path.splitext(os.path.basename(file_path))[0]
        title, text = extract_title_and_text(html_str, fallback_title=fallback_title)
        if not text:
            continue
        documents.append(
            {
                "id": file_path,
                "title": title,
                "text": text,
            }
        )

    corpus_texts = [f"{doc['title']} | {doc['text']}" for doc in documents]
    return documents, corpus_texts


# %%
# -----------------------------
# Retriever setup
# -----------------------------
FEDLEX_DIR = os.environ.get(
    "FEDLEX_DIR", os.path.join(os.getcwd(), "data/fedlex-assets")
)
INDEX_LIMIT = int(
    os.environ.get("FEDLEX_INDEX_LIMIT", NUM_DOCS_TO_LOAD)
)  # cap for prototype

print("Loading fedlex HTML corpus...")
documents, corpus = load_fedlex_corpus(FEDLEX_DIR, index_limit=INDEX_LIMIT)
print(f"Loaded {len(documents)} HTML documents from: {FEDLEX_DIR}")

# Exit early if no documents found to avoid indexing an empty corpus
if len(documents) == 0:
    print(
        "No HTML documents found. Place your files under 'fedlex-assets/' or set FEDLEX_DIR."
    )
    raise SystemExit(0)

print("Setting up BM25 retriever...")

stemmer = Stemmer.Stemmer("german")
corpus_tokens = bm25s.tokenize(corpus, stopwords="de", stemmer=stemmer)
retriever = bm25s.BM25(k1=0.9, b=0.4)
retriever.index(corpus_tokens)


DOCUMENT_CONTEXT_LENGTH = 10000


def search(query: str, k: int) -> list[dict]:
    """Retrieve top-k documents for `query` and return rich hits."""
    if not documents:
        return []
    tokens = bm25s.tokenize(query, stopwords="de", stemmer=stemmer, show_progress=False)
    results, scores = retriever.retrieve(tokens, k=k, n_threads=1, show_progress=False)
    hits: list[dict] = []
    for doc_index, score in zip(results[0], scores[0]):
        doc = documents[doc_index]
        snippet = doc["text"][:DOCUMENT_CONTEXT_LENGTH].replace("\n", " ").strip()
        hits.append(
            {
                "doc_id": doc["id"],
                "title": doc["title"],
                "snippet": snippet,
                "score": float(score),
            }
        )
    return hits


# %%
# -----------------------------
# DSPy module for answering with citations
# -----------------------------
class AnswerWithCitations(dspy.Module):
    def __init__(self, num_docs: int = 5):
        self.num_docs = num_docs
        self.compose_context = lambda hits: "\n\n".join(
            [f"[{i + 1}] {h['title']}\n{h['snippet']}" for i, h in enumerate(hits)]
        )
        # Add query generation step
        self.generate_query = dspy.ChainOfThought("question -> search_query")
        self.answer = dspy.ChainOfThought(
            "question, contexts -> answer, citations: list[str], confidence: float"
        )

    def forward(self, question: str):
        # Generate optimized search query from user question
        query_pred = self.generate_query(question=question)
        search_query = getattr(query_pred, "search_query", question)

        # Use generated query for document search
        hits = search(search_query, k=self.num_docs)
        contexts = self.compose_context(hits)
        pred = self.answer(question=question, contexts=contexts)

        predicted_answer = getattr(pred, "answer", "")
        predicted_citations = getattr(pred, "citations", None)
        predicted_confidence = getattr(
            pred, "confidence", 0.5
        )  # Default to 0.5 if not provided

        if not predicted_citations:
            predicted_citations = [h["title"] for h in hits[:3]]

        # Ensure confidence is a float between 0 and 1
        try:
            confidence = float(predicted_confidence)
            confidence = max(0.0, min(1.0, confidence))  # Clamp between 0 and 1
        except (ValueError, TypeError):
            confidence = 0.5  # Default if parsing fails

        retrieved_titles = [h["title"] for h in hits]
        return dspy.Prediction(
            answer=predicted_answer,
            citations=predicted_citations,
            retrieved=retrieved_titles,
            search_query=search_query,  # Include generated query in output
            confidence=confidence,
        )


# %%
# -----------------------------
# Demo with 3 manual questions
# -----------------------------
if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("DSPy RAG: Swiss Law Prototype")
    print("=" * 50)

    if len(documents) == 0:
        print(
            "No HTML documents found. Place your files under 'fedlex-assets/' or set FEDLEX_DIR."
        )
        raise SystemExit(0)

    sample_docs = documents[:3]
    # print("Sample documents:")
    # for d in sample_docs:
    #     print(f"- {d['title']}  ({d['id']})")

    # Construct three simple test prompts that anchor on the titles
    test_questions: list[str] = [
        # "What are the two main bodies that form the overdepartmental crisis organization of the Federal Administration"
        # "Which two federal offices cooperate to run the Base Organization for Crisis Management (BOK)?"
        "Welche Rechte hat eine Person gemäss Bundesverfassung bei der Meinungsfreiheit",
        "Unter welchen Umständen darf ein Arbeitsvertrag in der Probezeit gekündigt werden?",
        "Welche Datenschutzpflichten bestehen für Bundesbehörden?",
    ]

    rag = AnswerWithCitations(num_docs=5)

    print("\nRunning 3 test questions...\n")
    for i, q in enumerate(test_questions, start=1):
        print("-" * 50)
        print(f"Q{i}: {q}")
        pred = rag(question=q)
        print(f"Generated Query: {pred.search_query}")
        print(f"Answer: {pred.answer}")
        print(f"Confidence: {pred.confidence:.2f}")
        print(f"Citations: {pred.citations}")
        print(f"Retrieved: {pred.retrieved[:5]}")
    print("-" * 50)
