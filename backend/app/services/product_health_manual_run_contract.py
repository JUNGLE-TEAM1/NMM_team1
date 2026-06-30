import json
from pathlib import Path
from typing import Any

from app.services.product_health_processing_template import CONTRACT_PATHS, discover_contract_root


MANUAL_RUN_CONTRACT_VERSION = "product_health_manual_run_result_v1"
SOURCE_SNAPSHOT_CONTRACT_VERSION = "source_snapshot_artifact_v1"
PRODUCT_HEALTH_PIPELINE_TYPE = "product_health_gold_pipeline"
PRODUCT_HEALTH_EXECUTION_PENDING = "pending_product_health_execution"


class ProductHealthManualRunContractService:
    """Product Health Target Dataset run 결과에 붙일 downstream handoff 계약을 만든다."""

    def __init__(self, root: Path | None = None) -> None:
        self.root = root or discover_contract_root()

    def applies_to(self, target_dataset: dict[str, Any]) -> bool:
        process_rule = target_dataset.get("process_rule") or {}
        return process_rule.get("type") == PRODUCT_HEALTH_PIPELINE_TYPE

    def build_contract(
        self,
        execution_result: dict[str, Any],
        target_dataset: dict[str, Any],
    ) -> dict[str, Any]:
        process_rule = target_dataset.get("process_rule") or {}
        gold_contract = self._load_contract("gold_contract")
        schema_definition = self._load_contract("schema_definition")
        transform_spec = self._load_contract("transform_spec")
        catalog_fixture = self._load_optional_contract("product_health_catalog_metadata.sample.json")

        dataset_id = (
            nested_value(process_rule, "final_output", "dataset_id")
            or process_rule.get("target_dataset")
            or transform_spec.get("target_dataset")
            or gold_contract.get("dataset_id")
            or target_dataset.get("id")
        )
        query_table = (
            nested_value(process_rule, "final_output", "query_table")
            or process_rule.get("query_table")
            or transform_spec.get("target_table")
            or gold_contract.get("table_name")
        )
        schema_version = (
            gold_contract.get("schema_version")
            or schema_definition.get("schema_version")
            or nested_value(catalog_fixture, "schema", "schema_version")
        )
        output_schema = normalized_output_schema(gold_contract, schema_definition, process_rule)
        quality_rules = process_rule.get("quality_rules") or transform_spec.get("quality_rules") or gold_contract.get("quality_rules") or []
        source_mappings = target_dataset.get("source_mappings") or process_rule.get("source_mappings") or []
        input_snapshots = [snapshot_input_contract(mapping) for mapping in source_mappings]
        transform_steps = transform_step_ids(process_rule, transform_spec)

        return {
            "contract_version": MANUAL_RUN_CONTRACT_VERSION,
            "status": PRODUCT_HEALTH_EXECUTION_PENDING,
            "status_reason": "PR 5A fixes the result contract only; PR 5B fills snapshot/output values during real execution.",
            "source_snapshot_contract_version": SOURCE_SNAPSHOT_CONTRACT_VERSION,
            "target_dataset": {
                "target_dataset_id": target_dataset.get("id"),
                "dataset_id": dataset_id,
                "name": target_dataset.get("name"),
                "query_table": query_table,
                "layer": "gold",
                "process_rule_type": process_rule.get("type"),
                "process_rule_mode": process_rule.get("mode"),
            },
            "source_snapshot_inputs": input_snapshots,
            "gold_output": {
                "dataset_id": dataset_id,
                "query_table": query_table,
                "layer": "gold",
                "format": "parquet",
                "storage_uri": None,
                "local_fallback_path": None,
                "row_count": None,
                "bytes": None,
                "schema_version": schema_version,
                "contract_version": gold_contract.get("version"),
                "schema": output_schema,
                "status": PRODUCT_HEALTH_EXECUTION_PENDING,
            },
            "quality_results": pending_quality_results(quality_rules),
            "lineage": {
                "pipeline_id": gold_contract.get("pipeline_id") or transform_spec.get("pipeline_id"),
                "input_source_dataset_ids": [snapshot["source_dataset_id"] for snapshot in input_snapshots],
                "input_snapshot_ids": [],
                "source_ids": [snapshot["source_id"] for snapshot in input_snapshots if snapshot.get("source_id")],
                "transform_steps": transform_steps,
                "output_dataset_id": dataset_id,
                "query_table": query_table,
                "runtime_output_scope": "product_health_gold_output_pending",
            },
            "catalog_payload": catalog_payload_contract(
                catalog_fixture=catalog_fixture,
                gold_contract=gold_contract,
                schema_version=schema_version,
                output_schema=output_schema,
                dataset_id=str(dataset_id),
                target_name=str(target_dataset.get("name") or dataset_id),
                query_table=str(query_table),
                execution_result=execution_result,
                source_snapshots=input_snapshots,
                transform_steps=transform_steps,
            ),
            "error": None,
        }

    def _load_contract(self, name: str) -> dict[str, Any]:
        path = self.root / CONTRACT_PATHS[name]
        return load_json_object(path)

    def _load_optional_contract(self, relative_path: str) -> dict[str, Any]:
        path = self.root / "contracts" / relative_path
        if not path.exists():
            return {}
        return load_json_object(path)


def load_json_object(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"Contract must be a JSON object: {path}")
    return payload


def nested_value(payload: dict[str, Any], *keys: str) -> Any:
    current: Any = payload
    for key in keys:
        if not isinstance(current, dict):
            return None
        current = current.get(key)
    return current


def normalized_output_schema(
    gold_contract: dict[str, Any],
    schema_definition: dict[str, Any],
    process_rule: dict[str, Any],
) -> list[dict[str, Any]]:
    output_schema = gold_contract.get("output_schema") or process_rule.get("output_schema") or schema_definition.get("fields") or []
    normalized = []
    for field in output_schema:
        if not isinstance(field, dict):
            continue
        name = field.get("name") or field.get("path")
        if not name:
            continue
        normalized.append(
            {
                "name": str(name),
                "type": str(field.get("type", "string")),
                "nullable": bool(field.get("nullable", True)),
                **({"semantic_role": field["semantic_role"]} if field.get("semantic_role") else {}),
            }
        )
    return normalized


def snapshot_input_contract(mapping: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_dataset_id": mapping.get("source_dataset_id"),
        "source_dataset_name": mapping.get("source_dataset_name"),
        "source_type": mapping.get("source_type"),
        "role": mapping.get("role"),
        "source_id": mapping.get("source_id"),
        "required_snapshot_contract": SOURCE_SNAPSHOT_CONTRACT_VERSION,
        "snapshot_lookup": "latest_successful_by_source_dataset_id",
        "snapshot_status": "pending_source_snapshot",
        "artifact_uri": None,
        "format": "parquet",
        "row_count": None,
        "bytes": None,
        "schema": [],
    }


def pending_quality_results(quality_rules: list[dict[str, Any]]) -> list[dict[str, Any]]:
    results = []
    for rule in quality_rules:
        if not isinstance(rule, dict):
            continue
        rule_id = rule.get("id") or rule.get("rule_id")
        if not rule_id:
            continue
        results.append(
            {
                "rule_id": str(rule_id),
                "type": rule.get("type"),
                "severity": rule.get("severity", "blocking"),
                "status": "pending",
                "message": "PR 5B records the actual quality check result after Product Health execution.",
            }
        )
    return results


def transform_step_ids(process_rule: dict[str, Any], transform_spec: dict[str, Any]) -> list[str]:
    steps = process_rule.get("steps") or transform_spec.get("operations") or []
    step_ids = []
    for step in steps:
        if isinstance(step, dict) and step.get("id"):
            step_ids.append(str(step["id"]))
    return step_ids


def catalog_payload_contract(
    *,
    catalog_fixture: dict[str, Any],
    gold_contract: dict[str, Any],
    schema_version: str | None,
    output_schema: list[dict[str, Any]],
    dataset_id: str,
    target_name: str,
    query_table: str,
    execution_result: dict[str, Any],
    source_snapshots: list[dict[str, Any]],
    transform_steps: list[str],
) -> dict[str, Any]:
    allowed_columns = [field["name"] for field in output_schema]
    return {
        "contract": "CatalogMetadata",
        "producer": "PR 5 Product Health Manual Run",
        "consumer": "PR 6 Catalog registration",
        "status": PRODUCT_HEALTH_EXECUTION_PENDING,
        "dataset_id": dataset_id,
        "name": catalog_fixture.get("name") or target_name,
        "layer": "gold",
        "table_name": query_table,
        "query_table": query_table,
        "pipeline_id": gold_contract.get("pipeline_id"),
        "run_id": None,
        "source_run_id": execution_result.get("run_id"),
        "storage_uri": None,
        "format": "parquet",
        "schema": {
            "schema_version": schema_version,
            "fields": output_schema,
        },
        "metrics": {
            "row_count": None,
            "bytes": None,
            "quality_summary": "pending",
        },
        "lineage": {
            "source_snapshot_ids": [],
            "source_dataset_ids": [snapshot["source_dataset_id"] for snapshot in source_snapshots],
            "source_ids": [snapshot["source_id"] for snapshot in source_snapshots if snapshot.get("source_id")],
            "pipeline_id": gold_contract.get("pipeline_id"),
            "transform_steps": transform_steps,
        },
        "quality_results": [],
        "query": {
            "table_name": query_table,
            "allow_readonly_sql": True,
            "allowed_columns": allowed_columns,
            "default_limit": nested_value(catalog_fixture, "query", "default_limit") or 100,
            "timeout_seconds": nested_value(catalog_fixture, "query", "timeout_seconds") or 30,
            "canonical_demo_query": nested_value(catalog_fixture, "query", "canonical_demo_query"),
        },
        "m3_contract_refs": catalog_fixture.get("m3_contract_refs")
        or {
            "product_health_gold_contract_ref": CONTRACT_PATHS["gold_contract"],
            "risk_score_policy_ref": CONTRACT_PATHS["risk_score_policy"],
            "transform_spec_ref": CONTRACT_PATHS["transform_spec"],
            "schema_definition_ref": CONTRACT_PATHS["schema_definition"],
        },
    }
