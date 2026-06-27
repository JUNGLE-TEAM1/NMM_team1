# M1 AI Query Live UI 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-ai-query-live-ui`, `docs/workflows/feature/m1-ai-query-live-ui`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, M1 Phase 4 plan
- Escalated context read: `docs/03-interface-reference.md`, `contracts/ai_query_result.sample.json`, `backend/app/domain/ai_query.py`, `backend/app/services/ai_query.py`, `frontend/src/app/App.jsx`, `frontend/src/api/week2Api.js`
- Context omitted intentionally: unrelated M2/M3/M4 internals, deploy/AWS flows, old historical M0~M5 reports
- Changed: `/query` 화면에서 `askWeek2AiQuery(question)`을 호출하고 `AIQueryResult.query_result`, guardrail, summary, SQL, chart spec, evidence grounding fields를 표시하도록 연결했다.
- Verified: frontend build passed, M6 backend focused tests `8 passed`, browser smoke passed on `127.0.0.1:13000/query` with latest backend on `127.0.0.1:18000`.
- Remaining: PR push/CI/check 확인, PR merge/finalize/cleanup은 사람 확인 필요.
- Next context: 다음 Phase는 `/runs -> /catalog -> /ask` 발표 클릭 흐름 polish 또는 dashboard chart 표시 범위 판단.
- Risk: 현재 8000번에 떠 있는 오래된 container는 `/api/week2/ai/query`를 제공하지 않아 5173 proxy smoke에서는 `Not Found`가 발생했다. 최신 backend 또는 container rebuild가 필요하다.
