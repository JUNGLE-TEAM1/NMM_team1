# PR 템플릿 자동 body 정렬 보고서

## Short Report / 짧은 보고

- Type: docs/ops
- Branch/work location: `docs/workflow-harness-slimdown`, `docs/workflows/docs/workflow-harness-slimdown`
- Date: 2026-06-25
- Workspace state: ready-for-review
- Context Budget mode: Lite Read -> Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/*.md`, `scripts/prepare-pr.sh`, `scripts/test-harness.sh`, workspace status
- Escalated context read: `docs/04-development-guide.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/10-next-action-menu.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/reports/_template.md`
- Context omitted intentionally: product implementation docs, unrelated reports, archived workspaces
- Changed: `scripts/prepare-pr.sh` now uses `.github/pull_request_template.md` as the PR body source and fills known values for summary, issue closing keyword, phase/workspace, quality, and sync. Issue template title prefixes and prepare-pr fallback PR title now use Korean defaults. `scripts/test-harness.sh` covers the generated PR body shape.
- Verified: `bash -n scripts/prepare-pr.sh scripts/test-harness.sh scripts/start-workflow.sh`; issue template YAML parse; `scripts/prepare-pr.sh --dry-run docs/workflows/docs/workflow-harness-slimdown`; `scripts/test-harness.sh` passed 26; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; `git diff --check`.
- Remaining: no remote push, PR creation, merge, issue close, or cleanup was executed. Existing PR #97 needs push/recheck if this branch should be updated remotely.
- Next context: reviewers should inspect `prepare-pr` dry-run output and confirm linked issue behavior before PR creation paths are used again.
- Risk: low to medium. The helper behavior changed, but the change is covered by harness regression and keeps remote actions behind existing flags.

## Regression Guard / 회귀 보호

- Checked feature: PR handoff helper and GitHub templates.
- Protected behavior: linked issue closing keyword remains in PR body; automatic PR body retains quality, acceptance/regression/manual verification, sync, security/license, and human checkpoint sections.
- Result: passed by `scripts/test-harness.sh` prepare-pr fixture and `prepare-pr --dry-run`.

## Failure Scenario / 실패 시나리오

- Reviewed failure: CI/check evidence or PR handoff evidence missing before completion.
- Expected behavior: workspace `quality.md`, `report.md`, and generated PR body keep validation/checklist fields visible.
- Verification: `scripts/status-workflow.sh`, `scripts/prepare-pr.sh --dry-run`, `scripts/validate-harness.sh --strict`.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` router check for report evidence.
- Environment: local shell, no GitHub remote mutation.
- Result: PR body was manually reviewed from dry-run output; issue template YAML parsed.
- Failure/limitation: current environment did not create or edit a real GitHub PR title.
- Evidence: commands listed in Short Report.

## Secret / Migration / Env Check

- Secret check: no API key, token, private key, `.env`, or credential added.
- Migration/data change: none.
- Env change: none.
