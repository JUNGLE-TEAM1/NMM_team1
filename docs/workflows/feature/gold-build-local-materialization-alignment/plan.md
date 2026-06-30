# Gold Build local materialization alignment 계획

## 목표

현재 `TargetDatasetLocalRunner`가 1-row demo JSONL evidence를 만드는 경계임을 명확히 하고, 준비된 Product Health Gold parquet/catalog를 Gold Build Run/Catalog/AI Query 흐름에 자연스럽게 연결한다.

## 진행 상태

- Status: completed
- Date: 2026-06-30
- prepared Product Health Gold parquet reference mode와 기존 local demo JSONL mode를 분리했다.

## 범위

- 기존 prepared gold output을 Job Run/Catalog publish 경로에서 참조할 수 있는 metadata alignment.
- Local runner 실행 결과와 prepared output 참조 결과를 UI에서 구분.
- Gold Build Job에서 `prepared output 사용` 또는 `local demo materialize` 경계 문구 정리.

## 제외 범위

- 대용량 ETL 신규 실행.
- Spark/Airflow 실제 실행.
- Product Health parquet 재생성.
- row-level transform semantics 변경.

## 선행 조건

- Product Health prepared dataset 연결.
- C-4.5, C-5, C-6 흐름이 유지되어야 한다.

## 구현 대상 파일 예상

- `backend/app/services/target_dataset_local_runner.py`
- `backend/app/api/source_catalog.py`
- `backend/app/adapters/sqlite_metadata_store.py`
- `frontend/src/app/App.jsx`
- tests for prepared output publication

## API/contract 영향

- Job Run materialization result에 prepared output mode를 표시할 optional metadata가 필요할 수 있다.
- `target_dataset_job_run.sample.json`, `catalog_metadata.sample.json` 검토.

## UI 영향

- Gold Build Job 실행/준비 화면에서 `prepared gold output`과 `local demo output` 구분.
- Run detail에서 실제 output path가 prepared parquet인지 generated JSONL인지 표시.
- Catalog publish 후 AI Query readiness가 해당 path를 읽는다.

## Acceptance Criteria

- prepared Gold parquet를 참조하는 run이 CatalogDataset publish 경로로 이어진다.
- AI Query readiness가 live CatalogDataset path/schema를 표시한다.
- 1-row demo materializer가 대용량 ETL처럼 오해되지 않는다.

## Regression / Failure Scenario

- succeeded run이 아닌 run은 Catalog publish되지 않는다.
- prepared path가 없으면 publish 성공으로 표시하지 않는다.

## Manual Verification

1. Gold Build Job에서 prepared output 경로를 확인한다.
2. Run 생성/상태 확인.
3. Catalog publish.
4. AI Query readiness 확인.

## Data / Evidence 확인 항목

- `data/local_sources/product_health/gold/gold_product_health.parquet`
- `data/local_sources/product_health/catalog/dataset_product_health_gold.json`
- `data/dataset_runs/*`

## Blocked Condition

- prepared output을 runner 결과로 볼지, catalog seed로 볼지 product decision이 없다.
- 기존 C-4.5 local runner와 path semantics가 충돌한다.

## Report 기준

- `docs/reports/gold-build-local-materialization-alignment.md`에 prepared/local demo 경계와 검증 결과를 기록한다.
