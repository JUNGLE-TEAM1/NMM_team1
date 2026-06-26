import json
from pathlib import Path

import pyarrow.parquet as pq

from app.domain.runtime_config import RuntimeConfig
from app.services.week2_spark_runner import Week2SparkRunner


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
