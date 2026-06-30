from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, semantic_hints, source_path_to_target, to_project_type, with_header, write_json


def _dominant_type(types: dict[str, int]) -> str:
    if not types:
        return "string"
    return sorted(types.items(), key=lambda item: (-item[1], item[0]))[0][0]


def build_l3(profile: dict[str, Any], out_dir: Path, source_id: str, run_id: str) -> dict[str, Any]:
    """Reduce L2 profile into AI-safe evidence packs; no executable recommendation is made here."""

    layer_dir = out_dir / "l3"
    ensure_dir(layer_dir)
    field_evidence = []
    redaction_map = []
    for index, field in enumerate(profile["fields"], start=1):
        dominant = _dominant_type(field["types"])
        field_id = f"field_{index:04d}"
        examples = [str(value)[:80] for value in field.get("example_values", [])[:3]]
        if field["pii_hint"]:
            examples = ["[REDACTED_PII]" for _ in examples]
        field_evidence.append(
            {
                "field_id": field_id,
                "source_path": field["name"],
                "target_name_candidate": source_path_to_target(field["name"]),
                "inferred_type": to_project_type(dominant),
                "dominant_raw_type": dominant,
                "nullable_ratio": field["null_ratio"],
                "example_values_redacted": examples,
                "pii_candidate": field["pii_hint"],
                "secret_candidate": False,
                "semantic_hints": semantic_hints(field["name"]),
                "profile_confidence": 0.85 if profile["format_detection"]["confidence"] >= 0.7 else 0.55,
            }
        )
        redaction_map.append(
            {
                "field_id": field_id,
                "source_path": field["name"],
                "redaction_applied": bool(field["pii_hint"]),
                "reason": "pii_candidate_name_match" if field["pii_hint"] else "not_required",
            }
        )
    data_shape_contract = profile.get("data_shape_contract", {})
    source_processing_contract = _source_processing_contract(profile)

    input_pack = with_header(
        layer="l3",
        name="ai_recommendation_input_pack",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l3.ai_input_pack.v2_1_1",
        access_class="ai_safe",
        body={
            "layer": "L3",
            "artifact_type": "ai_recommendation_input_pack",
            "source_id": source_id,
            "run_id": run_id,
            "profile_ref": artifact_ref("l2", "profile_snapshot", source_id, run_id),
            "redaction_policy_version": "m3.redaction.v2_1_1",
            "redaction_map_ref": artifact_ref("l3", "redaction_map", source_id, run_id),
            "data_shape_contract": data_shape_contract,
            "source_processing_contract": source_processing_contract,
            "evidence_budget": {
                "max_fields": len(field_evidence),
                "max_examples_per_field": 3,
                "max_total_chars": sum(len(str(value)) for field in field_evidence for value in field["example_values_redacted"]),
            },
            "field_evidence": field_evidence,
            "forbidden_raw_payload": True,
            "row_level_ai_calls": 0,
            "blocked_ai_inputs": ["full raw stream", "per-row realtime data plane", "unredacted rescue lane"],
        },
    )
    reducer = with_header(
        layer="l3",
        name="field_evidence_reducer",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l3.field_evidence_reducer.v2_1_1",
        access_class="profile_internal",
        body={
            "layer": "L3",
            "artifact_type": "field_evidence_reducer",
            "input_profile_ref": artifact_ref("l2", "profile_snapshot", source_id, run_id),
            "output_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "rules": [
                "drop full raw payload before AI",
                "cap examples per field",
                "redact PII candidates",
                "preserve null ratio and type evidence",
            ],
        },
    )
    redaction = with_header(
        layer="l3",
        name="redaction_map",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l3.redaction_map.v2_1_1",
        access_class="catalog_internal",
        body={"layer": "L3", "artifact_type": "redaction_map", "fields": redaction_map},
    )
    policy_context = with_header(
        layer="l3",
        name="policy_context_pack",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l3.policy_context_pack.v2_1_1",
        access_class="ai_safe",
        body={
            "layer": "L3",
            "artifact_type": "policy_context_pack",
            "silver_goal": "stable queryable table with explicit quarantine and exposure controls",
            "gold_goal": "optional owner-approved aggregate or metric model derived from Silver",
            "m3_scope_boundary": "recommendation/spec/catalog handoff only; no Spark session ownership and no production writes",
            "source_processing_contract": source_processing_contract,
        },
    )
    unknown_pack = _unknown_data_recommendation_pack(profile, field_evidence, source_id, run_id)
    metadata_index_plan = _metadata_retrieval_index_plan(profile, field_evidence, source_id, run_id)
    template_retrieval = _gold_template_candidate_retrieval(field_evidence, source_id, run_id)
    grounding_report = _candidate_grounding_report(field_evidence, template_retrieval, source_id, run_id)
    write_json(layer_dir / "ai_recommendation_input_pack.json", input_pack)
    write_json(layer_dir / "field_evidence_reducer.json", reducer)
    write_json(layer_dir / "redaction_map.json", redaction)
    write_json(layer_dir / "policy_context_pack.json", policy_context)
    write_json(layer_dir / "unknown_data_recommendation_pack.json", unknown_pack)
    write_json(layer_dir / "metadata_retrieval_index_plan.json", metadata_index_plan)
    write_json(layer_dir / "gold_template_candidate_retrieval.json", template_retrieval)
    write_json(layer_dir / "candidate_grounding_report.json", grounding_report)
    return {
        "input_pack": input_pack,
        "field_evidence": field_evidence,
        "reducer": reducer,
        "redaction_map": redaction,
        "policy_context": policy_context,
        "unknown_pack": unknown_pack,
        "metadata_index_plan": metadata_index_plan,
        "template_retrieval": template_retrieval,
        "grounding_report": grounding_report,
    }


def _unknown_data_recommendation_pack(
    profile: dict[str, Any],
    fields: list[dict[str, Any]],
    source_id: str,
    run_id: str,
) -> dict[str, Any]:
    domain_signals = _domain_signals(fields)
    vector_candidates = _vector_candidate_fields(fields)
    return with_header(
        layer="l3",
        name="unknown_data_recommendation_pack",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l3.unknown_data_recommendation_pack.v2_1_2",
        access_class="ai_safe",
        body={
            "layer": "L3",
            "artifact_type": "unknown_data_recommendation_pack",
            "recommendation_mode": "unknown_data_general",
            "input_pack_ref": artifact_ref("l3", "ai_recommendation_input_pack", source_id, run_id),
            "profile_ref": artifact_ref("l2", "profile_snapshot", source_id, run_id),
            "format_detection": profile["format_detection"],
            "data_shape_contract": profile.get("data_shape_contract", {}),
            "source_processing_contract": _source_processing_contract(profile),
            "source_shape": {
                "field_count": len(fields),
                "pii_candidate_count": sum(1 for field in fields if field["pii_candidate"]),
                "text_candidate_count": sum(1 for field in fields if "text_candidate" in field["semantic_hints"]),
                "measure_candidate_count": sum(1 for field in fields if "measure_candidate" in field["semantic_hints"]),
                "identifier_candidate_count": sum(1 for field in fields if "identifier_or_dimension" in field["semantic_hints"]),
                "time_candidate_count": sum(1 for field in fields if "time_candidate" in field["semantic_hints"]),
            },
            "domain_signal_summary": domain_signals,
            "generic_recommendation_targets": [
                {
                    "target": "silver_cleaning_policy",
                    "reason": "Unknown CSV/JSON/JSONL data first needs deterministic field selection, type normalization, null handling, PII handling, and quarantine rules.",
                    "output_layer": "L6 silver_policy_recommendation_draft",
                },
                {
                    "target": "general_gold_aggregate_candidate",
                    "reason": "Identifier, measure, and time hints can support owner-reviewed aggregate Gold models, but semantics remain draft until L9 approval.",
                    "output_layer": "L7 gold_model_recommendation_draft",
                },
                {
                    "target": "presentation_product_health_template",
                    "reason": "Review/product signals can seed a demo product health template; missing conversion or delivery signals must stay explicit instead of being invented.",
                    "output_layer": "L7 product_health_gold_template_draft",
                },
                {
                    "target": "vector_embedding_handoff_template",
                    "reason": "Text-like fields can be handed off for a downstream vector/index extension without making M3 compute embeddings or inspect raw rows.",
                    "output_layer": "L8 vector_embedding_handoff_template",
                },
            ],
            "vector_embedding_candidate_evidence": vector_candidates,
            "blocked_claims": [
                "L3 does not prove semantic product health correctness.",
                "L3 does not call AI per row or for every realtime event.",
                "L3 does not build embeddings, vector indexes, or retrieval chunks in core.",
                "L3 does not infer conversion_rate or late_delivery_rate without source evidence.",
            ],
        },
    )


def _domain_signals(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    signal_defs = [
        ("product_or_entity_key", ["identifier_or_dimension"], ["product", "asin", "sku", "item"]),
        ("review_feedback", ["review_signal_candidate"], ["review", "rating", "sentiment", "complaint"]),
        ("free_text", ["text_candidate"], ["text", "review", "comment", "description", "body"]),
        ("time_series", ["time_candidate"], ["time", "date", "timestamp"]),
        ("commercial_measure", ["measure_candidate"], ["price", "amount", "total", "score", "rating"]),
        ("conversion_event", ["conversion_signal_candidate"], ["conversion", "purchase", "order", "click", "impression", "cart", "checkout"]),
        ("delivery_event", ["delivery_signal_candidate"], ["delivery", "ship", "late", "arrival", "eta"]),
    ]
    signals: list[dict[str, Any]] = []
    for signal_name, required_hints, tokens in signal_defs:
        matched = [
            field
            for field in fields
            if any(hint in field["semantic_hints"] for hint in required_hints)
            or _field_has_any_token(field, set(tokens))
        ]
        signals.append(
            {
                "signal": signal_name,
                "status": "observed" if matched else "not_observed",
                "field_ids": [field["field_id"] for field in matched[:8]],
                "source_paths": [field["source_path"] for field in matched[:8]],
                "confidence": round(sum(field["profile_confidence"] for field in matched) / max(len(matched), 1), 3) if matched else 0.0,
            }
        )
    return signals


def _source_processing_contract(profile: dict[str, Any]) -> dict[str, Any]:
    contract = profile.get("data_shape_contract", {})
    structure_class = contract.get("structure_class", "unknown")
    core_status = contract.get("core_support_status", "unknown")
    return {
        "structure_class": structure_class,
        "core_support_status": core_status,
        "m3_processing_role": "control_plane_only",
        "m3_ai_usage": "AI/model may recommend policies from bounded profile evidence only; per-row or per-event AI is forbidden.",
        "large_data_strategy": "Use L0 source_unit/object/window refs plus bounded L1/L2 evidence; full execution metrics must come back from M2.",
        "realtime_strategy": "Represent stream batches as source_unit_id and stream_window_ids; watermark, checkpoint, and runtime backpressure are extension/runtime concerns.",
        "unstructured_strategy": "Create raw_text/vector handoff candidates, but do not build embeddings or retrieval indexes in M3 core.",
        "downstream_requirements": {
            "M2": "executes L10/L11 preview specs and returns execution/profile evidence",
            "M5": "stores decisions, artifacts, workflow state, and catalog package",
            "M6": "uses L16 SQL context/vector handoff with L15 caveats and exposure rules",
        },
    }


def _vector_candidate_fields(fields: list[dict[str, Any]]) -> dict[str, Any]:
    text_fields = [
        field
        for field in fields
        if "text_candidate" in field["semantic_hints"]
        or (field["inferred_type"] == "string" and any(token in field["source_path"].lower() for token in ["review", "comment", "description", "text", "title"]))
    ]
    entity_fields = [field for field in fields if "identifier_or_dimension" in field["semantic_hints"] and not field["pii_candidate"]]
    metadata_fields = [
        field
        for field in fields
        if not field["pii_candidate"]
        and field["field_id"] not in {item["field_id"] for item in text_fields[:12]}
        and field["inferred_type"] in {"integer", "number", "boolean", "timestamp", "string"}
    ]
    return {
        "status": "candidate_available" if text_fields else "not_available",
        "text_field_candidates": [_field_projection(field) for field in text_fields[:12]],
        "entity_key_candidates": [_field_projection(field) for field in entity_fields[:8]],
        "metadata_field_candidates": [_field_projection(field) for field in metadata_fields[:12]],
        "pii_exclusion_rule": "PII candidate fields are excluded from default embedding text and metadata candidates unless a later policy explicitly masks or approves them.",
    }


def _field_projection(field: dict[str, Any]) -> dict[str, Any]:
    return {
        "field_id": field["field_id"],
        "source_path": field["source_path"],
        "target_name_candidate": field["target_name_candidate"],
        "inferred_type": field["inferred_type"],
        "semantic_hints": field["semantic_hints"],
        "profile_confidence": field["profile_confidence"],
    }


def _metadata_retrieval_index_plan(
    profile: dict[str, Any],
    fields: list[dict[str, Any]],
    source_id: str,
    run_id: str,
) -> dict[str, Any]:
    documents = [
        {
            "doc_id": f"{source_id}:{run_id}:schema_profile",
            "document_type": "schema_profile",
            "text_for_embedding": (
                f"Source {source_id} format {profile['format_detection']['format']} has {len(fields)} fields. "
                "Use this profile to search compatible Gold templates and schema role hints."
            ),
            "payload": {
                "source_id": source_id,
                "run_id": run_id,
                "document_type": "schema_profile",
                "format": profile["format_detection"]["format"],
                "field_count": len(fields),
                "access_class": "ai_safe",
            },
        },
        {
            "doc_id": "gold_template:gold_product_health_v1",
            "document_type": "gold_template",
            "text_for_embedding": (
                "gold_product_health_v1 ecommerce product health template with product_id grain, rating or review_text review metrics, "
                "behavior event conversion metrics, delivery lateness metrics, and risk_score."
            ),
            "payload": {
                "template_id": "gold_product_health_v1",
                "domain": "ecommerce",
                "grain": "product_id",
                "required_fields": ["product_id"],
                "optional_fields": [
                    "product_name",
                    "category_l1",
                    "rating",
                    "review_text",
                    "event_type",
                    "view_count",
                    "purchase_count",
                    "delivery_status",
                    "delivery_delay",
                ],
                "output_columns": [
                    "product_id",
                    "product_name",
                    "category_l1",
                    "review_count",
                    "average_rating",
                    "negative_review_rate",
                    "view_count",
                    "purchase_count",
                    "conversion_rate",
                    "delivery_count",
                    "late_delivery_rate",
                    "risk_score",
                ],
                "access_class": "catalog_internal",
            },
        },
    ]
    for field in fields:
        documents.append(
            {
                "doc_id": f"{source_id}:{run_id}:column:{field['field_id']}",
                "document_type": "column_profile",
                "text_for_embedding": (
                    f"Column {field['target_name_candidate']} from source path {field['source_path']} "
                    f"has type {field['inferred_type']}, null ratio {field['nullable_ratio']}, "
                    f"role hints {field['semantic_hints']}."
                ),
                "payload": {
                    "source_id": source_id,
                    "run_id": run_id,
                    "document_type": "column_profile",
                    "field_id": field["field_id"],
                    "field_name": field["target_name_candidate"],
                    "source_path": field["source_path"],
                    "data_type": field["inferred_type"],
                    "role_hints": field["semantic_hints"],
                    "null_ratio": field["nullable_ratio"],
                    "pii_candidate": field["pii_candidate"],
                    "access_class": "ai_safe",
                },
            }
        )
    return with_header(
        layer="l3",
        name="metadata_retrieval_index_plan",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l3.metadata_retrieval_index_plan.v2_1_2",
        access_class="ai_safe",
        body={
            "layer": "L4",
            "legacy_layer": "L3A",
            "artifact_type": "metadata_retrieval_index_plan",
            "index_intent": "control_plane_schema_profile_template_search",
            "execution_owner": "M6_or_vector_extension",
            "m3_embedding_execution": False,
            "vector_db_target": "qdrant_or_pinecone_compatible",
            "documents": documents,
            "payload_filter_keys": [
                "source_id",
                "run_id",
                "document_type",
                "field_id",
                "field_name",
                "template_id",
                "domain",
                "access_class",
                "pii_candidate",
            ],
            "blocked_inputs": ["raw rows", "full rescue payload", "unredacted PII", "full realtime stream"],
        },
    )


def _gold_template_candidate_retrieval(
    fields: list[dict[str, Any]],
    source_id: str,
    run_id: str,
) -> dict[str, Any]:
    product_fields = _product_key_fields(fields)
    rating_fields = _rating_signal_fields(fields)
    review_text_fields = _review_text_signal_fields(fields)
    conversion_fields = _conversion_signal_fields(fields)
    delivery_fields = _delivery_signal_fields(fields)
    score = 0.0
    if product_fields:
        score += 0.25
    if rating_fields or review_text_fields:
        score += 0.25
    if _has_conversion_numerator_and_denominator(conversion_fields):
        score += 0.2
    elif conversion_fields:
        score += 0.08
    if delivery_fields:
        score += 0.15
    if product_fields and (rating_fields or review_text_fields):
        score += 0.15
    score = min(round(score, 3), 1.0)
    return with_header(
        layer="l3",
        name="gold_template_candidate_retrieval",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l3.gold_template_candidate_retrieval.v2_1_2",
        access_class="ai_safe",
        body={
            "layer": "L4",
            "legacy_layer": "L3B",
            "artifact_type": "gold_template_candidate_retrieval",
            "retrieval_mode": "deterministic_local_template_match_or_vector_top_k",
            "metadata_retrieval_index_plan_ref": artifact_ref("l3", "metadata_retrieval_index_plan", source_id, run_id),
            "top_k": 3,
            "template_candidates": [
                {
                    "template_id": "gold_product_health_v1",
                    "domain": "ecommerce",
                    "candidate_score": score,
                    "retrieval_reason": "Matched product/review/conversion/delivery schema signals against the product-health Gold template.",
                    "applicability_status": "candidate" if product_fields and (rating_fields or review_text_fields) else "needs_source_evidence",
                    "applicability_reason": (
                        "Product key plus review/rating evidence exists."
                        if product_fields and (rating_fields or review_text_fields)
                        else "A generic identifier, order id, amount, or free text field is not enough to claim product-health Gold applicability."
                    ),
                    "matched_fields": {
                        "product_key": [_field_projection(field) for field in product_fields[:5]],
                        "rating": [_field_projection(field) for field in rating_fields[:5]],
                        "review_text": [_field_projection(field) for field in review_text_fields[:5]],
                        "conversion": [_field_projection(field) for field in conversion_fields[:8]],
                        "delivery": [_field_projection(field) for field in delivery_fields[:8]],
                    },
                    "missing_or_weak_evidence": _product_health_missing_evidence(product_fields, rating_fields, review_text_fields, conversion_fields, delivery_fields),
                    "retrieval_boundary": "Candidate retrieval only; candidate must pass L5 grounding and L9 approval before deterministic execution.",
                }
            ],
            "blocked_claims": [
                "Vector similarity or template score is not proof that Gold values are correct.",
                "Template retrieval must not create conversion_rate or late_delivery_rate without denominator evidence.",
            ],
        },
    )


def _candidate_grounding_report(
    fields: list[dict[str, Any]],
    template_retrieval: dict[str, Any],
    source_id: str,
    run_id: str,
) -> dict[str, Any]:
    candidates = template_retrieval["template_candidates"]
    product_candidate = candidates[0] if candidates else None
    matched = product_candidate["matched_fields"] if product_candidate else {}
    product_key = matched.get("product_key", [])
    rating = matched.get("rating", [])
    review_text = matched.get("review_text", [])
    conversion = matched.get("conversion", [])
    delivery = matched.get("delivery", [])
    checks = [
        {
            "check": "embedding_similarity",
            "status": "candidate" if product_candidate and product_candidate["candidate_score"] > 0 else "not_available",
            "reason": "Template retrieval score is used only to shortlist candidates.",
        },
        {
            "check": "exact_name_type_compatibility",
            "status": "pass" if product_key and (rating or review_text) else "warn",
            "reason": "Product health needs product/asin/sku/item key plus review/rating evidence. Generic order/customer identifiers are intentionally not enough.",
        },
        {
            "check": "value_range_check",
            "status": "needs_preview",
            "reason": "L3 has bounded examples only; full value ranges must be confirmed by preview/stat pass.",
        },
        {
            "check": "join_overlap_check",
            "status": "needs_preview" if conversion or delivery else "not_applicable",
            "reason": "Cross-source product_id overlap must be verified by M2 preview before final Gold execution.",
        },
        {
            "check": "denominator_rule",
            "status": "pass" if _has_conversion_projection_numerator_and_denominator(conversion) and delivery else "warn",
            "reason": "Missing denominators keep conversion_rate or late_delivery_rate as needs_source_evidence.",
        },
        {
            "check": "pii_query_exposure_rule",
            "status": "pass" if not any(field["pii_candidate"] for field in fields if field["field_id"] in _matched_field_ids(product_candidate)) else "warn",
            "reason": "PII candidates cannot be used as default query or vector metadata without masking/approval.",
        },
        {
            "check": "spark_preview_validation",
            "status": "pending_l6_l7_l8",
            "reason": "M3 can draft the spec; M2 preview evidence must prove generation.",
        },
        {
            "check": "user_approval",
            "status": "pending_l5",
            "reason": "Gold template and risk weights require user/owner approval.",
        },
    ]
    return with_header(
        layer="l3",
        name="candidate_grounding_report",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l3.candidate_grounding_report.v2_1_2",
        access_class="ai_safe",
        body={
            "layer": "L5",
            "legacy_layer": "L3C",
            "artifact_type": "candidate_grounding_report",
            "template_retrieval_ref": artifact_ref("l3", "gold_template_candidate_retrieval", source_id, run_id),
            "grounding_checks": checks,
            "candidate_outputs": [
                {
                    "template_id": "gold_product_health_v1",
                    "allowed_to_l7_draft": bool(product_key and (rating or review_text)),
                    "allowed_to_l4_draft": bool(product_key and (rating or review_text)),
                    "allowed_to_l10_l11_compile_without_l9": False,
                    "allowed_to_l6_compile_without_l5": False,
                    "metric_grounding": {
                        "negative_review_rate": "candidate" if product_key and (rating or review_text) else "needs_source_evidence",
                        "risk_score": "policy_recommendation_candidate" if product_key and (rating or review_text) else "needs_source_evidence",
                        "conversion_rate": "candidate" if _has_conversion_projection_numerator_and_denominator(conversion) else "needs_source_evidence",
                        "late_delivery_rate": "candidate" if product_key and delivery else "needs_source_evidence",
                    },
                    "accuracy_boundary": "Grounding improves Gold candidate selection, not numeric Gold value correctness; L7 can draft only grounded candidates and L9 approval is still required.",
                }
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


def _product_key_fields(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    product_tokens = {"product", "products", "asin", "sku", "item", "items"}
    excluded_tokens = {"order_id", "customer_id", "user_id", "session_id", "review_id"}
    return [
        field
        for field in fields
        if not field.get("pii_candidate")
        and _field_has_any_token(field, product_tokens)
        and not _field_has_any_token(field, excluded_tokens)
    ]


def _rating_signal_fields(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    numeric_types = {"integer", "number"}
    rating_tokens = {"rating", "star"}
    scoped_score_tokens = {"review_score", "rating_score", "star_score", "product_score"}
    matches: list[dict[str, Any]] = []
    for field in fields:
        blob = _field_blob(field)
        if field.get("inferred_type") not in numeric_types:
            continue
        if _field_has_any_token(field, rating_tokens) or any(token in blob for token in scoped_score_tokens):
            matches.append(field)
    return matches


def _review_text_signal_fields(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    review_tokens = {"review", "comment", "sentiment", "complaint", "feedback"}
    return [
        field
        for field in fields
        if not field.get("pii_candidate")
        and field.get("inferred_type") in {"string", "json"}
        and (_field_has_any_token(field, review_tokens) or _field_has_any_hint(field, {"review_signal_candidate"}))
    ]


def _conversion_signal_fields(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    conversion_tokens = {"conversion", "purchase", "order", "session", "click", "impression", "view", "visit", "cart", "checkout"}
    return [field for field in fields if _field_has_any_token(field, conversion_tokens)]


def _delivery_signal_fields(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    delivery_tokens = {"delivery", "ship", "shipping", "late", "arrival", "delivered", "eta"}
    return [field for field in fields if _field_has_any_token(field, delivery_tokens)]


def _product_health_missing_evidence(
    product_fields: list[dict[str, Any]],
    rating_fields: list[dict[str, Any]],
    review_text_fields: list[dict[str, Any]],
    conversion_fields: list[dict[str, Any]],
    delivery_fields: list[dict[str, Any]],
) -> list[str]:
    missing = []
    if not product_fields:
        missing.append("product/entity key")
    if not rating_fields and not review_text_fields:
        missing.append("rating or review text")
    if not _has_conversion_numerator_and_denominator(conversion_fields):
        missing.append("conversion numerator and denominator")
    if not delivery_fields:
        missing.append("delivery lateness evidence")
    return missing


def _has_conversion_numerator_and_denominator(fields: list[dict[str, Any]]) -> bool:
    numerator = any(_field_has_any_token(field, {"conversion", "purchase", "order", "checkout"}) for field in fields)
    denominator = any(_field_has_any_token(field, {"session", "visit", "click", "impression", "view", "cart"}) for field in fields)
    return numerator and denominator


def _has_conversion_projection_numerator_and_denominator(fields: list[dict[str, Any]]) -> bool:
    numerator = any(_field_has_any_token(field, {"conversion", "purchase", "order", "checkout"}) for field in fields)
    denominator = any(_field_has_any_token(field, {"session", "visit", "click", "impression", "view", "cart"}) for field in fields)
    return numerator and denominator


def _matched_field_ids(candidate: dict[str, Any] | None) -> set[str]:
    if not candidate:
        return set()
    ids: set[str] = set()
    for group in candidate.get("matched_fields", {}).values():
        for field in group:
            ids.add(field["field_id"])
    return ids
