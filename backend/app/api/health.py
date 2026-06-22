from fastapi import APIRouter

router = APIRouter()


def health_payload() -> dict[str, str]:
    return {
        "service": "asklake-backend",
        "status": "ok",
        "app": "AskLake",
    }


@router.get("/health")
def health() -> dict[str, str]:
    return health_payload()


@router.get("/api/health")
def api_health() -> dict[str, str]:
    return health_payload()
