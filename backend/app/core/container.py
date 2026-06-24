from app.adapters.csv_source import CsvSourceConnector
from app.adapters.local_result_store import LocalResultStore
from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.settings import Settings
from app.ports.metadata_store import MetadataStore
from app.ports.result_store import ResultStore
from app.ports.source_connector import SourceConnector
from app.services.pipeline import PipelineService
from app.services.catalog_trust import CatalogTrustService
from app.services.source_catalog import SourceCatalogService


class AppContainer:
    def __init__(self, settings: Settings, metadata_store: MetadataStore | None = None) -> None:
        self.settings = settings
        self.metadata_store = metadata_store or self.create_metadata_store()
        self.source_connectors = self.create_source_connectors()
        self.result_store = self.create_result_store()
        self.catalog_trust_service = self.create_catalog_trust_service()
        self.source_catalog_service = self.create_source_catalog_service()
        self.pipeline_service = self.create_pipeline_service()

    def create_metadata_store(self) -> MetadataStore:
        return SQLiteMetadataStore(self.settings.metadata_url)

    def create_source_connectors(self) -> list[SourceConnector]:
        return [CsvSourceConnector()]

    def create_result_store(self) -> ResultStore:
        return LocalResultStore(self.settings.result_store_path)

    def create_catalog_trust_service(self) -> CatalogTrustService:
        return CatalogTrustService()

    def create_source_catalog_service(self) -> SourceCatalogService:
        return SourceCatalogService(self.metadata_store, self.source_connectors)

    def create_pipeline_service(self) -> PipelineService:
        return PipelineService(self.metadata_store, self.source_connectors, self.result_store)
