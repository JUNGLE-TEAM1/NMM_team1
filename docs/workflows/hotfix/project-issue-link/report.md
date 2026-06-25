# Project issue link Hotfix 보고서

## Short Report / 짧은 보고

- Type: hotfix
- Branch/work location: `codex/local-issue-project-followup`, `docs/workflows/hotfix/project-issue-link`
- Date: 2026-06-25
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/04-development-guide.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `scripts/start-workflow.sh`, `scripts/status-workflow.sh`, `scripts/test-harness.sh`
- Escalated context read: GitHub Project permission and issue state via `gh`
- Context omitted intentionally: unrelated product/runtime workstreams
- Changed: `scripts/start-workflow.sh` now adds created issues to `JUNGLE-TEAM1` Project `3`, sets Status to `In Progress`, and records `issue project result`; `scripts/prepare-pr.sh --close-issue` / `--finalize` now set linked closed issues to `Done`; `scripts/status-workflow.sh` displays that result; docs and harness regression were updated.
- Verified: issue `#78` is `In Progress`, historical closed issues are `Done`, no repo issue is missing Project `3`; `bash -n`; `scripts/test-harness.sh`; `scripts/validate-harness.sh --strict`.
- Remaining: push/PR for this hotfix if the current branch is continuing to PR.
- Next context: future `scripts/start-workflow.sh` issue creation requires GitHub CLI token with `project` scope.
- Risk: low; GitHub project add or Status update can still fail in environments without project scope, but the failure is now recorded in `sync.md`.
