import json
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


RUN_ID_RE = re.compile(r"^[A-Za-z0-9_.-]+$")


class Week2KafkaReplayEvidenceNotFoundError(ValueError):
    pass


class Week2KafkaReplayEvidenceService:
    def __init__(self, week2_output_root: Path) -> None:
        self.evidence_dir = week2_output_root / "_metadata" / "kafka_replay"

    def list_runs(self) -> list[dict[str, Any]]:
        runs = [
            self._load_evidence(path)
            for path in sorted(self.evidence_dir.glob("*.json"))
            if path.name != "latest.json"
        ]
        return sorted(runs, key=lambda run: run.get("updated_at") or run.get("started_at") or "", reverse=True)

    def get_run(self, run_id: str) -> dict[str, Any]:
        if not RUN_ID_RE.match(run_id):
            raise Week2KafkaReplayEvidenceNotFoundError("Kafka replay evidence not found")

        path = self.evidence_dir / f"{run_id}.json"
        if not path.exists():
            raise Week2KafkaReplayEvidenceNotFoundError("Kafka replay evidence not found")
        return self._load_evidence(path)

    def health(self) -> dict[str, Any]:
        latest = self._latest_evidence()
        if latest is None:
            return {
                "module": "M4 Kafka Replay",
                "status": "missing_evidence",
                "message": "No Kafka replay evidence has been recorded yet.",
                "latest_run_id": None,
                "topic": None,
                "sent_rows": 0,
                "error_count": 0,
                "evidence_dir": str(self.evidence_dir),
                "checked_at": now_iso(),
            }

        metrics = latest.get("metrics", {})
        health = latest.get("health", {})
        return {
            "module": "M4 Kafka Replay",
            "status": health.get("status", "unknown"),
            "message": health.get("message", "Kafka replay evidence is available."),
            "latest_run_id": latest.get("run_id"),
            "topic": latest.get("topic"),
            "sent_rows": metrics.get("sent_rows", 0),
            "error_count": metrics.get("error_count", 0),
            "progress_percent": metrics.get("progress_percent", 0),
            "throughput_per_second": metrics.get("throughput_per_second", 0),
            "evidence_dir": str(self.evidence_dir),
            "checked_at": now_iso(),
        }

    def _latest_evidence(self) -> dict[str, Any] | None:
        latest_path = self.evidence_dir / "latest.json"
        if latest_path.exists():
            return self._load_evidence(latest_path)

        runs = self.list_runs()
        return runs[0] if runs else None

    def _load_evidence(self, path: Path) -> dict[str, Any]:
        with path.open(encoding="utf-8") as file:
            return json.load(file)


def now_iso() -> str:
    return datetime.now(UTC).isoformat()
