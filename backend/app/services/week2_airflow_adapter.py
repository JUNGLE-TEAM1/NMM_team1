import json
import os
from dataclasses import dataclass
from pathlib import Path
from time import sleep
from typing import Any, Protocol

import httpx

from app.services.week2_local_runner import Week2RunnerResult


class Week2AirflowError(RuntimeError):
    pass


class Week2AirflowUnavailableError(Week2AirflowError):
    pass


@dataclass(frozen=True)
class Week2AirflowConfig:
    base_url: str
    dag_id: str
    result_root: Path
    username: str | None = None
    password: str | None = None
    timeout_seconds: float = 5
    max_polls: int = 3
    poll_interval_seconds: float = 1

    @classmethod
    def from_env(cls, env: dict[str, str] | None = None) -> "Week2AirflowConfig | None":
        source = env if env is not None else os.environ
        base_url = source.get("ASKLAKE_WEEK2_AIRFLOW_BASE_URL") or source.get("AIRFLOW_BASE_URL")
        if not base_url:
            return None
        result_root = source.get("ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT")
        return cls(
            base_url=base_url,
            dag_id=source.get("ASKLAKE_WEEK2_AIRFLOW_DAG_ID", "asklake_week2_reviews"),
            result_root=airflow_result_root_from_env(result_root),
            username=source.get("ASKLAKE_WEEK2_AIRFLOW_USERNAME") or source.get("AIRFLOW_USERNAME"),
            password=source.get("ASKLAKE_WEEK2_AIRFLOW_PASSWORD") or source.get("AIRFLOW_PASSWORD"),
            timeout_seconds=float(source.get("ASKLAKE_WEEK2_AIRFLOW_TIMEOUT_SECONDS", "5")),
            max_polls=int(source.get("ASKLAKE_WEEK2_AIRFLOW_MAX_POLLS", "3")),
            poll_interval_seconds=float(source.get("ASKLAKE_WEEK2_AIRFLOW_POLL_INTERVAL_SECONDS", "1")),
        )


def airflow_readiness(env: dict[str, str] | None = None) -> dict[str, Any]:
    source = env if env is not None else os.environ
    config = Week2AirflowConfig.from_env(source)
    result_root_value = source.get("ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT")
    result_root = airflow_result_root_from_env(result_root_value)
    username_configured = bool(source.get("ASKLAKE_WEEK2_AIRFLOW_USERNAME") or source.get("AIRFLOW_USERNAME"))
    password_configured = bool(source.get("ASKLAKE_WEEK2_AIRFLOW_PASSWORD") or source.get("AIRFLOW_PASSWORD"))

    if config is None:
        return {
            "status": "not_configured",
            "trigger_available": False,
            "fallback_available": True,
            "message": "Airflow env is not configured. Week 2 airflow executor will fall back to local runner.",
            "base_url": None,
            "dag_id": source.get("ASKLAKE_WEEK2_AIRFLOW_DAG_ID", "asklake_week2_reviews"),
            "result_root": str(result_root),
            "result_root_exists": result_root.exists(),
            "username_configured": username_configured,
            "password_configured": password_configured,
            "credential_values_exposed": False,
            "required_env": [
                "ASKLAKE_WEEK2_AIRFLOW_BASE_URL",
                "ASKLAKE_WEEK2_AIRFLOW_DAG_ID",
                "ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT",
            ],
        }

    return {
        "status": "configured",
        "trigger_available": True,
        "fallback_available": True,
        "message": "Airflow env is configured. This readiness check does not trigger the DAG.",
        "base_url": config.base_url,
        "dag_id": config.dag_id,
        "result_root": str(config.result_root),
        "result_root_exists": config.result_root.exists(),
        "username_configured": config.username is not None,
        "password_configured": config.password is not None,
        "credential_values_exposed": False,
        "timeout_seconds": config.timeout_seconds,
        "max_polls": config.max_polls,
        "poll_interval_seconds": config.poll_interval_seconds,
        "required_env": [
            "ASKLAKE_WEEK2_AIRFLOW_BASE_URL",
            "ASKLAKE_WEEK2_AIRFLOW_DAG_ID",
            "ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT",
        ],
    }


class AirflowHttpClient(Protocol):
    def request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        pass


class HttpxAirflowHttpClient:
    def __init__(self, config: Week2AirflowConfig) -> None:
        self.config = config

    def request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        auth = None
        if self.config.username is not None or self.config.password is not None:
            auth = (self.config.username or "", self.config.password or "")
        url = f"{self.config.base_url.rstrip('/')}{path}"
        try:
            response = httpx.request(
                method,
                url,
                json=payload,
                auth=auth,
                timeout=self.config.timeout_seconds,
            )
            response.raise_for_status()
        except httpx.HTTPError as error:
            raise Week2AirflowUnavailableError(f"Airflow request failed: {error}") from error
        return response.json()


class Week2AirflowAdapter:
    def __init__(
        self,
        config: Week2AirflowConfig | None = None,
        http_client: AirflowHttpClient | None = None,
        env: dict[str, str] | None = None,
    ) -> None:
        self.config = config if config is not None else Week2AirflowConfig.from_env(env)
        self.http_client = http_client

    def run(self, workflow_definition: dict[str, Any], run_id: str) -> Week2RunnerResult:
        if self.config is None:
            raise Week2AirflowUnavailableError("Week 2 Airflow adapter is not configured")

        client = self.http_client or HttpxAirflowHttpClient(self.config)
        dag_run_path = f"/api/v1/dags/{self.config.dag_id}/dagRuns"
        dag_run_payload = {
            "dag_run_id": run_id,
            "conf": {
                "run_id": run_id,
                "pipeline_id": workflow_definition["pipeline_id"],
                "workflow_definition": workflow_definition,
                "airflow_result_file": airflow_result_file_name(run_id),
            },
        }
        client.request("POST", dag_run_path, dag_run_payload)

        latest_run: dict[str, Any] = {}
        for poll_index in range(max(1, self.config.max_polls)):
            latest_run = client.request("GET", f"{dag_run_path}/{run_id}")
            state = airflow_state(latest_run)
            if state == "success":
                return result_from_successful_dag_run(latest_run, run_id, self.config)
            if state in {"failed", "upstream_failed"}:
                return failed_airflow_result(run_id, f"Airflow DAG finished with state {state}")
            if poll_index < self.config.max_polls - 1 and self.config.poll_interval_seconds > 0:
                sleep(self.config.poll_interval_seconds)

        state = airflow_state(latest_run) or "unknown"
        return failed_airflow_result(run_id, f"Airflow DAG did not finish within polling limit; last state {state}")


def airflow_state(dag_run: dict[str, Any]) -> str | None:
    value = dag_run.get("state")
    return str(value).lower() if value is not None else None


def result_from_successful_dag_run(
    dag_run: dict[str, Any],
    run_id: str,
    config: Week2AirflowConfig,
) -> Week2RunnerResult:
    payload = week2_result_payload(dag_run)
    if payload is None:
        payload, artifact_error = week2_result_artifact_payload(dag_run, run_id, config)
        if artifact_error is not None:
            return failed_airflow_result(run_id, artifact_error)
    if payload is None:
        return failed_airflow_result(run_id, "Airflow DAG succeeded but missing Week 2 result payload")
    if not payload.get("output_path"):
        return failed_airflow_result(run_id, "Airflow DAG result is missing output_path")
    return Week2RunnerResult(
        status=str(payload.get("status", "succeeded")),
        task_results=list(payload.get("task_results") or [succeeded_airflow_task_result(payload)]),
        logs=list(payload.get("logs") or [{"level": "info", "message": f"Airflow DAG completed for {run_id}"}]),
        row_count=optional_int(payload.get("row_count")),
        bytes=optional_int(payload.get("bytes")),
        duration_ms=optional_int(payload.get("duration_ms")),
        output_path=str(payload["output_path"]),
        output_row_count=optional_int(payload.get("output_row_count")),
        output_bytes=optional_int(payload.get("output_bytes")),
    )


def week2_result_payload(dag_run: dict[str, Any]) -> dict[str, Any] | None:
    conf = dag_run.get("conf")
    if not isinstance(conf, dict):
        conf = {}
    for candidate in (
        dag_run.get("week2_result"),
        dag_run.get("result"),
        conf.get("week2_result"),
        conf.get("result"),
    ):
        if isinstance(candidate, dict):
            return candidate
    return None


def week2_result_artifact_payload(
    dag_run: dict[str, Any],
    run_id: str,
    config: Week2AirflowConfig,
) -> tuple[dict[str, Any] | None, str | None]:
    result_file = airflow_result_file_from_dag_run(dag_run, run_id)
    if result_file is None:
        return None, None

    result_path = config.result_root / result_file
    try:
        with result_path.open(encoding="utf-8") as result_file_handle:
            payload = json.load(result_file_handle)
    except FileNotFoundError:
        return None, f"Airflow DAG succeeded but result artifact is missing: {result_path}"
    except json.JSONDecodeError as error:
        return None, f"Airflow DAG result artifact is invalid JSON: {result_path}: {error}"
    except OSError as error:
        return None, f"Airflow DAG result artifact cannot be read: {result_path}: {error}"

    if not isinstance(payload, dict):
        return None, f"Airflow DAG result artifact is not a JSON object: {result_path}"
    nested_payload = payload.get("week2_result")
    if isinstance(nested_payload, dict):
        return nested_payload, None
    return payload, None


def airflow_result_file_from_dag_run(dag_run: dict[str, Any], run_id: str) -> str | None:
    conf = dag_run.get("conf")
    if not isinstance(conf, dict):
        return None
    value = conf.get("airflow_result_file")
    if value is None:
        return None
    name = Path(str(value)).name
    return name if name else airflow_result_file_name(run_id)


def airflow_result_file_name(run_id: str) -> str:
    return f"{run_id}.json"


def default_airflow_result_root() -> Path:
    return repo_root() / "data" / "week2" / "_airflow_results"


def airflow_result_root_from_env(value: str | None) -> Path:
    if not value:
        return default_airflow_result_root()
    path = Path(value)
    return path if path.is_absolute() else repo_root() / path


def repo_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "contracts").is_dir():
            return parent
    return Path(__file__).resolve().parents[3]


def succeeded_airflow_task_result(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "node_id": "airflow_dag_reviews",
        "status": "succeeded",
        "attempt": 1,
        "row_count": optional_int(payload.get("output_row_count")),
        "bytes": optional_int(payload.get("output_bytes")),
        "error": None,
    }


def failed_airflow_result(run_id: str, error: str) -> Week2RunnerResult:
    return Week2RunnerResult(
        status="failed",
        task_results=[
            {
                "node_id": "airflow_dag_reviews",
                "status": "failed",
                "attempt": 1,
                "row_count": None,
                "bytes": None,
                "error": error,
            }
        ],
        logs=[{"level": "error", "message": f"{run_id}: {error}"}],
        duration_ms=1,
    )


def optional_int(value: Any) -> int | None:
    if isinstance(value, bool) or value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return round(value)
    if isinstance(value, str):
        try:
            return int(value)
        except ValueError:
            return None
    return None
