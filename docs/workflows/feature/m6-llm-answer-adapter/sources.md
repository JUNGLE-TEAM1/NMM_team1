# M6 LLM Answer Adapter source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m6-hybrid-route`

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
| merged `feature/m6-hybrid-route` / PR #273 | `docs/workflows/feature/m6-hybrid-route` | `8de2436` | 2026-06-29 | Step 7 route/RAG/Hybrid behavior 위에 Step 8 adapter를 쌓았다. |

## Integration Notes / 통합 메모

- Step 8은 Step 7의 `route`, `retrieval_trace`, successful/blocking behavior를 보존해야 한다.
