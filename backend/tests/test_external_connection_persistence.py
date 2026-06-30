import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.domain.schemas import ColumnSchema, ExternalConnectionRecord, ExternalTableSchema


class FakeSchemaInspector:
    def inspect_table(
        self,
        connection: ExternalConnectionRecord,
        schema_name: str,
        table_name: str,
    ) -> ExternalTableSchema:
        return ExternalTableSchema(
            connection_id=connection.id,
            schema_name=schema_name,
            table_name=table_name,
            raw_scope=f"{schema_name}.{table_name}",
            schema_preview=[
                ColumnSchema(name="vendor_id", type="bigint"),
                ColumnSchema(name="tpep_pickup_datetime", type="timestamp without time zone"),
                ColumnSchema(name="airport_fee", type="double precision"),
            ],
            row_count_estimate=1000,
        )


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    store = SQLiteMetadataStore(f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}")
    app = create_app(store, schema_inspector=FakeSchemaInspector())
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def external_connection_payload(name: str = "Taxi PostgreSQL Connection") -> dict:
    return {
        "name": name,
        "connection_type": "postgres",
        "host": "localhost",
        "port": 55432,
        "database": "taxi_postgre",
        "username": "asklake",
        "password_secret_ref": "ASKLAKE_TAXI_POSTGRES_PASSWORD",
        "default_schema": "public",
        "default_table": "yellow_taxi_trips",
    }


def test_create_list_and_read_external_connection_metadata() -> None:
    client = make_client()

    response = client.post("/api/external-connections", json=external_connection_payload())

    assert response.status_code == 201
    source_connection = response.json()
    assert source_connection["id"]
    assert source_connection["name"] == "Taxi PostgreSQL Connection"
    assert source_connection["connection_type"] == "postgres"
    assert source_connection["host"] == "localhost"
    assert source_connection["port"] == 55432
    assert source_connection["database"] == "taxi_postgre"
    assert source_connection["username"] == "asklake"
    assert source_connection["password_secret_ref"] == "ASKLAKE_TAXI_POSTGRES_PASSWORD"
    assert source_connection["default_schema"] == "public"
    assert source_connection["default_table"] == "yellow_taxi_trips"
    assert source_connection["status"] == "metadata_ready"

    list_response = client.get("/api/external-connections")
    assert list_response.status_code == 200
    assert list_response.json()[0]["id"] == source_connection["id"]

    detail_response = client.get(f"/api/external-connections/{source_connection['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["database"] == "taxi_postgre"


def test_external_connection_rejects_duplicate_name() -> None:
    client = make_client()

    first_response = client.post("/api/external-connections", json=external_connection_payload())
    duplicate_response = client.post("/api/external-connections", json=external_connection_payload())

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert "External connection name already exists" in duplicate_response.json()["detail"]


def test_external_connection_schema_preview_uses_saved_connection() -> None:
    client = make_client()
    source_connection = client.post("/api/external-connections", json=external_connection_payload()).json()

    response = client.get(
        f"/api/external-connections/{source_connection['id']}/schemas/public/tables/yellow_taxi_trips"
    )

    assert response.status_code == 200
    schema = response.json()
    assert schema["connection_id"] == source_connection["id"]
    assert schema["raw_scope"] == "public.yellow_taxi_trips"
    assert schema["resource_label"] == "schema_table"
    assert schema["schema_preview"] == [
        {"name": "vendor_id", "type": "bigint"},
        {"name": "tpep_pickup_datetime", "type": "timestamp without time zone"},
        {"name": "airport_fee", "type": "double precision"},
    ]
    assert schema["row_count_estimate"] == 1000


def test_external_connection_test_reads_schema_without_saving_connection() -> None:
    client = make_client()

    response = client.post("/api/external-connections/test", json=external_connection_payload())

    assert response.status_code == 200
    schema = response.json()
    assert schema["connection_id"] == "connection_test_preview"
    assert schema["raw_scope"] == "public.yellow_taxi_trips"
    assert schema["schema_preview"][0] == {"name": "vendor_id", "type": "bigint"}

    list_response = client.get("/api/external-connections")
    assert list_response.status_code == 200
    assert list_response.json() == []
