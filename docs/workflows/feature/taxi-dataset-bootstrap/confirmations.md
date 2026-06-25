# M2 taxi dataset bootstrap 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: resolved
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: `yellow_tripdata_2024-01.parquet`, `taxi_trips`, `gold_taxi_daily_metrics`, `demo=10,000 rows`, `fixed=pickup_date 2024-01-01` 기준으로 진행한다. 실제 다운로드, 적재, connector, Parquet 생성, UI 구현은 후속 branch 범위로 둔다.

## Contract Confirm / 계약 확인

- Status: resolved
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: M5 확인 질문은 현재 PR의 blocking gate로 두지 않는다. `ExecutionResult.row_count=input trip rows`, `ExecutionResult.bytes=input bytes`, Gold URI/prefix/local fallback은 M2 기본 가정으로 문서화하고 후속 통합에서 조정한다.
- Human response: M2는 로컬 dev용 Parquet -> PostgreSQL loader를 소유한다. 첫 batch 입력은 `public.taxi_trips`로 고정하고, File source는 후속 확장으로 남긴다. Gold output은 local Parquet path를 우선 사용하며, MinIO/S3 전환을 위해 `CatalogMetadata.s3_uri`, `storage.bucket`, `storage.prefix`, `storage.local_fallback_path` 필드를 유지한다. 오늘~내일 구현 검증은 `fixed=pickup_date 2024-01-01` 필수, `local-full-month` manual/benchmark evidence로 둔다. M5 공통 계약 구조는 따르되 Taxi 전용 공식 예시는 다음 M2 구현 branch에서 코드와 함께 승격한다.

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
- Human response: 문서 전용 작업으로 `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`를 사용한다. 제품 runtime/manual verification은 구현 branch에서 수행한다.

## Quality Gate Confirm / 품질 게이트 확인

- Status: resolved
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: TDD는 문서 전용 변경이라 생략한다. CI는 필요하지 않으며 harness validation과 strict validation으로 검증한다.

## Git Sync Confirm / Git sync 확인

- Status: resolved
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: `origin/main`이 `41409ac`까지 진행된 것을 확인했고, `git merge --no-edit origin/main`로 현재 branch에 반영했다. 충돌은 없었고 merge commit은 `c8859ff`다.

## Sync Conflict Confirm / sync 충돌 확인

- Status: not needed
- Ask human when:
  - Phase 중 main이 바뀐 경우
  - 공유 Source of Truth 문서가 이 branch와 충돌하는 경우
  - merge/rebase/pull/push/PR action이 필요한 경우
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

- Status: resolved
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: 이 branch는 M2 Taxi dataset bootstrap 문서/계약 기준 정리를 완료한 것으로 본다. 실제 데이터 저장, PostgreSQL 적재, batch runner, Bronze/Gold Parquet 생성은 후속 구현 branch에서 진행한다.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
