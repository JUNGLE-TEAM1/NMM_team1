# AskLake Week2 ver2 팀 공유 요약

## 먼저 읽을 결론

Week2 분업은 이제 초기 회의안 그대로가 아니라 ver2 기준으로 진행한다. 초기 회의안은 대용량 데이터셋과 모듈별 병렬 구현을 크게 잡았지만, 발표 직전에는 Spark, ETL, Catalog를 여러 모듈이 중복 구현할 위험이 있었다. 그래서 Phase 1~6에서 먼저 책임과 실행 경계를 고정했다.

핵심은 단순하다.

```text
Amazon Reviews JSON
-> M3 profile/schema/TransformSpec
-> M5 Workflow/local runner/Catalog
-> M6 AI Query
-> M1 UI
```

Week2 데이터 경로는 세 가지다. Amazon Reviews JSON은 AI Query/분석 대표 경로이고, Taxi Batch와 Kafka Event도 필수 처리/evidence 경로다. Taxi/Kafka는 선택 사항이 아니지만, M6 분석 연결의 선행 조건으로 두지는 않는다.

먼저 기존 M5 local runner로 Amazon Reviews 분석 E2E를 닫고, M2/M4는 각각 정형 batch와 streaming ingestion의 처리 증거를 완성한다. SparkRunner는 runner boundary 뒤에 붙인다.

팀원이 지금부터 해야 할 일은 새 구조를 다시 설계하는 것이 아니라, 아래 기준 위에 각자 맡은 작은 구현 slice를 올리는 것이다.

## 현재 진행 상태

| 구분 | 상태 | 팀원이 알면 되는 것 |
| --- | --- | --- |
| 책임 분리 ver2 | 완료 | M1~M6 소유권을 다시 나눴고, Spark/Catalog/ETL 중복 구현을 금지했다. |
| 기존 구현 전환 계획 | 완료 | rewrite가 아니라 기존 M1/M4/M5/M6 구현 위에 adapter-first로 얹는다. |
| 분석 대표 path | 완료 | AI Query/분석 대표 경로는 Amazon Reviews JSON 중심이다. Taxi/Kafka는 필수 처리/evidence 경로로 별도 완료한다. |
| 기존 구현 anchor | 완료 | M5 workflow/catalog, M4 Kafka demo, M6 skeleton, M1 shell은 보존한다. |
| M3 JSON path | 완료 | PR #105는 바로 merge하지 않고 JSON inspect/profile 로직만 source material로 회수한다. |
| runner boundary | 완료 | M2 SparkRunner, M3 TransformSpec, M5 runner selection이 공유할 input/output 기준을 정했다. |

이제 M2/M3/M5 병렬 구현을 시작할 수 있다.

## 모듈별 지금 할 일

| 모듈 | 지금 할 일 | 의존하는 모듈 | 완료 기준 | 하지 말 것 |
| --- | --- | --- | --- | --- |
| M1 | M5/M6 API 결과를 run/catalog/query/evidence 화면에 연결한다. | M5 run/catalog API, M6 query API | demo 화면에서 run 상태, Catalog metadata, AI Query evidence를 한 흐름으로 볼 수 있다. | schema, ETL, runner 선택을 결정하지 않는다. |
| M2 | `RuntimeConfig`와 `SparkRunner` smoke를 만들고 Taxi Batch 또는 정형 batch 처리 evidence를 남긴다. `Week2RunnerResult` 호환 metrics를 반환한다. | M5 runner boundary, M3 `TransformSpec` 요구사항 | Spark/local equivalent가 `status`, `row_count`, `bytes`, `duration_ms`, `output_path`를 반환하고 run evidence에서 확인된다. | transformation semantics를 정의하지 않는다. |
| M3 | Amazon Reviews JSON inspect/profile/schema facts와 최소 `TransformSpec`를 만든다. | M5 runner boundary, M2 runtime 제약, PR #105 source material | JSON sample에서 field facts와 minimal `TransformSpec`가 나오고, M5에 넘길 Catalog facts가 정리된다. | Spark session/config/output convention을 직접 만들지 않는다. |
| M4 | Kafka replay demo와 raw event evidence를 유지하고, 필요 시 M3가 읽을 raw event contract를 정리한다. | M3 raw event 요구사항, M5 evidence 저장 방식 | replay command, raw event shape, throughput/lag/restart evidence, output_path가 문서와 실행 로그로 남는다. | M6 분석 연결의 선행 조건으로 Kafka streaming to Gold를 만들지 않는다. |
| M5 | `Week2WorkflowService` 중심 runner selection과 Catalog persistence를 유지/확장한다. | M2 `SparkRunner`, M3 `TransformSpec`, M6 Catalog 소비 요구 | local runner baseline을 유지하면서 선택형 runner adapter를 선택하고 successful result만 Catalog에 반영한다. | ETL 내부 변환 로직이나 Spark runtime을 소유하지 않는다. |
| M6 | fixture-only query에서 M5 Catalog-backed query로 전환한다. | M5 Catalog store/API, M3 schema/profile facts, M2 SQL runtime smoke | AI Query 응답이 Catalog metadata를 evidence로 사용하고 selected dataset 근거를 보여준다. | Catalog 저장소/API나 원본 ETL을 소유하지 않는다. |

## 보존할 기존 구현

아래 구현은 후속 PR에서 삭제하거나 전면 대체하지 않는다.

| 영역 | 보존 대상 |
| --- | --- |
| M1 UI shell | `frontend/src/app/App.jsx`, `frontend/src/app/m1StaticShellData.js`, `frontend/src/app/styles.css` |
| M4 Kafka evidence | `scripts/kafka_replay_to_parquet_demo.py`, `docs/manual-verification/08-kafka-replay-parquet-demo.md` |
| M5 workflow/API | `backend/app/services/week2_workflow.py`, `backend/app/api/week2_workflow.py` |
| M5 local runner | `backend/app/services/week2_local_runner.py` |
| M5 Catalog store | `backend/app/services/week2_catalog_store.py` |
| M6 AI Query | `backend/app/services/ai_query.py`, `backend/app/api/week2_ai_query.py` |
| M6 SQL skeleton | `backend/app/ports/sql_engine.py`, `backend/app/fakes/fake_sql_engine.py` |
| Week2 contracts | `contracts/*.sample.json` |

후속 implementation은 이 구현 위에 adapter를 추가한다. 특히 `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore`는 병렬 구현의 anchor다.

보존 이유는 명확하다. 이 구현들은 이미 run 생성, fallback 실행, Catalog 저장, query skeleton, 화면 shell을 연결하는 가장 가까운 E2E 뼈대다. 이것을 지우고 새로 만들면 발표 전에는 각 모듈이 다시 integration point를 맞춰야 하고, 병렬 구현이 서로 다른 output convention을 만들 가능성이 커진다.

## Runner boundary

M2/M3/M5는 아래 boundary를 공유한다.

### Runner input

| 입력 | 소유자 | 설명 |
| --- | --- | --- |
| `workflow_definition` | M5 | pipeline/nodes/edges/target dataset |
| `source_config` | M1/M3/M4/M5 shared | source id/type/path/options |
| `schema_definition` | M3/M5 shared | inferred 또는 curated schema |
| `transform_spec` | M3 | select/flatten/normalize/aggregate/load 의도 |
| `runtime_config` | M2 | Spark/local resource/output settings |
| `run_id` | M5 | run/output/lineage 연결 키 |
| `output_root` | M5/M2 shared | local/minio/s3 output prefix 기준 |

### Runner input 체크리스트

- [ ] `workflow_definition`은 기존 `contracts/workflow_definition.sample.json`과 호환된다.
- [ ] `source_config`는 M1 화면 입력만이 아니라 M3/M4 source options를 담을 수 있다.
- [ ] `schema_definition`은 M3가 만든 inferred/curated schema facts를 담는다.
- [ ] `transform_spec`는 select/flatten/normalize/aggregate/load 의도를 표현한다.
- [ ] `runtime_config`는 M2가 소유하고 Spark/local output convention을 담는다.
- [ ] `run_id`는 M5가 생성하고 output path, run history, lineage에 같이 사용한다.
- [ ] `output_root`는 runner가 임의로 만들지 않고 M5/M2 boundary에서 받는다.

### Runner output

runner는 현재 `Week2RunnerResult`와 호환되는 값을 반환한다.

| 필드 | 의미 |
| --- | --- |
| `status` | 실행 상태 |
| `task_results` | node/task 단위 결과 |
| `logs` | 실행 로그 요약 |
| `row_count` | primary input rows processed |
| `bytes` | primary input bytes read |
| `duration_ms` | 실행 시간 |
| `output_path` | output location |
| `output_row_count` | output dataset rows |
| `output_bytes` | output dataset bytes |

M5는 이 결과를 `ExecutionResult`와 Catalog update로 연결한다.

### Runner output 체크리스트

- [ ] `status`는 M5가 성공/실패/fallback을 판단할 수 있는 값이다.
- [ ] `task_results`는 node/task별 row_count, bytes, error를 담는다.
- [ ] `logs`는 M1 화면과 report에서 읽을 수 있는 요약이다.
- [ ] `row_count`와 `bytes`는 primary input 기준이다.
- [ ] `output_row_count`와 `output_bytes`는 output dataset 기준이다.
- [ ] `output_path`는 M5 Catalog metadata에 들어갈 수 있는 경로다.
- [ ] runner 실패 시에도 M5 run history에 남길 수 있는 result shape를 반환한다.

## PR #105 처리 기준

PR #105는 닫힌 PR이고 그대로 merge하지 않는다. 이유는 JSON inspect/profile 로직은 유용하지만, source catalog UI/API와 `Week2WorkflowService` 변경까지 함께 들어 있어 Phase 6 runner boundary 전에 병합하면 M1/M3/M5 책임이 다시 섞이기 때문이다.

회수 후보:

- JSON/JSONL/gzip read
- top-level array와 JSONL sampled read
- nested object flatten
- field type inference
- nullable/missing count
- target column name 충돌 해소
- sample value 제한

이번 분석 대표 path에서 제외:

- broad source catalog registration UI
- recommendation bundle UI polish
- source catalog API 전면 확장
- M5 workflow code와 직접 결합한 JSON runner 변경
- Taxi/Kafka까지 포함하는 범용 ETL framework

회수 방식은 작게 가져오는 것이다. 먼저 M3 쪽에서 JSON inspection/profile 테스트를 만들고, 필요한 함수만 adapter로 옮긴다. UI와 source catalog 확장은 분석 대표 path가 한 번 닫힌 뒤 별도 slice로 다룬다.

## 다음 병렬 구현 순서

| 순서 | workstream | 완료 기준 |
| --- | --- | --- |
| 1 | M3 JSON TransformSpec | Amazon Reviews JSON sample에서 profile/schema facts와 minimal `TransformSpec` 생성 |
| 2 | M2 RuntimeConfig/SparkRunner smoke | Spark read/write smoke가 `Week2RunnerResult` 호환 metrics 반환 |
| 3 | M5 runner selection | local runner baseline 유지, 선택형 SparkRunner adapter 선택 가능 |
| 4 | M6 Catalog-backed query | fixture catalog 대신 M5 Catalog metadata를 evidence source로 사용 |
| 5 | M1 analysis path UI | run/catalog/query/evidence 상태를 한 흐름으로 표시 |

M3와 M2는 병렬로 시작할 수 있다. M5 runner selection은 M2/M3의 첫 smoke 결과를 보고 연결한다. M6와 M1은 M5의 API/result shape가 안정된 뒤 붙이는 것이 좋다.

## 병렬 구현 시작 조건

- M3 branch는 JSON sample, profile/schema facts, minimal `TransformSpec` 테스트부터 시작한다.
- M2 branch는 Spark read/write smoke와 `RuntimeConfig` fixture부터 시작한다.
- M5 branch는 local runner baseline을 깨지 않는 adapter selection 테스트부터 시작한다.
- shared contract를 바꾸려면 `docs/03-interface-reference.md` 또는 `contracts/*.sample.json` 변경을 별도 PR로 분리한다.
- 병렬 branch는 서로 직접 merge하지 않고, M5 integration point에서 result shape를 맞춘다.

## 팀원이 확인할 세부 문서

| 알고 싶은 것 | 문서 |
| --- | --- |
| 전체 책임 분리 | `revised-nonoverlap-responsibility.md` |
| 기존 구현 위 전환 순서 | `implementation-transition-plan.md` |
| AI Query/분석 대표 path | `main-e2e-path.md` |
| 보존할 기존 구현 | `existing-implementation-anchor.md` |
| M3 JSON/PR #105 처리 | `m3-json-main-path-decision.md` |
| M2/M3/M5 runner boundary | `runner-boundary-decision.md` |
