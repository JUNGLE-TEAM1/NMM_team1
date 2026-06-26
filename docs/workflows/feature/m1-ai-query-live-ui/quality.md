# M1 AI Query Live UI 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: no
- Reason: M1 UI가 기존 M6 API contract를 소비하는 frontend wiring Phase이며, backend/core logic 변경은 없다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_ai_query.py` -> `8 passed`
- Refactor notes: 기존 `AiQueryPage`, `InfoCard`, `DataTable` 패턴을 재사용했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| frontend build | `cd frontend && npm run build` | passed | Vite production build passed |
| backend focused contract test | `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_ai_query.py` | passed | M6 `AIQueryResult` contract tests `8 passed` |
| browser smoke | `127.0.0.1:13000/query` with `VITE_API_BASE_URL=http://127.0.0.1:18000` | passed | sample question displayed `succeeded`, `passed`, SQL, rows, evidence, schema, metrics, lineage |
| contract keyword check | `rg -n "AIQueryResult|selected_datasets|guardrail|chart_spec|evidence|query_result|schema_fields|retrieval_terms" frontend/src` | passed | frontend consumes M6 query/evidence contract fields |
| lint | `git diff --check` | passed | whitespace check passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | strict harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: PR CI runs after push/PR
- CI result: local equivalent passed
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| CORS smoke on `127.0.0.1:5174` direct API base | Backend default CORS does not include 5174; reran browser smoke on allowed 13000 origin | yes |
