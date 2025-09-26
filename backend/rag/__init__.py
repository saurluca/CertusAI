"""
RAG components for Swiss law retrieval and answering.

This package provides:
- HTML parsing and article extraction utilities
- Corpus loading from local Fedlex HTML assets
- BM25 retrieval setup and search helpers
- DSPy-based answerer that cites retrieved sources
- A service class that wires everything together
"""

# Re-export key types for convenience
from .service import LawRAGService  # noqa: F401
