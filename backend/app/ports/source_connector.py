from typing import Protocol

from app.domain.schemas import CatalogDataset, ColumnSchema, SourceCreate


class SourceConnector(Protocol):
    source_type: str

    def inspect(self, source: SourceCreate) -> tuple[list[ColumnSchema], int, list[dict[str, object]]]: ...

    def read_rows(self, dataset: CatalogDataset) -> tuple[list[ColumnSchema], list[dict[str, object]]]: ...
