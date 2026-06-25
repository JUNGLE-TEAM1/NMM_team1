# Project status lifecycle 보고서

## Short Report / 짧은 보고

- Type: hotfix
- Branch/work location: `hotfix/project-status-lifecycle`, `docs/workflows/hotfix/project-status-lifecycle`
- Date: 2026-06-25
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/04-development-guide.md`, `docs/08-development-workflow.md`, `docs/10-next-action-menu.md`, `docs/11-git-sync-policy.md`, `scripts/prepare-pr.sh`, `scripts/status-workflow.sh`, `scripts/test-harness.sh`
- Escalated context read: none
- Context omitted intentionally: Product/Architecture/Interface docs; Git sync policy hotfix did not change product or runtime interface.
- Changed: PR open/create path now reopens a closed linked issue before PR open when possible, sets linked issue Project Status to `Review`, and records reopen failure as sync evidence; status summary reports open PR + closed issue mismatch as a post-PR safety guard; Git sync lifecycle is centralized in `docs/11` with thin references elsewhere.
- Verified: `bash -n scripts/start-workflow.sh scripts/prepare-pr.sh scripts/status-workflow.sh scripts/test-harness.sh`; `git diff --check`; `scripts/test-harness.sh` passed 26 tests; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; `scripts/status-workflow.sh docs/workflows/hotfix/project-status-lifecycle`.
- Remaining: commit and push to PR #96.
- Next context: PR review should check lifecycle layering and shell harness regressions.
- Risk: GitHub Project field option names must remain `In Progress`, `Review`, `Done`; if Project schema changes, helper will record lookup failure in `sync.md`.

## Remote Operations Reconciliation

- linked issue `#87` was unexpectedly `CLOSED` with no closing PR reference.
- Action: `gh issue reopen 87 --repo JUNGLE-TEAM1/NMM_team1 ...`
- Result: issue state is `OPEN`; PR creation path will set Project Status to `Review`.
