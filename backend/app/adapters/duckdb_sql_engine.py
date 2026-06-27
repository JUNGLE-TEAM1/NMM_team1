import re
from pathlib import Path
from time import perf_counter
from typing import Any

from app.domain.ai_query import (
    DatasetSchema,
    EngineHealth,
    GuardrailResult,
    QueryColumn,
    QueryResult,
    SqlEngineContext,
    ValidationResult,
)


SUPPORTED_FILE_SUFFIXES = {".parquet", ".jsonl", ".json"}


class DuckDBSqlEngine:
    """CatalogMetadata의 local fallback 파일을 DuckDB table처럼 읽는 Week 2 SQL adapter."""

    engine_name = "duckdb"

    def validate(self, sql: str, context: SqlEngineContext) -> ValidationResult:
        """SQL guardrail과 local file 준비 상태를 실행 전에 확인한다."""

        normalized = normalize_sql(sql)
        lowered = normalized.lower()

        if not lowered.startswith("select ") or has_multiple_statements(normalized):
            return blocked("non_select_sql", "Only one SELECT statement is allowed.")

        if " limit " not in lowered:
            return blocked("limit_required", "SELECT statements must include LIMIT.")

        table_name = extract_table_name(lowered)
        if table_name != context.table_name.lower():
            return blocked("table_not_allowed", f"Table is not allowed: {table_name or 'unknown'}")

        try:
            duckdb_module()
        except RuntimeError as error:
            return blocked("engine_unavailable", str(error))

        referenced_columns = extract_referenced_columns(normalized)
        if referenced_columns != ["*"]:
            disallowed_columns = [name for name in referenced_columns if name not in context.allowed_columns]
            if disallowed_columns:
                return blocked("column_not_allowed", f"Columns are not allowed: {', '.join(disallowed_columns)}")

        path_validation = validate_local_path(context)
        if path_validation is not None:
            return path_validation

        return ValidationResult(
            status="succeeded",
            guardrail=GuardrailResult(validation_status="passed"),
        )

    def execute(self, sql: str, context: SqlEngineContext) -> QueryResult:
        """검증된 SQL을 DuckDB에서 실행하고 QueryResult 계약으로 변환한다."""

        validation = self.validate(sql, context)
        if validation.status != "succeeded":
            return empty_query_result(self.engine_name, sql)

        started_at = perf_counter()
        connection = duckdb_module().connect(database=":memory:")
        try:
            register_local_file_view(connection, context)
            cursor = connection.execute(sql)
            column_names = [column[0] for column in cursor.description or []]
            rows = [dict(zip(column_names, row, strict=False)) for row in cursor.fetchall()]
        finally:
            connection.close()

        duration_ms = int((perf_counter() - started_at) * 1000)
        return QueryResult(
            engine=self.engine_name,
            sql=sql,
            columns=[
                QueryColumn(name=name, type=context.column_types.get(name, "unknown"))
                for name in column_names
            ],
            rows=[normalize_row(row) for row in rows],
            row_count=len(rows),
            duration_ms=duration_ms,
        )

    def explain_schema(self, context: SqlEngineContext) -> DatasetSchema:
        """M6가 SQL 생성 전에 사용할 수 있는 table schema를 반환한다."""

        return DatasetSchema(
            table_name=context.table_name,
            columns=[
                QueryColumn(name=name, type=context.column_types.get(name, "unknown"))
                for name in context.allowed_columns
            ],
        )

    def health_check(self) -> EngineHealth:
        """DuckDB import 가능 여부를 adapter health로 보고한다."""

        try:
            duckdb_module()
        except RuntimeError:
            return EngineHealth(engine=self.engine_name, status="unavailable")
        return EngineHealth(engine=self.engine_name, status="ok")


def duckdb_module() -> Any:
    """duckdb dependency를 adapter 내부로 격리해 import 실패를 engine_unavailable로 다룬다."""

    try:
        import duckdb  # type: ignore
    except ImportError as error:
        raise RuntimeError("duckdb is required for DuckDBSqlEngine") from error
    return duckdb


def register_local_file_view(connection: Any, context: SqlEngineContext) -> None:
    """local fallback 파일을 context.table_name view로 등록한다."""

    path = Path(context.local_fallback_path or "")
    escaped_path = sql_string_literal(path)
    table_name = safe_identifier(context.table_name)

    if path.suffix == ".parquet":
        connection.execute(f"CREATE OR REPLACE VIEW {table_name} AS SELECT * FROM read_parquet({escaped_path})")
        return

    if path.suffix in {".jsonl", ".json"}:
        connection.execute(f"CREATE OR REPLACE VIEW {table_name} AS SELECT * FROM read_json_auto({escaped_path})")
        return

    raise RuntimeError(f"Unsupported SQL smoke file format: {path.suffix}")


def validate_local_path(context: SqlEngineContext) -> ValidationResult | None:
    """CatalogMetadata가 제공한 local fallback path가 실제 읽을 수 있는 파일인지 확인한다."""

    if not context.local_fallback_path:
        return blocked(
            "local_path_missing",
            "CatalogMetadata storage.local_fallback_path is required for SQL execution.",
        )

    path = Path(context.local_fallback_path)
    if not path.exists():
        return blocked("local_path_missing", f"CatalogMetadata local_fallback_path does not exist: {path}")

    if path.suffix not in SUPPORTED_FILE_SUFFIXES:
        return blocked("engine_unavailable", f"Unsupported SQL smoke file format: {path.suffix}")

    return None


def normalize_sql(sql: str) -> str:
    """검증하기 쉽게 whitespace와 trailing semicolon을 정리한다."""

    normalized = " ".join(sql.strip().split())
    if normalized.endswith(";"):
        normalized = normalized[:-1].strip()
    return normalized


def has_multiple_statements(sql: str) -> bool:
    """SELECT 뒤에 두 번째 statement를 붙이는 형태를 막는다."""

    return ";" in sql


def extract_table_name(lowered_sql: str) -> str | None:
    match = re.search(r"\bfrom\s+([a-zA-Z_][a-zA-Z0-9_]*)", lowered_sql)
    if match is None:
        return None
    return match.group(1)


def extract_selected_columns(sql: str) -> list[str]:
    """단순 SELECT column list를 뽑아 allowlist 검증에 사용한다."""

    match = re.search(r"select\s+(.*?)\s+from\s+", sql, flags=re.IGNORECASE)
    if match is None:
        return []

    raw_columns = [column.strip() for column in match.group(1).split(",")]
    if raw_columns == ["*"]:
        return ["*"]

    columns: list[str] = []
    for raw_column in raw_columns:
        column = re.sub(r"\s+as\s+[a-zA-Z_][a-zA-Z0-9_]*$", "", raw_column, flags=re.IGNORECASE)
        if "." in column:
            column = column.split(".")[-1]
        columns.append(column)
    return columns


def extract_referenced_columns(sql: str) -> list[str]:
    """SELECT와 ORDER BY에서 직접 참조한 column을 allowlist 검증 대상으로 모은다."""

    selected_columns = extract_selected_columns(sql)
    if selected_columns == ["*"]:
        return ["*"]

    columns = list(selected_columns)
    columns.extend(extract_order_by_columns(sql))
    return columns


def extract_order_by_columns(sql: str) -> list[str]:
    match = re.search(r"\border\s+by\s+(.*?)(?:\s+limit\s+|$)", sql, flags=re.IGNORECASE)
    if match is None:
        return []

    columns: list[str] = []
    for raw_column in match.group(1).split(","):
        column = raw_column.strip()
        column = re.sub(r"\s+(asc|desc)$", "", column, flags=re.IGNORECASE)
        if "." in column:
            column = column.split(".")[-1]
        columns.append(column)
    return columns


def safe_identifier(identifier: str) -> str:
    """계약에서 온 table name만 SQL identifier로 사용한다."""

    if not re.fullmatch(r"[a-zA-Z_][a-zA-Z0-9_]*", identifier):
        raise RuntimeError(f"Unsafe SQL identifier: {identifier}")
    return identifier


def sql_string_literal(path: Path) -> str:
    """파일 경로를 DuckDB SQL string literal로 안전하게 넣는다."""

    escaped = str(path).replace("'", "''")
    return f"'{escaped}'"


def normalize_row(row: dict[str, Any]) -> dict[str, Any]:
    """DuckDB scalar 값을 JSON 응답에 넣기 쉬운 Python 값으로 정리한다."""

    return {key: value for key, value in row.items()}


def blocked(code: str, message: str) -> ValidationResult:
    return ValidationResult(
        status="blocked",
        guardrail=GuardrailResult(
            validation_status="blocked",
            failure_code=code,
            failure_message=message,
        ),
    )


def empty_query_result(engine: str, sql: str) -> QueryResult:
    return QueryResult(
        engine=engine,
        sql=sql,
        columns=[],
        rows=[],
        row_count=0,
        duration_ms=0,
    )
