from app.domain.target_contracts import Dataset, DatasetStatus, TrustGateResult


class CatalogTrustService:
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
            required_gates=["schema", "quality", "policy"],
            reasons=["thin runtime core draft fixture"],
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
