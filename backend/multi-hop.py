# Multi-Hop Retrieval with DSPy
# Basic implementation without optimization

# %%
import dspy
import ujson
import bm25s
import Stemmer
import random
import urllib.request
from model_builder import build_lm

lm = build_lm("gpt-4o-mini")

dspy.configure(lm=lm)

# Load the Wikipedia corpus
print("Loading corpus...")
corpus = []

with open("wiki.abstracts.2017.jsonl") as f:
    for i, line in enumerate(f):
        if i >= 100:
            break
        line = ujson.loads(line)
        corpus.append(f"{line['title']} | {' '.join(line['text'])}")

print(f"Loaded {len(corpus)} documents")

# Set up BM25 retriever
print("Setting up retriever...")
stemmer = Stemmer.Stemmer("english")
corpus_tokens = bm25s.tokenize(corpus, stopwords="en", stemmer=stemmer)

retriever = bm25s.BM25(k1=0.9, b=0.4)
retriever.index(corpus_tokens)

# %%
# 1. Download the HoVer dataset directly (minimal HTTP loader)
HOVER_TRAIN_URL = "https://raw.githubusercontent.com/hover-nlp/hover/main/data/hover/hover_train_release_v1.1.json"


def _download_hover_json(url: str):
    with urllib.request.urlopen(url) as resp:
        return ujson.loads(resp.read().decode("utf-8"))


# Specify the split you want to use for training data construction
print("Downloading HoVer train split...")
dataset = _download_hover_json(HOVER_TRAIN_URL)

# 2. Filter, Process, and Convert to dspy.Example objects
hpqa_ids = set()
hover_data = []

# Select the required fields for processing
required_fields = ["claim", "supporting_facts", "hpqa_id", "num_hops"]
for x in dataset:
    # Ensure all required fields exist for safety
    if all(f in x for f in required_fields):
        # Filter for num_hops == 3 and ensure unique hpqa_id
        if x["num_hops"] == 3 and x["hpqa_id"] not in hpqa_ids:
            hpqa_ids.add(x["hpqa_id"])

            # Extract unique titles from supporting_facts
            titles_set = set()
            for y in x["supporting_facts"]:
                if isinstance(y, dict) and "key" in y:
                    titles_set.add(y["key"])
                elif isinstance(y, (list, tuple)) and len(y) > 0:
                    titles_set.add(y[0])
            titles = list(titles_set)

            # Create the dspy.Example object
            example = dspy.Example(claim=x["claim"], titles=titles).with_inputs("claim")
            hover_data.append(example)

# 3. Shuffle and Split the Dataset
random.Random(0).shuffle(hover_data)
trainset = hover_data[:5]  # 200
devset = hover_data[5:10]  # 200:500
testset = hover_data[10:15]  # 650


print(
    f"Dataset split - Train: {len(trainset)}, Dev: {len(devset)}, Test: {len(testset)}"
)


# Search function
def search(query: str, k: int) -> list[str]:
    tokens = bm25s.tokenize(query, stopwords="en", stemmer=stemmer, show_progress=False)
    results, scores = retriever.retrieve(tokens, k=k, n_threads=1, show_progress=False)
    run = {corpus[doc]: float(score) for doc, score in zip(results[0], scores[0])}
    return run


# Multi-hop retrieval module
class Hop(dspy.Module):
    def __init__(self, num_docs=10, num_hops=4):
        self.num_docs, self.num_hops = num_docs, num_hops
        self.generate_query = dspy.ChainOfThought("claim, notes -> query")
        self.append_notes = dspy.ChainOfThought(
            "claim, notes, context -> new_notes: list[str], titles: list[str]"
        )

    def forward(self, claim: str) -> list[str]:
        notes = []
        titles = []

        for _ in range(self.num_hops):
            query = self.generate_query(claim=claim, notes=notes).query
            context = search(query, k=self.num_docs)
            prediction = self.append_notes(claim=claim, notes=notes, context=context)
            notes.extend(prediction.new_notes)
            titles.extend(prediction.titles)

        return dspy.Prediction(notes=notes, titles=list(set(titles)))


# Evaluation metric
def top5_recall(example, pred, trace=None):
    gold_titles = example.titles
    recall = sum(x in pred.titles[:5] for x in gold_titles) / len(gold_titles)
    return recall


# Set up evaluator
evaluate = dspy.Evaluate(
    devset=devset,
    metric=top5_recall,
    num_threads=4,
    display_progress=True,
    display_table=5,
)

# Example usage
if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("EXAMPLE USAGE")
    print("=" * 50)

    # Show an example from the dataset
    example = trainset[0]
    print(f"Claim: {example.claim}")
    print(f"Expected pages: {example.titles}")

    # Create and run the program
    print("\nRunning multi-hop retrieval...")
    hop_program = Hop()
    result = hop_program(claim=example.claim)

    print(f"Retrieved titles: {result.titles}")
    print(f"Notes generated: {result.notes}")

    # Evaluate the program
    print("\n" + "=" * 50)
    print("EVALUATION")
    print("=" * 50)
    print("Evaluating on development set...")
    evaluation_result = evaluate(hop_program)
    print(f"Top-5 Recall: {evaluation_result}")
