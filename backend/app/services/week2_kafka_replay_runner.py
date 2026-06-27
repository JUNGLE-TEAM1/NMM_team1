import json
import os
from dataclasses import dataclass
from pathlib import Path
from time import perf_counter, sleep
from typing import Any, Protocol

import httpx

from app.services.week2_local_runner import Week2RunnerResult, elapsed_ms, path_size, repo_root

TERMINAL_REPLAY_STATUSES = {"finished", "error", "stopped"}


class Week2KafkaReplayError(RuntimeError):
    pass


class Week2KafkaReplayUnavailableError(Week2KafkaReplayError):
    pass


@dataclass(frozen=True)
class Week2KafkaReplayConfig:
    base_url: str = "http://localhost:5189"
    timeout_seconds: float = 5
    max_polls: int = 20
    poll_interval_seconds: float = 0.25

    @classmethod
    def from_env(cls, env: dict[str, str] | None = None) -> "Week2KafkaReplayConfig":
        source = env if env is not None else os.environ
        return cls(
            base_url=source.get("ASKLAKE_WEEK2_KAFKA_REPLAY_BASE_URL", "http://localhost:5189"),
            timeout_seconds=float(source.get("ASKLAKE_WEEK2_KAFKA_REPLAY_TIMEOUT_SECONDS", "5")),
            max_polls=int(source.get("ASKLAKE_WEEK2_KAFKA_REPLAY_MAX_POLLS", "20")),
            poll_interval_seconds=float(source.get("ASKLAKE_WEEK2_KAFKA_REPLAY_POLL_INTERVAL_SECONDS", "0.25")),
        )


class KafkaReplayHttpClient(Protocol):
    def request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        pass


class HttpxKafkaReplayHttpClient:
    def __init__(self, config: Week2KafkaReplayConfig) -> None:
        self.config = config

    def request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        url = f"{self.config.base_url.rstrip('/')}{path}"
        try:
            response = httpx.request(method, url, json=payload, timeout=self.config.timeout_seconds)
            response.raise_for_status()
        except httpx.HTTPError as error:
            raise Week2KafkaReplayUnavailableError(f"Kafka replay request failed: {error}") from error
        return response.json()


class Week2KafkaReplayRunner:
    def __init__(
        self,
        config: Week2KafkaReplayConfig | None = None,
        http_client: KafkaReplayHttpClient | None = None,
        output_root: Path | None = None,
        env: dict[str, str] | None = None,
    ) -> None:
        self.config = config if config is not None else Week2KafkaReplayConfig.from_env(env)
        self.http_client = http_client
        self.output_root = output_root or (repo_root() / "data" / "week2")

    def run(self, kafka_topic_contract: dict[str, Any], run_id: str) -> Week2RunnerResult:
        started = perf_counter()
        try:
            result = self._run_replay(kafka_topic_contract, run_id, started)
        except Week2KafkaReplayError as error:
            return failed_kafka_replay_result(run_id, str(error), elapsed_ms(started))
        return result

    def _run_replay(
        self,
        kafka_topic_contract: dict[str, Any],
        run_id: str,
        started: float,
    ) -> Week2RunnerResult:
        client = self.http_client or HttpxKafkaReplayHttpClient(self.config)
        payload = replay_payload(kafka_topic_contract)
        response = client.request("POST", "/api/replay/start", payload)
        job = response.get("job")
        if not isinstance(job, dict) or not job.get("id"):
            raise Week2KafkaReplayError("Kafka replay API did not return a replay job")

        latest_job = self._wait_for_job(client, str(job["id"]), job)
        evidence_path = self._write_evidence(run_id, kafka_topic_contract, payload, latest_job)
        status = str(latest_job.get("status", "unknown"))
        row_count = optional_int(latest_job.get("sent"))
        replay_bytes = optional_int(latest_job.get("fileBytes"))
        evidence_bytes = path_size(evidence_path)
        error = replay_error(status, latest_job)

        return Week2RunnerResult(
            status="succeeded" if status == "finished" else "failed",
            task_results=[
                {
                    "node_id": "node_kafka_replay",
                    "status": "succeeded" if status == "finished" else "failed",
                    "attempt": 1,
                    "row_count": row_count,
                    "bytes": optional_int(latest_job.get("processedBytes")) or replay_bytes,
                    "error": error,
                }
            ],
            logs=kafka_replay_logs(run_id, payload, latest_job),
            row_count=row_count,
            bytes=replay_bytes,
            duration_ms=elapsed_ms(started),
            output_path=str(evidence_path),
            output_row_count=row_count,
            output_bytes=evidence_bytes,
            metadata={
                "catalog": kafka_replay_catalog_overlay(kafka_topic_contract, run_id),
                "lineage": kafka_replay_run_lineage(kafka_topic_contract),
            },
        )

    def _wait_for_job(
        self,
        client: KafkaReplayHttpClient,
        job_id: str,
        initial_job: dict[str, Any],
    ) -> dict[str, Any]:
        latest_job = initial_job
        polls = max(1, self.config.max_polls)
        for poll_index in range(polls):
            if str(latest_job.get("status")) in TERMINAL_REPLAY_STATUSES:
                return latest_job
            if poll_index > 0 or self.config.poll_interval_seconds > 0:
                sleep(max(0, self.config.poll_interval_seconds))
            latest_job = self._find_job(client, job_id) or latest_job
        if str(latest_job.get("status")) not in TERMINAL_REPLAY_STATUSES:
            latest_job = dict(latest_job)
            latest_job["status"] = "error"
            latest_job["error"] = "Kafka replay job did not finish within polling limit"
        return latest_job

    def _find_job(self, client: KafkaReplayHttpClient, job_id: str) -> dict[str, Any] | None:
        response = client.request("GET", "/api/replay/jobs")
        jobs = response.get("jobs")
        if not isinstance(jobs, list):
            return None
        return next((job for job in jobs if isinstance(job, dict) and str(job.get("id")) == job_id), None)

    def _write_evidence(
        self,
        run_id: str,
        kafka_topic_contract: dict[str, Any],
        payload: dict[str, Any],
        job: dict[str, Any],
    ) -> Path:
        evidence_path = self.output_root / "kafka" / "raw_events" / f"run_id={run_id}" / "kafka_replay_evidence.json"
        evidence_path.parent.mkdir(parents=True, exist_ok=True)
        with evidence_path.open("w", encoding="utf-8") as evidence_file:
            json.dump(
                {
                    "contract": "KafkaReplayEvidence",
                    "run_id": run_id,
                    "topic": payload["topic"],
                    "source_file": payload["filePath"],
                    "kafka_topic_contract": kafka_topic_contract,
                    "replay_request": payload,
                    "replay_job": job,
                },
                evidence_file,
                ensure_ascii=False,
                indent=2,
                sort_keys=True,
            )
            evidence_file.write("\n")
        return evidence_path


def replay_payload(kafka_topic_contract: dict[str, Any]) -> dict[str, Any]:
    replay = kafka_topic_contract.get("replay", {})
    source_file = replay.get("source_file")
    if not source_file or str(source_file).startswith("TODO"):
        raise Week2KafkaReplayError("Kafka replay source_file is not configured")

    source_path = resolve_repo_path(str(source_file))
    if not source_path.exists():
        raise Week2KafkaReplayError(f"Kafka replay source file not found: {source_path}")

    return {
        "filePath": str(source_path),
        "topic": str(kafka_topic_contract.get("topic", "asklake.raw_events")),
        "partitions": int_option(replay.get("partitions"), 3),
        "recordsPerSecond": int_option(replay.get("records_per_second", replay.get("rate_per_second")), 10),
        "batchSize": int_option(replay.get("batch_size"), 10),
        "startRow": int_option(replay.get("start_row"), 1),
        "maxRows": int_option(replay.get("max_rows"), 10),
        "keyColumn": str(replay.get("key_column") or kafka_topic_contract.get("event_key") or ""),
        "delimiter": str(replay.get("delimiter", ",")),
        "encoding": str(replay.get("encoding", "utf8")),
    }


def kafka_replay_catalog_overlay(kafka_topic_contract: dict[str, Any], run_id: str) -> dict[str, Any]:
    event_shape = kafka_topic_contract.get("event_shape", {})
    return {
        "dataset_id": "dataset_kafka_replay_raw_events",
        "name": "Kafka Replay Raw Events",
        "layer": "raw",
        "s3_uri_status": "local_kafka_replay_evidence",
        "storage": {
            "prefix": f"kafka/raw_events/run_id={run_id}/",
            "local_fallback_path": f"data/week2/kafka/raw_events/run_id={run_id}/kafka_replay_evidence.json",
        },
        "schema": {
            "schema_version": "schema_kafka_replay_raw_events_v1",
            "fields": [
                {"name": name, "type": field_type, "nullable": True}
                for name, field_type in event_shape.items()
            ],
        },
        "lineage": {
            "source_ids": [str(kafka_topic_contract.get("source_id", "source_kafka_replay_demo"))],
            "pipeline_id": "pipeline_reviews_json_e2e",
            "run_id": run_id,
            "upstream_datasets": [],
        },
        "query": {
            "table_name": "kafka_replay_raw_events",
            "allow_readonly_sql": False,
            "allowed_columns": list(event_shape.keys()),
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "freshness": {
            "event_time_column": kafka_topic_contract.get("event_time_column"),
            "data_interval_start": None,
            "data_interval_end": None,
        },
    }


def kafka_replay_run_lineage(kafka_topic_contract: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_ids": [str(kafka_topic_contract.get("source_id", "source_kafka_replay_demo"))],
        "input_datasets": [],
        "output_datasets": ["dataset_kafka_replay_raw_events"],
    }


def kafka_replay_logs(run_id: str, payload: dict[str, Any], job: dict[str, Any]) -> list[dict[str, str]]:
    status = str(job.get("status", "unknown"))
    logs = [
        {"level": "info", "message": "queued"},
        {"level": "info", "message": f"Kafka replay job {job.get('id')} submitted for {run_id}"},
        {"level": "info", "message": f"Kafka replay topic {payload['topic']}"},
    ]
    if status == "finished":
        logs.append({"level": "info", "message": f"Kafka replay finished with {job.get('sent', 0)} message(s)"})
    else:
        logs.append({"level": "error", "message": replay_error(status, job) or f"Kafka replay ended as {status}"})
    return logs


def failed_kafka_replay_result(run_id: str, error: str, duration_ms: int) -> Week2RunnerResult:
    return Week2RunnerResult(
        status="failed",
        task_results=[
            {
                "node_id": "node_kafka_replay",
                "status": "failed",
                "attempt": 1,
                "row_count": None,
                "bytes": None,
                "error": error,
            }
        ],
        logs=[{"level": "error", "message": f"{run_id}: {error}"}],
        duration_ms=duration_ms,
    )


def replay_error(status: str, job: dict[str, Any]) -> str | None:
    if status == "finished":
        return None
    return str(job.get("error") or f"Kafka replay job ended with status {status}")


def resolve_repo_path(value: str) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path

    root = repo_root()
    primary_path = root / path
    if primary_path.exists():
        return primary_path

    if path.parts and path.parts[0] == "backend":
        container_path = root / Path(*path.parts[1:])
        if container_path.exists():
            return container_path

    return primary_path


def int_option(value: Any, fallback: int) -> int:
    if isinstance(value, bool) or value is None:
        return fallback
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def optional_int(value: Any) -> int | None:
    if isinstance(value, bool) or value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
