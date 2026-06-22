from app.csv_inspector import inspect_csv
from app.metadata_store import MetadataStore
from app.schemas import CatalogDataset, SourceCreate, SourceRecord


class SourceCatalogService:
    def __init__(self, store: MetadataStore) -> None:
        self.store = store

    def register_source(self, source: SourceCreate) -> tuple[SourceRecord, CatalogDataset]:
        schema, row_count, sample = inspect_csv(source.path)
        return self.store.create_source_with_dataset(source, schema, row_count, sample)
