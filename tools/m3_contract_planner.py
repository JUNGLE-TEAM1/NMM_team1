from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, value: Any) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    ensure_dir(path.parent)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def stable_hash(value: Any) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def source_files(source: Path) -> list[Path]:
    if source.is_file():
        return [source]
    if source.is_dir():
        return sorted(path for path in source.rglob("*") if path.is_file())
    raise FileNotFoundError(source)


def source_uri(path: Path) -> str:
    return path.resolve().as_uri()


def fingerprint(path: Path, mode: str, prefix_bytes: int) -> dict[str, Any]:
    stat = path.stat()
    item: dict[str, Any] = {
        "path": str(path),
        "uri": source_uri(path),
        "size_bytes": stat.st_size,
        "modified_time_utc": datetime.fromtimestamp(stat.st_mtime, timezone.utc).replace(microsecond=0).isoformat(),
        "checksum_mode": mode,
    }
    if mode == "none":
        return item | {"checksum": None}
    digest = hashlib.sha256()
    remaining = stat.st_size if mode == "full" else min(stat.st_size, prefix_bytes)
    with path.open("rb") as handle:
        while remaining > 0:
            chunk = handle.read(min(1024 * 1024, remaining))
            if not chunk:
                break
            digest.update(chunk)
            remaining -= len(chunk)
    return item | {"checksum_algorithm": "sha256", "checksum": digest.hexdigest(), "checksum_bytes": stat.st_size if mode == "full" else min(stat.st_size, prefix_bytes)}


def sample_lines(files: list[Path], max_rows: int, max_bytes: int) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    consumed = 0
    for path in files:
        with path.open("rb") as handle:
            for row_number, raw in enumerate(handle, start=1):
                if len(rows) >= max_rows or consumed >= max_bytes:
                    return rows
                consumed += len(raw)
                rows.append(
                    {
                        "source_uri": source_uri(path),
                        "source_path": str(path),
                        "row_number_hint": row_number,
                        "raw_sha256": hashlib.sha256(raw).hexdigest(),
                        "raw_preview": raw.decode("utf-8", errors="replace").rstrip("\r\n")[:1000],
                        "raw_size_bytes": len(raw),
                    }
                )
    return rows


def value_type(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int) and not isinstance(value, bool):
        return "integer"
    if isinstance(value, float):
        return "number"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    text = str(value)
    if re.fullmatch(r"-?\d+", text):
        return "integer_string"
    if re.fullmatch(r"-?(\d+\.\d+|\d+)", text):
        return "number_string"
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}([ T].*)?", text):
        return "datetime_string"
    return "string"


def normalize(name: str) -> str:
    text = re.sub(r"[^0-9A-Za-z_]+", "_", name.strip().lower())
    return re.sub(r"_+", "_", text).strip("_") or "field"


def pii_hint(name: str) -> bool:
    lowered = name.lower()
    return any(token in lowered for token in ["email", "phone", "address", "name", "user", "customer", "ssn", "ip"])


def flatten(value: Any, prefix: str = "$", depth: int = 8) -> dict[str, Any]:
    if depth < 0:
        return {prefix: value}
    if isinstance(value, dict):
        out: dict[str, Any] = {}
        for key, child in value.items():
            out.update(flatten(child, f"{prefix}.{key}", depth - 1))
        return out or {prefix: {}}
    if isinstance(value, list):
        out = {prefix: value}
        if value:
            out.update(flatten(value[0], f"{prefix}[]", depth - 1))
        return out
    return {prefix: value}


def detect_format(files: list[Path], rows: list[dict[str, Any]], hint: str) -> dict[str, Any]:
    if hint != "auto":
        return {"format": hint, "confidence": 1.0, "reason": "explicit format hint"}
    suffixes = Counter(path.suffix.lower() for path in files)
    if suffixes[".csv"]:
        return {"format": "csv", "confidence": 0.85, "reason": "csv extension"}
    if suffixes[".jsonl"] or suffixes[".ndjson"]:
        return {"format": "jsonl", "confidence": 0.9, "reason": "json lines extension"}
    if suffixes[".json"]:
        return {"format": "json", "confidence": 0.8, "reason": "json extension"}
    parsed = 0
    delimiters: Counter[str] = Counter()
    for row in rows[:100]:
        text = row["raw_preview"].strip()
        try:
            json.loads(text)
            parsed += 1
        except json.JSONDecodeError:
            pass
        for delimiter in [",", "\t", "|", ";"]:
            delimiters[delimiter] += int(delimiter in text)
    if rows and parsed / max(len(rows[:100]), 1) > 0.8:
        return {"format": "jsonl", "confidence": 0.75, "reason": "sample rows parse as JSON"}
    if delimiters:
        delimiter, votes = delimiters.most_common(1)[0]
        if votes:
            return {"format": "csv", "confidence": min(0.7, votes / max(len(rows[:100]), 1)), "reason": f"delimiter {delimiter!r} appears in sample"}
    return {"format": "text", "confidence": 0.2, "reason": "no reliable structured signal"}


def csv_dialect(lines: list[str]) -> dict[str, Any]:
    text = "\n".join(lines[:50])
    if not text:
        return {"delimiter": ",", "quotechar": '"', "has_header": False, "confidence": 0.0}
    try:
        dialect = csv.Sniffer().sniff(text)
        return {"delimiter": dialect.delimiter, "quotechar": dialect.quotechar, "has_header": csv.Sniffer().has_header(text), "confidence": 0.8}
    except csv.Error:
        return {"delimiter": ",", "quotechar": '"', "has_header": False, "confidence": 0.2}


def summarize_fields(stats: dict[str, dict[str, Any]], count: int) -> list[dict[str, Any]]:
    fields = []
    for name, item in sorted(stats.items()):
        type_counts = dict(item["types"])
        fields.append(
            {
                "name": name,
                "types": type_counts,
                "observed_count": item["observed"],
                "null_ratio": round(type_counts.get("null", 0) / max(count, 1), 6),
                "example_values": item["examples"][:5],
                "pii_hint": pii_hint(name),
            }
        )
    return fields


def record(stats: dict[str, dict[str, Any]], name: str, value: Any) -> None:
    stats.setdefault(name, {"types": Counter(), "observed": 0, "examples": []})
    stats[name]["types"][value_type(value)] += 1
    stats[name]["observed"] += 1
    if value is not None and len(stats[name]["examples"]) < 5:
        stats[name]["examples"].append(str(value)[:200])


def profile_json(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    stats: dict[str, dict[str, Any]] = {}
    parsed = errors = 0
    for row in rows:
        try:
            value = json.loads(row["raw_preview"].strip())
        except json.JSONDecodeError:
            errors += 1
            continue
        parsed += 1
        for name, child in flatten(value).items():
            record(stats, name, child)
    return summarize_fields(stats, parsed), {"parsed_rows": parsed, "parse_errors": errors}


def profile_csv(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    lines = [row["raw_preview"] for row in rows if row["raw_preview"]]
    dialect = csv_dialect(lines)
    parsed_rows = list(csv.reader(lines, delimiter=dialect["delimiter"], quotechar=dialect["quotechar"] or '"'))
    if not parsed_rows:
        return [], {"dialect": dialect, "parsed_rows": 0, "parse_errors": 0}
    header = parsed_rows[0] if dialect["has_header"] else [f"column_{index + 1}" for index in range(max(len(row) for row in parsed_rows))]
    data_rows = parsed_rows[1:] if dialect["has_header"] else parsed_rows
    stats: dict[str, dict[str, Any]] = {}
    width_conflicts = 0
    for row in data_rows:
        width_conflicts += int(len(row) != len(header))
        for index, name in enumerate(header):
            record(stats, name, row[index] if index < len(row) else None)
    return summarize_fields(stats, len(data_rows)), {"dialect": dialect, "parsed_rows": len(data_rows), "width_conflicts": width_conflicts}


def build_l0(files: list[Path], out: Path, source: Path, source_id: str, checksum_mode: str, checksum_bytes: int) -> dict[str, Any]:
    objects = [fingerprint(path, checksum_mode, checksum_bytes) for path in files]
    manifest = {
        "layer": "L0",
        "artifact_type": "raw_preservation_manifest",
        "source_id": source_id,
        "created_at": utc_now(),
        "source_root": str(source),
        "object_count": len(objects),
        "total_size_bytes": sum(item["size_bytes"] for item in objects),
        "objects": objects,
        "raw_policy": {"copy_raw_payload": False, "mutate_raw_payload": False, "default_checksum_mode": checksum_mode},
    }
    manifest["manifest_hash"] = stable_hash(manifest)
    write_json(out / "l0" / "raw_manifest.json", manifest)
    write_json(out / "l0" / "replay_manifest.json", {"layer": "L0", "source_id": source_id, "object_uris": [item["uri"] for item in objects], "manifest_hash": manifest["manifest_hash"]})
    return manifest


def build_l1(files: list[Path], out: Path, source_id: str, max_rows: int, max_bytes: int) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    rows = sample_lines(files, max_rows, max_bytes)
    spec = {
        "layer": "L1",
        "artifact_type": "bronze_envelope_spec",
        "source_id": source_id,
        "required_columns": ["_source_uri", "_source_path", "_row_number_hint", "_raw_sha256", "_ingest_time", "_parse_status", "_rescued_data", "_quarantine_reason"],
        "parse_status_values": ["parsed", "parse_error", "schema_conflict", "quarantined"],
        "sample_lane": {"row_limit": max_rows, "byte_limit": max_bytes, "sample_rows": len(rows), "full_execution_owner": "M2"},
    }
    write_json(out / "l1" / "bronze_envelope_spec.json", spec)
    write_json(out / "l1" / "rescue_policy.json", {"layer": "L1", "source_id": source_id, "rescue_lane_required": True, "action": "preserve raw pointer, raw hash, and rescued payload"})
    write_jsonl(out / "l1" / "sample_records.jsonl", rows)
    return rows, spec


def build_l2(rows: list[dict[str, Any]], files: list[Path], out: Path, source_id: str, hint: str) -> dict[str, Any]:
    detection = detect_format(files, rows, hint)
    fmt = detection["format"]
    if fmt in {"json", "jsonl"}:
        fields, parser_stats = profile_json(rows)
    elif fmt == "csv":
        fields, parser_stats = profile_csv(rows)
    else:
        counts = defaultdict(int)
        for row in rows:
            counts[value_type(row["raw_preview"])] += 1
        fields = [{"name": "$raw_text", "types": dict(counts), "observed_count": len(rows), "null_ratio": 0.0, "example_values": [], "pii_hint": False}]
        parser_stats = {"parsed_rows": len(rows), "parse_errors": 0}
    schema_basis = [{"name": field["name"], "types": field["types"], "pii_hint": field["pii_hint"]} for field in fields]
    profile = {
        "layer": "L2",
        "artifact_type": "profile_snapshot",
        "source_id": source_id,
        "format_detection": detection,
        "sample_rows": len(rows),
        "field_count": len(fields),
        "fields": fields,
        "parser_stats": parser_stats,
        "schema_fingerprint": stable_hash({"format": fmt, "fields": schema_basis}),
    }
    write_json(out / "l2" / "format_detection.json", detection)
    write_json(out / "l2" / "profile_snapshot.json", profile)
    write_json(out / "l2" / "schema_fingerprint.json", {"source_id": source_id, "schema_fingerprint": profile["schema_fingerprint"], "basis": schema_basis})
    return profile


def dominant_type(field: dict[str, Any]) -> str:
    return sorted(field["types"].items(), key=lambda item: (-item[1], item[0]))[0][0] if field["types"] else "string"


def build_l3(profile: dict[str, Any], out: Path, source_id: str) -> dict[str, Any]:
    rules = []
    names = {normalize(field["name"]): field for field in profile["fields"]}
    for field in profile["fields"]:
        dtype = dominant_type(field)
        action = "drop_candidate" if field["null_ratio"] >= 0.98 else "flatten_candidate" if dtype in {"object", "array"} else "keep"
        rules.append({"source_field": field["name"], "target_field": normalize(field["name"].replace("$.", "").replace("[]", "_item")), "action": action, "dominant_type": dtype, "null_ratio": field["null_ratio"], "pii_hint": field["pii_hint"]})
    rating = next((name for name in names if "rating" in name or "overall" in name or "score" in name), None)
    product = next((name for name in names if "product" in name or "asin" in name or "item" in name), None)
    user = next((name for name in names if "user" in name or "reviewer" in name or "customer" in name), None)
    amount = next((name for name in names if "amount" in name or "fare" in name or "price" in name or "total" in name), None)
    time = next((name for name in names if "time" in name or "date" in name or "timestamp" in name), None)
    gold = []
    if product and rating:
        gold.append({"model_id": "gold_product_rating_summary", "grain": [product], "measures": [{"field": rating, "agg": "avg"}, {"field": "*", "agg": "count"}]})
    if user:
        gold.append({"model_id": "gold_user_activity_summary", "grain": [user], "measures": [{"field": "*", "agg": "count"}]})
    if time and amount:
        gold.append({"model_id": "gold_time_amount_summary", "grain": [time], "measures": [{"field": amount, "agg": "sum"}, {"field": amount, "agg": "avg"}, {"field": "*", "agg": "count"}]})
    if not gold:
        dimension = next((normalize(field["name"]) for field in profile["fields"] if dominant_type(field) in {"string", "integer_string"}), None)
        gold.append({"model_id": "gold_record_count_summary", "grain": [dimension] if dimension else [], "measures": [{"field": "*", "agg": "count"}]})
    package = {"layer": "L3", "source_id": source_id, "row_level_ai_calls": 0, "allowed_ai_inputs": ["profile_snapshot", "schema_fingerprint", "bounded sample summaries", "candidate rules"], "blocked_ai_inputs": ["full raw stream", "per-row realtime data plane"]}
    write_json(out / "l3" / "ai_control_plane_package.json", package)
    write_json(out / "l3" / "silver_policy_recommendation.json", {"layer": "L3", "source_id": source_id, "silver_rules": rules})
    write_json(out / "l3" / "gold_policy_recommendation.json", {"layer": "L3", "source_id": source_id, "gold_candidates": gold})
    return {"silver_rules": rules, "gold_candidates": gold, "ai_package": package}


def build_l4(profile: dict[str, Any], recommendation: dict[str, Any], out: Path, source_id: str) -> dict[str, Any]:
    silver = {"layer": "L4", "artifact_type": "deterministic_silver_transform_spec", "source_id": source_id, "input_schema_fingerprint": profile["schema_fingerprint"], "execution_owner": "M2", "execution_contract": "dataframe-compatible-spec-no-local-runtime-config", "rules": recommendation["silver_rules"]}
    silver["spec_hash"] = stable_hash(silver)
    gold = {"layer": "L4", "artifact_type": "gold_generation_spec", "source_id": source_id, "execution_owner": "M2", "execution_contract": "dataframe-compatible-spec-no-local-runtime-config", "candidates": recommendation["gold_candidates"], "selected_model_id": recommendation["gold_candidates"][0]["model_id"] if recommendation["gold_candidates"] else None}
    gold["spec_hash"] = stable_hash(gold)
    graph = {"layer": "L4", "source_id": source_id, "nodes": [{"id": f"l{index}", "layer": f"L{index}"} for index in range(5)], "edges": [{"from": "l0", "to": "l1"}, {"from": "l1", "to": "l2"}, {"from": "l2", "to": "l3"}, {"from": "l3", "to": "l4"}]}
    write_json(out / "l4" / "silver_transform_spec.json", silver)
    write_json(out / "l4" / "gold_generation_spec.json", gold)
    write_json(out / "l4" / "layered_transform_graph.json", graph)
    return {"silver_spec": silver, "gold_spec": gold, "graph": graph}


def build_l5(profile: dict[str, Any], specs: dict[str, Any], out: Path, source_id: str) -> dict[str, Any]:
    pii = [field["name"] for field in profile["fields"] if field["pii_hint"]]
    null_heavy = [field["name"] for field in profile["fields"] if field["null_ratio"] >= 0.98]
    quality = {
        "layer": "L5",
        "artifact_type": "quality_gate_spec",
        "source_id": source_id,
        "status_model": ["pass", "warn", "fail", "quarantine"],
        "processing_quality": {"status": "warn" if profile["parser_stats"].get("parse_errors", 0) else "pass", **profile["parser_stats"]},
        "catalog_safety": {"status": "warn" if pii else "pass", "pii_candidate_fields": pii, "null_heavy_fields": null_heavy},
        "gold_readiness": {"status": "warn", "reason": "Gold spec is a recommendation until domain owner approval.", "selected_model_id": specs["gold_spec"].get("selected_model_id")},
    }
    write_json(out / "l5" / "quality_gate_spec.json", quality)
    write_json(out / "l5" / "quarantine_policy.json", {"layer": "L5", "source_id": source_id, "lanes": ["parse_error", "schema_conflict", "pii_warning", "gold_semantic_warning"]})
    write_json(out / "l5" / "schema_drift_policy.json", {"layer": "L5", "source_id": source_id, "baseline_schema_fingerprint": profile["schema_fingerprint"], "on_new_field": "warn", "on_missing_field": "warn_or_fail_if_required_by_silver_spec", "on_type_change": "quarantine_or_schema_conflict"})
    return quality


def build_l6(profile: dict[str, Any], recommendation: dict[str, Any], specs: dict[str, Any], quality: dict[str, Any], out: Path, source_id: str) -> dict[str, Any]:
    lineage = [{"source_field": rule["source_field"], "silver_field": rule["target_field"], "action": rule["action"], "dominant_type": rule["dominant_type"]} for rule in recommendation["silver_rules"]]
    catalog = {
        "layer": "L6",
        "artifact_type": "catalog_metadata_draft",
        "source_id": source_id,
        "schema": {"format": profile["format_detection"]["format"], "field_count": profile["field_count"], "schema_fingerprint": profile["schema_fingerprint"]},
        "silver": {"transform_spec_ref": "../l4/silver_transform_spec.json", "spec_hash": specs["silver_spec"]["spec_hash"], "fields": [item["silver_field"] for item in lineage if item["action"] != "drop_candidate"]},
        "gold": {"generation_spec_ref": "../l4/gold_generation_spec.json", "selected_model_id": specs["gold_spec"].get("selected_model_id"), "candidates": specs["gold_spec"]["candidates"]},
        "quality": {"quality_gate_ref": "../l5/quality_gate_spec.json", "processing_status": quality["processing_quality"]["status"], "catalog_status": quality["catalog_safety"]["status"], "gold_status": quality["gold_readiness"]["status"]},
    }
    context = {"layer": "L6", "artifact_type": "semantic_handoff_context_pack", "source_id": source_id, "recommended_usage": ["Use Silver spec for row-level debugging.", "Use Gold generation spec for aggregate answers after approval.", "Surface L5 caveats when any status is warn."], "avoid_or_warn": ["Do not claim M3 performed full materialization.", "Do not hide parse, drift, PII, or Gold semantic warnings."]}
    write_json(out / "l6" / "catalog_metadata_draft.json", catalog)
    write_json(out / "l6" / "field_lineage.json", {"layer": "L6", "source_id": source_id, "lineage": lineage})
    write_json(out / "l6" / "semantic_context_pack.json", context)
    return {"catalog": catalog, "context": context}


def run(args: argparse.Namespace) -> dict[str, Any]:
    source = Path(args.source)
    out = Path(args.output)
    files = source_files(source)
    build_l0(files, out, source, args.source_id, args.checksum_mode, args.checksum_bytes)
    rows, _ = build_l1(files, out, args.source_id, args.sample_rows, args.sample_bytes)
    profile = build_l2(rows, files, out, args.source_id, args.format)
    recommendation = build_l3(profile, out, args.source_id)
    specs = build_l4(profile, recommendation, out, args.source_id)
    quality = build_l5(profile, specs, out, args.source_id)
    catalog = build_l6(profile, recommendation, specs, quality, out, args.source_id)
    summary = {"source_id": args.source_id, "output": str(out), "m3_scope": "contract planning only; no distributed execution config, no object-storage config, no raw copy", "layers": {f"L{index}": f"l{index}" for index in range(7)}, "catalog_status": catalog["catalog"]["quality"]}
    write_json(out / "run_summary.json", summary)
    return summary


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create M3 L0-L6 contracts for unknown CSV/JSON/JSONL/text sources.")
    parser.add_argument("--source", required=True)
    parser.add_argument("--source-id", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--format", choices=["auto", "csv", "json", "jsonl", "text"], default="auto")
    parser.add_argument("--sample-rows", type=int, default=5000)
    parser.add_argument("--sample-bytes", type=int, default=64 * 1024 * 1024)
    parser.add_argument("--checksum-mode", choices=["none", "prefix", "full"], default="prefix")
    parser.add_argument("--checksum-bytes", type=int, default=8 * 1024 * 1024)
    return parser.parse_args()


def main() -> int:
    summary = run(parse_args())
    print(f"M3 contract artifacts written to {summary['output']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
