from fastapi import APIRouter, HTTPException, status

from app.domain.schemas import DashboardCardCreate, DashboardCardRecord
from app.ports.metadata_store import MetadataStore


def create_dashboard_card_router(metadata_store: MetadataStore) -> APIRouter:
    router = APIRouter(prefix="/api/week2/dashboard")

    @router.post("/cards", response_model=DashboardCardRecord, status_code=status.HTTP_201_CREATED)
    def create_dashboard_card(card: DashboardCardCreate) -> DashboardCardRecord:
        return metadata_store.create_dashboard_card(card)

    @router.get("/cards", response_model=list[DashboardCardRecord])
    def list_dashboard_cards() -> list[DashboardCardRecord]:
        return metadata_store.list_dashboard_cards()

    @router.get("/cards/{dashboard_card_id}", response_model=DashboardCardRecord)
    def get_dashboard_card(dashboard_card_id: str) -> DashboardCardRecord:
        card = metadata_store.get_dashboard_card(dashboard_card_id)
        if card is None:
            raise HTTPException(status_code=404, detail="Dashboard card not found")
        return card

    return router
