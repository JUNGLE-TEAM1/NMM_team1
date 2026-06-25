# 09. Collaboration Agreement

This document records shared collaboration agreements that should not change per branch.

## 1) Shared Model

- `docs/08-development-workflow.md` defines the common workflow protocol.
- `docs/workflows/` stores branch-specific plans, notes, and reports.
- `docs/reports/` stores durable evidence after Phase or Hotfix completion.
- `docs/11-git-sync-policy.md` defines main freshness, PR, and Git safety rules.
- `docs/12-quality-gates.md` defines TDD, branch checks, CI, and CD/deploy gates.
- `docs/15-context-budget-rule.md` defines Lite/Escalate/Audit context loading.
- Source of Truth docs win over reports when they conflict.

## 2) Branch And Workspace Agreement

- Every implementation branch has a matching workspace folder.
- Branch names use `<type>/<short-kebab-name>`.
- Workspace paths use `docs/workflows/<type>/<short-kebab-name>/`.
- Use `scripts/start-workflow.sh` to create the branch and workspace together.
- Record proposed shared Source of Truth changes in `shared-docs.md`.
- Record branch freshness, base commit, upstream checks, and PR status in `sync.md`.
- Treat GitHub PR/issue state as authoritative after PR merge; `sync.md` final merge/issue fields can be stale because local finalization happens after the PR has already entered `main`.
- Record TDD and CI/CD evidence in `quality.md`.
- Record high-impact accepted/deferred decisions in `decisions.md`.

## 3) Decision Agreement

Use this order when a decision affects implementation:

1. Identify the earliest impacted layer in `docs/00-layer-map.md`.
2. Update the Source of Truth document first.
3. Update the branch workspace plan if scope changes.
4. Record shared document patch proposals in `shared-docs.md`.
5. Implement only the agreed scope.
6. Verify and write evidence.

## 3.1) Mid-Phase Steering Agreement

The human can steer freely during a Phase with new instructions, corrections, alternatives, or deferred ideas.
AI should preserve the current Phase boundary by classifying each new instruction before implementation.

Mid-Phase Steering is classified as:

- current Phase detail
- `Scope Change Confirm` required
- `Hotfix`
- next Phase candidate
- deferred idea
- `Decision Option Brief` required

Current Phase details can proceed after updating the relevant workspace file.
Scope changes, Hotfixes, and high-impact decisions must pass their matching gate before implementation.
Next Phase candidates and deferred ideas should be recorded in `next-actions.md` or `notes.md` so they are not lost.

## 3.2) Small Change PR Agreement

Small changes are not automatically exempt from PR handoff.
If a small change should become part of `main` and be used by the team, opening a PR is the default completion path after local validation.

Open a PR for a small change when:

- it is a team-shared artifact that should remain in `main`
- it updates Source of Truth, report index, workflow, quality, sync, or collaboration rules
- a branch workspace was created and validation completed
- the next teammate should treat the change as current project context

Local hold is acceptable when:

- the file is a personal note or throwaway draft
- the change will intentionally be absorbed into a larger branch soon
- the human wants to review wording or direction before sharing
- validation is not complete

Before PR handoff, AI must separate included files from excluded files.
Do not stage `.DS_Store`, personal drafts, unrelated untracked files, local editor artifacts, or files from another workstream.
If unrelated untracked files exist, AI reports them and keeps them out of the PR unless the human explicitly expands scope.
When `Small Change Completion Decision` offers `PR 진행`, it means moving into `Pre-PR Human Checkpoint`.
It does not authorize merge, finalize, issue close, or cleanup by itself. PR-ready small changes may still auto-create a PR before the merge/finalize checkpoint when no opt-out or stop condition exists.

## 4) Human Confirmation Gates

AI should work autonomously between gates, then stop and ask the human for confirmation when a decision changes scope, contracts, verification, completion, or integration direction.

Each branch workspace records confirmation status in `confirmations.md`.

| Gate | AI asks for confirmation before | Human confirms |
| --- | --- | --- |
| Scope Confirm | implementation starts | branch/workspace, included scope, excluded scope, impacted docs |
| Contract Confirm | shared data/interface/dependency contracts are used for implementation | data model, interface/API/CLI/UI contract, external dependency, shared Source of Truth changes |
| Scope Change Confirm | work expands beyond `plan.md` | whether to expand current branch, split another branch, or defer |
| Verification Confirm | final verification starts | test/build/smoke commands, manual verification path, completion criteria |
| Quality Gate Confirm | TDD or CI/CD expectations are unclear, skipped, or changed | failing-first evidence, branch check commands, CI requirements, skipped checks, CD/deploy gate |
| Git Sync Confirm | pull, merge, rebase, PR merge, finalize, or cleanup could change branch or remote state outside automatic PR creation | command to run, expected branch, dirty-worktree status, base/main commit, rollback plan if relevant |
| Pre-PR Human Checkpoint | PR was created and merge, finalize, issue close, cleanup, integration handoff, or next Phase handoff is the natural next action | `PR 진행`, `보류`, `추가 수정`, `다음 Phase`, or another explicit next action |
| Sync Conflict Confirm | main changed during the Phase or shared Source of Truth conflicts with the branch | whether to rebase/merge now, continue with recorded risk, split a follow-up branch, or pause |
| Completion Confirm | branch is considered done | changed summary, verification result, remaining risk, next task context |
| Integration Conflict Confirm | integration branch resolves conflicting source branch assumptions | final model/interface/acceptance/regression/manual verification direction |

If the human has already given an explicit instruction covering a gate, AI can record it in `confirmations.md` and continue.

## 5) Next Action Menu Agreement

AI should guide the human with a short next action menu after each confirmation gate, verification result, completion decision, or integration conflict.

Menus are recorded in `next-actions.md` and should include:

- current state
- recommended next action
- 2-4 options
- waiting-on-human prompt
- next AI action after selection

AI should recommend one option and explain why. The human can answer with a number or natural language.

When the human asks for status, PR readiness, or integration readiness, AI should run or reference `scripts/status-workflow.sh` and then present the closest matching menu from `docs/10-next-action-menu.md`.

## 6) Decision Option Brief Agreement

AI should use `docs/14-decision-option-brief.md` before high-impact human decisions.

Use it when:

- Scope Confirm needs a large scope choice.
- Contract Confirm needs data/API/UI contract choice.
- Quality Gate Confirm needs TDD/CI strategy choice.
- Git Sync Confirm or Sync Conflict Confirm needs merge/rebase/continue/pause choice.
- Integration Conflict Confirm needs source branch conflict resolution.
- A feature enhancement direction must be chosen.

Do not use it for small reversible choices:

- button wording
- internal variable names
- small documentation phrasing
- test names
- easy-to-revert UI placement

Decision outcomes should be recorded in `decisions.md`, and then propagated to `confirmations.md`, `notes.md`, `shared-docs.md`, `quality.md`, or `sync.md` when applicable.

## 7) Context Budget Agreement

AI should start with Lite Read unless the task is high risk or the human requested a broad review.

- Lite Read uses `AGENTS.md`, `docs/00-layer-map.md`, workspace status output when available, and directly relevant Source of Truth files.
- Escalate Read is required for contract, data, security, sync, quality, integration, decision, or Source of Truth conflict risk.
- Audit Read is allowed for whole-project structure checks, risk analysis, retrospectives, migrations, and harness evaluations.
- Token savings must not override required Source of Truth context.
- AI should record Context Budget mode and major context read in the report.

## 8) Existing Codebase Adoption Agreement

Use `docs/16-existing-codebase-adoption.md` when applying the harness to a repo that already has codebase or operational inertia.

- Record existing code, docs, CI, PR, and branch policy before changing them.
- Use baseline + next-change adoption instead of retroactive workspace generation.
- Existing code describes current behavior, not necessarily desired or correct behavior.
- Stale or unknown docs are gaps until mapped and verified.
- AI should stop before overwriting existing docs, changing CI/PR/branch policy, declaring Source of Truth complete, or creating retroactive workspaces.

## 9) Integration Agreement

Use an integration branch when combining independent feature branches.

The integration branch starts with each source branch's:

- `report.md`
- `shared-docs.md`
- `quality.md`
- `decisions.md`
- `sync.md`

It opens `plan.md`, `notes.md`, `confirmations.md`, and impacted Source of Truth files when the first pass shows ambiguity, pending gates, conflicts, stale sync, quality gaps, or contract drift.

The integration branch must record source branch/base commit information in `sources.md`.

If any source branch lacks `shared-docs.md`, `decisions.md`, `sync.md`, or source branch/base commit records, the integration branch must stop and request the missing handoff before merging.
The integration branch owns final reconciliation of:

- shared entities and data models
- interface contracts
- acceptance scenarios
- regression guards
- manual verification flows
- unresolved cross-branch questions

Before completion, integration branches should pass `scripts/validate-harness.sh --integration` or record why it was deferred.

## 10) What Needs Discussion

Discuss before implementation when a change affects:

- Product scope or user flow
- Architecture or data model
- Interface contract
- External service or deployment behavior
- Security, privacy, secrets, or permissions
- Work that crosses branch or Phase boundaries

## 11) What Does Not Need Discussion

These can usually proceed inside the current branch workspace:

- Small wording or formatting fixes
- Local refactors that do not change behavior
- Test additions that match existing behavior
- Report or note updates that do not change Source of Truth

## 12) Automation Safety Agreement

- `scripts/start-workflow.sh` must preserve existing workspace files.
- When switching branch workspaces, `scripts/start-workflow.sh` may create a checkpoint commit for tracked modifications/deletions on the current branch.
- Automatic checkpoint commits do not include untracked files, `.DS_Store`, personal drafts, editor artifacts, or unrelated workstream files.
- If untracked files exist, AI reports the excluded file list and continues only inside the approved branch-switch scope.
- Use `--no-checkout` for documentation-only setup or when the current Git state should not change.
- Use `--dry-run` before creating unfamiliar branch/workspace names.
- Use `git pull --ff-only` as the default main update command only after human confirmation.
- Prefer PR-based integration over direct main push.
- Do not automate pull, merge, rebase, PR merge, finalize, issue close, branch cleanup, deploy, or external execution without a confirmation gate.
- When local validation and PR readiness are complete, auto-create the PR unless the human opted out or a stop condition exists, then ask the human for the next handoff choice before merge/finalize/cleanup.
- Use `.github/pull_request_template.md` for PR handoff when the project uses PRs.
- Treat `.github/workflows/harness-validation.example.yml` as an optional CI example, not an active requirement.

## 13) Completion Agreement

A branch is complete when:

- Scope in `plan.md` is satisfied or explicitly deferred.
- `report.md` has `Workspace state: ready-for-review`, `complete`, or `integration-ready` as appropriate.
- Required human confirmation gates are recorded in `confirmations.md`.
- Current next action menu is recorded in `next-actions.md`.
- Git sync and PR status are recorded in `sync.md`.
- Post-merge status is verified from GitHub when available; stale `sync.md` final fields do not by themselves make a merged branch active again.
- TDD and CI/CD quality gate status are recorded in `quality.md`.
- High-impact choices are recorded in `decisions.md`.
- Context Budget mode and primary/escalated context are recorded in `report.md` or the Phase report.
- Shared Source of Truth changes are recorded in `shared-docs.md` when applicable.
- Pre-Merge Sync result or deferral reason is recorded before PR/completion.
- Acceptance, regression, and manual verification are checked.
- `report.md` or `docs/reports/` records changed, verified, remaining, and next context.
- No secrets or unrelated changes are included.
