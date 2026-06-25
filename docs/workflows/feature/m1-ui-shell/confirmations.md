# M1 UI Shell 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: resolved
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: 사용자는 M1에서 전체 UI를 먼저 적용하고 데모 연출을 제거한 뒤, 다른 사람 기능이 완성되면 하나씩 연결하는 방향에 동의했다. 2026-06-25.

## Contract Confirm / 계약 확인

- Status: resolved
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: M1은 새 contract를 만들지 않고 기존 Week 2 contract surface만 사용한다. 공유 Source of Truth 변경 없음. 2026-06-25.

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Ask human when:
  - 작업이 `plan.md` 범위를 넘을 때
  - 기능을 다른 branch로 분리해야 할 때
  - 구현 중 새 제품 결정이 드러날 때
- Human response:

## Verification Confirm / 검증 확인

- Status: resolved
- Ask human to confirm:
  - test/build/smoke 명령
  - TDD 증거 또는 skip reason
  - CI/check 명령
  - manual verification 경로
  - completion criteria
- Human response: build, forbidden marker scan, browser route smoke, responsive smoke, harness validation을 수행한다.

## Quality Gate Confirm / 품질 게이트 확인

- Status: resolved
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: TDD는 UI shell 교체라 생략하고 build/browser smoke로 대체한다.

## Git Sync Confirm / Git sync 확인

- Status: resolved
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: 별도 worktree `feature/m1-ui-shell`에서 시작했고, 자동 pull/merge/rebase 없이 `origin/main` 기준으로 진행한다.

## Sync Conflict Confirm / sync 충돌 확인

- Status: not needed
- Ask human when:
  - Phase 중 main이 바뀐 경우
  - 공유 Source of Truth 문서가 이 branch와 충돌하는 경우
  - merge/rebase/pull/PR merge/finalize/cleanup action이 필요한 경우
- Human response:

## PR Conflict Confirm / PR 충돌 확인

- Status: not needed
- Ask human when:
  - GitHub PR이 conflict 상태를 보고하는 경우
  - `gh pr view` 또는 PR status에서 conflict가 의심되는 경우
  - 승인된 merge/rebase/pull 중 conflict가 발생한 경우
  - `git status`에 unmerged path가 있는 경우
  - Source of Truth proposal이 base/main 변경과 충돌하는 경우
- Human response:

## Completion Confirm / 완료 확인

- Status: ready-for-pr-checkpoint
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: PR 생성 후 merge/finalize/cleanup 전 사람 확인 필요.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response:
