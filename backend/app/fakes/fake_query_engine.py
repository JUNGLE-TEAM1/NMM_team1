from app.domain.target_contracts import (
    PolicyDecision,
    PolicyDecisionResult,
    QueryExecution,
    QueryExecutionStatus,
)


class FakeQueryEngine:
    def execute(
        self,
        dataset_id: str,
        sql_or_plan: str,
        policy_decision: PolicyDecision,
    ) -> QueryExecution:
        status = QueryExecutionStatus.SUCCEEDED
        if policy_decision.decision is PolicyDecisionResult.DENY:
            status = QueryExecutionStatus.DENIED

        return QueryExecution(
            dataset_id=dataset_id,
            status=status,
            sql_or_plan=sql_or_plan,
            policy_decision_id=policy_decision.id,
            evidence_refs=[policy_decision.id],
        )
