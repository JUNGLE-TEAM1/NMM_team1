# M1 AI Query Live UI 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-26
- Changed: `/query` 화면에서 M6 `POST /api/week2/ai/query`를 호출하고 `AIQueryResult.query_result`, guardrail, summary, SQL, chart spec, evidence grounding fields를 표시하도록 연결했다.
- Verified: `cd frontend && npm run build`, `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_ai_query.py`, browser smoke on `127.0.0.1:13000/query`, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: PR push/CI/check 확인, PR merge/finalize/cleanup은 사람 확인 필요.
- Next context: 다음 Phase는 `/runs -> /catalog -> /ask` 발표 클릭 흐름 polish 또는 dashboard chart 표시 범위 판단.
- Risk: 현재 8000번에 떠 있는 오래된 container는 `/api/week2/ai/query`를 제공하지 않아 5173 proxy smoke에서는 `Not Found`가 발생했다. 최신 backend 또는 container rebuild가 필요하다.

## Phase

- Type: feature
- Branch/work location: `feature/m1-ai-query-live-ui`, `docs/workflows/feature/m1-ai-query-live-ui`
- Date: 2026-06-26
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- `contracts/ai_query_result.sample.json`

## Goal / 목표

- M1 `/query` 화면에서 M6 `AIQueryResult`를 실제 API 응답으로 표시한다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/workflows/feature/m1-ai-query-live-ui/*`
- `docs/reports/m1-ai-query-live-ui.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- `AiQueryPage`가 `askWeek2AiQuery(question)`을 호출하고 loading/error/result state를 관리한다.
- `query_result`를 canonical SQL result로 사용하고 top-level `sql`/`rows`는 fallback으로만 사용한다.
- `evidence[]`의 optional `table_name`, `schema_fields`, `metrics`, `lineage`, `retrieval_terms`를 방어적으로 렌더링한다.
- blocked/failed guardrail 상태가 성공처럼 보이지 않도록 status badge와 failure message를 표시한다.

## Verification Commands / 검증 명령

```bash
cd frontend && npm run build
PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_ai_query.py
rg -n "AIQueryResult|selected_datasets|guardrail|chart_spec|evidence|query_result|schema_fields|retrieval_terms" frontend/src
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m1-ai-query-live-ui/quality.md`
- Quality gate status: passed
- TDD status: not applicable; backend/core logic 변경 없이 existing M6 contract를 frontend에서 소비했다.
- CI/check result: local equivalent passed; PR CI pending after push.
- Skipped checks: 5174 direct API smoke는 CORS 미허용으로 실패해 13000 allowed origin에서 재검증했다.
- CD/deploy gate: not required

## Regression Guard / 회귀 보호

- Checked feature: M1 `/query` AI Query live UI
- Protected behavior: M1이 M6 응답을 표시하고 SQL/summary/evidence를 직접 생성하지 않는다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: Ask 결과는 evidence 또는 보류 사유를 가져야 한다.
- Expected behavior: 성공 시 evidence grounding 표시, API error 또는 빈 질문은 명확히 표시.
- Verification: browser smoke and UI error state review.
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` Week 2 evidence 항목 기준
- Environment: latest host backend `127.0.0.1:18000`, frontend `127.0.0.1:13000`
- Result: sample question returned `succeeded`, `passed`, SQL, rows, evidence, schema, metrics, lineage.
- Failure/limitation: stale 8000 container returned `404 Not Found`.
- Evidence: browser smoke result recorded in workspace `quality.md`.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Query/Ask 결과는 evidence와 연결된다.
- Status: passed
- Evidence: `/query` displays `Evidence`, dataset, schema, metrics, lineage, and retrieval terms from M6.

## Secret / Migration / Env Check

- Secret check: no secrets added
- Migration/data change: none
- Env change: none committed; smoke used temporary local ports 18000 and 13000

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: stale 8000 container must be rebuilt before using the default 5173 proxy smoke path.
