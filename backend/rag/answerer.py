from typing import List, Dict, Callable

import dspy


class AnswerWithCitations(dspy.Module):
    def __init__(
        self,
        *,
        num_docs: int,
        search_fn: Callable[[str, int], List[Dict]],
        documents: List[Dict],
    ):
        """Answer questions with citations.

        Parameters
        - num_docs: number of docs to retrieve per query
        - search_fn: function(query, k) -> hits
        - documents: full document list for heuristic fallbacks
        """
        self.num_docs = num_docs
        self._search_fn = search_fn
        self._documents = documents

        def _compose(hits: List[Dict]) -> str:
            lines: List[str] = []
            for i, h in enumerate(hits):
                label = h.get("article_ref") or h.get("title")
                abbr = h.get("abbr")
                if abbr and h.get("article_ref") and abbr not in label:
                    label = f"{label} {abbr}"
                lines.append(f"[{i + 1}] {label}\n{h['snippet']}")
            return "\n\n".join(lines)

        self.compose_context = _compose
        self.generate_query = dspy.ChainOfThought("question -> search_query")
        self.answer = dspy.ChainOfThought(
            (
                "question, contexts -> answer, citations: list[str], confidence: float, "
                "article_refs: list[str], article_quotes: list[str]"
            )
        )

    def forward(self, question: str):
        query_pred = self.generate_query(question=question)
        search_query = getattr(query_pred, "search_query", question)

        hits = self._search_fn(search_query, self.num_docs)
        contexts = self.compose_context(hits)
        pred = self.answer(question=question, contexts=contexts)

        predicted_answer = getattr(pred, "answer", "")
        predicted_citations = getattr(pred, "citations", None)
        predicted_article_refs = getattr(pred, "article_refs", None)
        predicted_article_quotes = getattr(pred, "article_quotes", None)
        predicted_confidence = getattr(pred, "confidence", 0.5)

        if not predicted_citations:
            predicted_citations = [h["title"] for h in hits[:3]]

        if not predicted_article_refs or not predicted_article_quotes:
            article_refs: List[str] = []
            article_quotes: List[str] = []
            for h in hits[:3]:
                if h.get("article_ref"):
                    article_refs.append(h["article_ref"])
                    article_quotes.append(h["snippet"])
                    continue
                doc = next(
                    (d for d in self._documents if d["title"] == h["title"]), None
                )
                if not doc:
                    continue
                for art in doc.get("articles", [])[:2]:
                    article_refs.append(art["ref"])
                    quote = art["text"]
                    if len(quote) > 600:
                        quote = quote[:600] + "..."
                    article_quotes.append(quote)
            predicted_article_refs = predicted_article_refs or article_refs
            predicted_article_quotes = predicted_article_quotes or article_quotes

        try:
            confidence = float(predicted_confidence)
            confidence = max(0.0, min(1.0, confidence))
        except (ValueError, TypeError):
            confidence = 0.5

        retrieved_titles = [h["title"] for h in hits]
        return dspy.Prediction(
            answer=predicted_answer,
            citations=predicted_citations,
            retrieved=retrieved_titles,
            search_query=search_query,
            confidence=confidence,
            article_refs=predicted_article_refs or [],
            article_quotes=predicted_article_quotes or [],
        )
