from typing import Protocol


class EmbeddingAdapter(Protocol):
    def embed(self, text: str) -> list[float]: ...
