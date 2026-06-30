# PH-DATA-2 품질 기록

## Context Budget mode

- Mode: Lite Read
- 주요 문서: `product-health-synthetic-data-contract.md`, PH-DATA-1 report

## 검증 결과

| 항목 | 기준 |
| --- | --- |
| local path | passed. Product Health raw folder에 Taxi symlink 3개 존재 |
| schema | passed. pickup/dropoff/location/distance/fare 계열 컬럼 확인 |
| output | passed. `silver_delivery_trip_logs.parquet` 99,628 rows |
| evidence | passed. run summary에 delivery source, input files, filters, bytes 기록 |

## 실행 증거

| 명령 | 결과 |
| --- | --- |
| `find -L data/local_sources/product_health/raw/taxi_existing -type f -name '*.parquet' \| wc -l` | passed, 88 files |
| `du -shL data/local_sources/product_health/raw/taxi_existing/*` | passed, 4.6GB + 245MB + inventory |
| DuckDB raw Taxi schema/count query | passed, 308,010,490 rows in 2019-2025 directory |
| DuckDB delivery silver query | passed, 99,628 rows |

## 의존성 보강

- `pytz==2026.2`를 추가했다. DuckDB가 `TIMESTAMP WITH TIME ZONE` 값을 Python으로 반환할 때 필요했다.
