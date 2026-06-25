from app.domain.schemas import CatalogDataset, SourceCreate, SourceRecord
from app.ports.metadata_store import MetadataStore
from app.ports.source_connector import SourceConnector


class SourceCatalogService:
    def __init__(self, store: MetadataStore, source_connectors: list[SourceConnector]) -> None:
        self.store = store
        self.source_connectors = {connector.source_type: connector for connector in source_connectors}

    def register_source(self, source: SourceCreate) -> tuple[SourceRecord, CatalogDataset]:
        connector = self.source_connectors.get(source.type)
        if connector is None:
            raise ValueError(f"Unsupported source type: {source.type}")
        schema, row_count, sample = connector.inspect(source)
        return self.store.create_source_with_dataset(source, schema, row_count, sample)
