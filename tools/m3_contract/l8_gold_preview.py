from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, with_header, write_json


def build_l8(l5: dict[str, Any], l6: dict[str, Any], out_dir: Path, source_id: str, run_id: str) -> dict[str, Any]:
    """Create Gold preview input artifacts and semantic readiness evidence."""

    layer_dir = out_dir / "l8"
    ensure_dir(layer_dir)
    gold_status = l5["gold_decision"]["decision_status"]
    gold_requested = gold_status != "not_requested"
    approved = gold_status == "approved"
    selected_models = l5["gold_decision"]["selected_gold_models"]
    metric_definitions = _metric_definitions(selected_models) if approved else []
    preview = with_header(
        layer="l8",
        name="gold_preview",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l8.gold_preview_ref.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L14",
            "artifact_type": "gold_preview_ref",
            "execution_owner": "M2",
            "execution_status": "not_executed_by_m3" if approved else "not_requested_or_deferred",
            "input_spec_ref": artifact_ref("l6", "gold_generation_spec", source_id, run_id),
            "preview_write_mode": "preview_only",
            "gold_l5_status": gold_status,
        },
    )
    metric_draft = with_header(
        layer="l8",
        name="metric_definition_draft",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l8.metric_definition_draft.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L14",
            "artifact_type": "metric_definition_draft",
            "gold_l5_status": gold_status,
            "metrics": metric_definitions,
            "owner_review_required": any(model.get("owner_review_required") for model in selected_models),
        },
    )
    input_report = with_header(
        layer="l8",
        name="gold_readiness_input_report",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l8.gold_readiness_input_report.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L14",
            "artifact_type": "gold_readiness_input_report",
            "gold_l5_status": gold_status,
            "gold_requested": gold_requested,
            "gold_preview_ref": artifact_ref("l8", "gold_preview", source_id, run_id),
            "metric_definition_ref": artifact_ref("l8", "metric_definition_draft", source_id, run_id),
            "semantic_status_candidate": _semantic_status_candidate(gold_status, metric_definitions),
            "caveats": _gold_caveats(gold_status, metric_definitions),
        },
    )
    validation = with_header(
        layer="l8",
        name="gold_preview_validation_result",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l8.gold_preview_validation_result.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L14",
            "artifact_type": "gold_preview_validation_result",
            "gold_l5_status": gold_status,
            "status": "pass" if approved and metric_definitions else "not_requested" if gold_status == "not_requested" else "deferred" if gold_status == "deferred" else "warn",
            "checks": [
                {"name": "preview_only_write_mode", "status": "pass"},
                {"name": "gold_decision_present", "status": "pass"},
                {"name": "metric_definition_present", "status": "pass" if metric_definitions else "not_applicable"},
            ],
        },
    )
    caveat = with_header(
        layer="l8",
        name="semantic_caveat_report",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l8.semantic_caveat_report.v2_1_1",
        access_class="catalog_internal",
        body={"layer": "L14", "artifact_type": "semantic_caveat_report", "caveats": _gold_caveats(gold_status, metric_definitions)},
    )
    write_json(layer_dir / "gold_preview_ref.json", preview)
    write_json(layer_dir / "gold_preview_result.json", preview)
    write_json(layer_dir / "gold_preview_validation_result.json", validation)
    write_json(layer_dir / "metric_definition_draft.json", metric_draft)
    write_json(layer_dir / "gold_readiness_input_report.json", input_report)
    write_json(layer_dir / "semantic_caveat_report.json", caveat)
    return {
        "gold_preview": preview,
        "metric_definition": metric_draft,
        "input_report": input_report,
        "validation": validation,
        "caveat": caveat,
    }


def _metric_definitions(models: list[dict[str, Any]]) -> list[dict[str, Any]]:
    metrics = []
    for model in models:
        for measure in model.get("measures", []):
            metrics.append(
                {
                    "metric_id": f"{model['gold_model_id']}_{measure['name']}",
                    "gold_model_id": model["gold_model_id"],
                    "name": measure["name"],
                    "operation": measure["operation"],
                    "field": measure.get("field"),
                    "grain": model.get("grain", []),
                    "semantic_status": "needs_owner_review" if model.get("owner_review_required") else "draft",
                }
            )
    return metrics


def _semantic_status_candidate(status: str, metrics: list[dict[str, Any]]) -> str:
    if status == "not_requested":
        return "not_requested"
    if status == "deferred":
        return "deferred"
    if status == "rejected":
        return "block"
    if status == "approved" and metrics:
        return "warn" if any(metric["semantic_status"] == "needs_owner_review" for metric in metrics) else "pass"
    return "warn"


def _gold_caveats(status: str, metrics: list[dict[str, Any]]) -> list[str]:
    if status == "not_requested":
        return ["Gold layer not requested; Silver-only context can still be usable."]
    if status == "deferred":
        return ["Gold layer deferred by owner decision."]
    if status == "rejected":
        return ["Gold recommendation rejected by owner decision."]
    caveats = []
    if any(metric["semantic_status"] == "needs_owner_review" for metric in metrics):
        caveats.append("Gold metrics require owner semantic review before trusted query exposure.")
    return caveats
