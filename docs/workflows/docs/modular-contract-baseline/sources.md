# Modular Contract Baseline source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- none

## Required Source Files / 읽어야 할 source 파일

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/01-product-planning.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/17-parallel-milestone-protocol.md`
- `docs/reports/target-mvp-parallel-workstream-realignment-analysis.md`
- `scripts/validate-harness.sh`
- `.milestones/target-mvp/manifest.yaml`
- workspace `plan.md`, `shared-docs.md`, `report.md`, `quality.md`, `decisions.md`, `confirmations.md`, `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `main` | current Source of Truth | `b4a0fff` | 2026-06-24 | checkpoint commit contained previous analysis report before branch creation |

## Integration Notes / 통합 메모

- R0.5 is not an integration workspace; `.milestones/target-mvp` is a planning manifest only.
