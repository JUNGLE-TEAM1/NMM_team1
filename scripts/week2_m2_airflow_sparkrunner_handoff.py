#!/usr/bin/env python3
"""Airflow DAG가 M2 SparkRunner를 호출할 때 쓸 result artifact를 만든다."""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.domain.runtime_config import RuntimeConfig  # noqa: E402
from app.services.week2_local_runner import Week2RunnerResult  # noqa: E402
from app.services.week2_spark_runner import Week2SparkRunner  # noqa: E402


DEFAULT_RUNTIME_CONFIG_PATH = Path("contracts/runtime_config.sample.json")
DEFAULT_RUNTIME_PROFILE = "spark_runner_smoke"


def run_handoff(args: argparse.Namespace) -> dict[str, Any]:
    """RuntimeConfig를 SparkRunner에 넘기고 M5 Airflow adapter가 읽는 artifact를 저장한다."""

    runtime_config = load_runtime_config(
        args.runtime_config_path,
        runtime_profile=args.runtime_profile,
        output_root=args.output_root,
    )
    result = Week2SparkRunner().run(runtime_config, run_id=args.run_id)
    artifact = build_airflow_result_artifact(args.run_id, result)
    write_json(resolve_result_path(args.result_path, args.run_id), artifact)
    return artifact


def load_runtime_config(
    runtime_config_path: Path,
    runtime_profile: str | None,
    output_root: Path | None,
) -> RuntimeConfig:
    """직접 RuntimeConfig JSON 또는 `contracts/runtime_config.sample.json`의 profile을 읽는다."""

    payload = read_json(resolve_repo_path(runtime_config_path))
    raw_config = runtime_profile_payload(payload, runtime_profile)
    if output_root is not None:
        raw_config = with_output_root(raw_config, output_root)
    return RuntimeConfig.model_validate(raw_config)


def runtime_profile_payload(payload: dict[str, Any], runtime_profile: str | None) -> dict[str, Any]:
    """sample fixture 안 profile 또는 직접 RuntimeConfig payload를 선택한다."""

    if runtime_profile and runtime_profile in payload:
        profile_payload = payload[runtime_profile]
        if not isinstance(profile_payload, dict):
            raise ValueError(f"Runtime profile must be an object: {runtime_profile}")
        return profile_payload
    if payload.get("contract") == "RuntimeConfig" and runtime_profile:
        raise ValueError(f"Runtime profile not found in RuntimeConfig fixture: {runtime_profile}")
    return payload


def with_output_root(raw_config: dict[str, Any], output_root: Path) -> dict[str, Any]:
    """Airflow shared volume에 맞춰 runner output root를 덮어쓴다."""

    updated = dict(raw_config)
    updated["output_root"] = str(resolve_repo_path(output_root))
    storage = updated.get("storage")
    if isinstance(storage, dict):
        updated["storage"] = {**storage, "local_fallback_root": updated["output_root"]}
    return updated


def build_airflow_result_artifact(run_id: str, result: Week2RunnerResult) -> dict[str, Any]:
    """M5 `Week2AirflowAdapter`가 읽는 `week2_result` wrapper를 만든다."""

    return {
        "artifact_type": "week2_airflow_sparkrunner_result",
        "producer": "M2",
        "run_id": run_id,
        "week2_result": runner_result_dict(result),
    }


def runner_result_dict(result: Week2RunnerResult) -> dict[str, Any]:
    """dataclass 결과를 JSON artifact에 넣을 dict로 바꾼다."""

    return asdict(result)


def resolve_result_path(result_path: Path | None, run_id: str) -> Path:
    """result path가 없으면 M5 Airflow adapter 기본 artifact 위치를 사용한다."""

    if result_path is not None:
        return resolve_repo_path(result_path)
    return REPO_ROOT / "data" / "week2" / "_airflow_results" / f"{run_id}.json"


def resolve_repo_path(path: Path) -> Path:
    """상대 경로를 repository root 기준 절대 경로로 해석한다."""

    return path if path.is_absolute() else REPO_ROOT / path


def read_json(path: Path) -> dict[str, Any]:
    """JSON object 파일을 읽는다."""

    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"JSON file must contain an object: {path}")
    return payload


def write_json(path: Path, payload: dict[str, Any]) -> None:
    """artifact JSON을 저장한다."""

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    """Airflow DAG task에서 넘길 수 있는 CLI option을 정의한다."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--runtime-config-path", type=Path, default=DEFAULT_RUNTIME_CONFIG_PATH)
    parser.add_argument("--runtime-profile", default=DEFAULT_RUNTIME_PROFILE)
    parser.add_argument("--output-root", type=Path, default=None)
    parser.add_argument("--result-path", type=Path, default=None)
    parser.add_argument("--run-id", default="run_airflow_spark_001")
    return parser.parse_args()


def main() -> int:
    """CLI entry point: artifact를 출력하고 실패 결과면 non-zero로 종료한다."""

    artifact = run_handoff(parse_args())
    print(json.dumps(artifact, ensure_ascii=False, indent=2))
    return 0 if artifact["week2_result"].get("status") == "succeeded" else 1


if __name__ == "__main__":
    raise SystemExit(main())
