import csv
import json
import re
import time
import uuid
from pathlib import Path

import pyarrow.parquet as pq

from app.domain.schemas import (
    ExternalConnectionInspectRequest,
    ExternalConnectionRecord,
    SourceDatasetRecord,
    SourceDatasetSnapshotCreate,
    SourceDatasetSnapshotRecord,
)
from app.services.external_connection_discovery import (
    ExternalConnectionDiscoveryError,
    ExternalConnectionDiscoveryService,
    resolve_local_path,
)
from app.services.data_lake_paths import source_snapshot_root


class SourceDatasetSnapshotError(ValueError):
    pass


SUPPORTED_LOCAL_SUFFIXES = {".csv", ".json", ".jsonl", ".parquet"}


class SourceDatasetSnapshotService:
    def __init__(self, output_root: Path | None = None) -> None:
        self.output_root = output_root or source_snapshot_root()

    def create_snapshot(
        self,
        dataset: SourceDatasetRecord,
        connection: ExternalConnectionRecord | None,
        request: SourceDatasetSnapshotCreate,
    ) -> SourceDatasetSnapshotRecord:
        started = time.perf_counter()
        rows, input_bytes = self._materialize_rows(dataset, connection, request)
        if not rows:
            raise SourceDatasetSnapshotError("snapshot으로 저장할 row/message가 없습니다.")

        output_path = self._write_snapshot(dataset, rows)
        duration_ms = max(1, int((time.perf_counter() - started) * 1000))
        created_at = now_iso()
        return SourceDatasetSnapshotRecord(
            id=str(uuid.uuid4()),
            source_dataset_id=dataset.id,
            source_dataset_name=dataset.name,
            connection_id=dataset.connection_id,
            connection_type=dataset.connection_type,
            input_scope=dataset.raw_scope,
            output_path=str(output_path),
            row_count=len(rows),
            output_bytes=output_path.stat().st_size,
            input_bytes=input_bytes,
            status="succeeded",
            duration_ms=duration_ms,
            message=f"{len(rows)}개 row/message를 raw snapshot으로 저장했습니다.",
            created_at=created_at,
        )

    def _materialize_rows(
        self,
        dataset: SourceDatasetRecord,
        connection: ExternalConnectionRecord | None,
        request: SourceDatasetSnapshotCreate,
    ) -> tuple[list[dict[str, object]], int | None]:
        if dataset.connection_type in {"local_file", "csv"}:
            path = resolve_local_path(dataset.raw_scope)
            return read_local_file_rows(path, request.sample_size), path.stat().st_size
        if dataset.connection_type == "local_folder":
            path = resolve_local_path(dataset.raw_scope)
            rows: list[dict[str, object]] = []
            files = [file for file in sorted(path.rglob("*")) if file.is_file() and file.suffix.lower() in SUPPORTED_LOCAL_SUFFIXES]
            if not files:
                raise SourceDatasetSnapshotError(f"snapshot 대상 파일을 찾지 못했습니다: {dataset.raw_scope}")
            for file in files:
                remaining = request.sample_size - len(rows)
                if remaining <= 0:
                    break
                rows.extend(read_local_file_rows(file, remaining))
            input_bytes = sum(file.stat().st_size for file in files)
            return rows, input_bytes

        if connection is None:
            raise SourceDatasetSnapshotError("runtime snapshot에는 External Connection metadata가 필요합니다.")
        options = {**request.options}
        options.setdefault("scope", dataset.raw_scope)
        try:
            result = ExternalConnectionDiscoveryService().inspect(
                ExternalConnectionInspectRequest(
                    connector_type=dataset.connection_type,
                    resource=connection.resource,
                    resource_label=connection.resource_label,
                    secret_refs=request.secret_refs,
                    options=options,
                    sample_size=min(request.sample_size, 20),
                )
            )
        except ExternalConnectionDiscoveryError as error:
            raise SourceDatasetSnapshotError(str(error)) from error
        return result.sample_rows, result.bytes

    def _write_snapshot(self, dataset: SourceDatasetRecord, rows: list[dict[str, object]]) -> Path:
        safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", dataset.name).strip("_") or dataset.id
        snapshot_dir = self.output_root / safe_name
        snapshot_dir.mkdir(parents=True, exist_ok=True)
        output_path = snapshot_dir / f"{time.strftime('%Y%m%dT%H%M%SZ', time.gmtime())}-{uuid.uuid4().hex[:8]}.jsonl"
        with output_path.open("w", encoding="utf-8") as snapshot_file:
            for row in rows:
                snapshot_file.write(json.dumps(row, ensure_ascii=False, default=str))
                snapshot_file.write("\n")
        return output_path


def read_local_file_rows(path: Path, sample_size: int) -> list[dict[str, object]]:
    suffix = path.suffix.lower()
    if suffix == ".csv":
        with path.open(newline="", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)
            return [dict(row) for _, row in zip(range(sample_size), reader)]
    if suffix == ".jsonl":
        rows: list[dict[str, object]] = []
        with path.open(encoding="utf-8") as jsonl_file:
            for line in jsonl_file:
                if not line.strip():
                    continue
                payload = json.loads(line)
                if isinstance(payload, dict):
                    rows.append(payload)
                if len(rows) >= sample_size:
                    break
        return rows
    if suffix == ".json":
        with path.open(encoding="utf-8") as json_file:
            payload = json.load(json_file)
        if isinstance(payload, list):
            return [row for row in payload[:sample_size] if isinstance(row, dict)]
        if isinstance(payload, dict):
            return [payload]
        return []
    if suffix == ".parquet":
        parquet_file = pq.ParquetFile(path)
        if parquet_file.metadata is None or parquet_file.metadata.num_rows == 0:
            return []
        columns = [field.name for field in parquet_file.schema_arrow]
        return parquet_file.read_row_group(0, columns=columns).slice(0, sample_size).to_pylist()
    raise SourceDatasetSnapshotError(f"지원하지 않는 snapshot 파일 형식입니다: {path.suffix}")


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
