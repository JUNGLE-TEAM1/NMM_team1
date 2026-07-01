from typing import Literal

from pydantic import BaseModel, Field

from app.domain.ai_query import GuardrailResult, QueryEvidence, QueryResult, RetrievalTraceItem


class LLMHealth(BaseModel):
    provider: str
    status: Literal["ok", "unavailable"]
    external_calls_enabled: bool = False


class LLMAnswer(BaseModel):
    summary: str
    source: Literal["template", "external"] = "template"
    provider: str = "template"
    fallback_used: bool = False
    fallback_reason: str | None = None
    used_evidence_indexes: list[int] = Field(default_factory=list)


class LLMAnswerContext(BaseModel):
    question: str
    route: Literal["sql", "rag", "hybrid", "unsupported"]
    intent: str
    status: str
    sql: str
    query_result: QueryResult
    rows: list[dict[str, object]]
    evidence: list[QueryEvidence] = Field(default_factory=list)
    retrieval_trace: list[RetrievalTraceItem] = Field(default_factory=list)
    guardrail: GuardrailResult
