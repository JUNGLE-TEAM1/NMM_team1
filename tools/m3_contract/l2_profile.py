from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from .common import artifact_ref, csv_dialect, detect_format, ensure_dir, flatten_json, pii_hint, stable_json_hash, value_type, with_header, write_json


def _field_summary(stats: dict[str, dict[str, Any]], sample_count: int) -> list[dict[str, Any]]:
    fields: list[dict[str, Any]] = []
    for name, item in sorted(stats.items()):
        type_counts = dict(item["types"])
        null_count = type_counts.get("null", 0)
        fields.append(
            {
                "name": name,
                "types": type_counts,
                "observed_count": item["observed"],
                "null_ratio": round(null_count / sample_count, 6) if sample_count else 0.0,
                "example_values": item["examples"][:5],
                "pii_hint": pii_hint(name),
            }
        )
    return fields


def _record_field(stats: dict[str, dict[str, Any]], name: str, value: Any) -> None:
    if name not in stats:
        stats[name] = {"types": Counter(), "observed": 0, "examples": []}
    item = stats[name]
    item["types"][value_type(value)] += 1
    item["observed"] += 1
    if value is not None and len(item["examples"]) < 5:
        preview = str(value)
        item["examples"].append(preview[:200])


def _profile_jsonl(samples: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    stats: dict[str, dict[str, Any]] = {}
    parse_errors = 0
    parsed = 0
    for sample in samples:
        text = sample["raw_preview"].strip()
        if not text:
            continue
        try:
            value = json.loads(text)
        except json.JSONDecodeError:
            parse_errors += 1
            continue
        parsed += 1
        for name, item in flatten_json(value).items():
            _record_field(stats, name, item)
    return _field_summary(stats, max(parsed, 1)), {"parsed_rows": parsed, "parse_errors": parse_errors}


def _profile_json_document(samples: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    text = "\n".join(sample["raw_preview"] for sample in samples if sample["raw_preview"])
    if not text.strip():
        return [], {"json_mode": "document", "parsed_documents": 0, "parsed_rows": 0, "parse_errors": 0}
    try:
        value = json.loads(text)
    except json.JSONDecodeError:
        fields, stats = _profile_jsonl(samples)
        return fields, {**stats, "json_mode": "jsonl_fallback_after_document_parse_error", "parsed_documents": 0}

    stats: dict[str, dict[str, Any]] = {}
    if isinstance(value, list):
        record_count = len(value)
        for item in value:
            for name, child in flatten_json(item, "$[]").items():
                _record_field(stats, name, child)
    else:
        record_count = 1
        for name, child in flatten_json(value).items():
            _record_field(stats, name, child)
    return _field_summary(stats, max(record_count, 1)), {
        "json_mode": "document",
        "parsed_documents": 1,
        "parsed_rows": record_count,
        "parse_errors": 0,
    }


def _profile_csv(samples: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    lines = [row["raw_preview"] for row in samples if row["raw_preview"]]
    dialect = csv_dialect(lines)
    reader = csv.reader(lines, delimiter=dialect["delimiter"], quotechar=dialect["quotechar"] or '"')
    rows = list(reader)
    if not rows:
        return [], {"dialect": dialect, "parsed_rows": 0, "parse_errors": 0}
    has_header = bool(dialect["has_header"])
    header = rows[0] if has_header else [f"column_{index + 1}" for index in range(max(len(row) for row in rows))]
    data_rows = rows[1:] if has_header else rows
    stats: dict[str, dict[str, Any]] = {}
    width_conflicts = 0
    for row in data_rows:
        if len(row) != len(header):
            width_conflicts += 1
        for index, name in enumerate(header):
            _record_field(stats, name, row[index] if index < len(row) else None)
    return _field_summary(stats, max(len(data_rows), 1)), {"dialect": dialect, "parsed_rows": len(data_rows), "width_conflicts": width_conflicts}


def _data_shape_contract(
    *,
    fmt: str,
    detection: dict[str, Any],
    parser_stats: dict[str, Any],
    fields: list[dict[str, Any]],
    source_unit_ids: list[str],
    object_ids: list[str],
) -> dict[str, Any]:
    if fmt == "csv":
        structure_class = "structured_table"
        core_status = "core_profile_supported"
    elif fmt in {"json", "jsonl"}:
        structure_class = "semi_structured_records"
        core_status = "core_profile_supported"
    elif fmt == "text":
        structure_class = "unstructured_text_sample"
        core_status = "core_profile_supported_limited"
    else:
        structure_class = "extension_required"
        core_status = "m2_or_extension_profile_required"

    return {
        "declared_or_detected_format": fmt,
        "format_confidence": detection["confidence"],
        "structure_class": structure_class,
        "core_support_status": core_status,
        "profile_granularity": "field_profile" if fields and fmt != "text" else "raw_text_profile",
        "bounded_evidence": {
            "sampled_record_count": parser_stats.get("parsed_rows", 0),
            "field_count": len(fields),
            "source_unit_ids": source_unit_ids,
            "object_ids": object_ids,
            "full_data_scan_by_m3": False,
            "ai_data_plane_allowed": False,
        },
        "streaming_bigdata_contract": {
            "stream_runtime_owner": "M2_or_ingestion_runtime",
            "m3_runtime_role": "control_plane_profile_snapshot_and_spec_recommendation",
            "window_identity_required": "source_unit_id plus stream_window_ids when source_kind is stream_window or hybrid_window",
            "watermark_runtime_policy": "extension_hook_only_not_core",
            "per_event_ai_policy": "forbidden",
        },
        "format_handling_matrix": {
            "csv": "core bounded sample profile and deterministic Silver spec draft",
            "json": "core bounded sample profile, flatten snapshot, deterministic Silver spec draft",
            "jsonl": "core bounded sample profile, flatten snapshot, deterministic Silver spec draft",
            "text": "core raw_text profile plus vector handoff candidate only",
            "parquet": "not parsed natively by this lightweight CLI; use M2 Spark/profile extension hook and feed back a profile snapshot",
            "stream": "represent as source_unit_id/window metadata; runtime execution and watermarking stay outside M3 core",
        },
        "handoff_contract": {
            "to_m2": "L10/L11 preview_only specs plus source_unit/object/window scope; M2 performs Spark/local execution.",
            "to_m5": "L16 catalog sync package stores artifacts, decision status, and refs.",
            "to_m6": "L16 SQL/query context and vector-index template expose only approved/masked metadata.",
        },
        "claim_boundary": [
            "M3 profiles bounded evidence; it does not read every row with AI.",
            "M3 can recommend Silver/Gold specs; it does not own distributed runtime or production writes.",
            "Unstructured retrieval and Parquet-native profiling are extension hooks unless downstream profile evidence is supplied.",
        ],
    }


def build_l2(
    samples: list[dict[str, Any]],
    files: list[Path],
    l0: dict[str, Any],
    out_dir: Path,
    source_id: str,
    run_id: str,
    format_hint: str,
) -> dict[str, Any]:
    layer_dir = out_dir / "l2"
    ensure_dir(layer_dir)
    detection = detect_format(files, samples, format_hint)
    fmt = detection["format"]
    if fmt == "json":
        fields, parser_stats = _profile_json_document(samples)
    elif fmt == "jsonl":
        fields, parser_stats = _profile_jsonl(samples)
    elif fmt == "csv":
        fields, parser_stats = _profile_csv(samples)
    else:
        token_counts = defaultdict(int)
        for sample in samples:
            token_counts[value_type(sample["raw_preview"])] += 1
        fields = [{"name": "$raw_text", "types": dict(token_counts), "observed_count": len(samples), "null_ratio": 0.0, "example_values": [], "pii_hint": False}]
        parser_stats = {"parsed_rows": len(samples), "parse_errors": 0}
    schema_basis = [{"name": field["name"], "types": field["types"], "pii_hint": field["pii_hint"]} for field in fields]
    fingerprint = stable_json_hash({"format": fmt, "fields": schema_basis})
    source_unit_ids = [unit["source_unit_id"] for unit in l0["source_units"]]
    object_ids = [item["object_id"] for item in l0["objects"]]
    data_shape_contract = _data_shape_contract(
        fmt=fmt,
        detection=detection,
        parser_stats=parser_stats,
        fields=fields,
        source_unit_ids=source_unit_ids,
        object_ids=object_ids,
    )
    profile_body = {
        "layer": "L2",
        "artifact_type": "profile_snapshot",
        "source_id": source_id,
        "run_id": run_id,
        "format_detection": detection,
        "format_router": {
            "detected_format": fmt,
            "confidence": detection["confidence"],
            "evidence": [detection["reason"]],
        },
        "data_shape_contract": data_shape_contract,
        "sample_rows": len(samples),
        "field_count": len(fields),
        "fields": fields,
        "parser_stats": parser_stats,
        "schema_fingerprint": fingerprint,
        "profile_artifacts": [
            {
                "format": fmt,
                "scope": {
                    "source_unit_ids": source_unit_ids,
                    "object_ids": object_ids,
                    "stream_window_ids": [],
                    "record_path": "$lines[*]" if fmt == "jsonl" else "$",
                },
                "profile_ref": artifact_ref("l2", f"{fmt}_profile", source_id, run_id),
                "confidence": detection["confidence"],
            }
        ],
    }
    profile = with_header(
        layer="l2",
        name="profile_snapshot",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l2.profile_snapshot.v2_1_1",
        access_class="profile_internal",
        body=profile_body,
    )
    format_detection = with_header(
        layer="l2",
        name="format_detection",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l2.format_detection.v2_1_1",
        access_class="profile_internal",
        body={
            "layer": "L2",
            "artifact_type": "format_detection",
            "source_id": source_id,
            "run_id": run_id,
            **detection,
        },
    )
    format_profile = with_header(
        layer="l2",
        name=f"{fmt}_profile",
        source_id=source_id,
        run_id=run_id,
        schema_version=f"m3.l2.{fmt}_profile.v2_1_1",
        access_class="profile_internal",
        body={
            "layer": "L2",
            "artifact_type": f"{fmt}_profile",
            "source_id": source_id,
            "run_id": run_id,
            "scope": {"source_unit_ids": source_unit_ids, "object_ids": object_ids, "stream_window_ids": []},
            "data_shape_contract": data_shape_contract,
            "fields": fields,
            "parser_stats": parser_stats,
        },
    )
    fingerprint_artifact = with_header(
        layer="l2",
        name="schema_fingerprint",
        source_id=source_id,
        run_id=run_id,
        schema_version="m3.l2.schema_fingerprint.v2_1_1",
        access_class="profile_internal",
        body={"source_id": source_id, "run_id": run_id, "schema_fingerprint": fingerprint, "basis": schema_basis},
    )
    write_json(layer_dir / "format_detection.json", format_detection)
    write_json(layer_dir / "profile_snapshot.json", profile)
    write_json(layer_dir / f"{fmt}_profile.json", format_profile)
    write_json(layer_dir / "schema_fingerprint.json", fingerprint_artifact)
    return {"profile": profile, "schema_fingerprint": fingerprint, "format_detection": format_detection, "format_profile": format_profile}
