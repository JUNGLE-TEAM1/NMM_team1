from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


JSONValue = dict[str, Any] | list[Any] | str | int | float | bool | None


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def artifact_id(layer: str, name: str, source_id: str, run_id: str) -> str:
    safe = re.sub(r"[^0-9A-Za-z_]+", "_", f"{source_id}_{run_id}_{layer}_{name}".lower()).strip("_")
    return f"artifact_{safe}"


def artifact_header(
    *,
    layer: str,
    name: str,
    source_id: str,
    run_id: str,
    schema_version: str,
    producer: str = "M3",
    access_class: str = "catalog_internal",
    version: str = "v2.1.1",
) -> dict[str, Any]:
    return {
        "source_id": source_id,
        "run_id": run_id,
        "artifact_id": artifact_id(layer, name, source_id, run_id),
        "artifact_name": name,
        "artifact_version": version,
        "schema_version": schema_version,
        "created_at": utc_now(),
        "producer": producer,
        "access_class": access_class,
    }


def artifact_ref(layer: str, name: str, source_id: str, run_id: str) -> str:
    return artifact_id(layer, name, source_id, run_id)


def with_header(
    *,
    layer: str,
    name: str,
    source_id: str,
    run_id: str,
    schema_version: str,
    access_class: str,
    body: dict[str, Any],
    producer: str = "M3",
) -> dict[str, Any]:
    from .layer_map import LOGICAL_LAYER_VERSION, logical_layer_for_artifact

    logical_layer = logical_layer_for_artifact(layer, name)
    header = artifact_header(
        layer=layer,
        name=name,
        source_id=source_id,
        run_id=run_id,
        schema_version=schema_version,
        producer=producer,
        access_class=access_class,
    )
    header["physical_layer"] = layer.upper()
    header["logical_layer"] = logical_layer
    header["logical_layer_version"] = LOGICAL_LAYER_VERSION
    return {
        "artifact_header": header,
        "physical_layer": layer.upper(),
        "logical_layer": logical_layer,
        "logical_layer_version": LOGICAL_LAYER_VERSION,
        **body,
    }


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


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def stable_json_hash(value: Any) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def iter_source_files(source: Path) -> list[Path]:
    if source.is_file():
        return [source]
    if source.is_dir():
        return sorted(path for path in source.rglob("*") if path.is_file())
    raise FileNotFoundError(source)


def source_uri(path: Path) -> str:
    return path.resolve().as_uri()


def file_fingerprint(path: Path, mode: str = "prefix", prefix_bytes: int = 8 * 1024 * 1024) -> dict[str, Any]:
    stat = path.stat()
    result: dict[str, Any] = {
        "path": str(path),
        "uri": source_uri(path),
        "size_bytes": stat.st_size,
        "modified_time_utc": datetime.fromtimestamp(stat.st_mtime, timezone.utc).replace(microsecond=0).isoformat(),
        "checksum_mode": mode,
    }
    if mode == "none":
        result["checksum"] = None
        return result
    digest = hashlib.sha256()
    remaining = stat.st_size if mode == "full" else min(stat.st_size, prefix_bytes)
    with path.open("rb") as handle:
        while remaining > 0:
            chunk = handle.read(min(1024 * 1024, remaining))
            if not chunk:
                break
            digest.update(chunk)
            remaining -= len(chunk)
    result["checksum_algorithm"] = "sha256"
    result["checksum"] = digest.hexdigest()
    result["checksum_bytes"] = stat.st_size if mode == "full" else min(stat.st_size, prefix_bytes)
    return result


def sample_text_lines(files: list[Path], max_rows: int, max_bytes: int) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    consumed = 0
    for path in files:
        with path.open("rb") as handle:
            for index, raw in enumerate(handle, start=1):
                if len(rows) >= max_rows or consumed >= max_bytes:
                    return rows
                consumed += len(raw)
                text = raw.decode("utf-8", errors="replace").rstrip("\r\n")
                rows.append(
                    {
                        "source_uri": source_uri(path),
                        "source_path": str(path),
                        "row_number_hint": index,
                        "raw_sha256": hashlib.sha256(raw).hexdigest(),
                        "raw_preview": text[:1000],
                        "raw_size_bytes": len(raw),
                    }
                )
    return rows


def detect_format(files: list[Path], sample_rows: list[dict[str, Any]], format_hint: str = "auto") -> dict[str, Any]:
    if format_hint != "auto":
        return {"format": format_hint, "confidence": 1.0, "reason": "explicit format hint"}
    suffixes = Counter(path.suffix.lower() for path in files)
    if any(suffix in suffixes for suffix in [".jsonl", ".ndjson"]):
        return {"format": "jsonl", "confidence": 0.9, "reason": "file extension indicates JSON lines"}
    if ".json" in suffixes:
        return {"format": "json", "confidence": 0.8, "reason": "file extension indicates JSON"}
    if ".csv" in suffixes:
        return {"format": "csv", "confidence": 0.8, "reason": "file extension indicates CSV"}
    if ".parquet" in suffixes:
        return {"format": "parquet", "confidence": 0.9, "reason": "file extension indicates Parquet; M3 core records extension-required profile contract"}
    json_success = 0
    csv_delimiter_votes: Counter[str] = Counter()
    for row in sample_rows[:100]:
        text = row["raw_preview"].strip()
        if not text:
            continue
        try:
            json.loads(text)
            json_success += 1
        except json.JSONDecodeError:
            pass
        for delimiter in [",", "\t", "|", ";"]:
            if delimiter in text:
                csv_delimiter_votes[delimiter] += 1
    if sample_rows and json_success / max(len(sample_rows[:100]), 1) > 0.8:
        return {"format": "jsonl", "confidence": 0.75, "reason": "most sampled rows parse as JSON"}
    if csv_delimiter_votes:
        delimiter, votes = csv_delimiter_votes.most_common(1)[0]
        return {"format": "csv", "confidence": min(0.7, votes / max(len(sample_rows[:100]), 1)), "reason": f"delimiter {delimiter!r} appears repeatedly"}
    return {"format": "text", "confidence": 0.2, "reason": "no reliable structured format signal"}


def flatten_json(value: JSONValue, prefix: str = "$", max_depth: int = 8) -> dict[str, Any]:
    out: dict[str, Any] = {}
    if max_depth < 0:
        out[prefix] = value
        return out
    if isinstance(value, dict):
        if not value:
            out[prefix] = {}
        for key, item in value.items():
            child = f"{prefix}.{key}" if prefix else key
            out.update(flatten_json(item, child, max_depth - 1))
    elif isinstance(value, list):
        out[prefix] = value
        if value:
            out.update(flatten_json(value[0], f"{prefix}[]", max_depth - 1))
    else:
        out[prefix] = value
    return out


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


def normalize_name(name: str) -> str:
    normalized = re.sub(r"[^0-9A-Za-z_]+", "_", name.strip().lower())
    normalized = re.sub(r"_+", "_", normalized).strip("_")
    return normalized or "field"


def source_path_to_target(path: str) -> str:
    cleaned = path.replace("$.", "").replace("$", "").replace("[]", "_item")
    cleaned = cleaned.replace(".", "_")
    return normalize_name(cleaned)


def to_project_type(dominant_type: str) -> str:
    if dominant_type in {"integer", "integer_string"}:
        return "integer"
    if dominant_type in {"number", "number_string"}:
        return "number"
    if dominant_type == "boolean":
        return "boolean"
    if dominant_type == "datetime_string":
        return "timestamp"
    if dominant_type in {"array", "object"}:
        return "json"
    return "string"


def pii_hint(name: str) -> bool:
    lowered = name.lower()
    return any(token in lowered for token in ["email", "phone", "address", "name", "user", "customer", "ssn", "ip"])


def semantic_hints(name: str) -> list[str]:
    lowered = name.lower()
    hints: list[str] = []
    if any(token in lowered for token in ["id", "asin", "product", "item"]):
        hints.append("identifier_or_dimension")
    if any(token in lowered for token in ["rating", "score", "amount", "fare", "price", "total", "count"]):
        hints.append("measure_candidate")
    if any(token in lowered for token in ["time", "date", "timestamp", "created", "updated"]):
        hints.append("time_candidate")
    if any(token in lowered for token in ["review", "comment", "text", "description", "title", "body"]):
        hints.append("text_candidate")
    if any(token in lowered for token in ["review", "rating", "sentiment", "complaint"]):
        hints.append("review_signal_candidate")
    if any(token in lowered for token in ["conversion", "purchase", "order", "session", "click", "impression", "cart", "checkout"]):
        hints.append("conversion_signal_candidate")
    if any(token in lowered for token in ["delivery", "ship", "late", "arrival", "delivered", "eta"]):
        hints.append("delivery_signal_candidate")
    if pii_hint(name):
        hints.append("pii_candidate")
    return hints


def csv_dialect(sample_lines: list[str]) -> dict[str, Any]:
    text = "\n".join(sample_lines[:50])
    if not text:
        return {"delimiter": ",", "quotechar": '"', "has_header": False, "confidence": 0.0}
    try:
        dialect = csv.Sniffer().sniff(text)
        has_header = csv.Sniffer().has_header(text)
        return {
            "delimiter": dialect.delimiter,
            "quotechar": dialect.quotechar,
            "escapechar": dialect.escapechar,
            "has_header": has_header,
            "confidence": 0.8,
        }
    except csv.Error:
        return {"delimiter": ",", "quotechar": '"', "has_header": False, "confidence": 0.2}
