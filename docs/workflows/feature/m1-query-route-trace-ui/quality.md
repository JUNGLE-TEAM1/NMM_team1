# M1 query route trace UI 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: no
- Reason: M1 UI 표시 보강 Phase이며 backend contract/core logic은 변경하지 않는다. 기존 M6 `AIQueryResult.route`와 `retrieval_trace[]` payload를 방어적으로 렌더링한다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: frontend build, API route samples, browser SQL/unsupported route smoke, strict harness validation 통과
- Refactor notes: 기존 `/query` 렌더링 구조 안에 route card와 retrieval trace panel만 추가했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| diff whitespace | `git diff --check` | passed | whitespace check passed |
| keyword scan | `rg -n "route=|RetrievalTracePanel|retrieval_trace|queryRouteBadgeClass|formatTraceTerms|Route" frontend/src/app/App.jsx frontend/src/app/styles.css` | passed | route/trace UI symbols found |
| build/typecheck | `cd frontend && npm run build` | passed | Vite production build passed |
| API SQL route sample | `POST /api/week2/ai/query` after `pipeline_reviews_json_e2e` local run | passed | `status=succeeded`, `route=sql`, `engine=duckdb`, rows=3, `retrieval_trace[0].source_id=dataset_reviews_gold` |
| API unsupported route sample | `POST /api/week2/ai/query` with unsupported weather question | passed | `status=blocked`, `route=unsupported`, guardrail failure message returned |
| browser SQL route smoke | in-app browser at `http://127.0.0.1:13003/query` | passed | UI displayed `route=sql`, trace title, `dataset_reviews_gold`, `score 15`, matched terms, `evidence index 0`, DuckDB rows |
| browser unsupported route smoke | in-app browser at `http://127.0.0.1:13003/query` | passed | UI displayed `route=unsupported`, blocked/failure text, warning that it is not handled as SQL success |
| browser console errors | `tab.dev.logs({ levels: ['error'], limit: 20 })` | passed | `[]` before/after browser route smoke |
| mobile trace panel overflow | 390px viewport browser check | passed with existing-page limitation | trace panel had no horizontal overflow; overall page horizontal overflow remains from pre-existing evidence tables |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | strict harness validation passed after workspace/report updates |

## CI/CD Gate / CI-CD 게이트

- CI required: if PR is created
- CI result: local checks passed; remote CI passed on PR #242. GitHub checks `harness`, `container-smoke`, `manifest-smoke`, `linked-issue`, `pr-size-hard-gate`, `pr-template-drift`, `migration-schema-security`, and `risk-warning` all completed with `SUCCESS`.
- Deploy/publish required: no
- Deployment confirmation:
- Rollback/smoke notes: local compose project `asklake_m1_trace_ui` was used only for smoke and was stopped with `docker compose -p asklake_m1_trace_ui down --remove-orphans`.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| backend full pytest | 이번 Phase는 backend 계약/core logic 변경이 없고 M6 route/trace contract는 기존 backend tests와 API smoke로 확인했다. | n/a |
| full Product Health 5GB route | M2/M3/M5/M6 통합 책임이며 이번 M1 route/trace UI 표시 범위 밖이다. | n/a |
