from typing import Any, Protocol

from app.domain.retrieval_index import RetrievalIndexHit, RetrievalIndexSnapshot


class RetrievalIndex(Protocol):
    def refresh(self, catalogs: list[dict[str, Any]]) -> RetrievalIndexSnapshot: ...

    def search(
        self,
        question: str,
        catalogs: list[dict[str, Any]],
        top_k: int = 5,
    ) -> list[RetrievalIndexHit]: ...
