from app.adapters.csv_source import CsvSourceConnector
from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.settings import Settings
from app.ports.metadata_store import MetadataStore
from app.ports.source_connector import SourceConnector
from app.services.source_catalog import SourceCatalogService


class AppContainer:
    def __init__(self, settings: Settings, metadata_store: MetadataStore | None = None) -> None:
        self.settings = settings
        self.metadata_store = metadata_store or self.create_metadata_store()
        self.source_connectors = self.create_source_connectors()
        self.source_catalog_service = self.create_source_catalog_service()

    def create_metadata_store(self) -> MetadataStore:
        return SQLiteMetadataStore(self.settings.metadata_url)

    def create_source_connectors(self) -> list[SourceConnector]:
        return [CsvSourceConnector()]

    def create_source_catalog_service(self) -> SourceCatalogService:
        return SourceCatalogService(self.metadata_store, self.source_connectors)
