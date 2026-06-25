# Week2 M3 JSON main path decision 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: confirmed
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: 사용자가 “페이즈6까지 알아서 머지하면서 진행”하라고 지시했고, Phase 5 범위는 M3 JSON main path와 PR #105 회수 결정 문서로 제한했다.

## Contract Confirm / 계약 확인

- Status: confirmed
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: runtime contract/API/schema 변경 없이 PR #105는 read-only source material로만 검토한다.

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Ask human when:
  - 작업이 `plan.md` 범위를 넘을 때
  - 기능을 다른 branch로 분리해야 할 때
  - 구현 중 새 제품 결정이 드러날 때
- Human response: 

## Verification Confirm / 검증 확인

- Status: confirmed
- Ask human to confirm:
  - test/build/smoke 명령
  - TDD 증거 또는 skip reason
  - CI/check 명령
  - manual verification 경로
  - completion criteria
- Human response: docs-only decision이므로 PR #105 read-only inspection, keyword check, `git diff --check`, strict harness validation으로 검증한다.

## Quality Gate Confirm / 품질 게이트 확인

- Status: confirmed
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: TDD는 적용하지 않는다. code/build/deploy 변경 없음.

## Git Sync Confirm / Git sync 확인

- Status: confirmed
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: `scripts/start-workflow.sh --no-issue docs week2-m3-json-main-path-decision "Week2 M3 JSON main path decision"`로 `origin/main` `6b7abd9` 기준 branch/workspace를 만들었다.

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

- Status: confirmed
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: Phase 5 M3 JSON main path decision 문서와 report 작성 완료. runner boundary는 Phase 6에서 이어서 닫는다.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
