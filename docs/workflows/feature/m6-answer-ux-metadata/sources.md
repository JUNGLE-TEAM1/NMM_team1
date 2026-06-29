# M6 Answer UX Metadata source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- direct source branch 없음. PR #283 merge 후 `main` 24980d66에서 시작.

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Integration Notes / 통합 메모

- Primary docs: `docs/03`, `docs/05`, `docs/06`, `docs/07`.
- Primary code: `backend/app/domain/ai_query.py`, `backend/app/domain/llm_answer.py`, `backend/app/services/ai_query.py`, `backend/app/adapters/openai_llm_adapter.py`, `frontend/src/app/App.jsx`.
- Browser skill used for local `/query` UI smoke.
