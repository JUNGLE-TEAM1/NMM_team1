from typing import Protocol

from app.domain.target_contracts import PolicyDecision


class PolicyEngine(Protocol):
    def decide(self, actor: str, action: str, resource_ref: str) -> PolicyDecision: ...
