# PH-DATA-2 보고서

## 상태

Completed.

## 변경 요약

- Taxi 원본 local path를 Product Health raw folder에 symlink로 연결한 상태를 검증했다.
- Taxi Parquet schema와 row count를 DuckDB로 확인했다.
- PH-DATA-1/1B smoke output의 `silver_delivery_trip_logs.parquet`가 실제 Taxi Parquet source 기반임을 확인했다.
- DuckDB timezone 반환에 필요한 `pytz==2026.2`를 backend requirements에 추가했다.

## 검증

| 항목 | 결과 |
| --- | --- |
| Taxi symlink | `data/local_sources/product_health/raw/taxi_existing/yellow_tripdata_2019_2025` -> `data/raw/taxi/yellow_tripdata_2019_2025` |
| Taxi symlink | `data/local_sources/product_health/raw/taxi_existing/yellow_tripdata_2026_partial` -> `data/raw/taxi/yellow_tripdata_2026_partial` |
| Parquet files | 88 |
| 2019-2025 source size | 4.6GB |
| 2026 partial source size | 245MB |
| 2019-2025 raw rows | 308,010,490 |
| delivery silver rows | 99,628 |
| delivery duration range | 0.0167 ~ 237.4167 minutes |
| avg delivery duration | 12.54 minutes |
| late delivery rate | 0.0849 |

확인한 raw Taxi schema 핵심 컬럼:

- `VendorID`
- `tpep_pickup_datetime`
- `tpep_dropoff_datetime`
- `trip_distance`
- `PULocationID`
- `DOLocationID`
- `fare_amount`
- `total_amount`

PH-DATA-1/1B에서 적용된 delivery filter:

- 2019 demo window
- non-positive duration 제거
- non-positive distance 제거
- negative total amount 제거
- duration <= 240 minutes

## Handoff

PH-DATA-3은 현재 Taxi 연결과 scenario-calibrated smoke transform을 기준으로 5GB evidence run을 진행한다.
