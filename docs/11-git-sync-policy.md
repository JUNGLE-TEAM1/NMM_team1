# 11. Git Sync Policy

This document defines how branch workspaces stay aligned with `main` without hiding risky Git operations behind automation.

## 1) Core Policy

- Start each Phase from the latest approved `main` Source of Truth.
- Re-sync with `main` before a Phase is considered complete or integration-ready.
- Use `git pull --ff-only` as the default pull policy.
- Do not pull, merge, rebase, push, or create PRs without human confirmation.
- Prefer feature branch push and PR review over direct push to `main`.
- Do not sync while the worktree is dirty unless the human explicitly accepts the risk.

## 2) Phase Start Sync

Before creating or starting a Phase workspace, AI should ask for Git Sync Confirm when a real repository is involved.

Recommended commands after confirmation:

```bash
git switch main
git pull --ff-only
scripts/start-workflow.sh feature project-bootstrap "Project bootstrap"
```

If the worktree has uncommitted or untracked changes, stop and ask the human whether to commit, stash, use `--no-checkout`, or cancel.

Record the result in the workspace `sync.md` Start Sync section.

## 3) Mid-Phase Sync

During a Phase, AI should check upstream changes when:

- the Phase runs for a long time
- another person pushes to `main`
- shared Source of Truth docs may have changed
- integration depends on another branch

If upstream changes touch `docs/02`, `docs/03`, `docs/05`, `docs/06`, or `docs/07`, stop and ask for Sync Conflict Confirm.

Record checks in `sync.md` Mid-Phase Sync Checks.

## 4) Pre-Merge Sync

Before completion or PR readiness:

1. Confirm local work is ready for verification.
2. Confirm how to re-sync with `main`.
3. Re-apply `main` using the team policy, usually merge or rebase.
4. Resolve conflicts.
5. Run `scripts/validate-harness.sh --strict` and project verification.
6. Record the result in `sync.md` Pre-Merge Sync.

## 5) Push / PR

Direct `main` push is discouraged.

Preferred flow:

```text
feature branch push -> PR -> review -> merge to main
```

Record pushed branch, PR link, and merge status in `sync.md`.

For ready-for-review, complete, or integration-ready workspaces, Pre-Merge Sync must record either:

- a result, or
- a deferral reason approved by the human.

Before PR handoff, run or review:

```bash
scripts/status-workflow.sh docs/workflows/<type>/<short-kebab-name>
```

Use `.github/pull_request_template.md` as the checklist when the project uses PRs.

## 6) Conflict Handling

When main or another branch changes shared Source of Truth:

1. Stop implementation.
2. Identify impacted layer using `docs/00-layer-map.md`.
3. Record conflict in `shared-docs.md` and `sync.md`.
4. Present a Next Action Menu.
5. Ask for Sync Conflict Confirm or Integration Conflict Confirm.

## 7) Why Not Fully Automate

Pull, merge, rebase, push, and PR operations can change history, mix unrelated work, or publish incomplete decisions.
The harness automates recording and validation, but keeps these operations behind human confirmation.
