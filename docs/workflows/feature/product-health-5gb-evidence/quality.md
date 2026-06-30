# PH-DATA-3 품질 기록

## Context Budget mode

- Mode: Lite Read
- 주요 문서: `product-health-synthetic-data-contract.md`, PH-DATA-2C report, `docs/03-interface-reference.md`

## 검증 결과

| 항목 | 기준 | 결과 |
| --- | --- | --- |
| processed bytes | `processed_input_total_bytes >= 5GiB` | passed |
| input semantics | `input_total_bytes_semantics=processed_input_bytes` | passed |
| source evidence | behavior source row/bytes/duration 기록 | passed |
| Gold output | Gold parquet 1,000 rows | passed |
| SQL smoke | scenario bucket aggregate query | passed |

## 실행 증거

| 명령 | 결과 |
| --- | --- |
| `.venv/bin/python scripts/product_health_5gb_evidence_run.py` | passed |
| Python JSON assertion | passed |
| DuckDB Gold scenario query | passed |
| `.venv/bin/python -m py_compile scripts/product_health_5gb_evidence_run.py scripts/product_health_synthetic_smoke.py` | passed |

## 확인 값

| 항목 | 값 |
| --- | --- |
| `processed_input_total_bytes` | `5668612855` |
| `input_total_bytes` | `5668612855` |
| `available_source_total_bytes` | `11080285895` |
| behavior rows processed | `42448764` |
| Gold output rows | `1000` |
