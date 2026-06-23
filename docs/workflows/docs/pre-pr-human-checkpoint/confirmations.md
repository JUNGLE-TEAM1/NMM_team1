# Confirmations

## Scope Confirm

- Status: accepted by human.
- Scope: 완료 전 사람 확인 / PR handoff 선택 질문 규칙을 하네스에 반영.
- Excluded: branch 생성, pull, merge, rebase, push, PR 생성, PR merge, script behavior 변경.

## Contract Confirm

- Status: accepted.
- Contract: `Pre-PR Human Checkpoint`는 push/PR/handoff 전 사람 선택 menu를 요구한다.

## Verification Confirm

- Status: accepted by scope.
- Commands: local harness and workspace validation only.

## Completion Confirm

- Status: accepted after local harness validation.
