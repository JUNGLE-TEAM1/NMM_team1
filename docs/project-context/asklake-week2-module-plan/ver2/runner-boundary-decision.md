# AskLake Week2 ver2 Runner Boundary Decision

## 목적

이 문서는 M2 SparkRunner, M3 transformation spec/job logic, M5 workflow runtime이 공유할 runner boundary를 확정한다.

Phase 6이 끝나면 M2/M3/M5가 병렬 구현을 시작할 수 있어야 한다. 이 문서는 code 변경 없이 호출 계약과 소유권만 결정한다.

## 결정 요약

- M5는 `WorkflowDefinition`과 `ExecutionResult` 호환 결과의 최종 소유자다.
- M3는 JSON profile/schema facts와 `TransformSpec`/job logic을 만든다.
- M2는 `RuntimeConfig`와 `SparkRunner` implementation을 제공한다.
- M3는 Spark session/config/output convention을 직접 만들지 않는다.
- M2는 transformation semantics를 정의하지 않는다.
- M5는 runner selection과 run/catalog persistence를 담당한다.

## Runner input boundary

runner implementation은 아래 입력을 받는 형태로 수렴한다.

| 입력 | 소유자 | 필수 여부 | 설명 |
| --- | --- | --- | --- |
| `workflow_definition` | M5 | required | 기존 `WorkflowDefinition` contract. pipeline/nodes/edges/target dataset 기준 |
| `source_config` | M1/M3/M4/M5 shared | required for source read | source id/type/path/options. M1 단독 소유가 아니다. |
| `schema_definition` | M3/M5 shared | required for normalize/catalog | inferred schema 또는 curated schema |
| `transform_spec` | M3 | optional initially, required for M3 runner | select/flatten/normalize/aggregate/load 의도 |
| `runtime_config` | M2 | optional initially, required for SparkRunner | Spark session/app/local resource/output settings |
| `run_id` | M5 | required | run, output path, lineage 연결 키 |
| `output_root` | M5/M2 shared | required | local/minio/s3 prefix convention의 기준 |

현재 `Week2LocalRunner.run(workflow_definition, run_id)`는 baseline implementation으로 유지한다. 후속 code PR은 위 입력을 한 번에 모두 강제하지 않고 adapter로 점진 확장한다.

## Runner result boundary

runner는 현재 `Week2RunnerResult`와 호환되는 결과를 반환한다.

| 필드 | 의미 |
| --- | --- |
| `status` | `succeeded`, `failed`, `fallback_succeeded`, `fallback_failed` 등 실행 상태 |
| `task_results` | node/task 단위 status, attempt, row_count, bytes, error |
| `logs` | M1/M5/M6이 보여줄 실행 로그 요약 |
| `row_count` | primary input rows processed |
| `bytes` | primary input bytes read |
| `duration_ms` | runner 실행 시간 |
| `output_path` | local/minio/s3 output location |
| `output_row_count` | output dataset rows |
| `output_bytes` | output dataset bytes |

이 result shape는 `ExecutionResult` contract와 M5 Catalog update의 bridge다.

## Runner implementations

| implementation | 단계 | 역할 |
| --- | --- | --- |
| `Week2LocalRunner` | 현재 baseline | Amazon Reviews JSON main path를 local JSONL로 실행하고 Catalog update에 필요한 metrics를 반환 |
| `M3TransformRunner` 또는 adapter | 후속 M3 | `TransformSpec`를 해석해 local runner 또는 SparkRunner 입력으로 바꾸는 job logic |
| `SparkRunner` | 후속 M2 | `RuntimeConfig`를 사용해 Spark read/write smoke와 batch execution을 수행 |

처음 병렬 구현에서는 `Week2LocalRunner`를 삭제하지 않고, M3/M2 runner가 같은 result boundary를 만족하는지 작은 smoke로 확인한다.

## M5 runner selection rule

M5는 runner selection의 최종 진입점이다.

초기 selection 규칙:

1. demo/main E2E path 기본값은 `local_runner`다.
2. `runtime_config.runner = "spark"` 또는 명시적 executor가 있고 Spark smoke가 통과한 경우에만 `spark_runner`를 선택한다.
3. SparkRunner가 실패하거나 준비되지 않았으면 local fallback 정책을 유지한다.
4. runner가 성공 상태를 반환한 경우에만 Catalog metadata를 update한다.
5. failed/fallback_failed 결과는 run history에 남기되 latest Catalog를 덮어쓰지 않는다.

## 금지할 결합

- M3가 Spark session을 직접 만들지 않는다.
- M3가 M5 Catalog persistence를 직접 수행하지 않는다.
- M2가 select/flatten/normalize/aggregate semantics를 임의로 정의하지 않는다.
- M5가 M3 profile/schema inference 로직을 직접 구현하지 않는다.
- M1이 runner/runtime 선택 로직을 소유하지 않는다.

## 병렬 구현 시작 조건

Phase 6 merge 후 다음 병렬 구현을 시작할 수 있다.

| workstream | 시작 조건 | 첫 완료 기준 |
| --- | --- | --- |
| M2 RuntimeConfig/SparkRunner smoke | 이 runner boundary 문서 merge | Spark read/write smoke가 `Week2RunnerResult` 호환 metrics를 반환 |
| M3 JSON TransformSpec | Phase 5/6 문서 merge | Amazon Reviews JSON sample에서 profile/schema facts와 minimal `TransformSpec` 생성 |
| M5 runner selection | M2/M3 initial smoke branch 준비 | local runner baseline 유지, optional runner adapter 선택 가능 |
| M6 Catalog-backed query | M5 Catalog source shape 확인 | fixture-only query에서 Catalog metadata source로 점진 전환 |
| M1 main path UI | M5/M6 API 상태 shape 확인 | run/catalog/query/evidence 상태 표시 |

## Phase 6 완료 기준

- M2/M3/M5 runner boundary input/output이 명시되어 있다.
- `Week2RunnerResult` 호환 result shape가 확정되어 있다.
- local runner baseline과 SparkRunner 후속 위치가 분리되어 있다.
- M3와 M2의 금지할 결합이 명시되어 있다.
- Phase 6 이후 병렬 구현 시작 조건이 명시되어 있다.
