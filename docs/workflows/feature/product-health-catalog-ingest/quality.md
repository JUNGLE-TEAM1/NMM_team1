# PH-DATA-4 품질 기록

## Context Budget mode

- Mode: Lite Read
- 주요 문서: `product-health-synthetic-data-contract.md`, PH-DATA-3 report, `docs/03-interface-reference.md`, M5 Catalog store 코드

## 검증 결과

| 항목 | 기준 | 결과 |
| --- | --- | --- |
| catalog lookup | `GET /api/week2/catalog/dataset_product_health_gold` 200 | passed |
| SQL context | `query.table_name=gold_product_health` | passed |
| storage | `local_fallback_path` 실제 파일 연결 | passed |
| lineage | source dataset 5개와 run id 연결 | passed |
| metrics | output bytes와 processed input bytes 의미 분리 | passed |

## 실행 증거

| 명령 | 결과 |
| --- | --- |
| `.venv/bin/python scripts/product_health_catalog_ingest.py` | passed |
| FastAPI TestClient catalog lookup | passed |
| `PYTHONPATH=backend` service lookup | passed |
| DuckDB Gold top risk query | passed |
| `.venv/bin/python -m py_compile scripts/product_health_catalog_ingest.py` | passed |

## 확인 값

| 항목 | 값 |
| --- | --- |
| `dataset_id` | `dataset_product_health_gold` |
| `query.table_name` | `gold_product_health` |
| `metrics.processed_input_total_bytes` | `5668612855` |
| `metrics.row_count` | `1000` |
| `storage.local_fallback_path` | `data/local_sources/product_health/gold/gold_product_health.parquet` |
