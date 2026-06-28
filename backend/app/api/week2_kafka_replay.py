from typing import Any

from fastapi import APIRouter, HTTPException

from app.services.week2_kafka_replay_evidence import (
    Week2KafkaReplayEvidenceNotFoundError,
    Week2KafkaReplayEvidenceService,
)


def create_week2_kafka_replay_router(
    evidence_service: Week2KafkaReplayEvidenceService,
) -> APIRouter:
    router = APIRouter(prefix="/api/week2/kafka-replay")

    @router.get("/health")
    def get_kafka_replay_health() -> dict[str, Any]:
        return evidence_service.health()

    @router.get("/runs")
    def list_kafka_replay_runs() -> dict[str, Any]:
        return {"runs": evidence_service.list_runs()}

    @router.get("/runs/{run_id}")
    def get_kafka_replay_run(run_id: str) -> dict[str, Any]:
        try:
            return evidence_service.get_run(run_id)
        except Week2KafkaReplayEvidenceNotFoundError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error

    return router
