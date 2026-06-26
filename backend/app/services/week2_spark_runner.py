import json
from pathlib import Path
from time import perf_counter
from typing import Any

from app.domain.runtime_config import RuntimeConfig
from app.services.week2_local_runner import Week2RunnerResult, elapsed_ms, path_size, repo_root


class Week2SparkRunner:
    """M2 SparkRunner 경계를 검증하는 local Parquet smoke 실행기."""

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
            input_path = resolve_path(config.input_path)
            output_path = output_path_for_config(config, input_path, run_id)
            rows = read_rows(input_path, config.input_format)
            write_parquet(rows, output_path, config.options)
            input_bytes = path_size(input_path)
            output_bytes = path_size(output_path)
        except Exception as error:
            logs.append({"level": "error", "message": f"spark_runner failed: {error}"})
            return Week2RunnerResult(
                status="failed",
                task_results=[failed_task_result(str(error))],
                logs=logs,
                duration_ms=elapsed_ms(started),
            )

        logs.append({"level": "info", "message": "spark_runner smoke succeeded"})
        return Week2RunnerResult(
            status="succeeded",
            task_results=[
                succeeded_task_result("spark_read", row_count=len(rows), bytes=input_bytes),
                succeeded_task_result("spark_write", row_count=len(rows), bytes=output_bytes),
            ],
            logs=logs,
            row_count=len(rows),
            bytes=input_bytes,
            duration_ms=elapsed_ms(started),
            output_path=str(output_path),
            output_row_count=len(rows),
            output_bytes=output_bytes,
        )


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

    if config.output_path is not None:
        return resolve_path(config.output_path)
    if config.output_root is None:
        raise Week2SparkRunnerError("Either output_path or output_root is required")
    output_root = resolve_path(config.output_root)
    return output_root / "spark_smoke" / f"run_id={run_id}" / f"{input_path.stem}.parquet"


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


def succeeded_task_result(node_id: str, row_count: int, bytes: int | None) -> dict[str, Any]:
    """성공한 read/write 단계를 Week2RunnerResult의 task result 모양으로 만든다."""

    return {
        "node_id": node_id,
        "status": "succeeded",
        "attempt": 1,
        "row_count": row_count,
        "bytes": bytes,
        "error": None,
    }


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
