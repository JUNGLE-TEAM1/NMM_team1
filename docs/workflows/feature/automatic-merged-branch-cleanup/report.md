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
- Changed: added automatic merged branch cleanup script, connected it to PR finalize, exposed local/remote/tracking branch status, and documented cleanup scope/guards.
- Verified: `bash -n scripts/*.sh scripts/aws/*.sh`, `scripts/cleanup-merged-branches.sh --dry-run`, `scripts/list-active-branches.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/status-workflow.sh docs/workflows/feature/automatic-merged-branch-cleanup`, `scripts/harness-flow-check.sh docs/workflows/feature/automatic-merged-branch-cleanup`, `git diff --check`
- Remaining: PR 진행 can run push, PR, CI, merge, finalize, and automatic Git branch cleanup; cloud/AWS cleanup remains excluded.
- Next context: after each PR finalize, cleanup branch refs automatically and report remaining branch queue.
- Risk: `git branch -d` can fail if Git cannot prove local branch is merged; force deletion is intentionally not automatic.
