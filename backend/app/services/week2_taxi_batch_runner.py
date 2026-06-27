from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path
from time import perf_counter
from typing import Any

from app.services.week2_local_runner import Week2RunnerResult, elapsed_ms, path_size, repo_root


REQUIRED_TAXI_COLUMNS = [
    "tpep_pickup_datetime",
    "tpep_dropoff_datetime",
    "passenger_count",
    "trip_distance",
    "fare_amount",
    "tip_amount",
    "tolls_amount",
    "total_amount",
]

GOLD_DATASET_ID = "dataset_taxi_daily_metrics_gold"
GOLD_TABLE_NAME = "gold_taxi_daily_metrics"


@dataclass(frozen=True)
class TaxiBatchConfig:
    """Taxi local batch evidence 실행에 필요한 입력 경로와 실행 option."""

    input_path: str
    output_root: str
    run_id: str = "run_taxi_local_batch_001"
    profile: str = "fixed"
    fixed_date: str | None = "2024-01-01"
    demo_limit: int = 10_000
    compression: str = "snappy"


class Week2TaxiBatchRunner:
    """TLC Taxi Parquet을 일별 Gold metric Parquet으로 바꾸는 M2 local batch runner."""

    def run(self, config: TaxiBatchConfig | dict[str, Any]) -> Week2RunnerResult:
        """Taxi batch를 실행하고 M5가 소비 가능한 Week2RunnerResult 모양으로 돌려준다."""

        started = perf_counter()
        batch_config = coerce_config(config)
        logs = [
            {"level": "info", "message": "queued"},
            {"level": "info", "message": "running"},
        ]

        try:
            input_path = resolve_path(batch_config.input_path)
            source_table = read_taxi_parquet(input_path)
            scoped_table = scope_table(source_table, batch_config)
            gold_table = build_daily_metrics_table(scoped_table)
            output_path = output_path_for_config(batch_config)
            write_gold_parquet(gold_table, output_path, batch_config.compression)
            input_bytes = path_size(input_path)
            output_bytes = path_size(output_path)
        except Exception as error:
            logs.append({"level": "error", "message": f"taxi batch failed: {error}"})
            return Week2RunnerResult(
                status="failed",
                task_results=[failed_task_result(str(error))],
                logs=logs,
                duration_ms=elapsed_ms(started),
            )

        logs.append({"level": "info", "message": "taxi batch succeeded"})
        return Week2RunnerResult(
            status="succeeded",
            task_results=[
                succeeded_task_result("node_source_taxi", row_count=scoped_table.num_rows, bytes=input_bytes),
                succeeded_task_result("node_aggregate_taxi_daily", row_count=gold_table.num_rows, bytes=None),
                succeeded_task_result(
                    "node_load_taxi_daily_metrics",
                    row_count=gold_table.num_rows,
                    bytes=output_bytes,
                ),
            ],
            logs=logs,
            row_count=scoped_table.num_rows,
            bytes=input_bytes,
            duration_ms=elapsed_ms(started),
            output_path=str(output_path),
            output_row_count=gold_table.num_rows,
            output_bytes=output_bytes,
        )


def read_taxi_parquet(path: Path) -> Any:
    """필수 Taxi column만 Parquet에서 읽고 schema를 확인한다."""

    if not path.exists():
        raise Week2TaxiBatchRunnerError(f"Input file not found: {path}")

    _, parquet, _ = pyarrow_modules()
    schema = parquet.read_schema(path)
    missing = [column for column in REQUIRED_TAXI_COLUMNS if column not in schema.names]
    if missing:
        raise Week2TaxiBatchRunnerError(f"Missing Taxi column(s): {', '.join(missing)}")
    return parquet.read_table(path, columns=REQUIRED_TAXI_COLUMNS)


def scope_table(table: Any, config: TaxiBatchConfig) -> Any:
    """profile에 따라 demo/fixed/full-month 입력 범위를 고른다."""

    if config.profile == "demo":
        return table.slice(0, config.demo_limit)
    if config.profile == "fixed":
        if not config.fixed_date:
            raise Week2TaxiBatchRunnerError("fixed profile requires fixed_date")
        return filter_pickup_date(table, config.fixed_date)
    if config.profile == "local-full-month":
        return table
    raise Week2TaxiBatchRunnerError(f"Unsupported taxi profile: {config.profile}")


def filter_pickup_date(table: Any, fixed_date: str) -> Any:
    """pickup 날짜가 fixed_date인 row만 남긴다."""

    arrow, _, compute = pyarrow_modules()
    target_date = date.fromisoformat(fixed_date)
    pickup_dates = pickup_date_array(table)
    mask = compute.equal(pickup_dates, arrow.scalar(target_date, type=arrow.date32()))
    return table.filter(compute.fill_null(mask, False))


def build_daily_metrics_table(table: Any) -> Any:
    """Taxi row를 pickup_date 기준 Gold daily metric table로 집계한다."""

    arrow, _, compute = pyarrow_modules()
    gold_schema = gold_metrics_schema(arrow)
    if table.num_rows == 0:
        return arrow.Table.from_pylist([], schema=gold_schema)

    base_table = table.append_column("pickup_date", pickup_date_array(table))
    total_by_date = group_total_rows(base_table, arrow)
    valid_table = base_table.filter(valid_trip_mask(base_table))
    valid_by_date = group_valid_rows(valid_table, arrow, compute) if valid_table.num_rows else {}

    rows = []
    for pickup_date, trip_count in sorted(total_by_date.items(), key=lambda item: str(item[0])):
        valid_metrics = valid_by_date.get(pickup_date, {})
        valid_trip_count = int_or_zero(valid_metrics.get("valid_trip_count"))
        rows.append(
            {
                "pickup_date": pickup_date,
                "trip_count": trip_count,
                "total_passenger_count": int_or_zero(valid_metrics.get("total_passenger_count")),
                "total_trip_distance": float_or_zero(valid_metrics.get("total_trip_distance")),
                "avg_trip_distance": nullable_float(valid_metrics.get("avg_trip_distance")),
                "total_fare_amount": float_or_zero(valid_metrics.get("total_fare_amount")),
                "total_tip_amount": float_or_zero(valid_metrics.get("total_tip_amount")),
                "total_tolls_amount": float_or_zero(valid_metrics.get("total_tolls_amount")),
                "total_amount": float_or_zero(valid_metrics.get("total_amount")),
                "avg_total_amount": nullable_float(valid_metrics.get("avg_total_amount")),
                "avg_duration_minutes": nullable_float(valid_metrics.get("avg_duration_minutes")),
                "valid_trip_count": valid_trip_count,
                "invalid_trip_count": trip_count - valid_trip_count,
            }
        )

    return arrow.Table.from_pylist(rows, schema=gold_schema)


def group_total_rows(table: Any, arrow: Any) -> dict[date, int]:
    """날짜별 전체 입력 row 수를 센다."""

    flagged = table.append_column("_row_count", arrow.array([1] * table.num_rows, type=arrow.int64()))
    grouped = flagged.group_by("pickup_date").aggregate([("_row_count", "sum")])
    return {row["pickup_date"]: int_or_zero(row["_row_count_sum"]) for row in grouped.to_pylist()}


def group_valid_rows(table: Any, arrow: Any, compute: Any) -> dict[date, dict[str, Any]]:
    """valid row만 대상으로 합계/평균 metric을 만든다."""

    duration_minutes = compute.divide(
        compute.cast(
            compute.subtract(table["tpep_dropoff_datetime"], table["tpep_pickup_datetime"]),
            arrow.int64(),
        ),
        60 * 1_000_000,
    )
    metric_table = table.append_column("_valid_count", arrow.array([1] * table.num_rows, type=arrow.int64()))
    metric_table = metric_table.append_column("duration_minutes", duration_minutes)
    grouped = metric_table.group_by("pickup_date").aggregate(
        [
            ("_valid_count", "sum"),
            ("passenger_count", "sum"),
            ("trip_distance", "sum"),
            ("trip_distance", "mean"),
            ("fare_amount", "sum"),
            ("tip_amount", "sum"),
            ("tolls_amount", "sum"),
            ("total_amount", "sum"),
            ("total_amount", "mean"),
            ("duration_minutes", "mean"),
        ]
    )

    result = {}
    for row in grouped.to_pylist():
        result[row["pickup_date"]] = {
            "valid_trip_count": row["_valid_count_sum"],
            "total_passenger_count": row["passenger_count_sum"],
            "total_trip_distance": row["trip_distance_sum"],
            "avg_trip_distance": row["trip_distance_mean"],
            "total_fare_amount": row["fare_amount_sum"],
            "total_tip_amount": row["tip_amount_sum"],
            "total_tolls_amount": row["tolls_amount_sum"],
            "total_amount": row["total_amount_sum"],
            "avg_total_amount": row["total_amount_mean"],
            "avg_duration_minutes": row["duration_minutes_mean"],
        }
    return result


def valid_trip_mask(table: Any) -> Any:
    """Gold metric에 포함할 정상 Taxi row 조건을 만든다."""

    _, _, compute = pyarrow_modules()
    checks = [
        compute.is_valid(table["tpep_pickup_datetime"]),
        compute.is_valid(table["tpep_dropoff_datetime"]),
        compute.greater_equal(table["tpep_dropoff_datetime"], table["tpep_pickup_datetime"]),
        compute.greater_equal(table["trip_distance"], 0),
        compute.greater_equal(table["total_amount"], 0),
    ]
    mask = checks[0]
    for check in checks[1:]:
        mask = compute.and_kleene(mask, check)
    return compute.fill_null(mask, False)


def pickup_date_array(table: Any) -> Any:
    """pickup timestamp에서 date32 pickup_date를 만든다."""

    arrow, _, compute = pyarrow_modules()
    return compute.cast(
        compute.floor_temporal(table["tpep_pickup_datetime"], unit="day"),
        arrow.date32(),
    )


def output_path_for_config(config: TaxiBatchConfig) -> Path:
    """run_id별 Gold Parquet output path를 만든다."""

    return (
        resolve_path(config.output_root)
        / "taxi"
        / "gold"
        / "daily_metrics"
        / f"run_id={config.run_id}"
        / f"{GOLD_TABLE_NAME}.parquet"
    )


def write_gold_parquet(table: Any, output_path: Path, compression: str) -> None:
    """Gold metric table을 Parquet으로 저장한다."""

    _, parquet, _ = pyarrow_modules()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    parquet.write_table(table, output_path, compression=compression)


def gold_metrics_schema(arrow: Any) -> Any:
    """M2 Taxi 첫 Gold output schema를 고정한다."""

    return arrow.schema(
        [
            ("pickup_date", arrow.date32()),
            ("trip_count", arrow.int64()),
            ("total_passenger_count", arrow.int64()),
            ("total_trip_distance", arrow.float64()),
            ("avg_trip_distance", arrow.float64()),
            ("total_fare_amount", arrow.float64()),
            ("total_tip_amount", arrow.float64()),
            ("total_tolls_amount", arrow.float64()),
            ("total_amount", arrow.float64()),
            ("avg_total_amount", arrow.float64()),
            ("avg_duration_minutes", arrow.float64()),
            ("valid_trip_count", arrow.int64()),
            ("invalid_trip_count", arrow.int64()),
        ]
    )


def resolve_path(path_value: str) -> Path:
    """상대 경로를 repository root 기준으로 해석한다."""

    path = Path(path_value)
    return path if path.is_absolute() else repo_root() / path


def coerce_config(config: TaxiBatchConfig | dict[str, Any]) -> TaxiBatchConfig:
    """dict 입력도 dataclass config로 맞춘다."""

    return config if isinstance(config, TaxiBatchConfig) else TaxiBatchConfig(**config)


def pyarrow_modules() -> tuple[Any, Any, Any]:
    """Parquet batch 처리에 필요한 pyarrow 모듈을 지연 import한다."""

    try:
        import pyarrow as arrow
        import pyarrow.compute as compute
        import pyarrow.parquet as parquet
    except ImportError as error:
        raise Week2TaxiBatchRunnerError("pyarrow is required for Taxi batch evidence") from error
    return arrow, parquet, compute


def int_or_zero(value: Any) -> int:
    """None metric 값을 0으로 대체해 정수 합계 필드를 안정적으로 만든다."""

    return int(value) if value is not None else 0


def float_or_zero(value: Any) -> float:
    """None metric 값을 0.0으로 대체해 실수 합계 필드를 안정적으로 만든다."""

    return float(value) if value is not None else 0.0


def nullable_float(value: Any) -> float | None:
    """평균처럼 값이 없을 수 있는 metric은 None을 보존하고 숫자만 float로 바꾼다."""

    return float(value) if value is not None else None


def succeeded_task_result(node_id: str, row_count: int, bytes: int | None) -> dict[str, Any]:
    """성공한 Taxi batch 단계를 Week2RunnerResult task result 모양으로 만든다."""

    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": row_count,
        "bytes": bytes,
        "error": None,
    }


def failed_task_result(error: str) -> dict[str, Any]:
    """Taxi batch 실패를 Week2RunnerResult task result 모양으로 만든다."""

    return {
        "node_id": "node_taxi_batch",
        "status": "failed",
        "attempt": 1,
        "row_count": None,
        "bytes": None,
        "error": error,
    }


class Week2TaxiBatchRunnerError(ValueError):
    """M2 Taxi batch 실행 중 검증 가능한 실패."""

    pass
