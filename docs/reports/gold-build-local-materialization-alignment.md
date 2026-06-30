# Gold Build local materialization alignment 보고서

## Short Report / 짧은 보고

- Type: Phase C-17
- Date: 2026-06-30
- Changed: Gold Build local execution에서 prepared Product Health parquet reference와 local demo JSONL materialization을 분리했다.
- Verified: backend focused tests 11개, frontend build, `/runs` browser smoke, Catalog/AI Query HTTP smoke.
- Remaining: Airflow/Spark 실제 실행과 대용량 ETL 신규 실행은 후속 Phase.
- Next context: Kafka replay evidence UI 또는 runner readiness phase.
- Risk: smoke로 생성된 duplicate local run/catalog records cleanup 정책이 필요하다.

## Goal / 목표

- 준비된 Product Health Gold parquet를 Catalog/AI Query 경로로 연결하되, 1-row JSONL demo materializer와 섞이지 않게 한다.

## Implementation Summary / 구현 요약

- `dataset_product_health`는 `gold_product_health.parquet`를 참조하는 `prepared_gold_reference` run으로 실행된다.
- 기존 demo 이름은 `local_demo_jsonl`로 `data/dataset_runs/<run_id>/` 아래 JSONL을 계속 만든다.
- prepared parquet publish는 draft preview가 아니라 실제 parquet schema/sample을 CatalogDataset에 저장한다.
- AI Query retriever는 `internal_product_id`를 product key alias로 처리한다.
- `/runs` 화면은 `prepared parquet reference`와 `local demo JSONL`을 구분한다.

## Verification

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_week2_ai_query_duckdb.py -q
npm run build
```

- Result: `11 passed`, frontend build passed.
- Browser: `/runs`에서 `prepared parquet reference · rows 1000 · .../gold_product_health.parquet` 확인.
- AI Query: `SELECT internal_product_id, risk_score ... FROM dataset_product_health ...` succeeded.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: local smoke records cleanup/seed 정책은 후속에서 정리.
