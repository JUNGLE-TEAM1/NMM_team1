from app.domain.target_contracts import Dataset, DatasetStatus, TrustGateResult


class CatalogTrustService:
    required_gates = ["schema", "quality", "pii", "owner", "policy", "approval"]

    def create_draft_dataset(
        self,
        dataset_id: str,
        name: str,
        source_ref: str,
        owner: str,
    ) -> tuple[Dataset, TrustGateResult]:
        gate = TrustGateResult(
            dataset_id=dataset_id,
            status=DatasetStatus.DRAFT,
            required_gates=self.required_gates,
            passed_gates=["schema"],
            failed_gates=["quality", "pii", "owner", "policy", "approval"],
            reasons=self._pending_reasons(["quality", "pii", "owner", "policy", "approval"]),
        )
        dataset = Dataset(
            id=dataset_id,
            name=name,
            source_ref=source_ref,
            schema_version="draft",
            status=DatasetStatus.DRAFT,
            owner=owner,
            trust_gate_result_id=gate.id,
        )
        return dataset, gate

    def evaluate_publish_gate(
        self,
        dataset_id: str,
        passed_gates: list[str],
        failed_gates: list[str] | None = None,
    ) -> TrustGateResult:
        unique_passed = [gate for gate in self.required_gates if gate in set(passed_gates)]
        unique_failed = [gate for gate in self.required_gates if gate in set(failed_gates or []) and gate not in set(unique_passed)]
        pending_gates = [
            gate for gate in self.required_gates if gate not in set(unique_passed) and gate not in set(unique_failed)
        ]
        if unique_failed:
            status = DatasetStatus.BLOCKED
            reasons = self._failed_reasons(unique_failed)
        elif not pending_gates:
            status = DatasetStatus.TRUSTED
            reasons = ["all required trust gates passed"]
        else:
            status = DatasetStatus.VERIFYING
            reasons = self._pending_reasons(pending_gates)
        return TrustGateResult(
            dataset_id=dataset_id,
            status=status,
            required_gates=self.required_gates,
            passed_gates=unique_passed,
            failed_gates=unique_failed,
            reasons=reasons,
        )

    def _pending_reasons(self, failed_gates: list[str]) -> list[str]:
        return [f"{gate} gate is pending" for gate in failed_gates]

    def _failed_reasons(self, failed_gates: list[str]) -> list[str]:
        return [f"{gate} gate failed" for gate in failed_gates]
