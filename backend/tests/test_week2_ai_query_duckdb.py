import tempfile
from pathlib import Path

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
