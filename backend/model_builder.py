import os
from dotenv import load_dotenv
import dspy

load_dotenv()


model_configs = {
    "gpt-4o-mini": {
        "model": "azure/gpt-4o-mini",
        "api_key": os.getenv("AZURE_API_KEY"),
        "api_base": os.getenv("AZURE_API_BASE"),
        "api_version": "2024-12-01-preview",
    },
    "gpt-4o": {
        "model": "azure/gpt-4o",
        "api_key": os.getenv("AZURE_API_KEY"),
        "api_base": os.getenv("AZURE_API_BASE"),
        "api_version": "2024-12-01-preview",
    },
    "apertus-8b": {
        "model": "openrouter/swiss-ai/apertus-8b-instruct",
        "api_key": os.getenv("SWISS_API_KEY"),
        "api_base": "https://api.publicai.co/v1",
    },
    "apertus-70b": {
        "model": "openrouter/swiss-ai/apertus-70b-instruct",
        "api_key": os.getenv("SWISS_API_KEY"),
        "api_base": "https://api.publicai.co/v1",
    },
    "llama3.2:3b": {
        "model": "ollama_chat/llama3.2:3b",
        "api_key": "",
        "api_base": "http://100.116.24.45:11434",
    },
    "llama3.1:8b": {
        "model": "ollama_chat/llama3.1:8b",
        "api_key": "",
        "api_base": "http://100.116.24.45:11434",
    },
    "deepseek-r1": {
        "model": "ollama_chat/deepseek-r1:8b",
        "api_key": "",
        "api_base": "http://100.116.24.45:11434",
    },
    "deepseek-r1:1.5b": {
        "model": "ollama_chat/deepseek-r1:1.5b",
        "api_key": "",
        "api_base": "http://100.116.24.45:11434",
    },
}


def build_lm(
    model_name: str,
    cache: bool = True,
    temperature: float | None = None,
    max_tokens: int = 512,
):
    config = model_configs[model_name]
    lm_kwargs = {
        "model": config.get("model"),
        "api_key": config.get("api_key"),
        "api_base": config.get("api_base"),
        "max_tokens": max_tokens,
        "cache": cache,
    }
    if temperature is not None:
        lm_kwargs["temperature"] = temperature
    # Only add api_version if present in config
    if "api_version" in config:
        lm_kwargs["api_version"] = config.get("api_version")
    if "api_base" in config:
        lm_kwargs["api_base"] = config.get("api_base")

    return dspy.LM(**lm_kwargs)
