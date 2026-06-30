# 18. Harness Regression Policy

This document is the Source of Truth for harness regression testing.
It keeps detailed harness test rules out of workflow and quality summary documents.

## Purpose

Harness rules are project infrastructure.
When the harness changes, the team must know whether the change is protected by a focused regression test, intentionally skipped, or deferred with a revisit condition.

## Harness Test Update Gate

Any branch that changes harness behavior must complete the Harness Test Update Gate before it is marked complete or PR-ready.

Harness behavior includes:

- workflow rules and completion gates
- branch, PR, sync, cleanup, and human command rules
- validation, status, prepare, start, cleanup, or branch-list scripts
- CI jobs that run harness checks
- workspace templates or required workspace evidence fields

Allowed impact statuses:

- `none`: no harness behavior changed.
- `required`: harness behavior changed and tests still need to be updated.
- `updated`: positive or negative fixture tests were added or changed.
- `skipped`: test update is intentionally unnecessary, with a clear reason in `quality.md`.
- `deferred`: test update is outside the current scope, with a deferred decision in `decisions.md`.

## Fixture Test Expectations

Use `scripts/test-harness.sh` for lightweight local regression tests.

When adding a new harness rule:

- add a positive fixture that passes when the rule is followed
- add a negative fixture that fails when the rule is violated, when the rule has a meaningful failure mode
- keep tests local and deterministic
- avoid real GitHub, cloud, deploy, or production state changes

When changing an existing rule:

- update the related fixture expected result
- add a new fixture if the old test would not fail for the new behavior
- record the changed test result in the current workspace `quality.md`

PR conflict workflow changes should be protected by a fixture or static guard that checks:

- `scripts/start-workflow.sh` creates `PR Conflict Confirm` and `PR Conflict Resolution` evidence fields
- `scripts/status-workflow.sh` summarizes PR conflict evidence read-only and prioritizes unresolved conflict resolution
- `docs/11-git-sync-policy.md`, `docs/10-next-action-menu.md`, and `docs/13-human-command-flow.md` keep the protocol/menu/command flow connected

When test work is skipped or deferred:

- `skipped` needs a reason in `quality.md`
- `deferred` needs deferred reason, revisit trigger, and target branch or phase in `decisions.md`

## Local And CI Commands

Run these checks when harness behavior changes:

```bash
bash -n scripts/*.sh
scripts/test-harness.sh
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
scripts/status-workflow.sh <workspace>
```

CI must run `scripts/test-harness.sh` as part of the harness job when a PR changes harness-impacting files. Non-harness-impacting PRs may skip fixture regression through a CI path filter, but they still run `scripts/validate-harness.sh` and `scripts/validate-harness.sh --strict`.
The harness CI checkout uses `fetch-depth: 0` so strict validation can compare workspace Source of Truth proposals against the workspace base commit.

## External E2E Boundary

Harness regression tests must not run real `gh issue create`, push, PR creation, merge, deploy, AWS, migration, or production commands.

External E2E tests are reserved for a separate human-approved harness audit or release validation flow.
That flow must state expected remote changes, rollback options, cost or operational risk, and stop conditions before execution.

## Recording

Current branch workspaces record harness regression decisions in:

- `quality.md`: Harness test impact, commands, results, and skip reasons
- `decisions.md`: deferred harness test work and revisit conditions
- `report.md`: final summary of changed fixtures and remaining risk
- `notes.md`: useful failure notes from local or CI fixture runs

Historical reports and archived workspaces are not retroactively edited unless a separate audit branch explicitly owns that cleanup.
