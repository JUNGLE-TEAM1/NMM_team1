from typing import Protocol

from app.domain.target_contracts import PolicyDecision, QueryExecution


class QueryEngine(Protocol):
    def execute(
        self,
        dataset_id: str,
        sql_or_plan: str,
        policy_decision: PolicyDecision,
    ) -> QueryExecution: ...
