# Product context CI guard audit 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: accepted
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: 사용자가 생성한 프롬프트를 적용하라고 지시함. 범위는 product context audit과 필요한 최소 CI/strict guard로 제한.

## Contract Confirm / 계약 확인

- Status: accepted
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: data model/API/runtime contract는 변경하지 않고 validation/test/report만 변경.

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Ask human when:
  - 작업이 `plan.md` 범위를 넘을 때
  - 기능을 다른 branch로 분리해야 할 때
  - 구현 중 새 제품 결정이 드러날 때
- Human response: 

## Verification Confirm / 검증 확인

- Status: accepted
- Ask human to confirm:
  - test/build/smoke 명령
  - TDD 증거 또는 skip reason
  - CI/check 명령
  - manual verification 경로
  - completion criteria
- Human response: `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`를 실행.

## Quality Gate Confirm / 품질 게이트 확인

- Status: accepted
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: strict validation behavior 변경이므로 TDD와 Harness Test Update Gate 적용.

## Git Sync Confirm / Git sync 확인

- Status: accepted
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: start sync 기록 확인. pull/merge/rebase/push/PR은 실행하지 않음.

## Sync Conflict Confirm / sync 충돌 확인

- Status: not needed
- Ask human when:
  - Phase 중 main이 바뀐 경우
  - 공유 Source of Truth 문서가 이 branch와 충돌하는 경우
  - merge/rebase/pull/push/PR action이 필요한 경우
- Human response: 

## Completion Confirm / 완료 확인

- Status: accepted
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: local validation 통과. PR/push/handoff는 `Pre-PR Human Checkpoint` 선택 전까지 보류.

## Pre-PR Human Checkpoint

- Status: deferred
- Trigger: local validation passed and PR/handoff is a natural next action.
- Options presented: `PR 진행`, `로컬 완료로 보류`, `추가 수정`, `다음 Phase`
- Human choice: pending
- Result: no push, PR creation, merge, or remote cleanup executed.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
