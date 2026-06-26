# Week2 M1 synthetic raw demo data source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- none. 이 Phase는 `origin/main` 기준 전용 worktree에서 시작했다.

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`
- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/15-context-budget-rule.md`
- `docs/17-parallel-milestone-protocol.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `contracts/source_config.sample.json`
- `contracts/schema_definition.sample.json`
- `contracts/transform_spec.sample.json`
- `contracts/workflow_definition.sample.json`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `origin/main` | not applicable | `11b746e` | 2026-06-26 | 새 worktree base |

## Integration Notes / 통합 메모

- Generated data is local under ignored `data/`; commit candidates are script, focused test, workspace/report evidence.
