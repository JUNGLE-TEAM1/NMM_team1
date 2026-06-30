from fastapi.testclient import TestClient

from app.core.app_factory import create_app
from app.services.week2_airflow_adapter import airflow_readiness


def test_airflow_readiness_reports_not_configured_without_secrets() -> None:
    readiness = airflow_readiness({})

    assert readiness["status"] == "not_configured"
    assert readiness["trigger_available"] is False
    assert readiness["fallback_available"] is True
    assert readiness["base_url"] is None
    assert readiness["dag_id"] == "asklake_week2_reviews"
    assert readiness["credential_values_exposed"] is False
    assert "password" not in readiness


def test_airflow_readiness_reports_configured_without_secret_values(tmp_path) -> None:
    readiness = airflow_readiness(
        {
            "ASKLAKE_WEEK2_AIRFLOW_BASE_URL": "http://airflow.local",
            "ASKLAKE_WEEK2_AIRFLOW_DAG_ID": "asklake_week2_reviews",
            "ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT": str(tmp_path),
            "ASKLAKE_WEEK2_AIRFLOW_USERNAME": "airflow",
            "ASKLAKE_WEEK2_AIRFLOW_PASSWORD": "secret",
            "ASKLAKE_WEEK2_AIRFLOW_MAX_POLLS": "1",
        }
    )

    assert readiness["status"] == "configured"
    assert readiness["trigger_available"] is True
    assert readiness["fallback_available"] is True
    assert readiness["base_url"] == "http://airflow.local"
    assert readiness["dag_id"] == "asklake_week2_reviews"
    assert readiness["result_root"] == str(tmp_path)
    assert readiness["result_root_exists"] is True
    assert readiness["username_configured"] is True
    assert readiness["password_configured"] is True
    assert readiness["credential_values_exposed"] is False
    assert "secret" not in str(readiness)


def test_airflow_readiness_route_is_read_only() -> None:
    client = TestClient(create_app())

    response = client.get("/api/week2/airflow/readiness")

    assert response.status_code == 200
    payload = response.json()
    assert "status" in payload
    assert payload["credential_values_exposed"] is False
