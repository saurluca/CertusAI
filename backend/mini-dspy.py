# %%
import dspy
from dotenv import load_dotenv
from model_builder import build_lm

load_dotenv()

print("running mini-dspy")

lm = build_lm("llama3.2:3b")

dspy.configure(lm=lm)


class Base(dspy.Signature):
    question: str = dspy.InputField()
    answer: str = dspy.OutputField()


model = dspy.Predict(Base)

# %%
output = model(question="what is the capital of argentina?")
print(output.answer)
