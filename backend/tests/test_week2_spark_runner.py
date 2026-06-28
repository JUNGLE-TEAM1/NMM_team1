import hashlib
import hmac
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


def test_week2_spark_runner_writes_multiple_product_health_sources(tmp_path: Path) -> None:
    """M2가 여러 source를 pass-through로 읽고 source별 실행 증거를 남기는지 검증한다."""

    input_root = tmp_path / "raw"
    output_root = tmp_path / "week2"
    input_root.mkdir()
    reviews_path = input_root / "reviews_seed.jsonl"
    behavior_path = input_root / "behavior_events_seed.jsonl"
    delivery_path = input_root / "delivery_trips_seed.jsonl"
    products_path = input_root / "product_master_seed.jsonl"
    write_jsonl(reviews_path, [{"review_id": "R1", "product_id": "B1", "rating": 2}])
    write_jsonl(
        behavior_path,
        [
            {"event_id": "E1", "product_id": "B1", "event_type": "view"},
            {"event_id": "E2", "product_id": "B1", "event_type": "purchase"},
        ],
    )
    write_jsonl(delivery_path, [{"trip_id": "T1", "product_id": "B1", "late_minutes": 18}])
    write_jsonl(products_path, [{"product_id": "B1", "category": "gift_cards"}])

    runtime_config = RuntimeConfig(
        runner="spark_runner",
        output_format="parquet",
        output_root=str(output_root),
        source_inputs=[
            {"source_id": "reviews_seed", "input_format": "jsonl", "input_path": str(reviews_path)},
            {"source_id": "behavior_events_seed", "input_format": "jsonl", "input_path": str(behavior_path)},
            {"source_id": "delivery_trips_seed", "input_format": "jsonl", "input_path": str(delivery_path)},
            {"source_id": "product_master_seed", "input_format": "jsonl", "input_path": str(products_path)},
        ],
        options={"output_file_name_template": "{source_id}.parquet"},
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_product_health_runtime_001")

    output_path = output_root / "spark_smoke" / "run_id=run_product_health_runtime_001"
    assert result.status == "succeeded"
    assert result.row_count == 5
    assert result.output_row_count == 5
    assert result.bytes == sum(path.stat().st_size for path in [reviews_path, behavior_path, delivery_path, products_path])
    assert result.output_path == str(output_path)
    assert pq.read_table(output_path / "reviews_seed.parquet").num_rows == 1
    assert pq.read_table(output_path / "behavior_events_seed.parquet").num_rows == 2
    assert pq.read_table(output_path / "delivery_trips_seed.parquet").num_rows == 1
    assert pq.read_table(output_path / "product_master_seed.parquet").num_rows == 1
    task_by_node = {task["node_id"]: task for task in result.task_results}
    assert task_by_node["spark_read:reviews_seed"]["source_id"] == "reviews_seed"
    assert task_by_node["spark_write:behavior_events_seed"]["output_path"] == str(
        output_path / "behavior_events_seed.parquet"
    )


def test_week2_spark_runner_executes_l6_silver_preview_spec(tmp_path: Path) -> None:
    """M3 L6 Silver spec을 받아 preview Parquet와 표준 실행 결과를 만드는지 검증한다."""

    source_path = tmp_path / "reviews.jsonl"
    output_root = tmp_path / "week2"
    write_jsonl(
        source_path,
        [
            {"review_id": "R1", "product_id": "B1", "rating": "5", "review_text": "good", "raw_blob": {"x": 1}},
            {"review_id": "R2", "product_id": "B1", "rating": "2", "review_text": "bad", "raw_blob": {"x": 2}},
        ],
    )
    silver_spec = {
        "artifact_type": "silver_transform_spec",
        "write_mode": "preview_only",
        "operations": [
            {
                "operation_id": "select_silver_fields",
                "operation": "select",
                "params": {"columns": ["product_id", "rating", "review_text", "raw_blob"]},
            },
            {
                "operation_id": "cast_rating",
                "operation": "cast",
                "params": {"source_path": "rating", "target_type": "integer"},
            },
            {
                "operation_id": "mask_review_text",
                "operation": "mask",
                "params": {"source_path": "review_text"},
            },
            {
                "operation_id": "json_string_raw_blob",
                "operation": "json_string",
                "params": {"source_path": "raw_blob", "target_name": "raw_blob"},
            },
        ],
    }
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_root=str(output_root),
        transform_spec=silver_spec,
        options={"output_file_name": "silver_preview.parquet"},
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_l6_silver_preview_001")

    output_path = output_root / "l6_preview" / "run_id=run_l6_silver_preview_001" / "silver_preview.parquet"
    rows = pq.read_table(output_path).to_pylist()
    assert result.status == "succeeded"
    assert result.row_count == 2
    assert result.output_row_count == 2
    assert result.output_path == str(output_path)
    preview_rows = [{key: row[key] for key in ["product_id", "rating", "review_text", "raw_blob"]} for row in rows]
    assert preview_rows == [
        {"product_id": "B1", "rating": 5, "review_text": "***MASKED***", "raw_blob": '{"x": 1}'},
        {"product_id": "B1", "rating": 2, "review_text": "***MASKED***", "raw_blob": '{"x": 2}'},
    ]


def test_week2_spark_runner_executes_l6_gold_aggregate_spec(tmp_path: Path) -> None:
    """M3 L6 Gold aggregate spec을 받아 preview metric Parquet를 만드는지 검증한다."""

    source_path = tmp_path / "silver_reviews.jsonl"
    output_root = tmp_path / "week2"
    write_jsonl(
        source_path,
        [
            {"product_id": "B1", "rating": 5},
            {"product_id": "B1", "rating": 3},
            {"product_id": "B2", "rating": 1},
        ],
    )
    gold_spec = {
        "artifact_type": "gold_generation_spec",
        "write_mode": "preview_only",
        "operations": [
            {
                "operation_id": "aggregate_gold_product_rating",
                "operation": "aggregate",
                "params": {
                    "input_ref": "silver_preview",
                    "group_by": ["product_id"],
                    "dimensions": ["product_id"],
                    "measures": [
                        {"name": "review_count", "operation": "count", "field": "*"},
                        {"name": "avg_rating", "operation": "avg", "field": "rating"},
                    ],
                    "time_window": {"enabled": False, "field": None, "window": None},
                    "cardinality_guard": {"max_groups": 10, "on_exceed": "block_preview"},
                },
            }
        ],
    }
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_root=str(output_root),
        transform_spec=gold_spec,
        options={"output_file_name": "gold_preview.parquet"},
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_l6_gold_preview_001")

    output_path = output_root / "l6_preview" / "run_id=run_l6_gold_preview_001" / "gold_preview.parquet"
    rows = sorted(pq.read_table(output_path).to_pylist(), key=lambda row: row["product_id"])
    assert result.status == "succeeded"
    assert result.row_count == 3
    assert result.output_row_count == 2
    preview_rows = [{key: row[key] for key in ["product_id", "review_count", "avg_rating"]} for row in rows]
    assert preview_rows == [
        {"product_id": "B1", "review_count": 2, "avg_rating": 4.0},
        {"product_id": "B2", "review_count": 1, "avg_rating": 1.0},
    ]


def test_week2_spark_runner_executes_l6_nested_and_quarantine_operations(tmp_path: Path) -> None:
    """M3 allowlist의 nested/explode/quarantine operation을 preview로 실행한다."""

    source_path = tmp_path / "reviews.jsonl"
    output_root = tmp_path / "week2"
    write_jsonl(
        source_path,
        [
            {
                "review_id": "R1",
                "product_id": "B1",
                "rating": 5,
                "review_meta": {"country": "KR", "verified": True},
                "tags": [{"name": "fast"}, {"name": "fresh"}],
            },
            {
                "review_id": "R2",
                "product_id": "B2",
                "rating": 0,
                "review_meta": {"country": "US", "verified": False},
                "tags": [{"name": "broken"}],
            },
        ],
    )
    silver_spec = {
        "artifact_type": "silver_transform_spec",
        "write_mode": "preview_only",
        "operations": [
            {
                "operation_id": "select_nested_fields",
                "operation": "select",
                "params": {"columns": ["review_id", "product_id", "rating", "review_meta", "tags"]},
            },
            {
                "operation_id": "flatten_review_meta",
                "operation": "flatten_struct",
                "params": {"source_path": "review_meta", "target_name": "meta"},
            },
            {
                "operation_id": "quarantine_bad_rating",
                "operation": "quarantine_if_invalid",
                "params": {
                    "source_path": "rating",
                    "rule": {"type": "range", "min": 1, "max": 5, "reason": "rating must be between 1 and 5"},
                },
            },
            {
                "operation_id": "explode_tags",
                "operation": "explode_array",
                "params": {"source_path": "tags", "target_name": "tag", "cardinality_guard": {"max_output_rows": 10}},
            },
        ],
    }
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_root=str(output_root),
        transform_spec=silver_spec,
        options={"output_file_name": "silver_nested_preview.parquet"},
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_l6_nested_preview_001")

    output_path = output_root / "l6_preview" / "run_id=run_l6_nested_preview_001" / "silver_nested_preview.parquet"
    rows = sorted(pq.read_table(output_path).to_pylist(), key=lambda row: (row["review_id"], row["tag_name"]))
    assert result.status == "succeeded"
    assert result.row_count == 2
    assert result.output_row_count == 3
    assert [
        {
            "review_id": row["review_id"],
            "meta_country": row["meta_country"],
            "meta_verified": row["meta_verified"],
            "tag_name": row["tag_name"],
            "_quarantined": row["_quarantined"],
        }
        for row in rows
    ] == [
        {"review_id": "R1", "meta_country": "KR", "meta_verified": True, "tag_name": "fast", "_quarantined": False},
        {"review_id": "R1", "meta_country": "KR", "meta_verified": True, "tag_name": "fresh", "_quarantined": False},
        {"review_id": "R2", "meta_country": "US", "meta_verified": False, "tag_name": "broken", "_quarantined": True},
    ]
    assert rows[-1]["_quarantine_reason"] == "rating must be between 1 and 5"


def test_week2_spark_runner_executes_l6_hash_operation(tmp_path: Path, monkeypatch) -> None:
    """hash operation은 HMAC-SHA256 secret ref가 있을 때만 preview digest를 만든다."""

    monkeypatch.setenv("ASKLAKE_TEST_HASH_SECRET", "demo-secret")
    source_path = tmp_path / "reviews.jsonl"
    output_root = tmp_path / "week2"
    write_jsonl(source_path, [{"reviewer_email": "user@example.com", "rating": 5}])
    silver_spec = {
        "artifact_type": "silver_transform_spec",
        "write_mode": "preview_only",
        "operations": [
            {
                "operation_id": "hash_reviewer_email",
                "operation": "hash",
                "params": {
                    "source_path": "reviewer_email",
                    "target_column": "reviewer_email_hash",
                    "hash_policy": {
                        "algorithm": "hmac_sha256",
                        "salt_secret_id": "ASKLAKE_TEST_HASH_SECRET",
                        "salt_version": "v1",
                    },
                },
            }
        ],
    }
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_root=str(output_root),
        transform_spec=silver_spec,
        options={"output_file_name": "silver_hash_preview.parquet"},
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_l6_hash_preview_001")

    output_path = output_root / "l6_preview" / "run_id=run_l6_hash_preview_001" / "silver_hash_preview.parquet"
    rows = pq.read_table(output_path).to_pylist()
    expected_hash = hmac.new(b"demo-secret", b"user@example.com", hashlib.sha256).hexdigest()
    assert result.status == "succeeded"
    assert [{key: row[key] for key in ["rating", "reviewer_email_hash"]} for row in rows] == [
        {"rating": 5, "reviewer_email_hash": expected_hash}
    ]


def test_week2_spark_runner_fails_l6_hash_without_policy(tmp_path: Path) -> None:
    """hash_policy가 없으면 PII hash를 성공으로 위장하지 않는다."""

    source_path = tmp_path / "reviews.jsonl"
    output_root = tmp_path / "week2"
    write_jsonl(source_path, [{"reviewer_email": "user@example.com"}])
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_root=str(output_root),
        transform_spec={
            "artifact_type": "silver_transform_spec",
            "write_mode": "preview_only",
            "operations": [
                {
                    "operation_id": "hash_reviewer_email",
                    "operation": "hash",
                    "params": {"source_path": "reviewer_email"},
                }
            ],
        },
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_l6_hash_missing_policy_001")

    assert result.status == "failed"
    assert "hash operation requires hash_policy" in result.task_results[0]["error"]


def test_week2_spark_runner_fails_l6_unsupported_operation(tmp_path: Path) -> None:
    """지원하지 않는 L6 operation은 성공으로 위장하지 않고 실패 결과로 남긴다."""

    source_path = tmp_path / "reviews.jsonl"
    output_root = tmp_path / "week2"
    write_jsonl(source_path, [{"review_id": "R1", "product_id": "B1"}])
    runtime_config = RuntimeConfig(
        runner="spark_runner",
        input_format="jsonl",
        input_path=str(source_path),
        output_format="parquet",
        output_root=str(output_root),
        transform_spec={
            "artifact_type": "silver_transform_spec",
            "write_mode": "preview_only",
            "operations": [
                {
                    "operation_id": "generated_code_execution",
                    "operation": "generated_code_execution",
                    "params": {"source_path": "items"},
                }
            ],
        },
    )

    result = Week2SparkRunner().run(runtime_config, run_id="run_l6_unsupported_001")

    assert result.status == "failed"
    assert result.task_results[0]["status"] == "failed"
    assert "Unsupported L6 operation" in result.task_results[0]["error"]


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
