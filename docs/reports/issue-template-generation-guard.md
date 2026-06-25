# 이슈 템플릿 생성 경로 보강 보고서

## Short Report / 짧은 보고

- Type: docs/ops
- Branch/work location: `docs/issue-template-generation-guard`, `docs/workflows/docs/issue-template-generation-guard`
- Date: 2026-06-25
- Workspace state: ready-for-review
- Context Budget mode: Lite Read -> Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `.github/ISSUE_TEMPLATE/*.md`, `scripts/start-workflow.sh`, `scripts/test-harness.sh`, `scripts/validate-harness.sh`
- Escalated context read: `docs/04-development-guide.md`, `docs/10-next-action-menu.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`, `docs/18-harness-regression-policy.md`
- Context omitted intentionally: product implementation docs, unrelated reports, archived workspaces, remote issue/PR mutation
- Changed: `start-workflow.sh` issue generation now uses Korean prefixes/sections/type labels and `--body-file`; PR body draft now surfaces concrete reviewer context from workspace `report.md`; harness regression and static validation protect both behaviors.
- Verified: `bash -n`; GitHub issue template YAML parse; `scripts/start-workflow.sh --dry-run`; `scripts/prepare-pr.sh --dry-run`; `scripts/test-harness.sh` passed 27; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; `git diff --check`.
- Remaining: remote issue/PR cleanup is intentionally deferred.
- Next context: run separate cleanup for existing #90-#101 and #96-#99 after this harness change lands.
- Risk: `test` type has no label until the team defines one.

## Regression Guard / 회귀 보호

- Checked feature: script-generated GitHub issue body/title/label path.
- Protected behavior: Korean issue template structure is preserved outside GitHub UI template flow.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` router check.
- Environment: local fake `gh`; no remote mutation.
- Result: generated issue body and labels are captured by fixture and inspected by tests.
- Failure/limitation: no real GitHub issue was created.
