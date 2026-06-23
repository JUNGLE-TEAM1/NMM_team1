# Plan

## Phase

- Type: docs
- Workspace: `docs/workflows/docs/pre-pr-human-checkpoint/`
- Goal: 완료 직전 PR/push/handoff 선택을 사람이 명시하도록 `Pre-PR Human Checkpoint` 규칙을 하네스에 추가한다.

## Scope

- `AGENTS.md`에 완료 전 handoff 질문 규칙을 추가한다.
- `docs/08-development-workflow.md`에서 자동 PR 생성 표현을 제거하고 checkpoint를 정의한다.
- `docs/11-git-sync-policy.md`에서 PR/push 승인과 deferral 기록 방식을 명확히 한다.
- `docs/13-human-command-flow.md`에서 상태 질문과 명시 PR 명령을 분리한다.
- `docs/10-next-action-menu.md`, `docs/09-collaboration-agreement.md`, `docs/12-quality-gates.md`, `docs/workflows/README.md`를 최소 전파한다.
- `scripts/status-workflow.sh`, `scripts/validate-harness.sh`, `scripts/test-harness.sh`를 새 checkpoint 규칙에 맞게 갱신한다.

## Out Of Scope

- branch 생성, checkout, pull, merge, rebase, push, PR 생성, PR merge.
- `scripts/prepare-pr.sh` 동작 변경.
- GitHub issue 생성.

## Change Propagation

- Earliest impacted layer: Workflow.
- Propagation: Workflow -> Collaboration Agreement -> Next Action Menu -> Git Sync Policy -> Quality Gates -> Human Command Flow -> Branch Workspaces.

## Completion Criteria

- `Pre-PR Human Checkpoint`가 Source of Truth 문서에 명시된다.
- 자동 PR 생성 규칙 문구가 제거되거나 명시 승인 후 helper 사용으로 제한된다.
- 로컬 보류 시 `sync.md` deferral reason과 `next-actions.md` resume condition 기록 방식이 명시된다.
- `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/status-workflow.sh docs/workflows/docs/pre-pr-human-checkpoint`, `scripts/harness-flow-check.sh docs/workflows/docs/pre-pr-human-checkpoint`가 통과한다.
