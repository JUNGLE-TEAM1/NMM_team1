import json
import tempfile
from pathlib import Path

from fastapi.testclient import TestClient

from app.adapters.sqlite_metadata_store import SQLiteMetadataStore
from app.core.app_factory import create_app
from app.core.settings import Settings
from app.services.week2_kafka_replay_evidence import Week2KafkaReplayEvidenceService


def make_client(output_root: Path) -> TestClient:
    temp_dir = tempfile.TemporaryDirectory()
    settings = Settings(
        metadata_url=f"sqlite:///{Path(temp_dir.name) / 'metadata.db'}",
        result_store_path=str(output_root.parent),
    )
    store = SQLiteMetadataStore(settings.metadata_url)
    app = create_app(store, settings)
    app.state.test_temp_dir = temp_dir
    return TestClient(app)


def write_evidence(output_root: Path, run_id: str = "run_kafka_replay_001") -> dict[str, object]:
    evidence = {
        "contract": "KafkaReplayEvidence",
        "run_id": run_id,
        "job_id": "job-001",
        "tenant_id": "tenant_demo",
        "module": "M4 Kafka Replay",
        "producer": "kafka-replay-console",
        "status": "succeeded",
        "source_file": "demo-output/replay-samples/sample.csv",
        "source_file_name": "sample.csv",
        "topic": "csv-replay",
        "partitions": 3,
        "records_per_second": 100,
        "batch_size": 50,
        "key_column": "user_id",
        "started_at": "2026-06-27T00:00:00Z",
        "finished_at": "2026-06-27T00:00:02Z",
        "updated_at": "2026-06-27T00:00:02Z",
        "metrics": {
            "sent_rows": 200,
            "failed_rows": 0,
            "skipped_rows": 0,
            "error_count": 0,
            "file_bytes": 1024,
            "processed_bytes": 1024,
            "progress_percent": 100,
            "throughput_per_second": 100,
            "duration_ms": 2000,
        },
        "lineage": {
            "source_file": "demo-output/replay-samples/sample.csv",
            "kafka_topic": "kafka://localhost:29092/csv-replay",
            "source_ref": "file://demo-output/replay-samples/sample.csv",
            "target_ref": "kafka://localhost:29092/csv-replay",
        },
        "health": {"status": "ok", "message": "Kafka replay evidence recorded"},
    }
    evidence_dir = output_root / "_metadata" / "kafka_replay"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    for name in [f"{run_id}.json", "latest.json"]:
        (evidence_dir / name).write_text(json.dumps(evidence), encoding="utf-8")
    return evidence


def test_week2_kafka_replay_evidence_service_reads_latest_health(tmp_path: Path) -> None:
    output_root = tmp_path / "results" / "week2"
    write_evidence(output_root)

    service = Week2KafkaReplayEvidenceService(output_root)

    assert service.health()["latest_run_id"] == "run_kafka_replay_001"
    assert service.health()["sent_rows"] == 200
    assert service.get_run("run_kafka_replay_001")["lineage"]["target_ref"] == "kafka://localhost:29092/csv-replay"
    assert service.list_runs()[0]["run_id"] == "run_kafka_replay_001"


def test_week2_kafka_replay_health_reports_missing_evidence(tmp_path: Path) -> None:
    service = Week2KafkaReplayEvidenceService(tmp_path / "results" / "week2")

    health = service.health()

    assert health["status"] == "missing_evidence"
    assert health["latest_run_id"] is None


def test_week2_kafka_replay_routes_expose_harness_evidence(tmp_path: Path) -> None:
    output_root = tmp_path / "results" / "week2"
    write_evidence(output_root)
    client = make_client(output_root)

    health_response = client.get("/api/week2/kafka-replay/health")
    runs_response = client.get("/api/week2/kafka-replay/runs")
    run_response = client.get("/api/week2/kafka-replay/runs/run_kafka_replay_001")

    assert health_response.status_code == 200
    assert health_response.json()["status"] == "ok"
    assert health_response.json()["topic"] == "csv-replay"
    assert runs_response.status_code == 200
    assert runs_response.json()["runs"][0]["metrics"]["sent_rows"] == 200
    assert run_response.status_code == 200
    assert run_response.json()["contract"] == "KafkaReplayEvidence"
