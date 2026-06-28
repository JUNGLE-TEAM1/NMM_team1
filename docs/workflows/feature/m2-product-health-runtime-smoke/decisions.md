# M2 product health runtime smoke 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 옵션 비교는 열지 않는다. 이번 작업은 이미 확정된 M2 runtime boundary 안에서 multi-source 입력을 추가하는 additive 구현이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M2 product health 다음 slice | multi-source pass-through runtime smoke | M3가 Bronze/Silver/Gold semantics를 소유하므로 M2는 실행/저장/evidence 경계만 먼저 닫는다. | 사용자 진행 지시 / 2026-06-28 |
| RuntimeConfig 확장 | 기존 단일 입력 유지 + 선택 `source_inputs[]` 추가 | 기존 M5 `spark_runner` 경로를 깨지 않고 reviews/behavior/delivery/product 입력을 한 run에서 표현하기 위해 | Phase implementation / 2026-06-28 |
| output evidence | `output_path`는 run directory, source별 file은 `task_results[].output_path` | `Week2RunnerResult` top-level shape를 유지하면서 source별 증거를 잃지 않기 위해 | Phase implementation / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| M3 TransformSpec 실제 실행 | M3 L6 deterministic spec code/input adapter가 아직 이 Phase 범위가 아니다. | M3 L6 spec fixture가 M5 runner input으로 들어올 때 | M2/M3/M5 transform integration |
| Docker Spark cluster | 이번 PR은 local pyarrow pass-through evidence에 집중한다. | 5GB input run 또는 final M2 cluster evidence 시작 시 | M2 Docker Spark follow-up |
| MinIO upload for multi-source | storage adapter 경로는 기존 구조를 재사용할 수 있지만 이번 smoke는 local output으로 충분하다. | 팀이 대표 경로 object storage upload evidence를 요구할 때 | M2 storage follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `source_inputs[]` result shape | M5가 directory `output_path`를 소비할 수 없거나 source별 file path가 필요해진다. | `ExecutionResult.outputs[]` 또는 Catalog handoff shape를 M5와 별도 integration PR에서 조정한다. |
| M2/M3 책임 경계 | M2 code에 Bronze/Silver/Gold semantic logic이 들어가기 시작한다. | 해당 logic을 M3 TransformSpec/job adapter로 이동한다. |
