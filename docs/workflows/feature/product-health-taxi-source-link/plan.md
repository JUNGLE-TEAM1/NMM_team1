# PH-DATA-2 Taxi local file 연결 계획

## 목적

보유 중인 Taxi 5GB 데이터를 Product Health delivery source로 연결해 synthetic fallback이 아닌 실제 local source 기반 delivery silver를 만든다.

## 범위

- Taxi local path 확인
- Taxi schema/profile 확인
- delivery silver input 경로 갱신
- smoke script의 delivery fallback 제거 또는 우선순위 조정
- delivery silver 재생성 evidence 기록

## 제외 범위

- 전체 5GB end-to-end evidence run
- M5 Catalog ingest
- M6 SQL 연결

## 입력 문서

- `product-health-synthetic-data-contract.md`
- PH-DATA-1 report
- 기존 M2 Taxi evidence workspace 문서

## 입력 데이터

- 사용자가 보유한 Taxi 5GB local file 또는 directory
- `data/local_sources/product_health/raw/taxi_existing/`

## 산출물

- Taxi source path 기록
- Taxi schema/profile summary
- `silver/silver_delivery_trip_logs.parquet` 재생성 evidence
- run summary의 delivery source 갱신

## 완료 기준

- Taxi source path가 계약 또는 run summary에 기록된다.
- delivery silver가 실제 Taxi source에서 생성된다.
- fallback 사용 여부가 명확히 기록된다.

## 수동 검증 방법

1. Taxi local path가 존재하는지 확인한다.
2. Taxi profile에서 pickup/dropoff/distance/cost 계열 컬럼을 확인한다.
3. delivery silver row count가 0보다 큰지 확인한다.
4. PH-DATA-3에서 사용할 5GB input 후보를 확인한다.

## 다음 Phase handoff

PH-DATA-3은 Taxi 연결 후 같은 transform으로 5GB 이상 input evidence를 만든다.
