# M2 product health runtime smoke source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `origin/main` at `e15300a`

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
| `origin/main` | n/a | `e15300a` | 2026-06-28 | Week2 M2/M3/M5 runner boundary, M3 v2.1.1 L0-L10 contract |

## Integration Notes / 통합 메모

- 읽은 주요 문맥:
  - `AGENTS.md`
  - `docs/00-layer-map.md`
  - `docs/08-development-workflow.md`
  - `docs/11-git-sync-policy.md`
  - `docs/03-interface-reference.md`
  - `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
  - `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
  - `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
  - `docs/reports/m3-expanded-layer-contract/l0-l10-design.md`
  - `docs/reports/m3-expanded-layer-contract/layers/l0-raw-preservation.md`
  - `docs/reports/m3-expanded-layer-contract/layers/l1-bronze-envelope.md`
  - `docs/reports/m3-expanded-layer-contract/layers/l10-catalog-handoff.md`
- M3 v2.1.1 기준에서 M2는 L6 spec 이후 preview/runtime 실행 계층으로 남는다.
