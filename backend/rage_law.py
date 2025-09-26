# %%
"""
RAG for Swiss law using DSPy.
Refactored to use modular `rag` package and service layer.

References:
- DSPy: https://dspy.ai/
- DSPy Multi-hop search tutorial: https://dspy.ai/tutorials/multihop_search/
"""

from rag import LawRAGService


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("DSPy RAG: Swiss Law Prototype")
    print("=" * 50)

    service = LawRAGService()

    test_questions: list[str] = [
        "Welche Rechte hat eine Person gemäss Bundesverfassung bei der Meinungsfreiheit",
        "Unter welchen Umständen darf ein Arbeitsvertrag in der Probezeit gekündigt werden?",
        "Welche Datenschutzpflichten bestehen für Bundesbehörden?",
    ]

    print("\nRunning 3 test questions...\n")
    for i, q in enumerate(test_questions, start=1):
        print("-" * 50)
        print(f"Q{i}: {q}")
        res = service.ask(q)
        print(f"Generated Query: {res['search_query']}")
        print(f"Answer: {res['answer']}")
        print(f"Confidence: {res['confidence']:.2f}")
        print(f"Citations (docs): {res['citations']}")
        if res.get("article_refs"):
            print("Articles:")
            for ref, quote in zip(res["article_refs"], res["article_quotes"]):
                print(f'  - {ref}: "{quote}"')
        print(f"Retrieved (titles): {res['retrieved'][:5]}")
    print("-" * 50)
