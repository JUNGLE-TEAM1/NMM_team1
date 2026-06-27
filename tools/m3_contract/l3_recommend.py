from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, semantic_hints, source_path_to_target, to_project_type, with_header, write_json


def _dominant_type(types: dict[str, int]) -> str:
    if not types:
        return "string"
    return sorted(types.items(), key=lambda item: (-item[1], item[0]))[0][0]


def build_l3(profile: dict[str, Any], out_dir: Path, source_id: str, run_id: str) -> dict[str, Any]:
    """Reduce L2 profile into an AI-safe evidence pack; no recommendation is made here."""

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
        },
    )
    write_json(layer_dir / "ai_recommendation_input_pack.json", input_pack)
    write_json(layer_dir / "field_evidence_reducer.json", reducer)
    write_json(layer_dir / "redaction_map.json", redaction)
    write_json(layer_dir / "policy_context_pack.json", policy_context)
    return {
        "input_pack": input_pack,
        "field_evidence": field_evidence,
        "reducer": reducer,
        "redaction_map": redaction,
        "policy_context": policy_context,
    }
