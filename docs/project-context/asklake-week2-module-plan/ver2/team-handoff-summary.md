# AskLake Week2 ver2 팀 공유 요약

## 먼저 읽을 결론

Week2 분업은 이제 초기 회의안 그대로가 아니라 ver2 기준으로 진행한다.

핵심은 단순하다.

```text
Amazon Reviews JSON
-> M3 profile/schema/TransformSpec
-> M5 Workflow/local runner/Catalog
-> M6 AI Query
-> M1 UI
```

M2 SparkRunner와 M4 Kafka는 중요하지만, 발표 필수 main path를 막는 선행 조건은 아니다. 먼저 기존 M5 local runner로 E2E를 닫고, SparkRunner는 runner boundary 뒤에 붙인다.

## 현재 진행 상태

| 구분 | 상태 | 팀원이 알면 되는 것 |
| --- | --- | --- |
| 책임 분리 ver2 | 완료 | M1~M6 소유권을 다시 나눴고, Spark/Catalog/ETL 중복 구현을 금지했다. |
| 기존 구현 전환 계획 | 완료 | rewrite가 아니라 기존 M1/M4/M5/M6 구현 위에 adapter-first로 얹는다. |
| main E2E path | 완료 | 발표 필수 경로는 Amazon Reviews JSON 중심이다. |
| 기존 구현 anchor | 완료 | M5 workflow/catalog, M4 Kafka demo, M6 skeleton, M1 shell은 보존한다. |
| M3 JSON path | 완료 | PR #105는 바로 merge하지 않고 JSON inspect/profile 로직만 source material로 회수한다. |
| runner boundary | 완료 | M2 SparkRunner, M3 TransformSpec, M5 runner selection이 공유할 input/output 기준을 정했다. |

이제 M2/M3/M5 병렬 구현을 시작할 수 있다.

## 모듈별 지금 할 일

| 모듈 | 역할 | 지금 할 일 | 하지 말 것 |
| --- | --- | --- | --- |
| M1 | UI/API Gateway | M5/M6 API 결과를 run/catalog/query/evidence 화면에 연결한다. | schema, ETL, runner 선택을 결정하지 않는다. |
| M2 | Lakehouse Runtime Platform | `RuntimeConfig`와 `SparkRunner` smoke를 만든다. `Week2RunnerResult` 호환 metrics를 반환한다. | transformation semantics를 정의하지 않는다. |
| M3 | Data Processing Spec + ETL Logic | Amazon Reviews JSON inspect/profile/schema facts와 최소 `TransformSpec`를 만든다. | Spark session/config/output convention을 직접 만들지 않는다. |
| M4 | Kafka Ingestion | Kafka replay demo와 raw event evidence를 유지하고, 필요 시 M3가 읽을 raw event contract를 정리한다. | main path 필수 선행 조건으로 Kafka streaming to Gold를 만들지 않는다. |
| M5 | Workflow Runtime + Catalog | `Week2WorkflowService` 중심 runner selection과 Catalog persistence를 유지/확장한다. | ETL 내부 변환 로직이나 Spark runtime을 소유하지 않는다. |
| M6 | Semantic/RAG/AI Query | fixture-only query에서 M5 Catalog-backed query로 전환한다. | Catalog 저장소/API나 원본 ETL을 소유하지 않는다. |

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

## PR #105 처리 기준

PR #105는 닫힌 PR이고 그대로 merge하지 않는다.

회수 후보:

- JSON/JSONL/gzip read
- top-level array와 JSONL sampled read
- nested object flatten
- field type inference
- nullable/missing count
- target column name 충돌 해소
- sample value 제한

이번 main path에서 제외:

- broad source catalog registration UI
- recommendation bundle UI polish
- source catalog API 전면 확장
- M5 workflow code와 직접 결합한 JSON runner 변경
- Taxi/Kafka까지 포함하는 범용 ETL framework

## 다음 병렬 구현 순서

| 순서 | workstream | 완료 기준 |
| --- | --- | --- |
| 1 | M3 JSON TransformSpec | Amazon Reviews JSON sample에서 profile/schema facts와 minimal `TransformSpec` 생성 |
| 2 | M2 RuntimeConfig/SparkRunner smoke | Spark read/write smoke가 `Week2RunnerResult` 호환 metrics 반환 |
| 3 | M5 runner selection | local runner baseline 유지, optional SparkRunner adapter 선택 가능 |
| 4 | M6 Catalog-backed query | fixture catalog 대신 M5 Catalog metadata를 evidence source로 사용 |
| 5 | M1 main path UI | run/catalog/query/evidence 상태를 한 흐름으로 표시 |

M3와 M2는 병렬로 시작할 수 있다. M5 runner selection은 M2/M3의 첫 smoke 결과를 보고 연결한다.

## 팀원이 확인할 세부 문서

| 알고 싶은 것 | 문서 |
| --- | --- |
| 전체 책임 분리 | `revised-nonoverlap-responsibility.md` |
| 기존 구현 위 전환 순서 | `implementation-transition-plan.md` |
| 발표 필수 E2E path | `main-e2e-path.md` |
| 보존할 기존 구현 | `existing-implementation-anchor.md` |
| M3 JSON/PR #105 처리 | `m3-json-main-path-decision.md` |
| M2/M3/M5 runner boundary | `runner-boundary-decision.md` |
