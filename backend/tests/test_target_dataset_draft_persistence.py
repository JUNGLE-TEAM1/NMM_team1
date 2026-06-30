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


def test_create_list_and_read_target_dataset_draft_metadata() -> None:
    client = make_client()

    response = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload())

    assert response.status_code == 201
    draft = response.json()
    assert draft["id"]
    assert draft["target_dataset_name"] == "dataset_product_health_gold"
    assert draft["base_source_ref"]["source_id"] == "source_partner_catalog_api"
    assert draft["target_grain"] == "product_id"
    assert len(draft["source_refs"]) == 2
    assert draft["silver_outputs"][0]["name"] == "silver_product_catalog"
    assert draft["processing_recipes"] == ["standardize_sources", "join_product", "score_health"]
    assert draft["gold_output"] == "dataset_product_health_gold"
    assert draft["executor_handoff"] == "local_runner"
    assert draft["schedule"]["mode"] == "manual"
    assert draft["schema_preview"] == [
        {"name": "product_id", "type": "string"},
        {"name": "risk_score", "type": "number"},
    ]
    assert draft["layer"] == "target"
    assert draft["status"] == "draft_ready"

    list_response = client.get("/api/target-dataset-drafts")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == draft["id"]

    detail_response = client.get(f"/api/target-dataset-drafts/{draft['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["silver_outputs"][1]["name"] == "silver_product_reviews"


def test_create_target_dataset_draft_rejects_duplicate_name() -> None:
    client = make_client()

    first_response = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload())
    duplicate_response = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload())

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert "Target dataset draft name already exists" in duplicate_response.json()["detail"]


def test_update_target_dataset_draft_schedule_metadata() -> None:
    client = make_client()
    create_response = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload())
    draft = create_response.json()

    response = client.patch(
        f"/api/target-dataset-drafts/{draft['id']}/schedule",
        json={"mode": "placeholder", "note": "weekday 10:00 gold build window"},
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == draft["id"]
    assert updated["schedule"] == {"mode": "placeholder", "note": "weekday 10:00 gold build window"}
    assert updated["created_at"] == draft["created_at"]
    assert updated["updated_at"] >= draft["updated_at"]


def test_update_missing_target_dataset_draft_schedule_returns_not_found() -> None:
    client = make_client()

    response = client.patch(
        "/api/target-dataset-drafts/not-found/schedule",
        json={"mode": "manual", "note": "missing"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Target dataset draft not found"


def test_update_target_dataset_draft_metadata() -> None:
    client = make_client()
    draft = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload()).json()
    payload = target_dataset_draft_payload("dataset_product_health_gold_v2")
    payload.pop("schedule")
    payload["gold_output"] = "dataset_product_health_gold_v2"

    response = client.patch(f"/api/target-dataset-drafts/{draft['id']}", json=payload)

    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == draft["id"]
    assert updated["target_dataset_name"] == "dataset_product_health_gold_v2"
    assert updated["gold_output"] == "dataset_product_health_gold_v2"
    assert updated["schedule"] == draft["schedule"]
    assert updated["processing_recipes"] == ["standardize_sources", "join_product", "score_health"]


def test_delete_target_dataset_draft_metadata() -> None:
    client = make_client()
    draft = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload()).json()

    response = client.delete(f"/api/target-dataset-drafts/{draft['id']}")

    assert response.status_code == 204
    assert client.get(f"/api/target-dataset-drafts/{draft['id']}").status_code == 404


def test_delete_target_dataset_draft_rejects_job_run_reference() -> None:
    client = make_client()
    draft = client.post("/api/target-dataset-drafts", json=target_dataset_draft_payload()).json()
    run_response = client.post(
        "/api/target-dataset-job-runs",
        json={"target_dataset_draft_id": draft["id"], "job_type": "gold_build", "triggered_by": "demo_user"},
    )

    response = client.delete(f"/api/target-dataset-drafts/{draft['id']}")

    assert run_response.status_code == 201
    assert response.status_code == 409
    assert "referenced by a Job Run" in response.json()["detail"]


def test_get_missing_target_dataset_draft_returns_not_found() -> None:
    client = make_client()

    response = client.get("/api/target-dataset-drafts/not-found")

    assert response.status_code == 404
    assert response.json()["detail"] == "Target dataset draft not found"
