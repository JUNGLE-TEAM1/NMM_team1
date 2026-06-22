# 13. Human Command Flow

This document shows how a human can drive the harness with short commands while AI handles workspace updates, validation, and confirmation gates.

## 1) Start A New Feature

Human says:

```text
feature/project-bootstrap workspace 만들어서 범위 초안 잡아줘
```

AI does:

- Runs `scripts/start-workflow.sh feature project-bootstrap "Project bootstrap"` or asks before checkout if Git state is risky.
- Drafts `plan.md`, `sync.md`, and `quality.md`.
- Presents the Workspace Created or Start Sync Required next-action menu.
- Asks for Scope Confirm and, when needed, Git Sync Confirm.

## 2) Confirm Before Implementation

Human says:

```text
1번으로 진행, TDD 적용해
```

AI does:

- Updates `confirmations.md`.
- Updates `quality.md` with TDD plan and first failing test target.
- Updates `next-actions.md`.
- Proceeds only inside accepted scope.
- Asks for Quality Gate Confirm if TDD or check requirements are unclear.

Human says:

```text
선택 후보를 영향까지 비교해서 보여줘
```

AI does:

- Classifies the decision type using `docs/14-decision-option-brief.md`.
- Presents 1-3 filtered candidates.
- Lists excluded options and exclusion reasons.
- Recommends one option while leaving final choice to the human.

## 3) Handle Main Changes During Work

AI says:

```text
진행 중 main 변경이 감지됐습니다. 지금 반영할까요, 위험을 기록하고 계속할까요?
```

Human says:

```text
main 반영하고 계속
```

AI does:

- Stops implementation.
- Reports dirty-worktree and impacted Source of Truth docs.
- Asks for Git Sync Confirm or Sync Conflict Confirm before pull, merge, or rebase.
- Records the result in `sync.md` and `notes.md`.

Human says:

```text
A안으로 가고 제외한 선택지는 다음 분기로 남겨
```

AI does:

- Records the accepted option in `decisions.md`.
- Records excluded/deferred options and revisit triggers.
- Updates the relevant confirmation gate.

## 4) Verify Work

Human says:

```text
검증 돌려
```

AI does:

- Runs agreed tests/checks only.
- Records TDD, CI/check, skipped-check, and manual verification evidence in `quality.md`.
- Updates `report.md`.
- If checks fail, presents Verification Failed next-action menu.
- If checks pass, asks for Pre-Merge Sync Required or Completion Confirm.

## 5) Integrate Feature Branches

Human says:

```text
feature-a랑 feature-b 통합 브랜치 만들어서 합칠 항목 점검해
```

AI does:

- If moving from a dirty current branch to another branch workspace, lets `scripts/start-workflow.sh` checkpoint commit the current branch first.
- Creates or opens an integration workspace.
- Reads source branch `plan.md`, `shared-docs.md`, `report.md`, `quality.md`, `decisions.md`, `confirmations.md`, and `sync.md`.
- Records source branch/base commit information in `sources.md`.
- Reconciles shared Source of Truth proposals in `shared-docs.md`.
- Runs `scripts/validate-harness.sh --integration`.
- Asks for Integration Conflict Confirm when shared contracts disagree.

## 6) Prepare PR And Issue Close / PR 준비와 이슈 닫힘

Human says:

```text
PR 준비 상태 확인해
```

AI does:

- Runs `scripts/status-workflow.sh <workspace>`.
- Checks `.github/pull_request_template.md`.
- Reports missing `sync.md`, `quality.md`, confirmation, or validation items.
- Runs validation only when approved or already within the agreed verification scope.
- Linked GitHub issue가 있으면 `scripts/prepare-pr.sh <workspace>`로 `PR closing keyword`를 `sync.md`에 기록하고 PR body 초안을 만든다.
- Does not create extra issues during PR preparation, push, create PRs, merge PRs, or close issues without human confirmation. Branch workspace issue creation remains the team default in `scripts/start-workflow.sh`.

Human says:

```text
브랜치 만들 때 이슈도 같이 생성해
```

AI does:

- Runs `scripts/start-workflow.sh <type> <short-kebab-name> "<title>"`; GitHub issue creation is the team default.
- Records `linked GitHub issue`, `issue link`, `issue creation result`, and `PR closing keyword` in `sync.md`.
- If GitHub CLI is unavailable or unauthenticated, creates the local workspace and records the failure reason instead of blocking all work.
- Uses `--no-issue` only for an intentional exception and records the reason in the workspace.

Human says:

```text
PR 올리고 이슈 닫히는 것까지 진행해
```

AI does:

- Runs `scripts/prepare-pr.sh <workspace>` first to update local PR closing keyword.
- Runs `scripts/prepare-pr.sh --check-pr-sync <workspace>` before creating or handing off the PR.
- With explicit approval, runs `scripts/prepare-pr.sh --push --create-pr <workspace>`.
- Uses `Closes #123` style closing keyword so GitHub closes the linked issue when the PR is merged.
- After merge, runs `scripts/prepare-pr.sh --check-issue <workspace>` and records `issue close status` in `sync.md`.
- If a stacked PR was merged into a non-default branch and the linked issue remains open, runs `scripts/prepare-pr.sh --close-issue <workspace>` to close it with the merged PR as evidence.
- For final handoff after merge, runs `scripts/prepare-pr.sh --finalize <workspace>` to verify PR merged state, issue close state, and final `sync.md` values.
- If unrelated or expanded work appears mid-flow, records same-scope work in the current workspace; for scope changes, resolves `Scope Change Confirm` and creates a separate workspace when needed.
- After PR merge/finalize, runs or summarizes `scripts/list-active-branches.sh` and reports remaining active branches, open PR branches, and cleanup candidates.

Human says:

```text
다음 브랜치로 넘어가
```

AI does:

- Summarizes current branch, target branch, worktree state, uncommitted changes, checkpoint commit expectation, target workspace, and switch reason.
- Treats the explicit switch request as branch switch approval unless the summary shows unresolved conflicts or surprising dirty worktree risk.
- If dirty worktree exists, tells the human that `scripts/start-workflow.sh` will checkpoint commit before switching.
- If unresolved conflicts exist, stops and lists conflict files instead of switching.
- After switching, reports current branch and workspace.

Human says:

```text
PR 끝났어? 남은 브랜치 뭐 있어?
```

AI does:

- Runs or summarizes `scripts/list-active-branches.sh`.
- Reports branch name, ahead count, workspace path, workspace state, linked issue, PR link/open PR state, merge status, issue close status, and recommended next action.
- Separates merged/closed branches as cleanup candidates.
- Does not delete local or remote branches without explicit human approval.
- If remaining work branches exist, offers: 1. 남은 브랜치 PR 진행, 2. 남은 브랜치 보류, 3. main에서 다음 Phase 시작, 4. cleanup 후보 정리 검토.

Human says:

```text
이 브랜치에서 할 거 다 끝났어?
```

AI does:

- Runs `scripts/status-workflow.sh <workspace>`.
- If workspace is `complete`, pending confirmations are clear, and PR checklist is ready, reports branch, linked issue, PR closing keyword, local validation result, remaining remote work, and any external approval need.
- Presents the completion handoff choice menu:
  - 1. PR 진행: branch push 후 PR 생성.
  - 2. 추가 보강: 문서/테스트/구현 보강 후 재검증.
  - 3. 다음 Phase로 이동: 현재 branch는 유지하고 다음 branch workspace 시작.
  - 4. 보류: push/PR 없이 현재 상태 유지.
  - 5. 외부 실행 승인 단계: AWS resource 생성, deploy, merge 등 별도 승인 작업이 남아 있으면 approval checklist부터 진행.
- Does not run `git push`, PR creation, merge, deploy, or AWS resource creation until the human explicitly selects and approves that remote/external action.
- If the human chooses additional work that exceeds current scope, resolves `Scope Change Confirm` first.
- If the human chooses hold, records the hold reason and resume condition in `next-actions.md`.

## 7) Recompare A Decision

Human says:

```text
이 결정은 UI/UX 기준으로 다시 비교해줘
```

AI does:

- Reclassifies the decision as UI/UX.
- Rebuilds the Decision Option Brief with UI/UX impact fields and comparison criteria.
- Leaves the prior decision as superseded or deferred in `decisions.md` if already recorded.

Human says:

```text
추천안으로 진행하되 롤백 조건을 notes에 남겨
```

AI does:

- Records the accepted decision in `decisions.md`.
- Adds rollback/revisit conditions to `notes.md`.
- Proceeds through the relevant confirmation gate.

## 8) Ask For Current Status

Human says:

```text
지금 상태 설명해줘
```

Or:

```text
남은 위험 알려줘
다음 작업자 context만 요약해줘
완료된 거야?
```

AI does:

- Reads the Latest Report Index in `docs/reports/README.md`.
- Reads only the latest report and the most relevant related report needed for the answer.
- Treats reports as evidence for summarizing status, not as Source of Truth.
- Uses Source of Truth documents when a report conflicts with current requirements, workflow, or contract docs.
- States whether validation is `Complete`, `Pending`, `Blocked`, or `Unknown`; if a report is pending, AI does not call the work complete.
- Summarizes the latest Phase/Area, completed work, remaining work, remaining risk, next worker context, and recommended next action.
- Explains the report evidence directly instead of telling the human to open and read the report.
- Presents the Report-Based Status Requested next-action menu when a follow-up choice is needed.

## 9) Ask For CI Example

Human says:

```text
CI 예시 보여줘
```

AI does:

- Points to `.github/workflows/harness-validation.example.yml`.
- Explains it is an example, not an active provider-specific requirement.
- Helps adapt it to the target project's stack when requested.

## 10) Ask For Lightweight Context

Human says:

```text
필요한 문서만 읽고 시작해
```

Or:

```text
토큰 아끼되 위험하면 확장해
```

AI does:

- Selects Lite Read from `docs/15-context-budget-rule.md`.
- Reads `AGENTS.md`, `docs/00-layer-map.md`, workspace status output when available, and directly relevant Source of Truth files.
- States which Context Budget mode is being used and why.
- Escalates only if contract, data, security, sync, quality, integration, decision, or evidence conflict risk appears.
- Records Context Budget mode and primary/escalated context in the report.

## 11) Ask For Full Audit

Human says:

```text
전체 구조 감사해
```

Or:

```text
하네스 리스크 전체를 분석해줘
```

AI does:

- Selects Audit Read from `docs/15-context-budget-rule.md`.
- Reads Layer Map, relevant Source of Truth layers, Latest Report Index, selected reports, scripts, and tests.
- Still avoids reading every historical report or archived workspace unless the audit target requires it.
- Summarizes what was read, what was intentionally omitted, and where risk required deeper reading.

## 12) Adopt An Existing Codebase

Human says:

```text
이 기존 코드베이스에 하네스를 붙여줘
```

Or:

```text
baseline + next-change 방식으로 적용해줘
```

Or:

```text
이미 있는 기능 workspace는 만들지 마
```

AI does:

- Uses `docs/16-existing-codebase-adoption.md`.
- Selects Bounded Audit Read from `docs/15-context-budget-rule.md`.
- Scans repo structure, README/docs, package/build/test config, CI files, branch/PR policy files, and key source directories by summary first.
- Records current behavior as baseline evidence, not as guaranteed desired behavior.
- Creates a baseline report.
- Stops before overwriting existing docs, changing CI/PR/branch policy, declaring Source of Truth complete, or creating retroactive workspaces.
- Guides future changes back to normal Phase Workflow.

## 13) Assess Infrastructure Gaps

Human says:

```text
하네스 적용 전에 없는 인프라 gap부터 뽑아줘
```

Or:

```text
CI 없으면 다음 Phase 후보로 올려줘
```

Or:

```text
첫 기능 전에 막는 P0만 골라줘
```

Or:

```text
자동 테스트 없으면 수동 smoke로 임시 검증 경로 잡아줘
```

AI does:

- Uses `docs/16-existing-codebase-adoption.md` Infrastructure / Operations Gap Assessment.
- Classifies gaps as P0, P1, P2, or deferred.
- Limits P0 blocking to the first risky implementation feature, not baseline/documentation/diagnostic work.
- Allows a documented manual smoke path as a temporary verification path when automated tests do not exist.
- Proposes next Phase candidates.
- Asks the human which Phase to run first.

## 14) Add Recurrence-Prevention Harness Rule / 재발 방지 하네스 규칙 추가

Human says:

```text
방금 같은 문제 다시 안 생기게 하네스 규칙으로 추가할지 물어보고 적용해
```

AI does:

- Solves the immediate branch/workspace flow problem first.
- Does not add a harness rule immediately after the fix.
- Asks the human: "이번 문제를 재발 방지 하네스 규칙으로 추가할까요?"
- Presents the issue cause, proposed rule, application location, and expected side effects or exceptions.
- If approved, updates the relevant Source of Truth docs and needed script, validation, or status checks.
- Runs `scripts/harness-flow-check.sh <workspace>` after applying the rule.
- Records the check result in `quality.md`, `report.md`, and `decisions.md`.
- If the rule is outside the current scope, resolves Scope Change Confirm before changing the harness.
