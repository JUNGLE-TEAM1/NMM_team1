from datetime import datetime
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from app.services.week2_taxi_batch_runner import TaxiBatchConfig, Week2TaxiBatchRunner


def write_taxi_fixture(path: Path) -> None:
    """Taxi runner 테스트에 필요한 최소 Parquet fixture를 만든다."""

    table = pa.table(
        {
            "VendorID": [1, 1, 2, 2],
            "tpep_pickup_datetime": [
                datetime(2024, 1, 1, 10, 0),
                datetime(2024, 1, 1, 11, 0),
                datetime(2024, 1, 2, 9, 0),
                datetime(2024, 1, 2, 12, 0),
            ],
            "tpep_dropoff_datetime": [
                datetime(2024, 1, 1, 10, 30),
                datetime(2024, 1, 1, 11, 45),
                datetime(2024, 1, 2, 9, 20),
                datetime(2024, 1, 2, 12, 20),
            ],
            "passenger_count": [1, 2, 3, 1],
            "trip_distance": [2.5, 3.5, -1.0, 1.0],
            "fare_amount": [12.0, 18.0, 5.0, 7.0],
            "tip_amount": [2.0, 3.0, 0.0, 1.0],
            "tolls_amount": [0.0, 1.0, 0.0, 0.0],
            "total_amount": [16.0, 25.0, -5.0, 9.0],
        }
    )
    pq.write_table(table, path)


def test_taxi_batch_runner_writes_daily_gold_metrics(tmp_path: Path) -> None:
    """한 날짜로 고정한 Taxi 입력이 Gold daily metric Parquet으로 변환되는지 검증한다."""

    input_path = tmp_path / "yellow_tripdata_2024-01.parquet"
    output_root = tmp_path / "taxi_results"
    write_taxi_fixture(input_path)

    result = Week2TaxiBatchRunner().run(
        TaxiBatchConfig(
            input_path=str(input_path),
            output_root=str(output_root),
            run_id="run_taxi_test_fixed",
            profile="fixed",
            fixed_date="2024-01-01",
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


def test_taxi_batch_runner_reports_invalid_rows(tmp_path: Path) -> None:
    """전체 fixture 실행에서는 날짜별 invalid row count가 Gold metric에 남아야 한다."""

    input_path = tmp_path / "yellow_tripdata_2024-01.parquet"
    output_root = tmp_path / "taxi_results"
    write_taxi_fixture(input_path)

    result = Week2TaxiBatchRunner().run(
        TaxiBatchConfig(
            input_path=str(input_path),
            output_root=str(output_root),
            run_id="run_taxi_test_full",
            profile="local-full-month",
        )
    )

    gold_rows = pq.ParquetFile(result.output_path).read().to_pylist()
    jan_second = [row for row in gold_rows if str(row["pickup_date"]) == "2024-01-02"][0]

    assert result.status == "succeeded"
    assert result.row_count == 4
    assert result.output_row_count == 2
    assert jan_second["trip_count"] == 2
    assert jan_second["valid_trip_count"] == 1
    assert jan_second["invalid_trip_count"] == 1
