import json
from pathlib import Path

import pyarrow as pa
import pyarrow.parquet as pq

from app.adapters.duckdb_sql_engine import DuckDBSqlEngine
from app.domain.ai_query import SqlEngineContext
from app.services.ai_query import Week2AIQueryService


class InMemoryCatalogSource:
    def __init__(self, catalog: dict[str, object]) -> None:
        self.catalog = catalog

    def list_catalogs(self, tenant_id: str | None = None) -> list[dict[str, object]]:
        if tenant_id is not None and self.catalog.get("tenant_id") != tenant_id:
            return []
        return [self.catalog]


def _write_reviews_jsonl(path: Path) -> None:
    rows = [
        {"product_id": "B001", "review_count": 2, "average_rating": 4.5},
        {"product_id": "B002", "review_count": 1, "average_rating": 2.0},
        {"product_id": "B003", "review_count": 1, "average_rating": 5.0},
    ]
    path.write_text(
        "".join(json.dumps(row, sort_keys=True) + "\n" for row in rows),
        encoding="utf-8",
    )


def _context(local_path: Path | None) -> SqlEngineContext:
    return SqlEngineContext(
        table_name="reviews_gold",
        allowed_columns=["product_id", "review_count", "average_rating"],
        local_fallback_path=str(local_path) if local_path else None,
        default_limit=100,
        timeout_seconds=30,
        column_types={
            "product_id": "string",
            "review_count": "integer",
            "average_rating": "number",
        },
    )


def _catalog(local_path: Path) -> dict[str, object]:
    return {
        "tenant_id": "tenant_demo",
        "dataset_id": "dataset_reviews_gold",
        "name": "Reviews Gold",
        "s3_uri": "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/",
        "storage": {"local_fallback_path": str(local_path)},
        "schema": {
            "fields": [
                {"name": "product_id", "type": "string", "nullable": False},
                {"name": "review_count", "type": "integer", "nullable": False},
                {"name": "average_rating", "type": "number", "nullable": True},
            ]
        },
        "metrics": {"row_count": 3, "bytes": local_path.stat().st_size, "quality": {}},
        "lineage": {"run_id": "run_reviews_demo_001"},
        "query": {
            "table_name": "reviews_gold",
            "allowed_columns": ["product_id", "review_count", "average_rating"],
            "default_limit": 100,
            "timeout_seconds": 30,
        },
        "updated_at": "2026-06-27T10:00:00+09:00",
    }


def test_duckdb_sql_engine_executes_jsonl_local_fallback_path(tmp_path: Path) -> None:
    jsonl_path = tmp_path / "dataset_reviews_gold.jsonl"
    _write_reviews_jsonl(jsonl_path)
    context = _context(jsonl_path)
    engine = DuckDBSqlEngine()
    sql = (
        "SELECT product_id, review_count, average_rating "
        "FROM reviews_gold ORDER BY review_count DESC LIMIT 2"
    )

    validation = engine.validate(sql, context)
    result = engine.execute(sql, context)

    assert validation.status == "succeeded"
    assert result.engine == "duckdb"
    assert result.sql == sql
    assert [column.model_dump() for column in result.columns] == [
        {"name": "product_id", "type": "string"},
        {"name": "review_count", "type": "integer"},
        {"name": "average_rating", "type": "number"},
    ]
    assert result.rows[0]["product_id"] == "B001"
    assert result.rows[0]["review_count"] == 2
    assert result.row_count == 2


def test_duckdb_sql_engine_executes_parquet_local_fallback_path(tmp_path: Path) -> None:
    parquet_path = tmp_path / "dataset_reviews_gold.parquet"
    table = pa.table(
        {
            "product_id": ["B001", "B003"],
            "review_count": [2, 1],
            "average_rating": [4.5, 5.0],
        }
    )
    pq.write_table(table, parquet_path)
    context = _context(parquet_path)
    engine = DuckDBSqlEngine()
    sql = (
        "SELECT product_id, average_rating, review_count "
        "FROM reviews_gold ORDER BY average_rating DESC LIMIT 1"
    )

    validation = engine.validate(sql, context)
    result = engine.execute(sql, context)

    assert validation.status == "succeeded"
    assert result.engine == "duckdb"
    assert result.rows == [{"product_id": "B003", "average_rating": 5.0, "review_count": 1}]
    assert result.row_count == 1


def test_duckdb_sql_engine_blocks_missing_or_unknown_local_path(tmp_path: Path) -> None:
    engine = DuckDBSqlEngine()
    sql = "SELECT product_id FROM reviews_gold LIMIT 10"

    missing_validation = engine.validate(sql, _context(None))
    unknown_validation = engine.validate(sql, _context(tmp_path / "missing.jsonl"))

    assert missing_validation.status == "blocked"
    assert missing_validation.failure_code == "local_path_missing"
    assert unknown_validation.status == "blocked"
    assert unknown_validation.failure_code == "local_path_missing"


def test_week2_ai_query_can_use_duckdb_sql_engine_with_catalog_path(tmp_path: Path) -> None:
    jsonl_path = tmp_path / "dataset_reviews_gold.jsonl"
    _write_reviews_jsonl(jsonl_path)
    service = Week2AIQueryService(
        sql_engine=DuckDBSqlEngine(),
        catalog_source=InMemoryCatalogSource(_catalog(jsonl_path)),
    )

    result = service.answer("리뷰가 가장 많은 상품 알려줘")

    assert result.status == "succeeded"
    assert result.query_result.engine == "duckdb"
    assert result.rows[0]["product_id"] == "B001"
    assert result.rows[0]["review_count"] == 2
    assert "B001" in result.summary
