import re
import time
import uuid
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from app.domain.schemas import (
    SilverDatasetMaterializationCreate,
    SilverDatasetMaterializationRecord,
    SilverDatasetRecord,
    SourceDatasetRecord,
    SourceDatasetSnapshotRecord,
)
from app.services.data_lake_paths import SILVER_ROOT, silver_dataset_path
from app.services.external_connection_discovery import ExternalConnectionDiscoveryError, resolve_local_path
from app.services.source_dataset_snapshot import read_local_file_rows


class SilverDatasetMaterializationError(ValueError):
    pass


class SilverDatasetMaterializationService:
    def __init__(self, output_root: Path | None = None) -> None:
        self.output_root = output_root or SILVER_ROOT

    def materialize(
        self,
        silver: SilverDatasetRecord,
        source: SourceDatasetRecord,
        latest_snapshot: SourceDatasetSnapshotRecord | None,
        request: SilverDatasetMaterializationCreate,
    ) -> SilverDatasetMaterializationRecord:
        started = time.perf_counter()
        input_path, rows = self._read_input(source, latest_snapshot, request)
        if not rows:
            raise SilverDatasetMaterializationError("Silver materialization에 사용할 row가 없습니다.")

        output_rows, failed_count = self._standardize_rows(rows, silver)
        if not output_rows:
            raise SilverDatasetMaterializationError("검증을 통과한 Silver row가 없습니다.")

        output_path = self._write_output(silver, output_rows)
        duration_ms = max(1, int((time.perf_counter() - started) * 1000))
        return SilverDatasetMaterializationRecord(
            id=str(uuid.uuid4()),
            silver_dataset_id=silver.id,
            silver_dataset_name=silver.name,
            source_dataset_id=source.id,
            source_dataset_name=source.name,
            input_path=input_path,
            output_path=str(output_path),
            row_count=len(output_rows),
            output_bytes=output_path.stat().st_size,
            failed_row_count=failed_count,
            status="succeeded",
            duration_ms=duration_ms,
            message=f"{len(output_rows)}개 row를 Silver parquet로 materialize했습니다.",
            created_at=now_iso(),
        )

    def _read_input(
        self,
        source: SourceDatasetRecord,
        latest_snapshot: SourceDatasetSnapshotRecord | None,
        request: SilverDatasetMaterializationCreate,
    ) -> tuple[str, list[dict[str, object]]]:
        if request.prefer_latest_source_snapshot and latest_snapshot is not None:
            path = resolve_local_path(latest_snapshot.output_path)
            return latest_snapshot.output_path, read_local_file_rows(path, request.sample_size)

        if source.connection_type not in {"local_file", "csv", "local_folder"}:
            raise SilverDatasetMaterializationError(
                f"{source.connection_type} Source Dataset은 먼저 raw snapshot을 생성해야 Silver materialization을 실행할 수 있습니다."
            )
        try:
            path = resolve_local_path(source.raw_scope)
        except ExternalConnectionDiscoveryError as error:
            raise SilverDatasetMaterializationError(str(error)) from error

        if path.is_dir():
            rows: list[dict[str, object]] = []
            for file in sorted(file for file in path.rglob("*") if file.is_file()):
                remaining = request.sample_size - len(rows)
                if remaining <= 0:
                    break
                if file.suffix.lower() in {".csv", ".json", ".jsonl", ".parquet"}:
                    rows.extend(read_local_file_rows(file, remaining))
            return source.raw_scope, rows
        return source.raw_scope, read_local_file_rows(path, request.sample_size)

    def _standardize_rows(
        self,
        rows: list[dict[str, object]],
        silver: SilverDatasetRecord,
    ) -> tuple[list[dict[str, object]], int]:
        field_names = [field.name for field in silver.schema_preview]
        output_rows: list[dict[str, object]] = []
        failed_count = 0
        for row in rows:
            if not isinstance(row, dict):
                failed_count += 1
                continue
            standardized = {}
            for field in field_names:
                value = row.get(field)
                standardized[field] = value.strip() if isinstance(value, str) else value
            if all(value is None for value in standardized.values()):
                failed_count += 1
                continue
            output_rows.append(standardized)
        return output_rows, failed_count

    def _write_output(self, silver: SilverDatasetRecord, rows: list[dict[str, object]]) -> Path:
        self.output_root.mkdir(parents=True, exist_ok=True)
        if self.output_root == SILVER_ROOT:
            output_path = silver_dataset_path(silver.name)
        else:
            safe_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", silver.name).strip("_") or silver.id
            output_path = self.output_root / f"{safe_name}.parquet"
        table = pa.Table.from_pylist(rows)
        pq.write_table(table, output_path)
        return output_path


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
