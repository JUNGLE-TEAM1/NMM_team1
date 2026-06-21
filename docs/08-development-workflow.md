# 08. Development Workflow

This document defines the shared workflow protocol, branch workspace model, Phase queue, prompts, and completion gates.

## How To Use

1. Work on one Phase at a time.
2. Read `AGENTS.md` before starting.
3. Use `docs/00-layer-map.md` to identify the impacted layer.
4. Classify the task type.
5. Apply Skill Discovery Rule and check relevant skill/plugin/tool only when useful.
6. Apply Context Budget Rule from `docs/15-context-budget-rule.md`; start with Lite Read unless risk or audit scope requires more.
7. Apply Context Loading Rule and read only the current Phase section.
8. Create or open the branch workspace under `docs/workflows/<branch-type>/<branch-name>/`.
9. Run the implementation prompt.
10. Run the verification prompt.
11. Update relevant docs only when behavior/contracts changed.
12. Create a Phase report using `docs/reports/_template.md`.

## Branch Workspace Model

The shared workflow stays in this file. Each concrete branch gets its own working folder:

```text
docs/workflows/
├─ README.md
├─ feature/
│  └─ task-board/
│     ├─ plan.md
│     ├─ notes.md
│     ├─ report.md
│     ├─ quality.md
│     ├─ decisions.md
│     ├─ shared-docs.md
│     ├─ sources.md
│     ├─ confirmations.md
│     ├─ next-actions.md
│     └─ sync.md
└─ docs/
   └─ project-bootstrap/
      ├─ plan.md
      ├─ notes.md
      ├─ report.md
      ├─ quality.md
      ├─ decisions.md
      ├─ shared-docs.md
      ├─ sources.md
      ├─ confirmations.md
      ├─ next-actions.md
      └─ sync.md
```

Use `scripts/start-workflow.sh` to create the branch and workspace together:

```bash
scripts/start-workflow.sh feature task-board "Task board MVP"
```

This creates:

- Git branch: `feature/task-board`
- Workspace folder: `docs/workflows/feature/task-board/`
- `plan.md`
- `notes.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `shared-docs.md`
- `sources.md`
- `confirmations.md`
- `next-actions.md`
- `sync.md`

Use `--no-checkout` when you only want files generated without creating or switching branches.
Use `--dry-run` to preview the branch name and files.
Use `scripts/status-workflow.sh <workspace>` to summarize current workspace status before handoff, integration, or PR readiness.

## Adoption Modes

- Default Mode: new projects and normal Phase work after harness adoption follow this Development Workflow.
- Existing Codebase Adoption Mode: repos with existing code, config, tests, docs, CI, PR, or branch conventions first follow `docs/16-existing-codebase-adoption.md`.
- After baseline adoption, future changes return to this normal Phase Workflow.
- Do not mix the detailed existing-codebase adoption procedure into each normal Phase.
- After adoption, check P0 infrastructure gaps before the first risky implementation feature.
- P0 gaps do not block baseline, documentation, or diagnostic work.
- If P0 gaps exist, suggest an infrastructure Phase before a risky feature branch.

Workspace states:

- `draft`: newly created or not yet scoped.
- `in-progress`: active implementation or documentation work.
- `ready-for-review`: branch believes implementation/checks are ready for review.
- `complete`: branch is complete.
- `integration-ready`: integration branch is ready for final integration validation.
- `archived`: historical evidence; only minimal validation applies.

## Git Sync Rule

Follow `docs/11-git-sync-policy.md` for start, mid-phase, pre-merge, and PR decisions.

- Start Sync: before implementation, check that work begins from the intended main/base and record it in `sync.md`.
- Mid-Phase Sync: if upstream main changes or shared Source of Truth docs change, stop and ask for a sync decision.
- Pre-Merge Sync: before completion/integration, re-check main freshness and record conflicts or validation.
- Push / PR: prefer PR-based integration and record branch, PR link, and merge status in `sync.md`.
- Linked Issue: when a branch maps to a GitHub issue, keep the existing branch/workspace name and record the issue plus PR closing keyword in `sync.md`.
- AI records sync status but does not run pull, merge, rebase, push, PR creation, or PR merge without human confirmation.

## Quality Gate Rule

Follow `docs/12-quality-gates.md` for TDD, branch checks, CI, and CD/deploy decisions.

- TDD: for core logic, bug fixes, regression-prone behavior, or integration contracts, write or identify the failing test before implementation.
- Branch checks: record test/build/typecheck/harness validation commands and results in `quality.md`.
- CI: PR-ready branches should have the project CI command set or a recorded reason why CI is not applicable.
- CD: deploy/publish/rollback commands require human confirmation and smoke/rollback notes.
- AI records quality evidence but does not skip required checks without a recorded reason.

## Decision Option Brief Rule

Use `docs/14-decision-option-brief.md` for high-impact choices.

When AI receives a large request:

1. Extract requirements.
2. Split features into branch workspaces when useful.
3. Identify high-impact human decisions.
4. Classify each decision type.
5. Present a Decision Option Brief using the type-specific template.
6. After the human chooses, record the outcome in `decisions.md`.
7. Update `confirmations.md`, `notes.md`, `shared-docs.md`, `quality.md`, or `sync.md` when the decision affects those files.

Do not use Decision Option Briefs for small reversible choices.

## Status Summary Rule

AI should use `scripts/status-workflow.sh` when the human asks for current state, PR readiness, integration readiness, or "what next?"

The status summary should report:

- missing workspace files
- pending confirmations
- sync readiness
- quality/TDD/CI readiness
- shared Source of Truth proposals
- integration source/base records
- recommended next action from `docs/10-next-action-menu.md`

## Context Budget Rule

Follow `docs/15-context-budget-rule.md`.

- Start with Lite Read for ordinary branch work: `AGENTS.md`, `docs/00-layer-map.md`, workspace status output when available, and directly relevant Source of Truth files.
- Escalate when API/schema/data/security/acceptance/regression/manual verification/integration/Git sync/quality/decision risk appears.
- Use Audit Read for whole-project checks, risk analysis, retrospectives, migration planning, or harness evaluation.
- `scripts/status-workflow.sh` is a summary entry point, not a replacement for Source of Truth.
- Report the Context Budget mode and key files read in the Phase report.

## Integration Branch Rule

When a branch combines two or more feature branches, create an integration branch workspace, list source branches in `sources.md`, record source branch/base commit information, and read each source branch's `shared-docs.md`, `plan.md`, `report.md`, `quality.md`, `decisions.md`, `confirmations.md`, and `sync.md`.

Run `scripts/validate-harness.sh --integration` before considering an integration branch complete.

The integration branch must resolve:

- shared data model changes
- interface contract changes
- acceptance scenario overlap
- regression guard overlap
- manual verification overlap
- unresolved questions from source branches

## Human Confirmation Gates

AI should work autonomously between gates, then stop and ask the human to confirm decisions that change scope, contracts, verification, completion, or integration direction.

Record confirmation status in the branch workspace `confirmations.md`.

Required gates:

- Scope Confirm: branch/workspace, included scope, excluded scope, impacted docs.
- Contract Confirm: data model, interface/API/CLI/UI contract, external dependency, shared Source of Truth change.
- Scope Change Confirm: any expansion beyond `plan.md` or split into another branch.
- Verification Confirm: test/build/smoke commands, manual verification path, completion criteria.
- Quality Gate Confirm: TDD evidence, required branch checks, CI gates, skipped checks, and CD/deploy gate.
- Git Sync Confirm: start sync, mid-phase upstream changes, pre-merge sync, and PR readiness.
- Sync Conflict Confirm: main changes or shared Source of Truth conflicts that affect the branch.
- Completion Confirm: changed summary, verification result, remaining risk, next task context.
- Integration Conflict Confirm: conflicts between source branches, shared models, interfaces, acceptance, regression, or manual verification.

## Next Action Menu Rule

After each confirmation gate, verification result, or integration conflict, AI should present a short next action menu instead of asking an open-ended question.

Use `docs/10-next-action-menu.md` as the state menu reference and record the current menu in branch workspace `next-actions.md`.

Each menu should include:

- current state
- recommended next action
- 2-4 options
- what AI will do after the human chooses

The human can answer with a number or natural language, such as "1번으로 진행해", "범위 수정하자", "별도 브랜치로 빼자", or "검증 먼저 해줘".

## Phase Common Start Gate

0. Read `AGENTS.md`.
1. Check `docs/00-layer-map.md` and identify the earliest impacted layer.
2. Classify the task type.
3. Apply Skill Discovery Rule. Use a relevant skill/plugin/tool when clearly useful; otherwise continue with the default workflow.
4. Apply Context Loading Rule.
5. Apply Context Budget Rule: choose Lite Read, Escalate Read, or Audit Read.
6. If a workspace exists, run or summarize `scripts/status-workflow.sh <workspace>` before opening detailed workspace files.
7. Confirm current Phase and branch/work location.
8. Confirm branch workspace exists under `docs/workflows/`.
9. Confirm `confirmations.md` exists and Scope Confirm is ready.
10. Confirm `next-actions.md` exists and has a recommended next action.
11. Confirm `sync.md` exists and Start Sync is recorded or ask for Git Sync Confirm.
12. Confirm `quality.md` exists and TDD/CI expectations are clear or ask for Quality Gate Confirm.
13. Confirm `decisions.md` exists and high-impact choices are recorded or deferred.
14. Confirm no earlier incomplete Phase should be done first.
15. Mark Hotfixes explicitly.
16. Name what is out of scope.
17. Apply Lightweight Execution Rule.
18. Do not invent undocumented requirements.
19. Do not revert unrelated user/previous changes.
20. Check related `docs/06` Regression Guard.
21. Read report context. If `docs/reports/README.md` has a Latest Report Index, read the latest report for the related area first. Otherwise read the previous Phase report and 1-2 relevant reports.

## Phase Common Completion Gate

1. Implementation or artifact exists.
2. Tests/build/smoke/manual verification completed.
3. Related docs updated only where needed.
4. Acceptance criteria in `docs/05` checked.
5. Failure Scenario reviewed.
6. Manual Verification result recorded.
7. Phase report created.
8. Human confirmation outcomes recorded where required.
9. Next action menu updated for the human's next choice.
10. `sync.md` records pre-merge sync status or a human-approved reason for deferral.
11. `quality.md` records TDD status, branch checks, CI status, skipped checks, and CD gate if relevant.
12. `decisions.md` records accepted/deferred high-impact decisions and rollback/revisit conditions.
13. For integration branches, `scripts/validate-harness.sh --integration` completed or a human-approved deferral is recorded.
14. Branch workspace `plan.md`, `notes.md`, or `report.md` updated where useful.
15. No scope leak.
16. Final report includes changed files, used skill/plugin/tool, verification, report path, next context, and remaining risks.
17. Final report records Context Budget mode, primary context read, escalated context read, and intentionally omitted context.

Ready/complete workspaces must resolve quality, decision, and pre-merge sync status. Draft/in-progress workspaces may keep planning placeholders while still preserving required sections.

## Priorities

| Priority | Scope | Notes |
| --- | --- | --- |
| P0 | NMM_team1 프로젝트 운영 문서 부트스트랩 | 요구사항, 검증, 실행 명령을 최소 초안으로 정리 |
| P1 | 첫 실제 기능 Phase 진행 | branch workspace와 PR/issue 연결 흐름 검증 |
| P2 | 프로젝트별 CI, 배포, 운영 자동화 보강 | 필요할 때만 진행 |

## Reality Principles

- Prefer the smallest demoable slice.
- Defer infrastructure or architecture expansion until the core flow works.
- Keep optional work out of P0 unless required by acceptance criteria.
- Prefer visible verification over assumed completion.

## Phase Authoring Format

~~~md
## Phase N - [PHASE_NAME] ([BRANCH_OR_WORK_LOCATION])

### Goal

- [GOAL]

### Scope

- [SCOPE_ITEM]

### Out Of Scope

- [OUT_OF_SCOPE]

### Implementation Prompt

```text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
```

### Verification Prompt

```text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
```

### Completion Criteria

- [ ] [CRITERION]
~~~

Always include the branch or work location in the Phase title. If branch work is not available, use the local path or `local workspace` and explain it in the Phase report.

## Phase 0 - Project Bootstrap (`feature/project-bootstrap`)

### Goal

- Establish the NMM_team1 project-specific Source of Truth foundation.

### Implementation Prompt

```text
@AGENTS.md @docs/01-product-planning.md @docs/02-architecture.md @docs/03-interface-reference.md

Bootstrap NMM_team1 project operations for Phase 0 only.
Do not implement later features.
Fill only the minimum known requirements, architecture, interface, verification, and workflow context.
Keep unknown product details as TBD with clear open questions.
```

### Verification Prompt

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md

Verify Phase 0 without adding features.
Confirm local run commands, env examples, and smoke/health behavior.
Report failures and missing docs.
```

### Completion Criteria

- [ ] Project Source of Truth has minimum known context
- [ ] Smoke checks documented or explicitly deferred
- [ ] Phase report created

## Phase 1 - First Real Feature (`feature/<short-kebab-name>`)

### Goal

- Start the first real project feature with a branch workspace.

### Scope

- Create a workspace with `scripts/start-workflow.sh`.
- Link a GitHub issue when available.
- Record scope, quality gate, sync status, and PR closing keyword requirements.
- Implement only the accepted feature slice.

### Out Of Scope

- Unrelated refactors.
- Multiple independent feature slices.
- Deployment work unless explicitly in scope.

### Implementation Prompt

```text
@AGENTS.md @docs/00-layer-map.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md

Start the first real feature Phase.
Create or open the branch workspace, record scope and verification expectations, then implement only the accepted slice.
```

### Verification Prompt

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md

Verify the implemented feature against acceptance, regression, manual verification, and quality gates.
```

### Completion Criteria

- [ ] Feature scope completed
- [ ] Verification evidence recorded
- [ ] Phase report created
