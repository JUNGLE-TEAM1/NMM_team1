import tempfile
from pathlib import Path

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


def test_publish_succeeded_target_dataset_job_run_to_catalog() -> None:
    client = make_client()
    draft = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload()).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()
    executed = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute").json()

    response = client.post(f"/api/target-dataset-job-runs/{run['id']}/publish-catalog")

    assert response.status_code == 201
    dataset = response.json()
    assert dataset["name"] == "dataset_product_health_gold"
    assert dataset["source_id"] == run["id"]
    assert dataset["source_type"] == "target_dataset_job_run"
    assert dataset["path"] == executed["output_path"]
    assert dataset["row_count"] == executed["row_count"]
    assert any(column["name"] == "product_id" for column in dataset["schema"])
    assert any(column["name"] == "risk_score" for column in dataset["schema"])
    assert dataset["sample"][0]["product_id"] == "gold_prod_000001"
    assert dataset["lineage"]["run_id"] == run["id"]
    assert dataset["lineage"]["target_dataset_draft_id"] == draft["id"]
    assert dataset["metrics"]["row_count"] == executed["row_count"]
    assert dataset["metrics"]["bytes"] == executed["output_bytes"]
    assert dataset["storage"]["local_path"] == executed["output_path"]
    assert dataset["runtime_evidence"]["runner"] == "local_runner"
    assert len(dataset["source_evidence"]) == 2

    listed = client.get("/api/catalog/datasets").json()
    assert listed[0]["id"] == dataset["id"]

    duplicate = client.post(f"/api/target-dataset-job-runs/{run['id']}/publish-catalog").json()
    assert duplicate["id"] == dataset["id"]


def test_publish_prepared_gold_reference_to_catalog() -> None:
    client = make_client()
    payload = target_dataset_draft_payload("dataset_product_health")
    payload["gold_output"] = "dataset_product_health"
    draft = client.post("/api/target-dataset-drafts", json=payload).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()
    executed = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute").json()

    response = client.post(f"/api/target-dataset-job-runs/{run['id']}/publish-catalog")

    assert response.status_code == 201
    dataset = response.json()
    assert dataset["name"] == "dataset_product_health"
    assert "data/lake/gold/run_id=" in dataset["path"]
    assert dataset["path"].endswith("dataset_product_health.parquet")
    assert dataset["path"] == executed["output_path"]
    assert dataset["row_count"] == 1000
    assert dataset["metrics"]["row_count"] == 1000
    assert dataset["storage"]["format"] == "parquet"
    assert dataset["storage"]["local_path"] == executed["output_path"]
    assert any(column["name"] == "internal_product_id" for column in dataset["schema"])
    assert any(column["name"] == "risk_score" for column in dataset["schema"])
    assert dataset["runtime_evidence"]["materialization_mode"] == "prepared_gold_write_through"
    assert dataset["runtime_evidence"]["prepared_output"] is False
    assert dataset["runtime_evidence"]["prepared_reference"] is True
    assert dataset["runtime_evidence"]["reference_evidence"]["latest_output"] is False
    assert dataset["sample"]
    assert isinstance(dataset["sample"][0], dict)
    assert dataset["sample"][0]

    query_response = client.post(
        "/api/week2/ai/query",
        json={"question": "품질 위험 점수가 높은 상품을 보여줘"},
    )
    assert query_response.status_code == 200
    query_payload = query_response.json()
    assert query_payload["status"] == "succeeded"
    assert query_payload["sql"].startswith("SELECT internal_product_id, risk_score")
    assert query_payload["selected_datasets"][0]["dataset_id"] == dataset["id"]
    assert query_payload["evidence"][0]["dataset_id"] == dataset["id"]
    assert query_payload["evidence"][0]["run_id"] == run["id"]
    assert query_payload["evidence"][0]["storage"]["local_fallback_path"] == executed["output_path"]
    assert query_payload["retrieval_trace"][0]["source_id"] == dataset["id"]
    assert query_payload["query_result"]["rows"]


def test_publish_rejects_unexecuted_target_dataset_job_run() -> None:
    client = make_client()
    draft = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload()).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()

    response = client.post(f"/api/target-dataset-job-runs/{run['id']}/publish-catalog")

    assert response.status_code == 400
    assert response.json()["detail"] == "Target dataset job run must be succeeded before catalog publish"


def test_publish_missing_target_dataset_job_run_returns_not_found() -> None:
    client = make_client()

    response = client.post("/api/target-dataset-job-runs/not-found/publish-catalog")

    assert response.status_code == 404
    assert response.json()["detail"] == "Target dataset job run not found"


def test_catalog_dataset_management_policy_is_read_only_boundary() -> None:
    client = make_client()

    response = client.get("/api/catalog/datasets/management-policy")

    assert response.status_code == 200
    policy = response.json()
    assert policy["status"] == "read_only_boundary"
    assert policy["allowed_actions"] == ["detail", "ai_query_context"]
    assert "metadata_delete" in policy["disabled_actions"]
    assert "file_delete" in policy["disabled_actions"]
    assert policy["file_delete_policy"] == "never_without_explicit_human_confirmation"
