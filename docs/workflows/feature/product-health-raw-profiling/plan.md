# PH-DATA-0 Raw sample profiling & contract calibration 계획

## 목적

받아둔 Kaggle, Amazon, MEP, Taxi 샘플을 실제로 읽어 `product-health-synthetic-data-contract.md`가 현실 데이터와 맞는지 검증한다.

## 범위

- 원본 파일 존재 여부, 크기, format 확인
- source별 컬럼, 타입, sample rows 확인
- row count estimate, bytes, 날짜 범위 확인
- category/brand 분포 확인
- 계약과 맞지 않는 컬럼, 타입, 경로, 누락 source 기록

## 제외 범위

- Silver/Gold 데이터 생성
- mapping table 확정
- 5GB 실행
- M5 Catalog 등록
- M6 SQL 연결

## 입력 문서

- `docs/project-context/asklake-week2-module-plan/ver2/product-health-demo-data-design.md`
- `docs/project-context/asklake-week2-module-plan/ver2/product-health-synthetic-data-contract.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`

## 입력 데이터

- `data/local_sources/product_health/raw/kaggle_ecommerce_behavior/2019-Oct.csv`
- `data/local_sources/product_health/raw/kaggle_ecommerce_behavior/2019-Nov.csv`
- `data/local_sources/product_health/raw/amazon_reviews_2023/raw/review_categories/All_Beauty.jsonl`
- `data/local_sources/product_health/raw/amazon_reviews_2023/raw/meta_categories/meta_All_Beauty.jsonl`
- `data/local_sources/product_health/raw/mep_3m/annotations-1k.json`
- `data/local_sources/product_health/raw/mep_3m/annotations.json`
- `data/local_sources/product_health/raw/taxi_existing/`

## 산출물

- `data/local_sources/product_health/evidence/raw_profile_report.json`
- `data/local_sources/product_health/evidence/raw_profile_summary.md`
- 계약 보정 제안 목록

## 완료 기준

- 필수 source별 profile 결과가 생성되어 있다.
- Taxi 파일이 없으면 missing blocker로 명시되어 있다.
- 현재 계약과 다른 컬럼명, 타입, format, 경로가 정리되어 있다.
- PH-DATA-1에서 쓸 smoke input 범위가 제안되어 있다.

## 수동 검증 방법

1. raw profile report가 JSON으로 열리는지 확인한다.
2. summary markdown에서 source별 sample row와 schema를 확인한다.
3. 계약 보정 제안이 `product-health-synthetic-data-contract.md`의 어느 항목을 바꿔야 하는지 가리키는지 확인한다.

## 다음 Phase handoff

PH-DATA-1은 이 Phase의 profile 결과를 기준으로 smoke 합성 스크립트의 입력 컬럼과 fallback을 결정한다.
