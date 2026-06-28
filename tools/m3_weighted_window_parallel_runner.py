#!/usr/bin/env python3
"""Run M3 L0-L10 contract validation as weighted parallel Spark applications.

This is validation/orchestration evidence only. It must not add Docker, notebook,
or local execution concerns into the L0-L10 M3 contract artifacts.
"""

from __future__ import annotations

import argparse
import html
import json
import os
import subprocess
import sys
import time
import urllib.request
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from m3_l0_l6_spark_contract_pipeline import (
    DATASETS,
    DEFAULT_ARTIFACT_ROOT,
    DEFAULT_RAW_MANIFEST,
    DEFAULT_REPORT_ROOT,
    DEFAULT_S3_ENV,
    DatasetSpec,
    load_raw_manifest,
)


REPO_ROOT = Path(__file__).resolve().parents[1]
PIPELINE = REPO_ROOT / "tools" / "m3_l0_l10_spark_contract_pipeline.py"
CURRENT_STATUS_MD = DEFAULT_REPORT_ROOT / "v2.1.1-current-status.md"
CURRENT_STATUS_HTML = DEFAULT_REPORT_ROOT / "v2.1.1-current-status.html"


LAYER_MAP: list[dict[str, str]] = [
    {"layer": "L0", "title": "Raw preservation contract", "m3_scope": "raw object manifest, source_unit_id, checksum, replay window reference"},
    {"layer": "L1", "title": "Bronze envelope contract", "m3_scope": "bounded sample envelope, source locator, rescue lane, parse evidence"},
    {"layer": "L2", "title": "Profile and schema snapshot", "m3_scope": "CSV/JSON/Parquet profile, schema fingerprint, type/path statistics"},
    {"layer": "L3", "title": "AI-assisted recommendation", "m3_scope": "bounded AI input pack, cleaning policy recommendation, Silver/Gold recommendation draft"},
    {"layer": "L4", "title": "Deterministic transform spec", "m3_scope": "editable Silver transform spec, Gold generation spec, preview-only validation result"},
    {"layer": "L5", "title": "Quality and approval gate", "m3_scope": "quality scorecard, drift/quarantine checks, approval_state, recommendation diff"},
    {"layer": "L6", "title": "Compiler and handoff contract", "m3_scope": "deterministic compiler package, operation params schema, unsupported action report, PII/query validator"},
    {"layer": "L7", "title": "Silver preview readiness", "m3_scope": "Silver structural axis and imported preview-result contract for M2 handoff validation"},
    {"layer": "L8", "title": "Gold semantic readiness", "m3_scope": "Gold preview contract, grain/metric readiness, owner-review caveats"},
    {"layer": "L9", "title": "Three-axis gate", "m3_scope": "processing_quality, catalog_safety, gold_readiness precedence and M6 context status"},
    {"layer": "L10", "title": "Catalog sync package", "m3_scope": "artifact reference resolution, catalog sync package, M1/M2/M5/M6 payload contracts"},
]

WINDOWS_BY_DATASET = {
    "amazon_clothing_metadata_jsonl": 8,
    "amazon_clothing_reviews_jsonl": 6,
    "taobao_user_events_jsonl": 6,
    "nyc_taxi_yellow_parquet": 3,
    "nyc_taxi_2019_oct_csv": 1,
}

SHORT_NAMES = {
    "amazon_clothing_metadata_jsonl": "amazon_metadata",
    "amazon_clothing_reviews_jsonl": "amazon_reviews",
    "taobao_user_events_jsonl": "taobao_events",
    "nyc_taxi_yellow_parquet": "taxi_parquet",
    "nyc_taxi_2019_oct_csv": "taxi_csv",
}

REQUIRED_ARTIFACTS = [
    "l0/source_unit_manifest.json",
    "l1/sample_provenance_check.json",
    "l2/profile_snapshot.json",
    "l3/ai_recommendation_input_pack.json",
    "l3/bronze_to_silver_recommendation.json",
    "l3/silver_to_gold_recommendation.json",
    "l4/silver_transform_spec.json",
    "l4/gold_generation_spec.json",
    "l5/transformation_quality_scorecard.json",
    "l5/approval_state.json",
    "l6/compiler_validation_result.json",
    "l6/operation_params_schema.json",
    "l7/silver_structural_axis.json",
    "l8/gold_semantic_readiness_axis.json",
    "l9/gate_summary.json",
    "l10/catalog_sync_contract_package.json",
    "l10/module_integration_contract.json",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def local_stamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, value: Any) -> None:
    ensure_dir(path.parent)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8")


def write_text(path: Path, value: str) -> None:
    ensure_dir(path.parent)
    path.write_text(value, encoding="utf-8", newline="\n")


def read_json(path: Path) -> Any | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def dataset_bytes(raw_manifest: list[dict[str, Any]], dataset: DatasetSpec) -> int:
    prefix = dataset.raw_key_prefix.rstrip("/")
    if dataset.raw_key_prefix.endswith("/"):
        return sum(int(row.get("size") or 0) for row in raw_manifest if str(row.get("key", "")).startswith(prefix + "/"))
    return sum(
        int(row.get("size") or 0)
        for row in raw_manifest
        if str(row.get("key", "")) == prefix or str(row.get("key", "")).startswith(prefix + "/")
    )


def fetch_spark_cluster(url: str) -> dict[str, Any]:
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            data = json.loads(response.read().decode("utf-8"))
        return {
            "status": data.get("status"),
            "aliveworkers": data.get("aliveworkers"),
            "cores": data.get("cores"),
            "memory": data.get("memory"),
            "activeapps": data.get("activeapps", []),
            "completedapps": data.get("completedapps", []),
        }
    except Exception as exc:
        return {"status": "unavailable", "error": str(exc), "activeapps": [], "completedapps": []}


@dataclass
class Task:
    dataset_key: str
    display_name: str
    format_family: str
    short_name: str
    source_bytes: int
    window_index: int
    window_count: int
    run_id: str
    task_id: str
    spark_app_name: str
    report_root: Path
    stdout_log: Path
    stderr_log: Path
    estimated_work: float
    state: str = "queued"
    exit_code: int | None = None
    pid: int | None = None
    started_at: str | None = None
    ended_at: str | None = None
    elapsed_seconds: float | None = None
    process: subprocess.Popen[bytes] | None = field(default=None, repr=False)
    run_summary: dict[str, Any] | None = None
    last_progress: dict[str, Any] | None = None
    validation: dict[str, Any] | None = None

    @property
    def artifact_run_root(self) -> Path:
        return DEFAULT_ARTIFACT_ROOT / self.run_id

    @property
    def dataset_artifact_root(self) -> Path:
        return self.artifact_run_root / self.dataset_key

    def result_payload(self) -> dict[str, Any]:
        return {
            "task_id": self.task_id,
            "dataset_key": self.dataset_key,
            "display_name": self.display_name,
            "format_family": self.format_family,
            "source_bytes": self.source_bytes,
            "window_index": self.window_index,
            "window_count": self.window_count,
            "run_id": self.run_id,
            "spark_app_name": self.spark_app_name,
            "state": self.state,
            "exit_code": self.exit_code,
            "pid": self.pid,
            "started_at": self.started_at,
            "ended_at": self.ended_at,
            "elapsed_seconds": self.elapsed_seconds,
            "estimated_work": self.estimated_work,
            "stdout_log": str(self.stdout_log),
            "stderr_log": str(self.stderr_log),
            "artifact_root": str(self.artifact_run_root),
            "report_root": str(self.report_root),
            "last_progress": self.last_progress,
            "run_summary": self.run_summary,
            "validation": self.validation,
        }


def build_tasks(args: argparse.Namespace, raw_manifest: list[dict[str, Any]]) -> list[Task]:
    stamp = args.run_stamp or local_stamp()
    selected = {item.strip() for item in args.dataset_keys.split(",") if item.strip()} if args.dataset_keys else {d.key for d in DATASETS}
    tasks: list[Task] = []
    for dataset in DATASETS:
        if dataset.key not in selected:
            continue
        source_bytes = dataset_bytes(raw_manifest, dataset)
        window_count = WINDOWS_BY_DATASET.get(dataset.key, 1)
        short_name = SHORT_NAMES.get(dataset.key, dataset.key)
        for index in range(window_count):
            run_id = f"run_{stamp}_m3_v211_l0_l10_100gb_{short_name}_window_{index + 1:04d}_of_{window_count:04d}"
            task_id = f"M3-L0-L10::{dataset.key}::source-window-{index + 1:04d}-of-{window_count:04d}"
            spark_app_name = f"M3_v2_1_1_L0_L10_contract_{short_name}_window_{index + 1:04d}_of_{window_count:04d}"
            report_root = args.output_root / "task-reports" / run_id
            stdout_log = args.output_root / "stdout" / f"{run_id}.stdout.log"
            stderr_log = args.output_root / "stderr" / f"{run_id}.stderr.log"
            estimated_work = source_bytes / max(window_count, 1)
            if dataset.format_family == "jsonl":
                estimated_work *= 1.35
            if dataset.key == "amazon_clothing_metadata_jsonl":
                estimated_work *= 1.8
            tasks.append(
                Task(
                    dataset_key=dataset.key,
                    display_name=dataset.display_name,
                    format_family=dataset.format_family,
                    short_name=short_name,
                    source_bytes=source_bytes,
                    window_index=index,
                    window_count=window_count,
                    run_id=run_id,
                    task_id=task_id,
                    spark_app_name=spark_app_name,
                    report_root=report_root,
                    stdout_log=stdout_log,
                    stderr_log=stderr_log,
                    estimated_work=estimated_work,
                )
            )
    return sorted(tasks, key=lambda item: item.estimated_work, reverse=True)


def task_command(task: Task, args: argparse.Namespace) -> list[str]:
    return [
        sys.executable,
        str(PIPELINE),
        "--master",
        args.master,
        "--driver-host",
        args.driver_host,
        "--sample-rows",
        str(args.sample_rows),
        "--report-sample-rows",
        str(args.report_sample_rows),
        "--line-sample-max-bytes",
        str(args.line_sample_max_bytes),
        "--parquet-sample-max-files",
        str(args.parquet_sample_max_files),
        "--run-id",
        task.run_id,
        "--spark-app-name",
        task.spark_app_name,
        "--dataset-keys",
        task.dataset_key,
        "--source-window-index",
        str(task.window_index),
        "--source-window-count",
        str(task.window_count),
        "--driver-memory",
        args.driver_memory,
        "--executor-memory",
        args.executor_memory,
        "--executor-cores",
        str(args.executor_cores),
        "--spark-cores-max",
        str(args.spark_cores_max),
        "--shuffle-partitions",
        str(args.shuffle_partitions),
        "--s3-env",
        str(args.s3_env),
        "--raw-manifest",
        str(args.raw_manifest),
        "--artifact-root",
        str(args.artifact_root),
        "--report-root",
        str(task.report_root),
    ]


def start_task(task: Task, args: argparse.Namespace) -> None:
    ensure_dir(task.stdout_log.parent)
    ensure_dir(task.stderr_log.parent)
    ensure_dir(task.report_root)
    stdout_handle = task.stdout_log.open("wb")
    stderr_handle = task.stderr_log.open("wb")
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    proc = subprocess.Popen(
        task_command(task, args),
        cwd=str(REPO_ROOT),
        stdout=stdout_handle,
        stderr=stderr_handle,
        env=env,
    )
    stdout_handle.close()
    stderr_handle.close()
    task.process = proc
    task.pid = proc.pid
    task.state = "running"
    task.started_at = utc_now()
    task._started_perf = time.perf_counter()  # type: ignore[attr-defined]


def refresh_task(task: Task) -> None:
    progress = read_json(task.artifact_run_root / "run_progress.json")
    if progress:
        task.last_progress = progress
    if task.process is None:
        return
    code = task.process.poll()
    if code is None:
        if hasattr(task, "_started_perf"):
            task.elapsed_seconds = round(time.perf_counter() - task._started_perf, 3)  # type: ignore[attr-defined]
        return
    task.exit_code = code
    task.state = "completed" if code == 0 else "failed"
    task.ended_at = utc_now()
    if hasattr(task, "_started_perf"):
        task.elapsed_seconds = round(time.perf_counter() - task._started_perf, 3)  # type: ignore[attr-defined]
    summary = read_json(task.artifact_run_root / "run_summary.json")
    if summary:
        task.run_summary = summary
    task.validation = validate_task_artifacts(task)
    task.process = None


def validate_task_artifacts(task: Task) -> dict[str, Any]:
    missing = []
    for rel_path in REQUIRED_ARTIFACTS:
        if not (task.dataset_artifact_root / rel_path).exists():
            missing.append(rel_path)
    summary = read_json(task.artifact_run_root / "run_summary.json") or {}
    dataset_summary = (summary.get("datasets") or {}).get(task.dataset_key, {})
    checks = {
        "required_artifacts_present": "pass" if not missing else "block",
        "processing_quality": dataset_summary.get("processing_quality_status", "unknown"),
        "sample_provenance": dataset_summary.get("sample_provenance_status", "unknown"),
        "transformation_quality": dataset_summary.get("transformation_quality_status", "unknown"),
        "context_consistency": dataset_summary.get("l10_consistency_status", "unknown"),
    }
    status = "pass"
    if missing or task.exit_code != 0:
        status = "block"
    elif any(value in {"fail", "block"} for value in checks.values()):
        status = "block"
    elif any(value in {"warn", "unknown"} for value in checks.values()):
        status = "warn"
    return {"status": status, "checks": checks, "missing_artifacts": missing}


def active_app_count(tasks: list[Task]) -> int:
    return sum(1 for task in tasks if task.state == "running")


def merge_summary(tasks: list[Task], args: argparse.Namespace, started_perf: float, cluster_before: dict[str, Any], cluster_after: dict[str, Any]) -> dict[str, Any]:
    dataset_source_bytes: dict[str, int] = {}
    dataset_windows: dict[str, int] = {}
    totals = {
        "distinct_l0_source_bytes": 0,
        "window_count": len(tasks),
        "completed_count": 0,
        "failed_count": 0,
        "spark_sample_rows": 0,
        "silver_preview_rows": 0,
        "gold_preview_rows": 0,
        "sample_input_bytes": 0,
        "processing_pass_count": 0,
        "processing_fail_count": 0,
        "catalog_warn_count": 0,
        "gold_ready_count": 0,
        "gold_review_count": 0,
    }
    per_dataset: dict[str, dict[str, Any]] = {}
    task_rows = []
    sequential_seconds = 0.0
    for task in tasks:
        dataset_source_bytes[task.dataset_key] = task.source_bytes
        dataset_windows[task.dataset_key] = task.window_count
        if task.elapsed_seconds:
            sequential_seconds += task.elapsed_seconds
        if task.state == "completed":
            totals["completed_count"] += 1
        if task.state == "failed":
            totals["failed_count"] += 1
        summary = task.run_summary or {}
        run_totals = summary.get("totals") or {}
        totals["spark_sample_rows"] += int(run_totals.get("spark_sample_rows") or 0)
        totals["silver_preview_rows"] += int(run_totals.get("silver_preview_rows") or 0)
        totals["gold_preview_rows"] += int(run_totals.get("gold_preview_rows") or 0)
        totals["sample_input_bytes"] += int(run_totals.get("sample_input_bytes") or 0)
        totals["processing_pass_count"] += int(run_totals.get("processing_pass_count") or 0)
        totals["processing_fail_count"] += int(run_totals.get("processing_fail_count") or 0)
        totals["catalog_warn_count"] += int(run_totals.get("catalog_warn_count") or 0)
        totals["gold_ready_count"] += int(run_totals.get("gold_ready_count") or 0)
        totals["gold_review_count"] += int(run_totals.get("gold_review_count") or 0)
        ds = (summary.get("datasets") or {}).get(task.dataset_key, {})
        row = {
            "task_id": task.task_id,
            "dataset_key": task.dataset_key,
            "display_name": task.display_name,
            "window": f"{task.window_index + 1}/{task.window_count}",
            "state": task.state,
            "exit_code": task.exit_code,
            "elapsed_seconds": task.elapsed_seconds,
            "spark_app_name": task.spark_app_name,
            "spark_application_id": (summary.get("spark") or {}).get("application_id"),
            "current_layer": (task.last_progress or {}).get("current_layer"),
            "current_operation": (task.last_progress or {}).get("current_operation"),
            "sample_rows": ds.get("sample_rows"),
            "sample_input_bytes": ds.get("sample_input_bytes"),
            "quality_score": ds.get("transformation_quality_score"),
            "quality_status": ds.get("transformation_quality_status"),
            "silver_context_status": ds.get("silver_context_status"),
            "gold_readiness_status": ds.get("gold_readiness_status"),
            "m6_context_status": ds.get("m6_context_status"),
            "validation_status": (task.validation or {}).get("status"),
        }
        task_rows.append(row)
        bucket = per_dataset.setdefault(
            task.dataset_key,
            {
                "display_name": task.display_name,
                "format_family": task.format_family,
                "source_bytes": task.source_bytes,
                "window_count": task.window_count,
                "completed_windows": 0,
                "failed_windows": 0,
                "sample_rows": 0,
                "sample_input_bytes": 0,
                "quality_scores": [],
                "statuses": {},
            },
        )
        if task.state == "completed":
            bucket["completed_windows"] += 1
        if task.state == "failed":
            bucket["failed_windows"] += 1
        bucket["sample_rows"] += int(ds.get("sample_rows") or 0)
        bucket["sample_input_bytes"] += int(ds.get("sample_input_bytes") or 0)
        if ds.get("transformation_quality_score") is not None:
            bucket["quality_scores"].append(float(ds["transformation_quality_score"]))
        for key in ["processing_quality_status", "catalog_safety_status", "gold_readiness_status", "m6_context_status"]:
            if ds.get(key):
                bucket["statuses"].setdefault(key, {})
                bucket["statuses"][key][str(ds[key])] = bucket["statuses"][key].get(str(ds[key]), 0) + 1
    for value in per_dataset.values():
        scores = value.pop("quality_scores")
        value["avg_quality_score"] = round(sum(scores) / len(scores), 2) if scores else None
    totals["distinct_l0_source_bytes"] = sum(dataset_source_bytes.values())
    wall_seconds = round(time.perf_counter() - started_perf, 3)
    speedup = round(sequential_seconds / wall_seconds, 2) if wall_seconds > 0 else None
    validation_status = "running"
    if totals["completed_count"] + totals["failed_count"] < len(tasks):
        validation_status = "running"
    elif totals["failed_count"] or totals["processing_fail_count"]:
        validation_status = "block"
    elif totals["catalog_warn_count"] or totals["gold_review_count"]:
        validation_status = "warn"
    else:
        validation_status = "pass"
    return {
        "run_name": args.run_name,
        "created_at": utc_now(),
        "output_root": str(args.output_root),
        "strategy": {
            "name": "weighted_window_parallel_spark_applications",
            "parallelism": args.max_parallel_apps,
            "cores_per_app": args.spark_cores_max,
            "executor_cores": args.executor_cores,
            "reason": "large/expensive sources are split into more source windows; free slots start the next queued M3 L0-L10 validation task automatically",
            "m3_scope_boundary": "Docker/notebook/local Spark is validation infrastructure only. L0-L10 artifacts remain M3 contract artifacts.",
        },
        "cluster_before": cluster_before,
        "cluster_after": cluster_after,
        "elapsed_seconds": wall_seconds,
        "sequential_task_seconds": round(sequential_seconds, 3),
        "observed_parallel_speedup": speedup,
        "validation_status": validation_status,
        "totals": totals,
        "datasets": per_dataset,
        "tasks": task_rows,
        "layers": LAYER_MAP,
    }


def render_html(summary: dict[str, Any], tasks: list[Task]) -> str:
    def td(value: Any) -> str:
        return f"<td>{html.escape('' if value is None else str(value))}</td>"

    task_rows = []
    for row in summary["tasks"]:
        task_rows.append(
            "<tr>"
            + td(row["state"])
            + td(row["dataset_key"])
            + td(row["window"])
            + td(row["current_layer"])
            + td(row["current_operation"])
            + td(row["elapsed_seconds"])
            + td(row["sample_rows"])
            + td(row["quality_score"])
            + td(row["validation_status"])
            + td(row["spark_application_id"])
            + "</tr>"
        )
    layer_rows = []
    for item in LAYER_MAP:
        layer_rows.append(
            "<tr>"
            + td(item["layer"])
            + td(item["title"])
            + td(item["m3_scope"])
            + td("contract artifact generation/validation only")
            + "</tr>"
        )
    dataset_rows = []
    for key, value in summary["datasets"].items():
        dataset_rows.append(
            "<tr>"
            + td(key)
            + td(value["display_name"])
            + td(value["window_count"])
            + td(value["completed_windows"])
            + td(value["failed_windows"])
            + td(value["source_bytes"])
            + td(value["sample_rows"])
            + td(value["sample_input_bytes"])
            + td(value["avg_quality_score"])
            + td(json.dumps(value["statuses"], ensure_ascii=False))
            + "</tr>"
        )
    totals = summary["totals"]
    status_class = "ok" if summary["validation_status"] == "pass" else ("warn" if summary["validation_status"] in {"warn", "running"} else "bad")
    return f"""<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="15">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>M3 v2.1.1 weighted window parallel status</title>
  <style>
    body {{ margin:0; background:#f4f6f8; color:#17202a; font-family:Arial,'Malgun Gothic',sans-serif; }}
    main {{ max-width:1500px; margin:0 auto; padding:24px; }}
    header, section {{ background:#fff; border:1px solid #d8dee8; border-radius:8px; padding:18px; margin-bottom:14px; }}
    h1, h2 {{ margin-top:0; }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:10px; }}
    .metric {{ border:1px solid #d8dee8; border-radius:8px; padding:12px; background:#fbfcfe; }}
    .metric strong {{ display:block; font-size:24px; margin-bottom:4px; }}
    table {{ width:100%; border-collapse:collapse; font-size:13px; }}
    th, td {{ border:1px solid #d8dee8; padding:7px 8px; vertical-align:top; }}
    th {{ background:#eef2f6; position:sticky; top:0; }}
    code {{ background:#eef2f6; padding:2px 4px; border-radius:4px; }}
    .ok {{ color:#146c43; font-weight:700; }}
    .warn {{ color:#9a6700; font-weight:700; }}
    .bad {{ color:#b42318; font-weight:700; }}
    .note {{ color:#52606d; }}
  </style>
</head>
<body>
<main>
  <header>
    <h1>M3 v2.1.1 weighted window parallel validation</h1>
    <p>상태: <span class="{status_class}">{html.escape(summary["validation_status"])}</span> / run: <code>{html.escape(summary["run_name"])}</code></p>
    <p class="note">이 화면은 검증/오케스트레이션 보드다. Docker Spark, notebook worker, local Spark 정보는 L0-L10 계약 artifact 안에 넣지 않고 여기에서만 추적한다.</p>
    <p>출력 위치: <code>{html.escape(summary["output_root"])}</code></p>
  </header>
  <section>
    <h2>핵심 수치</h2>
    <div class="grid">
      <div class="metric"><strong>{totals["distinct_l0_source_bytes"]:,}</strong>distinct raw bytes</div>
      <div class="metric"><strong>{totals["window_count"]}</strong>weighted source windows</div>
      <div class="metric"><strong>{totals["completed_count"]}/{totals["failed_count"]}</strong>completed/failed</div>
      <div class="metric"><strong>{summary["elapsed_seconds"]}</strong>wall seconds</div>
      <div class="metric"><strong>{summary["sequential_task_seconds"]}</strong>sum task seconds</div>
      <div class="metric"><strong>{summary["observed_parallel_speedup"]}</strong>observed speedup</div>
      <div class="metric"><strong>{totals["spark_sample_rows"]:,}</strong>Spark sample rows</div>
      <div class="metric"><strong>{totals["sample_input_bytes"]:,}</strong>sample input bytes</div>
    </div>
  </section>
  <section>
    <h2>L0-L10에서 지금 하는 일</h2>
    <table><thead><tr><th>Layer</th><th>Title</th><th>M3 contract scope</th><th>Boundary</th></tr></thead><tbody>{''.join(layer_rows)}</tbody></table>
  </section>
  <section>
    <h2>데이터별 병렬 분할 결과</h2>
    <table><thead><tr><th>Dataset</th><th>Name</th><th>Windows</th><th>Done</th><th>Failed</th><th>Raw bytes</th><th>Sample rows</th><th>Sample bytes</th><th>Avg quality</th><th>Status counts</th></tr></thead><tbody>{''.join(dataset_rows)}</tbody></table>
  </section>
  <section>
    <h2>작업별 상태</h2>
    <table><thead><tr><th>State</th><th>Dataset</th><th>Window</th><th>Current L</th><th>Current work</th><th>Seconds</th><th>Rows</th><th>Quality</th><th>Validation</th><th>Spark app id</th></tr></thead><tbody>{''.join(task_rows)}</tbody></table>
  </section>
</main>
</body>
</html>
"""


def render_markdown(summary: dict[str, Any]) -> str:
    lines = [
        "# M3 v2.1.1 weighted window parallel validation",
        "",
        f"- Status: `{summary['validation_status']}`",
        f"- Run: `{summary['run_name']}`",
        f"- Output root: `{summary['output_root']}`",
        f"- Distinct raw bytes: `{summary['totals']['distinct_l0_source_bytes']}`",
        f"- Weighted windows: `{summary['totals']['window_count']}`",
        f"- Completed/failed: `{summary['totals']['completed_count']}/{summary['totals']['failed_count']}`",
        f"- Wall seconds: `{summary['elapsed_seconds']}`",
        f"- Sum task seconds: `{summary['sequential_task_seconds']}`",
        f"- Observed speedup: `{summary['observed_parallel_speedup']}`",
        "",
        "## Scope boundary",
        "",
        "Docker Spark, notebook workers, and local Spark are validation infrastructure only. They are not written into L0-L10 as product responsibility. L0-L10 remains the M3 contract path: profile, recommendation, deterministic spec, quality/catalog handoff.",
        "",
        "## L0-L10 stage map",
        "",
        "| Layer | Title | M3 scope |",
        "| --- | --- | --- |",
    ]
    for item in LAYER_MAP:
        lines.append(f"| `{item['layer']}` | {item['title']} | {item['m3_scope']} |")
    lines.extend(["", "## Dataset summary", "", "| Dataset | Windows | Completed | Failed | Raw bytes | Sample rows | Sample bytes | Avg quality |", "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"])
    for key, value in summary["datasets"].items():
        lines.append(
            f"| `{key}` | {value['window_count']} | {value['completed_windows']} | {value['failed_windows']} | "
            f"{value['source_bytes']} | {value['sample_rows']} | {value['sample_input_bytes']} | {value['avg_quality_score']} |"
        )
    lines.extend(["", "## Task summary", "", "| State | Dataset | Window | Layer | Seconds | Rows | Quality | Validation | Spark app |", "| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |"])
    for row in summary["tasks"]:
        lines.append(
            f"| `{row['state']}` | `{row['dataset_key']}` | `{row['window']}` | `{row['current_layer']}` | "
            f"{row['elapsed_seconds']} | {row['sample_rows']} | {row['quality_score']} | `{row['validation_status']}` | `{row['spark_application_id']}` |"
        )
    return "\n".join(lines) + "\n"


def write_status_files(args: argparse.Namespace, tasks: list[Task], started_perf: float, cluster_before: dict[str, Any]) -> dict[str, Any]:
    cluster_now = fetch_spark_cluster(args.spark_ui_json)
    summary = merge_summary(tasks, args, started_perf, cluster_before, cluster_now)
    write_json(args.output_root / "weighted_window_parallel_summary.json", summary)
    write_text(args.output_root / "summary.md", render_markdown(summary))
    html_text = render_html(summary, tasks)
    write_text(args.output_root / "index.html", html_text)
    write_text(CURRENT_STATUS_MD, render_markdown(summary))
    write_text(CURRENT_STATUS_HTML, html_text)
    for task in tasks:
        write_json(args.output_root / "task-results" / f"{task.run_id}.json", task.result_payload())
    return summary


def run(args: argparse.Namespace) -> int:
    ensure_dir(args.output_root)
    raw_manifest = load_raw_manifest(args.raw_manifest)
    tasks = build_tasks(args, raw_manifest)
    write_json(args.output_root / "task-plan.json", {"created_at": utc_now(), "tasks": [task.result_payload() for task in tasks], "layers": LAYER_MAP})
    cluster_before = fetch_spark_cluster(args.spark_ui_json)
    started_perf = time.perf_counter()
    write_status_files(args, tasks, started_perf, cluster_before)
    queue = list(tasks)
    running: list[Task] = []
    while queue or running:
        while queue and len(running) < args.max_parallel_apps:
            task = queue.pop(0)
            start_task(task, args)
            running.append(task)
        for task in list(running):
            refresh_task(task)
            if task.state in {"completed", "failed"}:
                running.remove(task)
        write_status_files(args, tasks, started_perf, cluster_before)
        if queue or running:
            time.sleep(args.poll_seconds)
    final_summary = write_status_files(args, tasks, started_perf, cluster_before)
    print(json.dumps({"run_name": args.run_name, "output_root": str(args.output_root), "status": final_summary["validation_status"], "totals": final_summary["totals"]}, ensure_ascii=False, indent=2))
    return 0 if final_summary["validation_status"] in {"pass", "warn"} else 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    stamp = local_stamp()
    parser.add_argument("--run-stamp", default=stamp)
    parser.add_argument("--run-name", default=f"m3_v211_l0_l10_weighted_window_parallel_100gb_{stamp}")
    parser.add_argument("--master", default="spark://172.21.102.126:7077")
    parser.add_argument("--driver-host", default="172.21.102.126")
    parser.add_argument("--spark-ui-json", default="http://172.21.102.126:8080/json/")
    parser.add_argument("--max-parallel-apps", type=int, default=5)
    parser.add_argument("--sample-rows", type=int, default=50_000)
    parser.add_argument("--report-sample-rows", type=int, default=100)
    parser.add_argument("--line-sample-max-bytes", type=int, default=192 * 1024 * 1024)
    parser.add_argument("--parquet-sample-max-files", type=int, default=4)
    parser.add_argument("--driver-memory", default="4g")
    parser.add_argument("--executor-memory", default="3g")
    parser.add_argument("--executor-cores", type=int, default=4)
    parser.add_argument("--spark-cores-max", type=int, default=4)
    parser.add_argument("--shuffle-partitions", type=int, default=8)
    parser.add_argument("--poll-seconds", type=int, default=10)
    parser.add_argument("--dataset-keys", default=None)
    parser.add_argument("--s3-env", type=Path, default=DEFAULT_S3_ENV)
    parser.add_argument("--raw-manifest", type=Path, default=DEFAULT_RAW_MANIFEST)
    parser.add_argument("--artifact-root", type=Path, default=DEFAULT_ARTIFACT_ROOT)
    parser.add_argument("--output-root", type=Path, default=DEFAULT_REPORT_ROOT / "v2.1.1-weighted-window-parallel-100gb")
    return parser.parse_args()


def main() -> int:
    return run(parse_args())


if __name__ == "__main__":
    raise SystemExit(main())
