from dataclasses import dataclass, field
from typing import Any, Literal


RetrievalSourceType = Literal["catalog", "schema", "metric", "lineage", "chunk"]


@dataclass(frozen=True)
class RetrievalIndexChunk:
    chunk_id: str
    dataset_id: str
    source_type: RetrievalSourceType
    source_id: str
    text: str
    terms: list[str]
    embedding: list[float]
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class RetrievalIndexHit:
    chunk_id: str
    dataset_id: str
    source_type: RetrievalSourceType
    source_id: str
    score: float
    matched_terms: list[str]


@dataclass(frozen=True)
class RetrievalIndexSnapshot:
    signature: str
    chunks: list[RetrievalIndexChunk]
    rebuilt: bool
