# M1 query route trace UI 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-query-route-trace-ui`, `docs/workflows/feature/m1-query-route-trace-ui`
- Date: 2026-06-28
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, this workspace `plan.md`, `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- Escalated context read: `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, browser skill
- Context omitted intentionally: M2/M3/M5/M6 backend internals beyond existing `AIQueryResult` route/trace contract
- Changed: `/query` 화면에 route card, `route=<value>` runtime check, unsupported/blocked warning, `retrieval_trace[]` panel을 추가했다.
- Verified: frontend build, keyword scan, API SQL/unsupported route samples, browser SQL/unsupported route smoke, mobile trace panel overflow check, strict harness validation.
- Remaining: Product Health 대표 경로 route/trace는 후속 M1 Product Health Phase에서 확인한다. 전체 모바일 page overflow는 기존 evidence tables에서 남는다.
- Next context: 다음 M1 Phase는 Product Health readiness UI 또는 `/etl` Catalog CTA fix를 선택한다.
- Risk: 이번 UI smoke는 `dataset_reviews_gold` supporting path 기준이며 5GB/Product Health 최종 통합 증거를 대체하지 않는다.

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m1-query-route-trace-ui`, `docs/workflows/feature/m1-query-route-trace-ui`
- Date: 2026-06-28
- Workspace state: complete

## Goal / 목표

- M6 `AIQueryResult.route`와 `retrieval_trace[]`를 M1 `/query` 화면에서 방어적으로 표시한다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/workflows/feature/m1-query-route-trace-ui/*`
- `docs/reports/m1-query-route-trace-ui.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- `/query` summary panel에 `route=<value>` runtime check와 Route info card를 추가했다.
- SQL 성공이 아닌 `route`/`status`는 runtime warning으로 표시해 성공 결과처럼 보이지 않게 했다.
- `RetrievalTracePanel`을 추가해 source id, source type, score, matched terms, evidence index를 표시한다.
- `retrieval_trace[]`가 비어도 빈 trace 상태를 명시하고 화면이 깨지지 않게 했다.

## Verification Commands / 검증 명령

```bash
cd frontend && npm run build
rg -n "route=|RetrievalTracePanel|retrieval_trace|queryRouteBadgeClass|formatTraceTerms|Route" frontend/src/app/App.jsx frontend/src/app/styles.css
COMPOSE_PROJECT_NAME=asklake_m1_trace_ui BACKEND_PORT=18003 FRONTEND_PORT=13003 docker compose -p asklake_m1_trace_ui up -d backend frontend
curl -fsS -X POST http://127.0.0.1:18003/api/week2/workflows/pipeline_reviews_json_e2e/runs -H 'content-type: application/json' -d '{"executor":"local_runner","triggered_by":"m1_query_route_trace_ui"}'
curl -fsS -X POST http://127.0.0.1:18003/api/week2/ai/query -H 'content-type: application/json' -d '{"question":"Amazon reviews에서 평점 높은 상품 알려줘"}'
curl -fsS -X POST http://127.0.0.1:18003/api/week2/ai/query -H 'content-type: application/json' -d '{"question":"내일 서울 날씨 알려줘"}'
git diff --check
scripts/validate-harness.sh --strict
```

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`의 Query/Ask evidence 기준과 workspace plan.
- Environment: Docker Compose project `asklake_m1_trace_ui`, backend `http://127.0.0.1:18003`, frontend `http://127.0.0.1:13003`, in-app browser.
- Result: SQL 질문은 `route=sql`, trace source `dataset_reviews_gold`, score, matched terms, evidence index, DuckDB rows를 표시했다. Unsupported 질문은 `route=unsupported`, `blocked`, failure message, SQL 성공으로 처리하지 않는 warning을 표시했다.
- Limitation: 모바일 390px에서 trace panel 자체 overflow는 없었지만, 기존 evidence table은 page-level horizontal overflow를 만든다.

## Acceptance / Regression

- Related acceptance: `docs/05` Query/Ask route와 retrieval trace 표시 기준.
- Regression checked: `docs/06` M6 route 또는 retrieval trace가 응답 근거와 어긋나는 경우, 근거 없는 confident answer 표시 금지.
- Result: 기존 backend contract를 바꾸지 않고 M1 UI가 route/trace를 그대로 표시한다.

## Final Judgment / 최종 판단

- Done: yes, for M1 query route trace UI.
- Remaining risk: Product Health 대표 경로와 전체 모바일 evidence table overflow는 후속 Phase로 남긴다.
