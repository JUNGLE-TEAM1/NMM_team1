# M6 response contract route and retrieval trace 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: complete
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: 사용자가 10단계 중 5단계 개발을 요청했다. 이전 대화에서 5단계는 M6 public response contract route/retrieval trace로 정리했다.

## Contract Confirm / 계약 확인

- Status: complete
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: M6가 최종적으로 route/retrieval trace를 응답해야 한다는 10단계 계획을 승인했다. 이번 Phase는 additive API response field만 반영하고 외부 dependency는 추가하지 않는다.

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Ask human when:
  - 작업이 `plan.md` 범위를 넘을 때
  - 기능을 다른 branch로 분리해야 할 때
  - 구현 중 새 제품 결정이 드러날 때
- Human response: 없음.

## Verification Confirm / 검증 확인

- Status: complete
- Ask human to confirm:
  - test/build/smoke 명령
  - TDD 증거 또는 skip reason
  - CI/check 명령
  - manual verification 경로
  - completion criteria
- Human response: focused tests 26 passed, full backend tests 82 passed/1 skipped, contract JSON passed, diff check passed, harness validation passed, strict harness validation passed.

## Quality Gate Confirm / 품질 게이트 확인

- Status: complete
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: TDD 적용. deploy/publish gate는 이번 backend contract 변경 범위에 없음. PR/remote CI는 PR 생성 이후 확인한다.

## Git Sync Confirm / Git sync 확인

- Status: complete
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: branch workspace는 `0a9247c` 기준으로 생성됐다. 사람 확인 없는 pull/merge/rebase는 실행하지 않았고, 같은 `origin/main` 기준에서 local validation을 완료했다.

## Sync Conflict Confirm / sync 충돌 확인

- Status: not needed
- Ask human when:
  - Phase 중 main이 바뀐 경우
  - 공유 Source of Truth 문서가 이 branch와 충돌하는 경우
  - merge/rebase/pull/PR merge/finalize/cleanup action이 필요한 경우
- Human response: 없음.

## PR Conflict Confirm / PR 충돌 확인

- Status: not needed
- Ask human when:
  - GitHub PR이 conflict 상태를 보고하는 경우
  - `gh pr view` 또는 PR status에서 conflict가 의심되는 경우
  - 승인된 merge/rebase/pull 중 conflict가 발생한 경우
  - `git status`에 unmerged path가 있는 경우
  - Source of Truth proposal이 base/main 변경과 충돌하는 경우
- Confirm:
  - conflict type
  - affected files
  - resolution path
  - revalidation commands/result
- Relationship: `Sync Conflict Confirm`은 main/upstream sync 선택이고, `Integration Conflict Confirm`은 여러 source branch 계약 충돌 선택이다. `PR Conflict Confirm`은 open PR 또는 PR-ready branch의 conflict 해결 경로 선택이다.
- Human response: 없음.

## Completion Confirm / 완료 확인

- Status: complete
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: local implementation and validation complete. PR 생성/merge/finalize/cleanup은 별도 사용자 요청 또는 Pre-PR checkpoint 이후 진행한다.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 없음.
