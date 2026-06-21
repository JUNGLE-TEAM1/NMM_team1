# 04. Development Guide

This document defines development operating rules. Phase order and copyable prompts live in `docs/08-development-workflow.md`. Regression/failure criteria live in `docs/06-regression-and-failure-scenarios.md`. Manual verification lives in `docs/07-manual-verification-playbook.md`.

## 1) Development Principles

- Follow `docs/08` Phase order.
- Follow `AGENTS.md` Context Loading Rule.
- Follow `docs/15-context-budget-rule.md`: start with Lite Read, then escalate when risk appears.
- Keep changes scoped to the current Phase.
- Use reports as evidence, not Source of Truth.

## 2) Branch Strategy

Recommended branch types:

- `feature/[short-kebab-name]`
- `fix/[short-kebab-name]`
- `docs/[short-kebab-name]`
- `test/[short-kebab-name]`
- `chore/[short-kebab-name]`

Branch naming rules:

- Use lowercase kebab-case after the slash.
- Keep the name short and behavior-focused.
- Do not include spaces, personal names, dates, issue descriptions, or secrets.
- Use the same branch name as the branch workspace path under `docs/workflows/`.
- Do not change the branch name just to include a GitHub issue number; record linked issues in workspace `sync.md` instead.

Examples:

- Branch: `feature/task-board`
- Workspace: `docs/workflows/feature/task-board/`
- Branch: `feature/project-bootstrap`
- Workspace: `docs/workflows/feature/project-bootstrap/`

Create a branch workspace with:

```bash
scripts/start-workflow.sh feature project-bootstrap "Project bootstrap"
```

## 3) Git Sync Rules

`docs/11-git-sync-policy.md` is the Source of Truth for branch freshness and integration safety.

- Start each Phase from the latest approved `main` state.
- Use `git pull --ff-only` as the default main update command when the human approves a pull.
- Do not sync with a dirty worktree.
- Record start, mid-phase, pre-merge, and PR status in workspace `sync.md`.
- If main changes during a Phase, stop and ask the human whether to rebase/merge now, continue and record risk, or split follow-up work.
- Prefer PR-based integration over direct main push.
- Do not automate merge, rebase, push, PR creation, or PR merge without a confirmation gate.

## 4) Commit Rules

```text
<type>: <subject>
```

Examples:

- `feat: add [feature]`
- `fix: handle [case]`
- `docs: update [document]`
- `test: add [coverage]`

## 5) Test Strategy

Use `docs/12-quality-gates.md` for TDD and CI/CD policy.

| Level | Target |
| --- | --- |
| Unit | Markdown link and placeholder consistency where useful |
| Integration | Cross-document Source of Truth consistency |
| Smoke | `rg` checks for stale example artifacts or unintended placeholders |
| E2E/manual | Project bootstrap walkthrough against `README.md`, `AGENTS.md`, and `docs/01~08` |

TDD default:

- Required for core logic, bug fixes, regression-prone behavior, and integration contracts.
- Optional for documentation-only or low-risk mechanical changes.
- Record failing-first evidence or skip reason in workspace `quality.md`.

## 6) Local Run Commands

```bash
rg -n "\\[[A-Z0-9_]+\\]" .
scripts/start-workflow.sh --dry-run feature project-bootstrap "Project bootstrap"
scripts/status-workflow.sh docs/workflows/feature/task-board
sed -n '1,220p' docs/15-context-budget-rule.md
git status --short
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
scripts/validate-harness.sh --integration
```

## 7) PR Checklist

- [ ] Contributes to current Phase
- [ ] Branch/work location matches `docs/08`
- [ ] `sync.md` records start sync and pre-merge sync status
- [ ] If the branch has a linked GitHub issue, `sync.md` records it and the PR body includes `Closes #<issue-number>` or an equivalent closing keyword
- [ ] main was checked before completion or risk was recorded
- [ ] Tests/build/smoke/manual verification recorded
- [ ] `scripts/status-workflow.sh <workspace>` reviewed before PR handoff
- [ ] Regression Guard / Manual Verification checked
- [ ] Docs updated only where needed
- [ ] No secrets committed
- [ ] Data/migration changes verified if applicable

## 8) Secret / Env Management

- Real secrets must not be committed.
- Keep `.env.example` or equivalent updated.
- Document required variables without real values.

## 9) Migration / Data Change Rules

- Document schema/data changes in `docs/02` and `docs/03`.
- Include upgrade/rollback notes.
- Verify migration in local or test environment.

## 10) CI/CD Quality Gates

- Required jobs: lint/test/build or the nearest project-specific equivalents.
- Harness jobs: `scripts/validate-harness.sh` and `scripts/validate-harness.sh --strict`.
- Merge blocking criteria: PR checks pass, `sync.md` is current, `quality.md` records required evidence, and no required confirmation is pending.
- Deployment smoke: required only when the project deploys or publishes.
- Rollback notes: required for deployment, migration, or production-impacting changes.
- CD commands stay behind human confirmation.
- Optional CI example: `.github/workflows/harness-validation.example.yml`

## 11) Deliverable Mapping

| Deliverable | Source |
| --- | --- |
| Change propagation layers | `docs/00-layer-map.md` |
| Product scope | `docs/01-product-planning.md` |
| Architecture | `docs/02-architecture.md` |
| Interfaces | `docs/03-interface-reference.md` |
| Acceptance | `docs/05-acceptance-scenarios-and-checklist.md` |
| Evidence | `docs/reports/README.md` |
