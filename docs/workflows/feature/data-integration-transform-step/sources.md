# Data integration transform step source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/data-integration-source-step`

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
| `feature/data-integration-source-step` | `docs/workflows/feature/data-integration-source-step` | TBD | 2026-06-29 | Source 선택 UX 확인 후 Transform step 추가 |

## Integration Notes / 통합 메모

- 이 Phase는 `Select Fields`만 다루며 추가 transform palette는 제외한다.
