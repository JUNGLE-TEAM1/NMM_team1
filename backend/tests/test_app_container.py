from pathlib import Path

from app.adapters.duckdb_sql_engine import DuckDBSqlEngine
from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.adapters.template_llm_adapter import TemplateLLMAdapter
from app.core.container import AppContainer
from app.core.settings import Settings
from app.fakes.fake_sql_engine import FakeSqlEngine


def _settings(tmp_path: Path, **overrides: object) -> Settings:
    return Settings(
        metadata_url=f"sqlite:///{tmp_path / 'metadata.db'}",
        result_store_path=str(tmp_path / "results"),
        **overrides,
    )


def test_app_container_uses_duckdb_sql_engine_by_default(tmp_path: Path) -> None:
    settings = _settings(tmp_path)

    container = AppContainer(settings, metadata_store=SQLiteMetadataStore(settings.metadata_url))

    assert isinstance(container.sql_engine, DuckDBSqlEngine)
    assert container.sql_engine.health_check().engine == "duckdb"


def test_app_container_can_use_fake_sql_engine_when_explicitly_configured(tmp_path: Path) -> None:
    settings = _settings(tmp_path, week2_sql_engine="fake")

    container = AppContainer(settings, metadata_store=SQLiteMetadataStore(settings.metadata_url))

    assert isinstance(container.sql_engine, FakeSqlEngine)
    assert container.sql_engine.health_check().engine == "fake"


def test_app_container_uses_template_llm_adapter_by_default(tmp_path: Path) -> None:
    settings = _settings(tmp_path)

    container = AppContainer(settings, metadata_store=SQLiteMetadataStore(settings.metadata_url))

    assert isinstance(container.llm_adapter, TemplateLLMAdapter)
    assert container.llm_adapter.health_check().external_calls_enabled is False
    assert container.ai_query_service.llm_adapter is container.llm_adapter
