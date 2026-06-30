# PH-DATA-1 보고서

## 상태

Completed.

## 변경 요약

- `scripts/product_health_synthetic_smoke.py`를 추가했다.
- PH-DATA-0 profile 결과를 반영해 smoke 규모의 Silver 4종, `seed_product_mapping`, `gold_product_health`를 생성했다.
- `catalog/dataset_product_health_gold.json` handoff 파일을 생성했다.
- `evidence/product_health_run_summary.json` 실행 요약을 생성했다.
- DuckDB로 Gold parquet top-risk query를 검증했다.

## 검증

| 항목 | 결과 |
| --- | --- |
| smoke script 실행 | passed |
| Gold row count | 1,000 |
| DuckDB SQL smoke | passed, top 10 risk rows 반환 |
| 핵심 metric null | `risk_score`, `conversion_rate`, `negative_review_rate`, `late_delivery_rate` 모두 0 |
| input_total_bytes | 11,080,285,895 |

생성된 output:

| Output | Row count | Bytes |
| --- | ---: | ---: |
| `silver_user_events.parquet` | 228,592 | 6.8MB |
| `silver_product_reviews.parquet` | 8,477 | 1.2MB |
| `silver_product_catalog.parquet` | 1,000 | 210KB |
| `silver_delivery_trip_logs.parquet` | 99,628 | 2.1MB |
| `seed_product_mapping.parquet` | 1,000 | 36KB |
| `gold_product_health.parquet` | 1,000 | 117KB |

PH-DATA-0 보정 반영:

- Kaggle `category_code` blank는 `category_id` fallback으로 처리했다.
- Amazon `timestamp`는 epoch milliseconds로 파싱했다.
- MEP smoke catalog는 `annotations-1k.json`을 사용했다.
- Taxi는 2019 demo window, positive duration/distance/cost, duration <= 240 minutes filter를 적용했다.
- 원천 간 실제 공통 키가 없으므로 `mapping_method=synthetic_seed`, `mapping_confidence=0.62`로 lineage를 남겼다.

## Handoff

PH-DATA-2는 원래 Taxi local file 연결 Phase였으나, 현재 smoke는 이미 실제 Taxi Parquet symlink와 delivery silver를 사용했다. 다음 진행 시 선택지는 두 가지다.

1. PH-DATA-2를 짧게 수행해 Taxi source 연결 상태와 filter 기준을 별도 Phase로 확정한다.
2. 사용자 확인 후 PH-DATA-3 5GB evidence run으로 바로 넘어간다.

PH-DATA-4 전에는 M5 Catalog output path convention과 `data/local_sources/product_health/gold/gold_product_health.parquet` 경로 차이를 정렬해야 한다.
