# Week2 runner boundary decision 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Runner boundary selection: M5 owns WorkflowDefinition/ExecutionResult-compatible result and selection; M3 owns TransformSpec/job logic; M2 owns RuntimeConfig/SparkRunner implementation.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Runner input boundary | `workflow_definition`, `source_config`, `schema_definition`, optional `transform_spec`, optional `runtime_config`, `run_id`, `output_root` | M2/M3/M5 병렬 구현이 같은 호출 계약을 공유하기 위해 선택 | User request to proceed through Phase 6 / 2026-06-25 |
| Runner output boundary | `Week2RunnerResult` compatible shape | 기존 M5 run/catalog update와 `ExecutionResult` contract를 보존하기 위해 선택 | User request to proceed through Phase 6 / 2026-06-25 |
| Runner ownership | M5 selection/persistence, M3 TransformSpec/job logic, M2 RuntimeConfig/SparkRunner | Spark/session/config와 transformation semantics 중복을 방지하기 위해 선택 | User request to proceed through Phase 6 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Concrete adapter class names | implementation PR까지 보류 | code context와 tests를 보고 정함 | M2/M3/M5 implementation branches |
| exact `TransformSpec` schema | implementation PR까지 보류 | Phase 5의 최소 산출물을 code로 옮기며 확정 | M3 implementation branch |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Runner boundary | M2/M3 implementation이 `Week2RunnerResult` 호환 output을 만들 수 없음 | boundary decision 재검토 또는 adapter layer 추가 |
