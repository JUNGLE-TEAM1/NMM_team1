# AI query dataset context 품질 게이트

- TDD status: backend test 추가 후 adapter 구현.
- Required checks: backend focused tests, frontend build, docs propagation, HTTP/browser smoke.
- Regression focus: publish된 catalog가 있으면 같은 catalog/run context로 AI Query가 실행되고, 없으면 기존 Week2 fixture fallback이 유지된다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| backend focused tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_ai_query_dataset_context.py backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_week2_ai_query.py backend/tests/test_week2_ai_query_duckdb.py` | passed | 21 passed |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| HTTP smoke | draft/run/execute/publish 후 `/api/week2/ai/query` 호출 | passed | selected dataset, evidence run, retrieval trace, SQL table이 published catalog/run을 가리킴 |
| browser smoke | `/query`에서 published dataset명을 포함한 위험 점수 질문 실행 | passed | 화면에 catalog id, run id, SQL table, `risk_score` 표시 확인 후 smoke data cleanup |
| docs propagation | `docs/03`, `docs/05`, `docs/06`, `docs/07`, `docs/08` 확인 | passed | C-7 query context 계약과 검증 절차 반영 |
