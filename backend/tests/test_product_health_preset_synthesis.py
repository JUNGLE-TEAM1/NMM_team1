import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    store = SQLiteMetadataStore(f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}")
    app = create_app(store)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def test_product_health_preset_synthesis_runs_existing_smoke_outputs() -> None:
    client = make_client()

    response = client.post("/api/product-health/preset-synthesis")

    assert response.status_code == 200
    result = response.json()
    assert result["scenario_id"] == "product_health"
    assert result["status"] == "succeeded"
    assert result["mode"] == "source_inventory_and_row_limited_smoke_transform"
    assert result["run_id"] == "run_product_health_smoke_001"
    assert result["gold_output"]["path"] == "data/local_sources/product_health/gold/gold_product_health.parquet"
    assert result["gold_output"]["row_count"] == 1000
    assert result["sql_smoke"]["row_count"] == 10

    artifacts = {artifact["role"]: artifact for artifact in result["artifacts"]}
    assert artifacts["seed_product_mapping"]["path"] == "data/local_sources/product_health/silver/seed_product_mapping.parquet"
    assert artifacts["silver_user_events"]["path"].endswith("silver_user_events.parquet")
    assert artifacts["silver_product_reviews"]["row_count"] > 0
    assert artifacts["silver_product_catalog"]["row_count"] > 0
    assert artifacts["gold_product_health"]["path"] == result["gold_output"]["path"]
    assert artifacts["catalog_handoff"]["path"].endswith("catalog/dataset_product_health_gold.json")
    assert artifacts["run_summary"]["path"].endswith("evidence/product_health_run_summary.json")
