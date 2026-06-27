# M2 Taxi scale evidence 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: confirmed
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: PySpark local mode를 우선 추가해 작은 Taxi Parquet smoke를 성공시키고, 가능하면 MinIO/S3-compatible output smoke까지 진행한다. Docker Spark cluster와 Airflow DAG 연결은 이번 작업에서 제외하되 후속/최종 기준으로 남긴다. 5GB Taxi 데이터 묶음은 준비되면 같은 Spark 경로로 재실행한다.

## Contract Confirm / 계약 확인

- Status: confirmed
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: `pyspark==4.1.2`를 `.venv`와 `backend/requirements.txt`에 추가한다. 기존 M2 evidence result shape를 유지하고, 새 Taxi Spark evidence CLI는 row_count/bytes/duration/output_path/output_row_count/output_bytes를 summary로 남긴다.

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Ask human when:
  - 작업이 `plan.md` 범위를 넘을 때
  - 기능을 다른 branch로 분리해야 할 때
  - 구현 중 새 제품 결정이 드러날 때
- Human response: 

## Verification Confirm / 검증 확인

- Status: pending
- Ask human to confirm:
  - test/build/smoke 명령
  - TDD 증거 또는 skip reason
  - CI/check 명령
  - manual verification 경로
  - completion criteria
- Human response: 

## Quality Gate Confirm / 품질 게이트 확인

- Status: pending
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: 

## Git Sync Confirm / Git sync 확인

- Status: pending
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: 

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

- Status: pending
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: 

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
