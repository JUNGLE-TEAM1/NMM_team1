import tempfile
from io import BytesIO
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq
from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.services import external_connection_discovery


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    store = SQLiteMetadataStore(f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}")
    app = create_app(store)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def test_inspect_local_jsonl_file_returns_schema_and_bytes() -> None:
    client = make_client()

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "local_file",
            "resource": "backend/samples/product_health_reviews_seed.jsonl",
            "resource_label": "file_path",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["detected_format"] == "JSONL"
    assert result["detected_dataset"] == "Product reviews / VOC"
    assert result["bytes"] > 0
    assert result["row_count_status"] == "not_measured"
    assert {"name": "review_id", "type": "string"} in result["schema_preview"]
    assert len(result["sample_rows"]) > 0


def test_inspect_missing_local_path_returns_bad_request() -> None:
    client = make_client()

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "local_file",
            "resource": "data/does-not-exist/missing.jsonl",
            "resource_label": "file_path",
        },
    )

    assert response.status_code == 400
    assert "Local path" in response.json()["detail"]


def test_inspect_prepared_dataset_connector_is_not_accepted() -> None:
    client = make_client()

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "prepared_dataset",
            "resource": "data/local_sources/product_health/raw",
            "resource_label": "dataset_folder",
        },
    )

    assert response.status_code == 422


def test_inspect_local_parquet_folder_returns_file_count_and_schema(tmp_path: Path) -> None:
    parquet_path = tmp_path / "sample.parquet"
    table = pa.table({"product_id": ["p1", "p2"], "risk_score": [0.7, 0.2]})
    pq.write_table(table, parquet_path)
    client = make_client()

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "local_folder",
            "resource": str(tmp_path),
            "resource_label": "folder_path",
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["detected_format"] == "Parquet directory"
    assert result["file_count"] == 1
    assert result["row_count"] == 2
    assert result["row_count_status"] == "metadata"
    assert result["schema_preview"][0]["name"] == "product_id"


def test_inspect_postgres_table_returns_schema_and_sample(monkeypatch) -> None:
    client = make_client()
    monkeypatch.setenv("ASKLAKE_TEST_POSTGRES_USER", "asklake")
    monkeypatch.setenv("ASKLAKE_TEST_POSTGRES_PASSWORD", "secret")
    monkeypatch.setattr(external_connection_discovery, "psycopg", FakePsycopg)

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "postgres",
            "resource": "127.0.0.1:15432/asklake",
            "resource_label": "postgres_database",
            "secret_refs": {"username": "ASKLAKE_TEST_POSTGRES_USER", "password": "ASKLAKE_TEST_POSTGRES_PASSWORD"},
            "options": {"scope": "public.connection_smoke"},
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["detected_format"] == "PostgreSQL table"
    assert result["schema_preview"] == [{"name": "id", "type": "integer"}, {"name": "label", "type": "text"}]
    assert result["sample_rows"] == [{"id": 1, "label": "postgres_ok"}]


def test_inspect_mongodb_collection_returns_schema_and_sample(monkeypatch) -> None:
    client = make_client()
    monkeypatch.setenv("ASKLAKE_TEST_MONGO_USER", "asklake")
    monkeypatch.setenv("ASKLAKE_TEST_MONGO_PASSWORD", "secret")
    monkeypatch.setattr(external_connection_discovery, "pymongo", FakePymongo)

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "mongodb",
            "resource": "mongodb://127.0.0.1:27017/admin",
            "resource_label": "mongo_uri",
            "secret_refs": {"username": "ASKLAKE_TEST_MONGO_USER", "password": "ASKLAKE_TEST_MONGO_PASSWORD"},
            "options": {"scope": "asklake.connection_smoke"},
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["detected_format"] == "MongoDB collection"
    assert {"name": "label", "type": "string"} in result["schema_preview"]
    assert result["sample_rows"] == [{"label": "mongo_ok", "count": 1}]


def test_inspect_s3_jsonl_object_returns_schema_and_sample(monkeypatch) -> None:
    client = make_client()
    monkeypatch.setenv("ASKLAKE_TEST_MINIO_ACCESS_KEY", "minio")
    monkeypatch.setenv("ASKLAKE_TEST_MINIO_SECRET_KEY", "secret")
    monkeypatch.setattr(external_connection_discovery, "boto3", FakeBoto3)

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "s3",
            "resource": "http://127.0.0.1:9000/asklake-demo",
            "resource_label": "s3_bucket_endpoint",
            "secret_refs": {
                "access_key": "ASKLAKE_TEST_MINIO_ACCESS_KEY",
                "secret_key": "ASKLAKE_TEST_MINIO_SECRET_KEY",
            },
            "options": {"scope": "product_health/source/s3_events.jsonl"},
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["detected_format"] == "S3 JSONL"
    assert {"name": "quantity", "type": "integer"} in result["schema_preview"]
    assert result["bytes"] > 0


def test_inspect_kafka_topic_returns_schema_and_sample(monkeypatch) -> None:
    client = make_client()
    monkeypatch.setattr(external_connection_discovery, "KafkaConsumer", FakeKafkaConsumer)

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "kafka",
            "resource": "127.0.0.1:29092",
            "resource_label": "bootstrap_servers",
            "secret_refs": {},
            "options": {"scope": "asklake-connection-smoke"},
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["detected_format"] == "Kafka JSON message"
    assert {"name": "event_id", "type": "string"} in result["schema_preview"]
    assert result["row_count_status"] == "sample_only"


def test_inspect_runtime_connector_rejects_raw_secret(monkeypatch) -> None:
    client = make_client()
    monkeypatch.setattr(external_connection_discovery, "boto3", FakeBoto3)

    response = client.post(
        "/api/external-connections/inspect",
        json={
            "connector_type": "s3",
            "resource": "http://127.0.0.1:9000/asklake-demo",
            "secret_refs": {
                "access_key": "ASKLAKE_TEST_MINIO_ACCESS_KEY",
                "secret_key": "ASKLAKE_TEST_MINIO_SECRET_KEY",
            },
            "options": {"scope": "product_health/source/s3_events.jsonl", "secret_key": "plain-text"},
        },
    )

    assert response.status_code == 400
    assert "raw credential" in response.json()["detail"]
    assert "plain-text" not in response.text


class FakePsycopg:
    @staticmethod
    def connect(**kwargs):
        assert kwargs["user"] == "asklake"
        assert kwargs["password"] == "secret"
        return FakePostgresConnection()


class FakePostgresConnection:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def cursor(self):
        return FakePostgresCursor()


class FakePostgresDescription:
    def __init__(self, name: str):
        self.name = name


class FakePostgresCursor:
    def __init__(self):
        self.query_count = 0
        self.description = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def execute(self, query, params=None):
        self.query_count += 1
        if "select *" in str(query):
            self.description = [FakePostgresDescription("id"), FakePostgresDescription("label")]

    def fetchall(self):
        if self.query_count == 1:
            return [("id", "integer"), ("label", "text")]
        return [(1, "postgres_ok")]

    def fetchone(self):
        return (1,)


class FakePymongo:
    @staticmethod
    def MongoClient(*args, **kwargs):
        assert kwargs["username"] == "asklake"
        assert kwargs["password"] == "secret"
        return FakeMongoClient()


class FakeMongoClient:
    def __getitem__(self, database_name):
        return FakeMongoDatabase()

    def close(self):
        return None


class FakeMongoDatabase:
    def __getitem__(self, collection_name):
        return FakeMongoCollection()


class FakeMongoCollection:
    def find(self, query, projection):
        return FakeMongoCursor([{"label": "mongo_ok", "count": 1}])

    def estimated_document_count(self):
        return 1


class FakeMongoCursor:
    def __init__(self, rows):
        self.rows = rows

    def limit(self, size):
        return self.rows[:size]


class FakeBoto3:
    @staticmethod
    def client(*args, **kwargs):
        assert kwargs["aws_access_key_id"] == "minio"
        assert kwargs["aws_secret_access_key"] == "secret"
        return FakeS3Client()


class FakeS3Client:
    def get_object(self, Bucket, Key):
        body = b'{"event_id":"s3_evt_001","quantity":1}\n'
        return {"Body": BytesIO(body)}


class FakeKafkaMessage:
    def __init__(self, value):
        self.value = value


class FakeKafkaConsumer:
    def __init__(self, *args, **kwargs):
        self.messages = [
            FakeKafkaMessage({"event_id": "kafka_evt_001", "quantity": 1}),
        ]

    def __iter__(self):
        return iter(self.messages)

    def close(self):
        return None
