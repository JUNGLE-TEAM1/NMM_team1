# PH-DATA-1 Synthetic data script smoke 계획

## 목적

PH-DATA-0 profile 결과를 반영해 smoke 규모의 Product Health 합성데이터를 재현 가능하게 생성한다.

## 범위

- 합성데이터 생성 스크립트 작성
- `silver_user_events`, `silver_product_reviews`, `silver_product_catalog`, `silver_delivery_trip_logs` 생성
- `seed_product_mapping` 생성
- `gold_product_health` 생성
- Catalog handoff JSON과 run summary 생성

## 제외 범위

- Taxi 5GB 실제 연결
- 5GB evidence run
- M5 실제 Catalog ingest
- M6 실제 SQL grounding

## 입력 문서

- `product-health-synthetic-data-contract.md`
- PH-DATA-0 `raw_profile_report.json`
- PH-DATA-0 `raw_profile_summary.md`

## 입력 데이터

- PH-DATA-0에서 확정한 smoke source subset

## 산출물

- 합성데이터 생성 스크립트
- `data/local_sources/product_health/silver/*.parquet`
- `data/local_sources/product_health/silver/seed_product_mapping.parquet`
- `data/local_sources/product_health/gold/gold_product_health.parquet`
- `data/local_sources/product_health/catalog/dataset_product_health_gold.json`
- `data/local_sources/product_health/evidence/product_health_run_summary.json`

## 완료 기준

- smoke script를 한 번 실행해 모든 산출물이 생성된다.
- Gold row count가 0보다 크다.
- `risk_score`, `conversion_rate`, `negative_review_rate`, `late_delivery_rate`가 null 없이 계산된다.
- DuckDB 또는 동등한 local SQL engine으로 Gold parquet를 SELECT할 수 있다.

## 수동 검증 방법

1. smoke script를 실행한다.
2. silver, gold, catalog, evidence output 경로를 확인한다.
3. `gold_product_health` schema와 top risk rows를 확인한다.
4. 생성 결과를 사용자에게 보여주고 PH-DATA-2 진행 여부를 확인한다.

## 다음 Phase handoff

PH-DATA-2는 smoke delivery fallback을 실제 Taxi source 기반 delivery silver로 교체한다.
