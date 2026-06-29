import hashlib
import hmac
import json
import os
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from time import perf_counter
from typing import Any

from app.domain.runtime_config import RuntimeConfig, RuntimeSourceInput
from app.services.week2_storage_adapter import StorageLocation, Week2StorageAdapter
from app.services.week2_local_runner import Week2RunnerResult, elapsed_ms, path_size, repo_root


L6_PREVIEW_SUPPORTED_OPERATIONS = {
    "select",
    "rename",
    "cast",
    "parse_timestamp",
    "normalize_null",
    "flatten_struct",
    "explode_array",
    "json_string",
    "mask",
    "hash",
    "drop",
    "quarantine_if_invalid",
    "aggregate",
}


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
            if config.transform_spec is not None or config.transform_spec_path is not None:
                return run_l6_preview_spec(config, run_id, started, logs)

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


def run_l6_preview_spec(
    config: RuntimeConfig,
    run_id: str,
    started: float,
    logs: list[dict[str, str]],
) -> Week2RunnerResult:
    """M3 L6 preview-only spec을 작은 입력에 적용하고 표준 runner 결과를 만든다."""

    spec = load_l6_preview_spec(config)
    validate_l6_preview_spec(spec)
    input_paths, rows = read_runtime_input_rows(config)
    output_rows = execute_l6_preview_operations(rows, spec)
    storage_adapter = Week2StorageAdapter()
    output_location = output_location_for_l6_preview(config, spec, run_id, storage_adapter)
    output_path = output_location.local_path
    write_parquet(output_rows, output_path, config.options)

    input_bytes = sum(path_size(path) or 0 for path in input_paths)
    output_bytes = path_size(output_path)
    task_results = [
        succeeded_task_result(
            "l6_read_input",
            row_count=len(rows),
            bytes=input_bytes,
            input_paths=[str(path) for path in input_paths],
        ),
        succeeded_task_result(
            f"l6_execute:{spec.get('artifact_type', 'transform_spec')}",
            row_count=len(output_rows),
            bytes=None,
            operation_count=len(spec.get("operations", [])),
            write_mode=spec.get("write_mode"),
        ),
        succeeded_task_result("l6_write_preview", row_count=len(output_rows), bytes=output_bytes, output_path=str(output_path)),
    ]

    if should_upload_to_object_storage(config):
        upload_result = storage_adapter.upload_file(config.storage, output_location)
        task_results.append(succeeded_task_result("l6_upload_preview", row_count=len(output_rows), bytes=upload_result.bytes))
        logs.append({"level": "info", "message": "l6 preview upload succeeded"})

    logs.append({"level": "info", "message": "l6 preview spec executed"})
    return Week2RunnerResult(
        status="succeeded",
        task_results=task_results,
        logs=logs,
        row_count=len(rows),
        bytes=input_bytes,
        duration_ms=elapsed_ms(started),
        output_path=str(output_path),
        output_row_count=len(output_rows),
        output_bytes=output_bytes,
    )


def load_l6_preview_spec(config: RuntimeConfig) -> dict[str, Any]:
    """RuntimeConfig 안의 inline spec 또는 spec file을 읽는다."""

    if config.transform_spec is not None:
        return config.transform_spec
    if config.transform_spec_path is None:
        raise Week2SparkRunnerError("transform_spec or transform_spec_path is required")
    spec_path = resolve_path(config.transform_spec_path)
    if not spec_path.exists():
        raise Week2SparkRunnerError(f"transform_spec_path not found: {spec_path}")
    payload = json.loads(spec_path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise Week2SparkRunnerError("transform_spec_path must contain a JSON object")
    return payload


def validate_l6_preview_spec(spec: dict[str, Any]) -> None:
    """L6 preview 실행 전에 write mode와 operation 목록을 보수적으로 확인한다."""

    if spec.get("write_mode") != "preview_only":
        raise Week2SparkRunnerError("L6 preview spec must use write_mode=preview_only")
    operations = spec.get("operations")
    if not isinstance(operations, list):
        raise Week2SparkRunnerError("L6 preview spec operations must be a list")
    request_state = spec.get("request_state")
    if spec.get("artifact_type") == "gold_generation_spec" and request_state not in {None, "approved"} and not operations:
        raise Week2SparkRunnerError(f"Gold L6 spec is not executable because request_state={request_state}")


def read_runtime_input_rows(config: RuntimeConfig) -> tuple[list[Path], list[dict[str, Any]]]:
    """단일 입력 또는 source_inputs를 preview 실행용 row 목록으로 읽는다."""

    if config.source_inputs:
        input_paths: list[Path] = []
        rows: list[dict[str, Any]] = []
        for source in config.source_inputs:
            ensure_local_file_source(source)
            input_format = source_effective_format(source)
            input_path = resolve_input_path(source_effective_path(source))
            input_paths.append(input_path)
            rows.extend(read_rows(input_path, input_format))
        return input_paths, rows

    if config.input_path is None or config.input_format is None:
        raise Week2SparkRunnerError("input_path and input_format are required for L6 preview")
    input_path = resolve_input_path(config.input_path)
    return [input_path], read_rows(input_path, config.input_format)


def execute_l6_preview_operations(rows: list[dict[str, Any]], spec: dict[str, Any]) -> list[dict[str, Any]]:
    """지원 가능한 L6 operation만 순서대로 실행한다."""

    current = [dict(row) for row in rows]
    for operation in spec["operations"]:
        operation_name = operation.get("operation")
        operation_id = operation.get("operation_id", operation_name)
        params = operation.get("params", {})
        if operation_name not in L6_PREVIEW_SUPPORTED_OPERATIONS:
            raise Week2SparkRunnerError(f"Unsupported L6 operation: {operation_name} ({operation_id})")
        if not isinstance(params, dict):
            raise Week2SparkRunnerError(f"L6 operation params must be an object: {operation_id}")
        current = apply_l6_preview_operation(current, operation_name, params)
    return current


def apply_l6_preview_operation(rows: list[dict[str, Any]], operation: str, params: dict[str, Any]) -> list[dict[str, Any]]:
    """operation 이름에 맞는 작은 local preview 변환을 호출한다."""

    if operation == "select":
        return select_rows(rows, params)
    if operation == "rename":
        return rename_rows(rows, params)
    if operation == "cast":
        return cast_rows(rows, params)
    if operation == "parse_timestamp":
        return parse_timestamp_rows(rows, params)
    if operation == "normalize_null":
        return normalize_null_rows(rows, params)
    if operation == "flatten_struct":
        return flatten_struct_rows(rows, params)
    if operation == "explode_array":
        return explode_array_rows(rows, params)
    if operation == "json_string":
        return json_string_rows(rows, params)
    if operation == "mask":
        return mask_rows(rows, params)
    if operation == "hash":
        return hash_rows(rows, params)
    if operation == "drop":
        return drop_rows(rows, params)
    if operation == "quarantine_if_invalid":
        return quarantine_invalid_rows(rows, params)
    if operation == "aggregate":
        return aggregate_rows(rows, params)
    raise Week2SparkRunnerError(f"Unsupported L6 operation: {operation}")


def select_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """지정된 column만 남긴다."""

    columns = params.get("columns")
    if not isinstance(columns, list) or not all(isinstance(column, str) for column in columns):
        raise Week2SparkRunnerError("select operation requires columns[]")
    assert_columns_exist(rows, columns)
    return [{column: row.get(column) for column in columns} for row in rows]


def rename_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """source_path column을 target_name으로 이름만 바꾼다."""

    source_path = required_param(params, "source_path")
    target_name = required_param(params, "target_name")
    assert_columns_exist(rows, [source_path])
    renamed = []
    for row in rows:
        next_row = dict(row)
        next_row[target_name] = next_row.pop(source_path)
        renamed.append(next_row)
    return renamed


def cast_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """L6 cast operation의 최소 preview 변환을 수행한다."""

    source_path = required_param(params, "source_path")
    target_type = required_param(params, "target_type")
    target_name = params.get("target_name", source_path)
    assert_columns_exist(rows, [source_path])
    return [{**row, target_name: cast_value(row.get(source_path), target_type)} for row in rows]


def parse_timestamp_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """timestamp 후보 값을 ISO 문자열로 정규화한다."""

    source_path = required_param(params, "source_path")
    target_name = params.get("target_name", source_path)
    assert_columns_exist(rows, [source_path])
    return [{**row, target_name: parse_timestamp_value(row.get(source_path))} for row in rows]


def normalize_null_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """빈 문자열과 흔한 null marker를 None으로 바꾼다."""

    source_path = required_param(params, "source_path")
    target_name = params.get("target_name", source_path)
    assert_columns_exist(rows, [source_path])
    markers = {"", "null", "NULL", "none", "None", "N/A", "NaN"}
    return [{**row, target_name: None if row.get(source_path) in markers else row.get(source_path)} for row in rows]


def flatten_struct_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """dict column을 preview용 평평한 column들로 펼친다."""

    source_path = required_param(params, "source_path")
    target_prefix = target_column_name(params, fallback=safe_column_name(source_path))
    assert_paths_exist(rows, [source_path])
    max_depth = bounded_positive_int(params, "max_depth", default=1)
    flattened = []
    for row in rows:
        value = get_path_value(row, source_path)
        if value is not None and not isinstance(value, dict):
            raise Week2SparkRunnerError(f"flatten_struct operation requires object value: {source_path}")
        next_row = remove_path_value(row, source_path)
        for nested_path, nested_value in flatten_object(value or {}, max_depth=max_depth):
            next_row[f"{target_prefix}_{nested_path}"] = scalar_preview_value(nested_value)
        flattened.append(next_row)
    return flattened


def explode_array_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """array column을 여러 preview row로 펼친다."""

    source_path = required_param(params, "source_path")
    target_prefix = target_column_name(params, fallback=safe_column_name(source_path))
    assert_paths_exist(rows, [source_path])
    max_output_rows = explode_max_output_rows(params)
    exploded: list[dict[str, Any]] = []
    for row in rows:
        value = get_path_value(row, source_path)
        if value is None or value == []:
            continue
        if not isinstance(value, list):
            raise Week2SparkRunnerError(f"explode_array operation requires array value: {source_path}")
        for item in value:
            next_row = remove_path_value(row, source_path)
            if isinstance(item, dict):
                for nested_path, nested_value in flatten_object(item, max_depth=1):
                    next_row[f"{target_prefix}_{nested_path}"] = scalar_preview_value(nested_value)
            else:
                next_row[target_prefix] = scalar_preview_value(item)
            exploded.append(next_row)
            if len(exploded) > max_output_rows:
                raise Week2SparkRunnerError(f"explode_array cardinality exceeded max_output_rows={max_output_rows}")

    max_expansion_ratio = params.get("max_expansion_ratio")
    if isinstance(max_expansion_ratio, (int, float)) and rows and len(exploded) / len(rows) > max_expansion_ratio:
        raise Week2SparkRunnerError(f"explode_array cardinality exceeded max_expansion_ratio={max_expansion_ratio}")
    return exploded


def json_string_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """nested value를 M6가 읽을 수 있는 JSON string column으로 보존한다."""

    source_path = required_param(params, "source_path")
    target_name = params.get("target_name", source_path)
    assert_columns_exist(rows, [source_path])
    converted = []
    for row in rows:
        value = row.get(source_path)
        next_value = value if isinstance(value, str) or value is None else json.dumps(value, ensure_ascii=False, sort_keys=True)
        converted.append({**row, target_name: next_value})
    return converted


def mask_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """PII preview 값은 실제 내용을 남기지 않고 고정 mask 문자열로 대체한다."""

    source_path = required_param(params, "source_path")
    target_name = params.get("target_name", source_path)
    assert_columns_exist(rows, [source_path])
    return [{**row, target_name: None if row.get(source_path) is None else "***MASKED***"} for row in rows]


def hash_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """PII preview 값을 HMAC-SHA256 digest로 바꾼다."""

    source_path = required_param(params, "source_path")
    target_name = target_column_name(params, fallback=safe_column_name(source_path))
    assert_paths_exist(rows, [source_path])
    hash_policy = params.get("hash_policy")
    if not isinstance(hash_policy, dict):
        raise Week2SparkRunnerError("hash operation requires hash_policy")
    algorithm = str(hash_policy.get("algorithm", "")).lower().replace("-", "_")
    if algorithm != "hmac_sha256":
        raise Week2SparkRunnerError("hash operation requires hash_policy.algorithm=hmac_sha256")
    secret_ref = hash_policy.get("salt_secret_id") or hash_policy.get("salt_secret_ref") or hash_policy.get("salt_secret_env")
    if not isinstance(secret_ref, str) or not secret_ref:
        raise Week2SparkRunnerError("hash operation requires hash_policy.salt_secret_id")
    salt_secret = os.environ.get(secret_ref)
    if salt_secret is None:
        raise Week2SparkRunnerError(f"hash operation salt secret env is not set: {secret_ref}")

    hashed = []
    for row in rows:
        value = get_path_value(row, source_path)
        next_row = remove_path_value(row, source_path)
        next_row[target_name] = None if value is None else hmac_sha256_hex(str(value), salt_secret)
        hashed.append(next_row)
    return hashed


def drop_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """지정 column을 preview output에서 제거한다."""

    source_path = required_param(params, "source_path")
    return [{key: value for key, value in row.items() if key != source_path} for row in rows]


def quarantine_invalid_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """검증 rule에 실패한 row를 preview output에서 표시한다."""

    source_path = required_param(params, "source_path")
    rule = params.get("rule")
    if not rule:
        raise Week2SparkRunnerError("quarantine_if_invalid operation requires rule")
    assert_paths_exist(rows, [source_path])
    flag_column = string_param(params, "quarantine_flag_column", "_quarantined")
    reason_column = string_param(params, "quarantine_reason_column", "_quarantine_reason")
    default_reason = string_param(params, "reason", f"{source_path} failed validation")
    checked = []
    for row in rows:
        invalid, reason = evaluate_quarantine_rule(get_path_value(row, source_path), rule, default_reason)
        checked.append({**row, flag_column: invalid, reason_column: reason if invalid else None})
    return checked


def aggregate_rows(rows: list[dict[str, Any]], params: dict[str, Any]) -> list[dict[str, Any]]:
    """L6 Gold aggregate spec의 count/avg preview metric을 만든다."""

    group_by = params.get("group_by", [])
    measures = params.get("measures", [])
    if not isinstance(group_by, list) or not all(isinstance(column, str) for column in group_by):
        raise Week2SparkRunnerError("aggregate operation requires group_by[]")
    if not isinstance(measures, list) or not measures:
        raise Week2SparkRunnerError("aggregate operation requires measures[]")
    assert_columns_exist(rows, group_by)

    groups: dict[tuple[Any, ...], list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        groups[tuple(row.get(column) for column in group_by)].append(row)
    max_groups = params.get("cardinality_guard", {}).get("max_groups")
    if isinstance(max_groups, int) and len(groups) > max_groups:
        raise Week2SparkRunnerError(f"aggregate cardinality exceeded max_groups={max_groups}")

    output_rows = []
    for group_key, group_rows in groups.items():
        output_row = {column: group_key[index] for index, column in enumerate(group_by)}
        for measure in measures:
            output_row[required_measure_name(measure)] = aggregate_measure(group_rows, measure)
        output_rows.append(output_row)
    if not rows and not group_by:
        output_rows.append({required_measure_name(measure): aggregate_measure([], measure) for measure in measures})
    return output_rows


def aggregate_measure(rows: list[dict[str, Any]], measure: dict[str, Any]) -> Any:
    """지원하는 Gold preview measure 하나를 계산한다."""

    operation = measure.get("operation")
    field = measure.get("field")
    if operation == "count":
        return len(rows) if field in {None, "*"} else sum(1 for row in rows if row.get(field) is not None)
    if operation == "avg":
        if not isinstance(field, str) or field == "*":
            raise Week2SparkRunnerError("avg measure requires a concrete field")
        values = [float(row[field]) for row in rows if row.get(field) is not None]
        return (sum(values) / len(values)) if values else None
    raise Week2SparkRunnerError(f"Unsupported aggregate measure operation: {operation}")


def required_measure_name(measure: dict[str, Any]) -> str:
    """Gold preview output column 이름을 읽는다."""

    name = measure.get("name")
    if not isinstance(name, str) or not name:
        raise Week2SparkRunnerError("aggregate measure requires name")
    return name


def cast_value(value: Any, target_type: str) -> Any:
    """preview row 값 하나를 L6 target_type에 맞춰 변환한다."""

    if value is None:
        return None
    if target_type in {"integer", "int"}:
        return int(value)
    if target_type in {"number", "float", "double"}:
        return float(value)
    if target_type == "boolean":
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            lowered = value.strip().lower()
            if lowered in {"true", "1", "yes", "y"}:
                return True
            if lowered in {"false", "0", "no", "n"}:
                return False
        return bool(value)
    if target_type in {"string", "json"}:
        return str(value)
    if target_type == "timestamp":
        return parse_timestamp_value(value)
    raise Week2SparkRunnerError(f"Unsupported cast target_type: {target_type}")


def parse_timestamp_value(value: Any) -> str | None:
    """문자열 timestamp를 ISO-8601 형태로 맞춘다."""

    if value is None:
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value, timezone.utc).isoformat()
    text = str(value).strip()
    if not text:
        return None
    normalized = text.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized).isoformat()
    except ValueError:
        raise Week2SparkRunnerError(f"Invalid timestamp value: {value}") from None


def required_param(params: dict[str, Any], name: str) -> str:
    """operation params에서 필수 문자열 값을 꺼낸다."""

    value = params.get(name)
    if not isinstance(value, str) or not value:
        raise Week2SparkRunnerError(f"L6 operation requires {name}")
    return value


def assert_columns_exist(rows: list[dict[str, Any]], columns: list[str]) -> None:
    """preview input에 필요한 column이 없으면 즉시 실패시킨다."""

    missing = sorted({column for column in columns if any(column not in row for row in rows)})
    if missing:
        raise Week2SparkRunnerError(f"Missing column(s) for L6 preview: {', '.join(missing)}")


def assert_paths_exist(rows: list[dict[str, Any]], paths: list[str]) -> None:
    """flat column 또는 dotted path가 모든 preview row에 있는지 확인한다."""

    missing = sorted({path for path in paths if any(get_path_value(row, path, missing_marker=True) is MISSING for row in rows)})
    if missing:
        raise Week2SparkRunnerError(f"Missing column(s) for L6 preview: {', '.join(missing)}")


def get_path_value(row: dict[str, Any], path: str, missing_marker: bool = False) -> Any:
    """row에서 flat column을 우선 찾고, 없으면 dotted path를 따라 값을 읽는다."""

    if path in row:
        return row[path]
    current: Any = row
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return MISSING if missing_marker else None
        current = current[part]
    return current


def remove_path_value(row: dict[str, Any], path: str) -> dict[str, Any]:
    """source column을 제거한 shallow copy를 만든다."""

    next_row = dict(row)
    if path in next_row:
        next_row.pop(path)
    return next_row


def target_column_name(params: dict[str, Any], fallback: str) -> str:
    """M3 문서의 target_column과 현재 compiler의 target_name을 모두 받아들인다."""

    value = params.get("target_column", params.get("target_name", fallback))
    if not isinstance(value, str) or not value:
        raise Week2SparkRunnerError("L6 operation target column must be a string")
    return safe_column_name(value)


def safe_column_name(name: str) -> str:
    """preview output에 쓸 수 있게 path 문자를 column 문자로 바꾼다."""

    return name.replace(".", "_").replace("[", "_").replace("]", "").replace("-", "_")


def bounded_positive_int(params: dict[str, Any], name: str, default: int) -> int:
    """옵션이 있으면 양의 정수인지 확인하고 없으면 default를 쓴다."""

    value = params.get(name, default)
    if not isinstance(value, int) or value <= 0:
        raise Week2SparkRunnerError(f"L6 operation requires positive integer {name}")
    return value


def explode_max_output_rows(params: dict[str, Any]) -> int:
    """explode preview가 너무 커지지 않도록 output row 상한을 계산한다."""

    cardinality_guard = params.get("cardinality_guard", {})
    if isinstance(cardinality_guard, dict):
        for key in ("max_output_rows", "max_group_count", "max_groups"):
            value = cardinality_guard.get(key)
            if isinstance(value, int) and value > 0:
                return value
    value = params.get("max_output_rows")
    if isinstance(value, int) and value > 0:
        return value
    return 100_000


def flatten_object(value: dict[str, Any], max_depth: int, prefix: str = "") -> list[tuple[str, Any]]:
    """nested dict를 bounded depth 안에서 column path와 값 목록으로 바꾼다."""

    flattened: list[tuple[str, Any]] = []
    for key, child in value.items():
        child_name = safe_column_name(str(key))
        column_path = f"{prefix}_{child_name}" if prefix else child_name
        if isinstance(child, dict) and max_depth > 1:
            flattened.extend(flatten_object(child, max_depth=max_depth - 1, prefix=column_path))
        else:
            flattened.append((column_path, child))
    return flattened


def scalar_preview_value(value: Any) -> Any:
    """Parquet preview column에 넣기 애매한 nested value는 JSON string으로 보존한다."""

    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, sort_keys=True)
    return value


def hmac_sha256_hex(value: str, salt_secret: str) -> str:
    """HMAC-SHA256 digest를 hex string으로 만든다."""

    return hmac.new(salt_secret.encode("utf-8"), value.encode("utf-8"), hashlib.sha256).hexdigest()


def string_param(params: dict[str, Any], name: str, default: str) -> str:
    """선택 문자열 parameter를 읽는다."""

    value = params.get(name, default)
    if not isinstance(value, str) or not value:
        raise Week2SparkRunnerError(f"L6 operation {name} must be a string")
    return value


def evaluate_quarantine_rule(value: Any, rule: Any, default_reason: str) -> tuple[bool, str]:
    """현재 preview에서 지원하는 quarantine rule을 평가한다."""

    if isinstance(rule, str):
        return evaluate_named_quarantine_rule(value, rule, default_reason)
    if not isinstance(rule, dict):
        raise Week2SparkRunnerError("quarantine_if_invalid rule must be a string or object")

    rule_type = rule.get("type")
    reason = rule.get("reason", default_reason)
    if not isinstance(reason, str) or not reason:
        raise Week2SparkRunnerError("quarantine_if_invalid rule.reason must be a string")

    if rule_type == "not_null":
        return value is None, reason
    if rule_type == "not_empty":
        return value == "", reason
    if rule_type == "not_null_or_empty":
        return value is None or value == "", reason
    if rule_type == "not_in":
        invalid_values = rule.get("values")
        if not isinstance(invalid_values, list):
            raise Week2SparkRunnerError("quarantine_if_invalid not_in rule requires values[]")
        return value in invalid_values, reason
    if rule_type == "range":
        return value_outside_numeric_range(value, rule), reason
    raise Week2SparkRunnerError(f"Unsupported quarantine_if_invalid rule: {rule_type}")


def evaluate_named_quarantine_rule(value: Any, rule: str, default_reason: str) -> tuple[bool, str]:
    """짧은 문자열 rule을 평가한다."""

    if rule == "not_null":
        return value is None, default_reason
    if rule == "not_empty":
        return value == "", default_reason
    if rule == "not_null_or_empty":
        return value is None or value == "", default_reason
    raise Week2SparkRunnerError(f"Unsupported quarantine_if_invalid rule: {rule}")


def value_outside_numeric_range(value: Any, rule: dict[str, Any]) -> bool:
    """숫자 range rule을 평가한다."""

    if value is None:
        return True
    try:
        number = float(value)
    except (TypeError, ValueError):
        return True
    minimum = rule.get("min")
    maximum = rule.get("max")
    if isinstance(minimum, (int, float)) and number < minimum:
        return True
    if isinstance(maximum, (int, float)) and number > maximum:
        return True
    return False


MISSING = object()


def output_location_for_l6_preview(
    config: RuntimeConfig,
    spec: dict[str, Any],
    run_id: str,
    storage_adapter: Week2StorageAdapter | None = None,
) -> StorageLocation:
    """L6 preview output path를 local fallback과 S3-compatible prefix 기준으로 계산한다."""

    if config.output_path is not None:
        return StorageLocation(
            uri=None,
            bucket=None,
            prefix="",
            object_key="",
            object_uri=None,
            local_path=resolve_path(config.output_path),
        )

    file_name = config.options.get("output_file_name") or f"{spec.get('artifact_type', 'l6_preview')}.parquet"
    if config.storage is not None:
        adapter = storage_adapter or Week2StorageAdapter()
        return adapter.build_location(
            config.storage,
            run_id=run_id,
            file_name=file_name,
            local_root=config.output_root,
            default_prefix="l6_preview/run_id=<run_id>/",
        )
    if config.output_root is None:
        raise Week2SparkRunnerError("output_path, output_root, or storage is required for L6 preview")
    output_root = resolve_path(config.output_root)
    return StorageLocation(
        uri=None,
        bucket=None,
        prefix=f"l6_preview/run_id={run_id}/",
        object_key="",
        object_uri=None,
        local_path=output_root / "l6_preview" / f"run_id={run_id}" / file_name,
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
