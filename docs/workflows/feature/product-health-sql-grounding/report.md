# PH-DATA-5 보고서

## 상태

Completed.

## 변경 요약

- `SqlPlanner`가 Product Health Catalog의 `internal_product_id`, `product_title`, `category_l1/category_l2`, scenario/risk columns를 사용해 SQL을 만들 수 있게 보강했다.
- 복합 질문인 "리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군"을 `top_risk` intent로 분류하게 했다.
- `AIQueryService` summary가 `product_id`뿐 아니라 `internal_product_id`를 근거 상품 id로 사용할 수 있게 했다.
- `AIQueryResult.evidence[].metrics`에 `processed_input_total_bytes`, `available_source_total_bytes`를 포함했다.
- 실제 `/api/week2/ai/query`가 `dataset_product_health_gold`를 선택하고 DuckDB로 Gold Parquet을 조회하는 것을 검증했다.

## 검증

| 항목 | 결과 |
| --- | --- |
| API query | passed |
| selected dataset | `dataset_product_health_gold` |
| route | `sql` |
| SQL engine | `duckdb` |
| generated SQL | `SELECT internal_product_id, risk_score, ... FROM gold_product_health ORDER BY risk_score DESC LIMIT 10` |
| first row | `aph_prod_000006`, `risk_score=88.23` |
| evidence processed input bytes | `5668612855` |
| related tests | 16 passed |

실행 명령:

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_ai_query.py backend/tests/test_week2_ai_query_duckdb.py
.venv/bin/python -m py_compile backend/app/services/sql_planner.py backend/app/services/ai_query.py backend/app/fakes/fake_sql_engine.py
.venv/bin/python scripts/product_health_catalog_ingest.py
PYTHONPATH=backend .venv/bin/python - <<'PY'
from fastapi.testclient import TestClient
from app.core.app_factory import create_app
client = TestClient(create_app())
response = client.post('/api/week2/ai/query', json={
    'question': '리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군을 찾아줘'
})
assert response.status_code == 200
payload = response.json()
assert payload['status'] == 'succeeded'
assert payload['selected_datasets'][0]['dataset_id'] == 'dataset_product_health_gold'
assert payload['query_result']['engine'] == 'duckdb'
PY
```

## Handoff

이 Phase 이후 M1은 Product Health 결과, SQL, evidence, lineage를 한 화면에서 표시할 수 있다.

표시 후보:

- `selected_datasets[0].dataset_id`
- `sql`
- `rows[0].risk_score`
- `rows[0].negative_review_rate`
- `rows[0].conversion_rate`
- `rows[0].late_delivery_rate`
- `evidence[0].metrics.processed_input_total_bytes`
- `retrieval_trace[0].source_id`
