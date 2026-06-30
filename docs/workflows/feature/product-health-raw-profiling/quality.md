# PH-DATA-0 품질 기록

## Context Budget mode

- Mode: Lite Read
- 주요 문서: `product-health-demo-data-design.md`, `product-health-synthetic-data-contract.md`, `main-e2e-path.md`

## 검증 결과

| 항목 | 기준 |
| --- | --- |
| source existence | passed. Kaggle CSV, Amazon JSONL, MEP JSON/XLSX, Taxi Parquet source 확인 |
| schema profile | passed. source별 schema, sample row, row count estimate 또는 metadata row count 기록 |
| data range | passed. Kaggle/Amazon sample range와 Taxi DuckDB date range 기록 |
| contract drift | passed. category fallback, timestamp parse, MEP large JSON, Taxi outlier filter, path convention 기록 |

## 실행 증거

| 명령 | 결과 |
| --- | --- |
| `.venv/bin/python scripts/product_health_raw_profile.py` | passed. `raw_profile_report.json`, `raw_profile_summary.md` 생성 |
| `.venv/bin/python - <<'PY' ... import pandas, pyarrow, duckdb, openpyxl, pyspark ... PY` | passed. 계약 의존성 import/version 확인 |

## 산출물

- `data/local_sources/product_health/evidence/raw_profile_report.json`
- `data/local_sources/product_health/evidence/raw_profile_summary.md`
