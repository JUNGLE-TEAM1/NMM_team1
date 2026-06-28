# M6 SQL planner intent rules 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: complete
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: 사용자가 "다음 단계 개발하자"라고 지시했고, 직전 Step 3 report의 Next context에 따라 M6 Step 4 `SQL Planner 강화`로 진행했다. 이후 사용자가 "4단계 계획대로 수정해줘"라고 지시해 최신 `gold_product_health` 대표 path를 반영했다.

## Contract Confirm / 계약 확인

- Status: complete
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: public `AIQueryResult` shape는 유지하고, additive failure code `unsupported_question`만 `docs/03`에 반영한다. Product health fixture/contract 추가는 별도 slice로 둔다.

## Scope Change Confirm / 범위 변경 확인

- Status: complete
- Ask human when:
  - 작업이 `plan.md` 범위를 넘을 때
  - 기능을 다른 branch로 분리해야 할 때
  - 구현 중 새 제품 결정이 드러날 때
- Human response: 2026-06-28 `origin/main` `e15300a`에서 대표 path가 `dataset_product_health_gold` / `gold_product_health`로 변경된 것을 확인했고, 이후 `origin/main` `e1ddef2`에서 M2 product health runtime smoke seed input이 추가된 것을 확인했다. Step 4는 범용 NL2SQL로 확장하지 않고, CatalogMetadata `allowed_columns` 기반 deterministic planner에 product health intent만 추가한다.

## Verification Confirm / 검증 확인

- Status: complete
- Ask human to confirm:
  - test/build/smoke 명령
  - TDD 증거 또는 skip reason
  - CI/check 명령
  - manual verification 경로
  - completion criteria
- Human response: TDD expected failure 후 focused tests, full backend tests, contract JSON, harness, strict harness를 실행했다. Product health update 후 focused tests 26 passed, final post-rebase full backend 82 passed/1 skipped.

## Quality Gate Confirm / 품질 게이트 확인

- Status: complete
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: TDD 적용. 최신 main rebase 후 PR/remote CI를 실행한다.

## Git Sync Confirm / Git sync 확인

- Status: complete
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: branch는 PR #204 head `bad0c9e`에서 시작했지만, PR #204 merge 이후 `origin/main` `e15300a` 위로 rebase했고, PR #228 merge 이후 다시 `origin/main` `e1ddef2` 위로 rebase했다.

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

- Status: complete
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: local implementation and validation complete. 최신 main rebase 완료 후 PR-ready validation과 PR 생성 단계로 진행한다.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
