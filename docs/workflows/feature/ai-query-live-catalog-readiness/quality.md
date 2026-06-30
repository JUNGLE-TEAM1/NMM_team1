# AI query live catalog readiness 품질 게이트

- TDD status: UI-only 보정이라 build와 browser smoke 중심으로 검증.
- Required checks: frontend build, backend focused tests, browser smoke, docs propagation.
- Regression focus: live catalog가 없으면 기존 Product Health readiness fallback이 유지된다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| backend focused tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_ai_query_dataset_context.py backend/tests/test_target_dataset_catalog_publish.py` | passed | 5 passed |
| diff check | `git diff --check -- frontend/src/app/App.jsx` | passed | whitespace issue 없음 |
| browser smoke | live Gold catalog 생성 후 `/query`에서 dataset명을 포함한 위험 점수 질문 실행 | passed | `Live catalog readiness`, catalog id, run id, local path, schema columns, SQL table 표시 확인 후 cleanup |
| docs propagation | `docs/05`, `docs/07`, `docs/08` 확인 | passed | C-7.5 live readiness 기준 반영 |
