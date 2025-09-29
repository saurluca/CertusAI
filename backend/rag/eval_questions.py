import os
import sys
import csv
import argparse
from typing import List, Dict

import dspy
from dspy import Example
from dspy.evaluate import SemanticF1, Evaluate


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
SEMANTIC_F1_THRESHOLD = 0.66
MODEL_NAME = "apertus-70b-com"
# MODEL_NAME = "gpt-4o-mini"


def read_test_questions(csv_path: str) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            frage = r.get("Frage") or r.get("question") or ""
            wahre_antwort = r.get("Wahre Antwort") or r.get("answer") or ""
            rows.append(
                {
                    "Frage": frage.strip(),
                    "Wahre Antwort": wahre_antwort.strip(),
                }
            )
    return rows


def to_examples(rows: List[Dict[str, str]]) -> List[Example]:
    examples: List[Example] = []
    for r in rows:
        q = r["Frage"]
        gold = r["Wahre Antwort"]
        # Per DSPy convention, gold field is `response`. Mark `question` as input.
        ex = Example(question=q, response=gold).with_inputs("question")
        examples.append(ex)
    return examples


class ServiceWrapper(dspy.Module):
    """Wrap LawRAGService as a DSPy Module producing `response`.

    forward(question) -> Prediction(response=...)
    """

    def __init__(self, service: LawRAGService):
        super().__init__()
        self._service = service

    def forward(self, question: str):
        result = self._service.ask(question)
        answer = result.get("answer", "")
        return dspy.Prediction(response=answer)


def run_semantic_f1_eval(
    *,
    csv_path: str,
    f1_threshold: float,
    decompositional: bool,
    retrieval: str,
) -> float:
    service = LawRAGService(retrieval=retrieval, model_name=MODEL_NAME)

    dev_rows = read_test_questions(csv_path)
    devset = to_examples(dev_rows)

    # Metric per DSPy tutorial
    metric = SemanticF1(threshold=f1_threshold, decompositional=decompositional)

    program = ServiceWrapper(service)
    evaluator = Evaluate(
        devset=devset, metric=metric, num_threads=1, display_progress=True
    )
    evaluator(program)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate LawRAGService using DSPy SemanticF1 (RAG tutorial style)."
    )
    parser.add_argument(
        "--csv",
        default=DEFAULT_CSV,
        help="Path to test_questions.csv",
    )
    parser.add_argument(
        "--decomp",
        action="store_true",
        help="Use decompositional SemanticF1 from DSPy.",
    )
    parser.add_argument(
        "--retrieval",
        choices=["bm25", "semantic"],
        default=os.environ.get("RETRIEVAL", "bm25"),
        help="Choose retrieval backend: bm25 (default) or semantic.",
    )
    args = parser.parse_args()

    csv_path = args.csv
    if not os.path.exists(csv_path):
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

    run_semantic_f1_eval(
        csv_path=csv_path,
        f1_threshold=SEMANTIC_F1_THRESHOLD,
        decompositional=bool(args.decomp),
        retrieval=args.retrieval,
    )


if __name__ == "__main__":
    main()
