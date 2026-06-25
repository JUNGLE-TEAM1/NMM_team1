from fastapi import APIRouter

from app.domain.ai_query import AIQueryRequest, AIQueryResult
from app.services.ai_query import Week2AIQueryService


def create_week2_ai_query_router(ai_query_service: Week2AIQueryService) -> APIRouter:
    router = APIRouter(prefix="/api/week2")

    @router.post("/ai/query", response_model=AIQueryResult)
    def answer_ai_query(request: AIQueryRequest) -> AIQueryResult:
        return ai_query_service.answer(request.question)

    return router
