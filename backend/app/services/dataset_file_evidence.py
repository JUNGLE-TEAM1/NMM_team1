from pathlib import Path

import pyarrow.parquet as pq

from app.domain.schemas import DatasetFileEvidence
from app.services.data_lake_paths import GOLD_ROOT, SILVER_ROOT
from app.services.prepared_product_health_outputs import prepared_gold_candidate_names


def source_file_evidence(path: str) -> DatasetFileEvidence:
    resolved = resolve_path(path)
    if resolved is None:
        return DatasetFileEvidence(status="missing", path=path, message=f"local path를 찾을 수 없습니다: {path}")
    return evidence_for_path(resolved, display_path=path)


def silver_file_evidence(dataset_name: str) -> DatasetFileEvidence:
    lake_evidence = named_parquet_evidence(
        dataset_name=dataset_name,
        directory=SILVER_ROOT,
        fallback_message="",
    )
    if lake_evidence.status == "file_backed":
        return lake_evidence
    return named_parquet_evidence(
        dataset_name=dataset_name,
        directory=Path("data/local_sources/product_health/silver"),
        fallback_message=f"{dataset_name}에 연결된 prepared silver parquet를 찾지 못했습니다.",
    )


def gold_file_evidence(output_name: str) -> DatasetFileEvidence:
    for candidate in prepared_gold_candidate_names(output_name):
        for lake_candidate in sorted(GOLD_ROOT.glob(f"run_id=*/{candidate}.parquet"), reverse=True):
            return evidence_for_path(lake_candidate, display_path=str(lake_candidate))
        evidence = named_parquet_evidence(
            dataset_name=candidate,
            directory=Path("data/local_sources/product_health/gold"),
            fallback_message="",
        )
        if evidence.status == "file_backed":
            return evidence
    return DatasetFileEvidence(
        status="missing",
        path=str(Path("data/local_sources/product_health/gold") / f"{output_name}.parquet"),
        message=f"{output_name}에 연결된 prepared gold parquet를 찾지 못했습니다.",
    )


def named_parquet_evidence(dataset_name: str, directory: Path, fallback_message: str) -> DatasetFileEvidence:
    candidate = directory / f"{dataset_name}.parquet"
    resolved = resolve_path(str(candidate))
    if resolved is None:
        return DatasetFileEvidence(status="missing", path=str(candidate), message=fallback_message)
    return evidence_for_path(resolved, display_path=str(candidate))


def evidence_for_path(path: Path, display_path: str) -> DatasetFileEvidence:
    if path.is_dir():
        parquet_files = sorted(file for file in path.rglob("*.parquet") if file.is_file())
        if not parquet_files:
            return DatasetFileEvidence(
                status="metadata_only",
                path=display_path,
                bytes=sum(file.stat().st_size for file in path.rglob("*") if file.is_file()),
                message="폴더는 있지만 file-backed parquet evidence는 없습니다.",
            )
        first = parquet_files[0]
        metadata = parquet_metadata(first)
        return DatasetFileEvidence(
            status="file_backed",
            path=display_path,
            bytes=sum(file.stat().st_size for file in parquet_files),
            row_count=metadata["row_count"],
            row_count_status="metadata_first_file",
            schema_fields=metadata["schema_fields"],
            message=f"{len(parquet_files)}개 parquet file 중 {first.name} metadata를 확인했습니다.",
        )

    if path.suffix.lower() == ".parquet":
        metadata = parquet_metadata(path)
        return DatasetFileEvidence(
            status="file_backed",
            path=display_path,
            bytes=path.stat().st_size,
            row_count=metadata["row_count"],
            row_count_status="metadata",
            schema_fields=metadata["schema_fields"],
            message="parquet metadata를 확인했습니다.",
        )

    if path.is_file():
        return DatasetFileEvidence(
            status="file_backed",
            path=display_path,
            bytes=path.stat().st_size,
            row_count_status="not_measured",
            message="local file 존재와 크기를 확인했습니다.",
        )

    return DatasetFileEvidence(status="missing", path=display_path, message=f"local file evidence를 찾지 못했습니다: {display_path}")


def parquet_metadata(path: Path) -> dict[str, int]:
    parquet_file = pq.ParquetFile(path)
    return {
        "row_count": parquet_file.metadata.num_rows if parquet_file.metadata else 0,
        "schema_fields": len(parquet_file.schema_arrow),
    }


def resolve_path(path: str) -> Path | None:
    requested = Path(path).expanduser()
    candidates = [requested] if requested.is_absolute() else [Path.cwd() / requested, Path(__file__).resolve().parents[3] / requested]
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()
    return None
