from app.adapters.csv_source import CsvSourceConnector
from app.adapters.json_source import JsonSourceConnector
from app.adapters.local_result_store import LocalResultStore
from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.settings import Settings
from app.fakes.fake_sql_engine import FakeSqlEngine
from app.ports.metadata_store import MetadataStore
from app.ports.result_store import ResultStore
from app.ports.sql_engine import SqlEngineAdapter
from app.ports.source_connector import SourceConnector
from app.services.ai_query import Week2AIQueryService
from app.services.catalog_trust import CatalogTrustService
from app.services.pipeline import PipelineService
from app.services.source_catalog import SourceCatalogService


class AppContainer:
    def __init__(self, settings: Settings, metadata_store: MetadataStore | None = None) -> None:
        self.settings = settings
        self.metadata_store = metadata_store or self.create_metadata_store()
        self.source_connectors = self.create_source_connectors()
        self.result_store = self.create_result_store()
        self.sql_engine = self.create_sql_engine()
        self.catalog_trust_service = self.create_catalog_trust_service()
        self.source_catalog_service = self.create_source_catalog_service()
        self.pipeline_service = self.create_pipeline_service()
        self.ai_query_service = self.create_ai_query_service()

    def create_metadata_store(self) -> MetadataStore:
        return SQLiteMetadataStore(self.settings.metadata_url)

    def create_source_connectors(self) -> list[SourceConnector]:
        return [CsvSourceConnector(), JsonSourceConnector()]

    def create_result_store(self) -> ResultStore:
        return LocalResultStore(self.settings.result_store_path)

    def create_sql_engine(self) -> SqlEngineAdapter:
        return FakeSqlEngine()

    def create_catalog_trust_service(self) -> CatalogTrustService:
        return CatalogTrustService()

    def create_source_catalog_service(self) -> SourceCatalogService:
        return SourceCatalogService(self.metadata_store, self.source_connectors)

    def create_pipeline_service(self) -> PipelineService:
        return PipelineService(self.metadata_store, self.source_connectors, self.result_store)

    def create_ai_query_service(self) -> Week2AIQueryService:
        return Week2AIQueryService(self.sql_engine)
