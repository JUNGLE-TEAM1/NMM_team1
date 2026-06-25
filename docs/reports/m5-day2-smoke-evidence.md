# M5 Day 2 Smoke Evidence 보고서

## Short Report / 짧은 보고

- Type: test/evidence
- Date: 2026-06-25
- Changed: M5 Week 2 Workflow/Catalog의 Day 2 smoke evidence를 실제 local runner 실행 결과로 기록했다.
- Verified: `ExecutionResult.row_count=4`, `ExecutionResult.bytes=580`, `CatalogMetadata.metrics.row_count=3`, `CatalogMetadata.metrics.bytes=195`; focused/backend/harness 검증 통과.
- Remaining: 실제 외부 Airflow webserver/scheduler/API 연결, Parquet/MinIO write, persistent Catalog store는 후속 M5/M3 integration slice에서 진행한다.
- Next context: Day 3 Catalog 연결에서는 이 evidence의 `run_id`, output path, `CatalogMetadata` lineage를 기준으로 persistent catalog 또는 M3 output handoff를 붙인다.
- Risk: 이번 smoke는 local JSONL fallback output이다. 실제 Parquet/MinIO/Airflow 환경 증거는 아니다.

## Daily Evidence / 하루 종료 증거

```text
Date: 2026-06-25
Module: M5 Workflow/Catalog
Owner: 이해건
Run ID: run_reviews_demo_001
Executed command or screen: PYTHONPATH=backend ./.venv/bin/python - <<'PY' ... Week2WorkflowService.trigger_run(...)
Input source or file: backend/samples/amazon_reviews_demo.jsonl
Output S3/local path: s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/
Local output path: /Users/sisu/Projects/jungle/nmm/NMM_team1/data/week2/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.jsonl
row_count: ExecutionResult=4 primary input rows; CatalogMetadata.metrics=3 output dataset rows
bytes: ExecutionResult=580 primary input bytes; CatalogMetadata.metrics=195 output dataset bytes
duration: 1 ms
Produced JSON: ExecutionResult, CatalogMetadata
Consumer module: M1, M6
Blocked issue: actual external Airflow, Parquet/MinIO write, persistent Catalog store are not implemented in this smoke
Next first action: Day 3 Catalog 연결에서 CatalogMetadata persistence 또는 M3 output handoff를 붙인다
```

## Command

```bash
PYTHONPATH=backend ./.venv/bin/python - <<'PY'
import json
from app.services.week2_workflow import Week2WorkflowService

service = Week2WorkflowService()
run = service.trigger_run("pipeline_reviews_json_e2e", "local_runner", "m5_owner")
catalog = service.get_catalog_metadata("dataset_reviews_gold")
print(json.dumps({"execution_result": run, "catalog_metadata": catalog}, ensure_ascii=False, indent=2, sort_keys=True))
PY
```

## Produced JSON

### ExecutionResult

```json
{
  "contract": "ExecutionResult",
  "tenant_id": "tenant_demo",
  "run_id": "run_reviews_demo_001",
  "pipeline_id": "pipeline_reviews_json_e2e",
  "executor": "local_runner",
  "fallback_compatible_executor": "local_runner",
  "status": "fallback_succeeded",
  "triggered_by": "m5_owner",
  "row_count": 4,
  "row_count_decision": "Primary input rows processed by the workflow run; fill with actual demo/fixed/extended sample result",
  "bytes": 580,
  "duration_ms": 1,
  "metric_semantics": {
    "row_count": "primary_input_rows_processed",
    "bytes": "primary_input_bytes_read",
    "task_results.row_count": "node_level_rows; load nodes record output dataset rows",
    "task_results.bytes": "node_level_bytes; source nodes record input bytes and load nodes record output bytes"
  },
  "outputs": [
    {
      "dataset_id": "dataset_reviews_gold",
      "layer": "gold",
      "uri": "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/",
      "uri_status": "example_pending_minio_path_contract"
    }
  ],
  "task_results": [
    {
      "node_id": "node_source_reviews",
      "status": "succeeded",
      "attempt": 1,
      "row_count": 4,
      "bytes": 580,
      "error": null
    },
    {
      "node_id": "node_filter_reviews",
      "status": "succeeded",
      "attempt": 1,
      "row_count": 4,
      "bytes": null,
      "error": null
    },
    {
      "node_id": "node_normalize_reviews",
      "status": "succeeded",
      "attempt": 1,
      "row_count": 4,
      "bytes": null,
      "error": null
    },
    {
      "node_id": "node_aggregate_reviews",
      "status": "succeeded",
      "attempt": 1,
      "row_count": 3,
      "bytes": null,
      "error": null
    },
    {
      "node_id": "node_load_reviews",
      "status": "succeeded",
      "attempt": 1,
      "row_count": 3,
      "bytes": 195,
      "error": null
    }
  ],
  "lineage": {
    "source_ids": ["source_amazon_reviews_demo"],
    "input_datasets": ["dataset_reviews_silver"],
    "output_datasets": ["dataset_reviews_gold"]
  },
  "logs": [
    {"level": "info", "message": "queued"},
    {"level": "info", "message": "running"},
    {"level": "info", "message": "node_source_reviews succeeded as Source"},
    {"level": "info", "message": "node_filter_reviews succeeded as Select/Filter"},
    {"level": "info", "message": "node_normalize_reviews succeeded as Cast/Normalize"},
    {"level": "info", "message": "node_aggregate_reviews succeeded as Aggregate"},
    {"level": "info", "message": "node_load_reviews succeeded as Load"},
    {"level": "info", "message": "fallback_succeeded"},
    {"level": "info", "message": "local runner executed Week 2 workflow boundary"}
  ],
  "error": null
}
```

### CatalogMetadata

```json
{
  "contract": "CatalogMetadata",
  "tenant_id": "tenant_demo",
  "dataset_id": "dataset_reviews_gold",
  "version": "v1",
  "name": "Amazon Reviews Gold",
  "layer": "gold",
  "s3_uri": "s3://asklake-demo/reviews/gold/run_id=run_reviews_demo_001/",
  "s3_uri_status": "example_pending_minio_path_contract",
  "storage": {
    "profile": "minio",
    "bucket": "asklake-demo",
    "prefix": "reviews/gold/run_id=run_reviews_demo_001/",
    "local_fallback_path": "/Users/sisu/Projects/jungle/nmm/NMM_team1/data/week2/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.jsonl"
  },
  "schema": {
    "schema_version": "schema_reviews_gold_v1",
    "fields": [
      {"name": "product_id", "type": "string", "nullable": false},
      {"name": "review_count", "type": "integer", "nullable": false},
      {"name": "average_rating", "type": "number", "nullable": true}
    ]
  },
  "metrics": {
    "semantics": {
      "row_count": "output_dataset_rows",
      "bytes": "output_dataset_bytes"
    },
    "row_count": 3,
    "bytes": 195,
    "quality": {
      "schema_match": "passed",
      "row_count_checked": true
    }
  },
  "lineage": {
    "source_ids": ["source_amazon_reviews_demo"],
    "pipeline_id": "pipeline_reviews_json_e2e",
    "run_id": "run_reviews_demo_001",
    "upstream_datasets": ["dataset_reviews_silver"]
  },
  "query": {
    "table_name": "reviews_gold",
    "allow_readonly_sql": true,
    "allowed_columns": ["product_id", "review_count", "average_rating"],
    "default_limit": 100,
    "timeout_seconds": 30
  },
  "freshness": {
    "event_time_column": null,
    "data_interval_start": null,
    "data_interval_end": null
  }
}
```

## Output File Check

```text
wc -l data/week2/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.jsonl -> 3
wc -c backend/samples/amazon_reviews_demo.jsonl -> 580
wc -c data/week2/reviews/gold/run_id=run_reviews_demo_001/dataset_reviews_gold.jsonl -> 195
```

Output rows:

```json
{"average_rating": 4.5, "product_id": "B001", "review_count": 2}
{"average_rating": 2.0, "product_id": "B002", "review_count": 1}
{"average_rating": 5.0, "product_id": "B003", "review_count": 1}
```

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_local_runner.py backend/tests/test_week2_workflow_catalog.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests -q
jq -e . contracts/source_config.sample.json contracts/schema_definition.sample.json contracts/workflow_definition.sample.json contracts/execution_result.sample.json contracts/catalog_metadata.sample.json contracts/ai_query_result.sample.json
scripts/validate-harness.sh --strict
```

## Verification Result / 검증 결과

- Focused tests: 12 passed
- Backend tests: 30 passed
- Contract JSON validation: passed
- Strict harness validation: passed

## Final Judgment / 최종 판단

- Done: M5 Day 2 smoke evidence is recorded with actual `ExecutionResult`, `CatalogMetadata`, row/bytes semantics, output path, and validation commands.
- Remaining risk: this is local JSONL fallback evidence only; external Airflow, Parquet/MinIO, and persistent Catalog registration remain follow-up work.
