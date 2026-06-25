# Week 2 Workflow Catalog source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- 없음. 이 branch는 source branch 통합이 아니라 main에서 시작한 M5 단일 slice다.

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
| main | not applicable | 304c41b | 2026-06-25 | `git pull` 후 fast-forward 된 main에서 `codex/week2-workflow-catalog` 생성 |

## Integration Notes / 통합 메모

- Week 2 project context와 `contracts/*.sample.json`을 source input으로 사용했다.
