from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import ensure_dir, write_json


def build_l6(profile: dict[str, Any], l3: dict[str, Any], l4: dict[str, Any], l5: dict[str, Any], out_dir: Path, source_id: str) -> dict[str, Any]:
    layer_dir = out_dir / "l6"
    ensure_dir(layer_dir)
    lineage = [
        {
            "source_field": rule["source_field"],
            "silver_field": rule["target_field"],
            "action": rule["action"],
            "dominant_type": rule["dominant_type"],
        }
        for rule in l3["silver"]["silver_rules"]
    ]
    catalog = {
        "layer": "L6",
        "artifact_type": "catalog_metadata_draft",
        "source_id": source_id,
        "schema": {
            "format": profile["format_detection"]["format"],
            "field_count": profile["field_count"],
            "schema_fingerprint": profile["schema_fingerprint"],
        },
        "silver": {
            "transform_spec_ref": "../l4/silver_transform_spec.json",
            "spec_hash": l4["silver_spec"]["spec_hash"],
            "fields": [item["silver_field"] for item in lineage if item["action"] != "drop_candidate"],
        },
        "gold": {
            "generation_spec_ref": "../l4/gold_generation_spec.json",
            "selected_model_id": l4["gold_spec"].get("selected_model_id"),
            "candidates": l4["gold_spec"]["candidates"],
        },
        "quality": {
            "quality_gate_ref": "../l5/quality_gate_spec.json",
            "processing_status": l5["quality_gate"]["processing_quality"]["status"],
            "catalog_status": l5["quality_gate"]["catalog_safety"]["status"],
            "gold_status": l5["quality_gate"]["gold_readiness"]["status"],
        },
        "lineage_ref": "field_lineage.json",
    }
    context_pack = {
        "layer": "L6",
        "artifact_type": "semantic_handoff_context_pack",
        "source_id": source_id,
        "recommended_usage": [
            "Use Silver spec for row-level debugging and explainability.",
            "Use Gold generation spec for aggregate answer paths after owner approval.",
            "Always surface L5 caveats when catalog or Gold readiness is warn.",
        ],
        "avoid_or_warn": [
            "Do not claim full materialization was performed by M3.",
            "Do not hide parse, drift, PII, or Gold semantic warnings.",
        ],
    }
    write_json(layer_dir / "catalog_metadata_draft.json", catalog)
    write_json(layer_dir / "field_lineage.json", {"layer": "L6", "source_id": source_id, "lineage": lineage})
    write_json(layer_dir / "semantic_context_pack.json", context_pack)
    return {"catalog": catalog, "lineage": lineage, "context_pack": context_pack}
