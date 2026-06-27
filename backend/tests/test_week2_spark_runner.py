import json
from pathlib import Path

import pyarrow.parquet as pq

from app.domain.runtime_config import RuntimeConfig, StorageConfig
from app.services import week2_spark_runner
from app.services.week2_spark_runner import Week2SparkRunner
from app.services.week2_storage_adapter import StorageLocation, StorageUploadResult


def write_jsonl(path: Path, rows: list[dict]) -> None:
    """테스트용 JSONL 입력 파일을 만든다."""

    path.write_text("\n".join(json.dumps(row) for row in rows) + "\n", encoding="utf-8")


def test_week2_spark_runner_writes_parquet_and_returns_metrics(tmp_path: Path) -> None:
    """JSONL 입력이 Parquet output과 실행 metric으로 이어지는지 검증한다."""

    source_path = tmp_path / "reviews.jsonl"
    output_path = tmp_path / "out" / "reviews.parquet"
    write_jsonl(
        source_path,
        [
            {"review_id": "R1", "product_id": "B1", "rating": 5},
            {"review_id": "R2", "product_id": "B2", "rating": 4},
        ],
    )
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_path=str(output_path),
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_spark_smoke_001")

    assert result.status == "succeeded"
    assert result.row_count == 2
    assert result.output_row_count == 2
    assert result.bytes == source_path.stat().st_size
    assert result.output_bytes and result.output_bytes > 0
    assert result.duration_ms and result.duration_ms > 0
    assert result.output_path == str(output_path)
    assert output_path.exists()
    assert pq.read_table(output_path).num_rows == 2


def test_week2_spark_runner_resolves_container_sample_fallback(tmp_path: Path, monkeypatch) -> None:
    """Docker image 안에서 backend/samples가 samples로 복사된 경우를 검증한다."""

    samples_dir = tmp_path / "samples"
    samples_dir.mkdir()
    source_path = samples_dir / "reviews.jsonl"
    output_path = tmp_path / "out" / "reviews.parquet"
    write_jsonl(source_path, [{"review_id": "R1", "product_id": "B1", "rating": 5}])
    monkeypatch.setattr(week2_spark_runner, "repo_root", lambda: tmp_path)

    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path="backend/samples/reviews.jsonl",
        output_format="parquet",
        output_path=str(output_path),
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_spark_smoke_001")

    assert result.status == "succeeded"
    assert result.row_count == 1
    assert result.bytes == source_path.stat().st_size
    assert output_path.exists()


def test_week2_spark_runner_uses_storage_adapter_output_location(tmp_path: Path) -> None:
    """storage 설정이 있으면 S3-compatible prefix에 대응하는 local fallback path에 쓴다."""

    source_path = tmp_path / "reviews.jsonl"
    output_root = tmp_path / "week2"
    write_jsonl(source_path, [{"review_id": "R1", "product_id": "B1", "rating": 5}])

    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_root=str(output_root),
        storage=StorageConfig(
            profile="minio",
            bucket="asklake-demo",
            prefix="reviews/gold/run_id=<run_id>/",
            local_fallback_root=str(output_root),
        ),
        options={"output_file_name": "dataset_reviews_gold.parquet"},
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_reviews_demo_001")

    output_path = output_root / "reviews" / "gold" / "run_id=run_reviews_demo_001" / "dataset_reviews_gold.parquet"
    assert result.status == "succeeded"
    assert result.output_path == str(output_path)
    assert output_path.exists()
    assert pq.read_table(output_path).num_rows == 1


def test_week2_spark_runner_uploads_output_when_option_enabled(tmp_path: Path, monkeypatch) -> None:
    """명시 옵션이 켜진 경우 local Parquet 생성 뒤 MinIO upload task를 남긴다."""

    source_path = tmp_path / "reviews.jsonl"
    output_root = tmp_path / "week2"
    upload_adapter = FakeStorageAdapter(output_root)
    write_jsonl(source_path, [{"review_id": "R1", "product_id": "B1", "rating": 5}])
    monkeypatch.setattr(week2_spark_runner, "Week2StorageAdapter", lambda: upload_adapter)

    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_root=str(output_root),
        storage=StorageConfig(
            profile="minio",
            bucket="asklake-demo",
            endpoint="http://localhost:9000",
            prefix="reviews/gold/run_id=<run_id>/",
            local_fallback_root=str(output_root),
        ),
        options={
            "output_file_name": "dataset_reviews_gold.parquet",
            "upload_to_object_storage": True,
        },
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_reviews_demo_001")

    assert result.status == "succeeded"
    assert [task["node_id"] for task in result.task_results] == ["spark_read", "spark_write", "spark_upload"]
    assert result.task_results[-1]["bytes"] == upload_adapter.uploads[0].bytes
    assert upload_adapter.uploaded_paths[0].exists()
    assert result.logs[-1]["message"] == "spark_runner upload succeeded"


class FakeStorageAdapter:
    """SparkRunner가 storage adapter를 호출하는지만 보는 테스트 double."""

    def __init__(self, output_root: Path) -> None:
        self.output_root = output_root
        self.uploads: list[StorageUploadResult] = []
        self.uploaded_paths: list[Path] = []

    def build_location(self, storage, run_id: str, file_name: str, local_root=None, default_prefix=None) -> StorageLocation:
        prefix = f"reviews/gold/run_id={run_id}/"
        return StorageLocation(
            uri=f"s3://asklake-demo/{prefix}",
            bucket="asklake-demo",
            prefix=prefix,
            object_key=f"{prefix}{file_name}",
            object_uri=f"s3://asklake-demo/{prefix}{file_name}",
            local_path=self.output_root / "reviews" / "gold" / f"run_id={run_id}" / file_name,
        )

    def upload_file(self, storage, location: StorageLocation, http_client=None) -> StorageUploadResult:
        self.uploaded_paths.append(location.local_path)
        result = StorageUploadResult(
            object_uri=location.object_uri,
            endpoint="http://localhost:9000",
            status_code=200,
            etag='"etag-demo"',
            bytes=location.local_path.stat().st_size,
        )
        self.uploads.append(result)
        return result
