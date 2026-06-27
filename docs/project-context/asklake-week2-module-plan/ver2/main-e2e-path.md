# AskLake Week2 ver2 Product Risk Representative E2E Path

## 목적

이 문서는 Week2 발표와 병렬 구현의 기준이 되는 상품 리스크 분석 대표 E2E path를 하나로 고정한다.

Phase 2의 구현 전환 계획은 기존 구현을 유지한 채 adapter-first로 전환하는 방향을 정했다. 이후 Week2 발표 기준은 Amazon Reviews JSON을 버리지 않고, 상품/리뷰/행동/배송 fact input을 연결해 `gold_product_health`를 만드는 방향으로 확장한다.

Week2 전체 데이터 경로는 reviews fact, behavior fact, delivery fact, product dimension, Kafka replay/streaming evidence로 재정렬한다. 이 문서는 그중 M6 분석까지 우선 연결할 대표 경로와 5GB 이상 input 처리 기준을 정의한다.

## 확정 경로

```text
reviews_seed
+ behavior_events_seed
+ delivery_trips_seed
+ product_master_seed
-> M3 profile/schema/TransformSpec
-> M2 runtime/Spark read-write over raw/bronze fact input
-> bronze partitioned Parquet
-> silver metrics
-> gold_product_health
-> M5 WorkflowDefinition / ExecutionResult
-> M5 Catalog
-> M6 SQL MVP / Semantic retrieval / RAG-lite evidence / AI Query
-> M1 UI
```

이 경로는 발표에서 반드시 동작해야 하는 상품 리스크 분석 대표 end-to-end 흐름이다. 1차 목표부터 `input_total_bytes >= 5GB` evidence를 `gold_product_health` 생성 pipeline에 연결한다. Gold output 자체가 5GB일 필요는 없으며, 상품별 집계 결과가 원천보다 작아지는 것이 정상이다.

## 모듈별 책임

| 모듈 | 분석 대표 path 책임 | 완료 기준 |
| --- | --- | --- |
| M1 | run/catalog/query/evidence 상태와 위험 상품군 근거를 클릭 흐름으로 보여준다. | 5GB input run evidence, `dataset_product_health_gold`, M6 query 결과를 화면에서 확인할 수 있다. |
| M2 | 대용량 raw/bronze fact input을 읽고 쓰는 runtime/storage/Spark execution evidence를 만든다. | `input_total_bytes >= 5GB`, source별 row_count/bytes/duration_ms/output_path가 남는다. |
| M3 | `gold_product_health` schema, bronze/silver/gold transform, `risk_score` semantics를 만든다. | reviews/behavior/delivery/product input에서 `gold_product_health`가 생성된다. |
| M5 | `WorkflowDefinition`을 받아 runner를 실행하고 ExecutionResult/CatalogMetadata/lineage를 저장/노출한다. | run 결과와 Catalog entry가 같은 `run_id`/dataset context로 이어진다. |
| M6 | M5 Catalog를 읽기 전용으로 소비해 Gold SQL planner/guardrail, 실제 SQL MVP, CatalogMetadata retrieval, RAG-lite evidence grounding, `AIQueryResult`를 응답 경로에 연결한다. | fixture-only/fake SQL 설명이 아니라 `gold_product_health` output file과 evidence를 근거로 답한다. |

## 데이터 경로의 위치

5GB 처리는 Taxi 별도 evidence가 아니라 `gold_product_health` 생성 대표 경로의 input 규모 기준이다. Kafka Event는 1차 blocker가 아니며, 2차 이후 behavior replay evidence 또는 3차 streaming evidence로 둔다.

| 영역 | Week2 역할 | M6 분석 대표 경로와의 관계 |
| --- | --- | --- |
| Amazon Reviews JSON / reviews_seed | 고객 반응과 평점 fact input | `gold_product_health`의 리뷰 지표를 만든다. |
| behavior_events_seed | view/cart/purchase fact input | `conversion_rate`와 행동 지표를 만든다. |
| delivery_trips_seed | 배송 경험 fact input | `late_delivery_rate`와 배송 지표를 만든다. |
| product_master_seed | 상품 dimension | product/category/name 기준축을 제공한다. |
| Kafka Event / streaming ingestion | behavior replay/streaming evidence | 1차 blocker가 아니며 2차 이후 evidence로 붙인다. |

## 데이터셋 기준

분석 대표 path의 첫 Gold는 `gold_product_health`다. 입력 source는 reviews/behavior/delivery fact와 product dimension으로 나눈다.

- JSON/JSONL raw를 읽을 수 있어야 한다.
- 5GB 이상 input은 raw JSONL 직독만 고집하지 않고 raw -> bronze partitioned Parquet -> silver metrics -> Gold 구조로 처리한다.
- M3는 `negative_review_rate`, `conversion_rate`, `late_delivery_rate`, `risk_score` semantics를 소유한다.
- M2는 source별 `row_count`, `bytes`, `duration_ms`, `input_path`, bronze/silver/gold `output_path`, runtime mode evidence를 남긴다.
- output은 M5 Catalog와 M6 SQL/RAG-lite/AI Query가 읽을 수 있는 metadata facts를 남긴다.

Kafka Event는 1차 대표 path의 선행 조건으로 만들지 않는다.

- 2차 이후 behavior event replay evidence를 붙인다.
- 3차에서 streaming evidence 또는 50GB scale path와 연결할 수 있다.
- Kafka replay/ingestion, throughput, lag, restart/replay evidence는 M4가 소유한다.

## 발표 성공 조건

1. 사용자가 M1에서 demo source 또는 run을 선택한다.
2. M5가 `gold_product_health` workflow를 실행하거나 사전 실행 결과를 조회한다.
3. ExecutionResult에 `input_total_bytes >= 5GB`와 source별 row_count/bytes/duration/output path가 남아 있다.
4. M5 Catalog에서 `dataset_product_health_gold`의 dataset/run/output metadata를 확인할 수 있다.
5. M6가 Catalog metadata의 `storage.local_fallback_path`, `query.table_name`, `query.allowed_columns`, `query.default_limit`을 읽어 실제 SQL MVP를 실행하고 evidence와 함께 질문에 답한다.
6. M1이 run, catalog, query, evidence, 위험 상품군 근거를 한 흐름으로 보여준다.

## M6 SQL-first 빌드업 기준

M6 최종 방향은 RAG/LLM 포함 완성형이지만, 2주차 후속 실행 범위는 `gold_product_health` SQL MVP 완성으로 제한한다.

1. 현재 M6는 CatalogMetadata 선택, template SQL, SQL engine adapter, evidence grounding skeleton을 갖는다.
2. 다음 M6 slice는 `dataset_product_health_gold` CatalogMetadata를 기준으로 실제 Gold output file을 SQL로 조회한다.
3. M6는 M5 CatalogMetadata를 수정하지 않고 읽기만 한다.
4. RAG/LLM 확장은 SQL MVP 이후 `SQL Planner 강화 -> 응답 계약 보강 -> CatalogMetadata 기반 RAG -> Hybrid query -> 외부 LLM 답변 생성 -> M1 evidence 표시 연동` 순서로 진행한다.

## 제외 범위

- 5GB를 별도 Taxi evidence로만 설명하지 않는다. 5GB는 `gold_product_health` 생성 main input 기준이다.
- Gold output 파일이 5GB라고 말하지 않는다. 상품별 집계 Gold는 작아지는 것이 정상이다.
- Kafka streaming to Gold를 1차 대표 path의 선행 조건으로 만들지 않는다.
- 50GB input 처리는 3차 확장 목표이며, 100GB는 후속 확장 후보로만 둔다.
- real LLM, 외부 vector DB, full document RAG, 대규모 indexing, 범용 NL2SQL, Iceberg는 이번 분석 대표 path에 포함하지 않는다.
- SQL MVP 이전에 RAG/LLM을 먼저 붙이지 않는다.
- CatalogMetadata 기반 semantic retrieval, dataset selection evidence, RAG-lite grounding은 M6 기본 책임에 포함한다.
- M3가 Spark session/runtime config를 직접 소유하지 않는다.

## 후속 Phase 연결

| 후속 Phase | 이 문서가 넘기는 결정 |
| --- | --- |
| Phase 4 Existing implementation anchor | 기존 M5 workflow/catalog와 M6 SQL/query skeleton을 분석 대표 path anchor로 보호한다. |
| Phase 5 M3 product health transform decision | `gold_product_health` schema, silver/gold transform, `risk_score` 최소 범위를 구체화한다. |
| Phase 6 M5 runner boundary decision | local runner, M3 job logic, M2 SparkRunner가 공유할 호출 계약을 확정한다. |

## Phase 3 완료 기준

- 상품 리스크 분석 대표 path가 `gold_product_health`로 고정되어 있다.
- 5GB 이상 raw/bronze fact input이 `gold_product_health` 생성 main pipeline 기준임을 명시한다.
- Kafka가 1차 대표 path의 선행 조건은 아님을 명시한다.
- M1/M2/M3/M5/M6의 분석 대표 path 책임과 완료 기준이 명시되어 있다.
- Phase 4~6이 이어받을 결정 입력이 준비되어 있다.
