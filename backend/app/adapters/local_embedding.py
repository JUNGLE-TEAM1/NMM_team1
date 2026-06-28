import hashlib
import math
import re


_TOKEN_PATTERN = re.compile(r"[a-z0-9]+|[가-힣]+")


def tokenize_text(text: str) -> list[str]:
    normalized = text.lower().replace("_", " ").replace("-", " ")
    tokens = _TOKEN_PATTERN.findall(normalized)
    expanded: list[str] = []
    seen: set[str] = set()
    for token in tokens:
        for candidate in _token_variants(token):
            if candidate not in seen:
                expanded.append(candidate)
                seen.add(candidate)
    return expanded


def _token_variants(token: str) -> list[str]:
    variants = [token]
    if len(token) > 3 and token.endswith("s"):
        variants.append(token[:-1])
    return variants


class LocalTokenEmbeddingAdapter:
    def __init__(self, dimensions: int = 64) -> None:
        if dimensions <= 0:
            raise ValueError("Embedding dimensions must be positive.")
        self.dimensions = dimensions

    def embed(self, text: str) -> list[float]:
        vector = [0.0 for _ in range(self.dimensions)]
        for token in tokenize_text(text):
            digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
            index = int(digest[:8], 16) % self.dimensions
            vector[index] += 1.0

        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0:
            return vector
        return [round(value / norm, 8) for value in vector]
