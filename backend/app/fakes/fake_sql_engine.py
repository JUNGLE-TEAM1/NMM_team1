import re
from time import perf_counter

from app.domain.ai_query import (
    DatasetSchema,
    EngineHealth,
    GuardrailResult,
    QueryColumn,
    QueryResult,
    SqlEngineContext,
    ValidationResult,
)


class FakeSqlEngine:
    engine_name = "fake"

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

        started_at = perf_counter()
        selected_columns = self._extract_selected_columns(sql)
        row = self._fixture_row(selected_columns)
        duration_ms = int((perf_counter() - started_at) * 1000)
        columns = [
            QueryColumn(name=name, type=context.column_types.get(name, "string"))
            for name in selected_columns
        ]

        return QueryResult(
            engine=self.engine_name,
            sql=sql,
            columns=columns,
            rows=[row],
            row_count=1,
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
        return EngineHealth(engine=self.engine_name, status="ok")

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

    def _fixture_row(self, selected_columns: list[str]) -> dict[str, object]:
        available = {
            "product_id": "B001",
            "review_count": 42,
            "average_rating": 4.8,
        }
        return {name: available.get(name) for name in selected_columns}
