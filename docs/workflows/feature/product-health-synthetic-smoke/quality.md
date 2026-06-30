# PH-DATA-1 품질 기록

## Context Budget mode

- Mode: Lite Read
- 주요 문서: `product-health-synthetic-data-contract.md`, PH-DATA-0 산출물

## 검증 결과

| 항목 | 기준 |
| --- | --- |
| reproducibility | passed. fixed random seed `20260630` 사용 |
| output existence | passed. silver/gold/catalog/evidence 파일 생성 |
| schema | passed. 계약의 Gold 필수 컬럼과 metric 컬럼 존재 |
| SQL smoke | passed. DuckDB로 Gold parquet top risk query 반환 |

## 실행 증거

| 명령 | 결과 |
| --- | --- |
| `.venv/bin/python scripts/product_health_synthetic_smoke.py` | passed. Gold 1,000 rows 생성, SQL smoke 10 rows |
| `.venv/bin/python - <<'PY' ... DuckDB row/null check ... PY` | passed. 핵심 metric null count 0 |

## 산출물

| Output | Row count | Path |
| --- | ---: | --- |
| silver user events | 228,592 | `data/local_sources/product_health/silver/silver_user_events.parquet` |
| silver product reviews | 8,477 | `data/local_sources/product_health/silver/silver_product_reviews.parquet` |
| silver product catalog | 1,000 | `data/local_sources/product_health/silver/silver_product_catalog.parquet` |
| silver delivery trip logs | 99,628 | `data/local_sources/product_health/silver/silver_delivery_trip_logs.parquet` |
| seed mapping | 1,000 | `data/local_sources/product_health/silver/seed_product_mapping.parquet` |
| Gold product health | 1,000 | `data/local_sources/product_health/gold/gold_product_health.parquet` |

## Metric 검증

- `risk_score` null count: 0
- `conversion_rate` null count: 0
- `negative_review_rate` null count: 0
- `late_delivery_rate` null count: 0
- `risk_score` range: 8.84 ~ 100.0
