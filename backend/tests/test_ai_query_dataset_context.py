import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.core.settings import Settings
from test_target_dataset_job_run_handoff import target_dataset_draft_payload


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        result_store_path=str(Path(temp_dir.name) / "results"),
        week2_sql_engine="fake",
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def make_duckdb_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        result_store_path=str(Path(temp_dir.name) / "results"),
        week2_sql_engine="duckdb",
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def test_ai_query_uses_published_target_dataset_catalog_context() -> None:
    client = make_client()
    draft_payload = target_dataset_draft_payload("dataset_ai_query_context_gold")
    draft_payload["gold_output"] = "dataset_ai_query_context_gold"
    draft = client.post(
        "/api/target-dataset-drafts",
        json=draft_payload,
    ).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()
    executed = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute").json()
    catalog = client.post(f"/api/target-dataset-job-runs/{run['id']}/publish-catalog").json()

    response = client.post(
        "/api/week2/ai/query",
        json={"question": "위험 점수가 높은 상품 알려줘"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "succeeded"
    assert payload["route"] == "sql"
    assert payload["selected_datasets"][0]["dataset_id"] == catalog["id"]
    assert payload["selected_datasets"][0]["name"] == "dataset_ai_query_context_gold"
    assert payload["evidence"][0]["dataset_id"] == catalog["id"]
    assert payload["evidence"][0]["run_id"] == run["id"]
    assert payload["evidence"][0]["metrics"]["row_count"] == executed["row_count"]
    assert payload["evidence"][0]["metrics"]["bytes"] == executed["output_bytes"]
    assert payload["evidence"][0]["storage"]["local_fallback_path"] == catalog["path"]
    assert payload["retrieval_trace"][0]["source_id"] == catalog["id"]
    assert "FROM dataset_ai_query_context_gold" in payload["sql"]
    assert payload["query_result"]["rows"][0]["risk_score"] == 0.92


def test_ai_query_duckdb_reads_runtime_gold_catalog_dataset() -> None:
    client = make_duckdb_client()
    draft_payload = target_dataset_draft_payload("dataset_ai_query_runtime_gold")
    draft_payload["gold_output"] = "dataset_ai_query_runtime_gold"
    draft = client.post("/api/target-dataset-drafts", json=draft_payload).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()
    executed = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute").json()
    catalog = client.post(f"/api/target-dataset-job-runs/{run['id']}/publish-catalog").json()

    response = client.post(
        "/api/week2/ai/query",
        json={"question": "위험 점수가 높은 상품 알려줘"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert executed["status"] == "succeeded"
    assert catalog["path"] == executed["output_path"]
    assert payload["status"] == "succeeded"
    assert payload["route"] == "sql"
    assert payload["query_result"]["engine"] == "duckdb"
    assert payload["selected_datasets"][0]["dataset_id"] == catalog["id"]
    assert payload["evidence"][0]["run_id"] == run["id"]
    assert payload["evidence"][0]["metrics"]["row_count"] == executed["row_count"]
    assert payload["evidence"][0]["storage"]["local_fallback_path"] == executed["output_path"]
    assert "FROM dataset_ai_query_runtime_gold" in payload["sql"]
    assert payload["query_result"]["rows"]
    assert payload["query_result"]["rows"][0]["product_id"].startswith("gold_prod_")
    assert payload["query_result"]["rows"][0]["risk_score"] >= 0


def test_ai_query_uses_product_health_lake_output_after_prepared_write_through() -> None:
    client = make_duckdb_client()
    draft_payload = target_dataset_draft_payload("dataset_product_health")
    draft_payload["gold_output"] = "dataset_product_health"
    draft = client.post("/api/target-dataset-drafts", json=draft_payload).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()
    executed = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute").json()
    catalog = client.post(f"/api/target-dataset-job-runs/{run['id']}/publish-catalog").json()

    response = client.post(
        "/api/week2/ai/query",
        json={"question": "품질 위험 점수가 높은 상품을 보여줘"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert executed["status"] == "succeeded"
    assert "data/lake/gold/run_id=" in executed["output_path"]
    assert "data/local_sources/product_health/gold" not in executed["output_path"]
    assert catalog["path"] == executed["output_path"]
    assert catalog["storage"]["local_path"] == executed["output_path"]
    assert catalog["runtime_evidence"]["reference_evidence"]["latest_output"] is False
    assert catalog["runtime_evidence"]["reference_evidence"]["path"] == "data/local_sources/product_health/gold/gold_product_health.parquet"

    assert payload["status"] == "succeeded"
    assert payload["route"] in {"sql", "hybrid"}
    assert payload["query_result"]["engine"] == "duckdb"
    assert payload["selected_datasets"][0]["dataset_id"] == catalog["id"]
    assert payload["selected_datasets"][0]["name"] == "dataset_product_health"
    assert payload["evidence"][0]["dataset_id"] == catalog["id"]
    assert payload["evidence"][0]["run_id"] == run["id"]
    assert payload["evidence"][0]["storage"]["local_fallback_path"] == executed["output_path"]
    assert "data/local_sources/product_health/gold" not in payload["evidence"][0]["storage"]["local_fallback_path"]
    assert payload["retrieval_trace"][0]["source_id"] == catalog["id"]
    assert payload["sql"].startswith("SELECT internal_product_id, risk_score")
    assert "FROM dataset_product_health" in payload["sql"]
    assert payload["query_result"]["rows"]
    assert "internal_product_id" in payload["query_result"]["rows"][0]
    assert payload["query_result"]["rows"][0]["risk_score"] >= 0


def test_ai_query_keeps_fixture_fallback_when_no_published_catalog_exists() -> None:
    client = make_client()

    response = client.post(
        "/api/week2/ai/query",
        json={"question": "리뷰가 가장 많은 상품 알려줘"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["selected_datasets"][0]["dataset_id"] == "dataset_reviews_gold"
    assert payload["status"] == "succeeded"
