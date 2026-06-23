# Branch Workspaces

This folder stores branch-specific collaboration state.

The shared workflow protocol lives in `docs/08-development-workflow.md`.
Each concrete branch gets a matching workspace folder here.

## Naming

```text
docs/workflows/<branch-type>/<short-kebab-name>/
```

Examples:

- Branch `feature/task-board` -> `docs/workflows/feature/task-board/`
- Branch `feature/project-bootstrap` -> `docs/workflows/feature/project-bootstrap/`
- Branch `fix/invalid-task-title` -> `docs/workflows/fix/invalid-task-title/`

## Generated Files

Each workspace contains:

- `plan.md`: current branch goal, scope, prompts, completion criteria, and optional `## 내부 단계별 프롬프트` for Step-level implementation/verification prompts
- `notes.md`: running notes, decisions, open questions, and evidence links
- `report.md`: branch-level report or short report
- `quality.md`: TDD evidence, branch checks, CI/CD gate status, and skipped-check reasons
- `decisions.md`: Decision Option Briefs, accepted decisions, deferred decisions, and revisit/rollback conditions
- `shared-docs.md`: proposed changes to shared Source of Truth docs, especially for integration branches
- `sources.md`: source branch dependencies for integration or dependent branches
- `confirmations.md`: human confirmation gates and responses
- `next-actions.md`: current conversational menu for the human's next choice
- `sync.md`: main/base commit, mid-phase upstream checks, pre-merge sync, and PR status

## Workspace State

`report.md` records `Workspace state`.

Allowed states:

- `draft`
- `in-progress`
- `ready-for-review`
- `complete`
- `integration-ready`
- `archived`

Strict validation uses this state to decide whether placeholders are acceptable.
Draft/in-progress workspaces can keep planning placeholders.
Ready/complete/integration-ready workspaces must resolve quality, decision, and pre-merge sync status.
Archived workspaces are treated as historical evidence.

## Source of Truth Impact

Every branch decides whether its changes affect shared Source of Truth.

- `shared-docs.md`: proposes changed Source of Truth files in the `Proposed Source Of Truth Changes` table.
- `decisions.md`: records whether each proposal is accepted/applied or deferred.
- `quality.md`: records Source of Truth impact status and validation evidence.
- `report.md`: summarizes which shared docs changed or why the change was deferred.

Allowed impact statuses are `none`, `required`, `applied`, and `deferred`.
When `shared-docs.md` proposes a `docs/...` file, strict validation expects that file to appear in the branch diff from the workspace base commit, unless a deferred decision records reason, revisit trigger, and target branch/phase.
Only the table `File` column is treated as a proposal; explanatory text, historical reports, archived workspaces, and Integration Notes are not forced into edits.

## Harness Test Impact

Branches that change harness rules or harness scripts record test impact.

- `quality.md`: records `Harness test impact` and the `scripts/test-harness.sh` result, or a skip reason.
- `decisions.md`: records deferred fixture work with reason, revisit trigger, and target branch/phase.
- `report.md`: summarizes added/updated fixtures and remaining test risk.
- `notes.md`: can keep failure notes from CI or local fixture runs.

Use `none` for non-harness work, `required` before tests are updated, `updated` after fixtures are added or changed, `skipped` for wording-only changes with a reason, and `deferred` only with a recorded revisit condition.

Detailed fixture expectations, `scripts/test-harness.sh` usage, CI checkout requirements, and external E2E limits are defined in `docs/18-harness-regression-policy.md`.

## Create A Workspace

```bash
scripts/start-workflow.sh feature task-board "Task board MVP"
```

Preview without writing:

```bash
scripts/start-workflow.sh --dry-run feature task-board "Task board MVP"
```

Generate files without creating or switching branches:

```bash
scripts/start-workflow.sh --no-checkout feature task-board "Task board MVP"
```

Summarize a workspace:

```bash
scripts/status-workflow.sh docs/workflows/feature/task-board
```

Use this status output as the first workspace summary for Lite Read.
It helps AI decide which detailed workspace files to open next, but it does not replace Source of Truth.

## Integration Branches

Integration branches should list source branch workspaces in `sources.md`, record each source branch/base commit, then read each source branch's `shared-docs.md`, `plan.md`, `report.md`, `quality.md`, `decisions.md`, `confirmations.md`, and `sync.md`.

For token-efficient integration, start with each source branch's:

- `report.md`
- `shared-docs.md`
- `quality.md`
- `decisions.md`
- `sync.md`

Open `plan.md`, `notes.md`, `confirmations.md`, and impacted Source of Truth files when the first pass shows scope ambiguity, pending gates, conflicts, stale sync, quality gaps, or contract drift.

Before merging work, confirm:

- Shared entities and interfaces use one contract.
- Acceptance scenarios combine into one user-visible flow.
- Regression guards protect different behaviors instead of duplicating the same check.
- Manual verification has one integrated golden path.
- Unresolved questions are listed in the integration branch workspace.
- Source branch/base commit records are present in `sources.md`.
- `scripts/validate-harness.sh --integration` passes before integration completion.

## Decisions

Each workspace records high-impact choices in `decisions.md`.

- Use `docs/14-decision-option-brief.md` when a decision needs candidate comparison.
- Record accepted decisions with the selected option and reason.
- Record deferred decisions with revisit triggers.
- Record rollback or revisit conditions when a decision may need to change later.

## Git Sync

Each workspace records sync status in `sync.md`.

- Start Sync records the main branch, current branch, base commit, command, and result at workspace start.
- Mid-Phase Sync Checks record upstream main changes and impacted Source of Truth docs.
- Pre-Merge Sync records main commit, conflicts, validation, and result before completion or integration.
- Push / PR records linked GitHub issue, PR closing keyword, pushed branch, PR link, and merge status.
- Ready/complete workspaces must record Pre-Merge Sync result or deferral reason.

When a workspace has a linked GitHub issue, do not rename the branch to include the issue number. Keep the branch/workspace path stable and put the closing keyword, such as `Closes #123`, in the PR body so GitHub closes the issue after merge.

AI should ask for Git Sync Confirm before pull, merge, rebase, push, PR creation, or PR merge. If main or shared Source of Truth changes during a Phase, AI should stop and offer the next action menu from `docs/10-next-action-menu.md`.

When local validation has passed and PR/push/handoff is the next natural action, AI must run `Pre-PR Human Checkpoint`:

- present 2-4 choices such as `PR 진행`, `로컬 완료로 보류`, `추가 수정`, and `다음 Phase`
- do not push, create PR, merge, finalize, or cleanup until the human explicitly chooses the remote action
- if the human chooses hold or does not answer, record the deferral reason in `sync.md` and the resume condition in `next-actions.md`

## Quality Gates

Each workspace records TDD and CI/CD state in `quality.md`.

- TDD applies to core logic, bug fixes, regression-prone behavior, and integration contracts.
- TDD can be skipped for documentation-only or low-risk mechanical work when the reason is recorded.
- Branch checks should record command, result, and evidence.
- PR-ready work should run CI-equivalent local checks or record why CI is not applicable.
- Deploy/publish/CD commands require human confirmation plus smoke and rollback notes.
- Ready/complete workspaces must resolve `Quality gate status`, `TDD applies`, and `CI required`.

## Edge Case Checklist

Before starting or integrating branch work, check:

- Existing workspace files are preserved when rerunning `scripts/start-workflow.sh`.
- Use `--dry-run` before creating unfamiliar branch names.
- Use `--no-checkout` when the worktree has unrelated local changes.
- Do not use `--allow-dirty` unless the human explicitly accepts the risk.
- If a Git branch exists without a workspace, rerun `scripts/start-workflow.sh <type> <slug> "<title>"`.
- If a workspace exists without a Git branch, either create the branch or mark the workspace as documentation-only in `report.md`.
- Every source branch that touches shared Source of Truth docs records proposals in `shared-docs.md`.
- Integration branches read each source branch's `plan.md`, `shared-docs.md`, `report.md`, `quality.md`, `decisions.md`, `confirmations.md`, and `sync.md`.
- Run `scripts/validate-harness.sh --strict` before considering a branch complete or integrated.
- Short reports are used only for low-risk documentation-only changes.
- Full reports are used for implementation, interface, schema, data, deployment, or risky behavior changes.

## Human Confirmation Gates

AI records confirmation status in `confirmations.md`.

Use these gates:

- Scope Confirm
- Contract Confirm
- Scope Change Confirm
- Verification Confirm
- Quality Gate Confirm
- Completion Confirm
- Integration Conflict Confirm
- Git Sync Confirm
- Sync Conflict Confirm
- Pre-PR Human Checkpoint

AI should ask the human before crossing a gate unless the user already gave an explicit instruction that covers it.

## Next Action Menu

AI records the current menu in `next-actions.md`.

Each menu should include:

- Current State
- Recommended Next Action
- Options
- Waiting On Human
- Last User Choice
- Next AI Action

Use `docs/10-next-action-menu.md` as the reference for state-based options.
