# Target dataset run handoff 결정 기록

- Decision status: accepted

| Decision | Status | Rationale |
| --- | --- | --- |
| 화면명 | accepted | `M5 데모` 대신 `Job Runs`를 사용한다. |
| runtime detail | deferred | C-4는 run 생성/status에 집중하고 runtime evidence는 C-5로 넘긴다. |
| fixture output 표시 | accepted | C-4는 dynamic Target output이 아니라 Week2 fixture-backed smoke임을 UI/API에 명시한다. |

## Decision Option Briefs / 결정 옵션 브리프

- not needed yet

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| run handoff endpoint | Target Dataset 전용 `/api/target-datasets/{dataset_id}/runs` | UI가 Week2 API를 직접 호출하지 않고 Target Dataset context와 `ExecutionResult` link를 보존하기 위해 | Phase C-4 implementation / 2026-06-29 |
| run 화면명 | `Job Runs` | 사용자 시나리오에서 실행 기록으로 읽히게 하고 독립 M5 데모 노출을 피하기 위해 | Phase C-4 implementation / 2026-06-29 |
| C-4 output scope | `runtime_output_scope=week2_fixture_output` | `dataset_reviews_gold`가 새 Target Dataset 산출물처럼 보이는 오해를 막기 위해 | Phase C-4 보완 / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Spark/Kafka runtime evidence 정렬 | C-4는 M5 run handoff와 status 표시가 범위 | C-5 runtime evidence integration 시작 시 | C-5 `feature/runtime-evidence-integration` |
| CatalogMetadata final registration 보강 | C-4는 `ExecutionResult` link까지만 담당 | C-6 catalog metadata integration 시작 시 | C-6 `feature/catalog-metadata-integration` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
