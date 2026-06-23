# Product context CI guard audit source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- none

## Required Source Files / 읽어야 할 source 파일

- `AGENTS.md`
- `docs/00-layer-map.md`
- `README.md`
- `docs/01-product-planning.md`
- `docs/02-architecture.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/18-harness-regression-policy.md`
- `docs/reports/README.md`
- `docs/reports/harness-post-merge-change-audit.md`
- `scripts/validate-harness.sh`
- `scripts/test-harness.sh`
- `.github/workflows/ci.yml`
- workspace `plan.md`, `shared-docs.md`, `report.md`, `quality.md`, `decisions.md`, `confirmations.md`, `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `main` | current Source of Truth | `e8b655e` | 2026-06-24 | Product context audit base |

## Integration Notes / 통합 메모

- `docs/reports/`는 evidence 계층이므로 과거 report의 문구를 현재 Source of Truth 오류로 보지 않는다.
- `decisions.md` handoff included for guard scope decisions.
