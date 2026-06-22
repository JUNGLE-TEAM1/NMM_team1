from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_returns_ok_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "service": "asklake-backend",
        "status": "ok",
        "app": "AskLake",
    }


def test_api_health_returns_same_contract() -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
