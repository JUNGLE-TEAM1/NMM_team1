from fastapi.testclient import TestClient

from app.core.app_factory import create_app
from app.domain.ai_query import SqlEngineContext
from app.fakes.fake_sql_engine import FakeSqlEngine


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
