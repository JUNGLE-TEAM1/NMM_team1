# AskLake Week2 ver2 구현 전환 계획

## 목적

이 문서는 ver2 책임 분리를 기존 main 구현 위에 안전하게 얹기 위한 전환 계획이다.

ver2는 rewrite 계획이 아니다. 이미 main에 들어간 M1 UI shell, M4 Kafka replay demo, M5 workflow/catalog, M6 AI query skeleton을 유지하고, 그 위에 M2 runtime과 M3 transformation spec/job logic을 adapter-first 방식으로 붙인다.

## 전환 원칙

- 기존 구현을 먼저 anchor로 선언하고, 새 책임을 그 주변에 붙인다.
- M5 `Week2WorkflowService`를 중심 통합점으로 유지한다.
- M3 transformation spec/job logic은 기존 `Week2LocalRunner`를 한 번에 대체하지 않는다.
- M2 Spark runtime은 M3/M4 내부로 들어가지 않고 `SparkRunner` 또는 runtime adapter 뒤에 붙는다.
- M2 `SparkRunner`는 Taxi 전용 구현이 아니다. 입력 format/path/options를 `RuntimeConfig`로 받고, Amazon Reviews JSON이든 TLC NYC Taxi Parquet이든 같은 result shape를 반환하는 공통 실행기로 둔다.
- M6는 fixture catalog 기반 skeleton을 유지하되, 후속 작업에서 M5 Catalog store/API를 읽기 전용으로 소비하고 SQL MVP부터 닫도록 전환한다.
- M4 Kafka replay demo는 버리지 않고 raw event contract/evidence로 흡수한다.

## 유지할 기존 구현

| 영역 | 유지할 구현 | 이유 | 전환 방식 |
| --- | --- | --- | --- |
| M1 UI | `frontend/src/app/*`, catalog/source/pipeline 화면 | 발표 클릭 흐름과 UI shell이 이미 있다. | M5/M6 API 상태를 표시하는 쪽으로 확장 |
| M4 Kafka | `scripts/kafka_replay_to_parquet_demo.py`, `docs/manual-verification/08-kafka-replay-parquet-demo.md` | Kafka raw replay와 Parquet evidence가 있다. | raw event contract/evidence로 유지 |
| M5 Workflow/Catalog | `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore`, `/api/week2/*` | 실행, fallback, Catalog 저장/API가 가장 많이 구현되어 있다. | runner boundary를 넓혀 M3/M2를 붙임 |
| M6 Semantic/RAG-lite/AI Query | `Week2AIQueryService`, `SqlEngineAdapter`, fake SQL engine | query skeleton과 guardrail shape가 있지만 실제 SQL은 아직 fake/template 수준이다. | Catalog source를 fixture에서 M5 Catalog로 전환한 뒤 Amazon Reviews output file SQL MVP를 우선 완성 |
| Contracts | `contracts/*.sample.json` | M5/M6 테스트와 demo fixture가 의존한다. | 후속 interface/contracts PR에서만 조정 |

## 버리지 말 것

- `Week2WorkflowService`를 새 orchestration service로 대체하지 않는다.
- `Week2LocalRunner`를 즉시 제거하지 않는다.
- `Week2CatalogStore`를 후속 DB 구현 전까지 제거하지 않는다.
- M4 Kafka script를 Spark Streaming 구현으로 즉시 교체하지 않는다.
- M6 fake SQL skeleton을 real SQL로 한 번에 갈아엎지 않는다. Adapter 경계 뒤에서 SQL MVP, planner 강화, RAG, LLM 순서로 단계화한다.

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
  -> M6 Catalog-backed Semantic/RAG-lite/AI Query
```

## 단계별 전환 순서

| 순서 | 작업 | 책임 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | M5 existing implementation anchor 확인 | M5 | `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore` 유지 선언 |
| 2 | Analysis representative E2E path 고정 | M1/M2/M3/M5/M6 | 5GB raw/bronze input -> `gold_product_health` -> Semantic/RAG-lite/AI Query 분석 대표 경로로 확정 |
| 3 | M3 product health transform decision | M3 | PR #105 회수/재구현 범위, `gold_product_health` schema, `TransformSpec` 최소 shape 결정 |
| 4 | Runner boundary decision | M2/M3/M5 | local runner, M3 job logic, SparkRunner가 공유할 호출 계약 결정 |
| 5 | M2 RuntimeConfig/SparkRunner smoke | M2 | dataset-independent Spark read/write smoke가 row_count/bytes/duration/output_path를 같은 result shape로 반환 |
| 6 | M5 runner selection | M5 | local runner와 SparkRunner를 선택/호출할 수 있음 |
| 7 | M6 SQL-first Catalog query | M6/M5 | fixture catalog/fake SQL 대신 M5 CatalogMetadata를 읽기 전용으로 소비하고 `gold_product_health` output file을 SQL로 조회 |
| 8 | M1 UI 연결 | M1 | run/catalog/query/evidence 상태 표시 |

## 분석 대표 E2E 후보

병렬 구현 시작 전 Semantic/RAG-lite/AI Query 분석 대표 경로는 다음 Phase에서 확정하지만, 현재 기준 후보는 아래와 같다.

```text
reviews_seed + behavior_events_seed + delivery_trips_seed + product_master_seed
-> M3 profile/schema/transform spec
-> M2 runtime/Spark read-write
-> bronze/silver
-> gold_product_health
-> M5 Catalog
-> M6 SQL-first Semantic/RAG-lite/AI Query
-> M1 UI
```

5GB 처리는 별도 Taxi evidence가 아니라 `gold_product_health` 생성 pipeline의 input 규모 기준이다. Kafka는 1차 blocker가 아니며 2차 이후 behavior replay evidence 또는 3차 streaming evidence로 둔다.

## 모듈별 다음 작업

| 모듈 | 다음 작업 | 병렬 가능 조건 |
| --- | --- | --- |
| M1 | M5/M6 API 상태 표시 준비 | 분석 대표 path와 API shape 확정 후 |
| M2 | 데이터셋 독립 `RuntimeConfig`와 SparkRunner smoke, 5GB fact input read/write evidence 설계 | runner boundary 결정 후 |
| M3 | `gold_product_health` 분석 대표 path와 PR #105 회수 여부 결정 | 분석 대표 path 확정 후 |
| M4 | Kafka raw event contract와 streaming ingestion evidence 정리 | M3가 필요한 raw event shape를 확정한 뒤 |
| M5 | runner boundary와 Catalog handoff 유지 | Phase 6 runner boundary 결정 후 |
| M6 | M5 Catalog store/API 읽기 전용 소비와 SQL MVP 계획 | Catalog source boundary 확인 후 |

## 하지 말 것

- M2/M3/M4가 각자 Spark session/config/output convention을 만들지 않는다.
- M2가 `TaxiRunner`, `AmazonReviewRunner`처럼 데이터셋별 실행기를 따로 만들지 않는다. 차이는 code branch가 아니라 `RuntimeConfig`의 입력 format/path/options로 처리한다.
- M3가 runtime/storage/Spark session까지 떠안지 않는다. M3는 `gold_product_health` schema와 transform semantics를 소유한다.
- M5를 전면 rewrite하지 않는다.
- `contracts/*.sample.json`을 ver2 문서 작업만으로 즉시 바꾸지 않는다.
- RAG/LLM을 SQL MVP보다 먼저 구현하지 않는다.
- Iceberg를 발표 범위로 되살리지 않는다.

## Phase 2 완료 기준

- 기존 구현 중 유지할 anchor가 명시되어 있다.
- ver2가 rewrite 계획이 아님을 명시한다.
- adapter-first 전환 순서가 명시되어 있다.
- 다음 Phase인 Semantic/RAG-lite/AI Query 분석 대표 path 확정의 입력이 준비되어 있다.
