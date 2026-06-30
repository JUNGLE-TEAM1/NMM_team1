# PH-DATA-3 보고서

## 상태

Completed.

## 변경 요약

- `scripts/product_health_5gb_evidence_run.py`를 추가해 PH-DATA-3 전용 5GB processed-input evidence를 생성했다.
- 기존 Product Health Gold/smoke 산출물을 같은 runner invocation에서 재생성한 뒤, Kaggle `2019-Oct.csv` 전체를 chunk scan했다.
- `product_health_5gb_run_summary.json`에 `processed_input_total_bytes`, `input_total_bytes_semantics=processed_input_bytes`, source별 processed bytes/rows/duration을 기록했다.
- Gold output row count/bytes/path를 같은 summary에 연결했다.

## 검증

| 항목 | 결과 |
| --- | --- |
| run summary | `data/local_sources/product_health/evidence/product_health_5gb_run_summary.json` |
| run id | `run_product_health_5gb_001` |
| processed input bytes | `5668612855` |
| processed input 기준 | passed, 5GiB 이상 |
| behavior rows processed | `42448764` |
| behavior scan duration | `9225ms` |
| event type counts | `view=40779399`, `cart=926516`, `purchase=742849` |
| Gold output rows | `1000` |
| Gold SQL smoke | passed |

실행 명령:

```bash
.venv/bin/python scripts/product_health_5gb_evidence_run.py
.venv/bin/python -m py_compile scripts/product_health_5gb_evidence_run.py scripts/product_health_synthetic_smoke.py
```

## Handoff

PH-DATA-4는 `product_health_5gb_run_summary.json`, `dataset_product_health_gold.json`, `product_health_source_handoff.json`, Gold output path를 기준으로 M5 Catalog ingest를 진행한다.
