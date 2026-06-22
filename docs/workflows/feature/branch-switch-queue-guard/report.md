# Branch switch and queue guard 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/branch-switch-queue-guard`, `docs/workflows/feature/branch-switch-queue-guard`
- Date: 2026-06-22
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `scripts/start-workflow.sh`, `scripts/prepare-pr.sh`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `docs/13-human-command-flow.md`, `docs/10-next-action-menu.md`, `scripts/validate-harness.sh`
- Escalated context read: none
- Context omitted intentionally: product runtime, remote branch deletion, remote PR actions
- Changed: added branch switch confirmation rule, remaining branch queue rule, read-only `scripts/list-active-branches.sh`, and validation guards.
- Verified: `bash -n scripts/*.sh scripts/aws/*.sh`, `scripts/list-active-branches.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/status-workflow.sh docs/workflows/feature/branch-switch-queue-guard`, `scripts/prepare-pr.sh --check-pr-sync docs/workflows/feature/branch-switch-queue-guard`, `git diff --check`
- Remaining: merged/finalized; no PR handoff remains
- Next context: after each PR finalize, summarize remaining branch queue before choosing next work
- Risk: queue classification is advisory; deletion/cleanup remains manual approval only
