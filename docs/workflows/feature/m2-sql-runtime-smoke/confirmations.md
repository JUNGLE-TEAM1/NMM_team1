# M2 SQL runtime smoke 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: confirmed
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: 2026-06-27 사용자가 #191 merge 이후 "다음 사항 진행하자"라고 지시했다. 다음 M2 작업은 `docs/03`의 SQL adapter 경계와 `m6-sql-first-week2-buildup` 문맥에 따라 M2 SQL runtime smoke로 해석했다.

## Contract Confirm / 계약 확인

- Status: confirmed
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: DuckDB adapter는 `SqlEngineAdapter` 뒤에 추가하고, 기본 API는 `fake`를 유지하며 `Settings.week2_sql_engine="duckdb"`로 opt-in smoke한다. `duckdb` dependency 추가와 `docs/03`, `docs/06` 최소 갱신을 포함한다.

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
- Human response: TDD 실패를 먼저 확인한 뒤 focused tests, smoke script, full backend tests, strict harness를 실행했다.

## Quality Gate Confirm / 품질 게이트 확인

- Status: confirmed
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: TDD 적용. Deploy/publish는 필요 없다. CI는 PR 생성 후 GitHub checks로 확인한다.

## Git Sync Confirm / Git sync 확인

- Status: confirmed
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: #191 merge 후 local main을 `origin/main` `5d05bea`까지 fast-forward하고 `feature/m2-sql-runtime-smoke`를 생성했다. 중간 upstream 변경은 아직 확인되지 않았다.

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

- Status: ready-for-review
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: local completion 기준은 충족했다. PR 생성/CI 확인이 남아 있다.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
