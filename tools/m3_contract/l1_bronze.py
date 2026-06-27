from __future__ import annotations

from pathlib import Path
from typing import Any

from .common import ensure_dir, sample_text_lines, write_json, write_jsonl


def build_l1(
    files: list[Path],
    out_dir: Path,
    source_id: str,
    max_rows: int,
    max_bytes: int,
) -> dict[str, Any]:
    """Create a Bronze envelope contract and bounded sample lane."""
    layer_dir = out_dir / "l1"
    ensure_dir(layer_dir)
    samples = sample_text_lines(files, max_rows=max_rows, max_bytes=max_bytes)
    envelope_spec = {
        "layer": "L1",
        "artifact_type": "bronze_envelope_spec",
        "source_id": source_id,
        "required_columns": [
            "_source_uri",
            "_source_path",
            "_row_number_hint",
            "_raw_sha256",
            "_ingest_time",
            "_parse_status",
            "_rescued_data",
            "_quarantine_reason",
        ],
        "parse_status_values": ["parsed", "parse_error", "schema_conflict", "quarantined"],
        "sample_lane": {
            "row_limit": max_rows,
            "byte_limit": max_bytes,
            "sample_rows": len(samples),
            "policy": "bounded control-plane sample only; full Bronze execution belongs to M2.",
        },
    }
    rescue_policy = {
        "layer": "L1",
        "source_id": source_id,
        "rescue_lane_required": True,
        "rules": [
            {"when": "record cannot be parsed", "parse_status": "parse_error", "action": "preserve raw pointer and raw hash"},
            {"when": "field type conflicts with selected schema", "parse_status": "schema_conflict", "action": "preserve rescued field payload"},
        ],
    }
    write_json(layer_dir / "bronze_envelope_spec.json", envelope_spec)
    write_json(layer_dir / "rescue_policy.json", rescue_policy)
    write_jsonl(layer_dir / "sample_records.jsonl", samples)
    return {"samples": samples, "envelope_spec": envelope_spec, "rescue_policy": rescue_policy}
