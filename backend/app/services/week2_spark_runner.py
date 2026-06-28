import json
from pathlib import Path
from time import perf_counter
from typing import Any

from app.domain.runtime_config import RuntimeConfig, RuntimeSourceInput
from app.services.week2_storage_adapter import StorageLocation, Week2StorageAdapter
from app.services.week2_local_runner import Week2RunnerResult, elapsed_ms, path_size, repo_root


class Week2SparkRunner:
    """M2 SparkRunner 경계를 검증하는 local Parquet smoke 실행기.

    이름은 SparkRunner지만 현재 구현은 local pyarrow smoke다. 중요한 것은 M5가 호출할 수 있는
    runner/result 경계를 먼저 고정하고, 이후 PySpark나 cluster Spark로 내부 실행 방식을 바꿀 수 있게 하는 것이다.
    """

    def run(
        self,
        runtime_config: RuntimeConfig | dict[str, Any],
        run_id: str = "run_spark_smoke_001",
    ) -> Week2RunnerResult:
        """설정에 적힌 입력 파일을 읽고 Parquet로 저장한 뒤 표준 실행 결과를 돌려준다."""

        started = perf_counter()
        config = RuntimeConfig.model_validate(runtime_config)
        logs = [
            {"level": "info", "message": "queued"},
            {"level": "info", "message": "running"},
        ]

        try:
            if config.source_inputs:
                return run_source_inputs(config, run_id, started, logs)

            if config.input_path is None or config.input_format is None:
                raise Week2SparkRunnerError("input_path and input_format are required")
            input_path = resolve_input_path(config.input_path)
            storage_adapter = Week2StorageAdapter()
            output_location = output_location_for_config(config, input_path, run_id, storage_adapter)
            output_path = output_location.local_path
            rows = read_rows(input_path, config.input_format)
            write_parquet(rows, output_path, config.options)
            input_bytes = path_size(input_path)
            output_bytes = path_size(output_path)
            logs.append({"level": "info", "message": "spark_runner smoke succeeded"})
            task_results = [
                succeeded_task_result("spark_read", row_count=len(rows), bytes=input_bytes),
                succeeded_task_result("spark_write", row_count=len(rows), bytes=output_bytes),
            ]
            if should_upload_to_object_storage(config):
                # upload는 local write 이후의 추가 evidence다. 실패하면 전체 runner가 실패로 내려가서
                # M5 Catalog가 remote object가 없는 결과를 성공으로 착각하지 않게 한다.
                upload_result = storage_adapter.upload_file(config.storage, output_location)
                task_results.append(succeeded_task_result("spark_upload", row_count=len(rows), bytes=upload_result.bytes))
                logs.append({"level": "info", "message": "spark_runner upload succeeded"})
        except Exception as error:
            logs.append({"level": "error", "message": f"spark_runner failed: {error}"})
            return Week2RunnerResult(
                status="failed",
                task_results=[failed_task_result(str(error))],
                logs=logs,
                duration_ms=elapsed_ms(started),
            )

        return Week2RunnerResult(
            status="succeeded",
            task_results=task_results,
            logs=logs,
            row_count=len(rows),
            bytes=input_bytes,
            duration_ms=elapsed_ms(started),
            output_path=str(output_path),
            output_row_count=len(rows),
            output_bytes=output_bytes,
        )


def run_source_inputs(
    config: RuntimeConfig,
    run_id: str,
    started: float,
    logs: list[dict[str, str]],
) -> Week2RunnerResult:
    """여러 source를 의미 변환 없이 source별 Parquet output과 evidence로 남긴다."""

    storage_adapter = Week2StorageAdapter()
    task_results: list[dict[str, Any]] = []
    output_paths: list[Path] = []
    total_rows = 0
    total_input_bytes = 0
    total_output_bytes = 0

    for source in config.source_inputs:
        ensure_local_file_source(source)
        input_format = source_effective_format(source)
        input_path = resolve_input_path(source_effective_path(source))
        output_location = output_location_for_source_config(config, source, run_id, storage_adapter)
        output_path = output_location.local_path
        rows = read_rows(input_path, input_format)
        write_parquet(rows, output_path, merged_options(config, source))
        input_bytes = path_size(input_path) or 0
        output_bytes = path_size(output_path) or 0
        output_paths.append(output_path)
        total_rows += len(rows)
        total_input_bytes += input_bytes
        total_output_bytes += output_bytes
        task_results.append(
            succeeded_task_result(
                f"spark_read:{source.source_id}",
                row_count=len(rows),
                bytes=input_bytes,
                source_id=source.source_id,
                source_type=source.source_type,
                input_path=str(input_path),
                input_format=input_format,
            )
        )
        task_results.append(
            succeeded_task_result(
                f"spark_write:{source.source_id}",
                row_count=len(rows),
                bytes=output_bytes,
                source_id=source.source_id,
                output_path=str(output_path),
            )
        )
        if should_upload_to_object_storage(config):
            upload_result = storage_adapter.upload_file(config.storage, output_location)
            task_results.append(
                succeeded_task_result(
                    f"spark_upload:{source.source_id}",
                    row_count=len(rows),
                    bytes=upload_result.bytes,
                    source_id=source.source_id,
                    output_path=upload_result.object_uri,
                )
            )

    logs.append({"level": "info", "message": "spark_runner multi-source smoke succeeded"})
    output_root = output_paths[0].parent if output_paths else runtime_output_root(config, run_id)
    return Week2RunnerResult(
        status="succeeded",
        task_results=task_results,
        logs=logs,
        row_count=total_rows,
        bytes=total_input_bytes,
        duration_ms=elapsed_ms(started),
        output_path=str(output_root),
        output_row_count=total_rows,
        output_bytes=total_output_bytes,
    )


def ensure_local_file_source(source: RuntimeSourceInput) -> None:
    """현재 runner smoke에서 실제 실행 가능한 source type인지 확인한다."""

    if source.source_type == "local_file":
        return
    raise Week2SparkRunnerError(
        f"Unsupported source_type for Week2SparkRunner local smoke: {source.source_type}"
    )


def source_effective_format(source: RuntimeSourceInput) -> str:
    """새 `format` 또는 legacy `input_format` 중 실제 reader가 쓸 값을 돌려준다."""

    input_format = source.effective_format
    if input_format is None:
        raise Week2SparkRunnerError(f"source {source.source_id} requires format or input_format")
    return input_format


def source_effective_path(source: RuntimeSourceInput) -> str:
    """새 `path` 또는 legacy `input_path` 중 실제 reader가 쓸 값을 돌려준다."""

    input_path = source.effective_path
    if input_path is None:
        raise Week2SparkRunnerError(f"source {source.source_id} requires path or input_path")
    return input_path


def read_rows(path: Path, input_format: str) -> list[dict[str, Any]]:
    """입력 format에 맞는 reader로 파일을 읽어 dict row 목록으로 바꾼다."""

    if not path.exists():
        raise Week2SparkRunnerError(f"Input file not found: {path}")
    if input_format == "jsonl":
        return read_jsonl(path)
    if input_format == "json":
        return read_json(path)
    if input_format == "parquet":
        return read_parquet(path)
    raise Week2SparkRunnerError(f"Unsupported input format: {input_format}")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    """JSONL 파일을 한 줄씩 읽어 row 목록으로 변환한다."""

    rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as source_file:
        for line_number, line in enumerate(source_file, start=1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as error:
                raise Week2SparkRunnerError(f"Invalid JSONL at line {line_number}: {error}") from error
            if not isinstance(row, dict):
                raise Week2SparkRunnerError(f"JSONL row must be an object at line {line_number}")
            rows.append(row)
    return rows


def read_json(path: Path) -> list[dict[str, Any]]:
    """JSON object 또는 JSON array 입력을 row 목록으로 변환한다."""

    with path.open(encoding="utf-8") as source_file:
        payload = json.load(source_file)
    if isinstance(payload, list):
        if not all(isinstance(row, dict) for row in payload):
            raise Week2SparkRunnerError("JSON array rows must be objects")
        return payload
    if isinstance(payload, dict):
        return [payload]
    raise Week2SparkRunnerError("JSON input must be an object or array of objects")


def read_parquet(path: Path) -> list[dict[str, Any]]:
    """Parquet 파일을 읽어 row 목록으로 변환한다."""

    _, parquet = pyarrow_modules()
    return parquet.read_table(path).to_pylist()


def write_parquet(rows: list[dict[str, Any]], output_path: Path, options: dict[str, Any]) -> None:
    """row 목록을 Parquet 파일로 저장한다."""

    arrow, parquet = pyarrow_modules()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    compression = options.get("compression", "snappy")
    table = arrow.Table.from_pylist(rows)
    parquet.write_table(table, output_path, compression=compression)


def output_path_for_config(config: RuntimeConfig, input_path: Path, run_id: str) -> Path:
    """직접 지정한 output_path 또는 output_root/run_id 규칙으로 결과 경로를 만든다."""

    return output_location_for_config(config, input_path, run_id).local_path


def output_location_for_config(
    config: RuntimeConfig,
    input_path: Path,
    run_id: str,
    storage_adapter: Week2StorageAdapter | None = None,
) -> StorageLocation:
    """RuntimeConfig에서 S3-compatible URI와 local output path를 함께 계산한다.

    직접 `output_path`가 있으면 기존 테스트/호출 호환성을 우선한다. `storage`가 있으면
    `Week2StorageAdapter`를 통해 local path와 remote object key를 같은 prefix에서 계산한다.
    """

    if config.output_path is not None:
        return StorageLocation(
            uri=None,
            bucket=None,
            prefix="",
            object_key="",
            object_uri=None,
            local_path=resolve_path(config.output_path),
        )
    output_file_name = config.options.get("output_file_name") or f"{input_path.stem}.parquet"
    if config.storage is not None:
        adapter = storage_adapter or Week2StorageAdapter()
        return adapter.build_location(
            config.storage,
            run_id=run_id,
            file_name=output_file_name,
            local_root=config.output_root,
            default_prefix="spark_smoke/run_id=<run_id>/",
        )
    if config.output_root is None:
        raise Week2SparkRunnerError("Either output_path or output_root is required")
    output_root = resolve_path(config.output_root)
    return StorageLocation(
        uri=None,
        bucket=None,
        prefix=f"spark_smoke/run_id={run_id}/",
        object_key="",
        object_uri=None,
        local_path=output_root / "spark_smoke" / f"run_id={run_id}" / output_file_name,
    )


def output_location_for_source_config(
    config: RuntimeConfig,
    source: RuntimeSourceInput,
    run_id: str,
    storage_adapter: Week2StorageAdapter | None = None,
) -> StorageLocation:
    """source별 output 파일 위치를 RuntimeConfig의 공통 prefix 아래로 계산한다."""

    file_name = source_output_file_name(config, source)
    if config.storage is not None:
        adapter = storage_adapter or Week2StorageAdapter()
        return adapter.build_location(
            config.storage,
            run_id=run_id,
            file_name=file_name,
            local_root=config.output_root,
            default_prefix="spark_smoke/run_id=<run_id>/",
        )
    output_root = runtime_output_root(config, run_id)
    return StorageLocation(
        uri=None,
        bucket=None,
        prefix=f"spark_smoke/run_id={run_id}/",
        object_key="",
        object_uri=None,
        local_path=output_root / file_name,
    )


def runtime_output_root(config: RuntimeConfig, run_id: str) -> Path:
    """multi-source output을 담을 run 단위 directory를 계산한다."""

    if config.output_root is None:
        if config.storage is None:
            raise Week2SparkRunnerError("output_root or storage is required for source_inputs")
        return resolve_path(config.storage.local_fallback_root) / "spark_smoke" / f"run_id={run_id}"
    return resolve_path(config.output_root) / "spark_smoke" / f"run_id={run_id}"


def source_output_file_name(config: RuntimeConfig, source: RuntimeSourceInput) -> str:
    """source별 output 파일명을 만든다. 변환 의미가 아니라 storage naming만 담당한다."""

    if source.output_file_name:
        file_name = source.output_file_name
    else:
        template = config.options.get("output_file_name_template")
        file_name = str(template).format(source_id=source.source_id) if template else f"{source.source_id}.parquet"
    if Path(file_name).name != file_name:
        raise Week2SparkRunnerError("source output file name must not include directory segments")
    if not file_name:
        raise Week2SparkRunnerError("source output file name is required")
    return file_name


def merged_options(config: RuntimeConfig, source: RuntimeSourceInput) -> dict[str, Any]:
    """공통 runner option과 source별 option을 합친다."""

    return {**config.options, **source.options}


def should_upload_to_object_storage(config: RuntimeConfig) -> bool:
    """명시 옵션이 켜지고 storage 설정이 있을 때만 object upload를 수행한다.

    기본값을 false로 둔 이유는 MinIO가 없는 개발/CI 환경에서도 기존 local fallback smoke가 재현되어야 하기 때문이다.
    """

    return config.storage is not None and config.options.get("upload_to_object_storage") is True


def resolve_input_path(path_value: str) -> Path:
    """Docker smoke처럼 sample fixture 위치가 달라져도 입력 파일을 찾는다."""

    path = Path(path_value)
    if path.is_absolute():
        return path

    root = repo_root()
    candidates = [
        root / path,
        root / path.name,
        root / "samples" / path.name,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


def resolve_path(path_value: str) -> Path:
    """상대 경로는 repository root 기준 절대 경로로 해석한다."""

    path = Path(path_value)
    return path if path.is_absolute() else repo_root() / path


def pyarrow_modules() -> tuple[Any, Any]:
    """Parquet read/write에 필요한 pyarrow 모듈을 지연 import한다."""

    try:
        import pyarrow as arrow
        import pyarrow.parquet as parquet
    except ImportError as error:
        raise Week2SparkRunnerError("pyarrow is required for parquet read/write smoke") from error
    return arrow, parquet


def succeeded_task_result(
    node_id: str,
    row_count: int,
    bytes: int | None,
    **extra: Any,
) -> dict[str, Any]:
    """성공한 read/write 단계를 Week2RunnerResult의 task result 모양으로 만든다."""

    result = {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": row_count,
        "bytes": bytes,
        "error": None,
    }
    result.update(extra)
    return result


def failed_task_result(error: str) -> dict[str, Any]:
    """runner 실패를 Week2RunnerResult의 task result 모양으로 만든다."""

    return {
        "node_id": "spark_runner",
        "status": "failed",
        "attempt": 1,
        "row_count": None,
        "bytes": None,
        "error": error,
    }


class Week2SparkRunnerError(ValueError):
    """M2 SparkRunner smoke 실행 중 발생한 검증 가능한 실패."""

    pass
