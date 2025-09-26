import os
import sys
import csv
import argparse
from typing import List, Dict, Optional
from difflib import SequenceMatcher
from statistics import mean
from dspy.evaluate import SemanticF1


def _ensure_pkg_import() -> None:
    """Ensure we can import the local `rag` package when run as a script.

    Supports running via:
    - python -m rag.eval_questions
    - python rag/eval_questions.py (from backend directory)
    - python backend/rag/eval_questions.py (from repo root)
    """
    this_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(this_dir)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)


_ensure_pkg_import()
from rag import LawRAGService  # noqa: E402

# Resolve important paths relative to this file
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CSV = os.path.join(BACKEND_DIR, "data", "test_questions.csv")


def read_test_questions(csv_path: str) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            # Normalize expected German headers
            frage = r.get("Frage") or r.get("question") or ""
            wahre_antwort = r.get("Wahre Antwort") or r.get("answer") or ""
            referenztext = r.get("Referenztext") or r.get("reference") or ""
            artikel = r.get("Artikel") or r.get("article") or ""
            rows.append(
                {
                    "Frage": frage.strip(),
                    "Wahre Antwort": wahre_antwort.strip(),
                    "Referenztext": referenztext.strip(),
                    "Artikel": artikel.strip(),
                }
            )
    return rows


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, (a or "").lower(), (b or "").lower()).ratio()


def _normalize_ref(s: str) -> str:
    s = (s or "").lower()
    # lightweight normalization: remove duplicate spaces and common punctuation
    for ch in [",", ".", ";", ":", "(", ")", "[", "]", "\n"]:
        s = s.replace(ch, " ")
    s = " ".join(s.split())
    return s


def article_ref_match(
    expected: str, predicted_refs: List[str], citations: List[str], answer: str
) -> bool:
    if not expected:
        return False
    exp = _normalize_ref(expected)
    pools: List[str] = []
    pools.extend(predicted_refs or [])
    pools.extend(citations or [])
    pools.append(answer or "")
    pools_norm = [_normalize_ref(x) for x in pools]
    return any(exp in p or p in exp for p in pools_norm)


def evaluate(
    questions: List[Dict[str, str]],
    *,
    num_docs: Optional[int],
    limit: Optional[int],
    output_csv: Optional[str],
    f1_threshold: float,
    decompositional: bool,
) -> None:
    service = LawRAGService(num_docs=num_docs) if num_docs else LawRAGService()

    if limit is not None:
        questions = questions[:limit]

    results: List[Dict[str, object]] = []
    metric = SemanticF1(threshold=f1_threshold, decompositional=decompositional)

    for idx, row in enumerate(questions, start=1):
        q = row["Frage"]
        expected_answer = row["Wahre Antwort"]
        expected_article = row["Artikel"]

        pred = service.ask(q)
        ans = pred.get("answer", "")
        citations = pred.get("citations", []) or []
        article_refs = pred.get("article_refs", []) or []
        confidence = float(pred.get("confidence", 0.0))

        sim = similarity(expected_answer, ans)
        has_article = article_ref_match(expected_article, article_refs, citations, ans)

        # Compute SemanticF1 with DSPy
        sem_f1: Optional[float] = None
        if metric is not None:
            try:
                # Primary signature: answer=<pred>, reference=<gold> with DSPy
                res = None
                try:
                    res = metric(answer=ans, reference=expected_answer)
                except TypeError:
                    try:
                        res = metric(prediction=ans, reference=expected_answer)
                    except TypeError:
                        res = metric(predicted=ans, gold=expected_answer)
                # Some versions return a Prediction with f1, others return a float
                if hasattr(res, "f1"):
                    val = getattr(res, "f1")
                    sem_f1 = float(val) if val is not None else None
                elif isinstance(res, (int, float)):
                    sem_f1 = float(res)
            except Exception:
                sem_f1 = None

        results.append(
            {
                "index": idx,
                "question": q,
                "expected_answer": expected_answer,
                "expected_article": expected_article,
                "answer": ans,
                "citations": "; ".join(citations),
                "article_refs": "; ".join(article_refs),
                "confidence": confidence,
                "similarity": sim,
                "article_match": has_article,
                "semantic_f1": sem_f1,
            }
        )

        print(
            f"[{idx}] sim={sim:.2f} conf={confidence:.2f} article_match={has_article} | {q}"
        )

    # Aggregate
    avg_sim = mean([r["similarity"] for r in results]) if results else 0.0
    avg_conf = mean([r["confidence"] for r in results]) if results else 0.0
    art_rate = (
        sum(1 for r in results if r["article_match"]) / len(results) if results else 0.0
    )
    f1_values = [
        r["semantic_f1"]
        for r in results
        if isinstance(r.get("semantic_f1"), (int, float))
    ]
    avg_sem_f1: Optional[float] = mean(f1_values) if f1_values else None

    print("\nSummary:")
    print(f"- Avg similarity: {avg_sim:.3f}")
    print(f"- Avg confidence: {avg_conf:.3f}")
    print(f"- Article reference match rate: {art_rate:.3f}")
    if avg_sem_f1 is not None:
        print(f"- Avg SemanticF1 (DSPy): {avg_sem_f1:.3f}")

    if output_csv:
        fieldnames = list(results[0].keys()) if results else []
        with open(output_csv, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in results:
                writer.writerow(r)
        print(f"\nSaved detailed results to: {output_csv}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate LawRAGService against a CSV of test questions."
    )
    parser.add_argument(
        "--csv",
        default=DEFAULT_CSV,
        help="Path to test_questions.csv",
    )
    parser.add_argument(
        "--num-docs",
        type=int,
        default=None,
        help="Override number of retrieved documents per query.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of questions to run.",
    )
    parser.add_argument(
        "--output",
        default=None,
        help="Optional path to write a CSV with detailed results.",
    )
    parser.add_argument(
        "--f1-threshold",
        type=float,
        default=0.66,
        help="DSPy SemanticF1 threshold (default: 0.66).",
    )
    parser.add_argument(
        "--decomp",
        action="store_true",
        help="Use decompositional SemanticF1 from DSPy.",
    )
    args = parser.parse_args()

    csv_path = args.csv
    if not os.path.exists(csv_path):
        # Try relative to backend directory (works when run from backend/rag)
        candidate1 = os.path.join(BACKEND_DIR, csv_path)
        candidate2 = os.path.join(BACKEND_DIR, "data", os.path.basename(csv_path))
        if os.path.exists(candidate1):
            csv_path = candidate1
        elif os.path.exists(candidate2):
            csv_path = candidate2
        else:
            raise FileNotFoundError(
                f"CSV file not found: {args.csv}. Tried: {candidate1}, {candidate2}"
            )

    questions = read_test_questions(csv_path)
    evaluate(
        questions,
        num_docs=args.num_docs,
        limit=args.limit,
        output_csv=args.output,
        f1_threshold=args.f1_threshold,
        decompositional=bool(args.decomp),
    )


if __name__ == "__main__":
    main()
