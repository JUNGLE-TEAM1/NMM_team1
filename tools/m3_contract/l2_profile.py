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
    if fmt in {"json", "jsonl"}:
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
    write_json(layer_dir / "format_detection.json", detection)
    write_json(layer_dir / "profile_snapshot.json", profile)
    write_json(layer_dir / f"{fmt}_profile.json", format_profile)
    write_json(layer_dir / "schema_fingerprint.json", fingerprint_artifact)
    return {"profile": profile, "schema_fingerprint": fingerprint, "format_profile": format_profile}
