# PH-DATA-1B 보고서

## 상태

Completed.

## 변경 요약

- PH-DATA-1 smoke 생성 스크립트에 scenario bucket calibration을 추가했다.
- `seed_product_mapping`에 `scenario_bucket`, `risk_driver`, `mapping_reason`, `demo_category_label`을 추가했다.
- `gold_product_health`에 동일한 설명 컬럼을 전파했다.
- Catalog allowed columns와 lineage에 scenario calibration 정보를 추가했다.
- Gold를 재생성하고 DuckDB scenario summary / top risk query를 검증했다.

## 검증

| 항목 | 결과 |
| --- | --- |
| Gold row count | 1,000 |
| scenario bucket count | 4 |
| top risk scenario | `review_delivery_risk` |
| healthy baseline | 550 products |
| `top_complaint_topics` type | `VARCHAR[]` |

시나리오별 요약:

| Scenario | Demo label | Products | Avg risk | Avg conversion | Avg negative | Avg late |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `review_delivery_risk` | Beauty / Skin Care Sets | 150 | 77.63 | 0.0350 | 0.6857 | 0.7160 |
| `quality_complaint` | Home / Small Appliances | 150 | 57.50 | 0.0560 | 0.7672 | 0.0344 |
| `high_view_low_conversion` | Electronics / Smartphone Accessories | 150 | 44.46 | 0.0200 | 0.1002 | 0.0395 |
| `healthy_baseline` | Daily Goods / Stable Sellers | 550 | 1.95 | 0.1600 | 0.0377 | 0.0105 |

Top risk 예시:

| Product | Scenario | Demo label | Conversion | Negative | Late | Risk |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| `aph_prod_000006` | `review_delivery_risk` | Beauty / Skin Care Sets | 0.035 | 1.000 | 0.700 | 88.23 |
| `aph_prod_000011` | `review_delivery_risk` | Beauty / Skin Care Sets | 0.035 | 1.000 | 0.700 | 88.23 |
| `aph_prod_000064` | `review_delivery_risk` | Beauty / Skin Care Sets | 0.035 | 1.000 | 0.700 | 88.23 |

## Handoff

PH-DATA-3은 이 Phase의 scenario-calibrated output을 기준으로 시작한다.

PH-DATA-4 전에는 Catalog output path convention을 `data/local_sources/product_health/gold/gold_product_health.parquet`와 M5 active convention 중 하나로 정렬해야 한다.
