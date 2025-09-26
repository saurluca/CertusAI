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
        """Answer questions for Swiss law with citations. Based on the retrieved resutlts of your query.
        The answer should be concise and to the point, make it a single paragraph.

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

        # Build legal-style references from hits, preferring official sources
        def _make_ref(h: Dict) -> str:
            ref = h.get("article_ref")
            abbr = h.get("abbr")
            if ref:
                if abbr and abbr not in ref:
                    return f"{ref} {abbr}"
                return ref
            # fallback: no article_ref; try to synthesize from first article of the doc
            doc = next(
                (d for d in self._documents if d["title"] == h.get("title")), None
            )
            if doc and doc.get("articles"):
                first = doc["articles"][0]
                base = first.get("ref") or doc.get("title")
                abbr2 = doc.get("abbr")
                if base and abbr2 and abbr2 not in base:
                    return f"{base} {abbr2}"
                return base or doc.get("title", "")
            return h.get("title", "")

        # Deduplicate while preserving order
        def _dedup(seq: List[str]) -> List[str]:
            seen = set()
            out: List[str] = []
            for s in seq:
                if not s:
                    continue
                if s in seen:
                    continue
                seen.add(s)
                out.append(s)
            return out

        official_refs = _dedup(
            [_make_ref(h) for h in hits if h.get("source_kind") == "official"]
        )
        all_refs = _dedup([_make_ref(h) for h in hits])

        if not predicted_citations:
            # Prefer official refs, fallback to any refs, then titles
            if official_refs:
                predicted_citations = official_refs[:5]
            elif all_refs:
                predicted_citations = all_refs[:5]
            else:
                predicted_citations = [h["title"] for h in hits[:3]]

        if not predicted_article_refs or not predicted_article_quotes:
            article_refs: List[str] = []
            article_quotes: List[str] = []
            # Prefer official hits for article refs/quotes as well
            prioritized_hits = [
                h for h in hits if h.get("source_kind") == "official"
            ] or hits
            for h in prioritized_hits[:3]:
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

        # Ensure the plain-text answer itself contains compact legal references
        legal_refs_inline = official_refs or all_refs
        if legal_refs_inline:
            # Append a compact reference sentence; keep single-paragraph style
            refs_str = "; ".join(legal_refs_inline[:5])
            if predicted_answer:
                predicted_answer = f"{predicted_answer} Siehe: {refs_str}."
            else:
                predicted_answer = f"Siehe: {refs_str}."
        return dspy.Prediction(
            answer=predicted_answer,
            citations=predicted_citations,
            retrieved=retrieved_titles,
            search_query=search_query,
            confidence=confidence,
            article_refs=predicted_article_refs or [],
            article_quotes=predicted_article_quotes or [],
        )
