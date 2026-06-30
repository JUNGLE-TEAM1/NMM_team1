import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.services import external_connection_runtime


def make_client() -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    store = SQLiteMetadataStore(f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}")
    app = create_app(store)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def test_external_connection_policy_enables_runtime_test_without_raw_secret_storage() -> None:
    client = make_client()

    response = client.get("/api/external-connections/credential-policy")

    assert response.status_code == 200
    policy = response.json()
    assert policy["connection_test_enabled"] is True
    assert policy["credential_storage"] == "secret_ref_only"
    assert policy["secret_value_storage"] == "forbidden"
    assert "password" in policy["forbidden_request_fields"]
    assert "raw_credential" in policy["forbidden_request_fields"]


def test_runtime_check_rejects_raw_secret_fields() -> None:
    client = make_client()

    response = client.post(
        "/api/external-connections/test",
        json={
            "connector_type": "postgres",
            "resource": "127.0.0.1:15432/asklake",
            "secret_refs": {"username": "ASKLAKE_TEST_POSTGRES_USER", "password": "ASKLAKE_TEST_POSTGRES_PASSWORD"},
            "options": {"password": "plain-text-password"},
        },
    )

    assert response.status_code == 400
    assert "raw credential" in response.json()["detail"]
    assert "plain-text-password" not in response.text


def test_runtime_check_rejects_secret_ref_that_does_not_look_like_env_name() -> None:
    client = make_client()

    response = client.post(
        "/api/external-connections/test",
        json={
            "connector_type": "mongodb",
            "resource": "mongodb://127.0.0.1:27017/admin",
            "secret_refs": {"username": "admin", "password": "plain-text-password"},
        },
    )

    assert response.status_code == 400
    assert "환경 변수 이름" in response.json()["detail"]
    assert "plain-text-password" not in response.text


def test_postgres_runtime_check_returns_redacted_success(monkeypatch) -> None:
    client = make_client()
    monkeypatch.setenv("ASKLAKE_TEST_POSTGRES_USER", "asklake")
    monkeypatch.setenv("ASKLAKE_TEST_POSTGRES_PASSWORD", "super-secret")
    monkeypatch.setattr(external_connection_runtime, "psycopg", FakePsycopg)

    response = client.post(
        "/api/external-connections/test",
        json={
            "connector_type": "postgres",
            "resource": "127.0.0.1:15432/asklake",
            "secret_refs": {"username": "ASKLAKE_TEST_POSTGRES_USER", "password": "ASKLAKE_TEST_POSTGRES_PASSWORD"},
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["status"] == "passed"
    assert result["secret_values_exposed"] is False
    assert result["schema_discovery_completed"] is False
    assert result["safe_summary"]["credential_refs_configured"] == ["username", "password"]
    assert "super-secret" not in response.text


def test_kafka_runtime_check_wraps_driver_error(monkeypatch) -> None:
    client = make_client()
    monkeypatch.setattr(external_connection_runtime, "KafkaAdminClient", FailingKafkaAdminClient)

    response = client.post(
        "/api/external-connections/test",
        json={
            "connector_type": "kafka",
            "resource": "127.0.0.1:29092",
            "secret_refs": {},
        },
    )

    assert response.status_code == 400
    assert "Kafka metadata check failed" in response.json()["detail"]
    assert "secret broker detail" not in response.text


class FakePsycopg:
    @staticmethod
    def connect(**kwargs):
        assert kwargs["user"] == "asklake"
        assert kwargs["password"] == "super-secret"
        return FakePostgresConnection()


class FakePostgresConnection:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def cursor(self):
        return FakeCursor()


class FakeCursor:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def execute(self, query: str) -> None:
        assert query == "select 1"

    def fetchone(self):
        return (1,)


class FailingKafkaAdminClient:
    def __init__(self, **kwargs):
        raise RuntimeError("secret broker detail")
