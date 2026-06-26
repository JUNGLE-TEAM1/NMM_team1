# M6 Catalog retrieval scoring source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- 없음. 단일 M6 feature slice이며 이전 `m6-catalog-source-boundary`가 main에 merge된 뒤 `origin/main` 기준으로 시작했다.

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
| `origin/main` | n/a | `dee950b` | 2026-06-26 | PR #143 merge commit 기준 |

## Integration Notes / 통합 메모

- 이전 M6 CatalogSource 경계를 전제로 하며, 이번 branch는 그 위의 retrieval scoring만 추가한다.
