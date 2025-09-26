from typing import List, Dict, Callable, Any, Optional

import dspy


class AnswerWithCitations(dspy.Module):
    def __init__(
        self,
        *,
        num_docs: int,
        search_fn: Callable[..., List[Dict]],
        documents: List[Dict],
        search_languages: Optional[List[str]] = None,
    ):
        """Answer questions for Swiss law with citations.
        Generate search queries in German, French, and Italian for BM25,
        the query should be atleast 10 words.
        Write your answer based on the retrieved results of your query.
        The answer should be concise and to the point, make it a single paragraph.
        The answer should be in the same language the user asked.

        Parameters
        - num_docs: number of docs to retrieve per query
        - search_fn: function(query, k) -> hits
        - documents: full document list for heuristic fallbacks
        """
        self.num_docs = num_docs
        self._search_fn = search_fn
        self._documents = documents
        self._search_languages = search_languages or ["de"]

        def _compose(hits: List[Dict]) -> str:
            lines: List[str] = []
            for i, h in enumerate(hits):
                label = h.get("article_ref") or h.get("title")
                # Choose the best available law marker: abbr > law_marker (short title) > title
                law_marker = h.get("abbr") or h.get("law_marker") or h.get("title")
                if label and law_marker and law_marker not in label:
                    label = f"{label} {law_marker}"
                lines.append(f"[{i + 1}] {label}\n{h['snippet']}")
            return "\n\n".join(lines)

        self.compose_context = _compose
        # Produce multilingual search queries
        self.generate_queries = dspy.ChainOfThought(
            "question -> search_query_de, search_query_fr, search_query_it"
        )
        self.answer = dspy.ChainOfThought(
            (
                "question, contexts -> answer, citations: list[str], confidence: float, "
                "article_refs: list[str], article_quotes: list[str]"
            )
        )
        self.validate = dspy.ChainOfThought(
            ("question, answer, contexts, citations -> ok: bool, feedback")
        )

    def forward(self, question: str):
        query_pred = self.generate_queries(question=question)
        q_de = getattr(query_pred, "search_query_de", None) or question
        q_fr = getattr(query_pred, "search_query_fr", None) or question
        q_it = getattr(query_pred, "search_query_it", None) or question

        # Choose which languages to query based on configuration
        active_langs = self._search_languages or ["de"]
        lang_to_query = {"de": q_de, "fr": q_fr, "it": q_it}
        per_lang_hits: List[List[Dict[str, Any]]] = []
        for lcode in ("de", "fr", "it"):
            if lcode not in active_langs:
                continue
            q = lang_to_query.get(lcode, question)
            try:
                hits_l = self._search_fn(q, self.num_docs, lcode)
            except TypeError:
                hits_l = self._search_fn(q, self.num_docs)
            per_lang_hits.append(hits_l or [])

        all_hits: List[Dict[str, Any]] = [h for group in per_lang_hits for h in group]

        # Deduplicate by (doc_id, article_ref) keeping highest score
        best_by_key: Dict[tuple, Dict] = {}
        for h in all_hits:
            key = (h.get("doc_id"), h.get("article_ref"))
            prev = best_by_key.get(key)
            if not prev or float(h.get("score", 0.0)) > float(prev.get("score", 0.0)):
                best_by_key[key] = h

        deduped_hits = list(best_by_key.values())

        # Re-apply official boost for ranking across languages
        def boosted(hit: Dict) -> float:
            base = float(hit.get("score", 0.0))
            kind = hit.get("source_kind")
            return base * 1.25 if kind == "official" else base

        deduped_hits.sort(key=boosted, reverse=True)
        hits = deduped_hits[: self.num_docs]
        # Track the combined search query for transparency
        search_query = f"de: {q_de} | fr: {q_fr} | it: {q_it}"
        contexts = self.compose_context(hits)
        pred = self.answer(question=question, contexts=contexts)

        predicted_answer = getattr(pred, "answer", "")
        predicted_citations = getattr(pred, "citations", None)
        predicted_article_refs = getattr(pred, "article_refs", None)
        predicted_article_quotes = getattr(pred, "article_quotes", None)
        predicted_confidence = getattr(pred, "confidence", 0.5)
        # Validation step: ensure language matches and answer is grounded in contexts
        citations_text = ", ".join(predicted_citations or [])
        val_pred = self.validate(
            question=question,
            answer=predicted_answer,
            contexts=contexts,
            citations=citations_text,
        )
        ok_val = getattr(val_pred, "ok", None)
        ok_normalized = False
        if isinstance(ok_val, bool):
            ok_normalized = ok_val
        elif isinstance(ok_val, (int, float)):
            ok_normalized = bool(ok_val)
        elif isinstance(ok_val, str):
            ok_normalized = ok_val.strip().lower() in {"true", "yes", "y", "1", "ok"}
        feedback = getattr(val_pred, "feedback", "") or ""

        if not ok_normalized:
            # Single regeneration using reviewer feedback appended to contexts
            contexts_with_feedback = (
                contexts
                + "\n\n[Reviewer feedback]\n"
                + feedback
                + "\n\nRevise the answer strictly in the same language as the user's question."
                + " Use only the information present in the contexts above; do not introduce external facts."
            )
            pred2 = self.answer(question=question, contexts=contexts_with_feedback)
            predicted_answer = getattr(pred2, "answer", predicted_answer)
            predicted_citations = getattr(pred2, "citations", predicted_citations)
            predicted_article_refs = getattr(
                pred2, "article_refs", predicted_article_refs
            )
            predicted_article_quotes = getattr(
                pred2, "article_quotes", predicted_article_quotes
            )
            predicted_confidence = getattr(pred2, "confidence", predicted_confidence)

        # Build legal-style references from hits, preferring official sources
        def _make_ref(h: Dict) -> str:
            ref = h.get("article_ref")
            # Prefer abbreviation, then explicit law_marker, then fall back to title
            law_marker = h.get("abbr") or h.get("law_marker") or h.get("title")
            if ref:
                if law_marker and law_marker not in ref:
                    return f"{ref} {law_marker}"
                return ref
            # fallback: no article_ref; try to synthesize from first article of the doc
            doc = next(
                (d for d in self._documents if d["title"] == h.get("title")), None
            )
            if doc and doc.get("articles"):
                first = doc["articles"][0]
                base = first.get("ref") or doc.get("title")
                marker = doc.get("abbr") or doc.get("law_marker") or doc.get("title")
                if base and marker and marker not in base:
                    return f"{base} {marker}"
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
            def _guess_lang(s: str) -> str:
                text = (s or "").lower()
                # very lightweight heuristics
                if any(
                    tok in text
                    for tok in [
                        " le ",
                        " la ",
                        " les ",
                        " des ",
                        " du ",
                        " que ",
                        " est ",
                    ]
                ):
                    return "fr"
                if any(
                    tok in text
                    for tok in [
                        " il ",
                        " lo ",
                        " gli ",
                        " dei ",
                        " delle ",
                        " che ",
                        " è ",
                        " di ",
                    ]
                ):
                    return "it"
                return "de"

            lang_hint = _guess_lang(question)
            prefix_map = {"de": "Siehe", "fr": "Voir", "it": "Vedi"}
            prefix = prefix_map.get(lang_hint, "Siehe")
            refs_str = "; ".join(legal_refs_inline[:5])
            if predicted_answer:
                predicted_answer = f"{predicted_answer} {prefix}: {refs_str}."
            else:
                predicted_answer = f"{prefix}: {refs_str}."
        return dspy.Prediction(
            answer=predicted_answer,
            citations=predicted_citations,
            retrieved=retrieved_titles,
            search_query=search_query,
            confidence=confidence,
            article_refs=predicted_article_refs or [],
            article_quotes=predicted_article_quotes or [],
        )
