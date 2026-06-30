# Product Health handoff catalog ingest plan

## 목표

`product-health-demo-dataset-handoff` bundle을 AskLake Week 2 AI Query가 읽을 수 있는 canonical `gold_product_health` dataset으로 import한다.

## 범위

- handoff Gold parquet를 `schema_product_health_gold_v2` query-facing 컬럼으로 변환한다.
- `silver/seed_product_mapping.parquet`을 사용해 source identifier와 match evidence 컬럼을 보강한다.
- Week 2 `CatalogMetadata`와 `ExecutionResult` run metadata를 `data/results/week2/_metadata/`에 저장한다.
- raw handoff catalog shape가 들어와도 M6 AI Query가 500으로 죽지 않도록 schema helper를 보강한다.
- DuckDB AI Query smoke로 `dataset_product_health_gold` 선택, SQL rows, 5GB input evidence 반환을 확인한다.

## 범위 제외

- `silver/*.parquet`을 별도 사용자-facing Catalog dataset으로 노출하지 않는다.
- AI Query planner를 `internal_product_id` 중심으로 재작성하지 않는다.
- raw source 재수집, Spark 재실행, UI 대개편은 포함하지 않는다.

## 구현 프롬프트

1. `scripts/import_product_health_handoff.py`를 추가한다.
2. canonical Gold parquet와 Week 2 catalog/run metadata를 생성한다.
3. M6 Catalog schema helper를 list/dict shape 모두 안전하게 읽도록 보강한다.
4. focused tests와 실제 handoff import smoke를 실행한다.

## 검증 프롬프트

- `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_product_health_handoff_import.py -q`
- `PYTHONPATH=backend ./.venv/bin/python scripts/import_product_health_handoff.py /Users/jungilyou/Downloads/product-health-demo-dataset-handoff`
- Week2CatalogStoreSource + DuckDBSqlEngine으로 "위험 점수가 높은 상품 알려줘" smoke를 실행한다.
- 관련 M6 focused tests와 harness validation을 실행한다.

## 완료 기준

- canonical Gold parquet가 1,000행으로 생성된다.
- `CatalogMetadata.schema.fields`와 `query.allowed_columns`가 `schema_product_health_gold_v2` 컬럼을 가진다.
- `CatalogMetadata.metrics.input_total_bytes`가 5GB 이상이다.
- AI Query가 `dataset_product_health_gold`를 선택하고 DuckDB rows를 반환한다.
- raw handoff catalog 직접 사용은 500 대신 blocked/unsupported로 처리된다.
