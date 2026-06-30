import re
from datetime import date, datetime
from decimal import Decimal
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

try:
    import duckdb
except ModuleNotFoundError:  # pragma: no cover - covered by runtime health behavior
    duckdb = None


class DuckDBSqlEngine:
    engine_name = "duckdb"

    def validate(self, sql: str, context: SqlEngineContext) -> ValidationResult:
        normalized = " ".join(sql.strip().split())
        lowered = normalized.lower()

        if not lowered.startswith("select "):
            return self._blocked("non_select_sql", "Only SELECT statements are allowed.")

        if " limit " not in lowered:
            return self._blocked("limit_required", "SELECT statements must include LIMIT.")

        table_name = self._extract_table_name(lowered)
        if table_name != context.table_name.lower():
            return self._blocked("table_not_allowed", f"Table is not allowed: {table_name or 'unknown'}")

        selected_columns = self._extract_selected_columns(normalized)
        disallowed_columns = [name for name in selected_columns if name not in context.allowed_columns]
        if disallowed_columns:
            return self._blocked("column_not_allowed", f"Columns are not allowed: {', '.join(disallowed_columns)}")

        if duckdb is None:
            return self._blocked("engine_unavailable", "DuckDB is not installed.")

        if not context.local_fallback_path:
            return self._blocked(
                "local_path_missing",
                "CatalogMetadata storage.local_fallback_path is required for SQL execution.",
            )

        local_path = Path(context.local_fallback_path)
        if not local_path.exists():
            return self._blocked(
                "local_path_missing",
                f"CatalogMetadata storage.local_fallback_path does not exist: {local_path}",
            )

        if local_path.suffix.lower() not in {".jsonl", ".json", ".ndjson", ".parquet"}:
            return self._blocked(
                "engine_unavailable",
                f"DuckDB adapter cannot read local fallback file type: {local_path.suffix or 'unknown'}",
            )

        return ValidationResult(
            status="succeeded",
            guardrail=GuardrailResult(validation_status="passed"),
        )

    def execute(self, sql: str, context: SqlEngineContext) -> QueryResult:
        validation = self.validate(sql, context)
        if validation.status != "succeeded":
            return QueryResult(
                engine=self.engine_name,
                sql=sql,
                columns=[],
                rows=[],
                row_count=0,
                duration_ms=0,
            )

        assert duckdb is not None
        assert context.local_fallback_path is not None
        local_path = Path(context.local_fallback_path)

        started_at = perf_counter()
        with duckdb.connect(database=":memory:") as connection:
            self._register_local_file(connection, context.table_name, local_path)
            result = connection.execute(sql)
            description = result.description or []
            rows = [
                {
                    column[0]: self._json_safe_value(value)
                    for column, value in zip(description, row)
                }
                for row in result.fetchall()
            ]

        duration_ms = int((perf_counter() - started_at) * 1000)
        columns = [
            QueryColumn(
                name=column[0],
                type=context.column_types.get(column[0], self._duckdb_type_name(column[1])),
            )
            for column in description
        ]

        return QueryResult(
            engine=self.engine_name,
            sql=sql,
            columns=columns,
            rows=rows,
            row_count=len(rows),
            duration_ms=duration_ms,
        )

    def explain_schema(self, context: SqlEngineContext) -> DatasetSchema:
        return DatasetSchema(
            table_name=context.table_name,
            columns=[
                QueryColumn(name=name, type=context.column_types.get(name, "string"))
                for name in context.allowed_columns
            ],
        )

    def health_check(self) -> EngineHealth:
        status = "ok" if duckdb is not None else "unavailable"
        return EngineHealth(engine=self.engine_name, status=status)

    def _register_local_file(self, connection: Any, table_name: str, local_path: Path) -> None:
        quoted_table = self._quote_identifier(table_name)
        path_literal = self._quote_literal(str(local_path))
        suffix = local_path.suffix.lower()

        if suffix == ".parquet":
            connection.execute(
                f"CREATE VIEW {quoted_table} AS SELECT * FROM read_parquet({path_literal}, hive_partitioning = false)",
            )
            return

        connection.execute(
            f"CREATE VIEW {quoted_table} AS SELECT * FROM read_json_auto({path_literal})",
        )

    def _blocked(self, code: str, message: str) -> ValidationResult:
        return ValidationResult(
            status="blocked",
            guardrail=GuardrailResult(
                validation_status="blocked",
                failure_code=code,
                failure_message=message,
            ),
        )

    def _extract_table_name(self, lowered_sql: str) -> str | None:
        match = re.search(r"\bfrom\s+([a-zA-Z_][a-zA-Z0-9_]*)", lowered_sql)
        if match is None:
            return None
        return match.group(1)

    def _extract_selected_columns(self, sql: str) -> list[str]:
        match = re.search(r"select\s+(.*?)\s+from\s+", sql, flags=re.IGNORECASE)
        if match is None:
            return []

        columns: list[str] = []
        for raw_column in match.group(1).split(","):
            column = raw_column.strip()
            column = re.sub(r"\s+as\s+[a-zA-Z_][a-zA-Z0-9_]*$", "", column, flags=re.IGNORECASE)
            if "." in column:
                column = column.split(".")[-1]
            columns.append(column)
        return columns

    def _quote_identifier(self, identifier: str) -> str:
        if not re.fullmatch(r"[a-zA-Z_][a-zA-Z0-9_]*", identifier):
            raise ValueError(f"Unsafe SQL identifier: {identifier}")
        return f'"{identifier}"'

    def _quote_literal(self, value: str) -> str:
        return "'" + value.replace("'", "''") + "'"

    def _duckdb_type_name(self, duckdb_type: object) -> str:
        raw_type = str(duckdb_type).upper()
        if any(token in raw_type for token in ["INT", "HUGEINT", "UBIGINT"]):
            return "integer"
        if any(token in raw_type for token in ["DOUBLE", "FLOAT", "DECIMAL", "REAL"]):
            return "number"
        if "BOOL" in raw_type:
            return "boolean"
        return "string"

    def _json_safe_value(self, value: object) -> object:
        if isinstance(value, Decimal):
            return int(value) if value == value.to_integral_value() else float(value)
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value
