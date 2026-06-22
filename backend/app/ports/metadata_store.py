from typing import Protocol

from app.domain.schemas import CatalogDataset, ColumnSchema, SourceCreate, SourceRecord


class MetadataStore(Protocol):
    def initialize(self) -> None: ...

    def create_source_with_dataset(
        self,
        source: SourceCreate,
        schema: list[ColumnSchema],
        row_count: int,
        sample: list[dict[str, object]],
    ) -> tuple[SourceRecord, CatalogDataset]: ...

    def list_sources(self) -> list[SourceRecord]: ...

    def get_source(self, source_id: str) -> SourceRecord | None: ...

    def list_catalog_datasets(self) -> list[CatalogDataset]: ...

    def get_catalog_dataset(self, dataset_id: str) -> CatalogDataset | None: ...
