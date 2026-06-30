# PH-DATA-1B 품질 기록

## Context Budget mode

- Mode: Lite Read
- 주요 문서: `product-health-synthetic-data-contract.md`, PH-DATA-1 report

## 검증 결과

| 항목 | 기준 |
| --- | --- |
| scenario columns | passed. Gold와 seed mapping에 `scenario_bucket`, `risk_driver`, `mapping_reason`, `demo_category_label` 존재 |
| risk pattern | passed. top risk rows가 `review_delivery_risk`로 정렬됨 |
| baseline | passed. `healthy_baseline` 550 products 존재 |
| SQL smoke | passed. scenario별 summary와 top risk query 반환 |

## 실행 증거

| 명령 | 결과 |
| --- | --- |
| `.venv/bin/python scripts/product_health_synthetic_smoke.py` | passed. scenario-calibrated Gold 재생성 |
| DuckDB scenario summary query | passed. 4개 scenario bucket 반환 |
| DuckDB top risk query | passed. top rows가 `review_delivery_risk`로 반환 |

## 시나리오별 결과

| Scenario | Demo label | Products | Avg risk | Avg conversion | Avg negative | Avg late |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `review_delivery_risk` | Beauty / Skin Care Sets | 150 | 77.63 | 0.0350 | 0.6857 | 0.7160 |
| `quality_complaint` | Home / Small Appliances | 150 | 57.50 | 0.0560 | 0.7672 | 0.0344 |
| `high_view_low_conversion` | Electronics / Smartphone Accessories | 150 | 44.46 | 0.0200 | 0.1002 | 0.0395 |
| `healthy_baseline` | Daily Goods / Stable Sellers | 550 | 1.95 | 0.1600 | 0.0377 | 0.0105 |
