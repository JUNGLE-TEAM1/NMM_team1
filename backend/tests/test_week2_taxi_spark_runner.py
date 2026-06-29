from datetime import datetime
import os
from pathlib import Path
import shutil

import pyarrow as pa
import pyarrow.parquet as pq
import pytest

from app.services.week2_taxi_spark_runner import TaxiSparkConfig, Week2TaxiSparkRunner, configure_spark_network_environment
from scripts.week2_m2_taxi_spark_local_evidence import runner_identity


pytest.importorskip("pyspark")
pytestmark = pytest.mark.skipif(shutil.which("java") is None, reason="PySpark local mode smoke requires Java")


def test_taxi_spark_runner_does_not_force_local_ip_for_cluster_master(monkeypatch: pytest.MonkeyPatch) -> None:
    """Docker Spark cluster에서는 worker가 driver를 찾아야 하므로 localhost를 강제하지 않는다."""

    monkeypatch.delenv("SPARK_LOCAL_IP", raising=False)

    configure_spark_network_environment("spark://m2-spark-master:7077")

    assert "SPARK_LOCAL_IP" not in os.environ


def test_taxi_spark_evidence_labels_cluster_master() -> None:
    """spark:// master evidence는 Docker cluster runner로 표시한다."""

    runner_name, runtime_note = runner_identity("spark://m2-spark-master:7077")

    assert runner_name == "taxi_spark_docker_cluster_runner"
    assert "Docker Spark cluster" in runtime_note


def write_taxi_fixture(path: Path) -> None:
    """PySpark Taxi smoke에 필요한 최소 Parquet fixture를 만든다."""

    write_taxi_fixture_with_passenger_counts(path, [1, 2, 3])


def write_taxi_fixture_with_passenger_counts(path: Path, passenger_counts: list[int | float]) -> None:
    """passenger_count type 차이를 재현할 수 있는 Taxi Parquet fixture를 만든다."""

    table = pa.table(
        {
            "tpep_pickup_datetime": [
                datetime(2024, 1, 1, 10, 0),
                datetime(2024, 1, 1, 11, 0),
                datetime(2024, 1, 2, 9, 0),
            ],
            "tpep_dropoff_datetime": [
                datetime(2024, 1, 1, 10, 30),
                datetime(2024, 1, 1, 11, 45),
                datetime(2024, 1, 2, 9, 20),
            ],
            "passenger_count": passenger_counts,
            "trip_distance": [2.5, 3.5, -1.0],
            "fare_amount": [12.0, 18.0, 5.0],
            "tip_amount": [2.0, 3.0, 0.0],
            "tolls_amount": [0.0, 1.0, 0.0],
            "total_amount": [16.0, 25.0, -5.0],
        }
    )
    pq.write_table(table, path)


def test_taxi_spark_runner_writes_daily_gold_metrics(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """PySpark local mode가 Taxi Parquet을 읽고 Gold daily metric Parquet을 쓰는지 검증한다."""

    monkeypatch.setenv("SPARK_LOCAL_IP", "127.0.0.1")
    input_path = tmp_path / "yellow_tripdata_2024-01.parquet"
    output_root = tmp_path / "spark_results"
    write_taxi_fixture(input_path)

    result = Week2TaxiSparkRunner().run(
        TaxiSparkConfig(
            input_path=str(input_path),
            output_root=str(output_root),
            run_id="run_taxi_spark_test_fixed",
            profile="fixed",
            fixed_date="2024-01-01",
            master="local[1]",
        )
    )

    output_path = Path(result.output_path or "")
    gold_rows = pq.ParquetFile(output_path).read().to_pylist()

    assert result.status == "succeeded"
    assert result.row_count == 2
    assert result.output_row_count == 1
    assert result.bytes == input_path.stat().st_size
    assert result.output_bytes == output_path.stat().st_size
    assert output_path.name == "gold_taxi_daily_metrics.parquet"
    assert gold_rows == [
        {
            "pickup_date": datetime(2024, 1, 1).date(),
            "trip_count": 2,
            "total_passenger_count": 3,
            "total_trip_distance": 6.0,
            "avg_trip_distance": 3.0,
            "total_fare_amount": 30.0,
            "total_tip_amount": 5.0,
            "total_tolls_amount": 1.0,
            "total_amount": 41.0,
            "avg_total_amount": 20.5,
            "avg_duration_minutes": 37.5,
            "valid_trip_count": 2,
            "invalid_trip_count": 0,
        }
    ]


def test_taxi_spark_runner_reports_directory_input_bytes(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """디렉터리 입력이면 Parquet 파일 크기 합계를 input bytes로 보고한다."""

    monkeypatch.setenv("SPARK_LOCAL_IP", "127.0.0.1")
    input_dir = tmp_path / "yellow_tripdata"
    input_dir.mkdir()
    first_input = input_dir / "yellow_tripdata_2024-01.parquet"
    second_input = input_dir / "yellow_tripdata_2024-02.parquet"
    output_root = tmp_path / "spark_results"
    write_taxi_fixture(first_input)
    write_taxi_fixture_with_passenger_counts(second_input, [1.0, 2.0, 3.0])

    result = Week2TaxiSparkRunner().run(
        TaxiSparkConfig(
            input_path=str(input_dir),
            output_root=str(output_root),
            run_id="run_taxi_spark_test_directory",
            profile="local-full-month",
            master="local[1]",
        )
    )

    assert result.status == "succeeded"
    assert result.row_count == 6
    assert result.bytes == first_input.stat().st_size + second_input.stat().st_size
