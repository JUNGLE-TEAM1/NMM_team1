# PH-DATA-2B 보고서

## 상태

Completed.

## 변경 요약

- `scripts/product_health_synthetic_smoke.py`가 `catalog/product_health_source_handoff.json`을 생성하도록 보강했다.
- source role별 `connection_id`, `source_dataset_id`를 고정했다.
- `dataset_product_health_gold.json` lineage에 `source_handoff_path`와 source dataset 목록을 추가했다.
- `product_health_run_summary.json` sources에 `connection_id`, `source_dataset_id`를 추가했다.
- `product-health-synthetic-data-contract.md`와 ver2 README에 PH-DATA-2B를 반영했다.

## 검증

| 항목 | 결과 |
| --- | --- |
| smoke script | passed |
| source handoff | 2 external connections, 5 source datasets |
| run summary source ids | passed |
| catalog lineage handoff path | passed |
| Gold output | 1,000 rows |
| SQL smoke | 10 rows |

실행 명령:

```bash
.venv/bin/python scripts/product_health_synthetic_smoke.py
.venv/bin/python - <<'PY'
import json
from pathlib import Path
root = Path('data/local_sources/product_health')
handoff = json.loads((root/'catalog/product_health_source_handoff.json').read_text())
catalog = json.loads((root/'catalog/dataset_product_health_gold.json').read_text())
summary = json.loads((root/'evidence/product_health_run_summary.json').read_text())
assert len(handoff['external_connections']) == 2
assert len(handoff['source_datasets']) == 5
assert catalog['lineage']['source_handoff_path'].endswith('product_health_source_handoff.json')
assert summary['source_handoff_path'].endswith('product_health_source_handoff.json')
assert all(source.get('connection_id') and source.get('source_dataset_id') for source in summary['sources'])
PY
```

## Handoff

다음 PH-DATA-3은 5GB evidence run을 수행하되, 이번 Phase에서 고정한 source dataset id를 그대로 유지한다.

PR #297이 머지되면 `conn_taxi_postgres`를 실제 Taxi PostgreSQL connection으로 등록하고, 그 전까지는 local parquet fallback을 deterministic evidence로 사용한다.
