from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

from .common import artifact_ref, ensure_dir, source_uri, utc_now, with_header, write_json, write_jsonl


def build_l1(
    l0: dict[str, Any],
    out_dir: Path,
    source_id: str,
    run_id: str,
    max_rows: int,
    max_bytes: int,
) -> dict[str, Any]:
    """Create a Bronze envelope contract and bounded sample lane."""

    layer_dir = out_dir / "l1"
    ensure_dir(layer_dir)
    object_by_path = {item["path"]: item for item in l0["objects"]}
    samples = _sample_bronze_records(l0["files"], object_by_path, source_id, run_id, max_rows, max_bytes)
    envelope_manifest = with_header(
        layer="l1",
        name="bronze_envelope_samples",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l1.bronze_envelope_samples.v2_1_1",
        access_class="profile_internal",
        body={
            "layer": "L1",
            "artifact_type": "bronze_envelope_samples_manifest",
            "source_id": source_id,
            "run_id": run_id,
            "object_stream_manifest_ref": artifact_ref("l0", "object_stream_manifest", source_id, run_id),
            "sample_record_count": len(samples),
            "sample_lane": {
                "row_limit": max_rows,
                "byte_limit": max_bytes,
                "policy": "bounded control-plane sample only; full Bronze execution belongs to M2.",
            },
            "jsonl_artifact": "bronze_envelope_samples.jsonl",
        },
    )
    rescue_manifest = with_header(
        layer="l1",
        name="rescue_lane",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l1.rescue_lane.v2_1_1",
        access_class="profile_internal",
        body={
            "layer": "L1",
            "artifact_type": "rescue_lane_manifest",
            "source_id": source_id,
            "run_id": run_id,
            "rescue_lane_required": True,
            "jsonl_artifact": "rescue_lane.jsonl",
            "rules": [
                {
                    "when": "record cannot be parsed",
                    "parse_status": "parse_error",
                    "action": "preserve source pointer, raw hash, redacted snippet, and error class",
                },
                {
                    "when": "field type conflicts with selected schema",
                    "parse_status": "schema_conflict",
                    "action": "preserve rescued field payload outside query context",
                },
            ],
        },
    )
    envelope_spec = with_header(
        layer="l1",
        name="bronze_envelope_spec",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l1.bronze_envelope_spec.v2_1_1",
        access_class="catalog_internal",
        body={
            "layer": "L1",
            "artifact_type": "bronze_envelope_spec",
            "source_id": source_id,
            "run_id": run_id,
            "required_columns": [
                "record_id",
                "source_manifest_ref",
                "object_stream_manifest_ref",
                "source_unit_id",
                "record_locator",
                "parse_status",
                "payload",
                "raw_snippet_status",
                "ingest_time",
            ],
            "parse_status_values": ["parsed", "parse_failed", "encoding_failed", "schema_exception", "unsupported_format"],
            "optional_artifact_reference_fields": ["checkpoint_artifact_ref"],
            "locator_rule": "object-backed records require object_id plus line, byte, json_path, or parquet_row_group locator; stream-backed records require stream_window_id plus offset/checkpoint anchor. Do not emit *_ref fields when the artifact does not exist.",
        },
    )
    write_json(layer_dir / "bronze_envelope_samples.manifest.json", envelope_manifest)
    write_json(layer_dir / "rescue_lane.manifest.json", rescue_manifest)
    write_json(layer_dir / "bronze_envelope_spec.json", envelope_spec)
    write_jsonl(layer_dir / "bronze_envelope_samples.jsonl", samples)
    write_jsonl(layer_dir / "rescue_lane.jsonl", [])
    write_jsonl(layer_dir / "sample_records.jsonl", samples)
    return {
        "samples": samples,
        "envelope_manifest": envelope_manifest,
        "rescue_manifest": rescue_manifest,
        "envelope_spec": envelope_spec,
        "rescue_records": [],
    }


def _sample_bronze_records(
    files: list[Path],
    object_by_path: dict[str, dict[str, Any]],
    source_id: str,
    run_id: str,
    max_rows: int,
    max_bytes: int,
) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    consumed = 0
    for path in files:
        source_object = object_by_path[str(path)]
        with path.open("rb") as handle:
            byte_start = 0
            for line_number, raw in enumerate(handle, start=1):
                if len(rows) >= max_rows or consumed >= max_bytes:
                    return rows
                byte_end = byte_start + len(raw)
                consumed += len(raw)
                text = raw.decode("utf-8", errors="replace").rstrip("\r\n")
                rows.append(
                    {
                        "record_id": f"{source_id}_{run_id}_record_{len(rows) + 1:08d}",
                        "source_manifest_ref": artifact_ref("l0", "source_manifest", source_id, run_id),
                        "object_stream_manifest_ref": artifact_ref("l0", "object_stream_manifest", source_id, run_id),
                        "source_unit_id": source_object["source_unit_id"],
                        "stream_window_id": None,
                        "record_locator": {
                            "object_id": source_object["object_id"],
                            "line_number": line_number,
                            "byte_start": byte_start,
                            "byte_end": byte_end,
                            "json_path": None,
                            "parquet_row_group": None,
                            "stream_partition": None,
                            "stream_offset": None,
                        },
                        "parse_status": "parsed",
                        "source_format": "unknown",
                        "payload": text[:1000],
                        "raw_preview": text[:1000],
                        "raw_sha256": hashlib.sha256(raw).hexdigest(),
                        "raw_snippet_status": "inline_redacted_preview_only",
                        "raw_size_bytes": len(raw),
                        "source_uri": source_uri(path),
                        "source_path": str(path),
                        "row_number_hint": line_number,
                        "ingest_time": utc_now(),
                        "event_time_candidate": None,
                    }
                )
                byte_start = byte_end
    return rows
