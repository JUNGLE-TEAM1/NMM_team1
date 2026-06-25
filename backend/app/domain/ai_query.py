from typing import Any, Literal

from pydantic import BaseModel, Field

from app.domain.target_contracts import now_iso


class AIQueryRequest(BaseModel):
    question: str


class SelectedDataset(BaseModel):
    dataset_id: str
    name: str
    reason: str


class QueryEvidence(BaseModel):
    dataset_id: str
    run_id: str | None = None
    s3_uri: str | None = None
    freshness: str | None = None


class QueryColumn(BaseModel):
    name: str
    type: str


class QueryResult(BaseModel):
    engine: str
    sql: str
    columns: list[QueryColumn]
    rows: list[dict[str, Any]]
    row_count: int
    duration_ms: int
    executed_at: str = Field(default_factory=now_iso)


class GuardrailResult(BaseModel):
    validation_status: Literal["passed", "blocked", "failed"]
    failure_code: str | None = None
    failure_message: str | None = None


class ValidationResult(BaseModel):
    status: Literal["succeeded", "blocked", "failed"]
    guardrail: GuardrailResult

    @property
    def failure_code(self) -> str | None:
        return self.guardrail.failure_code

    @property
    def failure_message(self) -> str | None:
        return self.guardrail.failure_message


class DatasetSchema(BaseModel):
    table_name: str
    columns: list[QueryColumn]


class EngineHealth(BaseModel):
    engine: str
    status: Literal["ok", "unavailable"]
    checked_at: str = Field(default_factory=now_iso)


class SqlEngineContext(BaseModel):
    table_name: str
    allowed_columns: list[str]
    default_limit: int = 100
    timeout_seconds: int = 30
    column_types: dict[str, str] = Field(default_factory=dict)


class ChartSpec(BaseModel):
    type: str
    x: str
    y: str
    title: str


class AIQueryResult(BaseModel):
    contract: str = "AIQueryResult"
    producer: str = "M6"
    consumer: str = "M1"
    tenant_id: str
    question: str
    selected_datasets: list[SelectedDataset]
    evidence: list[QueryEvidence]
    status: Literal["succeeded", "blocked", "failed"]
    sql: str
    query_result: QueryResult
    rows: list[dict[str, Any]]
    summary: str
    chart_spec: ChartSpec
    guardrail: GuardrailResult
    executed_at: str = Field(default_factory=now_iso)
