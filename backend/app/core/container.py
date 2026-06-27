from pathlib import Path

from app.adapters.csv_source import CsvSourceConnector
from app.adapters.duckdb_sql_engine import DuckDBSqlEngine
from app.adapters.fixture_catalog_source import FixtureCatalogSource
from app.adapters.local_result_store import LocalResultStore
from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.adapters.week2_catalog_store_source import Week2CatalogStoreSource
from app.core.settings import Settings
from app.fakes.fake_sql_engine import FakeSqlEngine
from app.ports.catalog_source import CatalogSource
from app.ports.metadata_store import MetadataStore
from app.ports.result_store import ResultStore
from app.ports.sql_engine import SqlEngineAdapter
from app.ports.source_connector import SourceConnector
from app.services.ai_query import Week2AIQueryService
from app.services.catalog_trust import CatalogTrustService
from app.services.pipeline import PipelineService
from app.services.source_catalog import SourceCatalogService
from app.services.week2_catalog_store import Week2CatalogStore
from app.services.week2_workflow import Week2WorkflowService


class AppContainer:
    def __init__(self, settings: Settings, metadata_store: MetadataStore | None = None) -> None:
        self.settings = settings
        self.metadata_store = metadata_store or self.create_metadata_store()
        self.source_connectors = self.create_source_connectors()
        self.result_store = self.create_result_store()
        self.week2_catalog_store = self.create_week2_catalog_store()
        self.catalog_source = self.create_catalog_source()
        self.sql_engine = self.create_sql_engine()
        self.catalog_trust_service = self.create_catalog_trust_service()
        self.source_catalog_service = self.create_source_catalog_service()
        self.pipeline_service = self.create_pipeline_service()
        self.week2_workflow_service = self.create_week2_workflow_service()
        self.ai_query_service = self.create_ai_query_service()

    def create_metadata_store(self) -> MetadataStore:
        return SQLiteMetadataStore(self.settings.metadata_url)

    def create_source_connectors(self) -> list[SourceConnector]:
        return [CsvSourceConnector()]

    def create_result_store(self) -> ResultStore:
        return LocalResultStore(self.settings.result_store_path)

    def create_week2_catalog_store(self) -> Week2CatalogStore:
        return Week2CatalogStore(self.week2_output_root() / "_metadata")

    def create_catalog_source(self) -> CatalogSource:
        return Week2CatalogStoreSource(
            self.week2_catalog_store,
            fallback_source=FixtureCatalogSource(),
        )

    def create_sql_engine(self) -> SqlEngineAdapter:
        if self.settings.week2_sql_engine == "duckdb":
            return DuckDBSqlEngine()
        return FakeSqlEngine()

    def create_catalog_trust_service(self) -> CatalogTrustService:
        return CatalogTrustService()

    def create_source_catalog_service(self) -> SourceCatalogService:
        return SourceCatalogService(self.metadata_store, self.source_connectors)

    def create_pipeline_service(self) -> PipelineService:
        return PipelineService(self.metadata_store, self.source_connectors, self.result_store)

    def create_week2_workflow_service(self) -> Week2WorkflowService:
        return Week2WorkflowService(
            output_root=self.week2_output_root(),
            catalog_store=self.week2_catalog_store,
        )

    def create_ai_query_service(self) -> Week2AIQueryService:
        return Week2AIQueryService(self.sql_engine, catalog_source=self.catalog_source)

    def week2_output_root(self) -> Path:
        return Path(self.settings.result_store_path) / "week2"
