from __future__ import annotations

import re
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
    risk_score_policy = _risk_score_policy_recommendation(l3["field_evidence"], source_id, run_id, ai_model_slot)
    product_health_template = _product_health_gold_template(l3["field_evidence"], source_id, run_id, risk_score_policy)
    vector_handoff_template = _vector_embedding_handoff_template(l3["field_evidence"], source_id, run_id)
    derived_gold_options = [
        {
            "option_id": "gold_product_health_template",
            "request_state": "deferred",
            "user_selectable": True,
            "default_selected": False,
            "template_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
            "description": "Presentation-oriented product health Gold template. It must not be treated as executable or semantically trusted until L9 owner approval and source evidence checks are complete.",
        },
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
            "layer": "L6",
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
            "layer": "L7",
            "artifact_type": "gold_model_recommendation_draft",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "recommendation_schema_version": "m3.recommendation.gold.v2_1_1",
            "gold_models": gold_models,
            "derived_gold_options": derived_gold_options,
            "template_refs": {
                "product_health_gold_template_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
                "risk_score_policy_recommendation_ref": artifact_ref("l4", "risk_score_policy_recommendation_draft", source_id, run_id),
                "vector_embedding_handoff_template_ref": artifact_ref("l4", "vector_embedding_handoff_template", source_id, run_id),
            },
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
            "layer": "L8",
            "artifact_type": "ai_generation_trace",
            "model_slot": ai_model_slot,
            "execution_mode": "deterministic_fallback" if ai_model_slot == "deterministic" else "model_slot_declared_not_invoked_by_unit_test",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "row_level_ai_calls": 0,
            "raw_payload_seen_by_ai": False,
            "output_refs": {
                "silver_draft_ref": artifact_ref("l4", "silver_policy_recommendation_draft", source_id, run_id),
                "gold_draft_ref": artifact_ref("l4", "gold_model_recommendation_draft", source_id, run_id),
                "product_health_gold_template_ref": artifact_ref("l4", "product_health_gold_template_draft", source_id, run_id),
                "risk_score_policy_recommendation_ref": artifact_ref("l4", "risk_score_policy_recommendation_draft", source_id, run_id),
                "vector_embedding_handoff_template_ref": artifact_ref("l4", "vector_embedding_handoff_template", source_id, run_id),
            },
        },
    )
    write_json(layer_dir / "silver_policy_recommendation_draft.json", silver)
    write_json(layer_dir / "gold_model_recommendation_draft.json", gold)
    write_json(layer_dir / "product_health_gold_template_draft.json", product_health_template)
    write_json(layer_dir / "risk_score_policy_recommendation_draft.json", risk_score_policy)
    write_json(layer_dir / "vector_embedding_handoff_template.json", vector_handoff_template)
    write_json(layer_dir / "ai_generation_trace.json", trace)
    return {
        "silver_draft": silver,
        "gold_draft": gold,
        "product_health_template": product_health_template,
        "risk_score_policy": risk_score_policy,
        "vector_handoff_template": vector_handoff_template,
        "trace": trace,
    }


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
        "reason": "Profile-derived strict draft; L9 user decision is required before L10 Silver compile.",
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


def _product_health_gold_template(
    fields: list[dict[str, Any]],
    source_id: str,
    run_id: str,
    risk_score_policy: dict[str, Any],
) -> dict[str, Any]:
    product_key = _product_key_field(fields)
    rating_field = _rating_signal_field(fields)
    review_text_field = _review_text_signal_field(fields)
    conversion_fields = _fields_by_tokens(fields, {"conversion", "purchase", "order", "session", "click", "impression", "cart", "checkout"})
    delivery_fields = _fields_by_tokens(fields, {"delivery", "ship", "shipping", "late", "arrival", "delivered", "eta"})
    time_field = _first_field(fields, hints={"time_candidate"}, tokens={"time", "date", "timestamp"})
    metric_templates = [
        _metric_template(
            metric_id="negative_review_rate",
            semantic_type="review_quality",
            formula_template="negative_review_count / review_count",
            status="candidate" if product_key and (rating_field or review_text_field) else "needs_source_evidence",
            required_source_evidence=["product/entity key", "rating or review text", "review count denominator"],
            available_fields=[item for item in [product_key, rating_field, review_text_field] if item],
            missing_evidence=[] if product_key and (rating_field or review_text_field) else _missing(["product/entity key", "rating or review text"], [bool(product_key), bool(rating_field or review_text_field)]),
            owner_review_required=True,
            caveat="Negative sentiment threshold must be approved. Rating <= 2 or text sentiment are only template defaults.",
        ),
        _metric_template(
            metric_id="risk_score",
            semantic_type="composite_product_health",
            formula_template="selected_risk_score_policy(risk_score_policy_recommendation_ref)",
            status="policy_recommendation_ready" if risk_score_policy["recommended_policy"]["candidate_components"] else "needs_source_evidence",
            required_source_evidence=["risk_score_policy_recommendation_ref", "at least one approved risk component", "risk_score_coverage metadata"],
            available_fields=[item for item in [product_key, rating_field, review_text_field] if item],
            missing_evidence=risk_score_policy["recommended_policy"]["missing_or_deferred_components"],
            owner_review_required=True,
            caveat="Risk score formula and weights are recommended per source evidence and must be approved in L9 before deterministic execution.",
        ),
        _metric_template(
            metric_id="conversion_rate",
            semantic_type="behavior_funnel",
            formula_template="conversion_event_count / eligible_visit_or_impression_count",
            status="candidate" if _has_conversion_numerator_and_denominator(conversion_fields) else "needs_source_evidence",
            required_source_evidence=["conversion numerator event", "eligible visit/session/impression denominator", "product/entity key"],
            available_fields=[product_key, *conversion_fields] if product_key else conversion_fields,
            missing_evidence=[] if product_key and _has_conversion_numerator_and_denominator(conversion_fields) else _missing_conversion(product_key, conversion_fields),
            owner_review_required=True,
            caveat="Amazon review-only data usually cannot prove conversion_rate; M3 must keep it deferred unless behavior-event fields exist.",
        ),
        _metric_template(
            metric_id="late_delivery_rate",
            semantic_type="delivery_reliability",
            formula_template="late_delivery_count / delivered_order_count",
            status="candidate" if product_key and delivery_fields else "needs_source_evidence",
            required_source_evidence=["delivery date or lateness flag", "delivered order denominator", "product/entity key"],
            available_fields=[product_key, *delivery_fields] if product_key else delivery_fields,
            missing_evidence=[] if product_key and delivery_fields else _missing_delivery(product_key, delivery_fields),
            owner_review_required=True,
            caveat="Review text mentioning shipping is not enough to assert late_delivery_rate unless delivery events or timestamps exist.",
        ),
        _metric_template(
            metric_id="review_volume",
            semantic_type="supporting_volume",
            formula_template="count(review_id or row)",
            status="candidate" if product_key else "needs_source_evidence",
            required_source_evidence=["product/entity key", "review row or review id"],
            available_fields=[item for item in [product_key, review_text_field, rating_field] if item],
            missing_evidence=[] if product_key else ["product/entity key"],
            owner_review_required=False,
            caveat="Supporting metric used to explain confidence and denominator size.",
        ),
        _metric_template(
            metric_id="average_rating",
            semantic_type="supporting_quality",
            formula_template="avg(rating)",
            status="candidate" if product_key and rating_field else "needs_source_evidence",
            required_source_evidence=["product/entity key", "rating field"],
            available_fields=[item for item in [product_key, rating_field] if item],
            missing_evidence=[] if product_key and rating_field else _missing(["product/entity key", "rating field"], [bool(product_key), bool(rating_field)]),
            owner_review_required=False,
            caveat="Rating scale and null handling need confirmation before trusted query exposure.",
        ),
    ]
    executable_metrics = [metric["metric_id"] for metric in metric_templates if metric["status"] == "candidate" and not metric["owner_review_required"]]
    return with_header(
        layer="l4",
        name="product_health_gold_template_draft",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l4.product_health_gold_template.v2_1_2",
        access_class="catalog_internal",
        body={
            "layer": "L7",
            "artifact_type": "product_health_gold_template_draft",
            "template_id": "gold_product_health",
            "template_status": "conditional_template",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "unknown_data_pack_ref": artifact_ref("l3", "unknown_data_recommendation_pack", source_id, run_id),
            "candidate_grounding_report_ref": artifact_ref("l3", "candidate_grounding_report", source_id, run_id),
            "risk_score_policy_recommendation_ref": artifact_ref("l4", "risk_score_policy_recommendation_draft", source_id, run_id),
            "presentation_use": {
                "allowed": True,
                "claim_boundary": "This is a product health Gold template recommendation, not proof that semantic Gold has already been correctly implemented.",
            },
            "default_l5_decision_status": "deferred",
            "compile_allowed_by_default": False,
            "gold_model": {
                "gold_model_id": "gold_product_health",
                "gold_model_type": "semantic_metric_table",
                "recommended_action": "needs_review",
                "entity_grain": [product_key["target_name_candidate"]] if product_key else [],
                "time_window": {"enabled": bool(time_field), "field": time_field["target_name_candidate"] if time_field else None, "window": "owner_selected"},
                "metric_templates": metric_templates,
                "candidate_supporting_metrics_for_preview": executable_metrics,
                "risk_score_policy": {
                    "status": risk_score_policy["recommended_policy"]["policy_status"],
                    "recommended_policy_id": risk_score_policy["recommended_policy"]["policy_id"],
                    "selected_by_default": False,
                    "requires_l5_approval": True,
                },
                "owner_review_required": True,
            },
            "blocked_runtime_claims": [
                "M3 does not claim negative_review_rate is semantically correct before L9 owner approval.",
                "M3 does not invent conversion_rate from review-only data.",
                "M3 does not invent late_delivery_rate from review-only data.",
                "M3 does not compute production Gold; M2 executes approved L10/L11 specs only.",
            ],
        },
    )


def _risk_score_policy_recommendation(
    fields: list[dict[str, Any]],
    source_id: str,
    run_id: str,
    ai_model_slot: str,
) -> dict[str, Any]:
    product_key = _product_key_field(fields)
    rating_field = _rating_signal_field(fields)
    review_text_field = _review_text_signal_field(fields)
    conversion_fields = _fields_by_tokens(fields, {"conversion", "purchase", "order", "session", "click", "impression", "view", "cart", "checkout"})
    delivery_fields = _fields_by_tokens(fields, {"delivery", "ship", "shipping", "late", "arrival", "delivered", "eta"})
    components = _risk_score_components(product_key, rating_field, review_text_field, conversion_fields, delivery_fields)
    weights = _recommended_component_weights(components)
    formula = _risk_formula(weights)
    missing = _risk_missing_components(product_key, rating_field, review_text_field, conversion_fields, delivery_fields)
    policy_status = "needs_source_evidence" if not components else "draft_recommended"
    policy_id = _risk_policy_id(components)
    return with_header(
        layer="l4",
        name="risk_score_policy_recommendation_draft",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l4.risk_score_policy_recommendation.v2_1_2",
        access_class="catalog_internal",
        body={
            "layer": "L7",
            "artifact_type": "risk_score_policy_recommendation_draft",
            "policy_target": "gold_product_health.risk_score",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "candidate_grounding_report_ref": artifact_ref("l3", "candidate_grounding_report", source_id, run_id),
            "recommendation_source": {
                "model_slot": ai_model_slot,
                "mode": "deterministic_fallback_for_unit_tests" if ai_model_slot == "deterministic" else "ai_recommended_from_l3_evidence",
                "row_level_ai_calls": 0,
                "raw_payload_seen_by_ai": False,
            },
            "recommended_policy": {
                "policy_id": policy_id,
                "policy_status": policy_status,
                "weight_recommendation_mode": "source_evidence_adaptive",
                "formula_template": formula,
                "score_range": {"min": 0, "max": 100},
                "candidate_components": components,
                "recommended_weights": weights,
                "weight_guardrails": {
                    "sum_must_equal": 1.0,
                    "min_weight": 0.0,
                    "max_single_component_weight": 0.65,
                    "normalization": "renormalize_over_available_approved_components",
                    "deterministic_fallback_note": "Default priors are used only when the configured AI model slot is not invoked by local tests.",
                },
                "missing_or_deferred_components": missing,
                "missing_component_handling": "exclude_from_weight_and_record_in_risk_score_coverage",
                "zero_denominator_policy": {
                    "negative_review_rate": "null_when_review_count_is_zero",
                    "conversion_rate": "null_when_view_count_is_zero",
                    "late_delivery_rate": "null_when_delivery_count_is_zero",
                    "risk_score": "null_when_no_component_is_available",
                },
                "coverage_metadata": {
                    "field": "risk_score_coverage",
                    "public_query_default": "hidden",
                    "records_component_presence": [component["component_id"] for component in components],
                },
                "approval": {
                    "l9_required": True,
                    "legacy_l5_required_before_logical_split": True,
                    "compile_allowed_before_approval": False,
                    "owner_may_edit_weights": True,
                    "owner_may_drop_components": True,
                },
            },
            "blocked_claims": [
                "Risk score weights are not globally fixed.",
                "M3 recommends a risk_score policy from source evidence; L9 approval freezes it for deterministic execution.",
                "Missing components are not treated as zero.",
            ],
        },
    )


def _risk_score_components(
    product_key: dict[str, Any] | None,
    rating_field: dict[str, Any] | None,
    review_text_field: dict[str, Any] | None,
    conversion_fields: list[dict[str, Any]],
    delivery_fields: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    components: list[dict[str, Any]] = []
    if product_key and (rating_field or review_text_field):
        components.append(
            {
                "component_id": "negative_review_rate",
                "direction": "higher_is_riskier",
                "metric_dependency": "negative_review_rate",
                "required_evidence": ["product/entity key", "rating or review text", "review denominator"],
                "source_fields": [_field_projection(field) for field in [product_key, rating_field, review_text_field] if field],
                "reason": "Observed review signal can support product-level negative feedback risk.",
            }
        )
    if product_key and rating_field:
        components.append(
            {
                "component_id": "low_rating_score",
                "direction": "higher_is_riskier",
                "metric_dependency": "average_rating",
                "expression_template": "clamp((max_rating - average_rating) / (max_rating - min_rating), 0, 1)",
                "parameter_recommendation": {"min_rating": 1, "max_rating": 5, "source": "common_review_scale_default_needs_owner_review"},
                "source_fields": [_field_projection(field) for field in [product_key, rating_field] if field],
                "reason": "Observed rating field can support low-rating risk after scale confirmation.",
            }
        )
    if product_key and _has_conversion_numerator_and_denominator(conversion_fields):
        components.append(
            {
                "component_id": "low_conversion_score",
                "direction": "higher_is_riskier",
                "metric_dependency": "conversion_rate",
                "expression_template": "baseline_relative_underperformance(conversion_rate, category_or_global_baseline)",
                "required_evidence": ["conversion numerator", "eligible denominator", "baseline group or global baseline"],
                "source_fields": [_field_projection(field) for field in [product_key, *conversion_fields] if field],
                "reason": "Observed behavior numerator and denominator can support conversion risk.",
            }
        )
    if product_key and delivery_fields:
        components.append(
            {
                "component_id": "late_delivery_rate",
                "direction": "higher_is_riskier",
                "metric_dependency": "late_delivery_rate",
                "required_evidence": ["delivery lateness signal", "delivery denominator"],
                "source_fields": [_field_projection(field) for field in [product_key, *delivery_fields] if field],
                "reason": "Observed delivery signal can support fulfillment risk.",
            }
        )
    return components


def _recommended_component_weights(components: list[dict[str, Any]]) -> dict[str, float]:
    base = {
        "negative_review_rate": 0.35,
        "low_rating_score": 0.30,
        "low_conversion_score": 0.20,
        "late_delivery_rate": 0.15,
    }
    available = [component["component_id"] for component in components]
    total = sum(base.get(component_id, 0.0) for component_id in available)
    if total <= 0:
        return {}
    return {component_id: round(base[component_id] / total, 6) for component_id in available}


def _risk_formula(weights: dict[str, float]) -> str | None:
    if not weights:
        return None
    parts = ", ".join(f"{component_id}:{weight}" for component_id, weight in weights.items())
    return f"round(100 * weighted_average({parts}, renormalize_missing=true), 2)"


def _risk_missing_components(
    product_key: dict[str, Any] | None,
    rating_field: dict[str, Any] | None,
    review_text_field: dict[str, Any] | None,
    conversion_fields: list[dict[str, Any]],
    delivery_fields: list[dict[str, Any]],
) -> list[str]:
    missing = []
    if not product_key:
        missing.append("product/entity key")
    if not rating_field and not review_text_field:
        missing.append("negative review signal")
    if not rating_field:
        missing.append("rating scale for low_rating_score")
    if not _has_conversion_numerator_and_denominator(conversion_fields):
        missing.append("conversion numerator and denominator for low_conversion_score")
    if not delivery_fields:
        missing.append("delivery lateness signal for late_delivery_rate")
    return missing


def _risk_policy_id(components: list[dict[str, Any]]) -> str:
    if not components:
        return "risk_policy_no_supported_components"
    suffix = "_".join(component["component_id"] for component in components)
    return f"risk_policy_{suffix}"


def _vector_embedding_handoff_template(fields: list[dict[str, Any]], source_id: str, run_id: str) -> dict[str, Any]:
    text_candidates = [
        field
        for field in fields
        if not field["pii_candidate"]
        and ("text_candidate" in field["semantic_hints"] or any(token in field["source_path"].lower() for token in ["review", "comment", "description", "title", "text"]))
    ]
    entity_candidates = [field for field in fields if not field["pii_candidate"] and "identifier_or_dimension" in field["semantic_hints"]]
    metadata_candidates = [
        field
        for field in fields
        if not field["pii_candidate"]
        and field["field_id"] not in {item["field_id"] for item in text_candidates[:12]}
        and field["inferred_type"] in {"string", "integer", "number", "boolean", "timestamp"}
    ]
    return with_header(
        layer="l4",
        name="vector_embedding_handoff_template",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l4.vector_embedding_handoff_template.v2_1_2",
        access_class="catalog_internal",
        body={
            "layer": "L8",
            "artifact_type": "vector_embedding_handoff_template",
            "handoff_id": "vector_embedding_handoff",
            "handoff_status": "draft",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "unknown_data_pack_ref": artifact_ref("l3", "unknown_data_recommendation_pack", source_id, run_id),
            "m3_role": "Recommend candidate text/entity/metadata fields and safety policy only.",
            "execution_owner": "M6_or_vector_extension",
            "m3_embedding_execution": False,
            "embedding_job_allowed_by_default": False,
            "candidate_text_fields": [_field_projection(field) for field in text_candidates[:12]],
            "candidate_entity_keys": [_field_projection(field) for field in entity_candidates[:8]],
            "candidate_metadata_fields": [_field_projection(field) for field in metadata_candidates[:12]],
            "chunking_policy_template": {
                "strategy": "field_value_chunk",
                "max_tokens": 512,
                "overlap_tokens": 64,
                "dedupe_key_candidates": [field["target_name_candidate"] for field in entity_candidates[:3]],
                "empty_text_action": "skip",
            },
            "privacy_and_policy": {
                "exclude_pii_candidates_by_default": True,
                "catalog_exposure_required": "default_visible_or_masked",
                "query_context_exposure_required": "allowed_or_masked",
                "blocked_inputs": ["raw rescue payload", "unredacted PII", "full realtime stream"],
            },
            "extension_hook": {
                "hook_name": "vector_index_build_request",
                "core_contract_status": "handoff_template_only",
                "required_downstream_decision": "M5/M6 owner approval and policy validation",
            },
            "blocked_runtime_claims": [
                "M3 does not build embeddings in core.",
                "M3 does not maintain a vector index.",
                "M3 does not expose unapproved text fields to retrieval.",
            ],
        },
    )


def _field_blob(field: dict[str, Any]) -> str:
    return f"{field.get('source_path', '')} {field.get('target_name_candidate', field.get('target_name', ''))}".lower()


def _field_terms(field: dict[str, Any]) -> tuple[str, set[str]]:
    normalized = re.sub(r"[^a-z0-9]+", "_", _field_blob(field))
    parts = {part for part in normalized.split("_") if part}
    return normalized, parts


def _field_has_any_token(field: dict[str, Any], tokens: set[str]) -> bool:
    normalized, parts = _field_terms(field)
    for token in tokens:
        normalized_token = re.sub(r"[^a-z0-9]+", "_", token.lower()).strip("_")
        if not normalized_token:
            continue
        if "_" in normalized_token:
            if normalized_token in normalized:
                return True
        elif normalized_token in parts:
            return True
    return False


def _field_has_any_hint(field: dict[str, Any], hints: set[str]) -> bool:
    return bool(hints.intersection(field.get("semantic_hints", [])))


def _product_key_field(fields: list[dict[str, Any]]) -> dict[str, Any] | None:
    product_tokens = {"product", "products", "asin", "sku", "item", "items"}
    excluded_tokens = {"order_id", "customer_id", "user_id", "session_id", "review_id"}
    for field in fields:
        if field.get("pii_candidate"):
            continue
        if _field_has_any_token(field, product_tokens) and not _field_has_any_token(field, excluded_tokens):
            return field
    return None


def _rating_signal_field(fields: list[dict[str, Any]]) -> dict[str, Any] | None:
    numeric_types = {"integer", "number"}
    scoped_score_tokens = {"review_score", "rating_score", "star_score", "product_score"}
    for field in fields:
        if field.get("inferred_type") not in numeric_types:
            continue
        blob = _field_blob(field)
        if _field_has_any_token(field, {"rating", "star"}) or any(token in blob for token in scoped_score_tokens):
            return field
    return None


def _review_text_signal_field(fields: list[dict[str, Any]]) -> dict[str, Any] | None:
    review_tokens = {"review", "comment", "sentiment", "complaint", "feedback"}
    for field in fields:
        if field.get("pii_candidate"):
            continue
        if field.get("inferred_type") not in {"string", "json"}:
            continue
        if _field_has_any_token(field, review_tokens) or _field_has_any_hint(field, {"review_signal_candidate"}):
            return field
    return None


def _first_field(
    fields: list[dict[str, Any]],
    *,
    hints: set[str] | None = None,
    tokens: set[str] | None = None,
) -> dict[str, Any] | None:
    matches = _fields_by_predicate(fields, hints=hints or set(), tokens=tokens or set())
    return matches[0] if matches else None


def _fields_by_tokens(fields: list[dict[str, Any]], tokens: set[str]) -> list[dict[str, Any]]:
    return _fields_by_predicate(fields, hints=set(), tokens=tokens)


def _fields_by_predicate(fields: list[dict[str, Any]], *, hints: set[str], tokens: set[str]) -> list[dict[str, Any]]:
    matches = []
    for field in fields:
        if hints.intersection(field["semantic_hints"]) or _field_has_any_token(field, tokens):
            matches.append(field)
    return matches


def _has_conversion_numerator_and_denominator(fields: list[dict[str, Any]]) -> bool:
    has_numerator = any(_field_has_any_token(field, {"conversion", "purchase", "order", "checkout"}) for field in fields)
    has_denominator = any(_field_has_any_token(field, {"session", "visit", "click", "impression", "view", "cart"}) for field in fields)
    return has_numerator and has_denominator


def _metric_template(
    *,
    metric_id: str,
    semantic_type: str,
    formula_template: str,
    status: str,
    required_source_evidence: list[str],
    available_fields: list[dict[str, Any] | None],
    missing_evidence: list[str],
    owner_review_required: bool,
    caveat: str,
) -> dict[str, Any]:
    return {
        "metric_id": metric_id,
        "semantic_type": semantic_type,
        "formula_template": formula_template,
        "status": status,
        "required_source_evidence": required_source_evidence,
        "available_source_fields": [_field_projection(field) for field in available_fields if field],
        "missing_source_evidence": missing_evidence,
        "owner_review_required": owner_review_required,
        "caveat": caveat,
    }


def _missing(labels: list[str], present: list[bool]) -> list[str]:
    return [label for label, exists in zip(labels, present, strict=False) if not exists]


def _missing_conversion(product_key: dict[str, Any] | None, fields: list[dict[str, Any]]) -> list[str]:
    missing = []
    if not product_key:
        missing.append("product/entity key")
    if not any(_field_has_any_token(field, {"conversion", "purchase", "order", "checkout"}) for field in fields):
        missing.append("conversion numerator event")
    if not any(_field_has_any_token(field, {"session", "visit", "click", "impression", "view", "cart"}) for field in fields):
        missing.append("eligible visit/session/impression denominator")
    return missing


def _missing_delivery(product_key: dict[str, Any] | None, fields: list[dict[str, Any]]) -> list[str]:
    missing = []
    if not product_key:
        missing.append("product/entity key")
    if not fields:
        missing.append("delivery date or lateness flag")
        missing.append("delivered order denominator")
    return missing


def _field_projection(field: dict[str, Any]) -> dict[str, Any]:
    return {
        "field_id": field["field_id"],
        "source_path": field["source_path"],
        "target_name": field["target_name_candidate"],
        "inferred_type": field["inferred_type"],
        "semantic_hints": field["semantic_hints"],
        "profile_confidence": field["profile_confidence"],
    }
