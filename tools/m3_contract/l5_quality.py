from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import ensure_dir, write_json


def build_l5(profile: dict[str, Any], l4: dict[str, Any], out_dir: Path, source_id: str) -> dict[str, Any]:
    layer_dir = out_dir / "l5"
    ensure_dir(layer_dir)
    pii_fields = [field["name"] for field in profile["fields"] if field["pii_hint"]]
    null_heavy = [field["name"] for field in profile["fields"] if field["null_ratio"] >= 0.98]
    quality_gate = {
        "layer": "L5",
        "artifact_type": "quality_gate_spec",
        "source_id": source_id,
        "status_model": ["pass", "warn", "fail", "quarantine"],
        "processing_quality": {
            "status": "warn" if profile["parser_stats"].get("parse_errors", 0) else "pass",
            "parse_errors": profile["parser_stats"].get("parse_errors", 0),
            "width_conflicts": profile["parser_stats"].get("width_conflicts", 0),
        },
        "catalog_safety": {
            "status": "warn" if pii_fields else "pass",
            "pii_candidate_fields": pii_fields,
            "null_heavy_fields": null_heavy,
        },
        "gold_readiness": {
            "status": "warn",
            "reason": "Gold spec is a recommendation until user/domain owner approval.",
            "selected_model_id": l4["gold_spec"].get("selected_model_id"),
        },
    }
    quarantine_policy = {
        "layer": "L5",
        "source_id": source_id,
        "lanes": [
            {"lane": "parse_error", "action": "quarantine_raw_pointer"},
            {"lane": "schema_conflict", "action": "preserve_rescued_data"},
            {"lane": "pii_warning", "action": "catalog_caveat_until_owner_decision"},
            {"lane": "gold_semantic_warning", "action": "require_user_confirmation_before_trusted_gold"},
        ],
    }
    drift_policy = {
        "layer": "L5",
        "source_id": source_id,
        "baseline_schema_fingerprint": profile["schema_fingerprint"],
        "on_new_field": "warn",
        "on_missing_field": "warn_or_fail_if_required_by_silver_spec",
        "on_type_change": "quarantine_or_schema_conflict",
    }
    write_json(layer_dir / "quality_gate_spec.json", quality_gate)
    write_json(layer_dir / "quarantine_policy.json", quarantine_policy)
    write_json(layer_dir / "schema_drift_policy.json", drift_policy)
    return {"quality_gate": quality_gate, "quarantine_policy": quarantine_policy, "drift_policy": drift_policy}
