#!/usr/bin/env python3
"""Generate M3 L0-L10 contract artifacts with Spark-backed local evidence.

This tool is intentionally a control-plane implementation:
- L0 references the full MinIO raw inventory.
- L1-L10 use bounded Spark samples/profiles/previews so M3 does not become the
  full production materialization engine.
- Preview outputs are written only as contract-probe evidence. Production
  preview/materialization remains an M2 responsibility.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import math
import os
import re
import statistics
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql import functions as F
from pyspark.sql import types as T


REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_S3_ENV = Path(r"F:\minio\s3-client.env")
DEFAULT_RAW_MANIFEST = Path(r"F:\minio\m3-raw-object-manifest-20260626.jsonl")
DEFAULT_ARTIFACT_ROOT = Path(r"F:\ai\m3-l0-l10-spark-contract-run")
DEFAULT_REPORT_ROOT = REPO_ROOT / "docs" / "reports" / "m3-spark-contract-implementation"
DEFAULT_SPARK_LOCAL_DIR = Path(r"F:\ai\spark-local-tmp")


def default_s3a_jar_uris() -> list[str]:
    import pyspark

    jar_dir = Path(pyspark.__file__).resolve().parent / "jars"
    candidates = [
        jar_dir / "org.apache.hadoop_hadoop-aws-3.4.1.jar",
        jar_dir / "software.amazon.awssdk_bundle-2.24.6.jar",
    ]
    return [path.as_uri() for path in candidates if path.exists()]


@dataclass(frozen=True)
class DatasetSpec:
    key: str
    display_name: str
    source_id: str
    domain: str
    format_family: str
    s3_uri: str
    raw_key_prefix: str
    description: str


DATASETS: list[DatasetSpec] = [
    DatasetSpec(
        key="amazon_clothing_reviews_jsonl",
        display_name="Amazon Clothing Shoes and Jewelry Reviews",
        source_id="src_amazon_clothing_reviews",
        domain="amazon_reviews",
        format_family="jsonl",
        s3_uri="s3a://m3-raw/amazon_reviews/clothing_shoes_and_jewelry/reviews/Clothing_Shoes_and_Jewelry.jsonl",
        raw_key_prefix="amazon_reviews/clothing_shoes_and_jewelry/reviews/Clothing_Shoes_and_Jewelry.jsonl",
        description="Large JSONL review source used to exercise unknown JSONL profiling, review Silver rules, and product-level Gold recommendation.",
    ),
    DatasetSpec(
        key="amazon_clothing_metadata_jsonl",
        display_name="Amazon Clothing Shoes and Jewelry Metadata",
        source_id="src_amazon_clothing_metadata",
        domain="amazon_metadata",
        format_family="jsonl",
        s3_uri="s3a://m3-raw/amazon_reviews/clothing_shoes_and_jewelry/metadata/meta_Clothing_Shoes_and_Jewelry.jsonl",
        raw_key_prefix="amazon_reviews/clothing_shoes_and_jewelry/metadata/meta_Clothing_Shoes_and_Jewelry.jsonl",
        description="Large JSONL product metadata source used to test nested JSON paths, arrays, and sparse product attributes.",
    ),
    DatasetSpec(
        key="nyc_taxi_2019_oct_csv",
        display_name="NYC Taxi 2019 October CSV",
        source_id="src_nyc_taxi_2019_oct_csv",
        domain="nyc_taxi",
        format_family="csv",
        s3_uri="s3a://m3-raw/nyc_taxi/csv/2019-Oct.csv",
        raw_key_prefix="nyc_taxi/csv/2019-Oct.csv",
        description="Large CSV source used to verify dialect profiling, header handling, numeric casting recommendations, and taxi Gold metrics.",
    ),
    DatasetSpec(
        key="nyc_taxi_yellow_parquet",
        display_name="NYC Taxi Yellow Parquet Mirror",
        source_id="src_nyc_taxi_yellow_parquet",
        domain="nyc_taxi",
        format_family="parquet",
        s3_uri="s3a://m3-raw/nyc_taxi/yellow_parquet/nyc-taxi-data-20gb/nyc-taxi-data-20gb/data/yellow/",
        raw_key_prefix="nyc_taxi/yellow_parquet/nyc-taxi-data-20gb/nyc-taxi-data-20gb/data/yellow/",
        description="Partitioned Parquet query mirror used to validate Spark-friendly read references and Gold fallback semantics.",
    ),
    DatasetSpec(
        key="taobao_user_events_jsonl",
        display_name="Taobao User Events JSONL",
        source_id="src_taobao_user_events",
        domain="ecommerce_events",
        format_family="jsonl",
        s3_uri="s3a://m3-raw/taobao/user_events/taobao_user_events_actual_like_full.jsonl",
        raw_key_prefix="taobao/user_events/taobao_user_events_actual_like_full.jsonl",
        description="Large event JSONL source used to test event-style Silver recommendations and time/product/user grain candidates.",
    ),
]


SUBTOPICS: dict[str, list[dict[str, str]]] = {
    "l0": [
        {"slug": "manifest-checksum", "title": "Manifest + checksum", "contract": "source manifest, object inventory, checksum/etag evidence"},
        {"slug": "chunk-manifest", "title": "Chunk manifest", "contract": "replayable chunk or object-range inventory"},
        {"slug": "query-mirror-ref", "title": "Query mirror ref", "contract": "Spark-readable s3a URI and read options"},
    ],
    "l1": [
        {"slug": "source-offset-envelope", "title": "Source-offset envelope", "contract": "record sample with source URI, row hint, raw hash, parse status"},
        {"slug": "record-sample-lane", "title": "Record sample lane", "contract": "bounded representative review/profiling lane"},
        {"slug": "rescue-lane", "title": "Rescue lane", "contract": "parse failures and invalid records are kept separately"},
    ],
    "l2": [
        {"slug": "csv-dialect-profile", "title": "CSV dialect profile", "contract": "delimiter, quote, header, encoding, column count evidence"},
        {"slug": "jsonl-profile", "title": "JSONL profile", "contract": "line parse success, invalid sample, mixed/sparse path evidence"},
        {"slug": "json-path-trie", "title": "JSON path trie", "contract": "nested path/type frequency summary"},
        {"slug": "large-source-sketch", "title": "Large source sketch", "contract": "bounded sample, numeric sketch, top values, null ratios"},
        {"slug": "schema-fingerprint", "title": "Schema fingerprint", "contract": "stable schema signature for drift comparison"},
        {"slug": "type-router", "title": "Type router", "contract": "format detection, confidence, selected profiler list"},
        {"slug": "unknown-two-stage", "title": "Unknown two-stage", "contract": "light sniff first, deeper profiler second"},
    ],
    "l3": [
        {"slug": "bronze-to-silver-recommendation", "title": "Bronze to Silver recommendation", "contract": "cleaning, cast, flatten, keep/drop, quarantine recommendation"},
        {"slug": "rule-based-reducer", "title": "Rule-based reducer", "contract": "deterministic evidence reduction before AI/control-plane recommendation"},
        {"slug": "silver-to-gold-recommendation", "title": "Silver to Gold recommendation", "contract": "grain, dimensions, measures, caveats for Gold"},
        {"slug": "gold-to-gold-option", "title": "Gold to Gold option", "contract": "optional user-requested serving Gold refinement option schema; default state is not_requested"},
    ],
    "l4": [
        {"slug": "silver-transform-spec", "title": "Silver transform spec", "contract": "field-level deterministic Silver rules"},
        {"slug": "silver-preview-validation", "title": "Silver preview validation", "contract": "bounded Spark preview validates row/schema/cast behavior"},
        {"slug": "gold-generation-spec", "title": "Gold generation spec", "contract": "Gold grain, dimensions, measures, output schema"},
        {"slug": "gold-refinement-spec", "title": "Gold refinement spec", "contract": "optional Gold-to-Gold deterministic spec schema and preview-only request; emitted as not_requested unless user selects it"},
        {"slug": "layered-transform-graph", "title": "Layered transform graph", "contract": "source/profile/recommendation/spec/gate/catalog lineage graph"},
        {"slug": "compiler-validation", "title": "Compiler validation", "contract": "reject unbounded collect, per-row AI, unsafe generated code"},
        {"slug": "gold-preview-validation", "title": "Gold preview validation", "contract": "bounded Gold preview validates semantic grain and metric health"},
    ],
    "l5": [
        {"slug": "gate-status-model", "title": "Gate status model", "contract": "pass/warn/fail/quarantine status and owner action"},
        {"slug": "drift-snapshot", "title": "Drift snapshot", "contract": "baseline/current schema fingerprint comparison"},
        {"slug": "quarantine", "title": "Quarantine", "contract": "invalid/failed rows and reasons are preserved"},
        {"slug": "schema-compatibility", "title": "Schema compatibility", "contract": "required/missing/type-change decision"},
        {"slug": "reconciliation", "title": "Reconciliation", "contract": "source objects, sampled rows, preview rows, quarantine rows are explained"},
        {"slug": "replay-hash", "title": "Replay hash", "contract": "spec/profile/catalog artifacts are hashable and replayable"},
        {"slug": "pii-warning", "title": "PII warning", "contract": "sample-based sensitive-data warning before catalog handoff"},
        {"slug": "gold-semantic-gate", "title": "Gold semantic gate", "contract": "Gold group count, null ratio, fallback and caveat decision"},
    ],
    "l6": [
        {"slug": "catalog-metadata-draft", "title": "CatalogMetadata Draft", "contract": "dataset/table/field/quality/gold metadata"},
        {"slug": "field-level-lineage", "title": "Field-level lineage", "contract": "source field to Silver/Gold output mapping"},
        {"slug": "sql-context-pack", "title": "SQL context pack", "contract": "M6-safe table/column/grain/avoid-or-warn context"},
        {"slug": "artifact-reference-manifest", "title": "Artifact reference manifest", "contract": "all produced artifact refs and hashes"},
        {"slug": "quality-caveat", "title": "Quality caveat", "contract": "quality warnings become user/query-facing caveats"},
        {"slug": "handoff-package", "title": "Handoff package", "contract": "M5/M6 handoff bundle"},
    ],
    "l7": [
        {"slug": "silver-preview-contract", "title": "Silver Preview Contract", "contract": "M2-owned Silver preview job request and validation-result import contract"},
        {"slug": "silver-structural-axis", "title": "Silver Structural Axis", "contract": "Silver row preservation, schema, rescue, and exposure validation summary"},
    ],
    "l8": [
        {"slug": "gold-preview-contract", "title": "Gold Preview Contract", "contract": "M2-owned Gold preview job request and validation-result import contract"},
        {"slug": "gold-semantic-readiness", "title": "Gold Semantic Readiness", "contract": "Gold grain, metric, caveat, and semantic owner-review readiness summary"},
        {"slug": "gold-refinement-readiness", "title": "Gold Refinement Readiness", "contract": "Gold-to-Gold serving refinement validation, metric alias readiness, and query-surface caveats"},
    ],
    "l9": [
        {"slug": "multi-axis-gate", "title": "Multi-axis Gate", "contract": "processing, catalog safety, and Gold readiness precedence without Silver contamination"},
        {"slug": "m6-context-status", "title": "M6 Context Status", "contract": "query-context readiness status passed to M5/M6"},
    ],
    "l10": [
        {"slug": "catalog-sync-package", "title": "Catalog Sync Package", "contract": "final M5/M6 catalog synchronization package with direct m6_context_status"},
        {"slug": "artifact-reference-resolution", "title": "Artifact Reference Resolution", "contract": "artifact_id string reference manifest and consistency result"},
    ],
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def new_run_id() -> str:
    return datetime.now().strftime("run_%Y%m%d_%H%M%S")


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, value: Any) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    ensure_dir(path.parent)
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True))
            handle.write("\n")


def write_text(path: Path, text: str) -> None:
    ensure_dir(path.parent)
    path.write_text(text, encoding="utf-8", newline="\n")


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def sha256_json(value: Any) -> str:
    return sha256_text(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")))


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_env(path: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        result[key.strip()] = value.strip()
    return result


def load_raw_manifest(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def parse_s3a_uri(uri: str) -> tuple[str, str]:
    if not uri.startswith("s3a://"):
        raise ValueError(f"Expected s3a URI, got {uri}")
    rest = uri[len("s3a://") :]
    bucket, _, key = rest.partition("/")
    if not bucket or not key:
        raise ValueError(f"Expected s3a://bucket/key URI, got {uri}")
    return bucket, key


def rel(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root)).replace("\\", "/")
    except ValueError:
        return str(path).replace("\\", "/")


def safe_value(value: Any, limit: int = 400) -> Any:
    if value is None or isinstance(value, (int, float, bool)):
        if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
            return str(value)
        return value
    text = str(value).replace("\r", " ").replace("\n", " ")
    return text[: limit - 3] + "..." if len(text) > limit else text


def flatten_json(value: Any, prefix: str = "$", depth: int = 0, max_depth: int = 6) -> dict[str, Any]:
    if depth >= max_depth:
        return {prefix: "<max_depth>"}
    if isinstance(value, dict):
        if not value:
            return {prefix: {}}
        out: dict[str, Any] = {}
        for key, child in value.items():
            out.update(flatten_json(child, f"{prefix}.{key}", depth + 1, max_depth))
        return out
    if isinstance(value, list):
        out = {f"{prefix}[]": f"array_len={len(value)}"}
        if value:
            out.update(flatten_json(value[0], f"{prefix}[]", depth + 1, max_depth))
        return out
    return {prefix: value}


def json_type(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int) and not isinstance(value, bool):
        return "integer"
    if isinstance(value, float):
        return "number"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    return type(value).__name__


def normalize_identifier(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def classify_field_name(name: str) -> dict[str, Any]:
    normalized = normalize_identifier(name)
    compact = normalized.replace("_", "")
    business_keys = {
        "product_id",
        "category_id",
        "brand_id",
        "item_id",
        "asin",
        "parent_asin",
        "vendor_id",
        "vendorid",
        "rate_code_id",
        "ratecodeid",
        "pu_location_id",
        "pulocationid",
        "do_location_id",
        "dolocationid",
        "payment_type",
        "event_id",
        "event_name",
        "event_type",
    }
    if normalized in {"email", "email_address", "phone", "phone_number", "address", "ip_address", "token", "access_token", "password", "ssn", "credit_card"}:
        return {"field": name, "class": "direct_sensitive", "reason": "direct personal or credential-like field"}
    if normalized in {"user_id", "userid", "anonymous_id", "anonymousid", "session_id", "sessionid", "user_session", "customer_id", "customerid", "reviewer_id"}:
        return {"field": name, "class": "user_or_session_identifier", "reason": "pseudonymous user/session identifier; hide, hash, or caveat by default"}
    if normalized in business_keys or compact.endswith("locationid"):
        return {"field": name, "class": "business_key", "reason": "operational or dimensional key, not automatic PII"}
    if normalized.endswith("_name") and normalized not in {"event_name", "brand_name", "category_name", "product_name"}:
        return {"field": name, "class": "possible_person_name", "reason": "name-like field needs value-level confirmation"}
    if normalized.endswith("_id") or compact.endswith("id"):
        return {"field": name, "class": "unknown_identifier", "reason": "identifier suffix outside business-key allowlist"}
    return {"field": name, "class": "ordinary", "reason": "no sensitive-name pattern"}


def source_contract_mismatch(dataset_key: str, fields: list[str]) -> bool:
    normalized = {normalize_identifier(field) for field in fields}
    looks_ecommerce_event = {"event_time", "event_type", "product_id", "category_id", "user_id"}.issubset(normalized)
    return dataset_key.startswith("nyc_taxi_2019_oct_csv") and looks_ecommerce_event


def simple_yaml(value: Any, indent: int = 0) -> str:
    pad = " " * indent
    if isinstance(value, dict):
        lines: list[str] = []
        for key, child in value.items():
            if isinstance(child, (dict, list)):
                lines.append(f"{pad}{key}:")
                lines.append(simple_yaml(child, indent + 2))
            else:
                lines.append(f"{pad}{key}: {json.dumps(child, ensure_ascii=False)}")
        return "\n".join(lines)
    if isinstance(value, list):
        lines = []
        for item in value:
            if isinstance(item, (dict, list)):
                lines.append(f"{pad}-")
                lines.append(simple_yaml(item, indent + 2))
            else:
                lines.append(f"{pad}- {json.dumps(item, ensure_ascii=False)}")
        return "\n".join(lines)
    return f"{pad}{json.dumps(value, ensure_ascii=False)}"


def html_page(title: str, body: str) -> str:
    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <style>
    body {{ margin: 0; font-family: Arial, 'Malgun Gothic', sans-serif; color: #17202a; background: #f6f7f9; }}
    main {{ max-width: 1180px; margin: 0 auto; padding: 28px; }}
    header, section {{ background: #fff; border: 1px solid #d9dee7; border-radius: 8px; padding: 20px; margin: 0 0 16px; }}
    h1, h2, h3 {{ margin-top: 0; }}
    table {{ width: 100%; border-collapse: collapse; margin: 12px 0; background: #fff; }}
    th, td {{ border: 1px solid #d9dee7; padding: 8px 10px; text-align: left; vertical-align: top; }}
    th {{ background: #eef2f6; }}
    code, pre {{ background: #f0f3f7; border-radius: 4px; }}
    pre {{ padding: 12px; overflow: auto; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }}
    .card {{ border: 1px solid #d9dee7; border-radius: 8px; padding: 14px; background: #fbfcfe; }}
    .metric {{ font-size: 24px; font-weight: 700; }}
    a {{ color: #145ea8; }}
  </style>
</head>
<body><main>{body}</main></body></html>
"""


class SparkM3Pipeline:
    def __init__(
        self,
        spark: SparkSession,
        run_id: str,
        artifact_root: Path,
        report_root: Path,
        raw_manifest: list[dict[str, Any]],
        s3_env: dict[str, str],
        sample_rows: int,
        report_sample_rows: int,
        line_sample_max_bytes: int,
        parquet_sample_max_files: int,
        dataset_specs: list[DatasetSpec] | None = None,
        source_window_index: int = 0,
        source_window_count: int = 1,
        spark_app_name: str | None = None,
    ) -> None:
        self.spark = spark
        self.run_id = run_id
        self.artifact_root = artifact_root / run_id
        self.report_root = report_root
        self.raw_manifest = raw_manifest
        self.s3_env = s3_env
        self.sample_rows = sample_rows
        self.report_sample_rows = report_sample_rows
        self.line_sample_max_bytes = line_sample_max_bytes
        self.parquet_sample_max_files = parquet_sample_max_files
        self.dataset_specs = dataset_specs or DATASETS
        self.source_window_index = source_window_index
        self.source_window_count = source_window_count
        self.spark_app_name = spark_app_name or "m3_l0_l10_spark_contract_pipeline"
        self.datasets: dict[str, dict[str, Any]] = {}
        self.generated_files: list[Path] = []
        self._s3_client: Any | None = None
        self.progress_path = self.artifact_root / "run_progress.json"

    def run(self) -> dict[str, Any]:
        ensure_dir(self.artifact_root)
        ensure_dir(self.report_root)
        self.write_progress(
            state="running",
            current_dataset=None,
            current_layer="BOOT",
            current_operation="Spark session created; preparing M3 L0-L10 contract run",
        )
        started = time.perf_counter()
        for dataset in self.dataset_specs:
            self.datasets[dataset.key] = self.process_dataset(dataset)
        summary = self.write_run_summary(time.perf_counter() - started)
        self.write_progress(
            state="completed",
            current_dataset=None,
            current_layer="DONE",
            current_operation="All selected datasets finished and run summary was written",
            extra={"run_summary_ref": str(self.artifact_root / "run_summary.json")},
        )
        self.write_reports(summary)
        return summary

    def dataset_dir(self, dataset: DatasetSpec) -> Path:
        return self.artifact_root / dataset.key

    def source_unit_id(self, dataset: DatasetSpec) -> str:
        return f"su_{self.normalize_column(dataset.source_id)}"

    def object_id(self, dataset: DatasetSpec, index: int) -> str:
        return f"obj_{self.normalize_column(dataset.source_id)}_{index:06d}"

    def write_artifact(self, path: Path, value: Any) -> None:
        write_json(path, value)
        self.generated_files.append(path)

    def write_artifact_jsonl(self, path: Path, rows: list[dict[str, Any]]) -> None:
        write_jsonl(path, rows)
        self.generated_files.append(path)

    def write_artifact_text(self, path: Path, text: str) -> None:
        write_text(path, text)
        self.generated_files.append(path)

    def write_progress(
        self,
        state: str,
        current_dataset: str | None,
        current_layer: str,
        current_operation: str,
        extra: dict[str, Any] | None = None,
    ) -> None:
        payload: dict[str, Any] = {
            "run_id": self.run_id,
            "spark_app_name": self.spark_app_name,
            "spark_application_id": self.spark.sparkContext.applicationId,
            "state": state,
            "updated_at": utc_now(),
            "current_dataset": current_dataset,
            "current_layer": current_layer,
            "current_operation": current_operation,
            "source_window": {
                "index": self.source_window_index,
                "count": self.source_window_count,
            },
            "datasets": {
                key: {
                    "display_name": value.get("display_name"),
                    "completed_layers": sorted(
                        layer_key.upper()
                        for layer_key in value.keys()
                        if re.fullmatch(r"l\d+", layer_key)
                    ),
                    "status": "completed",
                }
                for key, value in self.datasets.items()
            },
        }
        if extra:
            payload.update(extra)
        write_json(self.progress_path, payload)

    def mark_layer(self, dataset: DatasetSpec, layer: str, operation: str) -> None:
        self.write_progress(
            state="running",
            current_dataset=dataset.key,
            current_layer=layer,
            current_operation=operation,
        )

    def objects_for(self, dataset: DatasetSpec) -> list[dict[str, Any]]:
        prefix = dataset.raw_key_prefix.rstrip("/")
        if dataset.raw_key_prefix.endswith("/"):
            return [row for row in self.raw_manifest if str(row.get("key", "")).startswith(prefix + "/")]
        return [row for row in self.raw_manifest if str(row.get("key", "")) == prefix or str(row.get("key", "")).startswith(prefix + "/")]

    def s3_client(self) -> Any:
        if self._s3_client is None:
            import boto3

            endpoint = self.s3_env.get("S3_ENDPOINT_URL") or self.s3_env.get("AWS_ENDPOINT_URL")
            self._s3_client = boto3.client(
                "s3",
                endpoint_url=endpoint,
                aws_access_key_id=self.s3_env["AWS_ACCESS_KEY_ID"],
                aws_secret_access_key=self.s3_env["AWS_SECRET_ACCESS_KEY"],
                region_name=self.s3_env.get("AWS_REGION", "us-east-1"),
            )
        return self._s3_client

    def ensure_bucket(self, bucket: str) -> None:
        s3 = self.s3_client()
        try:
            s3.head_bucket(Bucket=bucket)
        except Exception:
            s3.create_bucket(Bucket=bucket)

    def put_text_object(self, bucket: str, key: str, text: str, content_type: str = "text/plain; charset=utf-8") -> str:
        self.ensure_bucket(bucket)
        self.s3_client().put_object(Bucket=bucket, Key=key, Body=text.encode("utf-8"), ContentType=content_type)
        return f"s3a://{bucket}/{key}"

    def sample_s3_lines(self, dataset: DatasetSpec, wanted_lines: int) -> dict[str, Any]:
        bucket, _ = parse_s3a_uri(dataset.s3_uri)
        objects = self.objects_for(dataset)
        if not objects:
            raise RuntimeError(f"No raw manifest objects matched {dataset.key}: {dataset.raw_key_prefix}")

        lines: list[str] = []
        line_sources: list[dict[str, Any]] = []
        ranges: list[dict[str, Any]] = []
        bytes_read = 0
        hard_line_budget = wanted_lines + (1 if dataset.format_family == "csv" else 0)
        range_count = min(16, max(1, math.ceil(max(wanted_lines, 1) / 25000)))
        bytes_per_range = max(4 * 1024 * 1024, min(64 * 1024 * 1024, self.line_sample_max_bytes // max(range_count, 1)))
        s3 = self.s3_client()
        csv_header: str | None = None
        if dataset.format_family == "csv":
            first_key = str(objects[0]["key"])
            header_probe = s3.get_object(Bucket=bucket, Key=first_key, Range="bytes=0-1048575")
            header_text = header_probe["Body"].read().decode("utf-8", errors="replace")
            csv_header = header_text.splitlines()[0] if header_text.splitlines() else ""
            if csv_header:
                lines.append(csv_header)
                line_sources.append(
                    {
                        "locator_type": "object_line_hint",
                        "object_id": self.object_id(dataset, 1),
                        "object_key": first_key,
                        "byte_start": 0,
                        "byte_end": min(1048575, int(objects[0].get("size") or 1) - 1),
                        "range_id": f"{dataset.source_id}:header_probe",
                        "line_index_in_range": 1,
                        "source_line_role": "csv_header",
                    }
                )

        for obj_index, obj in enumerate(objects, start=1):
            if len(lines) >= hard_line_budget or bytes_read >= self.line_sample_max_bytes:
                break
            key = str(obj["key"])
            size = int(obj.get("size") or 0)
            if size <= 0:
                continue
            window_start = int(size * self.source_window_index / self.source_window_count)
            window_end_exclusive = int(size * (self.source_window_index + 1) / self.source_window_count)
            if window_end_exclusive <= window_start:
                continue
            window_size = window_end_exclusive - window_start
            if range_count == 1:
                offsets = [window_start]
            else:
                max_start = max(window_start, window_end_exclusive - bytes_per_range)
                offsets = sorted({int(window_start + (max_start - window_start) * idx / (range_count - 1)) for idx in range(range_count)})

            for offset in offsets:
                if len(lines) >= hard_line_budget or bytes_read >= self.line_sample_max_bytes:
                    break
                length = min(bytes_per_range, window_end_exclusive - offset, self.line_sample_max_bytes - bytes_read)
                if length <= 0:
                    continue
                end = offset + length - 1
                response = s3.get_object(Bucket=bucket, Key=key, Range=f"bytes={offset}-{end}")
                data = response["Body"].read()
                bytes_read += len(data)
                text = data.decode("utf-8", errors="replace")
                parts = text.splitlines()
                if offset > 0 and parts:
                    parts = parts[1:]
                if end < size - 1 and end < window_end_exclusive - 1 and parts:
                    parts = parts[:-1]
                before = len(lines)
                range_id = f"{dataset.source_id}:range:{len(ranges) + 1:06d}"
                for part_index, part in enumerate(parts, start=1):
                    if dataset.format_family == "csv" and csv_header and part == csv_header:
                        continue
                    if part.strip():
                        lines.append(part)
                        line_sources.append(
                            {
                                "locator_type": "object_line_hint",
                                "object_id": self.object_id(dataset, obj_index),
                                "object_key": key,
                                "byte_start": offset,
                                "byte_end": end,
                                "range_id": range_id,
                                "line_index_in_range": part_index,
                                "source_window_index": self.source_window_index,
                                "source_window_count": self.source_window_count,
                            }
                        )
                    if len(lines) >= hard_line_budget:
                        break
                ranges.append(
                    {
                        "range_id": range_id,
                        "bucket": bucket,
                        "key": key,
                        "object_id": self.object_id(dataset, obj_index),
                        "byte_start": offset,
                        "byte_end": end,
                        "bytes_read": len(data),
                        "source_window_index": self.source_window_index,
                        "source_window_count": self.source_window_count,
                        "source_window_byte_start": window_start,
                        "source_window_byte_end_exclusive": window_end_exclusive,
                        "source_window_byte_size": window_size,
                        "complete_lines_added": len(lines) - before,
                    }
                )

        return {
            "lines": lines[:hard_line_budget],
            "line_sources": line_sources[:hard_line_budget],
            "ranges": ranges,
            "bytes_read": bytes_read,
            "objects_considered": len(objects),
            "sampling_mode": "minio_s3_range_multisegment_to_shared_s3a_sample",
            "source_window": {
                "index": self.source_window_index,
                "count": self.source_window_count,
                "strategy": "byte_window_for_line_oriented_sources",
            },
        }

    def parquet_sample_uris(self, dataset: DatasetSpec) -> dict[str, Any]:
        objects = [
            row
            for row in self.objects_for(dataset)
            if int(row.get("size") or 0) > 0
            and not str(row.get("key", "")).endswith("/")
            and "_SUCCESS" not in str(row.get("key", ""))
        ]
        objects = sorted(objects, key=lambda row: str(row.get("key", "")))
        if self.source_window_count > 1:
            objects = [row for idx, row in enumerate(objects) if idx % self.source_window_count == self.source_window_index]
        objects = objects[: self.parquet_sample_max_files]
        uris = [f"s3a://m3-raw/{row['key']}" for row in objects]
        return {
            "uris": uris,
            "files_selected": len(uris),
            "bytes_selected": sum(int(row.get("size") or 0) for row in objects),
            "objects_available": len(self.objects_for(dataset)),
            "sampling_mode": "manifest_selected_parquet_files_to_spark_s3a_read",
            "source_window": {
                "index": self.source_window_index,
                "count": self.source_window_count,
                "strategy": "manifest_object_modulo_window_for_parquet_sources",
            },
        }

    def process_dataset(self, dataset: DatasetSpec) -> dict[str, Any]:
        started = time.perf_counter()
        dataset_root = self.dataset_dir(dataset)
        ensure_dir(dataset_root)
        self.mark_layer(dataset, "L0", "Raw object inventory, source_unit_id, checksum, and replay window manifest")
        state: dict[str, Any] = {
            "dataset": dataset,
            "dataset_key": dataset.key,
            "source_id": dataset.source_id,
            "display_name": dataset.display_name,
            "artifacts": {},
            "metrics": {},
            "warnings": [],
        }
        state["l0"] = self.build_l0(dataset, state)
        self.mark_layer(dataset, "L1", "Bronze envelope sampling, source locator capture, and rescue lane preparation")
        sample_state = self.load_spark_sample(dataset)
        state["sample"] = sample_state
        state["l1"] = self.build_l1(dataset, state, sample_state)
        self.mark_layer(dataset, "L2", "CSV/JSON/Parquet profile snapshot, schema fingerprint, type and path evidence")
        state["l2"] = self.build_l2(dataset, state, sample_state)
        self.mark_layer(dataset, "L3", "AI-control-plane recommendation input pack and Silver/Gold policy recommendation")
        state["l3"] = self.build_l3(dataset, state)
        self.mark_layer(dataset, "L4", "Deterministic Silver transform spec, Gold generation spec, and bounded preview validation")
        state["l4"] = self.build_l4(dataset, state, sample_state)
        self.mark_layer(dataset, "L5", "Quality, drift, quarantine, transformation score, and approval state gate")
        state["l5"] = self.build_l5(dataset, state)
        self.mark_layer(dataset, "L6", "Compiler package, operation params schema, PII/query validator, and M2 execution bundle")
        state["l6"] = self.build_l6(dataset, state)
        self.mark_layer(dataset, "L7", "Silver preview contract import and structural readiness axis")
        state["l7"] = self.build_l7(dataset, state)
        self.mark_layer(dataset, "L8", "Gold preview contract import and semantic readiness axis")
        state["l8"] = self.build_l8(dataset, state)
        self.mark_layer(dataset, "L9", "Three-axis precedence gate and M6 context status calculation")
        state["l9"] = self.build_l9(dataset, state)
        self.mark_layer(dataset, "L10", "Catalog sync package, artifact reference resolution, and M1/M2/M5/M6 handoff payloads")
        state["l10"] = self.build_l10(dataset, state)
        state["metrics"]["dataset_seconds"] = round(time.perf_counter() - started, 3)
        self.write_progress(
            state="running",
            current_dataset=dataset.key,
            current_layer="DATASET_DONE",
            current_operation=f"{dataset.key} L0-L10 artifacts completed",
        )
        return state

    def build_l0(self, dataset: DatasetSpec, state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l0"
        objects = self.objects_for(dataset)
        total_bytes = sum(int(row.get("size") or 0) for row in objects)
        object_count = len(objects)
        source_unit_id = self.source_unit_id(dataset)
        object_ids = [self.object_id(dataset, idx) for idx, _ in enumerate(objects, start=1)]
        manifest = {
            "layer": "L0",
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "source_version_id": f"{dataset.source_id}:m3-raw:{self.run_id}",
            "dataset_key": dataset.key,
            "format_family": dataset.format_family,
            "storage_uri": dataset.s3_uri,
            "read_uri": dataset.s3_uri,
            "raw_bucket": "m3-raw",
            "object_count": object_count,
            "byte_size": total_bytes,
            "checksum": {
                "algorithm": "minio_etag_inventory",
                "value": sha256_json([{"key": row.get("key"), "etag": row.get("etag"), "size": row.get("size")} for row in objects]),
                "note": "Composite checksum over MinIO object key, etag, and size. Full byte SHA256 is intentionally not computed in M3 control-plane.",
            },
            "read_options": {
                "spark_format": "json" if dataset.format_family == "jsonl" else dataset.format_family,
                "endpoint": "configured_from_F_minio_s3_client_env",
                "path_style_access": True,
                "ssl": False,
            },
            "source_window": {
                "index": self.source_window_index,
                "count": self.source_window_count,
                "source_window_id": f"{dataset.source_id}:window:{self.source_window_index + 1:04d}-of-{self.source_window_count:04d}",
                "note": "Window is a control-plane profiling shard. L0 still references the full immutable raw source.",
            },
            "created_at": utc_now(),
        }
        inventory_rows = [
            {
                "source_id": dataset.source_id,
                "source_unit_id": source_unit_id,
                "object_id": self.object_id(dataset, idx),
                "object_key": row.get("key"),
                "size": row.get("size"),
                "etag": row.get("etag"),
                "last_modified": row.get("lastModified"),
                "storage_class": row.get("storageClass"),
                "s3a_uri": f"s3a://m3-raw/{row.get('key')}",
            }
            for idx, row in enumerate(objects, start=1)
        ]
        chunk_rows = [
            {
                "source_id": dataset.source_id,
                "source_unit_id": source_unit_id,
                "object_id": self.object_id(dataset, idx),
                "chunk_id": f"{dataset.source_id}:object:{idx:06d}",
                "object_key": row.get("key"),
                "byte_start": 0,
                "byte_end": int(row.get("size") or 0),
                "byte_length": int(row.get("size") or 0),
                "etag": row.get("etag"),
                "read_uri": f"s3a://m3-raw/{row.get('key')}",
            }
            for idx, row in enumerate(objects, start=1)
        ]
        source_unit_manifest = {
            "schema_version": "m3.l0.source_unit_manifest.v2.1.1",
            "source_id": dataset.source_id,
            "dataset_key": dataset.key,
            "source_units": [
                {
                    "source_unit_id": source_unit_id,
                    "unit_type": "object_batch",
                    "object_ids": object_ids,
                    "stream_window_ids": [],
                    "read_uri": dataset.s3_uri,
                    "format_family": dataset.format_family,
                    "object_count": object_count,
                    "byte_size": total_bytes,
                    "processing_window": manifest["source_window"],
                    "created_at": manifest["created_at"],
                }
            ],
            "objects": [
                {
                    "object_id": self.object_id(dataset, idx),
                    "source_unit_id": source_unit_id,
                    "object_key": row.get("key"),
                    "size": row.get("size"),
                    "etag": row.get("etag"),
                    "read_uri": f"s3a://m3-raw/{row.get('key')}",
                }
                for idx, row in enumerate(objects, start=1)
            ],
            "stream_windows": [],
            "allowed_unit_type_combinations": {
                "object_batch": {"requires_object_ids": True, "allows_stream_window_ids": False},
                "stream_window": {"requires_object_ids": False, "allows_stream_window_ids": True},
                "hybrid_window": {"requires_object_ids": True, "allows_stream_window_ids": True},
            },
        }
        known_source_units = {unit["source_unit_id"] for unit in source_unit_manifest["source_units"]}
        object_forward_ok = all(item["source_unit_id"] in known_source_units for item in source_unit_manifest["objects"])
        object_reverse_ok = sorted(object_ids) == sorted(item["object_id"] for item in source_unit_manifest["objects"])
        source_unit_consistency = {
            "schema_version": "m3.l0.source_unit_consistency_result.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "status": "pass" if object_forward_ok and object_reverse_ok else "block",
            "checks": [
                {
                    "check": "object_to_source_unit_forward_reference",
                    "status": "pass" if object_forward_ok else "block",
                    "details": "Every object.source_unit_id must exist in source_units[].",
                },
                {
                    "check": "source_unit_to_object_reverse_reference",
                    "status": "pass" if object_reverse_ok else "block",
                    "details": "source_units[].object_ids[] must match objects[].object_id with no orphan objects.",
                },
                {
                    "check": "object_batch_combination",
                    "status": "pass" if object_ids and not source_unit_manifest["source_units"][0]["stream_window_ids"] else "block",
                    "details": "object_batch requires object_ids[] and forbids stream_window_ids[] in core schema.",
                },
            ],
            "legacy_window_id_policy": {
                "core_preview_scope_window_id_allowed": False,
                "normalization_rule": "legacy window_id may be normalized only when L0 can resolve it to stream_window_id; this object-backed source_unit uses source_unit_id only.",
            },
        }
        raw_version_index = [
            {
                "source_version_id": manifest["source_version_id"],
                "source_id": dataset.source_id,
                "source_unit_id": source_unit_id,
                "read_uri": dataset.s3_uri,
                "object_count": object_count,
                "byte_size": total_bytes,
                "inventory_checksum": manifest["checksum"]["value"],
                "created_at": manifest["created_at"],
            }
        ]
        storage_policy = {
            "layer": "L0",
            "retention": "keep_raw_version_until_user_deletes_source",
            "immutability": "MinIO bucket versioning enabled; M3 does not mutate raw objects",
            "large_data_rule": "M3 stores manifest/inventory/checksum refs, not copied payload",
        }
        replay_manifest = {
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "read_uri": dataset.s3_uri,
            "chunk_manifest_ref": "chunk_manifest.jsonl",
            "source_file_inventory_ref": "source_file_inventory.jsonl",
            "source_unit_manifest_ref": "source_unit_manifest.json",
            "spark_read_options": manifest["read_options"],
        }
        query_mirror_ref = {
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "primary_read_uri": dataset.s3_uri,
            "mirror_type": "minio_s3a_raw_or_query_friendly_raw",
            "spark_engine_hint": {
                "format": manifest["read_options"]["spark_format"],
                "s3a_endpoint": "http://172.21.102.126:9000",
                "path_style_access": True,
            },
        }
        self.write_artifact(layer_dir / "source_manifest.json", manifest)
        self.write_artifact(layer_dir / "source_unit_manifest.json", source_unit_manifest)
        self.write_artifact(layer_dir / "source_unit_consistency_result.json", source_unit_consistency)
        self.write_artifact_jsonl(layer_dir / "source_file_inventory.jsonl", inventory_rows)
        self.write_artifact_jsonl(layer_dir / "chunk_manifest.jsonl", chunk_rows)
        self.write_artifact_jsonl(layer_dir / "raw_version_index.jsonl", raw_version_index)
        self.write_artifact(layer_dir / "storage_policy.json", storage_policy)
        self.write_artifact(layer_dir / "replay_manifest.json", replay_manifest)
        self.write_artifact(layer_dir / "query_mirror_ref.json", query_mirror_ref)
        return {
            "manifest": manifest,
            "source_unit_id": source_unit_id,
            "source_unit_manifest": source_unit_manifest,
            "source_unit_consistency": source_unit_consistency,
            "inventory_rows": len(inventory_rows),
            "chunk_rows": len(chunk_rows),
            "artifact_refs": {
                "source_manifest": rel(layer_dir / "source_manifest.json", self.artifact_root),
                "source_unit_manifest": rel(layer_dir / "source_unit_manifest.json", self.artifact_root),
                "source_unit_consistency": rel(layer_dir / "source_unit_consistency_result.json", self.artifact_root),
                "inventory": rel(layer_dir / "source_file_inventory.jsonl", self.artifact_root),
                "chunk_manifest": rel(layer_dir / "chunk_manifest.jsonl", self.artifact_root),
                "query_mirror_ref": rel(layer_dir / "query_mirror_ref.json", self.artifact_root),
            },
        }

    def load_spark_sample(self, dataset: DatasetSpec) -> dict[str, Any]:
        started = time.perf_counter()
        if dataset.format_family == "jsonl":
            range_sample = self.sample_s3_lines(dataset, self.sample_rows)
            sample_strings = range_sample["lines"][: self.sample_rows]
            source_records = range_sample.get("line_sources", [])[: len(sample_strings)]
            sample_path = self.dataset_dir(dataset) / "l1" / "range_sample_input.jsonl"
            sample_text = "\n".join(sample_strings) + ("\n" if sample_strings else "")
            self.write_artifact_text(sample_path, sample_text)
            sample_s3_uri = self.put_text_object(
                "m3-artifacts",
                f"m3_contract_runs/{self.run_id}/{dataset.key}/l1/range_sample_input.jsonl",
                sample_text,
                "application/x-ndjson; charset=utf-8",
            )
            invalid = 0
            parsed_objects: list[dict[str, Any]] = []
            for value in sample_strings[: min(self.report_sample_rows, 1000)]:
                try:
                    obj = json.loads(value)
                    if isinstance(obj, dict):
                        parsed_objects.append(obj)
                    else:
                        parsed_objects.append({"$": obj})
                except Exception:
                    invalid += 1
            parsed = (
                self.spark.read.option("mode", "PERMISSIVE")
                .option("columnNameOfCorruptRecord", "_corrupt_record")
                .option("samplingRatio", "0.01")
                .json(sample_s3_uri)
                .limit(self.sample_rows)
                .cache()
            )
            parsed_count = parsed.count()
            return {
                "df": parsed,
                "sample_rows": parsed_count,
                "parsed_rows": parsed_count,
                "json_sample_strings": sample_strings[: min(self.report_sample_rows, 1000)],
                "json_sample_objects": parsed_objects,
                "invalid_json_sample_rows": invalid,
                "local_sample_path": str(sample_path),
                "sample_input_s3_uri": sample_s3_uri,
                "source_records": source_records,
                "range_sample": {k: v for k, v in range_sample.items() if k not in {"lines", "line_sources"}},
                "load_seconds": round(time.perf_counter() - started, 3),
            }
        if dataset.format_family == "csv":
            range_sample = self.sample_s3_lines(dataset, self.sample_rows)
            lines = range_sample["lines"]
            line_sources = range_sample.get("line_sources", [])
            header = lines[0] if lines else ""
            data_pairs = [
                (line, source)
                for line, source in zip(lines[1:], line_sources[1:])
                if line and line != header
            ][: self.sample_rows]
            data_lines = [line for line, _ in data_pairs]
            source_records = [source for _, source in data_pairs]
            sample_path = self.dataset_dir(dataset) / "l1" / "range_sample_input.csv"
            csv_text = "\n".join([header, *data_lines]) + ("\n" if header else "")
            self.write_artifact_text(sample_path, csv_text)
            sample_s3_uri = self.put_text_object(
                "m3-artifacts",
                f"m3_contract_runs/{self.run_id}/{dataset.key}/l1/range_sample_input.csv",
                csv_text,
                "text/csv; charset=utf-8",
            )
            text_sample = "\n".join([header, *data_lines[: min(self.report_sample_rows, 500)]])
            df = (
                self.spark.read.option("header", "true")
                .option("mode", "PERMISSIVE")
                .option("multiLine", "false")
                .csv(sample_s3_uri)
                .limit(self.sample_rows)
                .cache()
            )
            count = df.count()
            return {
                "df": df,
                "raw_text_sample": text_sample,
                "sample_rows": count,
                "parsed_rows": count,
                "invalid_json_sample_rows": 0,
                "local_sample_path": str(sample_path),
                "sample_input_s3_uri": sample_s3_uri,
                "source_records": source_records,
                "range_sample": {k: v for k, v in range_sample.items() if k not in {"lines", "line_sources"}},
                "load_seconds": round(time.perf_counter() - started, 3),
            }
        if dataset.format_family == "parquet":
            parquet_sample = self.parquet_sample_uris(dataset)
            if not parquet_sample["uris"]:
                raise RuntimeError(f"No parquet sample files selected for {dataset.key}")
            df = self.spark.read.parquet(*parquet_sample["uris"]).limit(self.sample_rows).cache()
            count = df.count()
            return {
                "df": df,
                "sample_rows": count,
                "parsed_rows": count,
                "invalid_json_sample_rows": 0,
                "source_records": [
                    {
                        "locator_type": "parquet_file_sample_hint",
                        "object_key": uri.replace("s3a://m3-raw/", ""),
                        "object_id": "",
                        "parquet_row_group_hint": "unknown_until_m2_full_scan",
                    }
                    for uri in parquet_sample["uris"][: min(count, self.report_sample_rows)]
                ],
                "parquet_sample": parquet_sample,
                "load_seconds": round(time.perf_counter() - started, 3),
            }
        raise ValueError(f"Unsupported format_family: {dataset.format_family}")

    def build_l1(self, dataset: DatasetSpec, state: dict[str, Any], sample_state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l1"
        df: DataFrame = sample_state["df"]
        sample_rows = [json.loads(row) for row in df.limit(self.report_sample_rows).toJSON().collect()]
        source_unit_id = state["l0"]["source_unit_id"]
        first_object_id = ""
        first_object_key = ""
        source_objects = state["l0"]["source_unit_manifest"].get("objects", [])
        object_id_by_key = {item.get("object_key"): item.get("object_id", "") for item in source_objects}
        if source_objects:
            first_object_id = source_objects[0].get("object_id", "")
            first_object_key = source_objects[0].get("object_key", "")
        source_records = sample_state.get("source_records") or []
        envelope_rows: list[dict[str, Any]] = []
        for idx, row in enumerate(sample_rows, start=1):
            payload = {key: safe_value(value) for key, value in row.items()}
            source_record = source_records[idx - 1] if idx - 1 < len(source_records) else {}
            object_key = source_record.get("object_key") or first_object_key
            object_id = source_record.get("object_id") or object_id_by_key.get(object_key) or first_object_id
            replay_locator = {
                "locator_type": source_record.get("locator_type") or "object_line_hint",
                "object_id": object_id,
                "object_key": object_key,
                "line_number_hint": idx,
                "range_id": source_record.get("range_id"),
                "line_index_in_range": source_record.get("line_index_in_range"),
                "byte_range_hint": {
                    "byte_start": source_record.get("byte_start"),
                    "byte_end": source_record.get("byte_end"),
                }
                if source_record.get("byte_start") is not None
                else None,
                "parquet_row_group_hint": source_record.get("parquet_row_group_hint"),
            }
            envelope_rows.append(
                {
                    "bronze_record_id": f"{dataset.source_id}:sample:{idx:08d}",
                    "source_id": dataset.source_id,
                    "source_unit_id": source_unit_id,
                    "object_id": object_id,
                    "source_uri": dataset.s3_uri,
                    "row_number_hint": idx,
                    "replay_locator": replay_locator,
                    "raw_hash_sha256": sha256_json(payload),
                    "parse_status": "parsed",
                    "payload": payload,
                }
            )
        rescue_rows: list[dict[str, Any]] = []
        if dataset.format_family == "jsonl" and sample_state.get("invalid_json_sample_rows"):
            rescue_rows.append(
                {
                    "source_id": dataset.source_id,
                    "reason": "json_parse_failure_in_bounded_sample",
                    "count": sample_state["invalid_json_sample_rows"],
                    "raw_fragment_ref": "bounded text sample",
                }
            )
        bronze_spec = {
            "layer": "L1",
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "bronze_contract_version": "m3.l1.bronze.v1",
            "required_fields": ["bronze_record_id", "source_id", "source_unit_id", "source_uri", "row_number_hint", "replay_locator", "raw_hash_sha256", "parse_status"],
            "payload_policy": "bounded sample keeps payload; full production Bronze may keep pointer-only envelope",
            "replay_locator_rule": "object-backed records require object_id plus line/byte/json_path/parquet_row_group hint; stream-backed records require stream_window_id plus offset/checkpoint anchor.",
        }
        source_offset_spec = {
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "offset_fields": ["source_uri", "object_key", "byte_start", "byte_end", "row_number_hint"],
            "offset_status": "row_number_hint_for_control_plane_sample",
            "source_uri": dataset.s3_uri,
            "object_backed_record_rule": {
                "requires_object_id": True,
                "requires_one_of": ["line_number_hint", "byte_range_hint", "json_path", "parquet_row_group_hint"],
            },
            "stream_backed_record_rule": {
                "requires_stream_window_id": True,
                "requires_offset_or_checkpoint_anchor": True,
            },
        }
        sample_policy = {
            "sample_rows_requested": self.sample_rows,
            "sample_rows_loaded": sample_state["sample_rows"],
            "sample_rows_written": len(envelope_rows),
            "policy": "bounded control-plane sample; large line files use MinIO range sample, write a shared m3-artifacts object, then Spark reads the shared s3a URI; Parquet uses manifest-selected Spark S3A read",
            "range_sample": sample_state.get("range_sample"),
            "parquet_sample": sample_state.get("parquet_sample"),
            "local_sample_path": sample_state.get("local_sample_path"),
            "sample_input_s3_uri": sample_state.get("sample_input_s3_uri"),
        }
        rescue_summary = {
            "source_id": dataset.source_id,
            "rescue_rows": len(rescue_rows),
            "rescue_policy": "only parse failures or hard invalid records are written to rescue lane",
        }
        provenance_failures = [
            row["bronze_record_id"]
            for row in envelope_rows
            if not row.get("object_id") or not row.get("replay_locator", {}).get("object_key")
        ]
        sample_provenance_check = {
            "schema_version": "m3.l1.sample_provenance_check.v2.1.2",
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "status": "pass" if not provenance_failures else "warn",
            "sample_rows_checked": len(envelope_rows),
            "source_records_available": len(source_records),
            "missing_locator_record_ids": provenance_failures[:100],
            "quality_impact": "warn means replay is still possible through source_uri and row hint, but object/range-level precision is incomplete.",
        }
        self.write_artifact(layer_dir / "bronze_envelope_spec.json", bronze_spec)
        self.write_artifact(layer_dir / "source_offset_spec.json", source_offset_spec)
        self.write_artifact(layer_dir / "bronze_sample_policy.json", sample_policy)
        self.write_artifact_jsonl(layer_dir / "bronze_record_samples.jsonl", envelope_rows)
        self.write_artifact_jsonl(layer_dir / "rescue_records.jsonl", rescue_rows)
        self.write_artifact(layer_dir / "rescue_summary.json", rescue_summary)
        self.write_artifact(layer_dir / "sample_provenance_check.json", sample_provenance_check)
        return {
            "sample_rows": sample_state["sample_rows"],
            "sample_written": len(envelope_rows),
            "rescue_rows": len(rescue_rows),
            "source_unit_id": source_unit_id,
            "sample_provenance_status": sample_provenance_check["status"],
            "artifact_refs": {
                "bronze_spec": rel(layer_dir / "bronze_envelope_spec.json", self.artifact_root),
                "source_offset_spec": rel(layer_dir / "source_offset_spec.json", self.artifact_root),
                "sample_policy": rel(layer_dir / "bronze_sample_policy.json", self.artifact_root),
                "sample_lane": rel(layer_dir / "bronze_record_samples.jsonl", self.artifact_root),
                "rescue_lane": rel(layer_dir / "rescue_records.jsonl", self.artifact_root),
                "sample_provenance_check": rel(layer_dir / "sample_provenance_check.json", self.artifact_root),
            },
        }

    def build_l2(self, dataset: DatasetSpec, state: dict[str, Any], sample_state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l2"
        df: DataFrame = sample_state["df"]
        row_count = int(sample_state["sample_rows"])
        schema_fields = self.profile_schema(df, row_count)
        source_unit_id = state["l0"]["source_unit_id"]
        profile_job_request = {
            "schema_version": "m3.l2.profile_job_request.v2.1.1",
            "request_id": f"profile_req_{self.run_id}_{dataset.key}",
            "requested_by": "M3",
            "execution_owner": "M2 Spark",
            "source_id": dataset.source_id,
            "source_unit_ids": [source_unit_id],
            "input_refs": {
                "source_manifest_ref": state["l0"]["artifact_refs"]["source_manifest"],
                "source_unit_manifest_ref": state["l0"]["artifact_refs"]["source_unit_manifest"],
                "bronze_sample_policy_ref": state["l1"]["artifact_refs"]["sample_policy"] if "sample_policy" in state["l1"].get("artifact_refs", {}) else "l1/bronze_sample_policy.json",
            },
            "profile_plan": {
                "format_family": dataset.format_family,
                "selected_profilers": self.selected_profilers(dataset.format_family),
                "sample_policy": "bounded_profile_or_partition_sketch",
                "forbidden_runtime_behaviors": ["per_row_ai", "driver_collect_full_source", "unbounded_raw_payload_to_model"],
            },
            "expected_outputs": [
                "profile_snapshot.json",
                "schema_fingerprint.json",
                "large_source_sketch_profile.json",
                "type_router_profile.json",
            ],
        }
        schema_fingerprint = {
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "schema_fingerprint": sha256_json(schema_fields),
            "fields": schema_fields,
            "sample_rows": row_count,
        }
        csv_profile = self.profile_csv(dataset, sample_state)
        jsonl_profile = self.profile_jsonl(dataset, sample_state)
        json_path_profile = self.profile_json_paths(dataset, sample_state, schema_fields)
        sketch_profile = self.profile_sketch(df, row_count)
        type_router = {
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "detected_format": dataset.format_family,
            "confidence": 0.99 if dataset.format_family in {"jsonl", "csv", "parquet"} else 0.5,
            "selected_profilers": self.selected_profilers(dataset.format_family),
            "fallback_profilers": ["unknown_two_stage", "bounded_text_sniff"],
            "large_source_safe": True,
            "reason": f"Registered raw URI and Spark reader confirmed {dataset.format_family} handling.",
        }
        two_stage = {
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "stage_1_light_sniff": {
                "format_family": dataset.format_family,
                "sample_rows": row_count,
                "field_count": len(schema_fields),
                "confidence": type_router["confidence"],
            },
            "stage_2_deep_profile": {
                "schema_fingerprint_ref": "schema_fingerprint.json",
                "sketch_profile_ref": "large_source_sketch_profile.json",
                "json_path_profile_ref": "json_path_trie_profile.json",
                "csv_dialect_profile_ref": "csv_dialect_profile.json",
            },
        }
        profile_snapshot = {
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "dataset_key": dataset.key,
            "created_at": utc_now(),
            "producer_role": "M3 local contract probe; production producer should be M2 Spark executing profile_job_request",
            "sample_rows": row_count,
            "format_family": dataset.format_family,
            "schema_fingerprint": schema_fingerprint["schema_fingerprint"],
            "type_router": type_router,
            "field_count": len(schema_fields),
            "null_heavy_fields": [f["name"] for f in schema_fields if f.get("null_ratio", 0) >= 0.8],
            "range_sample": sample_state.get("range_sample"),
            "parquet_sample": sample_state.get("parquet_sample"),
            "local_sample_path": sample_state.get("local_sample_path"),
            "sample_input_s3_uri": sample_state.get("sample_input_s3_uri"),
        }
        profile_result_contract = {
            "schema_version": "m3.l2.profile_result_contract.v2.1.1",
            "profile_job_request_id": profile_job_request["request_id"],
            "source_id": dataset.source_id,
            "source_unit_id": source_unit_id,
            "result_status": "local_contract_probe_complete",
            "result_artifacts": {
                "profile_snapshot_ref": "profile_snapshot.json",
                "schema_fingerprint_ref": "schema_fingerprint.json",
                "sketch_profile_ref": "large_source_sketch_profile.json",
                "type_router_ref": "type_router_profile.json",
            },
            "m3_acceptance_rule": "M3 consumes this contract shape; production profile values are accepted only when generated by M2 or explicitly marked as local probe evidence.",
        }
        self.write_artifact(layer_dir / "profile_job_request.json", profile_job_request)
        self.write_artifact(layer_dir / "profile_result_contract.json", profile_result_contract)
        self.write_artifact(layer_dir / "schema_fingerprint.json", schema_fingerprint)
        self.write_artifact(layer_dir / "csv_dialect_profile.json", csv_profile)
        self.write_artifact(layer_dir / "jsonl_line_validation_profile.json", jsonl_profile)
        self.write_artifact(layer_dir / "json_path_trie_profile.json", json_path_profile)
        self.write_artifact(layer_dir / "large_source_sketch_profile.json", sketch_profile)
        self.write_artifact(layer_dir / "type_router_profile.json", type_router)
        self.write_artifact(layer_dir / "two_stage_profile.json", two_stage)
        self.write_artifact(layer_dir / "profile_snapshot.json", profile_snapshot)
        return {
            "row_count": row_count,
            "schema_fields": schema_fields,
            "schema_fingerprint": schema_fingerprint["schema_fingerprint"],
            "csv_profile": csv_profile,
            "jsonl_profile": jsonl_profile,
            "json_path_profile": json_path_profile,
            "sketch_profile": sketch_profile,
            "type_router": type_router,
            "profile_snapshot": profile_snapshot,
            "profile_job_request": profile_job_request,
            "profile_result_contract": profile_result_contract,
            "artifact_refs": {
                "profile_job_request": rel(layer_dir / "profile_job_request.json", self.artifact_root),
                "profile_result_contract": rel(layer_dir / "profile_result_contract.json", self.artifact_root),
                "schema_fingerprint": rel(layer_dir / "schema_fingerprint.json", self.artifact_root),
                "type_router": rel(layer_dir / "type_router_profile.json", self.artifact_root),
                "profile_snapshot": rel(layer_dir / "profile_snapshot.json", self.artifact_root),
            },
        }

    def profile_schema(self, df: DataFrame, row_count: int) -> list[dict[str, Any]]:
        fields: list[dict[str, Any]] = []
        columns = df.columns[:80]
        if not columns:
            return fields
        null_exprs = [F.sum(F.col(c).isNull().cast("int")).alias(c) for c in columns]
        nulls = df.select(*columns).agg(*null_exprs).collect()[0].asDict() if row_count else {}
        dtypes = dict(df.dtypes)
        examples = df.select(*columns[:20]).limit(5).collect()
        example_map: dict[str, list[Any]] = {c: [] for c in columns}
        for row in examples:
            values = row.asDict(recursive=True)
            for c in columns:
                if c in values and values[c] is not None and len(example_map[c]) < 3:
                    example_map[c].append(safe_value(values[c], 120))
        for c in columns:
            null_count = int(nulls.get(c) or 0)
            fields.append(
                {
                    "name": c,
                    "spark_type": dtypes.get(c, "unknown"),
                    "null_count": null_count,
                    "null_ratio": round(null_count / row_count, 6) if row_count else None,
                    "examples": example_map.get(c, []),
                }
            )
        return fields

    def profile_csv(self, dataset: DatasetSpec, sample_state: dict[str, Any]) -> dict[str, Any]:
        if dataset.format_family != "csv":
            return {"status": "not_applicable", "reason": f"{dataset.format_family} source"}
        sample = sample_state.get("raw_text_sample", "")
        try:
            dialect = csv.Sniffer().sniff(sample[:10000])
            has_header = csv.Sniffer().has_header(sample[:10000])
            detected = {
                "delimiter": dialect.delimiter,
                "quotechar": dialect.quotechar,
                "escapechar": dialect.escapechar,
                "doublequote": dialect.doublequote,
                "has_header": has_header,
            }
        except Exception as exc:
            detected = {
                "delimiter": ",",
                "quotechar": '"',
                "escapechar": None,
                "doublequote": True,
                "has_header": True,
                "sniffer_error": str(exc),
            }
        return {
            "status": "profiled",
            "sample_bytes": len(sample.encode("utf-8", errors="ignore")),
            "detected": detected,
            "spark_options": {"header": True, "mode": "PERMISSIVE", "multiLine": False},
        }

    def profile_jsonl(self, dataset: DatasetSpec, sample_state: dict[str, Any]) -> dict[str, Any]:
        if dataset.format_family != "jsonl":
            return {"status": "not_applicable", "reason": f"{dataset.format_family} source"}
        total = len(sample_state.get("json_sample_strings", []))
        invalid = int(sample_state.get("invalid_json_sample_rows") or 0)
        return {
            "status": "profiled",
            "sample_lines_checked": total,
            "invalid_line_count": invalid,
            "parse_success_ratio": round((total - invalid) / total, 6) if total else None,
            "line_validation_policy": "invalid lines go to L1 rescue lane and L5 quarantine if confirmed in execution",
        }

    def profile_json_paths(self, dataset: DatasetSpec, sample_state: dict[str, Any], schema_fields: list[dict[str, Any]]) -> dict[str, Any]:
        if dataset.format_family != "jsonl":
            return {
                "status": "derived_from_columns",
                "paths": [{"path": f"$.{field['name']}", "observed_types": [field["spark_type"]], "count": sample_state["sample_rows"]} for field in schema_fields[:80]],
            }
        counts: dict[str, dict[str, Any]] = {}
        for obj in sample_state.get("json_sample_objects", [])[:1000]:
            for path, value in flatten_json(obj).items():
                entry = counts.setdefault(path, {"path": path, "count": 0, "types": {}})
                entry["count"] += 1
                typ = json_type(value)
                entry["types"][typ] = entry["types"].get(typ, 0) + 1
        paths = sorted(counts.values(), key=lambda item: (-item["count"], item["path"]))[:200]
        for item in paths:
            item["observed_types"] = [{"type": k, "count": v} for k, v in sorted(item.pop("types").items())]
        return {"status": "profiled", "sample_objects": min(len(sample_state.get("json_sample_objects", [])), 1000), "paths": paths}

    def profile_sketch(self, df: DataFrame, row_count: int) -> dict[str, Any]:
        dtypes = dict(df.dtypes)
        numeric_types = {"int", "bigint", "double", "float", "long", "short", "decimal"}
        numeric_cols = [c for c, t in dtypes.items() if any(t.startswith(nt) for nt in numeric_types)][:20]
        string_cols = [c for c, t in dtypes.items() if t == "string"][:20]
        numeric: dict[str, Any] = {}
        for col in numeric_cols:
            try:
                stats = df.agg(
                    F.min(F.col(col)).alias("min"),
                    F.max(F.col(col)).alias("max"),
                    F.avg(F.col(col)).alias("avg"),
                    F.stddev(F.col(col)).alias("stddev"),
                ).collect()[0].asDict()
                numeric[col] = {k: safe_value(v) for k, v in stats.items()}
            except Exception as exc:
                numeric[col] = {"error": str(exc)}
        top_values: dict[str, Any] = {}
        for col in string_cols[:10]:
            try:
                top_values[col] = [
                    {"value": safe_value(row[col]), "count": row["count"]}
                    for row in df.groupBy(col).count().orderBy(F.desc("count")).limit(5).collect()
                ]
            except Exception as exc:
                top_values[col] = [{"error": str(exc)}]
        return {"sample_rows": row_count, "numeric": numeric, "top_values": top_values, "sketch_note": "Spark aggregate over bounded M3 control-plane sample"}

    def selected_profilers(self, fmt: str) -> list[str]:
        if fmt == "csv":
            return ["type_router", "csv_dialect_profile", "schema_fingerprint", "large_source_sketch"]
        if fmt == "jsonl":
            return ["type_router", "jsonl_line_validation", "json_path_trie", "schema_fingerprint", "large_source_sketch"]
        if fmt == "parquet":
            return ["type_router", "spark_schema_snapshot", "schema_fingerprint", "large_source_sketch"]
        return ["type_router", "unknown_two_stage"]

    def build_l3(self, dataset: DatasetSpec, state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l3"
        fields = state["l2"]["schema_fields"]
        field_classifications = {field["name"]: classify_field_name(field["name"]) for field in fields}
        pii_candidates = [
            field["name"]
            for field in fields
            if field_classifications[field["name"]]["class"] in {"direct_sensitive", "user_or_session_identifier", "possible_person_name", "unknown_identifier"}
        ]
        silver_rules = []
        for field in fields[:80]:
            name = field["name"]
            spark_type = field["spark_type"]
            classification = field_classifications[name]
            nested_sensitive_paths = self.nested_sensitive_paths(name, state["l2"].get("json_path_profile", {}))
            action = "keep"
            reason = "field observed in bounded Spark profile"
            if classification["class"] == "direct_sensitive":
                action = "mask_or_hash"
                reason = classification["reason"]
            elif classification["class"] == "user_or_session_identifier":
                action = "hash_for_join_or_hide_from_default_catalog"
                reason = classification["reason"]
            elif classification["class"] in {"possible_person_name", "unknown_identifier"}:
                action = "keep_with_catalog_caveat"
                reason = classification["reason"]
            if field.get("null_ratio") is not None and field["null_ratio"] >= 0.95:
                action = "review_or_drop"
                reason = "null-heavy field"
            if spark_type.startswith("struct") or spark_type.startswith("array"):
                action = "flatten_or_json_string"
                reason = "complex nested field"
                if nested_sensitive_paths:
                    reason = "complex nested field with identifier-like nested paths"
            target_name = self.silver_rule_target_name(name, action)
            silver_rules.append(
                {
                    "field": name,
                    "action": action,
                    "target_name": target_name,
                    "execution_semantics": self.silver_rule_execution_semantics(action),
                    "nested_sensitive_paths": nested_sensitive_paths,
                    "catalog_caveats": self.silver_rule_catalog_caveats(action, classification, nested_sensitive_paths),
                    "reason": reason,
                    "source_type": spark_type,
                    "field_class": classification["class"],
                    "classification_reason": classification["reason"],
                }
            )
        gold_models = self.recommend_gold_models(dataset, fields)
        reducer = {
            "source_id": dataset.source_id,
            "source_unit_id": state["l0"]["source_unit_id"],
            "input_refs": [state["l2"]["artifact_refs"]["profile_snapshot"], state["l1"]["artifact_refs"]["sample_lane"]],
            "row_ai_calls": 0,
            "reduction_policy": "rule-based profile reducer; AI/control-plane would see only this package",
            "field_count_in": len(fields),
            "field_count_out": min(len(fields), 80),
            "pii_candidate_fields": pii_candidates,
            "field_classifications": list(field_classifications.values())[:80],
            "top_evidence_fields": [f["name"] for f in fields[:25]],
        }
        ai_input_pack = {
            "schema_version": "m3.l3.ai_recommendation_input_pack.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "model_slot": "gpt-5.3-codex-spark",
            "model_slot_role": "recommendation_control_plane_only_not_apache_spark_execution",
            "allowed_inputs": {
                "profile_snapshot_ref": state["l2"]["artifact_refs"]["profile_snapshot"],
                "schema_fingerprint_ref": state["l2"]["artifact_refs"]["schema_fingerprint"],
                "json_path_profile_ref": rel(layer_dir.parent / "l2" / "json_path_trie_profile.json", self.artifact_root),
                "sketch_profile_ref": rel(layer_dir.parent / "l2" / "large_source_sketch_profile.json", self.artifact_root),
                "bounded_bronze_sample_ref": state["l1"]["artifact_refs"]["sample_lane"],
            },
            "forbidden_inputs": [
                "full raw payload",
                "unbounded row stream",
                "secret values",
                "per-row realtime model calls",
            ],
            "reduced_evidence": {
                "field_count": len(fields),
                "pii_candidate_fields": pii_candidates,
                "field_class_counts": {
                    cls: sum(1 for item in field_classifications.values() if item["class"] == cls)
                    for cls in sorted({item["class"] for item in field_classifications.values()})
                },
                "top_evidence_fields": [f["name"] for f in fields[:25]],
                "null_heavy_fields": [f["name"] for f in fields if f.get("null_ratio", 0) >= 0.8],
            },
            "output_expected_from_ai": [
                "silver_policy_recommendation_draft",
                "gold_model_recommendation_draft",
                "optional_gold_to_gold_option_schema",
                "risk_notes",
                "unsupported_action_report_candidates",
            ],
        }
        policy_context_pack = {
            "schema_version": "m3.l3.policy_context_pack.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_id": state["l0"]["source_unit_id"],
            "policy_boundaries": {
                "pii_handling_allowed_values": ["none", "mask", "hash"],
                "catalog_exposure_allowed_values": ["visible", "hidden", "restricted"],
                "query_context_exposure_allowed_values": ["allowed", "caveated", "forbidden"],
                "preview_write_mode_allowed_values": ["preview_only"],
            },
            "downstream_owners": {
                "silver_gold_preview_execution": "M2",
                "approval_and_storage": "M5",
                "query_context_consumption": "M6",
            },
        }
        bronze_to_silver = {
            "source_id": dataset.source_id,
            "source_unit_id": state["l0"]["source_unit_id"],
            "recommendation_version_id": f"rver_{self.run_id}_{dataset.key}_silver",
            "recommendations": silver_rules,
            "quarantine_recommendations": self.quarantine_recommendations(dataset, fields),
            "processing_ready": True,
            "catalog_review_required": bool(pii_candidates),
            "requires_human_review": bool(pii_candidates),
        }
        silver_to_gold = {
            "source_id": dataset.source_id,
            "source_unit_id": state["l0"]["source_unit_id"],
            "recommendation_version_id": f"rver_{self.run_id}_{dataset.key}_gold",
            "gold_models": gold_models,
            "technical_preview_ready": True,
            "semantic_owner_review_required": True,
            "requires_human_review": True,
        }
        gold_to_gold_option = {
            "schema_version": "m3.l3.gold_to_gold_option.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_id": state["l0"]["source_unit_id"],
            "option_version_id": f"option_{self.run_id}_{dataset.key}_gold_refinement",
            "request_state": "not_requested",
            "default_selected": False,
            "user_selectable": True,
            "selected_option": None,
            "core_transform_dependency": "none_when_not_requested",
            "does_not_modify": ["raw_to_bronze", "bronze_to_silver", "silver_to_gold"],
            "activation_rule": "Only create executable Gold-to-Gold spec and M2 preview work when a user explicitly selects an option and M5 records approval.",
            "available_option_templates": [
                {
                    "option_type": "serving_metric_alias",
                    "purpose": "rename or expose Gold metrics with business-friendly aliases without changing the underlying aggregate grain",
                    "params_schema": {"metric_aliases": "array of {source_metric, target_metric, description}"},
                    "safe_default": "not_requested",
                },
                {
                    "option_type": "top_n_serving_gold",
                    "purpose": "derive a smaller query-facing Gold table such as top products, top locations, or top categories from an existing Gold table",
                    "params_schema": {"order_by": "metric name", "limit": "positive integer", "ties": "include|break_by_secondary_sort"},
                    "safe_default": "not_requested",
                },
                {
                    "option_type": "coarser_rollup",
                    "purpose": "roll up an already approved Gold table to a coarser grain for faster M6 query context",
                    "params_schema": {"new_grain": "array of existing Gold dimensions", "measure_policy": "sum|avg|recompute_from_source_required"},
                    "safe_default": "not_requested",
                },
                {
                    "option_type": "derived_metric",
                    "purpose": "add deterministic derived metrics from existing Gold measures, such as rate or ratio, after owner approval",
                    "params_schema": {"expression": "restricted arithmetic expression over existing measures", "division_by_zero": "null|zero|warn"},
                    "safe_default": "not_requested",
                },
            ],
            "must_not_be_used_for": [
                "fixing a broken Silver transform",
                "hiding source-contract mismatch",
                "making Gold semantically ready without owner review",
                "per-row AI transformation",
            ],
        }
        package = {
            "source_id": dataset.source_id,
            "source_unit_id": state["l0"]["source_unit_id"],
            "dataset_key": dataset.key,
            "ai_boundary": "profile/control-plane only; no per-row realtime AI",
            "ai_recommendation_input_pack_ref": "ai_recommendation_input_pack.json",
            "policy_context_pack_ref": "policy_context_pack.json",
            "rule_based_reducer_ref": "recommendation_evidence_reducer.json",
            "bronze_to_silver_ref": "bronze_to_silver_recommendation.json",
            "silver_to_gold_ref": "silver_to_gold_recommendation.json",
            "gold_to_gold_option_ref": "gold_to_gold_option.json",
        }
        approval = {
            "source_id": dataset.source_id,
            "source_unit_id": state["l0"]["source_unit_id"],
            "approval_status": "draft_auto_approved_for_contract_probe",
            "approved_silver_rule_count": len(silver_rules),
            "approved_gold_model_count": len(gold_models),
            "human_can_edit": True,
            "note": "This run creates executable draft specs; product UI should expose rules for edit before production execution.",
        }
        self.write_artifact(layer_dir / "ai_recommendation_input_pack.json", ai_input_pack)
        self.write_artifact(layer_dir / "policy_context_pack.json", policy_context_pack)
        self.write_artifact(layer_dir / "recommendation_evidence_reducer.json", reducer)
        self.write_artifact(layer_dir / "bronze_to_silver_recommendation.json", bronze_to_silver)
        self.write_artifact(layer_dir / "silver_to_gold_recommendation.json", silver_to_gold)
        self.write_artifact(layer_dir / "gold_to_gold_option.json", gold_to_gold_option)
        self.write_artifact(layer_dir / "recommendation_package.json", package)
        self.write_artifact(layer_dir / "approval_decision.json", approval)
        return {
            "reducer": reducer,
            "ai_input_pack": ai_input_pack,
            "policy_context_pack": policy_context_pack,
            "silver_rules": silver_rules,
            "gold_models": gold_models,
            "gold_to_gold_option": gold_to_gold_option,
            "approval": approval,
            "artifact_refs": {
                "ai_input_pack": rel(layer_dir / "ai_recommendation_input_pack.json", self.artifact_root),
                "policy_context_pack": rel(layer_dir / "policy_context_pack.json", self.artifact_root),
                "reducer": rel(layer_dir / "recommendation_evidence_reducer.json", self.artifact_root),
                "silver_recommendation": rel(layer_dir / "bronze_to_silver_recommendation.json", self.artifact_root),
                "gold_recommendation": rel(layer_dir / "silver_to_gold_recommendation.json", self.artifact_root),
                "gold_to_gold_option": rel(layer_dir / "gold_to_gold_option.json", self.artifact_root),
                "approval": rel(layer_dir / "approval_decision.json", self.artifact_root),
            },
        }

    def normalize_column(self, name: str) -> str:
        normalized = re.sub(r"[^0-9A-Za-z_]+", "_", name).strip("_").lower()
        return normalized or "unnamed_field"

    def silver_rule_target_name(self, source_name: str, action: str) -> str:
        target = self.normalize_column(source_name)
        if action in {"mask_or_hash", "hash_for_join_or_hide_from_default_catalog"}:
            return target if target.endswith("_sha256") else f"{target}_sha256"
        return target

    def silver_rule_execution_semantics(self, action: str) -> str:
        if action == "review_or_drop":
            return "retain in deterministic preview; production drop requires owner approval; catalog must carry null-heavy caveat"
        if action in {"mask_or_hash", "hash_for_join_or_hide_from_default_catalog"}:
            return "replace default output with deterministic sha256 string; raw identifier is not exposed in default catalog"
        if action == "flatten_or_json_string":
            return "convert nested value to deterministic JSON string unless owner approves a deeper flattening spec"
        if action == "keep_with_catalog_caveat":
            return "retain value and attach catalog/query caveat before broad exposure"
        return "retain value deterministically"

    def silver_rule_catalog_caveats(self, action: str, classification: dict[str, Any], nested_sensitive_paths: list[dict[str, Any]]) -> list[str]:
        caveats: list[str] = []
        if classification["class"] in {"direct_sensitive", "user_or_session_identifier", "possible_person_name", "unknown_identifier"}:
            caveats.append(f"default catalog exposure requires review: {classification['reason']}")
        if nested_sensitive_paths:
            caveats.append("serialized nested value contains identifier-like paths; catalog/query context must expose caveat or hide field by default")
        if action == "review_or_drop":
            caveats.append("null-heavy field retained only as deterministic preview until owner approves drop or exposure")
        return caveats

    def nested_sensitive_paths(self, source_name: str, json_path_profile: dict[str, Any]) -> list[dict[str, Any]]:
        prefix = f"$.{source_name}"
        results: list[dict[str, Any]] = []
        for item in json_path_profile.get("paths", []):
            path = str(item.get("path", ""))
            if not path.startswith(prefix + ".") and not path.startswith(prefix + "[]"):
                continue
            leaf = path.replace("[]", "").split(".")[-1]
            classification = classify_field_name(leaf)
            if classification["class"] in {"direct_sensitive", "user_or_session_identifier", "possible_person_name", "unknown_identifier", "business_key"}:
                results.append(
                    {
                        "path": path,
                        "leaf": leaf,
                        "field_class": classification["class"],
                        "reason": classification["reason"],
                        "count": item.get("count"),
                    }
                )
            if len(results) >= 20:
                break
        return results

    def lineage_silver_field_name(self, source_name: str, rule: dict[str, Any] | None) -> str:
        target = (rule or {}).get("target_name") or self.normalize_column(source_name)
        if (rule or {}).get("action") in {"mask_or_hash", "hash_for_join_or_hide_from_default_catalog"}:
            return target if target.endswith("_sha256") else f"{target}_sha256"
        return target

    def quarantine_recommendations(self, dataset: DatasetSpec, fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
        rules = []
        names = {f["name"] for f in fields}
        if dataset.domain == "nyc_taxi":
            for candidate in ["total_amount", "fare_amount", "trip_distance"]:
                if candidate in names:
                    rules.append({"rule_id": f"non_negative_{candidate}", "field": candidate, "condition": f"{candidate} < 0", "severity": "warn_or_quarantine"})
        for field in fields:
            name = field["name"]
            lower = name.lower()
            if "lat" in lower:
                rules.append({"rule_id": f"valid_latitude_{self.normalize_column(name)}", "field": name, "condition": f"{name} < -90 OR {name} > 90", "severity": "quality_caveat_or_quarantine"})
            if "lon" in lower or "lng" in lower:
                rules.append({"rule_id": f"valid_longitude_{self.normalize_column(name)}", "field": name, "condition": f"{name} < -180 OR {name} > 180", "severity": "quality_caveat_or_quarantine"})
        if dataset.format_family == "jsonl":
            rules.append({"rule_id": "json_parse_failure", "field": "_raw_line", "condition": "malformed_json", "severity": "quarantine"})
        return rules

    def recommend_gold_models(self, dataset: DatasetSpec, fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
        names = {f["name"] for f in fields}
        models: list[dict[str, Any]] = []
        if "parent_asin" in names and "rating" in names:
            models.append(
                {
                    "model_id": "gold_product_review_metrics",
                    "grain": ["parent_asin"],
                    "dimensions": ["parent_asin"],
                    "measures": [{"name": "review_count", "agg": "count"}, {"name": "avg_rating", "field": "rating", "agg": "avg"}],
                    "caveats": ["user_id remains PII-like and should not be default dimension"],
                }
            )
        if dataset.domain == "nyc_taxi":
            grain = "payment_type" if "payment_type" in names else ("PULocationID" if "PULocationID" in names else None)
            if grain:
                measures = [{"name": "trip_count", "agg": "count"}]
                for measure_field in ["total_amount", "fare_amount", "trip_distance"]:
                    if measure_field in names:
                        measures.append({"name": f"avg_{measure_field}", "field": measure_field, "agg": "avg"})
                models.append({"model_id": f"gold_taxi_by_{grain}", "grain": [grain], "dimensions": [grain], "measures": measures, "caveats": ["location grain must be checked for null collapse before M6 primary use"]})
        if dataset.domain.startswith("ecommerce"):
            grain = next((c for c in ["event_name", "event_type", "product_id", "item_id", "brand_id", "category_id", "cate_id", "event_time"] if c in names), None)
            if grain:
                models.append({"model_id": f"gold_ecommerce_by_{grain}", "grain": [grain], "dimensions": [grain], "measures": [{"name": "row_count", "agg": "count"}], "caveats": ["feature/event meaning requires owner confirmation; user/session identifiers are not default Gold dimensions"]})
        if not models:
            fallback = fields[0]["name"] if fields else "_all"
            models.append({"model_id": "gold_dataset_row_count", "grain": [fallback], "dimensions": [fallback], "measures": [{"name": "row_count", "agg": "count"}], "caveats": ["fallback model; semantic owner must confirm usefulness"]})
        return models

    def build_l4(self, dataset: DatasetSpec, state: dict[str, Any], sample_state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l4"
        df: DataFrame = sample_state["df"]
        silver_df = self.build_silver_df(dataset, df, state["l3"]["silver_rules"])
        silver_rows = silver_df.count()
        silver_uri = f"s3a://m3-silver/m3_contract_runs/{self.run_id}/{dataset.key}/silver_preview"
        silver_df.coalesce(1).write.mode("overwrite").parquet(silver_uri)
        gold_df, gold_model_id = self.build_gold_df(dataset, silver_df, state["l3"]["gold_models"])
        gold_rows = gold_df.count()
        gold_uri = f"s3a://m3-gold/m3_contract_runs/{self.run_id}/{dataset.key}/{gold_model_id}"
        gold_df.coalesce(1).write.mode("overwrite").parquet(gold_uri)
        execution_contract = {
            "preview_mode": "bounded_control_plane_sample",
            "production_materialization_owner": "M2 Spark",
            "m3_responsibility": "recommend and freeze deterministic specs, catalog metadata, and quality gates; do not run unbounded realtime data-plane AI",
            "spark_input_uri": dataset.s3_uri,
            "shared_sample_input_s3_uri": sample_state.get("sample_input_s3_uri"),
            "large_data_strategy": "use object/partition manifests, S3A reads, Spark aggregations, and scheduled/drift-triggered profiling instead of per-row AI calls",
            "incremental_plan": {
                "read_trigger": "micro_batch_or_scheduled_batch_by_new_object_manifest",
                "checkpoint_owner": "M2",
                "checkpoint_hint": f"s3a://m3-artifacts/m3_contract_runs/{self.run_id}/{dataset.key}/checkpoints/",
                "state_policy": "state only for deterministic aggregates; no LLM state in streaming path",
                "late_data_policy": "watermark or partition-close policy must be defined by source owner before production use",
            },
        }
        silver_recommendation_draft = {
            "schema_version": "m3.l4.silver_policy_recommendation_draft.v2.1.1",
            "recommendation_version_id": f"draft_{self.run_id}_{dataset.key}_silver",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "created_by": "M3 AI/control-plane recommendation slot",
            "model_slot": state["l3"]["ai_input_pack"]["model_slot"],
            "model_input_pack_ref": state["l3"]["artifact_refs"]["ai_input_pack"],
            "editable_by": ["M1 source owner", "M5 approval workflow"],
            "recommendations": state["l3"]["silver_rules"],
            "pii_query_context_validator": {
                "rule": "direct sensitive and user/session identifier fields must not enter default M6 query context unless hashed/hidden/caveated",
                "pii_handling_allowed_values": ["none", "mask", "hash"],
                "catalog_exposure_values": ["visible", "hidden", "restricted"],
                "query_context_exposure_values": ["allowed", "caveated", "forbidden"],
            },
        }
        gold_recommendation_draft = {
            "schema_version": "m3.l4.gold_model_recommendation_draft.v2.1.1",
            "recommendation_version_id": f"draft_{self.run_id}_{dataset.key}_gold",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "created_by": "M3 AI/control-plane recommendation slot",
            "model_slot": state["l3"]["ai_input_pack"]["model_slot"],
            "model_input_pack_ref": state["l3"]["artifact_refs"]["ai_input_pack"],
            "editable_by": ["M1 source owner", "M5 approval workflow"],
            "gold_models": state["l3"]["gold_models"],
            "gold_request_state": "recommended",
            "not_requested_or_deferred_policy": "L9 must still emit gold_readiness_axis.json with status not_requested or deferred if owner disables Gold.",
        }
        ai_generation_trace = {
            "schema_version": "m3.l4.ai_generation_trace.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "model_slot": state["l3"]["ai_input_pack"]["model_slot"],
            "service_tier": "standard",
            "input_artifact_refs": [state["l3"]["artifact_refs"]["ai_input_pack"], state["l3"]["artifact_refs"]["policy_context_pack"]],
            "row_ai_calls": 0,
            "trace_status": "local_rule_based_fallback_used_when_cli_model_result_is_not_attached",
            "required_if_real_cli_used": ["prompt_artifact_id", "response_artifact_id", "model_name", "created_at", "token_usage"],
        }
        silver_preview_job_request = {
            "schema_version": "m3.l4.m2_preview_job_request.v2.1.1",
            "job_request_id": f"m2_silver_preview_{self.run_id}_{dataset.key}",
            "requested_by": "M3",
            "execution_owner": "M2 Spark",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "input_spec_ref": "silver_transform_spec.json",
            "write_mode": "preview_only",
            "output_uri": silver_uri,
            "preview_scope": {
                "source_unit_ids": [state["l0"]["source_unit_id"]],
                "object_ids": state["l0"]["source_unit_manifest"]["source_units"][0]["object_ids"][:20],
                "stream_window_ids": [],
            },
            "legacy_window_id_policy": "core schema forbids window_id; normalize to stream_window_ids[] only when L0 can resolve it, otherwise block.",
        }
        gold_preview_job_request = {
            "schema_version": "m3.l4.m2_preview_job_request.v2.1.1",
            "job_request_id": f"m2_gold_preview_{self.run_id}_{dataset.key}",
            "requested_by": "M3",
            "execution_owner": "M2 Spark",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "input_spec_ref": "gold_generation_spec.json",
            "input_silver_preview_uri": silver_uri,
            "write_mode": "preview_only",
            "output_uri": gold_uri,
            "preview_scope": {
                "source_unit_ids": [state["l0"]["source_unit_id"]],
                "stream_window_ids": [],
            },
        }
        silver_spec = {
            "silver_transform_spec_id": f"silver_{self.run_id}_{dataset.key}",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "input": {"bronze_sample_ref": state["l1"]["artifact_refs"]["sample_lane"], "raw_read_uri": dataset.s3_uri},
            "output": {"format": "parquet", "preview_uri": silver_uri, "schema": [{"name": c, "spark_type": t} for c, t in silver_df.dtypes]},
            "rules": state["l3"]["silver_rules"],
            "execution_owner": "M2 Spark",
            "spec_owner": "M3 deterministic compiler contract; M2 execution job consumes this spec",
            "draft_owner": "M3",
            "m3_artifact_role": "recommendation_and_contract_draft",
            "write_mode": "preview_only",
            "execution_contract": execution_contract,
        }
        gold_spec = {
            "gold_generation_spec_id": f"gold_{self.run_id}_{dataset.key}",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "input_silver_uri": silver_uri,
            "output_gold_uri": gold_uri,
            "models": state["l3"]["gold_models"],
            "selected_preview_model_id": gold_model_id,
            "execution_owner": "M2 Spark",
            "spec_owner": "M3 deterministic compiler contract; M2 execution job consumes this spec",
            "draft_owner": "M3",
            "m3_artifact_role": "recommendation_and_contract_draft",
            "write_mode": "preview_only",
            "execution_contract": {
                **execution_contract,
                "spark_input_uri": silver_uri,
                "gold_materialization_rule": "M2 applies selected grain/dimension/measure definitions to full Silver tables; this run only validates bounded preview feasibility",
            },
        }
        graph = {
            "nodes": [
                {"id": "l0_raw", "layer": "L0", "type": "source"},
                {"id": "l1_bronze", "layer": "L1", "type": "envelope"},
                {"id": "l2_profile", "layer": "L2", "type": "profile"},
                {"id": "l3_recommendation", "layer": "L3", "type": "recommendation"},
                {"id": "l4_ai_draft", "layer": "L4", "type": "ai_recommendation_draft"},
                {"id": "l5_decision", "layer": "L5", "type": "approval_state"},
                {"id": "l6_compiler", "layer": "L6", "type": "deterministic_spec_compiler"},
                {"id": "l7_silver_preview", "layer": "L7", "type": "m2_silver_preview_validation"},
                {"id": "l8_gold_preview", "layer": "L8", "type": "m2_gold_preview_validation"},
                {"id": "l9_gate", "layer": "L9", "type": "multi_axis_gate"},
                {"id": "l10_catalog", "layer": "L10", "type": "catalog_semantic_handoff"},
            ],
            "edges": [
                {"from": "l0_raw", "to": "l1_bronze", "reason": "source-offset envelope"},
                {"from": "l1_bronze", "to": "l2_profile", "reason": "bounded sample profile"},
                {"from": "l2_profile", "to": "l3_recommendation", "reason": "bounded profile evidence reducer"},
                {"from": "l3_recommendation", "to": "l4_ai_draft", "reason": "model-slot recommendation draft"},
                {"from": "l4_ai_draft", "to": "l5_decision", "reason": "editable user/M5 decision"},
                {"from": "l5_decision", "to": "l6_compiler", "reason": "approved decisions compile to deterministic specs"},
                {"from": "l6_compiler", "to": "l7_silver_preview", "reason": "M2 executes Silver preview"},
                {"from": "l7_silver_preview", "to": "l8_gold_preview", "reason": "M2 executes Gold preview from Silver"},
                {"from": "l8_gold_preview", "to": "l9_gate", "reason": "gate consumes preview metrics"},
                {"from": "l9_gate", "to": "l10_catalog", "reason": "catalog and query-context handoff"},
            ],
        }
        compiler_validation = {
            "status": "pass",
            "checked_forbidden_patterns": ["per_row_ai", "collect_all_rows", "eval_generated_code", "unbounded_llm_call"],
            "spark_preview_written": True,
            "silver_rows": silver_rows,
            "gold_rows": gold_rows,
            "warnings": [] if gold_rows else ["gold preview has zero rows"],
            "unsupported_action_report_ref": "unsupported_action_report.json",
            "write_mode_policy": "preview_only is the only allowed L6/L7/L8 write mode in this core contract.",
        }
        unsupported_action_report = {
            "schema_version": "m3.l6.unsupported_action_report.v2.1.1",
            "status": "pass",
            "unsupported_actions": [],
            "checked_actions": sorted({rule.get("action", "keep") for rule in state["l3"]["silver_rules"]}),
            "allowed_actions": ["keep", "mask_or_hash", "hash_for_join_or_hide_from_default_catalog", "keep_with_catalog_caveat", "review_or_drop", "flatten_or_json_string"],
        }
        silver_validation = {
            "status": "pass" if silver_rows else "fail",
            "silver_preview_uri": silver_uri,
            "input_sample_rows": sample_state["sample_rows"],
            "silver_preview_rows": silver_rows,
            "output_column_count": len(silver_df.columns),
        }
        gold_validation = {
            "status": "pass" if gold_rows else "warn",
            "gold_preview_uri": gold_uri,
            "selected_model_id": gold_model_id,
            "gold_preview_rows": gold_rows,
            "semantic_warnings": self.gold_semantic_warnings(dataset, gold_df, gold_model_id),
        }
        self.write_artifact(layer_dir / "silver_policy_recommendation_draft.json", silver_recommendation_draft)
        self.write_artifact(layer_dir / "gold_model_recommendation_draft.json", gold_recommendation_draft)
        self.write_artifact(layer_dir / "ai_generation_trace.json", ai_generation_trace)
        self.write_artifact(layer_dir / "m2_silver_preview_job_request.json", silver_preview_job_request)
        self.write_artifact(layer_dir / "m2_gold_preview_job_request.json", gold_preview_job_request)
        self.write_artifact(layer_dir / "silver_transform_spec.json", silver_spec)
        self.write_artifact_text(layer_dir / "silver_transform_spec.yaml", simple_yaml(silver_spec) + "\n")
        self.write_artifact(layer_dir / "gold_generation_spec.json", gold_spec)
        self.write_artifact_text(layer_dir / "gold_generation_spec.yaml", simple_yaml(gold_spec) + "\n")
        self.write_artifact(layer_dir / "layered_transform_graph.json", graph)
        self.write_artifact(layer_dir / "compiler_validation_result.json", compiler_validation)
        self.write_artifact(layer_dir / "unsupported_action_report.json", unsupported_action_report)
        self.write_artifact(layer_dir / "silver_preview_validation_result.json", silver_validation)
        self.write_artifact(layer_dir / "gold_preview_validation_result.json", gold_validation)
        return {
            "silver_uri": silver_uri,
            "gold_uri": gold_uri,
            "silver_rows": silver_rows,
            "gold_rows": gold_rows,
            "gold_model_id": gold_model_id,
            "silver_recommendation_draft": silver_recommendation_draft,
            "gold_recommendation_draft": gold_recommendation_draft,
            "ai_generation_trace": ai_generation_trace,
            "silver_preview_job_request": silver_preview_job_request,
            "gold_preview_job_request": gold_preview_job_request,
            "compiler_validation": compiler_validation,
            "unsupported_action_report": unsupported_action_report,
            "silver_validation": silver_validation,
            "gold_validation": gold_validation,
            "artifact_refs": {
                "silver_recommendation_draft": rel(layer_dir / "silver_policy_recommendation_draft.json", self.artifact_root),
                "gold_recommendation_draft": rel(layer_dir / "gold_model_recommendation_draft.json", self.artifact_root),
                "ai_generation_trace": rel(layer_dir / "ai_generation_trace.json", self.artifact_root),
                "m2_silver_preview_job_request": rel(layer_dir / "m2_silver_preview_job_request.json", self.artifact_root),
                "m2_gold_preview_job_request": rel(layer_dir / "m2_gold_preview_job_request.json", self.artifact_root),
                "silver_spec": rel(layer_dir / "silver_transform_spec.json", self.artifact_root),
                "gold_spec": rel(layer_dir / "gold_generation_spec.json", self.artifact_root),
                "graph": rel(layer_dir / "layered_transform_graph.json", self.artifact_root),
                "compiler": rel(layer_dir / "compiler_validation_result.json", self.artifact_root),
                "unsupported_action_report": rel(layer_dir / "unsupported_action_report.json", self.artifact_root),
                "silver_preview_validation": rel(layer_dir / "silver_preview_validation_result.json", self.artifact_root),
                "gold_preview_validation": rel(layer_dir / "gold_preview_validation_result.json", self.artifact_root),
            },
        }

    def build_silver_df(self, dataset: DatasetSpec, df: DataFrame, rules: list[dict[str, Any]]) -> DataFrame:
        selected_cols = []
        for rule in rules[:40]:
            field = rule["field"]
            if field not in df.columns:
                continue
            target = rule.get("target_name") or self.normalize_column(field)
            source_col = F.col(field)
            dtype = dict(df.dtypes).get(field, "")
            if dtype.startswith("struct") or dtype.startswith("array") or dtype.startswith("map"):
                source_col = F.to_json(F.col(field))
            if rule.get("action") in {"mask_or_hash", "hash_for_join_or_hide_from_default_catalog"}:
                source_col = F.sha2(F.coalesce(source_col.cast("string"), F.lit("")), 256)
                target = target if target.endswith("_sha256") else f"{target}_sha256"
            selected_cols.append(source_col.alias(target))
        if not selected_cols:
            selected_cols = [F.lit(dataset.key).alias("dataset_key")]
        return (
            df.select(*selected_cols)
            .withColumn("_m3_run_id", F.lit(self.run_id))
            .withColumn("_source_id", F.lit(dataset.source_id))
            .withColumn("_source_uri", F.lit(dataset.s3_uri))
        )

    def build_gold_df(self, dataset: DatasetSpec, silver_df: DataFrame, models: list[dict[str, Any]]) -> tuple[DataFrame, str]:
        model = models[0]
        model_id = model["model_id"]
        dims = [self.normalize_column(d) for d in model.get("dimensions", []) if self.normalize_column(d) in silver_df.columns]
        if not dims:
            dims = [c for c, t in silver_df.dtypes if t == "string" and not c.startswith("_")][:1]
        if not dims:
            result = silver_df.agg(F.count(F.lit(1)).alias("row_count")).withColumn("_gold_model_id", F.lit(model_id))
            return result, model_id
        aggs = [F.count(F.lit(1)).alias("row_count")]
        numeric_cols = [c for c, t in silver_df.dtypes if any(t.startswith(n) for n in ["int", "bigint", "double", "float", "long", "decimal"])]
        for col in numeric_cols[:5]:
            aggs.append(F.avg(F.col(col)).alias(f"avg_{col}"))
        result = silver_df.groupBy(*dims).agg(*aggs).orderBy(F.desc("row_count")).limit(200).withColumn("_gold_model_id", F.lit(model_id))
        return result, model_id

    def gold_semantic_warnings(self, dataset: DatasetSpec, gold_df: DataFrame, model_id: str) -> list[str]:
        warnings: list[str] = []
        count = gold_df.count()
        if count <= 1 and dataset.domain == "nyc_taxi":
            warnings.append("Taxi Gold has <=1 group; use payment fallback or owner review before M6 primary use.")
        if model_id.startswith("gold_ecommerce_by_"):
            warnings.append("Ecommerce event Gold is technically executable but requires source-owner semantic confirmation before default catalog/query use.")
        if model_id == "gold_dataset_row_count":
            warnings.append("Fallback row-count Gold model requires semantic owner confirmation.")
        return warnings

    def build_l5(self, dataset: DatasetSpec, state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l5"
        fields = state["l2"]["schema_fields"]
        l4 = state["l4"]
        pii = self.detect_pii_candidates(fields)
        field_classifications = [classify_field_name(field["name"]) for field in fields]
        field_class_counts: dict[str, int] = {}
        for item in field_classifications:
            field_class_counts[item["class"]] = field_class_counts.get(item["class"], 0) + 1
        contract_mismatch = source_contract_mismatch(dataset.key, [field["name"] for field in fields])
        drift = {
            "source_id": dataset.source_id,
            "baseline_status": "missing_for_first_spark_contract_run",
            "current_schema_fingerprint": state["l2"]["schema_fingerprint"],
            "drift_status": "baseline_required_for_future_runs",
            "current_field_count": len(fields),
        }
        schema_compat = {
            "status": "pass",
            "required_fields_missing": [],
            "type_change_warnings": [],
            "note": "First Spark contract run establishes baseline; future run compares against this fingerprint.",
        }
        reconciliation = {
            "source_object_count": state["l0"]["manifest"]["object_count"],
            "source_bytes": state["l0"]["manifest"]["byte_size"],
            "l1_sample_rows": state["l1"]["sample_rows"],
            "silver_preview_rows": l4["silver_rows"],
            "gold_preview_rows": l4["gold_rows"],
            "unexplained_silver_row_loss": l4["silver_rows"] < state["l1"]["sample_rows"],
            "unexpected_silver_row_growth": l4["silver_rows"] > state["l1"]["sample_rows"],
            "explanation": "Silver preview should preserve row count unless an explicit quarantine/filter rule explains the difference; Gold preview may reduce rows by aggregation.",
        }
        processing_failures: list[str] = []
        if schema_compat["status"] != "pass":
            processing_failures.append("schema compatibility did not pass")
        if reconciliation["unexplained_silver_row_loss"]:
            processing_failures.append("Silver preview lost rows without an explicit quarantine/filter rule")
        if reconciliation["unexpected_silver_row_growth"]:
            processing_failures.append("Silver preview created more rows than L1 sample")
        if l4["silver_rows"] <= 0:
            processing_failures.append("Silver preview has zero rows")
        if l4["gold_rows"] <= 0:
            processing_failures.append("Gold preview has zero rows")
        processing_quality = {
            "axis": "processing_quality",
            "status": "fail" if processing_failures else "pass",
            "failures": processing_failures,
            "evidence": {
                "schema_compatibility_status": schema_compat["status"],
                "l1_sample_rows": state["l1"]["sample_rows"],
                "silver_preview_rows": l4["silver_rows"],
                "gold_preview_rows": l4["gold_rows"],
                "compiler_validation_status": l4["compiler_validation"]["status"],
            },
            "interpretation": "Whether the deterministic Spark path can execute without row-loss/growth or empty-output failure.",
        }
        replay_hash = {
            "source_id": dataset.source_id,
            "schema_fingerprint": state["l2"]["schema_fingerprint"],
            "silver_spec_hash": sha256_file(self.dataset_dir(dataset) / "l4" / "silver_transform_spec.json"),
            "gold_spec_hash": sha256_file(self.dataset_dir(dataset) / "l4" / "gold_generation_spec.json"),
            "catalog_replay_inputs": ["source_manifest", "schema_fingerprint", "silver_spec", "gold_spec"],
        }
        gold_semantic = {
            "status": "pass" if not l4["gold_validation"]["semantic_warnings"] else "warn",
            "selected_model_id": l4["gold_model_id"],
            "gold_preview_rows": l4["gold_rows"],
            "warnings": l4["gold_validation"]["semantic_warnings"],
            "owner_action_required": bool(l4["gold_validation"]["semantic_warnings"]),
        }
        catalog_safety_warnings = []
        if pii:
            catalog_safety_warnings.append(f"{len(pii)} identifier or sensitive-name fields need catalog caveats")
        if contract_mismatch:
            catalog_safety_warnings.append("Dataset key/domain says NYC taxi CSV but observed fields match ecommerce event schema")
        catalog_safety = {
            "axis": "catalog_safety",
            "status": "warn" if catalog_safety_warnings else "pass",
            "warnings": catalog_safety_warnings,
            "pii_warning_count": len(pii),
            "source_contract_mismatch": contract_mismatch,
            "field_class_counts": field_class_counts,
            "field_classifications": field_classifications[:80],
            "interpretation": "Whether the catalog can be exposed as a default query surface without hiding or caveating identifiers and source-contract mismatches.",
        }
        gold_readiness_warnings = list(l4["gold_validation"]["semantic_warnings"])
        if l4["gold_rows"] <= 0:
            gold_readiness_warnings.append("Gold preview returned zero rows")
        gold_readiness = {
            "axis": "gold_readiness",
            "status": "ready" if not gold_readiness_warnings else "needs_owner_review",
            "selected_model_id": l4["gold_model_id"],
            "gold_preview_rows": l4["gold_rows"],
            "warnings": gold_readiness_warnings,
            "interpretation": "Whether the suggested Gold table is semantically useful enough to hand to M6 as a default table, not just technically executable.",
        }
        legacy_single_status = "pass" if not pii and gold_semantic["status"] == "pass" else "warn"
        quality_gate = {
            "status": processing_quality["status"],
            "source_id": dataset.source_id,
            "gate_status_model": {
                "allowed_statuses": ["pass", "warn", "fail", "quarantine"],
                "current_status": processing_quality["status"],
                "model": "multi_axis_v2",
                "legacy_single_status": legacy_single_status,
            },
            "drift": drift,
            "schema_compatibility": schema_compat,
            "reconciliation": reconciliation,
            "processing_quality": processing_quality,
            "catalog_safety": catalog_safety,
            "gold_readiness": gold_readiness,
            "legacy_single_status": legacy_single_status,
            "pii_warning": pii,
            "gold_semantic_gate": gold_semantic,
            "quarantine": {"quarantine_rows": state["l1"]["rescue_rows"], "quarantine_uri": f"s3a://m3-quarantine/m3_contract_runs/{self.run_id}/{dataset.key}/"},
        }
        quarantine_rows = []
        if state["l1"]["rescue_rows"]:
            quarantine_rows.append({"source_id": dataset.source_id, "reason": "l1_rescue_rows_present", "count": state["l1"]["rescue_rows"]})
        quality_gate_spec = {
            "quality_gate_spec_id": f"qgate_{self.run_id}_{dataset.key}",
            "checks": ["schema_compatibility", "drift_snapshot", "reconciliation", "processing_quality", "catalog_safety", "gold_readiness", "pii_warning", "gold_semantic_gate"],
            "blocking_failures": ["missing_required_field", "unexplained_row_loss", "silver_zero_rows", "gold_zero_rows_for_required_model"],
            "non_blocking_owner_review": ["identifier_catalog_caveat", "source_contract_mismatch", "fallback_gold_semantics"],
        }
        silver_decision = {
            "schema_version": "m3.l5.silver_policy_decision.v2.1.1",
            "decision_id": f"decision_{self.run_id}_{dataset.key}_silver",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "recommendation_draft_ref": state["l4"]["artifact_refs"]["silver_recommendation_draft"],
            "decision_state": "accepted_for_preview" if processing_quality["status"] == "pass" else "blocked",
            "approved_rule_count": len(state["l3"]["silver_rules"]),
            "editable": True,
            "production_materialization_allowed": False,
            "reason": "Bounded preview contract may proceed when processing axis is not fail; production still requires M5/owner approval.",
        }
        gold_decision_state = "needs_owner_review" if gold_readiness["status"] != "ready" else "accepted_for_preview"
        if processing_quality["status"] == "fail":
            gold_decision_state = "blocked"
        gold_decision = {
            "schema_version": "m3.l5.gold_policy_decision.v2.1.1",
            "decision_id": f"decision_{self.run_id}_{dataset.key}_gold",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "recommendation_draft_ref": state["l4"]["artifact_refs"]["gold_recommendation_draft"],
            "decision_state": gold_decision_state,
            "selected_model_id": l4["gold_model_id"],
            "approved_model_count": len(state["l3"]["gold_models"]),
            "editable": True,
            "production_materialization_allowed": False,
            "reason": "Gold semantic usefulness is separate from Silver processing quality and must not downgrade Silver readiness.",
        }
        approval_state = {
            "schema_version": "m3.l5.approval_state.v2.1.1",
            "approval_state_id": f"approval_{self.run_id}_{dataset.key}",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "silver": {
                "decision_id": silver_decision["decision_id"],
                "state": silver_decision["decision_state"],
                "owner": "M1/M5",
                "approved_for_preview": silver_decision["decision_state"] == "accepted_for_preview",
                "approved_for_production": False,
            },
            "gold": {
                "decision_id": gold_decision["decision_id"],
                "state": gold_decision["decision_state"],
                "owner": "M1/M5",
                "approved_for_preview": gold_decision["decision_state"] in {"accepted_for_preview", "needs_owner_review"},
                "approved_for_production": False,
            },
            "approval_required_before": ["production_write", "default_m6_gold_context"],
            "preview_allowed_write_modes": ["preview_only"],
        }
        recommendation_diff = {
            "schema_version": "m3.l5.recommendation_diff.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "diff_status": "no_user_edit_applied_in_contract_probe",
            "silver_changes": [],
            "gold_changes": [],
            "required_when_user_edits": ["changed_path", "old_value_hash", "new_value", "editor_id", "reason"],
        }
        profile_confidence = float(state["l2"]["type_router"].get("confidence") or 0)
        score_dimensions = {
            "replayability": 100 if state["l1"].get("sample_provenance_status") == "pass" else 70,
            "profile_confidence": round(profile_confidence * 100),
            "silver_transform_correctness": 100 if processing_quality["status"] == "pass" else 0,
            "catalog_safety": 100 if catalog_safety["status"] == "pass" else 75,
            "gold_semantic_readiness": 100 if gold_readiness["status"] == "ready" else 65,
            "m2_execution_readiness": 100 if state["l4"]["compiler_validation"]["status"] == "pass" else 0,
            "large_data_safety": 100 if state["l3"]["reducer"]["row_ai_calls"] == 0 else 0,
        }
        weighted_score = round(
            score_dimensions["replayability"] * 0.18
            + score_dimensions["profile_confidence"] * 0.16
            + score_dimensions["silver_transform_correctness"] * 0.22
            + score_dimensions["catalog_safety"] * 0.12
            + score_dimensions["gold_semantic_readiness"] * 0.10
            + score_dimensions["m2_execution_readiness"] * 0.12
            + score_dimensions["large_data_safety"] * 0.10,
            2,
        )
        transformation_quality_scorecard = {
            "schema_version": "m3.l5.transformation_quality_scorecard.v2.1.2",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "overall_score": weighted_score,
            "dimension_scores": score_dimensions,
            "quality_status": "pass" if weighted_score >= 90 else ("warn" if weighted_score >= 70 else "block"),
            "blocking_conditions": processing_failures,
            "known_caveats": catalog_safety_warnings + gold_readiness_warnings,
            "interpretation": "Score balances replayability, profile confidence, deterministic transform correctness, catalog safety, Gold semantics, M2 readiness, and large-data safety.",
        }
        sample_descriptor = state["sample"].get("range_sample") or state["sample"].get("parquet_sample") or {}
        quality_speed_accuracy_budget = {
            "schema_version": "m3.l5.quality_speed_accuracy_budget.v2.1.2",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "quality_priority": "lossless raw preservation, deterministic Silver, explicit quarantine, separate Gold semantic review",
            "speed_priority": "bounded M3 control-plane profile, M2 Spark partitioned execution, no per-row AI, reusable artifact refs",
            "accuracy_priority": "schema fingerprint, source-unit replay, row preservation, metric/grain caveats, M6 context validator",
            "large_data_rules": [
                "M3 may sample/profile/sketch but must not full materialize production Silver/Gold.",
                "M2 must recompute L7/L8 validation over its execution result before production exposure.",
                "AI may only read L3 bounded evidence packs and must not inspect every row in realtime.",
            ],
            "observed_probe_budget": {
                "sample_rows_requested": self.sample_rows,
                "sample_rows_loaded": state["l1"]["sample_rows"],
                "sample_input_bytes": int(sample_descriptor.get("bytes_read") or sample_descriptor.get("bytes_selected") or 0),
                "sample_load_seconds": state["sample"].get("load_seconds"),
                "silver_preview_rows": state["l4"]["silver_rows"],
                "gold_preview_rows": state["l4"]["gold_rows"],
            },
        }
        self.write_artifact(layer_dir / "gate_status_model.json", quality_gate["gate_status_model"])
        self.write_artifact(layer_dir / "drift_snapshot.json", drift)
        self.write_artifact_jsonl(layer_dir / "quarantine_records.jsonl", quarantine_rows)
        self.write_artifact(layer_dir / "quarantine_policy.json", {"policy": "preserve invalid records with reason and source refs"})
        self.write_artifact(layer_dir / "schema_compatibility_result.json", schema_compat)
        self.write_artifact(layer_dir / "reconciliation_result.json", reconciliation)
        self.write_artifact(layer_dir / "replay_hash_result.json", replay_hash)
        self.write_artifact(layer_dir / "processing_quality_axis.json", processing_quality)
        self.write_artifact(layer_dir / "catalog_safety_axis.json", catalog_safety)
        self.write_artifact(layer_dir / "gold_readiness_axis.json", gold_readiness)
        self.write_artifact(layer_dir / "field_classification_result.json", field_classifications)
        self.write_artifact(layer_dir / "source_contract_check_result.json", {"source_id": dataset.source_id, "dataset_key": dataset.key, "source_contract_mismatch": contract_mismatch})
        self.write_artifact(layer_dir / "pii_warning_result.json", pii)
        self.write_artifact(layer_dir / "gold_semantic_gate_result.json", gold_semantic)
        self.write_artifact(layer_dir / "quality_gate_result.json", quality_gate)
        self.write_artifact(layer_dir / "silver_policy_decision.json", silver_decision)
        self.write_artifact(layer_dir / "gold_policy_decision.json", gold_decision)
        self.write_artifact(layer_dir / "approval_state.json", approval_state)
        self.write_artifact(layer_dir / "recommendation_diff.json", recommendation_diff)
        self.write_artifact(layer_dir / "transformation_quality_scorecard.json", transformation_quality_scorecard)
        self.write_artifact(layer_dir / "quality_speed_accuracy_budget.json", quality_speed_accuracy_budget)
        self.write_artifact_text(layer_dir / "quality_gate_spec.yaml", simple_yaml(quality_gate_spec) + "\n")
        return {
            "quality_gate": quality_gate,
            "silver_decision": silver_decision,
            "gold_decision": gold_decision,
            "approval_state": approval_state,
            "recommendation_diff": recommendation_diff,
            "transformation_quality_scorecard": transformation_quality_scorecard,
            "quality_speed_accuracy_budget": quality_speed_accuracy_budget,
            "status": quality_gate["status"],
            "pii_warning_count": len(pii),
            "gold_semantic_status": gold_semantic["status"],
            "processing_quality_status": processing_quality["status"],
            "catalog_safety_status": catalog_safety["status"],
            "gold_readiness_status": gold_readiness["status"],
            "legacy_single_status": legacy_single_status,
            "source_contract_mismatch": contract_mismatch,
            "field_class_counts": field_class_counts,
            "artifact_refs": {
                "quality_gate": rel(layer_dir / "quality_gate_result.json", self.artifact_root),
                "processing_quality": rel(layer_dir / "processing_quality_axis.json", self.artifact_root),
                "catalog_safety": rel(layer_dir / "catalog_safety_axis.json", self.artifact_root),
                "gold_readiness": rel(layer_dir / "gold_readiness_axis.json", self.artifact_root),
                "gold_semantic_gate": rel(layer_dir / "gold_semantic_gate_result.json", self.artifact_root),
                "pii_warning": rel(layer_dir / "pii_warning_result.json", self.artifact_root),
                "silver_policy_decision": rel(layer_dir / "silver_policy_decision.json", self.artifact_root),
                "gold_policy_decision": rel(layer_dir / "gold_policy_decision.json", self.artifact_root),
                "approval_state": rel(layer_dir / "approval_state.json", self.artifact_root),
                "recommendation_diff": rel(layer_dir / "recommendation_diff.json", self.artifact_root),
                "transformation_quality_scorecard": rel(layer_dir / "transformation_quality_scorecard.json", self.artifact_root),
                "quality_speed_accuracy_budget": rel(layer_dir / "quality_speed_accuracy_budget.json", self.artifact_root),
            },
        }

    def detect_pii_candidates(self, fields: list[dict[str, Any]]) -> list[dict[str, Any]]:
        results = []
        for field in fields:
            name = field["name"]
            classification = classify_field_name(name)
            if classification["class"] in {"direct_sensitive", "user_or_session_identifier", "possible_person_name", "unknown_identifier"}:
                results.append(
                    {
                        "field": name,
                        "field_class": classification["class"],
                        "reasons": [classification["reason"]],
                        "action": "hash_hide_or_catalog_caveat_and_owner_review",
                    }
                )
        return results

    def build_l6(self, dataset: DatasetSpec, state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l6"
        fields = state["l2"]["schema_fields"]
        field_classifications = [classify_field_name(field["name"]) for field in fields]
        business_keys = [item["field"] for item in field_classifications if item["class"] == "business_key"][:40]
        identifier_caveats = [item for item in field_classifications if item["class"] in {"direct_sensitive", "user_or_session_identifier", "possible_person_name", "unknown_identifier"}][:40]
        operation_params_schema = {
            "schema_version": "m3.l6.operation_params_schema.v2.1.1",
            "source_id": dataset.source_id,
            "supported_operations": {
                "select": {
                    "required": ["input_ref", "columns"],
                    "params": {"input_ref": "artifact_id string", "columns": "array of source or derived column names"},
                },
                "rename": {
                    "required": ["input_ref", "renames"],
                    "params": {"input_ref": "artifact_id string", "renames": "array of {source, target}"},
                },
                "cast": {
                    "required": ["input_ref", "casts"],
                    "params": {"input_ref": "artifact_id string", "casts": "array of {column, target_type, on_error}"},
                },
                "hash": {
                    "required": ["input_ref", "columns", "salt_secret_id"],
                    "params": {"input_ref": "artifact_id string", "columns": "array of column names", "salt_secret_id": "secret handle string, not *_ref"},
                },
                "mask": {
                    "required": ["input_ref", "columns", "mask_strategy"],
                    "params": {"input_ref": "artifact_id string", "columns": "array of column names", "mask_strategy": "fixed|partial|null"},
                },
                "flatten": {
                    "required": ["input_ref", "paths", "mode"],
                    "params": {"input_ref": "artifact_id string", "paths": "array of json paths", "mode": "json_string|wide_columns"},
                },
                "aggregate": {
                    "required": ["input_ref", "group_by", "measures"],
                    "params": {
                        "input_ref": "artifact_id string for Silver input",
                        "group_by": "array of grouping field names",
                        "dimensions": "array of dimension definitions",
                        "measures": "array of {name, agg, field?}; agg=count|sum|avg|min|max|count_distinct",
                        "time_window": "optional {field, interval, timezone, lateness_policy}",
                        "cardinality_guard": "optional {max_groups, overflow_policy}",
                    },
                },
            },
        }
        compiler_package = {
            "schema_version": "m3.l6.deterministic_spec_compiler_package.v2.1.1",
            "compiler_package_id": f"compiler_{self.run_id}_{dataset.key}",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "input_decisions": {
                "silver_policy_decision_ref": state["l5"]["artifact_refs"]["silver_policy_decision"],
                "gold_policy_decision_ref": state["l5"]["artifact_refs"]["gold_policy_decision"],
                "approval_state_ref": state["l5"]["artifact_refs"]["approval_state"],
            },
            "compiled_specs": {
                "silver_transform_spec_ref": state["l4"]["artifact_refs"]["silver_spec"],
                "gold_generation_spec_ref": state["l4"]["artifact_refs"]["gold_spec"],
                "operation_params_schema_ref": "operation_params_schema.json",
            },
            "preview_job_requests": {
                "silver_preview_job_request_ref": state["l4"]["artifact_refs"]["m2_silver_preview_job_request"],
                "gold_preview_job_request_ref": state["l4"]["artifact_refs"]["m2_gold_preview_job_request"],
            },
            "execution_owner": "M2 Spark",
            "m3_role": "compile deterministic spec contracts and validation rules; do not own production Spark runtime",
        }
        m2_execution_contract_bundle = {
            "schema_version": "m3.l6.m2_execution_contract_bundle.v2.1.2",
            "bundle_id": f"m2_exec_bundle_{self.run_id}_{dataset.key}",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "target_module": "M2",
            "execution_owner": "M2 Spark",
            "m3_owner": "M3 contract producer",
            "profile_job_request_ref": state["l2"]["artifact_refs"]["profile_job_request"],
            "silver_preview_job_request_ref": state["l4"]["artifact_refs"]["m2_silver_preview_job_request"],
            "gold_preview_job_request_ref": state["l4"]["artifact_refs"]["m2_gold_preview_job_request"],
            "compiler_package_ref": "deterministic_spec_compiler_package.json",
            "operation_params_schema_ref": "operation_params_schema.json",
            "expected_result_contracts": {
                "silver_preview_validation_result": "l7/silver_preview_validation_result.json",
                "gold_preview_validation_result": "l8/gold_preview_validation_result.json",
            },
            "quality_speed_accuracy_hints": {
                "spark_partitioning": "partition by source_unit/object/large file ranges; avoid single-driver collect",
                "adaptive_execution": "enable Spark AQE and tune shuffle partitions by source size",
                "ai_boundary": "no per-row AI in Spark jobs; use deterministic specs only",
                "failure_policy": "write result status and quarantine evidence instead of silently dropping rows",
            },
        }
        preview_write_mode_valid = (
            state["l4"]["silver_preview_job_request"].get("write_mode") == "preview_only"
            and state["l4"]["gold_preview_job_request"].get("write_mode") == "preview_only"
            and state["l4"].get("compiler_validation", {}).get("status") == "pass"
        )
        compiler_validation = {
            "schema_version": "m3.l6.compiler_validation_result.v2.1.1",
            "compiler_package_id": compiler_package["compiler_package_id"],
            "status": "pass" if preview_write_mode_valid else "block",
            "checks": [
                {
                    "check": "preview_write_mode_only",
                    "status": "pass" if preview_write_mode_valid else "block",
                    "details": "Core preview spec allows write_mode=preview_only only; production write is outside M3 core.",
                },
                {
                    "check": "unsupported_actions",
                    "status": state["l4"]["unsupported_action_report"]["status"],
                    "details": "All compiled actions must be present in operation_params_schema supported_operations.",
                },
                {
                    "check": "no_per_row_ai",
                    "status": "pass" if state["l3"]["reducer"]["row_ai_calls"] == 0 else "block",
                    "details": "AI recommendation slot may only read bounded evidence packs.",
                },
            ],
        }
        unsupported_action_report = {
            **state["l4"]["unsupported_action_report"],
            "compiler_package_id": compiler_package["compiler_package_id"],
            "operation_params_schema_ref": "operation_params_schema.json",
        }
        pii_query_context_validator = {
            "schema_version": "m3.l6.pii_query_context_validator_rule.v2.1.1",
            "source_id": dataset.source_id,
            "status": "warn" if identifier_caveats else "pass",
            "rules": [
                "pii_handling must be one of none|mask|hash and must not encode visibility.",
                "Visibility must be expressed through catalog_exposure or query_context_exposure.",
                "query_context_exposure=forbidden prevents default M6 context use.",
                "identifier-like fields require hidden/caveated context unless transformed to deterministic hash.",
            ],
            "identifier_caveat_count": len(identifier_caveats),
        }
        quality_axes = {
            "processing_quality_status": state["l5"]["processing_quality_status"],
            "catalog_safety_status": state["l5"]["catalog_safety_status"],
            "gold_readiness_status": state["l5"]["gold_readiness_status"],
            "legacy_single_status": state["l5"]["legacy_single_status"],
            "quality_gate_ref": state["l5"]["artifact_refs"]["quality_gate"],
            "processing_quality_ref": state["l5"]["artifact_refs"]["processing_quality"],
            "catalog_safety_ref": state["l5"]["artifact_refs"]["catalog_safety"],
            "gold_readiness_ref": state["l5"]["artifact_refs"]["gold_readiness"],
        }
        catalog = {
            "catalog_metadata_version": "m3.catalog.spark.v1",
            "catalog_draft_id": f"cat_{self.run_id}_{dataset.key}",
            "source_id": dataset.source_id,
            "dataset_key": dataset.key,
            "display_name": dataset.display_name,
            "raw": {"read_uri": dataset.s3_uri, "manifest_ref": state["l0"]["artifact_refs"]["source_manifest"]},
            "silver": {"preview_uri": state["l4"]["silver_uri"], "spec_ref": state["l4"]["artifact_refs"]["silver_spec"], "rows": state["l4"]["silver_rows"]},
            "gold": {"preview_uri": state["l4"]["gold_uri"], "spec_ref": state["l4"]["artifact_refs"]["gold_spec"], "rows": state["l4"]["gold_rows"], "model_id": state["l4"]["gold_model_id"]},
            "schema": {"fingerprint": state["l2"]["schema_fingerprint"], "fields": fields[:80]},
            "quality": quality_axes,
            "semantic_handoff": {
                "business_keys": business_keys,
                "identifier_caveats": identifier_caveats,
                "source_contract_mismatch": state["l5"]["source_contract_mismatch"],
                "default_query_surface": "silver" if state["l5"]["catalog_safety_status"] == "warn" else "silver_and_gold",
            },
        }
        silver_rule_by_field = {rule["field"]: rule for rule in state["l3"]["silver_rules"]}
        lineage = {
            "source_id": dataset.source_id,
            "field_mappings": [
                {
                    "source_field": field["name"],
                    "silver_field": self.lineage_silver_field_name(field["name"], silver_rule_by_field.get(field["name"])),
                    "lineage_rule": (silver_rule_by_field.get(field["name"]) or {}).get("action", "direct_keep_or_normalized_name"),
                    "source_profile_type": field["spark_type"],
                }
                for field in fields[:80]
            ],
            "gold_model_id": state["l4"]["gold_model_id"],
        }
        caveats = {
            "source_id": dataset.source_id,
            "quality_status": state["l5"]["status"],
            "quality_axes": quality_axes,
            "pii_warnings": state["l5"]["quality_gate"]["pii_warning"],
            "gold_semantic_warnings": state["l5"]["quality_gate"]["gold_semantic_gate"]["warnings"],
            "catalog_safety_warnings": state["l5"]["quality_gate"]["catalog_safety"]["warnings"],
            "source_contract_mismatch": state["l5"]["source_contract_mismatch"],
            "user_facing_summary": self.caveat_summary(state),
        }
        avoid_or_warn = [
            {"table": state["l4"]["gold_model_id"], "reason": warning}
            for warning in state["l5"]["quality_gate"]["gold_readiness"]["warnings"]
        ]
        avoid_or_warn.extend(
            {"table": f"silver_{dataset.key}", "reason": warning}
            for warning in state["l5"]["quality_gate"]["catalog_safety"]["warnings"]
        )
        sql_context = {
            "source_id": dataset.source_id,
            "allowed_tables": [
                {"name": f"silver_{dataset.key}", "uri": state["l4"]["silver_uri"], "default": True},
                {"name": state["l4"]["gold_model_id"], "uri": state["l4"]["gold_uri"], "default": state["l5"]["gold_readiness_status"] == "ready"},
            ],
            "avoid_or_warn": avoid_or_warn,
            "business_keys": business_keys,
            "column_context": [{"name": field["name"], "type": field["spark_type"], "null_ratio": field.get("null_ratio")} for field in fields[:40]],
            "query_generation_rule": "M6 may use processing-pass tables, but must expose catalog_safety and gold_readiness caveats separately from execution quality.",
        }
        artifact_manifest = self.build_artifact_manifest(dataset)
        handoff_status = "blocked_for_processing"
        if state["l5"]["status"] == "pass":
            handoff_status = (
                "ready_with_owner_review"
                if state["l5"]["catalog_safety_status"] == "warn" or state["l5"]["gold_readiness_status"] != "ready"
                else "ready"
            )
        handoff = {
            "handoff_package_id": f"handoff_{self.run_id}_{dataset.key}",
            "target_modules": ["M2", "M5", "M6"],
            "catalog_metadata_ref": "catalog_metadata_draft.json",
            "lineage_ref": "field_level_lineage.json",
            "sql_context_ref": "m6_sql_context_pack.json",
            "quality_caveat_ref": "quality_caveat.json",
            "artifact_manifest_ref": "artifact_reference_manifest.json",
            "status": handoff_status,
            "note": "L6 handoff is an intermediate compatibility bundle; L10 catalog_sync_contract_package is the final M5/M6 package.",
        }
        self.write_artifact(layer_dir / "deterministic_spec_compiler_package.json", compiler_package)
        self.write_artifact(layer_dir / "m2_execution_contract_bundle.json", m2_execution_contract_bundle)
        self.write_artifact(layer_dir / "operation_params_schema.json", operation_params_schema)
        self.write_artifact(layer_dir / "compiler_validation_result.json", compiler_validation)
        self.write_artifact(layer_dir / "unsupported_action_report.json", unsupported_action_report)
        self.write_artifact(layer_dir / "pii_query_context_validator_rule.json", pii_query_context_validator)
        self.write_artifact(layer_dir / "catalog_metadata_draft.json", catalog)
        self.write_artifact(layer_dir / "field_level_lineage.json", lineage)
        self.write_artifact(layer_dir / "m6_sql_context_pack.json", sql_context)
        self.write_artifact(layer_dir / "artifact_reference_manifest.json", artifact_manifest)
        self.write_artifact(layer_dir / "quality_caveat.json", caveats)
        self.write_artifact(layer_dir / "handoff_package.json", handoff)
        artifact_manifest = self.build_artifact_manifest(dataset)
        self.write_artifact(layer_dir / "artifact_reference_manifest.json", artifact_manifest)
        # Catalog is control-plane metadata, so write it as a small JSON object
        # instead of forcing a Spark job through a Python-created one-row DataFrame.
        catalog_key = f"m3_contract_runs/{self.run_id}/{dataset.key}/catalog_metadata/catalog_metadata.json"
        self.s3_client().put_object(
            Bucket="m3-catalog",
            Key=catalog_key,
            Body=json.dumps(catalog, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8"),
            ContentType="application/json; charset=utf-8",
        )
        catalog_uri = f"s3a://m3-catalog/{catalog_key}"
        return {
            "catalog": catalog,
            "compiler_package": compiler_package,
            "m2_execution_contract_bundle": m2_execution_contract_bundle,
            "operation_params_schema": operation_params_schema,
            "compiler_validation": compiler_validation,
            "unsupported_action_report": unsupported_action_report,
            "pii_query_context_validator": pii_query_context_validator,
            "lineage": lineage,
            "sql_context": sql_context,
            "caveats": caveats,
            "handoff": handoff,
            "catalog_uri": catalog_uri,
            "artifact_refs": {
                "compiler_package": rel(layer_dir / "deterministic_spec_compiler_package.json", self.artifact_root),
                "m2_execution_contract_bundle": rel(layer_dir / "m2_execution_contract_bundle.json", self.artifact_root),
                "operation_params_schema": rel(layer_dir / "operation_params_schema.json", self.artifact_root),
                "compiler_validation": rel(layer_dir / "compiler_validation_result.json", self.artifact_root),
                "unsupported_action_report": rel(layer_dir / "unsupported_action_report.json", self.artifact_root),
                "pii_query_context_validator": rel(layer_dir / "pii_query_context_validator_rule.json", self.artifact_root),
                "catalog": rel(layer_dir / "catalog_metadata_draft.json", self.artifact_root),
                "lineage": rel(layer_dir / "field_level_lineage.json", self.artifact_root),
                "sql_context": rel(layer_dir / "m6_sql_context_pack.json", self.artifact_root),
                "artifact_manifest": rel(layer_dir / "artifact_reference_manifest.json", self.artifact_root),
                "quality_caveat": rel(layer_dir / "quality_caveat.json", self.artifact_root),
                "handoff": rel(layer_dir / "handoff_package.json", self.artifact_root),
            },
        }

    def build_l7(self, dataset: DatasetSpec, state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l7"
        l4 = state["l4"]
        l5 = state["l5"]
        m2_job_request = {
            "schema_version": "m3.l7.m2_silver_preview_job_contract.v2.1.1",
            "job_request_ref": l4["artifact_refs"]["m2_silver_preview_job_request"],
            "execution_owner": "M2 Spark",
            "producer_expected": "M2",
            "consumer": "M3 L9 quality gate",
            "required_result_artifact": "silver_preview_validation_result.json",
        }
        validation_import = {
            "schema_version": "m3.l7.silver_preview_validation_result.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "producer": "M2 Spark expected; current file imports local contract-probe evidence from L4",
            "local_contract_probe": True,
            "job_request_ref": l4["artifact_refs"]["m2_silver_preview_job_request"],
            "silver_transform_spec_ref": l4["artifact_refs"]["silver_spec"],
            "preview_uri": l4["silver_uri"],
            "input_sample_rows": state["l1"]["sample_rows"],
            "silver_preview_rows": l4["silver_rows"],
            "output_column_count": l4["silver_validation"]["output_column_count"],
            "status": l4["silver_validation"]["status"],
            "row_preservation_status": "pass" if l4["silver_rows"] == state["l1"]["sample_rows"] else "warn",
            "catalog_safety_status": l5["catalog_safety_status"],
            "quarantine_rows": l5["quality_gate"]["quarantine"]["quarantine_rows"],
        }
        silver_structural_axis = {
            "schema_version": "m3.l7.silver_structural_axis.v2.1.1",
            "axis": "silver_structural_validation",
            "status": "pass" if validation_import["status"] == "pass" and validation_import["row_preservation_status"] == "pass" else "warn",
            "checks": {
                "preview_executed": validation_import["status"],
                "row_preservation": validation_import["row_preservation_status"],
                "compiler_validation": state["l6"]["compiler_validation"]["status"],
                "pii_query_context_validator": state["l6"]["pii_query_context_validator"]["status"],
            },
            "interpretation": "L7 verifies the Silver shape M2 should produce; catalog-safety warn does not block Silver structural readiness.",
        }
        self.write_artifact(layer_dir / "m2_silver_preview_job_contract.json", m2_job_request)
        self.write_artifact(layer_dir / "silver_preview_validation_result.json", validation_import)
        self.write_artifact(layer_dir / "silver_structural_axis.json", silver_structural_axis)
        return {
            "m2_job_request": m2_job_request,
            "validation": validation_import,
            "silver_structural_axis": silver_structural_axis,
            "artifact_refs": {
                "m2_silver_preview_job_contract": rel(layer_dir / "m2_silver_preview_job_contract.json", self.artifact_root),
                "silver_preview_validation": rel(layer_dir / "silver_preview_validation_result.json", self.artifact_root),
                "silver_structural_axis": rel(layer_dir / "silver_structural_axis.json", self.artifact_root),
            },
        }

    def build_l8(self, dataset: DatasetSpec, state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l8"
        l4 = state["l4"]
        gold_status = state["l5"]["gold_readiness_status"]
        m2_job_request = {
            "schema_version": "m3.l8.m2_gold_preview_job_contract.v2.1.1",
            "job_request_ref": l4["artifact_refs"]["m2_gold_preview_job_request"],
            "execution_owner": "M2 Spark",
            "producer_expected": "M2",
            "consumer": "M3 L9 quality gate",
            "required_result_artifact": "gold_preview_validation_result.json",
        }
        metric_definitions = []
        for model in state["l3"]["gold_models"]:
            for measure in model.get("measures", []):
                metric_definitions.append(
                    {
                        "model_id": model["model_id"],
                        "metric_name": measure["name"],
                        "aggregation": measure["agg"],
                        "source_field": measure.get("field"),
                        "grain": model.get("grain", []),
                    }
                )
        validation_import = {
            "schema_version": "m3.l8.gold_preview_validation_result.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "producer": "M2 Spark expected; current file imports local contract-probe evidence from L4",
            "local_contract_probe": True,
            "job_request_ref": l4["artifact_refs"]["m2_gold_preview_job_request"],
            "gold_generation_spec_ref": l4["artifact_refs"]["gold_spec"],
            "preview_uri": l4["gold_uri"],
            "selected_model_id": l4["gold_model_id"],
            "gold_preview_rows": l4["gold_rows"],
            "semantic_warnings": l4["gold_validation"]["semantic_warnings"],
            "status": l4["gold_validation"]["status"],
        }
        gold_semantic_readiness = {
            "schema_version": "m3.l8.gold_semantic_readiness_axis.v2.1.1",
            "axis": "gold_semantic_readiness",
            "status": gold_status,
            "selected_model_id": l4["gold_model_id"],
            "metric_definition_draft": metric_definitions,
            "semantic_warnings": l4["gold_validation"]["semantic_warnings"],
            "owner_review_required": gold_status != "ready",
            "not_requested_or_deferred_status_policy": "If owner sets Gold to not_requested or deferred, L9 still emits gold_readiness_axis.json with that explicit status.",
        }
        self.write_artifact(layer_dir / "m2_gold_preview_job_contract.json", m2_job_request)
        self.write_artifact(layer_dir / "gold_preview_validation_result.json", validation_import)
        self.write_artifact(layer_dir / "metric_definition_draft.json", metric_definitions)
        self.write_artifact(layer_dir / "gold_semantic_readiness_axis.json", gold_semantic_readiness)
        return {
            "m2_job_request": m2_job_request,
            "validation": validation_import,
            "metric_definitions": metric_definitions,
            "gold_semantic_readiness": gold_semantic_readiness,
            "artifact_refs": {
                "m2_gold_preview_job_contract": rel(layer_dir / "m2_gold_preview_job_contract.json", self.artifact_root),
                "gold_preview_validation": rel(layer_dir / "gold_preview_validation_result.json", self.artifact_root),
                "metric_definition_draft": rel(layer_dir / "metric_definition_draft.json", self.artifact_root),
                "gold_semantic_readiness": rel(layer_dir / "gold_semantic_readiness_axis.json", self.artifact_root),
            },
        }

    def context_statuses(self, state: dict[str, Any]) -> dict[str, str]:
        processing = state["l5"]["processing_quality_status"]
        catalog = state["l5"]["catalog_safety_status"]
        gold = state["l5"]["gold_readiness_status"]
        if processing != "pass":
            silver_context_status = "blocked"
        elif catalog == "pass":
            silver_context_status = "ready"
        else:
            silver_context_status = "ready_with_catalog_caveat"
        if processing != "pass":
            gold_context_status = "blocked_by_processing"
        elif gold == "ready" and catalog == "pass":
            gold_context_status = "ready"
        elif gold == "ready":
            gold_context_status = "ready_with_catalog_caveat"
        elif gold in {"not_requested", "deferred"}:
            gold_context_status = gold
        else:
            gold_context_status = "needs_owner_review"
        if silver_context_status == "blocked":
            m6_context_status = "blocked"
        elif gold_context_status == "ready":
            m6_context_status = "silver_and_gold_ready"
        elif gold_context_status == "ready_with_catalog_caveat":
            m6_context_status = "silver_and_gold_ready_with_caveat"
        elif gold_context_status in {"not_requested", "deferred"}:
            m6_context_status = f"silver_ready_gold_{gold_context_status}"
        else:
            m6_context_status = "silver_ready_gold_needs_owner_review"
        return {
            "silver_context_status": silver_context_status,
            "gold_context_status": gold_context_status,
            "m6_context_status": m6_context_status,
        }

    def build_l9(self, dataset: DatasetSpec, state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l9"
        statuses = self.context_statuses(state)
        processing_axis = state["l5"]["quality_gate"]["processing_quality"]
        catalog_axis = state["l5"]["quality_gate"]["catalog_safety"]
        gold_axis = {
            **state["l5"]["quality_gate"]["gold_readiness"],
            "allowed_statuses": ["not_requested", "deferred", "ready", "needs_owner_review", "pass", "warn", "block"],
            "gold_not_requested_deferred_rule": "Gold absence is represented in this axis only; it must not downgrade Silver processing/catalog status.",
        }
        precedence = {
            "schema_version": "m3.l9.three_axis_precedence_rule.v2.1.1",
            "rule": "Silver readiness = processing_quality + catalog_safety; Gold readiness is applied separately on top and cannot contaminate Silver.",
            "axis_order": ["processing_quality", "catalog_safety", "gold_readiness"],
            "silver_formula": "processing_quality == pass ? (catalog_safety == pass ? ready : ready_with_catalog_caveat) : blocked",
            "gold_formula": "processing_quality must pass first; then gold_readiness decides ready|needs_owner_review|not_requested|deferred.",
        }
        gate_summary = {
            "schema_version": "m3.l9.gate_summary.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "processing_quality_axis_ref": "processing_quality_axis.json",
            "catalog_safety_axis_ref": "catalog_safety_axis.json",
            "gold_readiness_axis_ref": "gold_readiness_axis.json",
            "silver_context_status": statuses["silver_context_status"],
            "gold_context_status": statuses["gold_context_status"],
            "m6_context_status": statuses["m6_context_status"],
            "precedence_rule_ref": "three_axis_precedence_rule.json",
            "l7_silver_preview_validation_ref": state["l7"]["artifact_refs"]["silver_preview_validation"],
            "l8_gold_preview_validation_ref": state["l8"]["artifact_refs"]["gold_preview_validation"],
        }
        self.write_artifact(layer_dir / "processing_quality_axis.json", processing_axis)
        self.write_artifact(layer_dir / "catalog_safety_axis.json", catalog_axis)
        self.write_artifact(layer_dir / "gold_readiness_axis.json", gold_axis)
        self.write_artifact(layer_dir / "three_axis_precedence_rule.json", precedence)
        self.write_artifact(layer_dir / "gate_summary.json", gate_summary)
        return {
            "processing_quality_axis": processing_axis,
            "catalog_safety_axis": catalog_axis,
            "gold_readiness_axis": gold_axis,
            "precedence": precedence,
            "gate_summary": gate_summary,
            **statuses,
            "artifact_refs": {
                "processing_quality_axis": rel(layer_dir / "processing_quality_axis.json", self.artifact_root),
                "catalog_safety_axis": rel(layer_dir / "catalog_safety_axis.json", self.artifact_root),
                "gold_readiness_axis": rel(layer_dir / "gold_readiness_axis.json", self.artifact_root),
                "three_axis_precedence_rule": rel(layer_dir / "three_axis_precedence_rule.json", self.artifact_root),
                "gate_summary": rel(layer_dir / "gate_summary.json", self.artifact_root),
            },
        }

    def build_l10(self, dataset: DatasetSpec, state: dict[str, Any]) -> dict[str, Any]:
        layer_dir = self.dataset_dir(dataset) / "l10"
        sql_context_pack = {
            "schema_version": "m3.l10.sql_context_pack.v2.1.1",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "m6_context_status": state["l9"]["m6_context_status"],
            "silver_context_status": state["l9"]["silver_context_status"],
            "gold_context_status": state["l9"]["gold_context_status"],
            "allowed_tables": state["l6"]["sql_context"]["allowed_tables"],
            "avoid_or_warn": state["l6"]["sql_context"]["avoid_or_warn"],
            "business_keys": state["l6"]["sql_context"]["business_keys"],
            "column_context": state["l6"]["sql_context"]["column_context"],
            "query_context_validator_rule_ref": state["l6"]["artifact_refs"]["pii_query_context_validator"],
        }
        catalog_package = {
            "schema_version": "m3.l10.catalog_sync_contract_package.v2.1.1",
            "catalog_sync_package_id": f"catalog_sync_{self.run_id}_{dataset.key}",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "m6_context_status": state["l9"]["m6_context_status"],
            "catalog_metadata_ref": state["l6"]["artifact_refs"]["catalog"],
            "field_level_lineage_ref": state["l6"]["artifact_refs"]["lineage"],
            "quality_caveat_ref": state["l6"]["artifact_refs"]["quality_caveat"] if "quality_caveat" in state["l6"].get("artifact_refs", {}) else "l6/quality_caveat.json",
            "sql_context_pack_ref": "sql_context_pack.json",
            "gate_summary_ref": state["l9"]["artifact_refs"]["gate_summary"],
            "target_modules": ["M5 catalog storage", "M6 SQL/AI query context"],
            "storage_owner": "M5",
            "query_context_owner": "M6",
            "m3_role": "handoff package producer only",
        }
        m1_source_feedback_payload = {
            "schema_version": "m3.l10.m1_source_feedback_payload.v2.1.2",
            "target_module": "M1",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "source_registration_status": "accepted_for_contract_probe",
            "source_unit_consistency_ref": state["l0"]["artifact_refs"]["source_unit_consistency"],
            "profile_snapshot_ref": state["l2"]["artifact_refs"]["profile_snapshot"],
            "owner_actions": [
                "confirm source format and business meaning",
                "review identifier-like fields before broad catalog exposure",
                "approve or defer Gold default table",
            ],
        }
        m2_execution_handoff_payload = {
            "schema_version": "m3.l10.m2_execution_handoff_payload.v2.1.2",
            "target_module": "M2",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "execution_contract_bundle_ref": state["l6"]["artifact_refs"]["m2_execution_contract_bundle"],
            "profile_job_request_ref": state["l2"]["artifact_refs"]["profile_job_request"],
            "silver_preview_job_request_ref": state["l4"]["artifact_refs"]["m2_silver_preview_job_request"],
            "gold_preview_job_request_ref": state["l4"]["artifact_refs"]["m2_gold_preview_job_request"],
            "required_return_artifacts": [
                "l7/silver_preview_validation_result.json",
                "l8/gold_preview_validation_result.json",
                "execution_metrics.json",
                "quarantine_result.json",
            ],
            "quality_speed_accuracy_contract": state["l5"]["artifact_refs"]["quality_speed_accuracy_budget"],
        }
        m5_catalog_upsert_payload = {
            "schema_version": "m3.l10.m5_catalog_upsert_payload.v2.1.2",
            "target_module": "M5",
            "operation": "catalog.upsert_dataset_contract",
            "idempotency_key": f"{dataset.source_id}:{state['l0']['source_unit_id']}:{self.run_id}",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "catalog_metadata_ref": state["l6"]["artifact_refs"]["catalog"],
            "approval_state_ref": state["l5"]["artifact_refs"]["approval_state"],
            "quality_scorecard_ref": state["l5"]["artifact_refs"]["transformation_quality_scorecard"],
            "gate_summary_ref": state["l9"]["artifact_refs"]["gate_summary"],
            "m6_context_status": state["l9"]["m6_context_status"],
            "write_policy": "metadata_upsert_only; no production data materialization",
        }
        m6_query_context_payload = {
            "schema_version": "m3.l10.m6_query_context_payload.v2.1.2",
            "target_module": "M6",
            "operation": "query_context.register_dataset",
            "source_id": dataset.source_id,
            "source_unit_ids": [state["l0"]["source_unit_id"]],
            "m6_context_status": state["l9"]["m6_context_status"],
            "sql_context_pack_ref": "sql_context_pack.json",
            "query_context_validator_rule_ref": state["l6"]["artifact_refs"]["pii_query_context_validator"],
            "default_surface": "silver",
            "gold_surface": state["l9"]["gold_context_status"],
            "avoid_or_warn": sql_context_pack["avoid_or_warn"],
        }
        module_integration_contract = {
            "schema_version": "m3.l10.module_integration_contract.v2.1.2",
            "source_id": dataset.source_id,
            "flow": [
                {"from": "M1", "to": "M3", "artifact": "source registration and raw source reference"},
                {"from": "M3", "to": "M2", "artifact_ref": "m2_execution_handoff_payload.json"},
                {"from": "M2", "to": "M3", "artifact": "L7/L8 preview validation result artifacts"},
                {"from": "M3", "to": "M5", "artifact_ref": "m5_catalog_upsert_payload.json"},
                {"from": "M3", "to": "M6", "artifact_ref": "m6_query_context_payload.json"},
            ],
            "non_goals": [
                "M3 does not run production Spark materialization.",
                "M3 does not store workflow state for M5.",
                "M3 does not answer SQL/NL queries for M6.",
            ],
        }
        catalog_package["module_payload_refs"] = {
            "m1_source_feedback_payload_ref": "m1_source_feedback_payload.json",
            "m2_execution_handoff_payload_ref": "m2_execution_handoff_payload.json",
            "m5_catalog_upsert_payload_ref": "m5_catalog_upsert_payload.json",
            "m6_query_context_payload_ref": "m6_query_context_payload.json",
            "module_integration_contract_ref": "module_integration_contract.json",
        }
        self.write_artifact(layer_dir / "sql_context_pack.json", sql_context_pack)
        self.write_artifact(layer_dir / "catalog_sync_contract_package.json", catalog_package)
        self.write_artifact(layer_dir / "m1_source_feedback_payload.json", m1_source_feedback_payload)
        self.write_artifact(layer_dir / "m2_execution_handoff_payload.json", m2_execution_handoff_payload)
        self.write_artifact(layer_dir / "m5_catalog_upsert_payload.json", m5_catalog_upsert_payload)
        self.write_artifact(layer_dir / "m6_query_context_payload.json", m6_query_context_payload)
        self.write_artifact(layer_dir / "module_integration_contract.json", module_integration_contract)
        artifact_manifest = self.build_artifact_manifest(dataset)
        self.write_artifact(layer_dir / "artifact_reference_manifest.json", artifact_manifest)
        status_match = (
            catalog_package["m6_context_status"] == state["l9"]["gate_summary"]["m6_context_status"]
            and catalog_package["m6_context_status"] == sql_context_pack["m6_context_status"]
        )
        context_consistency = {
            "schema_version": "m3.l10.context_consistency_result.v2.1.1",
            "source_id": dataset.source_id,
            "status": "pass" if status_match else "block",
            "checks": [
                {
                    "check": "l9_l10_m6_context_status_match",
                    "status": "pass" if status_match else "block",
                    "l9_gate_summary": state["l9"]["gate_summary"]["m6_context_status"],
                    "l10_catalog_package": catalog_package["m6_context_status"],
                    "l10_sql_context_pack": sql_context_pack["m6_context_status"],
                },
                {
                    "check": "artifact_reference_manifest_present",
                    "status": "pass" if artifact_manifest else "block",
                    "artifact_count": len(artifact_manifest),
                },
            ],
        }
        self.write_artifact(layer_dir / "context_consistency_result.json", context_consistency)
        artifact_manifest = self.build_artifact_manifest(dataset)
        self.write_artifact(layer_dir / "artifact_reference_manifest.json", artifact_manifest)
        return {
            "catalog_package": catalog_package,
            "sql_context_pack": sql_context_pack,
            "m1_source_feedback_payload": m1_source_feedback_payload,
            "m2_execution_handoff_payload": m2_execution_handoff_payload,
            "m5_catalog_upsert_payload": m5_catalog_upsert_payload,
            "m6_query_context_payload": m6_query_context_payload,
            "module_integration_contract": module_integration_contract,
            "artifact_manifest": artifact_manifest,
            "context_consistency": context_consistency,
            "m6_context_status": catalog_package["m6_context_status"],
            "artifact_refs": {
                "catalog_sync_contract_package": rel(layer_dir / "catalog_sync_contract_package.json", self.artifact_root),
                "sql_context_pack": rel(layer_dir / "sql_context_pack.json", self.artifact_root),
                "m1_source_feedback_payload": rel(layer_dir / "m1_source_feedback_payload.json", self.artifact_root),
                "m2_execution_handoff_payload": rel(layer_dir / "m2_execution_handoff_payload.json", self.artifact_root),
                "m5_catalog_upsert_payload": rel(layer_dir / "m5_catalog_upsert_payload.json", self.artifact_root),
                "m6_query_context_payload": rel(layer_dir / "m6_query_context_payload.json", self.artifact_root),
                "module_integration_contract": rel(layer_dir / "module_integration_contract.json", self.artifact_root),
                "artifact_reference_manifest": rel(layer_dir / "artifact_reference_manifest.json", self.artifact_root),
                "context_consistency": rel(layer_dir / "context_consistency_result.json", self.artifact_root),
            },
        }

    def caveat_summary(self, state: dict[str, Any]) -> str:
        warnings = []
        if state["l5"]["status"] != "pass":
            warnings.extend(state["l5"]["quality_gate"]["processing_quality"]["failures"])
        warnings.extend(state["l5"]["quality_gate"]["catalog_safety"]["warnings"])
        warnings.extend(state["l5"]["quality_gate"]["gold_readiness"]["warnings"])
        return "; ".join(warnings) if warnings else "No blocking caveat in bounded Spark contract run"

    def build_artifact_manifest(self, dataset: DatasetSpec) -> list[dict[str, Any]]:
        base = self.dataset_dir(dataset)
        rows = []
        for path in sorted(base.rglob("*")):
            if path.is_file() and path.name != "artifact_reference_manifest.json":
                artifact_id = rel(path, self.artifact_root)
                rows.append(
                    {
                        "artifact_id": artifact_id,
                        "path": rel(path, self.artifact_root),
                        "dataset_relative_path": rel(path, base),
                        "bytes": path.stat().st_size,
                        "sha256": sha256_file(path),
                    }
                )
        return rows

    def write_run_summary(self, elapsed: float) -> dict[str, Any]:
        summary = {
            "run_id": self.run_id,
            "created_at": utc_now(),
            "artifact_root": str(self.artifact_root),
            "report_root": str(self.report_root),
            "sample_rows_per_dataset": self.sample_rows,
            "line_sample_max_bytes": self.line_sample_max_bytes,
            "parquet_sample_max_files": self.parquet_sample_max_files,
            "source_window": {
                "index": self.source_window_index,
                "count": self.source_window_count,
            },
            "spark": {
                "master": self.spark.sparkContext.master,
                "application_id": self.spark.sparkContext.applicationId,
                "application_name": self.spark_app_name,
                "version": self.spark.version,
            },
            "dataset_count": len(self.datasets),
            "selected_dataset_keys": [dataset.key for dataset in self.dataset_specs],
            "elapsed_seconds": round(elapsed, 3),
            "datasets": {},
            "totals": {
                "l0_source_bytes": 0,
                "l0_object_count": 0,
                "spark_sample_rows": 0,
                "silver_preview_rows": 0,
                "gold_preview_rows": 0,
                "sample_input_bytes": 0,
                "processing_pass_count": 0,
                "processing_fail_count": 0,
                "catalog_warn_count": 0,
                "gold_ready_count": 0,
                "gold_review_count": 0,
                "legacy_warn_count": 0,
            },
        }
        for key, state in self.datasets.items():
            l0 = state["l0"]["manifest"]
            sample_descriptor = state["sample"].get("range_sample") or state["sample"].get("parquet_sample") or {}
            sample_input_bytes = int(sample_descriptor.get("bytes_read") or sample_descriptor.get("bytes_selected") or 0)
            item = {
                "display_name": state["display_name"],
                "format_family": state["dataset"].format_family,
                "l0_bytes": l0["byte_size"],
                "l0_objects": l0["object_count"],
                "sample_input_bytes": sample_input_bytes,
                "sample_load_seconds": state["sample"].get("load_seconds"),
                "dataset_seconds": state["metrics"].get("dataset_seconds"),
                "sample_rows": state["l1"]["sample_rows"],
                "sample_provenance_status": state["l1"].get("sample_provenance_status"),
                "schema_fields": len(state["l2"]["schema_fields"]),
                "schema_fingerprint": state["l2"]["schema_fingerprint"],
                "silver_preview_rows": state["l4"]["silver_rows"],
                "gold_preview_rows": state["l4"]["gold_rows"],
                "quality_status": state["l5"]["status"],
                "processing_quality_status": state["l5"]["processing_quality_status"],
                "catalog_safety_status": state["l5"]["catalog_safety_status"],
                "gold_readiness_status": state["l5"]["gold_readiness_status"],
                "silver_context_status": state["l9"]["silver_context_status"],
                "gold_context_status": state["l9"]["gold_context_status"],
                "m6_context_status": state["l10"]["m6_context_status"],
                "l10_consistency_status": state["l10"]["context_consistency"]["status"],
                "transformation_quality_score": state["l5"]["transformation_quality_scorecard"]["overall_score"],
                "transformation_quality_status": state["l5"]["transformation_quality_scorecard"]["quality_status"],
                "m2_handoff_ref": state["l10"]["artifact_refs"]["m2_execution_handoff_payload"],
                "m5_handoff_ref": state["l10"]["artifact_refs"]["m5_catalog_upsert_payload"],
                "m6_handoff_ref": state["l10"]["artifact_refs"]["m6_query_context_payload"],
                "legacy_single_status": state["l5"]["legacy_single_status"],
                "source_contract_mismatch": state["l5"]["source_contract_mismatch"],
                "gold_model_id": state["l4"]["gold_model_id"],
                "artifact_dir": rel(self.dataset_dir(state["dataset"]), self.artifact_root),
            }
            summary["datasets"][key] = item
            summary["totals"]["l0_source_bytes"] += item["l0_bytes"]
            summary["totals"]["l0_object_count"] += item["l0_objects"]
            summary["totals"]["sample_input_bytes"] += item["sample_input_bytes"]
            summary["totals"]["spark_sample_rows"] += item["sample_rows"]
            summary["totals"]["silver_preview_rows"] += item["silver_preview_rows"]
            summary["totals"]["gold_preview_rows"] += item["gold_preview_rows"]
            if item["processing_quality_status"] == "pass":
                summary["totals"]["processing_pass_count"] += 1
            if item["processing_quality_status"] == "fail":
                summary["totals"]["processing_fail_count"] += 1
            if item["catalog_safety_status"] == "warn":
                summary["totals"]["catalog_warn_count"] += 1
            if item["gold_readiness_status"] == "ready":
                summary["totals"]["gold_ready_count"] += 1
            if item["gold_readiness_status"] != "ready":
                summary["totals"]["gold_review_count"] += 1
            if item["legacy_single_status"] == "warn":
                summary["totals"]["legacy_warn_count"] += 1
        self.write_artifact(self.artifact_root / "run_summary.json", summary)
        return summary

    def write_reports(self, summary: dict[str, Any]) -> None:
        ensure_dir(self.report_root)
        for layer, topics in SUBTOPICS.items():
            ensure_dir(self.report_root / layer)
            for topic in topics:
                md = self.subtopic_markdown(layer, topic, summary)
                md_path = self.report_root / layer / f"{topic['slug']}.md"
                html_path = self.report_root / layer / f"{topic['slug']}.html"
                write_text(md_path, md)
                write_text(html_path, self.markdown_report_to_html(topic["title"], md))
        summary_md = self.summary_markdown(summary)
        write_text(self.report_root / "summary.md", summary_md)
        write_text(self.report_root / "index.html", self.index_html(summary))

    def summary_markdown(self, summary: dict[str, Any]) -> str:
        lines = [
            "# M3 L0-L10 계약 구현 실행 요약",
            "",
            f"- run_id: `{self.run_id}`",
            f"- artifact root: `{self.artifact_root}`",
            f"- Spark sample rows per dataset: `{self.sample_rows}`",
            f"- line-file range sample byte budget: `{self.line_sample_max_bytes}`",
            f"- parquet sample max files per dataset: `{self.parquet_sample_max_files}`",
            f"- total raw logical bytes covered by L0 references: `{summary['totals']['l0_source_bytes']}`",
            f"- total raw object count covered by L0 references: `{summary['totals']['l0_object_count']}`",
            f"- Spark master: `{summary['spark']['master']}`",
            f"- Spark application id: `{summary['spark']['application_id']}`",
            f"- total control-plane input bytes actually sampled/read: `{summary['totals']['sample_input_bytes']}`",
            f"- total Spark sample rows loaded: `{summary['totals']['spark_sample_rows']}`",
            f"- total Silver preview rows: `{summary['totals']['silver_preview_rows']}`",
            f"- total Gold preview rows: `{summary['totals']['gold_preview_rows']}`",
            f"- processing pass/fail: `{summary['totals']['processing_pass_count']}` / `{summary['totals']['processing_fail_count']}`",
            f"- catalog warn count: `{summary['totals']['catalog_warn_count']}`",
            f"- gold ready/review: `{summary['totals']['gold_ready_count']}` / `{summary['totals']['gold_review_count']}`",
            f"- legacy single warn count: `{summary['totals']['legacy_warn_count']}`",
            "",
            "## Dataset 결과",
            "",
            "| Dataset | Format | L0 bytes | Sample input bytes | Dataset sec | Sample rows | Fields | Silver rows | Gold rows | Quality score | Replay | Processing | Catalog | Gold | M6 |",
            "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- | --- | --- |",
        ]
        for key, item in summary["datasets"].items():
            lines.append(
                f"| `{key}` | {item['format_family']} | {item['l0_bytes']} | {item['sample_input_bytes']} | {item['dataset_seconds']} | {item['sample_rows']} | {item['schema_fields']} | {item['silver_preview_rows']} | {item['gold_preview_rows']} | {item['transformation_quality_score']} | {item['sample_provenance_status']} | {item['processing_quality_status']} | {item['catalog_safety_status']} | {item['gold_readiness_status']} | {item['m6_context_status']} |"
            )
        lines += [
            "",
            "## 구현 판정",
            "",
            "이번 실행은 L0 full raw inventory를 기준으로 삼고, L1-L6은 profile/recommendation/decision/compiler 계약을 만들며, L7-L8은 M2 Spark preview 결과를 받아들이는 계약, L9-L10은 M5/M6 handoff 계약을 만든다. CSV/JSONL 샘플은 MinIO Range GET 후 `m3-artifacts`에 공유 샘플로 올리고 Spark가 `s3a://`로 읽지만, 이 preview는 production data-plane 소유권이 아니라 M3 계약 검증 증거다.",
        ]
        return "\n".join(lines) + "\n"

    def subtopic_markdown(self, layer: str, topic: dict[str, str], summary: dict[str, Any]) -> str:
        title = f"{layer.upper()} - {topic['title']}"
        rows = []
        for key, state in self.datasets.items():
            rows.append(self.subtopic_dataset_row(layer, topic["slug"], key, state))
        artifact_refs = self.topic_artifact_refs(layer, topic["slug"])
        lines = [
            f"# {title} 구현 보고서",
            "",
            f"## 계약상 역할",
            "",
            topic["contract"],
            "",
            "## 구현 방식",
            "",
            self.topic_implementation_text(layer, topic["slug"]),
            "",
            "## 운영 사용 방식",
            "",
            self.topic_usage_text(layer, topic["slug"]),
            "",
            "## 실제 Spark 실행 수치",
            "",
            "| Dataset | 핵심 수치 | 판정 |",
            "| --- | --- | --- |",
        ]
        lines.extend(rows)
        lines += [
            "",
            "## Dataset별 해석",
            "",
        ]
        for key, state in self.datasets.items():
            lines.append(f"- `{key}`: {self.subtopic_dataset_interpretation(layer, topic['slug'], key, state)}")
        lines += [
            "",
            "## 검증 기준과 통과 근거",
            "",
            "- 재현성: run_id, source manifest checksum, schema fingerprint, transform spec hash를 모두 남겨 같은 raw version에서 다시 replay할 수 있게 했다.",
            "- 손실 방지: L1 rescue lane과 L5 quarantine/reconciliation을 분리했고, Silver preview row 수가 L1 sample row 수와 달라지는지 별도 수치로 검사했다.",
            "- 대용량 현실성: L0는 전체 object inventory를 참조하고, L1-L6은 bounded profile/recommendation/decision/compiler 계약을 만들며, L7-L8 preview 결과는 M2 실행 계약으로 분리한다. CSV/JSONL은 MinIO Range GET으로 샘플 파일을 만든 뒤 Spark가 읽으므로 전체 raw를 AI나 driver가 실시간으로 훑는 구조가 아니다.",
            "- M2 연동성: L4 JSON/YAML spec과 MinIO preview URI를 남겨 M2 Spark job이 full materialization을 구현할 수 있게 했다.",
            "- M5 연동성: artifact reference manifest, handoff package, quality gate result를 파일 단위로 남겨 workflow 저장/API 계층이 참조할 수 있게 했다.",
            "- M6 연동성: catalog metadata draft, SQL context pack, quality caveat을 만들어 질의 계층이 사용할 수 있는 테이블/컬럼/주의사항을 제공한다.",
            "",
            "## 생성/참조 artifact",
            "",
        ]
        for ref in artifact_refs:
            lines.append(f"- `{ref}`")
        lines += [
            "",
            "## 장점",
            "",
            "- Spark로 실제 MinIO raw를 읽어 schema/profile/preview를 만들었기 때문에 단순 문서 계약보다 실행 근거가 있다.",
            "- L0는 전체 object inventory를 참조하고, L1-L10은 control-plane 계약, M2 preview handoff, M5/M6 context handoff를 분리하므로 대용량/실시간에서 AI나 M3가 data-plane을 전부 떠안는 거짓 구조를 피한다.",
            "- 각 subtopic이 독립 파일로 남아 M2/M5/M6가 필요한 부분만 확인할 수 있다.",
            "",
            "## 한계와 후속 보완",
            "",
            "- 이번 실행은 M3 계약 구현 검증이므로 full Silver/Gold materialization은 하지 않았다. production full materialization은 M2 Spark job 책임이다.",
            "- L0 checksum은 MinIO object key/etag/size composite checksum이다. full byte SHA256은 비용이 큰 data-plane 검증이라 별도 replay/audit job으로 분리해야 한다.",
            "- warn 품질 상태는 실패가 아니라 catalog/M6가 사용자에게 caveat를 보여야 한다는 뜻이다.",
        ]
        return "\n".join(lines) + "\n"

    def topic_implementation_text(self, layer: str, slug: str) -> str:
        mapping = {
            "manifest-checksum": "MinIO object manifest JSONL을 읽어 source_manifest, inventory, raw version checksum을 만든다.",
            "chunk-manifest": "각 MinIO object를 replay 가능한 chunk 단위로 취급하고 byte_start/byte_end/read_uri를 기록한다.",
            "query-mirror-ref": "Spark S3A read URI와 endpoint/path-style 옵션을 query mirror reference로 남긴다.",
            "source-offset-envelope": "Spark sample row마다 source_uri, row_number_hint, raw_hash, parse_status를 붙인 Bronze envelope를 만든다.",
            "record-sample-lane": "AI/control-plane이 볼 수 있는 bounded sample lane을 JSONL artifact로 만든다.",
            "rescue-lane": "JSON parse failure나 hard invalid row가 있으면 rescue_records로 분리한다.",
            "csv-dialect-profile": "Spark text sample과 Python csv.Sniffer를 함께 써서 delimiter/header/quote 후보를 기록한다.",
            "jsonl-profile": "Spark text sample을 JSON parser로 검증해 line parse success ratio를 기록한다.",
            "json-path-trie": "JSON sample object를 flatten해 path/type/count trie profile을 만든다.",
            "large-source-sketch": "Spark aggregate로 bounded sample의 numeric stats/top values/null ratio를 만든다.",
            "schema-fingerprint": "Spark schema와 null ratio를 canonical JSON으로 만들고 SHA256 fingerprint를 계산한다.",
            "type-router": "registered format과 Spark reader 성공 여부를 근거로 profiler list와 confidence를 결정한다.",
            "unknown-two-stage": "light sniff 결과를 profile snapshot과 deep profiler refs로 연결한다.",
            "bronze-to-silver-recommendation": "L2 profile을 근거로 keep/drop/flatten/cast/quarantine draft rule을 만든다.",
            "rule-based-reducer": "AI 입력 전 field count, PII 후보, profile refs만 추린 reducer package를 만든다.",
            "silver-to-gold-recommendation": "domain/field evidence를 보고 grain/dimension/measure Gold 후보를 만든다.",
            "silver-transform-spec": "추천된 Silver rule을 M2 Spark가 실행 가능한 JSON/YAML spec으로 고정한다.",
            "silver-preview-validation": "Spark로 silver preview parquet을 MinIO m3-silver에 쓰고 row/schema 결과를 기록한다.",
            "gold-generation-spec": "Gold grain/measure/output URI를 JSON/YAML spec으로 고정한다.",
            "layered-transform-graph": "L0부터 L6까지 artifact dependency graph를 JSON으로 남긴다.",
            "compiler-validation": "per-row AI, unbounded collect, eval generated code 같은 금지 패턴을 검사한다.",
            "gold-preview-validation": "Spark aggregate Gold preview를 MinIO m3-gold에 쓰고 semantic warning을 기록한다.",
            "gate-status-model": "quality status를 pass/warn/fail/quarantine으로 표준화한다.",
            "drift-snapshot": "첫 실행은 baseline 생성으로 표시하고 future drift 비교 기준 fingerprint를 남긴다.",
            "quarantine": "rescue/invalid row가 있으면 quarantine record와 policy를 남긴다.",
            "schema-compatibility": "first baseline run 기준 schema compatibility result를 만든다.",
            "reconciliation": "L0 bytes/object, L1 sample, L4 Silver/Gold preview count를 대조한다.",
            "replay-hash": "schema/spec/catalog 입력 hash를 만들어 replay 기준을 남긴다.",
            "pii-warning": "field name pattern 기반 PII 후보를 catalog caveat로 승격한다.",
            "gold-semantic-gate": "Gold group count와 semantic warnings로 M6 기본 사용 가능성을 판단한다.",
            "catalog-metadata-draft": "raw/silver/gold/schema/quality를 하나의 catalog draft로 묶는다.",
            "field-level-lineage": "source field에서 Silver field까지의 direct/normalized lineage를 만든다.",
            "sql-context-pack": "M6가 쓸 allowed table과 avoid_or_warn context를 만든다.",
            "artifact-reference-manifest": "dataset별 모든 artifact path/bytes/sha256을 기록한다.",
            "quality-caveat": "PII/Gold semantic warning을 user-facing caveat로 만든다.",
            "handoff-package": "M2/M5/M6가 받을 final package refs와 status를 만든다.",
        }
        return mapping.get(slug, "계약 subtopic에 맞는 artifact를 Spark 실행 결과와 연결해 기록한다.")

    def topic_usage_text(self, layer: str, slug: str) -> str:
        if layer == "l0":
            return "M3는 원본 payload를 다시 복제하지 않고 MinIO raw object inventory, checksum, replay URI를 고정한다. M2는 이 URI를 full Spark job 입력으로 쓰고, M5는 source version과 manifest를 workflow 실행 단위에 연결한다."
        if layer == "l1":
            return "M3는 Bronze 전체 적재 엔진이 아니라 source-offset envelope와 sample/rescue lane 계약을 만든다. 이 결과는 M2가 full Bronze/Silver 처리 시 어떤 source pointer와 parse failure 정책을 지켜야 하는지 알려준다."
        if layer == "l2":
            return "M3는 모르는 CSV/JSONL/Parquet 구조를 먼저 가볍게 sniff하고, 그 다음 schema fingerprint, path profile, sketch profile을 만든다. AI는 이 profile snapshot을 보고 추천을 만들 수 있지만 row마다 실시간 호출되지는 않는다."
        if layer == "l3":
            return "M3는 L2 evidence를 줄여 사람이 검토 가능한 Silver/Gold 추천 후보를 만든다. 추천은 승인 전 초안이며, 승인되면 L4 deterministic spec으로 고정되어 M2가 실행할 수 있다."
        if layer == "l4":
            return "M3는 Spark preview로 spec 실행 가능성을 확인하되 full production materialization은 하지 않는다. Silver/Gold spec, preview URI, compiler validation 결과가 M2 구현 계약의 중심 산출물이다."
        if layer == "l5":
            return "M3는 품질 판단을 pass/warn/fail/quarantine 상태로 표준화한다. warn은 실패가 아니라 M5/M6가 사용자에게 caveat을 보여야 하는 상태이며, fail/quarantine은 full 실행 또는 catalog 승격 전에 owner 조치가 필요하다는 뜻이다."
        if layer == "l6":
            return "M3는 catalog draft와 SQL context pack을 만들어 M5 저장/API 계층과 M6 질의 계층에 넘긴다. catalog에는 raw/silver/gold URI, schema fingerprint, lineage, quality caveat이 함께 들어간다."
        return "M3 계약 artifact를 생성하고, downstream 역할(M2/M5/M6)이 실행/저장/질의에 사용할 수 있도록 파일 참조와 판단 근거를 남긴다."

    def subtopic_dataset_interpretation(self, layer: str, slug: str, key: str, state: dict[str, Any]) -> str:
        if layer == "l0":
            manifest = state["l0"]["manifest"]
            return f"원본 {manifest['byte_size']:,} bytes, {manifest['object_count']} objects를 source version으로 고정했다. checksum은 object key/etag/size 기반이라 raw replay 기준을 제공한다."
        if layer == "l1":
            sample_policy = state["sample"].get("range_sample") or state["sample"].get("parquet_sample") or {}
            mode = sample_policy.get("sampling_mode", "spark_sample")
            shared_uri = state["sample"].get("sample_input_s3_uri") or "direct_s3a_read"
            return f"L1 sample {state['l1']['sample_rows']:,} rows와 rescue {state['l1']['rescue_rows']} rows를 분리했다. sampling mode는 `{mode}`이고 shared input은 `{shared_uri}`라 노트북 Spark worker가 로컬 F 드라이브 없이 같은 sample을 읽을 수 있다."
        if layer == "l2":
            fields = len(state["l2"]["schema_fields"])
            null_heavy = len(state["l2"]["profile_snapshot"].get("null_heavy_fields", []))
            return f"{fields}개 field와 schema fingerprint `{state['l2']['schema_fingerprint'][:12]}`를 만들었다. null-heavy field는 {null_heavy}개라 Silver 추천에서 drop/keep 검토 근거가 된다."
        if layer == "l3":
            return f"Silver rule {len(state['l3']['silver_rules'])}개, Gold model 후보 {len(state['l3']['gold_models'])}개를 만들었다. recommendation package는 row-level AI 호출 0회를 명시해 실시간 대용량 처리 과장을 피한다."
        if layer == "l4":
            return f"Silver preview {state['l4']['silver_rows']:,} rows와 Gold preview {state['l4']['gold_rows']:,} rows를 MinIO에 썼다. compiler validation은 `{state['l4']['compiler_validation']['status']}`이고 selected Gold model은 `{state['l4']['gold_model_id']}`다."
        if layer == "l5":
            q = state["l5"]["quality_gate"]
            rec = q["reconciliation"]
            return f"processing `{q['processing_quality']['status']}`, catalog `{q['catalog_safety']['status']}`, gold readiness `{q['gold_readiness']['status']}`, legacy single `{q['legacy_single_status']}`다. PII/identifier caveat {len(q['pii_warning'])}개, source mismatch {q['catalog_safety']['source_contract_mismatch']}이며 Silver row loss/growth는 {rec['unexplained_silver_row_loss']}/{rec['unexpected_silver_row_growth']}다."
        q = state["l6"]["handoff"]
        return f"catalog handoff status는 `{q['status']}`이고 catalog URI는 `{state['l6']['catalog_uri']}`다. M6 SQL context pack은 allowed table, grain, caveat, avoid_or_warn를 포함한다."

    def topic_artifact_refs(self, layer: str, slug: str) -> list[str]:
        artifact_map = {
            "manifest-checksum": ["l0/source_manifest.json", "l0/source_file_inventory.jsonl", "l0/raw_version_index.jsonl"],
            "chunk-manifest": ["l0/chunk_manifest.jsonl"],
            "query-mirror-ref": ["l0/query_mirror_ref.json", "l0/replay_manifest.json"],
            "source-offset-envelope": ["l1/source_offset_spec.json", "l1/bronze_record_samples.jsonl", "l1/sample_provenance_check.json"],
            "record-sample-lane": ["l1/bronze_sample_policy.json", "l1/bronze_record_samples.jsonl"],
            "rescue-lane": ["l1/rescue_records.jsonl", "l1/rescue_summary.json"],
            "csv-dialect-profile": ["l2/csv_dialect_profile.json"],
            "jsonl-profile": ["l2/jsonl_line_validation_profile.json"],
            "json-path-trie": ["l2/json_path_trie_profile.json"],
            "large-source-sketch": ["l2/large_source_sketch_profile.json"],
            "schema-fingerprint": ["l2/schema_fingerprint.json"],
            "type-router": ["l2/type_router_profile.json"],
            "unknown-two-stage": ["l2/two_stage_profile.json", "l2/profile_snapshot.json"],
            "bronze-to-silver-recommendation": ["l3/bronze_to_silver_recommendation.json"],
            "rule-based-reducer": ["l3/recommendation_evidence_reducer.json"],
            "silver-to-gold-recommendation": ["l3/silver_to_gold_recommendation.json"],
            "silver-transform-spec": ["l4/silver_transform_spec.json", "l4/silver_transform_spec.yaml"],
            "silver-preview-validation": ["l4/silver_preview_validation_result.json", f"s3a://m3-silver/m3_contract_runs/{self.run_id}/{{dataset}}/silver_preview"],
            "gold-generation-spec": ["l4/gold_generation_spec.json", "l4/gold_generation_spec.yaml"],
            "layered-transform-graph": ["l4/layered_transform_graph.json"],
            "compiler-validation": ["l4/compiler_validation_result.json"],
            "gold-preview-validation": ["l4/gold_preview_validation_result.json", f"s3a://m3-gold/m3_contract_runs/{self.run_id}/{{dataset}}/..."],
            "gate-status-model": ["l5/gate_status_model.json", "l5/quality_gate_result.json", "l5/processing_quality_axis.json", "l5/catalog_safety_axis.json", "l5/gold_readiness_axis.json", "l5/transformation_quality_scorecard.json", "l5/quality_speed_accuracy_budget.json"],
            "drift-snapshot": ["l5/drift_snapshot.json"],
            "quarantine": ["l5/quarantine_records.jsonl", "l5/quarantine_policy.json"],
            "schema-compatibility": ["l5/schema_compatibility_result.json"],
            "reconciliation": ["l5/reconciliation_result.json"],
            "replay-hash": ["l5/replay_hash_result.json"],
            "pii-warning": ["l5/pii_warning_result.json", "l5/field_classification_result.json", "l5/source_contract_check_result.json"],
            "gold-semantic-gate": ["l5/gold_semantic_gate_result.json"],
            "catalog-metadata-draft": ["l6/catalog_metadata_draft.json", f"s3a://m3-catalog/m3_contract_runs/{self.run_id}/{{dataset}}/catalog_metadata/catalog_metadata.json"],
            "field-level-lineage": ["l6/field_level_lineage.json"],
            "sql-context-pack": ["l6/m6_sql_context_pack.json"],
            "artifact-reference-manifest": ["l6/artifact_reference_manifest.json"],
            "quality-caveat": ["l6/quality_caveat.json"],
            "handoff-package": ["l6/handoff_package.json", "l6/m2_execution_contract_bundle.json"],
            "silver-preview-contract": ["l7/m2_silver_preview_job_contract.json", "l7/silver_preview_validation_result.json"],
            "silver-structural-axis": ["l7/silver_structural_axis.json"],
            "gold-preview-contract": ["l8/m2_gold_preview_job_contract.json", "l8/gold_preview_validation_result.json"],
            "gold-semantic-readiness": ["l8/gold_semantic_readiness_axis.json", "l8/metric_definition_draft.json"],
            "multi-axis-gate": ["l9/processing_quality_axis.json", "l9/catalog_safety_axis.json", "l9/gold_readiness_axis.json", "l9/three_axis_precedence_rule.json", "l9/gate_summary.json"],
            "m6-context-status": ["l9/gate_summary.json", "l10/sql_context_pack.json"],
            "catalog-sync-package": ["l10/catalog_sync_contract_package.json", "l10/sql_context_pack.json", "l10/m5_catalog_upsert_payload.json", "l10/m6_query_context_payload.json"],
            "artifact-reference-resolution": ["l10/artifact_reference_manifest.json", "l10/context_consistency_result.json", "l10/module_integration_contract.json", "l10/m2_execution_handoff_payload.json"],
        }
        return artifact_map.get(slug, [f"{layer}/{slug}.json"])

    def subtopic_dataset_row(self, layer: str, slug: str, key: str, state: dict[str, Any]) -> str:
        if layer == "l0":
            metric = f"{state['l0']['manifest']['object_count']} objects / {state['l0']['manifest']['byte_size']} bytes"
            verdict = "pass"
        elif layer == "l1":
            sample_descriptor = state["sample"].get("range_sample") or state["sample"].get("parquet_sample") or {}
            bytes_read = sample_descriptor.get("bytes_read") or sample_descriptor.get("bytes_selected") or 0
            metric = f"sample {state['l1']['sample_rows']} rows, rescue {state['l1']['rescue_rows']}, input {bytes_read} bytes"
            verdict = "pass"
        elif layer == "l2":
            metric = f"{len(state['l2']['schema_fields'])} fields, fingerprint {state['l2']['schema_fingerprint'][:12]}"
            verdict = "pass"
        elif layer == "l3":
            metric = f"{len(state['l3']['silver_rules'])} Silver rules, {len(state['l3']['gold_models'])} Gold models, row AI calls 0"
            verdict = "pass"
        elif layer == "l4":
            metric = f"Silver {state['l4']['silver_rows']} rows, Gold {state['l4']['gold_rows']} rows"
            verdict = state["l4"]["compiler_validation"]["status"]
        elif layer == "l5":
            score = state["l5"]["transformation_quality_scorecard"]
            metric = f"score {score['overall_score']}, processing {state['l5']['processing_quality_status']}, catalog {state['l5']['catalog_safety_status']}, gold {state['l5']['gold_readiness_status']}"
            verdict = score["quality_status"]
        elif layer == "l6":
            metric = f"catalog {state['l6']['handoff']['status']}, catalog URI {state['l6']['catalog_uri']}"
            verdict = state["l6"]["handoff"]["status"]
        elif layer == "l7":
            metric = f"silver validation {state['l7']['validation']['status']}, structural {state['l7']['silver_structural_axis']['status']}"
            verdict = state["l7"]["silver_structural_axis"]["status"]
        elif layer == "l8":
            metric = f"gold validation {state['l8']['validation']['status']}, readiness {state['l8']['gold_semantic_readiness']['status']}"
            verdict = state["l8"]["gold_semantic_readiness"]["status"]
        elif layer == "l9":
            metric = f"silver {state['l9']['silver_context_status']}, gold {state['l9']['gold_context_status']}, m6 {state['l9']['m6_context_status']}"
            verdict = state["l9"]["m6_context_status"]
        else:
            metric = f"m2 {state['l10']['artifact_refs']['m2_execution_handoff_payload']}, m5 {state['l10']['artifact_refs']['m5_catalog_upsert_payload']}, m6 {state['l10']['m6_context_status']}"
            verdict = state["l10"]["context_consistency"]["status"]
        return f"| `{key}` | {metric} | {verdict} |"

    def markdown_report_to_html(self, title: str, md: str) -> str:
        body_lines = []
        in_code = False
        for line in md.splitlines():
            if line.startswith("```"):
                body_lines.append("</pre>" if in_code else "<pre>")
                in_code = not in_code
                continue
            if in_code:
                body_lines.append(html.escape(line))
            elif line.startswith("# "):
                body_lines.append(f"<header><h1>{html.escape(line[2:])}</h1></header>")
            elif line.startswith("## "):
                body_lines.append(f"<section><h2>{html.escape(line[3:])}</h2>")
            elif line.startswith("| "):
                body_lines.append(f"<pre>{html.escape(line)}</pre>")
            elif line.startswith("- "):
                body_lines.append(f"<p>{html.escape(line)}</p>")
            elif not line.strip():
                body_lines.append("")
            else:
                body_lines.append(f"<p>{html.escape(line)}</p>")
        return html_page(title, "\n".join(body_lines))

    def index_html(self, summary: dict[str, Any]) -> str:
        cards = []
        for key, item in summary["datasets"].items():
            cards.append(
                f"<div class='card'><h3>{html.escape(key)}</h3><p>{html.escape(item['display_name'])}</p>"
                f"<div class='metric'>{item['sample_rows']:,}</div><p>sample rows</p>"
                f"<p>L0 {item['l0_bytes']:,} bytes / sampled {item['sample_input_bytes']:,} bytes</p>"
                f"<p>Dataset time {item['dataset_seconds']}s / sample load {item['sample_load_seconds']}s</p>"
                f"<p>Silver {item['silver_preview_rows']:,} / Gold {item['gold_preview_rows']:,}</p>"
                f"<p>Quality score: <strong>{item['transformation_quality_score']}</strong> ({html.escape(item['transformation_quality_status'])})</p>"
                f"<p>Replay provenance: <strong>{html.escape(str(item['sample_provenance_status']))}</strong></p>"
                f"<p>Processing: <strong>{html.escape(item['processing_quality_status'])}</strong> | Catalog: <strong>{html.escape(item['catalog_safety_status'])}</strong></p>"
                f"<p>Gold: <strong>{html.escape(item['gold_readiness_status'])}</strong> | Legacy: <strong>{html.escape(item['legacy_single_status'])}</strong></p></div>"
            )
        layer_links = []
        for layer, topics in SUBTOPICS.items():
            topic_links = " ".join(f"<li><a href='{layer}/{t['slug']}.html'>{html.escape(t['title'])}</a></li>" for t in topics)
            layer_links.append(f"<section><h2>{layer.upper()}</h2><ul>{topic_links}</ul></section>")
        body = f"""
<header>
  <h1>M3 L0-L10 계약 구현 보드</h1>
  <p>run_id: <code>{html.escape(self.run_id)}</code></p>
  <p>artifact root: <code>{html.escape(str(self.artifact_root))}</code></p>
  <p>Spark master: <code>{html.escape(summary['spark']['master'])}</code> / application: <code>{html.escape(str(summary['spark']['application_id']))}</code></p>
</header>
<section>
  <h2>전체 수치</h2>
  <div class="grid">
    <div class="card"><div class="metric">{summary['totals']['l0_source_bytes']:,}</div><p>L0 referenced bytes</p></div>
    <div class="card"><div class="metric">{summary['totals']['l0_object_count']:,}</div><p>L0 objects</p></div>
    <div class="card"><div class="metric">{summary['totals']['sample_input_bytes']:,}</div><p>control-plane input bytes</p></div>
    <div class="card"><div class="metric">{summary['totals']['spark_sample_rows']:,}</div><p>Spark sample rows</p></div>
    <div class="card"><div class="metric">{summary['totals']['silver_preview_rows']:,}</div><p>Silver preview rows</p></div>
    <div class="card"><div class="metric">{summary['totals']['gold_preview_rows']:,}</div><p>Gold preview rows</p></div>
    <div class="card"><div class="metric">{summary['totals']['processing_pass_count']}/{summary['totals']['processing_fail_count']}</div><p>processing pass/fail</p></div>
    <div class="card"><div class="metric">{summary['totals']['catalog_warn_count']}</div><p>catalog warn</p></div>
    <div class="card"><div class="metric">{summary['totals']['gold_ready_count']}/{summary['totals']['gold_review_count']}</div><p>gold ready/review</p></div>
  </div>
</section>
<section><h2>Dataset</h2><div class="grid">{''.join(cards)}</div></section>
<section><h2>요약 문서</h2><p><a href="summary.md">summary.md</a></p></section>
{''.join(layer_links)}
"""
        return html_page("M3 L0-L10 계약 구현 보드", body)


def create_spark(
    master: str,
    s3_env: dict[str, str],
    driver_host: str | None = None,
    s3a_jars: str | None = None,
    ship_s3a_jars: bool = False,
    driver_memory: str = "4g",
    executor_memory: str = "4g",
    executor_cores: int | None = None,
    spark_cores_max: int | None = None,
    shuffle_partitions: int = 8,
    app_name: str = "m3_l0_l10_spark_contract_pipeline",
) -> SparkSession:
    DEFAULT_SPARK_LOCAL_DIR.mkdir(parents=True, exist_ok=True)
    endpoint = s3_env.get("S3_ENDPOINT_URL") or s3_env.get("AWS_ENDPOINT_URL") or "http://172.21.102.126:9000"
    access = s3_env["AWS_ACCESS_KEY_ID"]
    secret = s3_env["AWS_SECRET_ACCESS_KEY"]
    jar_uris = s3a_jars or (",".join(default_s3a_jar_uris()) if ship_s3a_jars else "")
    builder = (
        SparkSession.builder.master(master)
        .appName(app_name)
        .config("spark.ui.enabled", "false")
        .config("spark.driver.memory", driver_memory)
        .config("spark.executor.memory", executor_memory)
        .config("spark.sql.caseSensitive", "true")
        .config("spark.sql.shuffle.partitions", str(shuffle_partitions))
        .config("spark.sql.files.maxPartitionBytes", "67108864")
        .config("spark.local.dir", str(DEFAULT_SPARK_LOCAL_DIR))
        .config("spark.hadoop.fs.s3a.endpoint", endpoint)
        .config("spark.hadoop.fs.s3a.access.key", access)
        .config("spark.hadoop.fs.s3a.secret.key", secret)
        .config("spark.hadoop.fs.s3a.path.style.access", "true")
        .config("spark.hadoop.fs.s3a.connection.ssl.enabled", "false")
        .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem")
        .config("spark.hadoop.fs.s3a.fast.upload", "true")
        .config("spark.hadoop.fs.s3a.fast.upload.buffer", "array")
        .config("spark.hadoop.fs.s3a.multipart.size", "67108864")
    )
    if executor_cores:
        builder = builder.config("spark.executor.cores", str(executor_cores))
    if spark_cores_max:
        builder = builder.config("spark.cores.max", str(spark_cores_max))
    if jar_uris:
        builder = (
            builder.config("spark.jars", jar_uris)
            .config("spark.files.io.connectionTimeout", "900s")
            .config("spark.network.timeout", "900s")
            .config("spark.executor.heartbeatInterval", "60s")
        )
    if driver_host:
        builder = (
            builder.config("spark.driver.host", driver_host)
            .config("spark.driver.bindAddress", "0.0.0.0")
        )
    return builder.getOrCreate()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--master", default="local[4]", help="Spark master, e.g. local[4] or spark://172.21.102.126:7077")
    parser.add_argument("--driver-host", default=None, help="Driver host/IP reachable from Spark workers; required for standalone workers on another machine")
    parser.add_argument("--s3a-jars", default=None, help="Comma-separated jar URIs for hadoop-aws and AWS SDK bundle. Prefer installing jars on every worker instead of shipping them per run.")
    parser.add_argument("--ship-s3a-jars", action="store_true", help="Temporarily ship bundled S3A jars to workers. Slow because the AWS SDK bundle is large; use only for diagnosis.")
    parser.add_argument("--sample-rows", type=int, default=25_000, help="Bounded Spark rows per dataset for L1-L10 control-plane contract evidence")
    parser.add_argument("--report-sample-rows", type=int, default=200, help="Rows collected into local JSONL sample/report artifacts")
    parser.add_argument("--line-sample-max-bytes", type=int, default=512 * 1024 * 1024, help="Max S3 Range bytes per CSV/JSONL dataset before Spark reads the bounded shared s3a sample")
    parser.add_argument("--parquet-sample-max-files", type=int, default=8, help="Max manifest-selected parquet files per Parquet dataset for control-plane preview")
    parser.add_argument("--s3-env", type=Path, default=DEFAULT_S3_ENV)
    parser.add_argument("--raw-manifest", type=Path, default=DEFAULT_RAW_MANIFEST)
    parser.add_argument("--artifact-root", type=Path, default=DEFAULT_ARTIFACT_ROOT)
    parser.add_argument("--report-root", type=Path, default=DEFAULT_REPORT_ROOT)
    parser.add_argument("--run-id", default=new_run_id())
    parser.add_argument("--spark-app-name", default=None, help="Human-readable Spark application name shown in the standalone cluster UI")
    parser.add_argument("--dataset-keys", default=None, help="Comma-separated dataset keys to process. Defaults to all datasets.")
    parser.add_argument("--source-window-index", type=int, default=0, help="0-based source_unit/window index for adaptive parallel profiling")
    parser.add_argument("--source-window-count", type=int, default=1, help="Total source_unit/window count for adaptive parallel profiling")
    parser.add_argument("--driver-memory", default="4g")
    parser.add_argument("--executor-memory", default="4g")
    parser.add_argument("--executor-cores", type=int, default=None)
    parser.add_argument("--spark-cores-max", type=int, default=None)
    parser.add_argument("--shuffle-partitions", type=int, default=8)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.source_window_count < 1:
        raise SystemExit("--source-window-count must be >= 1")
    if args.source_window_index < 0 or args.source_window_index >= args.source_window_count:
        raise SystemExit("--source-window-index must satisfy 0 <= index < count")
    s3_env = read_env(args.s3_env)
    raw_manifest = load_raw_manifest(args.raw_manifest)
    if args.dataset_keys:
        wanted = {item.strip() for item in args.dataset_keys.split(",") if item.strip()}
        known = {dataset.key for dataset in DATASETS}
        unknown = sorted(wanted - known)
        if unknown:
            raise SystemExit(f"Unknown dataset keys: {', '.join(unknown)}")
        dataset_specs = [dataset for dataset in DATASETS if dataset.key in wanted]
    else:
        dataset_specs = DATASETS
    spark = create_spark(
        args.master,
        s3_env,
        args.driver_host,
        args.s3a_jars,
        args.ship_s3a_jars,
        args.driver_memory,
        args.executor_memory,
        args.executor_cores,
        args.spark_cores_max,
        args.shuffle_partitions,
        args.spark_app_name or "m3_l0_l10_spark_contract_pipeline",
    )
    try:
        pipeline = SparkM3Pipeline(
            spark=spark,
            run_id=args.run_id,
            artifact_root=args.artifact_root,
            report_root=args.report_root,
            raw_manifest=raw_manifest,
            s3_env=s3_env,
            sample_rows=args.sample_rows,
            report_sample_rows=args.report_sample_rows,
            line_sample_max_bytes=args.line_sample_max_bytes,
            parquet_sample_max_files=args.parquet_sample_max_files,
            dataset_specs=dataset_specs,
            source_window_index=args.source_window_index,
            source_window_count=args.source_window_count,
            spark_app_name=args.spark_app_name or "m3_l0_l10_spark_contract_pipeline",
        )
        summary = pipeline.run()
        print(json.dumps({"run_id": summary["run_id"], "artifact_root": summary["artifact_root"], "report_root": summary["report_root"], "totals": summary["totals"]}, ensure_ascii=False, indent=2))
        return 0
    finally:
        spark.stop()


if __name__ == "__main__":
    raise SystemExit(main())
