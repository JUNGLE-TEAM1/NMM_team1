# PH-DATA-1B Scenario bucket calibration 계획

## 목적

PH-DATA-1 smoke output을 데모 질문에 더 잘 맞도록 보정한다. Raw 원본은 변경하지 않고, `seed_product_mapping`과 Gold 생성 단계에 시나리오 설명 컬럼과 risk pattern을 추가한다.

## 범위

- scenario bucket 정의
- `seed_product_mapping`에 `scenario_bucket`, `risk_driver`, `mapping_reason`, `demo_category_label` 추가
- `gold_product_health`에 같은 설명 컬럼 추가
- 위험 상품군 top rows가 발표 질문에 자연스럽게 나오도록 metric pattern 보정
- DuckDB query로 시나리오별 대표 상품 확인

## 제외 범위

- Raw 원본 수정
- 5GB evidence run
- M5 Catalog ingest 구현
- M6 answer generation 구현

## 입력 문서

- `docs/workflows/feature/product-health-synthetic-smoke/report.md`
- `docs/project-context/asklake-week2-module-plan/ver2/product-health-synthetic-data-contract.md`

## 입력 데이터

- `data/local_sources/product_health/silver/*.parquet`
- `data/local_sources/product_health/gold/gold_product_health.parquet`
- `data/local_sources/product_health/catalog/dataset_product_health_gold.json`

## 산출물

- 보정된 `silver/seed_product_mapping.parquet`
- 보정된 `gold/gold_product_health.parquet`
- 보정된 `catalog/dataset_product_health_gold.json`
- 보정된 `evidence/product_health_run_summary.json`

## 완료 기준

- `gold_product_health`에 `scenario_bucket`, `risk_driver`, `demo_category_label`이 존재한다.
- top risk rows에 `review_delivery_risk` 또는 `high_view_low_conversion` 시나리오가 포함된다.
- healthy baseline 상품군이 비교군으로 존재한다.
- DuckDB로 시나리오별 risk summary와 top risk query가 반환된다.

## 수동 검증 방법

1. smoke 생성 스크립트를 실행한다.
2. Gold schema에 scenario 컬럼이 있는지 확인한다.
3. `order by risk_score desc limit 10` 결과가 데모 질문에 맞는지 확인한다.
4. `group by scenario_bucket` 결과에서 위험/정상 버킷이 구분되는지 확인한다.

## 다음 Phase handoff

PH-DATA-3은 같은 scenario-calibrated transform을 사용해 5GB evidence run을 만든다.
