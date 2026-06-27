from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import ensure_dir, normalize_name, write_json


def _dominant_type(types: dict[str, int]) -> str:
    if not types:
        return "string"
    return sorted(types.items(), key=lambda item: (-item[1], item[0]))[0][0]


def _silver_rule(field: dict[str, Any]) -> dict[str, Any]:
    source = field["name"]
    target = normalize_name(source.replace("$.", "").replace("[]", "_item"))
    dominant = _dominant_type(field["types"])
    action = "keep"
    if field["null_ratio"] >= 0.98:
        action = "drop_candidate"
    elif dominant in {"object", "array"}:
        action = "flatten_candidate"
    return {
        "source_field": source,
        "target_field": target,
        "action": action,
        "dominant_type": dominant,
        "null_ratio": field["null_ratio"],
        "pii_hint": field["pii_hint"],
        "reason": "Deterministic profile-derived recommendation; user approval is required before production execution.",
    }


def _gold_candidates(fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
    names = {normalize_name(field["name"]): field for field in fields}
    candidates: list[dict[str, Any]] = []
    rating = next((name for name in names if "rating" in name or "overall" in name or "score" in name), None)
    product = next((name for name in names if "product" in name or "asin" in name or "item" in name), None)
    user = next((name for name in names if "user" in name or "reviewer" in name or "customer" in name), None)
    amount = next((name for name in names if "amount" in name or "fare" in name or "price" in name or "total" in name), None)
    time = next((name for name in names if "time" in name or "date" in name or "timestamp" in name), None)
    if product and rating:
        candidates.append({"model_id": "gold_product_rating_summary", "grain": [product], "measures": [{"field": rating, "agg": "avg"}, {"field": "*", "agg": "count"}]})
    if user:
        candidates.append({"model_id": "gold_user_activity_summary", "grain": [user], "measures": [{"field": "*", "agg": "count"}]})
    if time and amount:
        candidates.append({"model_id": "gold_time_amount_summary", "grain": [time], "measures": [{"field": amount, "agg": "sum"}, {"field": amount, "agg": "avg"}, {"field": "*", "agg": "count"}]})
    if not candidates:
        dimension = next((normalize_name(field["name"]) for field in fields if _dominant_type(field["types"]) in {"string", "integer_string"}), None)
        candidates.append({"model_id": "gold_record_count_summary", "grain": [dimension] if dimension else [], "measures": [{"field": "*", "agg": "count"}]})
    return candidates


def build_l3(profile: dict[str, Any], out_dir: Path, source_id: str) -> dict[str, Any]:
    layer_dir = out_dir / "l3"
    ensure_dir(layer_dir)
    fields = profile["fields"]
    silver_rules = [_silver_rule(field) for field in fields]
    gold_candidates = _gold_candidates(fields)
    ai_package = {
        "layer": "L3",
        "artifact_type": "ai_control_plane_package",
        "source_id": source_id,
        "row_level_ai_calls": 0,
        "allowed_ai_inputs": ["profile_snapshot", "schema_fingerprint", "bounded sample summaries", "candidate rules"],
        "blocked_ai_inputs": ["full raw stream", "per-row realtime data plane"],
        "profile_summary": {
            "format": profile["format_detection"]["format"],
            "field_count": profile["field_count"],
            "sample_rows": profile["sample_rows"],
            "schema_fingerprint": profile["schema_fingerprint"],
        },
    }
    silver_recommendation = {"layer": "L3", "source_id": source_id, "silver_rules": silver_rules}
    gold_recommendation = {"layer": "L3", "source_id": source_id, "gold_candidates": gold_candidates}
    review_questions = {
        "layer": "L3",
        "source_id": source_id,
        "questions": [
            "Which fields are business identifiers rather than PII?",
            "Which Gold candidate is the first user-facing aggregate model?",
            "Should null-heavy fields be dropped, quarantined, or retained for debugging?",
        ],
    }
    write_json(layer_dir / "ai_control_plane_package.json", ai_package)
    write_json(layer_dir / "silver_policy_recommendation.json", silver_recommendation)
    write_json(layer_dir / "gold_policy_recommendation.json", gold_recommendation)
    write_json(layer_dir / "review_questions.json", review_questions)
    return {"ai_package": ai_package, "silver": silver_recommendation, "gold": gold_recommendation}
