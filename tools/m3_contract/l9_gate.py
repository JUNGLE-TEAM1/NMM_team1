from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, with_header, write_json


def build_l9(l7: dict[str, Any], l8: dict[str, Any], out_dir: Path, source_id: str, run_id: str) -> dict[str, Any]:
    """Compute final processing, catalog, and Gold readiness axes."""

    layer_dir = out_dir / "l9"
    ensure_dir(layer_dir)
    processing_status = _processing_status(l7)
    catalog_status = _catalog_status(l7)
    gold_status = _gold_axis_status(l8)
    gold_l5_status = l8["input_report"]["gold_l5_status"]
    gold_requested = bool(l8["input_report"]["gold_requested"])
    silver_context, gold_context = _m6_context(processing_status, catalog_status, gold_status, gold_l5_status, gold_requested)
    processing_axis = with_header(
        layer="l9",
        name="processing_quality_axis",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l9.processing_quality_axis.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L15",
            "artifact_type": "processing_quality_axis",
            "axis_name": "processing_quality",
            "axis_status": processing_status,
            "silver_preview_validation_ref": artifact_ref("l7", "silver_preview_validation_result", source_id, run_id),
            "blocking_reasons": [] if processing_status != "block" else ["Silver preview/compiler validation blocked processing."],
            "caveats": [] if processing_status == "pass" else ["Processing has warning-level caveats."],
        },
    )
    catalog_axis = with_header(
        layer="l9",
        name="catalog_safety_axis",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l9.catalog_safety_axis.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L15",
            "artifact_type": "catalog_safety_axis",
            "axis_name": "catalog_safety",
            "axis_status": catalog_status,
            "pii_exposure_report_ref": artifact_ref("l7", "pii_exposure_report", source_id, run_id),
            "blocking_reasons": [] if catalog_status != "block" else ["Forbidden PII/query exposure detected."],
            "caveats": [] if catalog_status == "pass" else ["PII or query exposure caveats require catalog visibility controls."],
        },
    )
    gold_axis = with_header(
        layer="l9",
        name="gold_readiness_axis",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l9.gold_readiness_axis.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L15",
            "artifact_type": "gold_readiness_axis",
            "axis_name": "gold_readiness",
            "axis_status": gold_status,
            "gold_l5_status": gold_l5_status,
            "gold_requested": gold_requested,
            "input_report_ref": artifact_ref("l8", "gold_readiness_input_report", source_id, run_id),
            "metric_definition_ref": artifact_ref("l8", "metric_definition_draft", source_id, run_id),
            "owner_review_id": None,
            "blocking_reasons": _gold_blocking_reasons(gold_status, gold_l5_status),
            "caveats": l8["input_report"]["caveats"],
            "m6_gold_context_candidate": gold_context,
        },
    )
    gate = with_header(
        layer="l9",
        name="gate_summary",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l9.gate_summary.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L15",
            "artifact_type": "gate_summary",
            "gate_version": "m3.gate.v2_1_1",
            "processing_quality_axis_ref": artifact_ref("l9", "processing_quality_axis", source_id, run_id),
            "catalog_safety_axis_ref": artifact_ref("l9", "catalog_safety_axis", source_id, run_id),
            "gold_readiness_axis_ref": artifact_ref("l9", "gold_readiness_axis", source_id, run_id),
            "preview_scope_ref": artifact_ref("l6", "silver_transform_spec", source_id, run_id),
            "m6_context_status": {
                "silver_context_status": silver_context,
                "gold_context_status": gold_context,
            },
            "safe_to_run_silver": silver_context in {"ready", "ready_with_caveat"},
            "safe_to_run_gold": gold_context in {"ready", "ready_with_caveat"},
            "required_caveats": _required_caveats(processing_axis, catalog_axis, gold_axis),
        },
    )
    write_json(layer_dir / "processing_quality_axis.json", processing_axis)
    write_json(layer_dir / "catalog_safety_axis.json", catalog_axis)
    write_json(layer_dir / "gold_readiness_axis.json", gold_axis)
    write_json(layer_dir / "gate_summary.json", gate)
    return {
        "processing_axis": processing_axis,
        "catalog_axis": catalog_axis,
        "gold_axis": gold_axis,
        "gate_summary": gate,
    }


def _processing_status(l7: dict[str, Any]) -> str:
    status = l7["validation"]["status"]
    if status == "block":
        return "block"
    return "pass"


def _catalog_status(l7: dict[str, Any]) -> str:
    forbidden = l7["pii_report"].get("forbidden_query_fields", [])
    pii_fields = l7["pii_report"].get("fields", [])
    if any(field.get("query_context_exposure") == "forbidden" and field.get("pii_handling") == "none" for field in pii_fields):
        return "block"
    if pii_fields or forbidden:
        return "warn"
    return "pass"


def _gold_axis_status(l8: dict[str, Any]) -> str:
    candidate = l8["input_report"]["semantic_status_candidate"]
    if candidate in {"not_requested", "deferred", "warn", "block", "pass"}:
        return candidate
    return "warn"


def _m6_context(
    processing: str,
    catalog: str,
    gold: str,
    gold_l5_status: str,
    gold_requested: bool,
) -> tuple[str, str]:
    if processing == "block":
        return "blocked", "blocked" if gold_requested else "not_requested"
    if catalog == "block":
        return "blocked", "blocked" if gold_requested else "not_requested"
    silver = "ready_with_caveat" if processing == "warn" or catalog == "warn" else "ready"
    if not gold_requested or gold == "not_requested" or gold_l5_status == "not_requested":
        return silver, "not_requested"
    if gold == "deferred" or gold_l5_status == "deferred":
        return silver, "not_ready"
    if gold == "block" or gold_l5_status == "rejected":
        return silver, "not_ready"
    if gold == "warn" or silver == "ready_with_caveat":
        return silver, "ready_with_caveat"
    return silver, "ready"


def _gold_blocking_reasons(status: str, l5_status: str) -> list[str]:
    if l5_status == "rejected":
        return ["Gold recommendation rejected."]
    if status == "block":
        return ["Gold readiness blocked."]
    return []


def _required_caveats(*axes: dict[str, Any]) -> list[str]:
    caveats: list[str] = []
    for axis in axes:
        caveats.extend(axis.get("caveats", []))
    return caveats
