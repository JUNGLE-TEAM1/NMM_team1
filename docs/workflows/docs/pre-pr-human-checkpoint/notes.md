# Notes

## Context

- Context Budget mode: Escalate Read.
- Reason: Git sync, PR readiness, human command flow, quality gate, and harness behavior rules changed.

## Read

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/15-context-budget-rule.md`
- `docs/08-development-workflow.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/10-next-action-menu.md`
- `docs/09-collaboration-agreement.md`
- `docs/18-harness-regression-policy.md`
- `docs/workflows/README.md`
- `docs/workflows/docs/product-rebaseline-trusted-platform/sync.md`

## Findings

- `AGENTS.md`는 pull/merge/rebase/push/PR 생성을 사람 확인 없이 금지한다.
- 일부 Source of Truth 문서에는 complete PR-ready workspace에서 자동 PR 생성이 가능하다는 문구가 남아 있었다.
- 새 규칙은 원격 변경을 하지 않는 것에서 멈추지 않고, 완료 직전 사람이 선택할 handoff menu를 반드시 제시하게 한다.
