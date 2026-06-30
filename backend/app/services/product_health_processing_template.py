import json
from pathlib import Path
from typing import Any


CONTRACT_PATHS = {
    "transform_spec": "contracts/product_health_transform_spec.sample.json",
    "gold_contract": "contracts/product_health_gold_contract.sample.json",
    "schema_definition": "contracts/product_health_schema_definition.sample.json",
    "risk_score_policy": "contracts/product_health_risk_score_policy.sample.json",
}

PHASE_BY_OPERATION_TYPE = {
    "source": "bronze",
    "normalize": "silver",
    "aggregate": "aggregate",
    "join": "join",
    "derive": "derive",
    "load": "load",
}

FLOW = ["bronze", "silver", "aggregate", "join", "derive", "load"]


class ProductHealthProcessingTemplateError(ValueError):
    pass


class ProductHealthProcessingTemplateService:
    """M3 Product Health contracts를 Target Dataset Processing UI용 template으로 변환한다."""

    def __init__(self, root: Path | None = None) -> None:
        self.root = root or discover_contract_root()

    def get_template(self) -> dict[str, Any]:
        transform_spec = self._load_contract("transform_spec")
        gold_contract = self._load_contract("gold_contract")
        schema_definition = self._load_contract("schema_definition")
        risk_score_policy = self._load_contract("risk_score_policy")

        steps = [operation_to_step(operation) for operation in transform_spec.get("operations", [])]
        if not steps:
            raise ProductHealthProcessingTemplateError("Product Health TransformSpec has no operations")

        output_schema = gold_contract.get("output_schema") or schema_definition.get("fields") or []
        metric_definitions = gold_contract.get("metric_definitions") or []
        quality_rules = transform_spec.get("quality_rules") or gold_contract.get("quality_rules") or []

        return {
            "id": "product_health_recommended_v1",
            "label": "Product Health 추천 템플릿",
            "description": "M3 TransformSpec 기반 bronze, silver, aggregate, join, derive, load 처리 흐름입니다.",
            "mode": "recommended_template",
            "template_version": transform_spec.get("version", "transform_product_health_gold_v1"),
            "target_dataset": transform_spec.get("target_dataset") or gold_contract.get("dataset_id"),
            "query_table": transform_spec.get("target_table") or gold_contract.get("table_name"),
            "flow": FLOW,
            "source_contracts": CONTRACT_PATHS,
            "source_requirements": gold_contract.get("source_requirements", []),
            "steps": steps,
            "quality_rules": quality_rules,
            "output_schema": output_schema,
            "metric_definitions": metric_definitions,
            "locked_fields": locked_fields(output_schema, risk_score_policy),
            "contract_claims": {
                "gold_contract_version": gold_contract.get("version"),
                "schema_version": schema_definition.get("schema_version"),
                "risk_score_policy_version": risk_score_policy.get("policy_version"),
                "risk_score_policy_status": risk_score_policy.get("policy_status"),
                "claim_boundary": gold_contract.get("claim_boundary"),
                "ownership_constraints": transform_spec.get("ownership_constraints"),
            },
        }

    def _load_contract(self, name: str) -> dict[str, Any]:
        relative_path = CONTRACT_PATHS[name]
        path = self.root / relative_path
        if not path.exists():
            raise ProductHealthProcessingTemplateError(f"Missing Product Health contract: {relative_path}")
        payload = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(payload, dict):
            raise ProductHealthProcessingTemplateError(f"Product Health contract must be a JSON object: {relative_path}")
        return payload


def discover_contract_root() -> Path:
    """local repo와 backend container 구조에서 contracts folder가 있는 root를 찾는다."""

    current_file = Path(__file__).resolve()
    for parent in current_file.parents:
        if (parent / CONTRACT_PATHS["transform_spec"]).exists():
            return parent
    return current_file.parents[3]


def operation_to_step(operation: dict[str, Any]) -> dict[str, Any]:
    operation_type = str(operation.get("type", "unknown"))
    phase = PHASE_BY_OPERATION_TYPE.get(operation_type, operation_type)
    step = {
        "id": operation.get("id"),
        "phase": phase,
        "operation_type": operation_type,
        "title": operation_title(operation),
        "description": operation_description(operation),
        "input_artifacts": input_artifacts(operation),
        "output_artifact": output_artifact(operation),
        "details": operation_details(operation),
    }
    return {key: value for key, value in step.items() if value not in (None, [], {})}


def operation_title(operation: dict[str, Any]) -> str:
    operation_id = str(operation.get("id", "unnamed_step"))
    operation_type = str(operation.get("type", "step"))
    if operation_type == "source":
        return f"Bronze read · {operation.get('source_id', operation_id)}"
    if operation_type == "normalize":
        return f"Silver normalize · {operation_id}"
    if operation_type == "aggregate":
        return f"Source aggregate · {operation_id}"
    if operation_type == "join":
        return "Product join · product_id union"
    if operation_type == "derive":
        return "Derive metrics · risk_score"
    if operation_type == "load":
        return f"Load Gold · {operation.get('query_table', operation_id)}"
    return operation_id


def operation_description(operation: dict[str, Any]) -> str:
    if operation.get("description"):
        return str(operation["description"])
    operation_type = operation.get("type")
    if operation_type == "source":
        required = ", ".join(operation.get("required_columns", []))
        return f"Bronze artifact를 만들고 required columns를 확인합니다: {required}."
    if operation_type == "normalize":
        return "Cast와 null/quarantine policy를 적용해 source별 silver artifact를 만듭니다."
    if operation_type == "aggregate":
        metrics = ", ".join(metric.get("name", "") for metric in operation.get("metrics", []))
        return f"Raw fact join 전에 product_id 기준 source-level metrics를 계산합니다: {metrics}."
    if operation_type == "join":
        return "source aggregate들을 product_id universe로 full outer join하고 product master dimensions를 우선 적용합니다."
    if operation_type == "derive":
        return "Gold output columns를 고정하고 승인 대상 risk_score policy를 적용할 위치를 표시합니다."
    if operation_type == "load":
        return "Gold layer artifact를 target dataset과 query table 위치에 load합니다."
    return ""


def input_artifacts(operation: dict[str, Any]) -> list[str]:
    values = []
    for key in ("input", "base"):
        if operation.get(key):
            values.append(str(operation[key]))
    if isinstance(operation.get("inputs"), list):
        values.extend(str(value) for value in operation["inputs"])
    if isinstance(operation.get("dimension_inputs"), list):
        values.extend(str(value) for value in operation["dimension_inputs"])
    if operation.get("source_id"):
        values.append(str(operation["source_id"]))
    return list(dict.fromkeys(values))


def output_artifact(operation: dict[str, Any]) -> str | None:
    if operation.get("output"):
        return str(operation["output"])
    if operation.get("target_dataset"):
        return str(operation["target_dataset"])
    return None


def operation_details(operation: dict[str, Any]) -> dict[str, Any]:
    detail_keys = [
        "source_id",
        "required_columns",
        "optional_columns",
        "required_for_row_universe",
        "casts",
        "null_policy",
        "group_by",
        "metrics",
        "join_type",
        "join_strategy",
        "keys",
        "dimension_priority",
        "expressions",
        "select_columns",
        "target_dataset",
        "layer",
        "query_table",
        "path_pattern",
    ]
    return {key: operation[key] for key in detail_keys if key in operation}


def locked_fields(output_schema: list[dict[str, Any]], risk_score_policy: dict[str, Any]) -> list[str]:
    fields = [str(field.get("name") or field.get("path")) for field in output_schema if field.get("name") or field.get("path")]
    locked = ["risk_score", "risk_score_coverage"]
    policy_output = risk_score_policy.get("output_field", {})
    if isinstance(policy_output, dict) and policy_output.get("name"):
        locked.append(str(policy_output["name"]))
    return list(dict.fromkeys([*fields, *locked]))
