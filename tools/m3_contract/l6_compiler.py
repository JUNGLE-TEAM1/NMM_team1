from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, with_header, write_json


SUPPORTED_ACTIONS = {
    "select",
    "rename",
    "cast",
    "parse_timestamp",
    "normalize_null",
    "flatten_struct",
    "explode_array",
    "json_string",
    "mask",
    "hash",
    "drop",
    "quarantine_if_invalid",
    "aggregate",
}


def build_l6(l0: dict[str, Any], l5: dict[str, Any], out_dir: Path, source_id: str, run_id: str) -> dict[str, Any]:
    """Compile L5 decisions into deterministic preview-only specs."""

    layer_dir = out_dir / "l6"
    ensure_dir(layer_dir)
    source_unit_ids = [unit["source_unit_id"] for unit in l0["source_units"]]
    unsupported = _unsupported_actions(l5)
    silver_operations = _silver_operations(l5["silver_decision"]["fields"])
    gold_operations = _gold_operations(l5["gold_decision"]["selected_gold_models"]) if l5["approval_state"]["gold"]["compile_allowed"] else []

    silver_spec = with_header(
        layer="l6",
        name="silver_transform_spec",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l6.silver_transform_spec.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L6",
            "artifact_type": "silver_transform_spec",
            "execution_owner": "M2",
            "write_mode": "preview_only",
            "input_ref": artifact_ref("l1", "bronze_envelope_samples", source_id, run_id),
            "output_ref": artifact_ref("l7", "silver_preview", source_id, run_id),
            "preview_scope": {"source_unit_ids": source_unit_ids, "object_ids": [item["object_id"] for item in l0["objects"]], "stream_window_ids": []},
            "operations": silver_operations,
            "blocked_runtime_features": ["per_row_ai_call", "generated_code_execution", "unbounded_collect", "production_write"],
        },
    )
    gold_spec = with_header(
        layer="l6",
        name="gold_generation_spec",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l6.gold_generation_spec.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L6",
            "artifact_type": "gold_generation_spec",
            "execution_owner": "M2",
            "request_state": l5["gold_decision"]["decision_status"],
            "write_mode": "preview_only",
            "input_ref": artifact_ref("l7", "silver_preview", source_id, run_id),
            "output_ref": artifact_ref("l8", "gold_preview", source_id, run_id),
            "preview_scope": {"source_unit_ids": source_unit_ids, "object_ids": [item["object_id"] for item in l0["objects"]], "stream_window_ids": []},
            "operations": gold_operations,
            "note": "Gold spec is executable only when L5 gold decision is approved; otherwise it records the deferred/not_requested state.",
        },
    )
    graph = with_header(
        layer="l6",
        name="layered_transform_graph",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l6.layered_transform_graph.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L6",
            "nodes": [{"id": f"l{index}", "layer": f"L{index}"} for index in range(11)],
            "edges": [
                {"from": "l0", "to": "l1"},
                {"from": "l1", "to": "l2"},
                {"from": "l2", "to": "l3"},
                {"from": "l3", "to": "l4"},
                {"from": "l4", "to": "l5"},
                {"from": "l5", "to": "l6"},
                {"from": "l6", "to": "l7"},
                {"from": "l7", "to": "l8"},
                {"from": "l8", "to": "l9"},
                {"from": "l9", "to": "l10"},
            ],
        },
    )
    unsupported_report = with_header(
        layer="l6",
        name="unsupported_action_report",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l6.unsupported_action_report.v2_1_1",
        access_class="catalog_internal",
        body={"layer": "L6", "artifact_type": "unsupported_action_report", "unsupported_actions": unsupported},
    )
    validation = _compiler_validation(source_id, run_id, silver_spec, gold_spec, unsupported)
    write_json(layer_dir / "silver_transform_spec.json", silver_spec)
    write_json(layer_dir / "gold_generation_spec.json", gold_spec)
    write_json(layer_dir / "layered_transform_graph.json", graph)
    write_json(layer_dir / "unsupported_action_report.json", unsupported_report)
    write_json(layer_dir / "compiler_validation_result.json", validation)
    return {
        "silver_spec": silver_spec,
        "gold_spec": gold_spec,
        "graph": graph,
        "unsupported_action_report": unsupported_report,
        "compiler_validation": validation,
    }


def _silver_operations(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    operations: list[dict[str, Any]] = [
        {
            "operation_id": "select_silver_fields",
            "operation": "select",
            "params": {
                "input_ref": "bronze",
                "columns": [field["source_path"] for field in fields if "drop" not in field["recommended_actions"]],
            },
        }
    ]
    for field in fields:
        for action in field["recommended_actions"]:
            if action == "select" or action == "drop":
                continue
            operations.append(_operation_for_action(field, action))
    return operations


def _operation_for_action(field: dict[str, Any], action: str) -> dict[str, Any]:
    base = {
        "operation_id": f"{action}_{field['target_name']}",
        "operation": action,
    }
    if action == "rename":
        params = {"input_ref": "silver_working", "source_path": field["source_path"], "target_name": field["target_name"]}
    elif action in {"cast", "parse_timestamp"}:
        params = {"input_ref": "silver_working", "source_path": field["source_path"], "target_type": field["target_type"]}
    elif action in {"mask", "hash"}:
        params = {
            "input_ref": "silver_working",
            "source_path": field["source_path"],
            "pii_handling": field["pii_handling"],
            "catalog_exposure": field["catalog_exposure"],
            "query_context_exposure": field["query_context_exposure"],
        }
    elif action in {"json_string", "flatten_struct", "explode_array", "normalize_null", "quarantine_if_invalid"}:
        params = {"input_ref": "silver_working", "source_path": field["source_path"], "target_name": field["target_name"]}
    else:
        params = {"input_ref": "silver_working", "source_path": field["source_path"]}
    return {**base, "params": params}


def _gold_operations(models: list[dict[str, Any]]) -> list[dict[str, Any]]:
    operations: list[dict[str, Any]] = []
    for model in models:
        operations.append(
            {
                "operation_id": f"aggregate_{model['gold_model_id']}",
                "operation": "aggregate",
                "params": {
                    "input_ref": "silver_preview",
                    "group_by": model["grain"],
                    "dimensions": model["grain"],
                    "measures": model["measures"],
                    "time_window": model["time_window"],
                    "cardinality_guard": {"max_groups": 100000, "on_exceed": "block_preview"},
                },
            }
        )
    return operations


def _unsupported_actions(l5: dict[str, Any]) -> list[dict[str, Any]]:
    unsupported = []
    for field in l5["silver_decision"]["fields"]:
        for action in field["recommended_actions"]:
            if action == "needs_review" or action not in SUPPORTED_ACTIONS:
                unsupported.append(
                    {
                        "action": action,
                        "layer": "silver",
                        "source_path": field["source_path"],
                        "target_name": field["target_name"],
                        "reason": "Action is not compiler executable.",
                        "blocked_reason": "Only L5-approved deterministic actions can pass to L6.",
                        "recommended_owner_action": "Resolve in L5 decision UI.",
                        "safe_alternative": "select",
                    }
                )
    return unsupported


def _compiler_validation(
    source_id: str,
    run_id: str,
    silver_spec: dict[str, Any],
    gold_spec: dict[str, Any],
    unsupported: list[dict[str, Any]],
) -> dict[str, Any]:
    checks = [
        {
            "pattern": "per_row_ai_call",
            "status": "pass",
            "evidence": "L6 operations are deterministic and contain no AI call operation.",
            "blocking_reason": None,
        },
        {
            "pattern": "generated_code_execution",
            "status": "pass",
            "evidence": "L6 operation vocabulary is declarative.",
            "blocking_reason": None,
        },
        {
            "pattern": "unbounded_collect",
            "status": "pass",
            "evidence": "Gold aggregate includes cardinality_guard and specs are preview_only.",
            "blocking_reason": None,
        },
        {
            "pattern": "preview_only_write_mode",
            "status": "pass" if silver_spec["write_mode"] == "preview_only" and gold_spec["write_mode"] == "preview_only" else "block",
            "evidence": "Both L6 specs must use write_mode=preview_only.",
            "blocking_reason": None,
        },
        {
            "pattern": "unsupported_action",
            "status": "block" if unsupported else "pass",
            "evidence": f"{len(unsupported)} unsupported actions found.",
            "blocking_reason": "Unsupported actions must be resolved in L5." if unsupported else None,
        },
        {
            "pattern": "legacy_window_id",
            "status": "pass"
            if not _contains_legacy_window_id(silver_spec.get("preview_scope", {}))
            and not _contains_legacy_window_id(gold_spec.get("preview_scope", {}))
            else "block",
            "evidence": "preview_scope uses source_unit_ids[] and stream_window_ids[] only.",
            "blocking_reason": None,
        },
    ]
    return with_header(
        layer="l6",
        name="compiler_validation_result",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l6.compiler_validation_result.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L6",
            "artifact_type": "compiler_validation_result",
            "compiler_version": "m3.compiler.v2_1_1",
            "overall_status": "block" if any(check["status"] == "block" for check in checks) else "pass",
            "unsupported_action_report_ref": artifact_ref("l6", "unsupported_action_report", source_id, run_id),
            "checks": checks,
            "warnings": [],
        },
    )


def _contains_legacy_window_id(value: Any) -> bool:
    if isinstance(value, dict):
        return any(key == "window_id" or _contains_legacy_window_id(child) for key, child in value.items())
    if isinstance(value, list):
        return any(_contains_legacy_window_id(item) for item in value)
    return False
