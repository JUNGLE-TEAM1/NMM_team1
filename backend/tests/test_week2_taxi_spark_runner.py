from datetime import datetime
from pathlib import Path
import shutil

import pyarrow as pa
import pyarrow.parquet as pq
import pytest

from app.services.week2_taxi_spark_runner import TaxiSparkConfig, Week2TaxiSparkRunner


pytest.importorskip("pyspark")
pytestmark = pytest.mark.skipif(shutil.which("java") is None, reason="PySpark local mode smoke requires Java")


def write_taxi_fixture(path: Path) -> None:
    """PySpark Taxi smoke에 필요한 최소 Parquet fixture를 만든다."""

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
            "passenger_count": [1, 2, 3],
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
