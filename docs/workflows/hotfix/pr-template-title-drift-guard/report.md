# PR 템플릿 제목 drift guard 보강 보고서

## Short Report / 짧은 보고

- Type: hotfix
- Branch/work location: `hotfix/pr-template-title-drift-guard`, `docs/workflows/hotfix/pr-template-title-drift-guard`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`, `scripts/prepare-pr.sh`, `scripts/audit-github-records.sh`, `scripts/status-workflow.sh`, `scripts/test-harness.sh`
- Escalated context read: none
- Context omitted intentionally: product runtime, app API/schema, deploy/AWS, unrelated historical PR bodies
- Changed: `prepare-pr.sh` normalizes PR titles into the Korean harness prefix format, `audit-github-records.sh` requires `[기능]`/`[버그]`/`[문서/운영]`/`[긴급수정]`/`[검증]` PR title prefixes and avoids PR-number closing-keyword false positives, `status-workflow.sh` blocks PR-ready on record drift, and harness/docs fixtures were updated.
- Verified: `bash -n`, `scripts/test-harness.sh` passed 31, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`, live read-only audit for recent PR #110/#113-#127 prefix/template records, status smoke for #123/#124 workspaces, and latest PR #127 HEAD checks `container-smoke`/`harness`/`manifest-smoke` passed.
- Remaining: PR review and merge/finalize/cleanup after human confirmation.
- Next context: if future PR title/body drift appears, run `scripts/audit-github-records.sh --pr <number>` and `scripts/status-workflow.sh <workspace>`; drift should block PR-ready until corrected or explicitly accepted.
- Risk: existing merged PR records are not rewritten by this Hotfix; team-created/manual PRs can still bypass GitHub UI unless reviewed against this audit before merge.
