import tempfile
from pathlib import Path

import pyarrow.parquet as pq
from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from test_target_dataset_job_run_handoff import target_dataset_draft_payload


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    store = SQLiteMetadataStore(f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}")
    app = create_app(store)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def test_execute_target_dataset_job_run_materializes_gold_from_silver_parquet() -> None:
    client = make_client()
    draft = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload()).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()

    response = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute")

    assert response.status_code == 200
    executed = response.json()
    assert executed["status"] == "succeeded"
    assert executed["row_count"] > 1
    assert executed["output_bytes"] > 0
    assert "data/lake/gold/run_id=" in executed["output_path"]
    assert executed["output_path"].endswith("dataset_product_health_gold.parquet")
    assert len(executed["silver_output_paths"]) == 2
    assert "Silver parquet" in executed["run_note"]
    assert executed["duration_ms"] >= 1
    assert executed["runtime_evidence"]["runner"] == "local_runner"
    assert executed["runtime_evidence"]["status"] == "succeeded"
    assert executed["runtime_evidence"]["executor_status"] == "executed"
    assert executed["runtime_evidence"]["run_record_role"] == "execution_evidence"
    assert executed["runtime_evidence"]["materialization_mode"] == "silver_parquet_to_gold"
    assert executed["runtime_evidence"]["output_format"] == "parquet"
    assert executed["runtime_evidence"]["output_bytes"] == executed["output_bytes"]
    assert executed["runtime_evidence"]["catalog_publish_ready"] is True
    assert executed["runtime_evidence"]["object_storage"]["status"] == "not_uploaded"
    assert executed["runtime_evidence"]["object_storage"]["object_uri"].startswith("s3://asklake-demo/product_health/gold/")
    assert len(executed["source_evidence"]) == 2
    assert executed["source_evidence"][0]["status"] == "materialized_silver_input"
    assert executed["source_evidence"][0]["rows"] > 0
    assert executed["source_evidence"][0]["bytes"] > 0

    gold_path = Path(executed["output_path"])
    assert gold_path.exists()
    rows = pq.ParquetFile(gold_path).read().to_pylist()
    gold_row = rows[0]
    assert gold_row["product_id"] == "gold_prod_000001"
    assert gold_row["run_id"] == run["id"]

    for silver_path in executed["silver_output_paths"]:
        assert Path(silver_path).exists()


def test_execute_target_dataset_job_run_references_prepared_gold_when_available() -> None:
    client = make_client()
    payload = target_dataset_draft_payload("dataset_product_health")
    payload["gold_output"] = "dataset_product_health"
    draft = client.post("/api/target-dataset-drafts", json=payload).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()

    response = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute")

    assert response.status_code == 200
    executed = response.json()
    assert executed["status"] == "succeeded"
    assert executed["row_count"] == 1000
    assert executed["output_path"] == "data/local_sources/product_health/gold/gold_product_health.parquet"
    assert executed["output_bytes"] > 1000
    assert len(executed["silver_output_paths"]) == 2
    assert executed["run_note"] == "Prepared Product Health Gold parquet referenced for Product Health run execution."
    assert executed["runtime_evidence"]["materialization_mode"] == "prepared_gold_reference"
    assert executed["runtime_evidence"]["output_format"] == "parquet"
    assert executed["runtime_evidence"]["prepared_output"] is True
    assert executed["runtime_evidence"]["large_etl_rerun"] is False
    assert executed["runtime_evidence"]["catalog_publish_ready"] is True
    assert executed["runtime_evidence"]["product_health_result_role"] == "gold_run_execution_evidence"
    assert executed["runtime_evidence"]["schema_fields"] > 0
    assert executed["source_evidence"][0]["status"] == "referenced_prepared_silver"
    assert executed["source_evidence"][0]["format"] == "parquet"


def test_execute_target_dataset_job_run_rejects_missing_run() -> None:
    client = make_client()

    response = client.post("/api/target-dataset-job-runs/not-found/execute")

    assert response.status_code == 404
    assert response.json()["detail"] == "Target dataset job run not found"
