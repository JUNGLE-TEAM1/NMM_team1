import json
from dataclasses import dataclass
from pathlib import Path
from time import perf_counter

import pyarrow as pa
import pyarrow.parquet as pq

from app.domain.schemas import TargetDatasetDraftRecord, TargetDatasetJobRunRecord
from app.services.data_lake_paths import GOLD_ROOT, SILVER_ROOT, expected_gold_object_uri, gold_run_path
from app.services.prepared_product_health_outputs import prepared_gold_path, prepared_silver_path


@dataclass(frozen=True)
class TargetDatasetMaterializationResult:
    output_path: str
    row_count: int
    output_bytes: int
    silver_output_paths: list[str]
    logs: list[str]
    duration_ms: int
    source_evidence: list[dict[str, object]]
    runtime_evidence: dict[str, object]


class TargetDatasetLocalRunner:
    def __init__(self, output_root: Path | None = None) -> None:
        self.output_root = output_root or Path("data/dataset_runs")

    def run(
        self,
        run: TargetDatasetJobRunRecord,
        draft: TargetDatasetDraftRecord,
    ) -> TargetDatasetMaterializationResult:
        started = perf_counter()
        if run.executor_handoff != "local_runner":
            raise TargetDatasetLocalRunnerError(f"Unsupported executor for local materialization: {run.executor_handoff}")

        prepared_gold = prepared_gold_path(draft.gold_output)
        if prepared_gold is not None:
            return self.reference_prepared_gold(started, run, draft, prepared_gold)

        materialized_silver_paths = []
        for silver_output in draft.silver_outputs:
            silver_path = prepared_silver_path(silver_output.name)
            if silver_path is None:
                materialized_silver_paths = []
                break
            materialized_silver_paths.append(silver_path)
        if materialized_silver_paths:
            return self.materialize_gold_from_silver_parquet(started, run, draft, materialized_silver_paths)

        silver_root = SILVER_ROOT / f"run_id={safe_file_stem(run.id)}"
        gold_root = GOLD_ROOT / f"run_id={safe_file_stem(run.id)}"
        silver_root.mkdir(parents=True, exist_ok=True)
        gold_root.mkdir(parents=True, exist_ok=True)

        silver_paths = []
        source_evidence = []
        for index, silver_output in enumerate(draft.silver_outputs, start=1):
            row = {
                "silver_dataset": silver_output.name,
                "from_source_id": silver_output.from_source_id,
                "from_source_name": silver_output.from_source_name,
                "purpose": silver_output.purpose,
                "standardized_row_count": index,
                "run_id": run.id,
            }
            path = silver_root / f"{safe_file_stem(silver_output.name)}.jsonl"
            write_jsonl(path, [row])
            silver_paths.append(str(path))
            source_evidence.append(
                {
                    "source_id": silver_output.from_source_id,
                    "source_name": silver_output.from_source_name,
                    "silver_output": silver_output.name,
                    "rows": 1,
                    "bytes": path.stat().st_size,
                    "duration_ms": 1,
                    "status": "succeeded",
                }
            )

        gold_rows = [
            {
                "product_id": "demo_product_001",
                "risk_score": 0.82,
                "risk_level": "high",
                "source_count": len(draft.source_refs),
                "silver_output_count": len(draft.silver_outputs),
                "processing_recipes": draft.processing_recipes,
                "run_id": run.id,
            }
        ]
        gold_path = gold_root / f"{safe_file_stem(draft.gold_output)}.jsonl"
        write_jsonl(gold_path, gold_rows)

        silver_bytes = sum(Path(path).stat().st_size for path in silver_paths)
        gold_bytes = gold_path.stat().st_size
        output_bytes = silver_bytes + gold_bytes
        duration_ms = max(1, int((perf_counter() - started) * 1000))
        return TargetDatasetMaterializationResult(
            output_path=str(gold_path),
            row_count=len(gold_rows),
            output_bytes=output_bytes,
            silver_output_paths=silver_paths,
            logs=[
                "local runner materialized planned Silver outputs",
                "local runner materialized planned Gold output",
                "Airflow/Spark execution not triggered in C-4.5",
            ],
            duration_ms=duration_ms,
            source_evidence=source_evidence,
            runtime_evidence={
                "runner": "local_runner",
                "materialization_mode": "local_demo_jsonl",
                "output_format": "jsonl",
                "prepared_output": False,
                "status": "succeeded",
                "duration_ms": duration_ms,
                "source_count": len(draft.source_refs),
                "silver_output_count": len(draft.silver_outputs),
                "silver_bytes": silver_bytes,
                "gold_bytes": gold_bytes,
                "output_bytes": output_bytes,
                "output_path": str(gold_path),
            },
        )

    def materialize_gold_from_silver_parquet(
        self,
        started: float,
        run: TargetDatasetJobRunRecord,
        draft: TargetDatasetDraftRecord,
        silver_paths: list[Path],
    ) -> TargetDatasetMaterializationResult:
        gold_path = gold_run_path(run.id, draft.gold_output)
        gold_path.parent.mkdir(parents=True, exist_ok=True)

        source_evidence = []
        total_rows = 0
        total_bytes = 0
        for silver_output, silver_path in zip(draft.silver_outputs, silver_paths, strict=False):
            metadata = parquet_metadata(silver_path)
            total_rows += metadata["row_count"]
            total_bytes += silver_path.stat().st_size
            source_evidence.append(
                {
                    "source_id": silver_output.from_source_id,
                    "source_name": silver_output.from_source_name,
                    "silver_output": silver_output.name,
                    "rows": metadata["row_count"],
                    "bytes": silver_path.stat().st_size,
                    "duration_ms": 0,
                    "status": "materialized_silver_input",
                    "path": str(silver_path),
                    "format": "parquet",
                }
            )

        gold_rows = build_gold_rows_from_silver_inputs(run, draft, silver_paths, total_rows)
        pq.write_table(pa.Table.from_pylist(gold_rows), gold_path)
        duration_ms = max(1, int((perf_counter() - started) * 1000))
        object_uri = expected_gold_object_uri(run.id, draft.gold_output)
        output_bytes = gold_path.stat().st_size
        return TargetDatasetMaterializationResult(
            output_path=str(gold_path),
            row_count=len(gold_rows),
            output_bytes=output_bytes,
            silver_output_paths=[str(path) for path in silver_paths],
            logs=[
                "materialized Silver parquet inputs read",
                "local Gold parquet materialized",
                "MinIO upload not attempted unless explicitly configured",
            ],
            duration_ms=duration_ms,
            source_evidence=source_evidence,
            runtime_evidence={
                "runner": "local_runner",
                "materialization_mode": "silver_parquet_to_gold",
                "output_format": "parquet",
                "prepared_output": False,
                "status": "succeeded",
                "duration_ms": duration_ms,
                "source_count": len(draft.source_refs),
                "silver_output_count": len(draft.silver_outputs),
                "silver_bytes": total_bytes,
                "gold_bytes": output_bytes,
                "output_bytes": output_bytes,
                "output_path": str(gold_path),
                "object_storage": {
                    "status": "not_uploaded",
                    "reason": "object upload is opt-in and not configured for this local demo run",
                    "object_uri": object_uri,
                },
            },
        )

    def reference_prepared_gold(
        self,
        started: float,
        run: TargetDatasetJobRunRecord,
        draft: TargetDatasetDraftRecord,
        gold_path: Path,
    ) -> TargetDatasetMaterializationResult:
        metadata = parquet_metadata(gold_path)
        silver_paths = []
        source_evidence = []
        for silver_output in draft.silver_outputs:
            silver_path = prepared_silver_path(silver_output.name)
            if silver_path is None:
                source_evidence.append(
                    {
                        "source_id": silver_output.from_source_id,
                        "source_name": silver_output.from_source_name,
                        "silver_output": silver_output.name,
                        "rows": None,
                        "bytes": None,
                        "duration_ms": 0,
                        "status": "missing_prepared_silver",
                    }
                )
                continue

            silver_metadata = parquet_metadata(silver_path)
            silver_paths.append(str(silver_path))
            source_evidence.append(
                {
                    "source_id": silver_output.from_source_id,
                    "source_name": silver_output.from_source_name,
                    "silver_output": silver_output.name,
                    "rows": silver_metadata["row_count"],
                    "bytes": silver_path.stat().st_size,
                    "duration_ms": 0,
                    "status": "referenced_prepared_silver",
                    "path": str(silver_path),
                    "format": "parquet",
                }
            )

        duration_ms = max(1, int((perf_counter() - started) * 1000))
        return TargetDatasetMaterializationResult(
            output_path=str(gold_path),
            row_count=metadata["row_count"],
            output_bytes=gold_path.stat().st_size,
            silver_output_paths=silver_paths,
            logs=[
                "prepared Product Health Gold parquet referenced",
                "local demo JSONL materializer skipped",
                "Airflow/Spark execution not triggered in C-17",
            ],
            duration_ms=duration_ms,
            source_evidence=source_evidence,
            runtime_evidence={
                "runner": "local_runner",
                "materialization_mode": "prepared_gold_reference",
                "output_format": "parquet",
                "prepared_output": True,
                "status": "succeeded",
                "duration_ms": duration_ms,
                "source_count": len(draft.source_refs),
                "silver_output_count": len(draft.silver_outputs),
                "output_bytes": gold_path.stat().st_size,
                "output_path": str(gold_path),
                "row_count_status": "metadata",
                "schema_fields": metadata["schema_fields"],
            },
        )


class TargetDatasetLocalRunnerError(ValueError):
    pass


def write_jsonl(path: Path, rows: list[dict[str, object]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def safe_file_stem(value: str) -> str:
    return "".join(character if character.isalnum() or character in {"_", "-"} else "_" for character in value).strip("_") or "dataset"


def build_gold_rows_from_silver_inputs(
    run: TargetDatasetJobRunRecord,
    draft: TargetDatasetDraftRecord,
    silver_paths: list[Path],
    total_source_rows: int,
) -> list[dict[str, object]]:
    row_count = max(1, min(1000, total_source_rows or len(silver_paths)))
    recipe_text = ",".join(draft.processing_recipes)
    rows = []
    for index in range(row_count):
        risk_score = round(55 + ((index * 13) % 45) + len(silver_paths) * 0.5, 2)
        rows.append(
            {
                "product_id": f"gold_prod_{index + 1:06d}",
                "risk_score": risk_score,
                "risk_level": "high" if risk_score >= 80 else "medium" if risk_score >= 65 else "low",
                "source_count": len(draft.source_refs),
                "silver_output_count": len(draft.silver_outputs),
                "processing_recipes": recipe_text,
                "run_id": run.id,
            }
        )
    return rows


def parquet_metadata(path: Path) -> dict[str, int]:
    parquet_file = pq.ParquetFile(path)
    return {
        "row_count": parquet_file.metadata.num_rows if parquet_file.metadata else 0,
        "schema_fields": len(parquet_file.schema_arrow),
    }
