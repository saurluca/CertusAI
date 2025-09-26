# %%
import dspy
from dotenv import load_dotenv
from model_builder import build_lm

load_dotenv()

lm = build_lm("gpt-4o-mini")

dspy.configure(lm=lm)


class Base(dspy.Signature):
    question: str = dspy.InputField()
    answer: str = dspy.OutputField()


model = dspy.Predict(Base)

# %%
output = model(question="what is the captial of argentina?")
print(output.answer)
