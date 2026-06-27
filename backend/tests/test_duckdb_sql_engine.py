import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from app.adapters.duckdb_sql_engine import DuckDBSqlEngine
from app.domain.ai_query import SqlEngineContext


def _context(path: Path) -> SqlEngineContext:
    return SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count", "average_rating"],
        local_fallback_path=str(path),
        default_limit=10,
        timeout_seconds=30,
        column_types={
            "product_id": "string",
            "review_count": "integer",
            "average_rating": "number",
        },
    )


def test_duckdb_sql_engine_reads_parquet_local_fallback_path(tmp_path: Path) -> None:
    parquet_path = tmp_path / "dataset_reviews_gold.parquet"
    table = pa.table(
        {
            "product_id": ["B001", "B002", "B003"],
            "review_count": [2, 1, 4],
            "average_rating": [4.5, 2.0, 5.0],
        }
    )
    pq.write_table(table, parquet_path)
    engine = DuckDBSqlEngine()
    sql = "SELECT product_id, review_count, average_rating FROM reviews_gold ORDER BY review_count DESC LIMIT 2"

    validation = engine.validate(sql, _context(parquet_path))
    result = engine.execute(sql, _context(parquet_path))

    assert validation.status == "succeeded"
    assert result.engine == "duckdb"
    assert result.row_count == 2
    assert result.rows == [
        {"product_id": "B003", "review_count": 4, "average_rating": 5.0},
        {"product_id": "B001", "review_count": 2, "average_rating": 4.5},
    ]
    assert [column.name for column in result.columns] == ["product_id", "review_count", "average_rating"]


def test_duckdb_sql_engine_reads_jsonl_local_fallback_path(tmp_path: Path) -> None:
    jsonl_path = tmp_path / "dataset_reviews_gold.jsonl"
    rows = [
        {"product_id": "B001", "review_count": 2, "average_rating": 4.5},
        {"product_id": "B002", "review_count": 1, "average_rating": 2.0},
    ]
    jsonl_path.write_text("\n".join(json.dumps(row) for row in rows), encoding="utf-8")
    engine = DuckDBSqlEngine()
    sql = "SELECT product_id, review_count FROM reviews_gold ORDER BY product_id LIMIT 10"

    validation = engine.validate(sql, _context(jsonl_path))
    result = engine.execute(sql, _context(jsonl_path))

    assert validation.status == "succeeded"
    assert result.rows == [
        {"product_id": "B001", "review_count": 2},
        {"product_id": "B002", "review_count": 1},
    ]


def test_duckdb_sql_engine_keeps_sql_guardrails(tmp_path: Path) -> None:
    jsonl_path = tmp_path / "dataset_reviews_gold.jsonl"
    jsonl_path.write_text(
        '{"product_id":"B001","review_count":2,"average_rating":4.5,"secret_note":"hidden"}\n',
        encoding="utf-8",
    )
    engine = DuckDBSqlEngine()
    context = _context(jsonl_path)

    non_select = engine.validate("DELETE FROM reviews_gold", context)
    wrong_table = engine.validate("SELECT product_id FROM private_table LIMIT 10", context)
    missing_limit = engine.validate("SELECT product_id FROM reviews_gold", context)
    wrong_column = engine.validate("SELECT secret_note FROM reviews_gold LIMIT 10", context)
    wrong_order_column = engine.validate("SELECT product_id FROM reviews_gold ORDER BY secret_note LIMIT 10", context)

    assert non_select.failure_code == "non_select_sql"
    assert wrong_table.failure_code == "table_not_allowed"
    assert missing_limit.failure_code == "limit_required"
    assert wrong_column.failure_code == "column_not_allowed"
    assert wrong_order_column.failure_code == "column_not_allowed"


def test_duckdb_sql_engine_blocks_missing_local_fallback_path() -> None:
    context = SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id"],
        default_limit=10,
        timeout_seconds=30,
    )

    validation = DuckDBSqlEngine().validate("SELECT product_id FROM reviews_gold LIMIT 10", context)

    assert validation.status == "blocked"
    assert validation.failure_code == "local_path_missing"
