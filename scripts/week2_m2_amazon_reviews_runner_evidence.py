#!/usr/bin/env python3
"""Amazon Reviews JSONL을 M2 runner에 넣어 Parquet 증거를 만드는 CLI."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.domain.runtime_config import RuntimeConfig  # noqa: E402
from app.services.week2_spark_runner import Week2SparkRunner  # noqa: E402


# M3/M5가 Amazon Reviews 계열 입력으로 기대하는 최소 review row 필드다.
REQUIRED_REVIEW_FIELDS = [
    "review_id",
    "product_id",
    "rating",
    "review_text",
    "review_time",
    "verified_purchase",
]


def run_evidence(
    input_path: Path,
    output_root: Path,
    run_id: str,
    compression: str = "snappy",
) -> dict[str, Any]:
    """입력 검증, runner 실행, 결과 요약을 한 번에 묶는 중심 함수."""

    resolved_input = resolve_repo_path(input_path)
    resolved_output_root = resolve_repo_path(output_root)
    input_summary = summarize_amazon_reviews_jsonl(resolved_input)
    base_evidence: dict[str, Any] = {
        "status": "pending",
        "run_id": run_id,
        "input": input_summary,
        "runner": {
            "name": "spark_runner",
            "implementation": "Week2SparkRunner",
            "runtime_note": "local pyarrow Parquet smoke; real Spark cluster wiring is a later replacement.",
        },
        "output": {
            "format": "parquet",
            "root": str(resolved_output_root),
        },
    }

    if not input_summary["required_fields_present"]:
        base_evidence["status"] = "failed"
        base_evidence["error"] = "Amazon Reviews JSONL required fields are missing."
        return base_evidence

    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(resolved_input),
        output_format="parquet",
        output_root=str(resolved_output_root),
        options={"compression": compression},
    )
    result = Week2SparkRunner().run(runtime_config, run_id=run_id)

    base_evidence["status"] = result.status
    base_evidence["metrics"] = {
        "input_bytes": result.bytes,
        "duration_ms": result.duration_ms,
    }
    base_evidence["output"].update(
        {
            "path": result.output_path,
            "row_count": result.output_row_count,
            "bytes": result.output_bytes,
        }
    )
    base_evidence["task_results"] = result.task_results
    base_evidence["logs"] = result.logs
    return base_evidence


def summarize_amazon_reviews_jsonl(path: Path) -> dict[str, Any]:
    """JSONL 각 줄이 Amazon Reviews 최소 필드를 갖는지 세고 누락을 기록한다."""

    if not path.exists():
        raise FileNotFoundError(f"Input file not found: {path}")

    row_count = 0
    bad_row_count = 0
    missing_required_fields: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as source_file:
        for line_number, line in enumerate(source_file, start=1):
            if not line.strip():
                continue
            row_count += 1
            row = json.loads(line)
            if not isinstance(row, dict):
                raise ValueError(f"JSONL row must be an object at line {line_number}")
            missing = [field for field in REQUIRED_REVIEW_FIELDS if field not in row]
            if missing:
                bad_row_count += 1
                if len(missing_required_fields) < 10:
                    missing_required_fields.append(
                        {
                            "line_number": line_number,
                            "missing_fields": missing,
                        }
                    )

    return {
        "path": str(path),
        "format": "jsonl",
        "logical_shape": "amazon_reviews_json",
        "row_count": row_count,
        "required_fields": REQUIRED_REVIEW_FIELDS,
        "required_fields_present": row_count > 0 and bad_row_count == 0,
        "bad_row_count": bad_row_count,
        "missing_required_fields": missing_required_fields,
    }


def resolve_repo_path(path: Path) -> Path:
    """상대 경로를 repository root 기준 절대 경로로 바꾼다."""

    return path if path.is_absolute() else REPO_ROOT / path


def write_summary(path: Path, evidence: dict[str, Any]) -> None:
    """실행 evidence JSON을 파일로 저장한다."""

    resolved_path = resolve_repo_path(path)
    resolved_path.parent.mkdir(parents=True, exist_ok=True)
    resolved_path.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    """터미널에서 받을 input/output/run option을 정의한다."""

    parser = argparse.ArgumentParser(description="Run M2 Amazon Reviews JSONL runner evidence.")
    parser.add_argument(
        "--input",
        type=Path,
        default=Path(os.environ.get("ASKLAKE_AMAZON_REVIEWS_JSONL", "backend/samples/amazon_reviews_demo.jsonl")),
        help="Amazon Reviews JSONL path. Defaults to backend/samples/amazon_reviews_demo.jsonl.",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path(os.environ.get("ASKLAKE_M2_OUTPUT_ROOT", "data/results/m2_amazon_reviews_runner_evidence")),
        help="Directory where Parquet output is written. Defaults to ignored data/results path.",
    )
    parser.add_argument("--run-id", default="run_m2_amazon_reviews_evidence_001")
    parser.add_argument("--compression", default="snappy")
    parser.add_argument("--summary-path", type=Path, default=None)
    return parser.parse_args()


def main() -> int:
    """CLI entry point: evidence를 실행하고 성공 여부를 exit code로 돌려준다."""

    args = parse_args()
    try:
        evidence = run_evidence(
            input_path=args.input,
            output_root=args.output_root,
            run_id=args.run_id,
            compression=args.compression,
        )
    except Exception as error:
        evidence = {
            "status": "failed",
            "error": str(error),
            "input": {"path": str(resolve_repo_path(args.input))},
        }

    if args.summary_path is not None:
        write_summary(args.summary_path, evidence)
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    return 0 if evidence.get("status") == "succeeded" else 1


if __name__ == "__main__":
    raise SystemExit(main())
