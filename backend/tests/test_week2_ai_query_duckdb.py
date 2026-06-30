import tempfile
from pathlib import Path
from subprocess import run

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.core.settings import Settings


def test_week2_ai_query_can_use_duckdb_runtime_after_local_runner_output() -> None:
    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        result_store_path=str(Path(temp_dir.name) / "results"),
        week2_sql_engine="duckdb",
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    client = TestClient(app)

    run_response = client.post(
        "/api/week2/workflows/pipeline_reviews_json_e2e/runs",
        json={"executor": "local_runner", "triggered_by": "m2_owner"},
    )
    query_response = client.post(
        "/api/week2/ai/query",
        json={"question": "리뷰가 가장 많은 상품 알려줘"},
    )

    assert run_response.status_code == 201
    assert query_response.status_code == 200
    payload = query_response.json()
    assert payload["status"] == "succeeded"
    assert payload["query_result"]["engine"] == "duckdb"
    assert payload["query_result"]["rows"][0] == {
        "product_id": "B001",
        "review_count": 2,
        "average_rating": 4.5,
    }


def test_week2_ai_query_can_query_product_health_catalog_metadata() -> None:
    ingest = run(
        [".venv/bin/python", "scripts/product_health_catalog_ingest.py"],
        check=False,
        capture_output=True,
        text=True,
    )
    assert ingest.returncode == 0, ingest.stderr

    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        week2_sql_engine="duckdb",
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    client = TestClient(app)

    response = client.post(
        "/api/week2/ai/query",
        json={"question": "리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군을 찾아줘"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "succeeded"
    assert payload["selected_datasets"][0]["dataset_id"] == "dataset_product_health_gold"
    assert payload["route"] == "sql"
    assert payload["query_result"]["engine"] == "duckdb"
    assert payload["sql"].startswith("SELECT internal_product_id, risk_score")
    assert payload["query_result"]["rows"]
    row = payload["query_result"]["rows"][0]
    assert row["internal_product_id"].startswith("aph_prod_")
    assert row["risk_score"] >= 0
    assert "negative_review_rate" in row
    assert "conversion_rate" in row
    assert "late_delivery_rate" in row
    assert payload["evidence"][0]["dataset_id"] == "dataset_product_health_gold"
    assert payload["evidence"][0]["metrics"]["processed_input_total_bytes"] >= 5 * 1024**3
    assert payload["retrieval_trace"][0]["source_id"] == "dataset_product_health_gold"
