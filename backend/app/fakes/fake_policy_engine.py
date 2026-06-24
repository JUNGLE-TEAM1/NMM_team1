from app.domain.target_contracts import PolicyDecision, PolicyDecisionResult


class FakePolicyEngine:
    def __init__(
        self,
        denied_resources: set[str] | None = None,
        masked_resources: dict[str, list[str]] | None = None,
    ) -> None:
        self.denied_resources = denied_resources or set()
        self.masked_resources = masked_resources or {}

    def decide(self, actor: str, action: str, resource_ref: str) -> PolicyDecision:
        if resource_ref in self.denied_resources:
            return PolicyDecision(
                actor=actor,
                action=action,
                resource_ref=resource_ref,
                decision=PolicyDecisionResult.DENY,
                reason="fixture deny",
            )
        if resource_ref in self.masked_resources:
            return PolicyDecision(
                actor=actor,
                action=action,
                resource_ref=resource_ref,
                decision=PolicyDecisionResult.MASK,
                masking=self.masked_resources[resource_ref],
                reason="fixture mask",
            )
        return PolicyDecision(
            actor=actor,
            action=action,
            resource_ref=resource_ref,
            decision=PolicyDecisionResult.ALLOW,
            reason="fixture allow",
        )
