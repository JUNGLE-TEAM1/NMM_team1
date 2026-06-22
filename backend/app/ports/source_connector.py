from typing import Protocol

from app.domain.schemas import ColumnSchema, SourceCreate


class SourceConnector(Protocol):
    source_type: str

    def inspect(self, source: SourceCreate) -> tuple[list[ColumnSchema], int, list[dict[str, object]]]: ...
