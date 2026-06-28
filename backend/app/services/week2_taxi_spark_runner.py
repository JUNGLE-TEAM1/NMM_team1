from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from time import perf_counter
from typing import Any

from app.domain.runtime_config import StorageConfig
from app.services.week2_local_runner import Week2RunnerResult, elapsed_ms, path_size, repo_root
from app.services.week2_storage_adapter import StorageLocation, Week2StorageAdapter
from app.services.week2_taxi_batch_runner import GOLD_DATASET_ID, GOLD_TABLE_NAME, REQUIRED_TAXI_COLUMNS


@dataclass(frozen=True)
class TaxiSparkConfig:
    """Taxi Spark evidence 실행에 필요한 입력/출력 설정."""

    input_path: str
    output_root: str | None = None
    output_path: str | None = None
    run_id: str = "run_taxi_spark_local_001"
    profile: str = "demo"
    fixed_date: str | None = None
    demo_limit: int = 10_000
    compression: str = "snappy"
    master: str = "local[1]"
    app_name: str = "asklake-m2-taxi-spark-local"
    driver_memory: str | None = None
    parquet_vectorized_reader: bool = True
    storage: StorageConfig | dict[str, Any] | None = None
    upload_to_object_storage: bool = False


class Week2TaxiSparkRunner:
    """TLC Taxi Parquet을 Spark로 Gold metric Parquet까지 처리한다.

    이번 runner는 Spark 실행 경로 증거를 만들기 위한 얇은 adapter다.
    M3 TransformSpec 기반 일반화는 후속 단계에서 붙인다.
    """

    def run(self, config: TaxiSparkConfig | dict[str, Any]) -> Week2RunnerResult:
        """Spark로 Taxi daily Gold metric을 만들고 Week2RunnerResult로 반환한다."""

        started = perf_counter()
        taxi_config = coerce_config(config)
        logs = [
            {"level": "info", "message": "queued"},
            {"level": "info", "message": "running"},
        ]
        spark = None

        try:
            input_path = resolve_path(taxi_config.input_path)
            if not input_path.exists():
                raise Week2TaxiSparkRunnerError(f"Input path not found: {input_path}")

            storage_adapter = Week2StorageAdapter()
            output_location = output_location_for_config(taxi_config, storage_adapter)
            spark = build_spark_session(taxi_config)
            logs.append({"level": "info", "message": f"spark local session started: {spark.version}"})

            source_df = read_taxi_parquet_frame(spark, input_path)
            scoped_df = scope_taxi_frame(source_df, taxi_config)
            gold_df = build_daily_gold_frame(scoped_df)

            input_row_count = scoped_df.count()
            output_row_count = gold_df.count()
            write_single_parquet(gold_df, output_location.local_path, taxi_config.compression)
            input_bytes = input_path_size(input_path)
            output_bytes = path_size(output_location.local_path)

            task_results = [
                succeeded_task_result("spark_read_taxi", row_count=input_row_count, bytes=input_bytes),
                succeeded_task_result("spark_aggregate_taxi_daily", row_count=output_row_count, bytes=None),
                succeeded_task_result("spark_write_taxi_daily_metrics", row_count=output_row_count, bytes=output_bytes),
            ]
            if taxi_config.upload_to_object_storage:
                upload_result = storage_adapter.upload_file(storage_config_required(taxi_config), output_location)
                task_results.append(
                    succeeded_task_result("spark_upload_taxi_daily_metrics", row_count=output_row_count, bytes=upload_result.bytes)
                )
                logs.append({"level": "info", "message": "taxi spark upload succeeded"})

        except Exception as error:
            logs.append({"level": "error", "message": f"taxi spark failed: {error}"})
            return Week2RunnerResult(
                status="failed",
                task_results=[failed_task_result(str(error))],
                logs=logs,
                duration_ms=elapsed_ms(started),
            )
        finally:
            if spark is not None:
                try:
                    spark.stop()
                except Exception as stop_error:
                    logs.append({"level": "warn", "message": f"spark stop failed after run: {stop_error}"})

        logs.append({"level": "info", "message": "taxi spark succeeded"})
        return Week2RunnerResult(
            status="succeeded",
            task_results=task_results,
            logs=logs,
            row_count=input_row_count,
            bytes=input_bytes,
            duration_ms=elapsed_ms(started),
            output_path=str(output_location.local_path),
            output_row_count=output_row_count,
            output_bytes=output_bytes,
        )


def build_spark_session(config: TaxiSparkConfig) -> Any:
    """master 설정에 맞춰 PySpark session을 만든다."""

    configure_spark_network_environment(config.master)
    try:
        from pyspark.sql import SparkSession
    except ImportError as error:
        raise Week2TaxiSparkRunnerError("pyspark is required for Taxi Spark local evidence") from error

    builder = (
        SparkSession.builder.master(config.master)
        .appName(config.app_name)
        .config("spark.sql.session.timeZone", "UTC")
        .config("spark.ui.enabled", "false")
        .config("spark.sql.parquet.enableVectorizedReader", str(config.parquet_vectorized_reader).lower())
    )
    if config.driver_memory:
        builder = builder.config("spark.driver.memory", config.driver_memory)
    return builder.getOrCreate()


def configure_spark_network_environment(master: str) -> None:
    """local master에서만 localhost gateway를 기본값으로 둔다."""

    if master.startswith("local"):
        os.environ.setdefault("SPARK_LOCAL_IP", "127.0.0.1")


def validate_required_columns(columns: list[str]) -> None:
    """Taxi Gold metric 계산에 필요한 원본 column이 있는지 확인한다."""

    missing = [column for column in REQUIRED_TAXI_COLUMNS if column not in columns]
    if missing:
        raise Week2TaxiSparkRunnerError(f"Missing Taxi column(s): {', '.join(missing)}")


def read_taxi_parquet_frame(spark: Any, input_path: Path) -> Any:
    """파일별 Taxi Parquet schema drift를 공통 타입으로 맞춘 Spark DataFrame을 만든다."""

    paths = taxi_parquet_paths(input_path)
    frames = [canonicalize_taxi_frame(spark.read.parquet(str(path))) for path in paths]
    merged = frames[0]
    for frame in frames[1:]:
        merged = merged.unionByName(frame)
    return merged


def taxi_parquet_paths(input_path: Path) -> list[Path]:
    """단일 파일 또는 디렉터리 입력에서 처리할 Parquet 파일 목록을 구한다."""

    if input_path.is_file():
        return [input_path]
    if input_path.is_dir():
        paths = sorted(path for path in input_path.rglob("*.parquet") if path.is_file())
        if paths:
            return paths
    raise Week2TaxiSparkRunnerError(f"No Parquet input files found: {input_path}")


def canonicalize_taxi_frame(frame: Any) -> Any:
    """월별 Taxi schema 차이를 daily metric에 필요한 공통 타입으로 정규화한다."""

    validate_required_columns(frame.columns)
    functions = spark_functions()
    return frame.select(
        functions.col("tpep_pickup_datetime").cast("timestamp").alias("tpep_pickup_datetime"),
        functions.col("tpep_dropoff_datetime").cast("timestamp").alias("tpep_dropoff_datetime"),
        functions.col("passenger_count").cast("double").alias("passenger_count"),
        functions.col("trip_distance").cast("double").alias("trip_distance"),
        functions.col("fare_amount").cast("double").alias("fare_amount"),
        functions.col("tip_amount").cast("double").alias("tip_amount"),
        functions.col("tolls_amount").cast("double").alias("tolls_amount"),
        functions.col("total_amount").cast("double").alias("total_amount"),
    )


def scope_taxi_frame(frame: Any, config: TaxiSparkConfig) -> Any:
    """demo/fixed/full-month profile에 맞춰 Spark DataFrame 입력 범위를 제한한다."""

    if config.profile == "demo":
        return frame.limit(config.demo_limit)
    if config.profile == "fixed":
        if not config.fixed_date:
            raise Week2TaxiSparkRunnerError("fixed profile requires fixed_date")
        functions = spark_functions()
        target_date = date.fromisoformat(config.fixed_date).isoformat()
        return frame.filter(functions.to_date("tpep_pickup_datetime") == functions.lit(target_date))
    if config.profile == "local-full-month":
        return frame
    raise Week2TaxiSparkRunnerError(f"Unsupported taxi profile: {config.profile}")


def build_daily_gold_frame(frame: Any) -> Any:
    """Taxi row를 날짜별 Gold metric DataFrame으로 집계한다."""

    functions = spark_functions()
    valid_trip = (
        functions.col("tpep_pickup_datetime").isNotNull()
        & functions.col("tpep_dropoff_datetime").isNotNull()
        & (functions.col("tpep_dropoff_datetime") >= functions.col("tpep_pickup_datetime"))
        & (functions.col("trip_distance") >= 0)
        & (functions.col("total_amount") >= 0)
    )
    valid_count = functions.sum(functions.when(valid_trip, 1).otherwise(0)).cast("long")
    duration_minutes = (
        functions.unix_timestamp(functions.col("tpep_dropoff_datetime").cast("timestamp"))
        - functions.unix_timestamp(functions.col("tpep_pickup_datetime").cast("timestamp"))
    ) / functions.lit(60.0)
    base = frame.withColumn("pickup_date", functions.to_date("tpep_pickup_datetime"))
    aggregated = base.groupBy("pickup_date").agg(
        functions.count(functions.lit(1)).cast("long").alias("trip_count"),
        valid_count.alias("valid_trip_count"),
        functions.coalesce(functions.sum(functions.when(valid_trip, functions.col("passenger_count")).otherwise(0)), functions.lit(0))
        .cast("long")
        .alias("total_passenger_count"),
        sum_valid_double("trip_distance", valid_trip).alias("total_trip_distance"),
        sum_valid_double("fare_amount", valid_trip).alias("total_fare_amount"),
        sum_valid_double("tip_amount", valid_trip).alias("total_tip_amount"),
        sum_valid_double("tolls_amount", valid_trip).alias("total_tolls_amount"),
        sum_valid_double("total_amount", valid_trip).alias("total_amount"),
        functions.coalesce(functions.sum(functions.when(valid_trip, duration_minutes).otherwise(0.0)), functions.lit(0.0))
        .cast("double")
        .alias("duration_minutes_sum"),
    )
    return aggregated.select(
        functions.col("pickup_date").cast("date").alias("pickup_date"),
        "trip_count",
        "total_passenger_count",
        "total_trip_distance",
        average_or_null("total_trip_distance", "valid_trip_count").alias("avg_trip_distance"),
        "total_fare_amount",
        "total_tip_amount",
        "total_tolls_amount",
        "total_amount",
        average_or_null("total_amount", "valid_trip_count").alias("avg_total_amount"),
        average_or_null("duration_minutes_sum", "valid_trip_count").alias("avg_duration_minutes"),
        "valid_trip_count",
        (functions.col("trip_count") - functions.col("valid_trip_count")).cast("long").alias("invalid_trip_count"),
    ).orderBy("pickup_date")


def sum_valid_double(column: str, condition: Any) -> Any:
    """valid row에서만 double 합계를 계산한다."""

    functions = spark_functions()
    return functions.coalesce(
        functions.sum(functions.when(condition, functions.col(column).cast("double")).otherwise(0.0)),
        functions.lit(0.0),
    ).cast("double")


def average_or_null(total_column: str, count_column: str) -> Any:
    """Spark column 합계/count를 평균으로 바꾸되 count가 0이면 null을 유지한다."""

    functions = spark_functions()
    return functions.when(
        functions.col(count_column) > 0,
        functions.col(total_column).cast("double") / functions.col(count_column).cast("double"),
    ).otherwise(functions.lit(None).cast("double"))


def write_single_parquet(frame: Any, output_path: Path, compression: str) -> None:
    """Spark가 만든 part file을 기존 M2 evidence shape에 맞는 단일 Parquet 파일로 정리한다."""

    output_path.parent.mkdir(parents=True, exist_ok=True)
    temp_dir = output_path.parent / f".{output_path.stem}_spark_tmp"
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    if output_path.exists():
        output_path.unlink()

    frame.coalesce(1).write.mode("overwrite").option("compression", compression).parquet(str(temp_dir))
    part_files = sorted(temp_dir.glob("part-*.parquet"))
    if not part_files:
        raise Week2TaxiSparkRunnerError(f"Spark did not produce a Parquet part file under {temp_dir}")
    shutil.move(str(part_files[0]), output_path)
    shutil.rmtree(temp_dir)


def output_location_for_config(config: TaxiSparkConfig, storage_adapter: Week2StorageAdapter | None = None) -> StorageLocation:
    """Taxi Spark output을 local path와 S3-compatible object 위치로 해석한다."""

    if config.output_path is not None:
        return StorageLocation(
            uri=None,
            bucket=None,
            prefix="",
            object_key="",
            object_uri=None,
            local_path=resolve_path(config.output_path),
        )

    if config.storage is not None:
        adapter = storage_adapter or Week2StorageAdapter()
        return adapter.build_location(
            config.storage,
            run_id=config.run_id,
            file_name=f"{GOLD_TABLE_NAME}.parquet",
            local_root=config.output_root,
            default_prefix="taxi/gold/daily_metrics/run_id=<run_id>/",
        )

    if config.output_root is None:
        raise Week2TaxiSparkRunnerError("Either output_path or output_root is required")

    return StorageLocation(
        uri=None,
        bucket=None,
        prefix=f"taxi/gold/daily_metrics/run_id={config.run_id}/",
        object_key="",
        object_uri=None,
        local_path=resolve_path(config.output_root)
        / "taxi"
        / "gold"
        / "daily_metrics"
        / f"run_id={config.run_id}"
        / f"{GOLD_TABLE_NAME}.parquet",
    )


def storage_config_required(config: TaxiSparkConfig) -> StorageConfig:
    """upload option이 켜졌을 때 storage 설정이 있는지 검증한다."""

    if config.storage is None:
        raise Week2TaxiSparkRunnerError("storage config is required for object upload")
    return StorageConfig.model_validate(config.storage)


def resolve_path(path_value: str) -> Path:
    """상대 경로를 repository root 기준 절대 경로로 해석한다."""

    path = Path(path_value)
    return path if path.is_absolute() else repo_root() / path


def input_path_size(path: Path) -> int | None:
    """파일 또는 디렉터리 Taxi 입력의 실제 처리 대상 bytes를 계산한다."""

    if path.is_file():
        return path_size(path)
    if path.is_dir():
        return sum(file.stat().st_size for file in path.rglob("*.parquet") if file.is_file())
    return None


def coerce_config(config: TaxiSparkConfig | dict[str, Any]) -> TaxiSparkConfig:
    """dict 입력도 TaxiSparkConfig로 맞춘다."""

    if isinstance(config, TaxiSparkConfig):
        return config
    storage = config.get("storage")
    if storage is not None:
        config = {**config, "storage": StorageConfig.model_validate(storage)}
    return TaxiSparkConfig(**config)


def spark_functions() -> Any:
    """pyspark.sql.functions를 지연 import한다."""

    try:
        from pyspark.sql import functions
    except ImportError as error:
        raise Week2TaxiSparkRunnerError("pyspark is required for Taxi Spark local evidence") from error
    return functions


def succeeded_task_result(node_id: str, row_count: int, bytes: int | None) -> dict[str, Any]:
    """성공한 Taxi Spark 단계를 Week2RunnerResult task result 모양으로 만든다."""

    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": row_count,
        "bytes": bytes,
        "error": None,
    }


def failed_task_result(error: str) -> dict[str, Any]:
    """Taxi Spark 실패를 Week2RunnerResult task result 모양으로 만든다."""

    return {
        "node_id": "node_taxi_spark",
        "status": "failed",
        "attempt": 1,
        "row_count": None,
        "bytes": None,
        "error": error,
    }


class Week2TaxiSparkRunnerError(ValueError):
    """M2 Taxi Spark local 실행 중 검증 가능한 실패."""

    pass
