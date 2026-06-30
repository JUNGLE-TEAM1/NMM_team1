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


def dashboard_card_payload(title: str = "위험 상품 Top 10") -> dict:
    return {
        "title": title,
        "question": "위험 점수가 높은 상품 알려줘",
        "sql": "SELECT product_id, risk_score FROM gold_product_health ORDER BY risk_score DESC LIMIT 10",
        "chart_spec": {
            "type": "bar",
            "x": "product_id",
            "y": "risk_score",
            "title": title,
        },
        "dataset_id": "dataset_product_health_gold",
    }


def test_create_list_and_read_dashboard_card() -> None:
    client = make_client()

    response = client.post("/api/week2/dashboard/cards", json=dashboard_card_payload())

    assert response.status_code == 201
    card = response.json()
    assert card["dashboard_card_id"]
    assert card["title"] == "위험 상품 Top 10"
    assert card["question"] == "위험 점수가 높은 상품 알려줘"
    assert card["sql"].startswith("SELECT product_id")
    assert card["chart_spec"] == dashboard_card_payload()["chart_spec"]
    assert card["dataset_id"] == "dataset_product_health_gold"
    assert card["created_at"]

    list_response = client.get("/api/week2/dashboard/cards")
    assert list_response.status_code == 200
    assert list_response.json()[0] == card

    detail_response = client.get(f"/api/week2/dashboard/cards/{card['dashboard_card_id']}")
    assert detail_response.status_code == 200
    assert detail_response.json() == card


def test_list_dashboard_cards_orders_latest_first() -> None:
    client = make_client()

    first = client.post("/api/week2/dashboard/cards", json=dashboard_card_payload("첫 번째 카드")).json()
    second = client.post("/api/week2/dashboard/cards", json=dashboard_card_payload("두 번째 카드")).json()

    response = client.get("/api/week2/dashboard/cards")

    assert response.status_code == 200
    cards = response.json()
    assert [card["dashboard_card_id"] for card in cards] == [
        second["dashboard_card_id"],
        first["dashboard_card_id"],
    ]


def test_get_missing_dashboard_card_returns_not_found() -> None:
    client = make_client()

    response = client.get("/api/week2/dashboard/cards/not-found")

    assert response.status_code == 404
    assert response.json()["detail"] == "Dashboard card not found"


def test_create_dashboard_card_rejects_invalid_chart_spec() -> None:
    client = make_client()
    payload = dashboard_card_payload()
    payload["chart_spec"] = {"type": "bar", "x": "product_id"}

    response = client.post("/api/week2/dashboard/cards", json=payload)

    assert response.status_code == 422
    assert "chart_spec missing required fields" in response.text
