from fastapi.testclient import TestClient

from app.core.app_factory import create_app
from app.domain.ai_query import SqlEngineContext
from app.fakes.fake_sql_engine import FakeSqlEngine
from app.services.ai_query import Week2AIQueryService


class InMemoryCatalogSource:
    def __init__(self, *catalogs: dict[str, object]) -> None:
        self.catalogs = list(catalogs)

    def list_catalogs(self, tenant_id: str | None = None) -> list[dict[str, object]]:
        return self.catalogs


def _review_catalog(dataset_id: str, name: str, run_id: str) -> dict[str, object]:
    return {
        "tenant_id": "tenant_demo",
        "dataset_id": dataset_id,
        "name": name,
        "s3_uri": f"s3://asklake-demo/{dataset_id}/run_id={run_id}/",
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "review_count", "type": "integer", "nullable": False},
                {"name": "average_rating", "type": "number", "nullable": True},
            ]
        },
        "lineage": {"run_id": run_id},
        "query": {
            "table_name": "reviews_gold",
            "allowed_columns": ["product_id", "review_count", "average_rating"],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "updated_at": "2026-06-26T10:00:00+09:00",
    }


def test_week2_ai_query_returns_fixture_backed_ai_query_result() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/api/week2/ai/query",
        json={"question": "리뷰가 가장 많은 상품 알려줘"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["contract"] == "AIQueryResult"
    assert payload["producer"] == "M6"
    assert payload["consumer"] == "M1"
    assert payload["tenant_id"] == "tenant_demo"
    assert payload["selected_datasets"][0]["dataset_id"] == "dataset_reviews_gold"
    assert "review_count" in payload["selected_datasets"][0]["reason"]
    assert payload["status"] == "succeeded"
    assert payload["guardrail"]["validation_status"] == "passed"
    assert payload["sql"] == payload["query_result"]["sql"]
    assert payload["rows"] == payload["query_result"]["rows"]
    assert payload["query_result"]["engine"] == "fake"
    assert payload["query_result"]["columns"] == [
        {"name": "product_id", "type": "string"},
        {"name": "review_count", "type": "integer"},
        {"name": "average_rating", "type": "number"},
    ]
    assert payload["query_result"]["row_count"] == len(payload["query_result"]["rows"])
    assert payload["chart_spec"]["type"] == "bar"
    assert payload["chart_spec"]["x"] == "product_id"
    assert payload["chart_spec"]["y"] == "review_count"


def test_week2_ai_query_uses_injected_catalog_source_for_evidence() -> None:
    catalog = {
        "tenant_id": "tenant_demo",
        "dataset_id": "dataset_reviews_catalog_source",
        "name": "Catalog Source Reviews Gold",
        "s3_uri": "s3://asklake-demo/catalog-source/reviews/run_id=run_catalog_source_001/",
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "review_count", "type": "integer", "nullable": False},
                {"name": "average_rating", "type": "number", "nullable": True},
            ]
        },
        "lineage": {"run_id": "run_catalog_source_001"},
        "query": {
            "table_name": "reviews_gold",
            "allowed_columns": ["product_id", "review_count", "average_rating"],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "updated_at": "2026-06-26T10:00:00+09:00",
    }
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(catalog),
    )

    result = service.answer("리뷰가 가장 많은 상품 알려줘")

    assert result.selected_datasets[0].dataset_id == "dataset_reviews_catalog_source"
    assert result.selected_datasets[0].name == "Catalog Source Reviews Gold"
    assert "review_count" in result.selected_datasets[0].reason
    assert result.evidence[0].dataset_id == "dataset_reviews_catalog_source"
    assert result.evidence[0].run_id == "run_catalog_source_001"
    assert result.evidence[0].s3_uri == "s3://asklake-demo/catalog-source/reviews/run_id=run_catalog_source_001/"
    assert result.evidence[0].freshness == "2026-06-26T10:00:00+09:00"
    assert result.status == "succeeded"
    assert result.query_result.sql == result.sql
    assert result.query_result.rows == result.rows


def test_week2_ai_query_scores_catalog_metadata_terms_when_columns_tie() -> None:
    generic_catalog = _review_catalog(
        "dataset_generic_product_metrics",
        "Generic Product Metrics",
        "run_generic_001",
    )
    amazon_catalog = _review_catalog(
        "dataset_amazon_reviews_gold",
        "Amazon Reviews Gold",
        "run_amazon_reviews_001",
    )
    service = Week2AIQueryService(
        sql_engine=FakeSqlEngine(),
        catalog_source=InMemoryCatalogSource(generic_catalog, amazon_catalog),
    )

    result = service.answer("Amazon reviews에서 평점 높은 상품 알려줘")

    assert result.selected_datasets[0].dataset_id == "dataset_amazon_reviews_gold"
    assert result.evidence[0].dataset_id == "dataset_amazon_reviews_gold"
    assert result.evidence[0].run_id == "run_amazon_reviews_001"
    assert "amazon" in result.selected_datasets[0].reason.lower()
    assert "average_rating" in result.selected_datasets[0].reason


def test_fake_sql_engine_blocks_non_select_sql() -> None:
    context = SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count"],
        default_limit=10,
        timeout_seconds=30,
    )

    validation = FakeSqlEngine().validate("DELETE FROM reviews_gold", context)

    assert validation.status == "blocked"
    assert validation.failure_code == "non_select_sql"


def test_fake_sql_engine_blocks_unallowed_table_and_missing_limit() -> None:
    context = SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count"],
        default_limit=10,
        timeout_seconds=30,
    )
    engine = FakeSqlEngine()

    table_validation = engine.validate("SELECT product_id FROM private_table LIMIT 10", context)
    limit_validation = engine.validate("SELECT product_id FROM reviews_gold", context)

    assert table_validation.status == "blocked"
    assert table_validation.failure_code == "table_not_allowed"
    assert limit_validation.status == "blocked"
    assert limit_validation.failure_code == "limit_required"


def test_fake_sql_engine_blocks_unallowed_column() -> None:
    context = SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count"],
        default_limit=10,
        timeout_seconds=30,
    )

    validation = FakeSqlEngine().validate("SELECT secret_note FROM reviews_gold LIMIT 10", context)

    assert validation.status == "blocked"
    assert validation.failure_code == "column_not_allowed"
