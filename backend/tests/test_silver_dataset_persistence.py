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


def source_dataset_payload(name: str = "source_product_health_reviews") -> dict:
    return {
        "connection_id": "conn_product_health_reviews_file",
        "connection_name": "Product Health Reviews File",
        "connection_type": "local_file",
        "name": name,
        "raw_scope": "backend/samples/product_health_reviews_seed.jsonl",
        "resource_label": "file_path",
        "schema_preview": [
            {"name": "review_id", "type": "string"},
            {"name": "rating", "type": "number"},
        ],
    }


def silver_dataset_payload(source_dataset: dict, name: str = "silver_product_health_reviews") -> dict:
    return {
        "source_dataset_id": source_dataset["id"],
        "source_dataset_name": source_dataset["name"],
        "name": name,
        "purpose": "리뷰 평점과 텍스트를 제품 품질 분석용 silver schema로 표준화",
        "standardize_rules": ["normalize product_id", "cast rating to number", "trim review_text"],
        "validation_rules": ["require review_id", "rating between 1 and 5"],
        "schema_preview": [
            {"name": "review_id", "type": "string"},
            {"name": "product_id", "type": "string"},
            {"name": "rating", "type": "number"},
        ],
    }


def test_create_list_and_read_silver_dataset_metadata() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()

    response = client.post("/api/silver-datasets", json=silver_dataset_payload(source))

    assert response.status_code == 201
    dataset = response.json()
    assert dataset["id"]
    assert dataset["source_dataset_id"] == source["id"]
    assert dataset["source_dataset_name"] == "source_product_health_reviews"
    assert dataset["name"] == "silver_product_health_reviews"
    assert dataset["purpose"] == "리뷰 평점과 텍스트를 제품 품질 분석용 silver schema로 표준화"
    assert dataset["standardize_rules"] == ["normalize product_id", "cast rating to number", "trim review_text"]
    assert dataset["validation_rules"] == ["require review_id", "rating between 1 and 5"]
    assert dataset["schedule"] == {"mode": "manual", "note": ""}
    assert dataset["schema_preview"] == [
        {"name": "review_id", "type": "string"},
        {"name": "product_id", "type": "string"},
        {"name": "rating", "type": "number"},
    ]
    assert dataset["layer"] == "silver"
    assert dataset["status"] == "metadata_ready"
    assert dataset["created_at"] == dataset["updated_at"]

    list_response = client.get("/api/silver-datasets")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == dataset["id"]

    detail_response = client.get(f"/api/silver-datasets/{dataset['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["name"] == "silver_product_health_reviews"


def test_create_silver_dataset_rejects_duplicate_name() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()

    first_response = client.post("/api/silver-datasets", json=silver_dataset_payload(source))
    duplicate_response = client.post("/api/silver-datasets", json=silver_dataset_payload(source))

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert "Silver dataset name already exists" in duplicate_response.json()["detail"]


def test_silver_dataset_file_evidence_uses_prepared_parquet_when_present() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload("source_product_catalog")).json()
    payload = silver_dataset_payload(source, "silver_product_catalog")

    response = client.post("/api/silver-datasets", json=payload)

    assert response.status_code == 201
    dataset = response.json()
    assert dataset["file_evidence"]["status"] == "file_backed"
    assert dataset["file_evidence"]["path"] == "data/local_sources/product_health/silver/silver_product_catalog.parquet"
    assert dataset["file_evidence"]["bytes"] > 0
    assert dataset["file_evidence"]["row_count_status"] == "metadata"
    assert dataset["file_evidence"]["schema_fields"] > 0


def test_update_silver_dataset_schedule_metadata() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()
    dataset = client.post("/api/silver-datasets", json=silver_dataset_payload(source)).json()
    before_materializations = client.get(f"/api/silver-datasets/{dataset['id']}/materializations").json()

    response = client.patch(
        f"/api/silver-datasets/{dataset['id']}/schedule",
        json={"mode": "placeholder", "note": "weekday 09:00 transform window"},
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == dataset["id"]
    assert updated["schedule"] == {"mode": "placeholder", "note": "weekday 09:00 transform window"}
    assert updated["created_at"] == dataset["created_at"]
    assert updated["updated_at"] >= dataset["updated_at"]
    after_materializations = client.get(f"/api/silver-datasets/{dataset['id']}/materializations").json()
    assert before_materializations == []
    assert after_materializations == []
    assert updated["status"] == dataset["status"]


def test_update_missing_silver_dataset_schedule_returns_not_found() -> None:
    client = make_client()

    response = client.patch(
        "/api/silver-datasets/not-found/schedule",
        json={"mode": "manual", "note": "missing"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Silver dataset not found"


def test_update_silver_dataset_metadata() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()
    dataset = client.post("/api/silver-datasets", json=silver_dataset_payload(source)).json()

    response = client.patch(
        f"/api/silver-datasets/{dataset['id']}",
        json={
            "name": "silver_product_health_reviews_v2",
            "purpose": "수정된 silver metadata",
            "standardize_rules": ["normalize ids"],
            "validation_rules": ["require product_id"],
            "schema_preview": [{"name": "product_id", "type": "string"}],
        },
    )

    assert response.status_code == 200
    updated = response.json()
    assert updated["id"] == dataset["id"]
    assert updated["name"] == "silver_product_health_reviews_v2"
    assert updated["purpose"] == "수정된 silver metadata"
    assert updated["standardize_rules"] == ["normalize ids"]
    assert updated["validation_rules"] == ["require product_id"]
    assert updated["schema_preview"] == [{"name": "product_id", "type": "string"}]
    assert updated["schedule"] == dataset["schedule"]


def test_delete_silver_dataset_metadata() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()
    dataset = client.post("/api/silver-datasets", json=silver_dataset_payload(source)).json()

    response = client.delete(f"/api/silver-datasets/{dataset['id']}")

    assert response.status_code == 204
    assert client.get(f"/api/silver-datasets/{dataset['id']}").status_code == 404


def test_delete_silver_dataset_rejects_target_draft_reference() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()
    dataset = client.post("/api/silver-datasets", json=silver_dataset_payload(source)).json()
    draft_response = client.post(
        "/api/target-dataset-drafts",
        json={
            "target_dataset_name": "dataset_product_health_gold",
            "description": "제품 상태 분석용 gold dataset draft",
            "base_source_ref": {
                "source_id": dataset["id"],
                "name": dataset["name"],
                "role": "base",
                "type_label": "Silver Dataset",
                "resource": dataset["source_dataset_name"],
            },
            "target_grain": "product_id",
            "source_refs": [
                {
                    "source_id": dataset["id"],
                    "name": dataset["name"],
                    "role": "base",
                    "type_label": "Silver Dataset",
                    "resource": dataset["source_dataset_name"],
                },
                {
                    "source_id": "silver_enrichment",
                    "name": "silver_enrichment",
                    "role": "enrichment",
                    "type_label": "Silver Dataset",
                    "resource": "source_enrichment",
                },
            ],
            "silver_outputs": [
                {
                    "name": dataset["name"],
                    "from_source_id": source["id"],
                    "from_source_name": source["name"],
                    "purpose": "review signals",
                }
            ],
            "processing_recipes": ["join_product"],
            "gold_output": "dataset_product_health_gold",
            "executor_handoff": "local_runner",
            "schedule": {"mode": "manual", "note": ""},
            "schema_preview": [{"name": "product_id", "type": "string"}],
        },
    )

    response = client.delete(f"/api/silver-datasets/{dataset['id']}")

    assert draft_response.status_code == 201
    assert response.status_code == 409
    assert "referenced by a Target Dataset draft" in response.json()["detail"]


def test_update_silver_dataset_rejects_name_change_when_target_draft_references_it() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()
    dataset = client.post("/api/silver-datasets", json=silver_dataset_payload(source)).json()
    draft_response = client.post(
        "/api/target-dataset-drafts",
        json={
            "target_dataset_name": "dataset_product_health_gold",
            "description": "제품 상태 분석용 gold dataset draft",
            "base_source_ref": {
                "source_id": dataset["id"],
                "name": dataset["name"],
                "role": "base",
                "type_label": "Silver Dataset",
                "resource": dataset["source_dataset_name"],
            },
            "target_grain": "product_id",
            "source_refs": [
                {
                    "source_id": dataset["id"],
                    "name": dataset["name"],
                    "role": "base",
                    "type_label": "Silver Dataset",
                    "resource": dataset["source_dataset_name"],
                },
                {
                    "source_id": "silver_enrichment",
                    "name": "silver_enrichment",
                    "role": "enrichment",
                    "type_label": "Silver Dataset",
                    "resource": "source_enrichment",
                },
            ],
            "silver_outputs": [
                {
                    "name": dataset["name"],
                    "from_source_id": source["id"],
                    "from_source_name": source["name"],
                    "purpose": "review signals",
                }
            ],
            "processing_recipes": ["join_product"],
            "gold_output": "dataset_product_health_gold",
            "executor_handoff": "local_runner",
            "schedule": {"mode": "manual", "note": ""},
            "schema_preview": [{"name": "product_id", "type": "string"}],
        },
    )

    name_response = client.patch(f"/api/silver-datasets/{dataset['id']}", json={"name": "silver_product_health_reviews_v2"})
    purpose_response = client.patch(f"/api/silver-datasets/{dataset['id']}", json={"purpose": "목적 수정은 허용"})

    assert draft_response.status_code == 201
    assert name_response.status_code == 409
    assert "name is referenced by a Target Dataset draft" in name_response.json()["detail"]
    assert purpose_response.status_code == 200
    assert purpose_response.json()["purpose"] == "목적 수정은 허용"


def test_create_silver_dataset_requires_existing_source_dataset() -> None:
    client = make_client()

    response = client.post(
        "/api/silver-datasets",
        json={
            "source_dataset_id": "missing-source",
            "source_dataset_name": "missing",
            "name": "silver_missing_source",
            "purpose": "missing source guard",
            "standardize_rules": ["normalize ids"],
            "validation_rules": ["require id"],
            "schema_preview": [{"name": "id", "type": "string"}],
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Source dataset not found"


def test_create_silver_dataset_materialization_uses_latest_source_snapshot() -> None:
    client = make_client()
    source = client.post("/api/source-datasets", json=source_dataset_payload()).json()
    snapshot = client.post(f"/api/source-datasets/{source['id']}/snapshots", json={"sample_size": 3}).json()
    silver = client.post("/api/silver-datasets", json=silver_dataset_payload(source)).json()

    response = client.post(f"/api/silver-datasets/{silver['id']}/materializations", json={"sample_size": 100})

    assert response.status_code == 201
    materialization = response.json()
    assert materialization["silver_dataset_id"] == silver["id"]
    assert materialization["source_dataset_id"] == source["id"]
    assert materialization["input_path"] == snapshot["output_path"]
    assert materialization["row_count"] == 3
    assert materialization["output_bytes"] > 0
    assert materialization["failed_row_count"] == 0
    assert materialization["status"] == "succeeded"
    assert materialization["output_path"] == "data/lake/silver/silver_product_health_reviews.parquet"
    assert Path(materialization["output_path"]).exists()

    list_response = client.get(f"/api/silver-datasets/{silver['id']}/materializations")
    detail_response = client.get(f"/api/silver-datasets/{silver['id']}")

    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == materialization["id"]
    assert detail_response.json()["status"] == "materialized"
    assert detail_response.json()["file_evidence"]["status"] == "file_backed"
    assert detail_response.json()["file_evidence"]["path"] == materialization["output_path"]


def test_create_silver_dataset_materialization_rejects_missing_source_file() -> None:
    client = make_client()
    payload = source_dataset_payload("source_silver_missing")
    payload["raw_scope"] = "data/does-not-exist/missing.jsonl"
    source = client.post("/api/source-datasets", json=payload).json()
    silver = client.post("/api/silver-datasets", json=silver_dataset_payload(source, "silver_missing")).json()

    response = client.post(
        f"/api/silver-datasets/{silver['id']}/materializations",
        json={"sample_size": 10, "prefer_latest_source_snapshot": False},
    )
    list_response = client.get(f"/api/silver-datasets/{silver['id']}/materializations")

    assert response.status_code == 400
    assert "Local path" in response.json()["detail"]
    assert list_response.json() == []


def test_get_missing_silver_dataset_returns_not_found() -> None:
    client = make_client()

    response = client.get("/api/silver-datasets/not-found")

    assert response.status_code == 404
    assert response.json()["detail"] == "Silver dataset not found"
