# AskLake Week2 ver2 구현 전환 계획

## 목적

이 문서는 ver2 책임 분리를 기존 main 구현 위에 안전하게 얹기 위한 전환 계획이다.

ver2는 rewrite 계획이 아니다. 이미 main에 들어간 M1 UI shell, M4 Kafka replay demo, M5 workflow/catalog, M6 AI query skeleton을 유지하고, 그 위에 M2 runtime과 M3 transformation spec/job logic을 adapter-first 방식으로 붙인다.

## 전환 원칙

- 기존 구현을 먼저 anchor로 선언하고, 새 책임을 그 주변에 붙인다.
- M5 `Week2WorkflowService`를 중심 통합점으로 유지한다.
- M3 transformation spec/job logic은 기존 `Week2LocalRunner`를 한 번에 대체하지 않는다.
- M2 Spark runtime은 M3/M4 내부로 들어가지 않고 `SparkRunner` 또는 runtime adapter 뒤에 붙는다.
- M6는 fixture catalog 기반 skeleton을 유지하되, 후속 작업에서 M5 Catalog store/API를 소비하도록 전환한다.
- M4 Kafka replay demo는 버리지 않고 raw event contract/evidence로 흡수한다.

## 유지할 기존 구현

| 영역 | 유지할 구현 | 이유 | 전환 방식 |
| --- | --- | --- | --- |
| M1 UI | `frontend/src/app/*`, catalog/source/pipeline 화면 | 발표 클릭 흐름과 UI shell이 이미 있다. | M5/M6 API 상태를 표시하는 쪽으로 확장 |
| M4 Kafka | `scripts/kafka_replay_to_parquet_demo.py`, `docs/manual-verification/08-kafka-replay-parquet-demo.md` | Kafka raw replay와 Parquet evidence가 있다. | raw event contract/evidence로 유지 |
| M5 Workflow/Catalog | `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore`, `/api/week2/*` | 실행, fallback, Catalog 저장/API가 가장 많이 구현되어 있다. | runner boundary를 넓혀 M3/M2를 붙임 |
| M6 AI Query | `Week2AIQueryService`, `SqlEngineAdapter`, fake SQL engine | query skeleton과 guardrail shape가 있다. | Catalog source를 fixture에서 M5 Catalog로 전환 |
| Contracts | `contracts/*.sample.json` | M5/M6 테스트와 demo fixture가 의존한다. | 후속 interface/contracts PR에서만 조정 |

## 버리지 말 것

- `Week2WorkflowService`를 새 orchestration service로 대체하지 않는다.
- `Week2LocalRunner`를 즉시 제거하지 않는다.
- `Week2CatalogStore`를 후속 DB 구현 전까지 제거하지 않는다.
- M4 Kafka script를 Spark Streaming 구현으로 즉시 교체하지 않는다.
- M6 fake SQL skeleton을 real SQL로 한 번에 갈아엎지 않는다.

## 전환 대상 경계

```text
현재:
Week2WorkflowService
  -> Week2LocalRunner
      -> source read / select / normalize / aggregate / load
  -> Week2CatalogStore
  -> Week2AIQueryService fixture catalog

전환:
Week2WorkflowService
  -> Runner boundary
      -> existing Week2LocalRunner
      -> M3 TransformSpec/JobLogic adapter
      -> M2 SparkRunner adapter
  -> Week2CatalogStore
  -> M6 Catalog-backed AI Query
```

## 단계별 전환 순서

| 순서 | 작업 | 책임 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | M5 existing implementation anchor 확인 | M5 | `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore` 유지 선언 |
| 2 | Analysis representative E2E path 고정 | M1/M3/M5/M6 | Amazon Reviews JSON path를 AI Query/분석 대표 경로로 확정 |
| 3 | M3 JSON analysis path decision | M3 | PR #105 회수/재구현 범위와 `TransformSpec` 최소 shape 결정 |
| 4 | Runner boundary decision | M2/M3/M5 | local runner, M3 job logic, SparkRunner가 공유할 호출 계약 결정 |
| 5 | M2 RuntimeConfig/SparkRunner smoke | M2 | Spark read/write smoke가 row_count/bytes/duration을 반환 |
| 6 | M5 runner selection | M5 | local runner와 SparkRunner를 선택/호출할 수 있음 |
| 7 | M6 Catalog source 전환 | M6/M5 | fixture catalog 대신 M5 Catalog store/API를 소비 |
| 8 | M1 UI 연결 | M1 | run/catalog/query/evidence 상태 표시 |

## 분석 대표 E2E 후보

병렬 구현 시작 전 AI Query/분석 대표 경로는 다음 Phase에서 확정하지만, 현재 추천 후보는 아래와 같다.

```text
Amazon Reviews JSON
-> M3 profile/schema/transform spec
-> M5 workflow/local runner
-> M5 Catalog
-> M6 AI Query
-> M1 UI
```

Taxi와 Kafka는 선택 사항이 아니다. 각각 정형 batch와 streaming ingestion의 필수 처리/evidence 경로로 완료하되, M6 분석 대표 경로의 필수 선행 조건으로 두지는 않는다.

## 모듈별 다음 작업

| 모듈 | 다음 작업 | 병렬 가능 조건 |
| --- | --- | --- |
| M1 | M5/M6 API 상태 표시 준비 | 분석 대표 path와 API shape 확정 후 |
| M2 | `RuntimeConfig`와 SparkRunner smoke, Taxi/정형 batch evidence 설계 | runner boundary 결정 후 |
| M3 | Amazon Reviews JSON 분석 대표 path와 PR #105 회수 여부 결정 | 분석 대표 path 확정 후 |
| M4 | Kafka raw event contract와 streaming ingestion evidence 정리 | M3가 필요한 raw event shape를 확정한 뒤 |
| M5 | runner boundary와 Catalog handoff 유지 | Phase 6 runner boundary 결정 후 |
| M6 | M5 Catalog store/API 소비 계획 | Catalog source boundary 확인 후 |

## 하지 말 것

- M2/M3/M4가 각자 Spark session/config/output convention을 만들지 않는다.
- M3가 Taxi/Kafka까지 완전한 ETL을 한 번에 떠안지 않는다.
- M5를 전면 rewrite하지 않는다.
- `contracts/*.sample.json`을 ver2 문서 작업만으로 즉시 바꾸지 않는다.
- Iceberg를 발표 범위로 되살리지 않는다.

## Phase 2 완료 기준

- 기존 구현 중 유지할 anchor가 명시되어 있다.
- ver2가 rewrite 계획이 아님을 명시한다.
- adapter-first 전환 순서가 명시되어 있다.
- 다음 Phase인 AI Query/분석 대표 path 확정의 입력이 준비되어 있다.
