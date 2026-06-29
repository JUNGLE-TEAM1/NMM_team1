# M1 Week2 final demo flow 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: accepted
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: 사용자가 "진행해"라고 지시했고, M1 책임 범위 안에서 최신 Week2 demo flow 표시 보강을 진행하는 것으로 해석했다. 포함 범위는 `/catalog` query readiness와 `/query` DuckDB/evidence 상태 표시다. M5/M6/M4/M3 내부 구현은 제외한다.

## Contract Confirm / 계약 확인

- Status: accepted
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: backend API/schema/data model은 변경하지 않는다. 기존 `CatalogMetadata`, `AIQueryResult.query_result`, `evidence`, `guardrail` 응답을 M1에서 방어적으로 표시한다.

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
- Human response: frontend build, static keyword check, `git diff --check`, strict harness validation을 수행한다. local backend/browser smoke는 서버 실행 가능 여부에 따라 시도하거나 생략 사유를 기록한다.

## Quality Gate Confirm / 품질 게이트 확인

- Status: accepted
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: TDD는 적용하지 않는다. 이번 변경은 frontend display polish이며 backend/core logic 변경이 없다.

## Git Sync Confirm / Git sync 확인

- Status: accepted
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: `origin/main` `e640f90` 기준으로 branch를 만들었다. 자동 pull/merge/rebase는 실행하지 않았다. #200/#204 open PR 변경은 직접 병합하지 않고 문맥으로만 참고한다.

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
- Confirm:
  - conflict type
  - affected files
  - resolution path
  - revalidation commands/result
- Relationship: `Sync Conflict Confirm`은 main/upstream sync 선택이고, `Integration Conflict Confirm`은 여러 source branch 계약 충돌 선택이다. `PR Conflict Confirm`은 open PR 또는 PR-ready branch의 conflict 해결 경로 선택이다.
- Human response:

## Completion Confirm / 완료 확인

- Status: accepted
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: 구현과 local validation은 완료로 기록한다. PR 진행 여부는 #200/#204 merge 순서와 linked issue 생성 필요성 때문에 `next-actions.md`의 후속 선택으로 남긴다.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
