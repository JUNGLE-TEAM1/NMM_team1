from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, with_header, write_json


ALLOWED_ACTIONS = {
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
    "needs_review",
}


def build_l4(
    l3: dict[str, Any],
    out_dir: Path,
    source_id: str,
    run_id: str,
    ai_model_slot: str,
) -> dict[str, Any]:
    """Draft editable Silver and Gold recommendations from L3 evidence only."""

    layer_dir = out_dir / "l4"
    ensure_dir(layer_dir)
    silver_fields = [_silver_field_recommendation(field) for field in l3["field_evidence"]]
    gold_models = _gold_model_recommendations(l3["field_evidence"])
    derived_gold_options = [
        {
            "option_id": "gold_to_gold_followup",
            "request_state": "not_requested",
            "user_selectable": True,
            "default_selected": False,
            "description": "Optional follow-up Gold-to-Gold model. M3 must generate it only after a user decision.",
        }
    ]
    silver = with_header(
        layer="l4",
        name="silver_policy_recommendation_draft",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l4.silver_draft.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L4",
            "artifact_type": "silver_policy_recommendation_draft",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "recommendation_schema_version": "m3.recommendation.silver.v2_1_1",
            "allowed_recommendation_actions": sorted(ALLOWED_ACTIONS),
            "fields": silver_fields,
            "draft_status": "needs_user_decision",
        },
    )
    gold = with_header(
        layer="l4",
        name="gold_model_recommendation_draft",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l4.gold_draft.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L4",
            "artifact_type": "gold_model_recommendation_draft",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "recommendation_schema_version": "m3.recommendation.gold.v2_1_1",
            "gold_models": gold_models,
            "derived_gold_options": derived_gold_options,
            "draft_status": "needs_user_decision",
        },
    )
    trace = with_header(
        layer="l4",
        name="ai_generation_trace",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l4.ai_generation_trace.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L4",
            "artifact_type": "ai_generation_trace",
            "model_slot": ai_model_slot,
            "execution_mode": "deterministic_fallback" if ai_model_slot == "deterministic" else "model_slot_declared_not_invoked_by_unit_test",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "row_level_ai_calls": 0,
            "raw_payload_seen_by_ai": False,
            "output_refs": {
                "silver_draft_ref": artifact_ref("l4", "silver_policy_recommendation_draft", source_id, run_id),
                "gold_draft_ref": artifact_ref("l4", "gold_model_recommendation_draft", source_id, run_id),
            },
        },
    )
    write_json(layer_dir / "silver_policy_recommendation_draft.json", silver)
    write_json(layer_dir / "gold_model_recommendation_draft.json", gold)
    write_json(layer_dir / "ai_generation_trace.json", trace)
    return {"silver_draft": silver, "gold_draft": gold, "trace": trace}


def _silver_field_recommendation(field: dict[str, Any]) -> dict[str, Any]:
    actions = ["select"]
    pii_handling = "none"
    catalog_exposure = "default_visible"
    query_context_exposure = "allowed"
    if field["pii_candidate"]:
        actions.append("mask")
        pii_handling = "mask"
        catalog_exposure = "hidden"
        query_context_exposure = "masked"
    if field["inferred_type"] == "timestamp":
        actions.append("parse_timestamp")
    elif field["inferred_type"] in {"integer", "number", "boolean"}:
        actions.append("cast")
    elif field["inferred_type"] == "json":
        actions.append("json_string")
        query_context_exposure = "forbidden"
    if field["nullable_ratio"] > 0:
        actions.append("normalize_null")
    return {
        "field_id": field["field_id"],
        "source_path": field["source_path"],
        "target_name": field["target_name_candidate"],
        "target_type": field["inferred_type"],
        "recommended_actions": actions,
        "pii_handling": pii_handling,
        "catalog_exposure": catalog_exposure,
        "query_context_exposure": query_context_exposure,
        "nullable_ratio": field["nullable_ratio"],
        "confidence": field["profile_confidence"],
        "reason": "Profile-derived strict draft; L5 user decision is required before L6 compile.",
    }


def _gold_model_recommendations(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    dimensions = [field for field in fields if "identifier_or_dimension" in field["semantic_hints"]]
    measures = [field for field in fields if "measure_candidate" in field["semantic_hints"] and field["inferred_type"] in {"integer", "number"}]
    times = [field for field in fields if "time_candidate" in field["semantic_hints"]]
    if dimensions and measures:
        return [
            {
                "gold_model_id": "gold_dimension_metric_summary",
                "gold_model_type": "dimension_summary",
                "recommended_action": "aggregate",
                "grain": [dimensions[0]["target_name_candidate"]],
                "measures": [
                    {"name": "row_count", "operation": "count", "field": "*"},
                    {"name": f"avg_{measures[0]['target_name_candidate']}", "operation": "avg", "field": measures[0]["target_name_candidate"]},
                ],
                "time_window": {"enabled": bool(times), "field": times[0]["target_name_candidate"] if times else None, "window": None},
                "confidence": 0.78,
                "owner_review_required": True,
            }
        ]
    if dimensions:
        return [
            {
                "gold_model_id": "gold_dimension_count_summary",
                "gold_model_type": "dimension_summary",
                "recommended_action": "aggregate",
                "grain": [dimensions[0]["target_name_candidate"]],
                "measures": [{"name": "row_count", "operation": "count", "field": "*"}],
                "time_window": {"enabled": False, "field": None, "window": None},
                "confidence": 0.66,
                "owner_review_required": True,
            }
        ]
    return [
        {
            "gold_model_id": "gold_record_count_summary",
            "gold_model_type": "metric_table",
            "recommended_action": "aggregate",
            "grain": [],
            "measures": [{"name": "row_count", "operation": "count", "field": "*"}],
            "time_window": {"enabled": False, "field": None, "window": None},
            "confidence": 0.52,
            "owner_review_required": True,
        }
    ]
