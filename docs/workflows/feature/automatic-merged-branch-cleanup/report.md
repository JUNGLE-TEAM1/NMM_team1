# Automatic merged branch cleanup 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/automatic-merged-branch-cleanup`, `docs/workflows/feature/automatic-merged-branch-cleanup`
- Date: 2026-06-22
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `scripts/prepare-pr.sh`, `scripts/list-active-branches.sh`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `docs/13-human-command-flow.md`, `docs/10-next-action-menu.md`, `scripts/validate-harness.sh`
- Escalated context read: none
- Context omitted intentionally: product runtime, AWS/deploy implementation
- Changed: added automatic PR creation policy/`--auto-pr`, automatic merged branch cleanup script, PR finalize cleanup hook, local/remote/tracking branch status, and cleanup scope/guards.
- Verified: `bash -n scripts/*.sh scripts/aws/*.sh`, `scripts/prepare-pr.sh --dry-run docs/workflows/feature/automatic-merged-branch-cleanup`, `scripts/cleanup-merged-branches.sh --dry-run`, `scripts/list-active-branches.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/status-workflow.sh docs/workflows/feature/automatic-merged-branch-cleanup`, `scripts/harness-flow-check.sh docs/workflows/feature/automatic-merged-branch-cleanup`, `git diff --check`
- Remaining: automatic PR creation is allowed for complete PR-ready workspaces; PR 진행 can run merge, finalize, issue close verification, and automatic Git branch cleanup; cloud/AWS cleanup remains excluded.
- Next context: complete PR-ready workspaces should auto-create PRs; after each PR finalize, cleanup branch refs automatically and report remaining branch queue.
- Risk: `git branch -d` can fail if Git cannot prove local branch is merged; force deletion is intentionally not automatic.
