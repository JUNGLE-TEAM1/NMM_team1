from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app


def make_client(tmp_path: Path) -> TestClient:
    store = SQLiteMetadataStore(f"sqlite:///{tmp_path / 'metadata.db'}")
    app = create_app(store)
    return TestClient(app)


def test_register_csv_source_and_read_catalog_detail(tmp_path: Path) -> None:
    client = make_client(tmp_path)

    response = client.post(
        "/api/sources",
        json={"name": "sample_orders", "type": "csv", "path": "samples/orders.csv"},
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["source"]["id"]
    assert payload["source"]["dataset_id"] == payload["dataset"]["id"]
    assert payload["dataset"]["status"] == "ready"
    assert payload["dataset"]["trust_status"] == "Draft"
    assert payload["dataset"]["trust_gate_result"]["status"] == "Draft"
    assert payload["dataset"]["trust_gate_result"]["passed_gates"] == ["schema"]
    assert "quality gate is pending" in payload["dataset"]["trust_gate_result"]["reasons"]
    assert payload["dataset"]["row_count"] == 5
    assert payload["dataset"]["schema"][0] == {"name": "order_id", "type": "string"}
    assert payload["dataset"]["schema"][2] == {"name": "amount", "type": "integer"}
    assert payload["dataset"]["sample"][0]["amount"] == 12000

    sources = client.get("/api/sources")
    assert sources.status_code == 200
    assert sources.json()[0]["name"] == "sample_orders"

    source_detail = client.get(f"/api/sources/{payload['source']['id']}")
    assert source_detail.status_code == 200
    assert source_detail.json()["dataset_id"] == payload["dataset"]["id"]

    catalog = client.get("/api/catalog/datasets")
    assert catalog.status_code == 200
    assert catalog.json()[0]["id"] == payload["dataset"]["id"]

    dataset_detail = client.get(f"/api/catalog/datasets/{payload['dataset']['id']}")
    assert dataset_detail.status_code == 200
    assert dataset_detail.json()["sample"][1]["customer"] == "Lee"
    assert dataset_detail.json()["trust_status"] == "Draft"


def test_catalog_dataset_can_be_published_when_all_trust_gates_pass(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    source_response = client.post(
        "/api/sources",
        json={"name": "trusted_orders", "type": "csv", "path": "samples/orders.csv"},
    )
    assert source_response.status_code == 201
    dataset_id = source_response.json()["dataset"]["id"]

    response = client.post(
        f"/api/catalog/datasets/{dataset_id}/trust-gate",
        json={
            "owner": "data-team",
            "passed_gates": ["schema", "quality", "pii", "owner", "policy", "approval"],
        },
    )

    assert response.status_code == 200
    gate = response.json()
    assert gate["dataset_id"] == dataset_id
    assert gate["status"] == "Trusted"
    assert gate["failed_gates"] == []
    assert "all required trust gates passed" in gate["reasons"]

    dataset = client.get(f"/api/catalog/datasets/{dataset_id}").json()
    assert dataset["owner"] == "data-team"
    assert dataset["trust_status"] == "Trusted"
    assert dataset["trust_gate_result"]["id"] == gate["id"]


def test_catalog_dataset_stays_verifying_when_required_trust_gates_are_pending(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    source_response = client.post(
        "/api/sources",
        json={"name": "verifying_orders", "type": "csv", "path": "samples/orders.csv"},
    )
    assert source_response.status_code == 201
    dataset_id = source_response.json()["dataset"]["id"]

    response = client.post(
        f"/api/catalog/datasets/{dataset_id}/trust-gate",
        json={"owner": "data-team", "passed_gates": ["schema", "quality"]},
    )

    assert response.status_code == 200
    gate = response.json()
    assert gate["status"] == "Verifying"
    assert gate["failed_gates"] == []
    assert "pii gate is pending" in gate["reasons"]

    dataset = client.get(f"/api/catalog/datasets/{dataset_id}").json()
    assert dataset["trust_status"] == "Verifying"


def test_catalog_dataset_stays_blocked_when_required_trust_gate_fails(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    source_response = client.post(
        "/api/sources",
        json={"name": "blocked_orders", "type": "csv", "path": "samples/orders.csv"},
    )
    assert source_response.status_code == 201
    dataset_id = source_response.json()["dataset"]["id"]

    response = client.post(
        f"/api/catalog/datasets/{dataset_id}/trust-gate",
        json={"owner": "data-team", "passed_gates": ["schema", "quality"], "failed_gates": ["pii"]},
    )

    assert response.status_code == 200
    gate = response.json()
    assert gate["status"] == "Blocked"
    assert gate["failed_gates"] == ["pii"]
    assert "pii gate failed" in gate["reasons"]

    dataset = client.get(f"/api/catalog/datasets/{dataset_id}").json()
    assert dataset["trust_status"] == "Blocked"


def test_trust_gate_returns_not_found_for_missing_dataset(tmp_path: Path) -> None:
    client = make_client(tmp_path)

    response = client.post(
        "/api/catalog/datasets/not-found/trust-gate",
        json={"passed_gates": ["schema"]},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Catalog dataset not found"


def test_register_missing_csv_returns_validation_error(tmp_path: Path) -> None:
    client = make_client(tmp_path)

    response = client.post(
        "/api/sources",
        json={"name": "missing_orders", "type": "csv", "path": "samples/missing.csv"},
    )

    assert response.status_code == 400
    assert "CSV file not found" in response.json()["detail"]
    assert client.get("/api/catalog/datasets").json() == []


def test_register_jsonl_source_and_build_recommendations(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    jsonl_path = tmp_path / "source_events.jsonl"
    jsonl_path.write_text(
        "\n".join(
            [
                '{"entityId":"e1","category":"alpha","amount":10.5,"eventTime":"2026-06-25T00:00:00Z","attributes":{"region":"kr"},"events":[{"name":"open"}]}',
                '{"entityId":"e2","category":"beta","amount":20,"eventTime":"2026-06-25T01:00:00Z","attributes":{"region":"us"},"events":[]}',
                '{"entityId":"e3","category":"alpha","amount":0,"eventTime":"2026-06-25T02:00:00Z","attributes":{"region":"kr"},"events":[{"name":"close"}]}',
            ]
        ),
        encoding="utf-8",
    )

    response = client.post(
        "/api/sources",
        json={"name": "json_bronze", "type": "json", "path": str(jsonl_path)},
    )

    assert response.status_code == 201
    payload = response.json()
    dataset = payload["dataset"]
    assert dataset["source_type"] == "json"
    assert dataset["row_count"] == 3
    assert len(dataset["sample"]) == 3
    schema_names = {column["name"] for column in dataset["schema"]}
    assert {"entity_id", "category", "amount", "event_time", "attributes_region", "events_json"}.issubset(
        schema_names
    )

    recommendation_response = client.get(f"/api/catalog/datasets/{dataset['id']}/json-recommendations")

    assert recommendation_response.status_code == 200
    bundle = recommendation_response.json()
    assert bundle["profile"]["format"] == "jsonl"
    assert bundle["profile"]["record_path"] == "$lines[*]"
    silver = bundle["silver_recommendation"]
    assert silver["target_dataset_id"] == "json_bronze_silver"
    entity_column = next(column for column in silver["columns"] if column["source_path"] == "entityId")
    assert entity_column["target_name"] == "entity_id"
    assert entity_column["include"] is True
    array_decision = next(decision for decision in silver["needs_user_decision"] if decision["source_path"] == "events[]")
    assert array_decision["default"] == "keep_json"
    gold = bundle["gold_recommendation"]
    assert gold["metrics"][0]["name"] == "row_count"
    assert bundle["bronze_catalog_metadata"]["layer"] == "bronze"
    assert bundle["silver_catalog_metadata"]["layer"] == "silver"
    assert bundle["gold_catalog_metadata"]["layer"] == "gold"


def test_large_jsonl_source_uses_bounded_sample_scan(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    jsonl_path = tmp_path / "large_events.jsonl"
    with jsonl_path.open("w", encoding="utf-8") as jsonl_file:
        for index in range(1105):
            jsonl_file.write(f'{{"id":"r{index}","score":{index % 5},"payload":{{"nested":true}}}}\n')

    response = client.post(
        "/api/sources",
        json={"name": "large_json", "type": "json", "path": str(jsonl_path)},
    )

    assert response.status_code == 201
    dataset = response.json()["dataset"]
    assert dataset["row_count"] == 1000
    assert len(dataset["sample"]) == 10

    bundle = client.get(f"/api/catalog/datasets/{dataset['id']}/json-recommendations").json()
    assert bundle["profile"]["sample_limited"] is True
    assert bundle["profile"]["sampled_rows"] == 1000


def test_jsonl_source_at_scan_limit_is_not_marked_limited(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    jsonl_path = tmp_path / "exact_events.jsonl"
    with jsonl_path.open("w", encoding="utf-8") as jsonl_file:
        for index in range(1000):
            jsonl_file.write(f'{{"id":"r{index}","score":{index % 5}}}\n')

    response = client.post(
        "/api/sources",
        json={"name": "exact_json", "type": "json", "path": str(jsonl_path)},
    )

    assert response.status_code == 201
    dataset = response.json()["dataset"]
    assert dataset["row_count"] == 1000

    bundle = client.get(f"/api/catalog/datasets/{dataset['id']}/json-recommendations").json()
    assert bundle["profile"]["sample_limited"] is False


def test_json_object_source_detects_nested_record_collection(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    json_path = tmp_path / "unknown_shape.json"
    json_path.write_text(
        """
        {
          "meta": {"source": "fixture"},
          "items": [
            {"product": {"id": "p1"}, "amount": "10.5", "createdAt": "2026-06-25"},
            {"product": {"id": "p2"}, "amount": "9.0", "createdAt": "2026-06-26"}
          ]
        }
        """,
        encoding="utf-8",
    )

    response = client.post(
        "/api/sources",
        json={"name": "unknown_json", "type": "json", "path": str(json_path)},
    )

    assert response.status_code == 201
    dataset = response.json()["dataset"]
    schema_names = {column["name"] for column in dataset["schema"]}
    assert {"product_id", "amount", "created_at"}.issubset(schema_names)

    bundle = client.get(f"/api/catalog/datasets/{dataset['id']}/json-recommendations").json()
    assert bundle["profile"]["record_path"] == "$.items[*]"
    created_column = next(column for column in bundle["silver_recommendation"]["columns"] if column["target_name"] == "created_at")
    assert created_column["target_type"] == "timestamp"


def test_json_array_source_supports_pretty_printed_top_level_array(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    json_path = tmp_path / "pretty_array.json"
    json_path.write_text(
        """
        [
          {"id": "r1", "score": 5},
          {"id": "r2", "score": 4}
        ]
        """,
        encoding="utf-8",
    )

    response = client.post(
        "/api/sources",
        json={"name": "pretty_json_array", "type": "json", "path": str(json_path)},
    )

    assert response.status_code == 201
    dataset = response.json()["dataset"]
    assert dataset["row_count"] == 2
    assert dataset["sample"][0]["id"] == "r1"

    bundle = client.get(f"/api/catalog/datasets/{dataset['id']}/json-recommendations").json()
    assert bundle["profile"]["format"] == "json_array"
    assert bundle["profile"]["record_path"] == "$[*]"


def test_json_source_keeps_distinct_columns_when_normalized_names_collide(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    json_path = tmp_path / "colliding_names.json"
    json_path.write_text('{"items":[{"foo-bar":1,"foo_bar":2}]}', encoding="utf-8")

    response = client.post(
        "/api/sources",
        json={"name": "colliding_json", "type": "json", "path": str(json_path)},
    )

    assert response.status_code == 201
    dataset = response.json()["dataset"]
    schema_names = [column["name"] for column in dataset["schema"]]
    assert "foo_bar" in schema_names
    assert "foo_bar_2" in schema_names
    assert dataset["sample"][0]["foo_bar"] == 1
    assert dataset["sample"][0]["foo_bar_2"] == 2


def test_json_source_rejects_truncated_top_level_array(tmp_path: Path) -> None:
    client = make_client(tmp_path)
    json_path = tmp_path / "truncated.json"
    json_path.write_text('[{"id":1}', encoding="utf-8")

    response = client.post(
        "/api/sources",
        json={"name": "truncated_json", "type": "json", "path": str(json_path)},
    )

    assert response.status_code == 400
    assert "missing closing bracket" in response.json()["detail"]
