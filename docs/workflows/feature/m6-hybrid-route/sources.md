# M6 Hybrid Route source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m6-catalog-rag-index`

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
| `feature/m6-catalog-rag-index` | `docs/workflows/feature/m6-catalog-rag-index` | PR #241 head `282eb54` | 2026-06-29 | Step 6 Catalog RAG-lite index, `RetrievalIndex`, `EmbeddingAdapter`, richer retrieval trace 기반 |

## Integration Notes / 통합 메모

- Step 7 branch base `282eb54`는 PR #241 head다.
- PR #241이 main에 merge된 뒤에는 사람 확인을 받고 Step 7 branch를 main 기준으로 정리해야 한다.
