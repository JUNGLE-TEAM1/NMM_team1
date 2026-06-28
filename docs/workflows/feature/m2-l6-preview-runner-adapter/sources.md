# M2 L6 preview runner adapter source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- 없음. 직전 merged report와 M3 L6 계약 문서를 참조했다.

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
| main | n/a | `e1ddef2` | 2026-06-28 | PR #228 merge commit 기준에서 시작 |

## Integration Notes / 통합 메모

- 통합 source branch는 없다. M3 L6 계약은 `docs/reports/m3-expanded-layer-contract/layers/l6-spec-compiler.md`를 읽고 적용했다.
