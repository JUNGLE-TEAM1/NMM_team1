from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import ensure_dir, stable_json_hash, write_json


def build_l4(profile: dict[str, Any], l3: dict[str, Any], out_dir: Path, source_id: str) -> dict[str, Any]:
    layer_dir = out_dir / "l4"
    ensure_dir(layer_dir)
    silver_spec = {
        "layer": "L4",
        "artifact_type": "deterministic_silver_transform_spec",
        "source_id": source_id,
        "input_schema_fingerprint": profile["schema_fingerprint"],
        "execution_owner": "M2",
        "execution_contract": "dataframe-compatible-spec-no-local-runtime-config",
        "rules": l3["silver"]["silver_rules"],
        "output_contract": {
            "format": "parquet_or_table_by_M2_policy",
            "row_preservation": "default preserve parsed rows; quarantine/rescue lanes stay explicit",
        },
    }
    silver_spec["spec_hash"] = stable_json_hash(silver_spec)
    gold_spec = {
        "layer": "L4",
        "artifact_type": "gold_generation_spec",
        "source_id": source_id,
        "execution_owner": "M2",
        "execution_contract": "dataframe-compatible-spec-no-local-runtime-config",
        "candidates": l3["gold"]["gold_candidates"],
        "selected_model_id": l3["gold"]["gold_candidates"][0]["model_id"] if l3["gold"]["gold_candidates"] else None,
        "note": "M3 defines how Gold should be generated; M2 owns full materialization.",
    }
    gold_spec["spec_hash"] = stable_json_hash(gold_spec)
    graph = {
        "layer": "L4",
        "source_id": source_id,
        "nodes": [
            {"id": "l0_raw", "layer": "L0"},
            {"id": "l1_bronze", "layer": "L1"},
            {"id": "l2_profile", "layer": "L2"},
            {"id": "l3_recommendation", "layer": "L3"},
            {"id": "l4_silver_spec", "layer": "L4"},
            {"id": "l4_gold_spec", "layer": "L4"},
        ],
        "edges": [
            {"from": "l0_raw", "to": "l1_bronze"},
            {"from": "l1_bronze", "to": "l2_profile"},
            {"from": "l2_profile", "to": "l3_recommendation"},
            {"from": "l3_recommendation", "to": "l4_silver_spec"},
            {"from": "l4_silver_spec", "to": "l4_gold_spec"},
        ],
    }
    write_json(layer_dir / "silver_transform_spec.json", silver_spec)
    write_json(layer_dir / "gold_generation_spec.json", gold_spec)
    write_json(layer_dir / "layered_transform_graph.json", graph)
    return {"silver_spec": silver_spec, "gold_spec": gold_spec, "graph": graph}
