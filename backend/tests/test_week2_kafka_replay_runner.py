import json
from pathlib import Path

from app.services.week2_kafka_replay_runner import Week2KafkaReplayConfig, Week2KafkaReplayRunner
from app.services.week2_workflow import Week2WorkflowNotFoundError, Week2WorkflowService


def test_week2_kafka_replay_runner_starts_replay_and_writes_evidence(tmp_path: Path) -> None:
    csv_path = tmp_path / "events.csv"
    csv_path.write_text(
        "event_id,user_id,event_type,event_time,amount,payload\n"
        "evt-1,user-1,view,2026-06-27T00:00:01Z,10,opened\n"
        "evt-2,user-2,click,2026-06-27T00:00:02Z,20,clicked\n",
        encoding="utf-8",
    )
    http_client = FakeKafkaReplayHttpClient(
        started_job={"id": "job-1", "status": "queued", "sent": 0},
        polled_job={
            "id": "job-1",
            "status": "finished",
            "topic": "asklake.reviews.raw_events",
            "sent": 2,
            "fileBytes": csv_path.stat().st_size,
            "processedBytes": csv_path.stat().st_size,
            "targetRows": 2,
        },
    )
    runner = Week2KafkaReplayRunner(
        config=Week2KafkaReplayConfig(poll_interval_seconds=0, max_polls=2),
        http_client=http_client,
        output_root=tmp_path / "out",
    )

    result = runner.run(kafka_contract(str(csv_path)), run_id="run_reviews_demo_001")

    assert result.status == "succeeded"
    assert result.row_count == 2
    assert result.bytes == csv_path.stat().st_size
    assert result.task_results == [
        {
            "node_id": "node_kafka_replay",
            "status": "succeeded",
            "attempt": 1,
            "row_count": 2,
            "bytes": csv_path.stat().st_size,
            "error": None,
        }
    ]
    assert result.output_path is not None
    evidence = json.loads(Path(result.output_path).read_text(encoding="utf-8"))
    assert evidence["contract"] == "KafkaReplayEvidence"
    assert evidence["replay_job"]["id"] == "job-1"
    assert result.metadata["catalog"]["dataset_id"] == "dataset_kafka_replay_raw_events"
    assert http_client.requests[0] == (
        "POST",
        "/api/replay/start",
        {
            "filePath": str(csv_path),
            "topic": "asklake.reviews.raw_events",
            "partitions": 3,
            "recordsPerSecond": 10,
            "batchSize": 10,
            "startRow": 1,
            "maxRows": 2,
            "keyColumn": "event_id",
            "delimiter": ",",
            "encoding": "utf8",
        },
    )


def test_week2_workflow_can_execute_kafka_replay_and_record_catalog(tmp_path: Path) -> None:
    http_client = FakeKafkaReplayHttpClient(
        started_job={"id": "job-1", "status": "queued", "sent": 0},
        polled_job={
            "id": "job-1",
            "status": "finished",
            "topic": "asklake.reviews.raw_events",
            "sent": 5,
            "fileBytes": 420,
            "processedBytes": 420,
            "targetRows": 5,
        },
    )
    kafka_runner = Week2KafkaReplayRunner(
        config=Week2KafkaReplayConfig(poll_interval_seconds=0, max_polls=2),
        http_client=http_client,
        output_root=tmp_path / "out",
    )
    service = Week2WorkflowService(
        kafka_replay_runner=kafka_runner,
        output_root=tmp_path / "out",
    )

    run = service.trigger_run("pipeline_reviews_json_e2e", executor="kafka_replay", triggered_by="m4_owner")
    catalog = service.get_catalog_metadata("dataset_kafka_replay_raw_events")

    assert run["executor"] == "kafka_replay"
    assert run["status"] == "succeeded"
    assert run["row_count"] == 5
    assert run["lineage"]["source_ids"] == ["source_kafka_reviews_events_demo"]
    assert run["outputs"] == [
        {
            "dataset_id": "dataset_kafka_replay_raw_events",
            "layer": "raw",
            "uri": "s3://asklake-demo/kafka/raw_events/run_id=run_reviews_demo_001/",
            "uri_status": "local_kafka_replay_evidence",
        }
    ]
    assert run["logs"][-1]["message"] == "kafka replay executed Week 2 workflow boundary"
    assert catalog["dataset_id"] == "dataset_kafka_replay_raw_events"
    assert catalog["layer"] == "raw"
    assert catalog["storage"]["prefix"] == "kafka/raw_events/run_id=run_reviews_demo_001/"
    assert Path(catalog["storage"]["local_fallback_path"]).exists()
    assert catalog["lineage"]["source_ids"] == ["source_kafka_reviews_events_demo"]
    assert catalog["lineage"]["run_id"] == "run_reviews_demo_001"
    assert catalog["metrics"]["row_count"] == 5
    assert catalog["metrics"]["bytes"] == Path(catalog["storage"]["local_fallback_path"]).stat().st_size
    assert catalog["query"]["allow_readonly_sql"] is False

    try:
        service.get_catalog_metadata("dataset_reviews_gold")
    except Week2WorkflowNotFoundError:
        pass
    else:
        raise AssertionError("kafka_replay should not overwrite the Amazon Reviews Gold catalog")


def kafka_contract(source_file: str) -> dict:
    return {
        "contract": "KafkaTopicContract",
        "source_id": "source_kafka_reviews_events_demo",
        "topic": "asklake.reviews.raw_events",
        "event_key": "event_id",
        "event_time_column": "event_time",
        "event_shape": {
            "event_id": "string",
            "event_time": "timestamp",
            "event_type": "string",
            "payload": "object",
        },
        "replay": {
            "source_file": source_file,
            "records_per_second": 10,
            "batch_size": 10,
            "partitions": 3,
            "start_row": 1,
            "max_rows": 2,
            "key_column": "event_id",
        },
    }


class FakeKafkaReplayHttpClient:
    def __init__(self, started_job: dict, polled_job: dict) -> None:
        self.started_job = started_job
        self.polled_job = polled_job
        self.requests = []

    def request(self, method: str, path: str, payload: dict | None = None) -> dict:
        self.requests.append((method, path, payload))
        if method == "POST" and path == "/api/replay/start":
            return {"job": self.started_job}
        if method == "GET" and path == "/api/replay/jobs":
            return {"jobs": [self.polled_job]}
        raise AssertionError(f"Unexpected request: {method} {path}")
