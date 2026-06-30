# PH-DATA-4 보고서

## 상태

Completed.

## 변경 요약

- `scripts/product_health_catalog_ingest.py`를 추가해 Product Health handoff/run summary를 Week 2 `CatalogMetadata` shape로 변환했다.
- `dataset_product_health_gold` Catalog metadata와 `run_product_health_5gb_001` ExecutionResult metadata를 생성했다.
- 앱 기본 경로 `data/results/week2/_metadata/`와 직접 서비스 호환 경로 `data/week2/_metadata/`에 metadata를 쓴다.
- `/api/week2/catalog/dataset_product_health_gold` 조회 기준을 검증했다.
- `storage.local_fallback_path`, `query.table_name`, `query.allowed_columns`, processed input metrics, lineage source ids를 보존했다.

## 검증

| 항목 | 결과 |
| --- | --- |
| ingest script | passed |
| API catalog lookup | passed |
| dataset id | `dataset_product_health_gold` |
| table name | `gold_product_health` |
| local fallback path | `data/local_sources/product_health/gold/gold_product_health.parquet` |
| processed input bytes | `5668612855` |
| Gold output rows | `1000` |
| lineage source ids | 5개 |
| DuckDB local path smoke | passed |

실행 명령:

```bash
.venv/bin/python scripts/product_health_catalog_ingest.py
PYTHONPATH=backend .venv/bin/python - <<'PY'
from fastapi.testclient import TestClient
from app.core.app_factory import create_app
client = TestClient(create_app())
response = client.get('/api/week2/catalog/dataset_product_health_gold')
assert response.status_code == 200, response.text
payload = response.json()
assert payload['dataset_id'] == 'dataset_product_health_gold'
assert payload['query']['table_name'] == 'gold_product_health'
assert payload['metrics']['processed_input_total_bytes'] >= 5 * 1024**3
assert payload['storage']['local_fallback_path'] == 'data/local_sources/product_health/gold/gold_product_health.parquet'
PY
```

## Handoff

PH-DATA-5는 등록된 `dataset_product_health_gold` CatalogMetadata를 기준으로 DuckDB SQL grounding을 진행한다.
