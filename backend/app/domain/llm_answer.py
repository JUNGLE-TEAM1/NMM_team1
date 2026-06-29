from typing import Any, Literal

from pydantic import BaseModel, Field

from app.domain.ai_query import GuardrailResult, QueryEvidence, QueryResult, RetrievalTraceItem


class LLMAnswerContext(BaseModel):
    question: str
    route: Literal["sql", "rag", "hybrid", "unsupported"]
    intent: str
    status: Literal["succeeded", "blocked", "failed"]
    sql: str
    query_result: QueryResult
    rows: list[dict[str, Any]]
    evidence: list[QueryEvidence]
    retrieval_trace: list[RetrievalTraceItem] = Field(default_factory=list)
    guardrail: GuardrailResult


class LLMAnswer(BaseModel):
    summary: str
    source: Literal["template", "external"] = "template"
    used_evidence_indexes: list[int] = Field(default_factory=list)


class LLMHealth(BaseModel):
    provider: str
    status: Literal["ok", "unavailable"]
    external_calls_enabled: bool = False
