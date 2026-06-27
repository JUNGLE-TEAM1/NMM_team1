#!/usr/bin/env python3
"""Run a Week 2 local output and query it through DuckDBSqlEngine."""

import argparse
import json
from pathlib import Path
from typing import Any

from app.adapters.duckdb_sql_engine import DuckDBSqlEngine
from app.adapters.week2_catalog_store_source import Week2CatalogStoreSource
from app.services.ai_query import Week2AIQueryService
from app.services.week2_workflow import Week2WorkflowService


def run_smoke(args: argparse.Namespace) -> dict[str, Any]:
    """local runner output을 만들고 같은 Catalog를 DuckDB SQL로 조회한다."""

    workflow = Week2WorkflowService(output_root=args.output_root)
    run = workflow.trigger_run(
        "pipeline_reviews_json_e2e",
        executor=args.executor,
        triggered_by="m2_sql_runtime_smoke",
    )
    catalog = workflow.get_catalog_metadata("dataset_reviews_gold")
    catalog_source = Week2CatalogStoreSource(workflow.catalog_store)
    query_service = Week2AIQueryService(
        sql_engine=DuckDBSqlEngine(),
        catalog_source=catalog_source,
    )
    answer = query_service.answer(args.question)

    return {
        "status": answer.status,
        "run_id": run["run_id"],
        "executor": run["executor"],
        "engine": answer.query_result.engine,
        "sql": answer.sql,
        "row_count": answer.query_result.row_count,
        "rows": answer.rows,
        "local_fallback_path": catalog["storage"]["local_fallback_path"],
        "s3_uri": catalog["s3_uri"],
        "summary": answer.summary,
    }


def write_summary(path: Path, summary: dict[str, Any]) -> None:
    """수동 검증 결과를 data/ 아래 JSON 파일로 남긴다."""

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Week 2 M2 SQL runtime DuckDB smoke")
    parser.add_argument("--output-root", type=Path, default=Path("data/results/m2_sql_runtime_smoke/week2"))
    parser.add_argument("--summary-path", type=Path, default=Path("data/results/m2_sql_runtime_smoke/summary.json"))
    parser.add_argument("--executor", choices=["local_runner"], default="local_runner")
    parser.add_argument("--question", default="리뷰가 가장 많은 상품 알려줘")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    summary = run_smoke(args)
    write_summary(args.summary_path, summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
