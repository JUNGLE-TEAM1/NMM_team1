# 10. Next Action Menu

This document defines the conversational UI protocol for guiding the human through collaboration choices.

AI should not ask an open-ended "what next?" when the harness state can suggest useful options. Instead, AI should summarize the current state, recommend one next action, and offer 2-4 choices.

## Response Shape

```text
Current state:
- ...

Recommended next action:
- ...
- Reason: ...

Options:
1. ...
2. ...
3. ...

Waiting on you:
- Choose a number or answer in natural language.
```

## State Menus

### Decision Option Brief Required

- Current state: a high-impact human decision affects scope, contract, quality, sync, integration, or enhancement direction.
- Recommended next action: present a Decision Option Brief.
- Options:
  1. Compare candidate options with the matching decision type template.
  2. Narrow the candidates first.
  3. Defer the decision to another branch.
- Next AI action: create a brief from `docs/14-decision-option-brief.md` and wait for human choice.
- Ask: "이 결정은 영향이 커서 후보별 영향과 제외 이유까지 비교해도 될까요?"

### Decision Option Selected

- Current state: the human selected a Decision Option Brief candidate.
- Recommended next action: record the decision and continue through the relevant confirmation gate.
- Options:
  1. Record accepted decision and continue.
  2. Record accepted decision but pause implementation.
  3. Reopen comparison with different criteria.
- Next AI action: update `decisions.md`, then update `confirmations.md`, `notes.md`, `shared-docs.md`, `quality.md`, or `sync.md` as needed.
- Ask: "선택한 안을 `decisions.md`에 확정 기록하고 진행할까요?"

### Decision Option Deferred

- Current state: the human deferred a high-impact decision.
- Recommended next action: record the deferral and define revisit trigger.
- Options:
  1. Move it to a later branch.
  2. Continue with a reversible temporary decision.
  3. Pause until more information is available.
- Next AI action: update `decisions.md`, `notes.md`, and next action state.
- Ask: "이 선택을 어느 조건에서 다시 검토할지 남길까요?"

### Workspace Status Requested

- Current state: the human asked for current branch/workspace status.
- Recommended next action: run or summarize `scripts/status-workflow.sh`.
- Options:
  1. Show status for the current workspace.
  2. Show status for a specified workspace.
  3. Convert status into a PR/integration checklist.
- Next AI action: summarize missing confirmations, sync, quality, shared-docs, and recommended next action.
- Ask: "어느 workspace 상태를 요약할까요?"

### Report-Based Status Requested

- Current state: the human asked for the current project status, remaining risk, next worker context, or whether the latest work is complete.
- Recommended next action: read the Latest Report Index in `docs/reports/README.md`, then read only the latest report and the most relevant related report needed for the answer.
- Options:
  1. Summarize current status from the latest reports.
  2. Summarize remaining risk and next worker context only.
  3. Compare report status with Source of Truth if a conflict is suspected.
- Next AI action: explain the latest Phase/Area, completed work, remaining work, validation status (`Complete`, `Pending`, `Blocked`, or `Unknown`), remaining risk, next worker context, and recommended next action without telling the human to read the reports directly.
- Ask: "최신 report 기준으로 현재 상태를 요약할까요, 아니면 남은 위험과 다음 작업자 context만 볼까요?"

### Context Budget Selected

- Current state: AI selected Lite Read, Escalate Read, or Audit Read from `docs/15-context-budget-rule.md`.
- Recommended next action: proceed with the selected read scope and name escalation triggers.
- Options:
  1. Continue with Lite Read.
  2. Escalate now because the work affects contracts, data, sync, quality, integration, or decisions.
  3. Switch to Audit Read for a broader review.
- Next AI action: read only the selected scope, then report primary context and omitted context.
- Ask: "현재는 Lite Read로 충분해 보입니다. 위험 신호가 나오면 읽기 범위를 확장할까요?"

### Escalate Read Required

- Current state: a risk signal means Lite Read is no longer enough.
- Recommended next action: expand to the minimum required Source of Truth and evidence files.
- Options:
  1. Read the impacted Source of Truth files now.
  2. Read latest related report evidence first.
  3. Pause and ask the human to confirm broader context loading.
- Next AI action: explain the risk signal, read the added context, and record escalated context in the report.
- Ask: "API/데이터/통합/품질 위험이 보여서 관련 문서를 더 읽어도 될까요?"

### Audit Read Requested

- Current state: the human asked for whole-project structure, risk, retrospective, migration, or harness evaluation.
- Recommended next action: use Audit Read.
- Options:
  1. Audit Source of Truth and scripts/tests only.
  2. Include latest report index and selected reports.
  3. Include archived workspace details where relevant.
- Next AI action: perform a bounded audit and state what was intentionally omitted.
- Ask: "전체 감사 범위로 보되, 모든 과거 보고서와 archived workspace는 필요할 때만 열까요?"

### Existing Codebase Adoption Requested

- Current state: the human wants to apply the harness to a repo with existing codebase or operational inertia.
- Recommended next action: follow `docs/16-existing-codebase-adoption.md` using Bounded Audit Read.
- Options:
  1. Create a baseline report only.
  2. Map existing docs/code to Layer Map first.
  3. Record existing CI/PR/branch policy first.
  4. Pause before touching existing docs.
- Next AI action: inspect bounded repo context, preserve existing policy, and avoid retroactive feature workspaces.
- Ask: "기존 기능 workspace를 만들지 않고 baseline + next-change 방식으로 적용할까요?"

### Baseline Report Needed

- Current state: existing codebase adoption has started, but current repo state is not recorded yet.
- Recommended next action: create `docs/reports/baseline-existing-codebase-adoption.md` or a dated equivalent.
- Options:
  1. Record current run/build/test commands.
  2. Record existing CI/PR/branch policy.
  3. Record key modules, known risks, stale docs, and gaps.
- Next AI action: write the baseline report and mark intentionally unbackfilled areas.
- Ask: "현재 코드 상태를 baseline evidence로 남기고, 다음 변경부터 일반 Phase Workflow로 돌아갈까요?"

### Adoption Complete

- Current state: baseline report exists and key repo policies/gaps are recorded.
- Recommended next action: return future changes to normal Phase Workflow.
- Options:
  1. Start the next feature workspace.
  2. Fill one critical Source of Truth gap.
  3. Review adoption risks with the human.
- Next AI action: use `scripts/start-workflow.sh` for the next real change or update the selected Source of Truth gap.
- Ask: "baseline 적용은 끝났습니다. 다음 실제 변경을 branch workspace로 시작할까요?"

### Infrastructure Gap Detected

- Current state: Existing Codebase Adoption found missing or unclear infrastructure/operations support.
- Recommended next action: record the gap and decide whether it becomes P0, P1, P2, or deferred.
- Options:
  1. Record as deferred follow-up.
  2. Create the next infrastructure Phase.
  3. Add the minimal version now.
  4. Mark not applicable with a reason.
- Next AI action: update the baseline report and propose a next Phase candidate when risk warrants it.
- Ask: "이 누락 항목은 다음 Phase로 올릴까요, deferred risk로 기록할까요?"

### P0 Gap Blocks Risky Feature

- Current state: a P0 gap would make the first risky implementation feature unsafe.
- Recommended next action: handle the P0 gap before starting that feature branch.
- Options:
  1. Create an infrastructure Phase first.
  2. Add the minimal local run or verification path now.
  3. Continue only with baseline/documentation/diagnostic work.
  4. Pause for human risk acceptance.
- Next AI action: scope the smallest P0-remediation Phase or limit work to non-risky tasks.
- Ask: "이 P0 gap은 첫 위험 구현 변경 전에 막아야 합니다. 먼저 인프라 Phase를 만들까요?"

### Gap Deferred With Risk

- Current state: the human accepted that an infrastructure gap will not be fixed now.
- Recommended next action: record the deferred gap, reason, revisit trigger, and accepted risk.
- Options:
  1. Record deferral and continue.
  2. Add a revisit trigger before PR/integration.
  3. Reclassify as P0/P1 if the next feature depends on it.
- Next AI action: update baseline report, `notes.md`, or `quality.md` with the risk and trigger.
- Ask: "이 gap을 deferred로 남기되, 어떤 조건에서 다시 볼지 기록할까요?"

### Start Sync Required

- Current state: workspace exists, but Start Sync is missing or stale in `sync.md`.
- Recommended next action: ask for Git Sync Confirm before implementation.
- Options:
  1. Run approved main freshness check and record Start Sync.
  2. Continue with no Git sync because this is documentation-only.
  3. Pause until local changes are cleaned up.
- Next AI action: update `sync.md`, then continue to Scope Confirm or Contract Confirm.
- Ask: "구현 전에 main 기준점을 확인하고 `sync.md`에 기록할까요?"

### Workspace Created

- Current state: workspace files exist, but scope is not confirmed.
- Recommended next action: ask for Scope Confirm.
- Options:
  1. Confirm scope and continue.
  2. Revise scope.
  3. Split work into another branch.
  4. Pause this workspace.
- Next AI action: update `confirmations.md` or revise `plan.md`.
- Ask: "이 범위로 진행해도 될까요, 아니면 범위를 수정할까요?"

### Scope Drafted

- Current state: `plan.md` has draft goal, scope, and out-of-scope.
- Recommended next action: ask for Scope Confirm.
- Options:
  1. Accept scope.
  2. Add or remove scope.
  3. Move a scope item to another branch.
- Next AI action: update `confirmations.md` and proceed to Contract Confirm.
- Ask: "포함/제외 범위와 영향 문서를 이대로 확정할까요?"

### Scope Accepted

- Current state: scope is accepted; contracts may still be draft.
- Recommended next action: draft shared contracts.
- Options:
  1. Draft data/interface contracts.
  2. Implement only if no contract changes are needed.
  3. Ask a product question first.
- Next AI action: update `shared-docs.md` and ask for Contract Confirm.
- Ask: "구현 전에 데이터/인터페이스 계약을 이렇게 잡아도 될까요?"

### Contract Drafted

- Current state: `shared-docs.md` contains proposed Source of Truth changes.
- Recommended next action: ask for Contract Confirm.
- Options:
  1. Accept contract and implement.
  2. Revise data model.
  3. Revise interface/API/CLI/UI contract.
  4. Defer contract decision.
- Next AI action: update `confirmations.md` or revise `shared-docs.md`.
- Ask: "이 계약을 기준으로 구현을 진행해도 될까요?"

### Contract Accepted

- Current state: scope and contract are accepted.
- Recommended next action: confirm TDD and branch quality gate before implementation.
- Options:
  1. Define TDD/check plan in `quality.md`.
  2. Start implementation if TDD is not applicable.
  3. Pause before implementation.
- Next AI action: update `quality.md` or implement only the accepted scope.
- Ask: "구현 전에 TDD/검증 계획을 `quality.md`에 잡을까요?"

### TDD Plan Needed

- Current state: implementation can start, but TDD applicability is not recorded in `quality.md`.
- Recommended next action: ask for Quality Gate Confirm.
- Options:
  1. Write or identify the failing test first.
  2. Mark TDD not applicable with a reason.
  3. Define focused branch checks before implementation.
- Next AI action: update `quality.md`, then proceed to implementation.
- Ask: "이 작업은 TDD를 적용할까요, 아니면 적용 제외 사유를 기록할까요?"

### Implementation In Progress

- Current state: implementation has started.
- Recommended next action: continue unless scope drift appears.
- Options:
  1. Continue implementation.
  2. Record a decision in `notes.md`.
  3. Trigger Scope Change Confirm.
  4. Pause and report current state.
- Next AI action: continue or ask for scope change confirmation.
- Ask: "이 항목은 현재 범위를 넘을 수 있습니다. 확장할까요, 분리할까요?"

### Mid-Phase Upstream Change Detected

- Current state: main or shared Source of Truth changed while this workspace is in progress.
- Recommended next action: ask for Sync Conflict Confirm.
- Options:
  1. Re-check main and update this branch now.
  2. Continue and record stale-context risk in `sync.md`.
  3. Split the affected work into a follow-up branch.
  4. Pause for human review.
- Next AI action: update `sync.md`, `notes.md`, and any impacted `shared-docs.md`.
- Ask: "진행 중 main 변경이 감지됐습니다. 지금 반영할까요, 위험을 기록하고 계속할까요?"

### Source Of Truth Conflict Detected

- Current state: two branches propose conflicting changes to `docs/02`, `docs/03`, `docs/05`, `docs/06`, or `docs/07`.
- Recommended next action: ask for Sync Conflict Confirm or Integration Conflict Confirm.
- Options:
  1. Choose one Source of Truth direction.
  2. Merge both proposals into a new shared contract.
  3. Defer one proposal to a follow-up branch.
  4. Pause for human decision.
- Next AI action: update integration `shared-docs.md`, `sources.md`, `confirmations.md`, and `sync.md`.
- Ask: "공통 Source of Truth 충돌이 있습니다. 어느 방향으로 확정할까요?"

### Verification Ready

- Current state: implementation is done or ready to check.
- Recommended next action: ask for Verification Confirm.
- Options:
  1. Run proposed verification.
  2. Add more tests/checks.
  3. Skip a check with a recorded reason.
- Next AI action: run agreed verification and record evidence.
- Ask: "아래 검증 명령과 수동 검증 경로로 진행해도 될까요?"

### Quality Gate Ready

- Current state: implementation is ready for branch checks, but `quality.md` needs final evidence.
- Recommended next action: run agreed branch checks and update `quality.md`.
- Options:
  1. Run TDD/focused tests and harness validation.
  2. Add CI/build/typecheck checks before completion.
  3. Record skipped checks with human confirmation.
- Next AI action: run or record checks, then proceed to Verification Passed or Verification Failed.
- Ask: "이제 어떤 품질 게이트를 실행하고 `quality.md`에 기록할까요?"

### Verification Failed

- Current state: one or more checks failed.
- Recommended next action: fix failure before completion.
- Options:
  1. Fix failure in current branch.
  2. Update scope if failure reveals wrong assumptions.
  3. Record failure and pause.
- Next AI action: diagnose and repair or update `notes.md`/`report.md`.
- Ask: "실패를 현재 브랜치에서 고칠까요, 범위/계약을 다시 볼까요?"

### Verification Passed

- Current state: agreed checks passed.
- Recommended next action: prepare Completion Confirm.
- Options:
  1. Complete branch.
  2. Write or update report first.
  3. Run strict harness validation.
- Next AI action: update `report.md`, `confirmations.md`, and next context.
- Ask: "검증이 통과했습니다. 이 브랜치를 완료로 볼까요?"

### Pre-Merge Sync Required

- Current state: branch verification passed, but Pre-Merge Sync is missing or stale.
- Recommended next action: ask for Git Sync Confirm before completion or PR.
- Options:
  1. Run approved main freshness check and record Pre-Merge Sync.
  2. Record a human-approved deferral reason.
  3. Pause until conflicts are resolved.
- Next AI action: update `sync.md`, then prepare Completion Confirm or PR Ready.
- Ask: "완료 전에 main 최신 상태를 다시 확인하고 `sync.md`에 남길까요?"

### PR Ready

- Current state: scope, verification, confirmations, and pre-merge sync are complete.
- Recommended next action: confirm CI gate before PR-based integration.
- Options:
  1. Run CI-equivalent local checks, then create or update the PR after confirmation.
  2. Keep branch local and write handoff notes.
  3. Run strict validation one more time.
  4. Record CI not applicable with a reason.
- Next AI action: record CI result in `quality.md`, PR link/status in `sync.md`, and update `report.md`.
- Ask: "PR 전에 CI에 해당하는 검증을 한 번 더 돌릴까요?"

### PR Checklist Incomplete

- Current state: PR handoff was requested, but one or more checklist items are missing.
- Recommended next action: fill missing workspace evidence before PR creation.
- Options:
  1. Update `sync.md` first.
  2. Update `quality.md` first.
  3. Resolve pending confirmations.
  4. Record remaining risk and keep PR as draft.
- Next AI action: update the missing file or report the exact blocker.
- Ask: "PR 체크리스트에서 빠진 항목을 먼저 채울까요, draft 위험으로 남길까요?"

### Complete And PR Ready

- Current state: workspace is `complete`, pending confirmations are clear, and PR checklist is ready.
- Recommended next action: automatically create the PR after final validation and PR sync checks, then explain the remaining choices with procedure, good-fit situation, advantage, caution/tradeoff, and remote/external state-change impact.
- Options:
  1. PR 진행
     - Procedure: final validation -> branch push -> PR creation -> CI check -> merge -> linked issue close check -> `prepare-pr --finalize` -> automatic merged branch cleanup -> finalization record commit/push.
     - Good fit: this branch should become the next main baseline.
     - Advantage: next Phase starts from main with this work included.
     - Caution: remote state changes and Git branch/ref cleanup happen automatically. If CI fails, conflicts appear, required review is missing, scope drift appears, or the human says "PR만", stop before merge and report back.
  2. 추가 보강
     - Procedure: list 1-5 concrete hardening candidates, update selected docs/tests/code/evidence, rerun validation.
     - Good fit: docs, tests, cost notes, manual verification, or next-phase contract are still a little ambiguous.
     - Advantage: higher PR quality and easier team review.
     - Caution: delays merge; scope expansion requires Scope Change Confirm.
  3. 다음 Phase
     - Procedure: ask whether to merge the current PR-ready branch first or intentionally hold it, then create the next workspace.
     - Good fit: the current branch is already merged, or the team intentionally wants to defer it while starting independent work.
     - Advantage: keeps momentum.
     - Caution: starting the next Phase before merging can cause duplicate work or conflicts because main does not contain this branch.
  4. 보류
     - Procedure: stop without push/PR/merge and record hold reason plus resume condition in `next-actions.md`.
     - Good fit: waiting on reviewer, cost/security approval, account permission, or schedule decision.
     - Advantage: avoids publishing risky or incomplete work.
     - Caution: branch can drift from main if left too long.
  5. 외부 실행 승인 단계
     - Procedure: check approval checklist, expected cost, rollback, smoke test, secrets, and permissions before external work.
     - Good fit: AWS resource creation, deploy, migration, or other outside-repo state change is next.
     - Advantage: enables real environment verification.
     - Caution: creates cost, permission, and operations risk; explicit human approval required.
- Next AI action: ask the human to choose an option. If the human chooses `PR 진행`, continue through push, PR creation, CI check, merge, finalize, linked issue close verification, and automatic merged branch cleanup unless a stop condition appears.
- Auto PR action: if no PR exists yet and the human did not opt out, run `scripts/prepare-pr.sh --auto-pr <workspace>`, record/push the PR link, check CI, and report the PR link plus remaining choices.
- Ask: "완료된 branch입니다. 선택지별 절차와 장단점은 위와 같고, 어떤 방향으로 진행할까요?"

### Remaining Branch Queue

- Current state: a PR was merged/finalized, a branch switch is about to happen, or the human asked what work branches remain.
- Recommended next action: run or summarize `scripts/list-active-branches.sh`.
- Options:
  1. Continue a remaining active local branch.
  2. Review an open PR branch.
  3. Hold a remaining branch and record the reason.
  4. Start the next Phase from `main`.
  5. Review cleanup candidates.
- Next AI action: report branch name, ahead count, local branch presence, remote branch presence, remote-tracking status, workspace, workspace state, linked issue, PR state, merge status, issue close status, and recommended next action.
- Ask: "남은 작업 브랜치가 있습니다. PR 진행, 보류, 다음 Phase, cleanup 검토 중 무엇을 할까요?"

### Semantic Validation Failed

- Current state: strict or integration validation found a state-dependent semantic gap.
- Recommended next action: update the specific status file before continuing.
- Options:
  1. Fix `quality.md` status/TDD/CI fields.
  2. Fix `decisions.md` status or record accepted/deferred decisions.
  3. Fix `sync.md` Pre-Merge result or deferral reason.
  4. Change `Workspace state` back to draft/in-progress if the branch is not review-ready.
- Next AI action: report exact failing file and update only the relevant workspace state.
- Ask: "이 workspace는 아직 ready 상태가 아닌가요, 아니면 누락된 status 필드를 채울까요?"

### CD Gate Required

- Current state: merge or release may trigger deployment, publish, migration, or production-impacting behavior.
- Recommended next action: ask for Quality Gate Confirm before CD commands.
- Options:
  1. Confirm deploy/publish command and smoke test.
  2. Add rollback notes first.
  3. Defer deployment and merge code only.
  4. Pause for human release approval.
- Next AI action: update `quality.md`, `sync.md`, and release/deploy notes.
- Ask: "배포/퍼블리시 전에 smoke와 rollback 계획을 확정할까요?"

### CI Example Requested

- Current state: the human asked for CI guidance or an example.
- Recommended next action: point to the optional harness validation example.
- Options:
  1. Use `.github/workflows/harness-validation.example.yml` as a starting point.
  2. Adapt the example to the project stack.
  3. Keep CI manual for now and record checks in `quality.md`.
- Next AI action: explain or adapt the example without enabling deployment/publish automation.
- Ask: "예시 CI를 프로젝트 스택에 맞게 바꿔볼까요, 아니면 수동 체크로 둘까요?"

### Completion Pending

- Current state: branch is ready for human completion decision.
- Recommended next action: ask for Completion Confirm.
- Options:
  1. Mark complete.
  2. Add remaining risks.
  3. Send to integration branch.
  4. Reopen scope.
- Next AI action: record completion or update follow-up items.
- Ask: "변경/검증/남은 위험을 기준으로 완료 처리해도 될까요?"

### Integration Conflict Found

- Current state: source branches disagree on a shared model, interface, acceptance, regression, or manual verification path.
- Recommended next action: ask for Integration Conflict Confirm.
- Options:
  1. Choose one contract.
  2. Merge both contracts into a new contract.
  3. Split conflict into a follow-up branch.
  4. Pause for human decision.
- Next AI action: update integration `shared-docs.md`, `sources.md`, and `confirmations.md`.
- Ask: "이 충돌은 어떤 방향으로 확정할까요?"

### Integration Ready

- Current state: source branches are declared and conflicts are resolved.
- Recommended next action: run integration verification and `scripts/validate-harness.sh --integration`.
- Options:
  1. Run integration verification.
  2. Update Source of Truth first.
  3. Ask for final integration review.
- Next AI action: verify integrated flow and write integration report.
- Ask: "통합 검증으로 넘어갈까요, Source of Truth 반영을 먼저 확인할까요?"

### Integration Validation Failed

- Current state: `scripts/validate-harness.sh --integration` found missing or stale source handoff evidence.
- Recommended next action: fix source branch handoff before integration completion.
- Options:
  1. Fill missing source workspace files.
  2. Resolve source branch pending confirmations.
  3. Update source `quality.md`, `decisions.md`, or `sync.md`.
  4. Pause integration and request human decision.
- Next AI action: report exact failing source branch and update integration `sources.md`, `shared-docs.md`, or `decisions.md` if needed.
- Ask: "통합 검증 실패 항목을 고칠까요, 아니면 통합을 잠시 멈출까요?"
