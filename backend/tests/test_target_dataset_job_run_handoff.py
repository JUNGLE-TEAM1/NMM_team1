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


def target_dataset_draft_payload(name: str = "dataset_product_health_gold") -> dict:
    return {
        "target_dataset_name": name,
        "description": "제품 상태 분석용 gold dataset draft",
        "base_source_ref": {
            "source_id": "source_partner_catalog_api",
            "name": "Partner Catalog API",
            "role": "base",
            "type_label": "API",
            "resource": "GET /partner/catalog",
        },
        "target_grain": "product_id",
        "source_refs": [
            {
                "source_id": "source_partner_catalog_api",
                "name": "Partner Catalog API",
                "role": "base",
                "type_label": "API",
                "resource": "GET /partner/catalog",
            },
            {
                "source_id": "source_product_health_reviews",
                "name": "Product Health Reviews",
                "role": "enrichment",
                "type_label": "CSV / Local File",
                "resource": "product_health_reviews.jsonl",
            },
        ],
        "silver_outputs": [
            {
                "name": "silver_product_catalog",
                "from_source_id": "source_partner_catalog_api",
                "from_source_name": "Partner Catalog API",
                "purpose": "상품 id/category 표준화",
            },
            {
                "name": "silver_product_reviews",
                "from_source_id": "source_product_health_reviews",
                "from_source_name": "Product Health Reviews",
                "purpose": "평점/리뷰 텍스트 정규화",
            },
        ],
        "processing_recipes": ["standardize_sources", "join_product", "score_health"],
        "gold_output": "dataset_product_health_gold",
        "executor_handoff": "local_runner",
        "schedule": {"mode": "manual", "note": "데모에서는 수동 실행으로만 준비합니다."},
        "schema_preview": [
            {"name": "product_id", "type": "string"},
            {"name": "risk_score", "type": "number"},
        ],
    }


def test_create_list_and_read_target_dataset_job_run_handoff() -> None:
    client = make_client()
    draft_response = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload())
    draft = draft_response.json()

    response = client.post(
        "/api/target-dataset-job-runs",
        json={
            "target_dataset_draft_id": draft["id"],
            "job_type": "gold_build",
            "triggered_by": "demo_user",
        },
    )

    assert response.status_code == 201
    run = response.json()
    assert run["id"]
    assert run["target_dataset_draft_id"] == draft["id"]
    assert run["target_dataset_name"] == "dataset_product_health_gold"
    assert run["gold_output"] == "dataset_product_health_gold"
    assert run["job_type"] == "gold_build"
    assert run["status"] == "queued"
    assert run["output_path"] is None
    assert run["row_count"] is None
    assert run["output_bytes"] is None
    assert run["executor_handoff"] == "local_runner"
    assert run["schedule"]["mode"] == "manual"
    assert run["source_count"] == 2
    assert run["silver_output_count"] == 2
    assert run["processing_recipes"] == ["standardize_sources", "join_product", "score_health"]
    assert run["triggered_by"] == "demo_user"
    assert "Runner execution is not triggered" in run["run_note"]

    list_response = client.get("/api/target-dataset-job-runs")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == run["id"]

    detail_response = client.get(f"/api/target-dataset-job-runs/{run['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["target_dataset_draft_id"] == draft["id"]
    assert detail_response.json()["output_path"] is None


def test_execute_airflow_target_dataset_job_run_records_readiness_only() -> None:
    client = make_client()
    payload = target_dataset_draft_payload("dataset_product_health_airflow")
    payload["gold_output"] = "dataset_product_health_airflow"
    payload["executor_handoff"] = "airflow"
    draft = client.post("/api/target-dataset-drafts", json=payload).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()

    response = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute")

    assert response.status_code == 200
    executed = response.json()
    assert executed["status"] == "ready_to_run"
    assert executed["output_path"] is None
    assert executed["row_count"] is None
    assert executed["runtime_evidence"]["runner"] == "airflow"
    assert executed["runtime_evidence"]["executor_status"] == "readiness_only"
    assert executed["runtime_evidence"]["trigger_attempted"] is False
    assert executed["runtime_evidence"]["result_artifact_status"] == "not_connected"
    assert "DAG trigger is not executed" in executed["run_note"]


def test_execute_spark_target_dataset_job_run_records_readiness_only() -> None:
    client = make_client()
    payload = target_dataset_draft_payload("dataset_product_health_spark")
    payload["gold_output"] = "dataset_product_health_spark"
    payload["executor_handoff"] = "spark_runner"
    draft = client.post("/api/target-dataset-drafts", json=payload).json()
    run = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    ).json()

    response = client.post(f"/api/target-dataset-job-runs/{run['id']}/execute")

    assert response.status_code == 200
    executed = response.json()
    assert executed["status"] == "ready_to_run"
    assert executed["output_path"] is None
    assert executed["row_count"] is None
    assert executed["runtime_evidence"]["runner"] == "spark_runner"
    assert executed["runtime_evidence"]["executor_status"] == "readiness_only"
    assert executed["runtime_evidence"]["trigger_attempted"] is False
    assert executed["runtime_evidence"]["result_artifact_status"] == "not_connected"
    assert "Spark job is not executed" in executed["run_note"]


def test_create_target_dataset_job_run_rejects_missing_draft() -> None:
    client = make_client()

    response = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": "not-found", "job_type": "gold_build"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Target dataset draft not found"


def test_get_missing_target_dataset_job_run_returns_not_found() -> None:
    client = make_client()

    response = client.get("/api/target-dataset-job-runs/not-found")

    assert response.status_code == 404
    assert response.json()["detail"] == "Target dataset job run not found"
