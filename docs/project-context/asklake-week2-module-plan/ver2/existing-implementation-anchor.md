# AskLake Week2 ver2 Existing Implementation Anchor

## 목적

이 문서는 Week2 ver2 분업을 시작하기 전에 이미 main에 들어간 구현 중 유지하고 흡수할 범위를 고정한다.

ver2는 rewrite 계획이 아니다. Phase 4의 기준은 기존 구현을 삭제하거나 우회하지 않고, M2/M3/M5/M6 후속 작업이 붙을 anchor를 명시하는 것이다.

## Anchor 원칙

- 기존 M5 workflow/catalog 경로를 통합 중심으로 유지한다.
- 기존 M1 UI shell은 발표 클릭 흐름의 화면 anchor로 유지한다.
- 기존 M4 Kafka replay demo는 raw ingestion evidence로 유지한다.
- 기존 M6 AI Query skeleton은 Catalog-backed query로 확장할 query anchor로 유지한다.
- 기존 contract sample은 후속 contract Phase 전까지 깨지지 않게 유지한다.

## 유지할 구현

| 영역 | 유지할 파일/구성 | 보호할 이유 | 후속 흡수 방향 |
| --- | --- | --- | --- |
| M1 UI shell | `frontend/src/app/App.jsx`, `frontend/src/app/m1StaticShellData.js`, `frontend/src/app/styles.css` | 발표 화면과 클릭 흐름이 이미 있다. | M5/M6 API 결과를 표시하도록 확장 |
| M4 Kafka evidence | `scripts/kafka_replay_to_parquet_demo.py`, `docs/manual-verification/08-kafka-replay-parquet-demo.md` | Kafka replay와 Parquet output evidence가 있다. | main path 선행 조건이 아니라 raw ingestion evidence로 유지 |
| M5 Workflow | `backend/app/services/week2_workflow.py`, `backend/app/api/week2_workflow.py` | run trigger/get run/get catalog API의 중심이다. | runner boundary를 넓혀 M3 job logic과 M2 SparkRunner를 호출 |
| M5 local runner | `backend/app/services/week2_local_runner.py` | Amazon Reviews JSON main path를 Spark 없이 먼저 닫을 수 있다. | Phase 6 이후 runner implementation 중 하나로 유지 |
| M5 Catalog store | `backend/app/services/week2_catalog_store.py` | run 결과와 Catalog metadata persistence가 있다. | M6 query source와 M1 catalog UI의 기준 데이터로 사용 |
| M6 AI Query | `backend/app/services/ai_query.py`, `backend/app/api/week2_ai_query.py` | AI Query result shape와 guardrail skeleton이 있다. | fixture-only source에서 M5 Catalog-backed source로 전환 |
| M6 SQL port/fake | `backend/app/ports/sql_engine.py`, `backend/app/fakes/fake_sql_engine.py` | SQL engine adapter seam과 fake engine 테스트 기반이 있다. | real SQL/LLM 전환 전 fake 기반 smoke 유지 |
| Week2 contracts | `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json`, `contracts/ai_query_result.sample.json`, `contracts/source_config.sample.json`, `contracts/schema_definition.sample.json` | backend tests와 demo fixture가 의존한다. | Phase 5/6 결정 뒤 필요한 최소 변경만 별도 PR에서 수행 |
| Existing tests | `backend/tests/test_week2_workflow_catalog.py`, `backend/tests/test_week2_local_runner.py`, `backend/tests/test_week2_ai_query.py` | 현재 run/catalog/query 동작을 보호한다. | runner boundary와 M6 catalog source 변경 시 regression guard로 확장 |

## 삭제 또는 대체 금지

- `Week2WorkflowService`를 새 orchestration service로 대체하지 않는다.
- `Week2LocalRunner`를 SparkRunner로 즉시 제거하지 않는다.
- `Week2CatalogStore`를 DB 전환 전 삭제하지 않는다.
- `Week2AIQueryService`와 `SqlEngineAdapter` skeleton을 real LLM/SQL 구현으로 한 번에 갈아엎지 않는다.
- M4 Kafka replay demo를 Spark Streaming 구현으로 즉시 교체하지 않는다.
- contract sample을 docs-only Phase에서 변경하지 않는다.

## 후속 모듈이 붙는 방식

| 모듈 | 붙는 위치 | 주의점 |
| --- | --- | --- |
| M2 | Phase 6 runner boundary 뒤 `SparkRunner` implementation으로 M5에 연결 | M2가 transformation semantics를 정의하지 않는다. |
| M3 | Amazon Reviews JSON profile/schema/transform spec을 만들고 M5 runner boundary로 전달 | M3가 Spark session/config/output convention을 직접 소유하지 않는다. |
| M5 | 기존 workflow/catalog를 유지하며 runner selection과 result persistence를 담당 | 기존 API와 tests를 깨지 않게 확장한다. |
| M6 | M5 Catalog store/API를 query evidence source로 소비 | 기존 fake SQL skeleton을 유지하면서 source만 점진 전환한다. |
| M1 | M5/M6 상태를 화면에 연결 | UI shell을 버리지 않고 data binding을 늘린다. |

## 보호할 테스트 기준

후속 구현 PR은 최소한 아래 테스트의 의미를 보존해야 한다.

- `test_week2_workflow_run_returns_execution_result_contract`
- `test_week2_catalog_metadata_tracks_successful_run_lineage`
- `test_week2_run_and_catalog_survive_service_restart`
- `test_week2_local_runner_executes_supported_nodes_in_order`
- `test_week2_ai_query_returns_fixture_backed_ai_query_result`

테스트 이름은 후속 구현에서 바뀔 수 있지만, run result contract, catalog lineage, persistence, local runner fallback, AI query result shape는 유지되어야 한다.

## Phase 4 완료 기준

- 기존 구현 중 유지할 anchor가 파일 경로 기준으로 명시되어 있다.
- 삭제 또는 대체 금지 범위가 명시되어 있다.
- M2/M3/M5/M6/M1이 기존 구현에 붙는 방식이 명시되어 있다.
- Phase 5/6이 이어받을 보호 대상과 테스트 기준이 준비되어 있다.
