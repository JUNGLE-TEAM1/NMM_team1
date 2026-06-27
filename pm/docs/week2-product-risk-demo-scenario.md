# Week2 상품 리스크 분석 MVP 확장안

작성 기준일: 2026-06-27

## 1. 개요

이 문서는 Week2 발표와 최종 MVP 후보를 `자사 쇼핑몰 상품 리스크 분석` 방향으로 확장하기 위한 PM 기획안이다. AskLake는 상품, 리뷰, 행동, 배송 데이터를 연결하고, 5GB 이상 raw/bronze fact input을 처리해 상품 단위 Gold 데이터셋인 `gold_product_health`를 생성한다. 운영자는 M5 Catalog에 등록된 Gold를 M6 SQL/AI Query와 M1 UI로 조회해 위험 상품군과 판단 근거를 확인한다.

이 문서는 기존 Source of Truth를 즉시 대체하지 않는다. 먼저 단일 PM 확장안으로 관리하고, 구현/검증이 닫힌 뒤 필요한 Source of Truth에 반영한다.

## 2. 기존 Week2 기준과의 관계

기존 Week2 대표 경로는 아래와 같다.

```text
Amazon Reviews JSON
-> M3 profile/schema/TransformSpec
-> M5 Workflow/Catalog
-> M6 SQL/RAG-lite/AI Query
-> M1 UI
```

확장 대표 경로는 아래와 같다.

```text
reviews_seed
+ behavior_events_seed
+ delivery_trips_seed
+ product_master_seed
-> bronze partitioned Parquet
-> silver metrics
-> gold_product_health
-> M5 Catalog
-> M6 SQL/AI Query
-> M1 UI
```

이 확장은 Amazon Reviews 경로를 버리는 것이 아니다. Amazon Reviews는 `reviews_seed`로 유지하되, 단순 리뷰 분석이 아니라 상품 리스크 Gold를 만드는 핵심 리뷰 fact input으로 승격한다.

Taxi/Kafka의 위치는 다음처럼 재정의한다.

| 영역 | 기존 위치 | 확장안의 위치 |
| --- | --- | --- |
| Amazon Reviews | 분석 대표 경로 | `gold_product_health`의 리뷰 fact input |
| Taxi/배송성 데이터 | 별도 batch evidence | `delivery_trips_seed` 또는 50GB scale 준비 맥락 |
| Kafka | 별도 streaming evidence | 1차 blocker 아님. 2차 이후 behavior replay, 3차 streaming evidence |
| 5GB 처리 | 보조 처리 증거 후보 | `gold_product_health` 생성 메인 파이프라인의 입력 규모 기준 |

핵심 변경은 5GB를 별도 Taxi evidence로 분리하지 않는 것이다. Week2 1차/중간 목표는 "5GB 이상 raw/bronze input을 읽어 `gold_product_health`를 생성했다"로 정의한다.

## 3. 최종 MVP 시나리오

사용자는 자사 쇼핑몰 상품 운영 담당자다. 이 담당자는 상품 노출 우선순위, 문제 상품군 점검, 판매자 개선 요청, 재점검 우선순위를 정해야 한다.

대표 질문은 다음과 같다.

```text
리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군을 찾아줘.
```

보조 질문은 다음과 같다.

- 리스크 점수가 높은 상품군과 근거를 보여줘.
- 배송 지연율이 높고 평점이 낮은 상품을 찾아줘.
- 조회는 많은데 구매 전환이 낮은 상품을 찾아줘.
- 특정 카테고리에서 위험 상품이 많은지 보여줘.

AskLake는 `gold_product_health`를 SQL로 조회하고, 상품별 `risk_score`, 평점, 부정 리뷰율, 구매 전환율, 배송 지연율, 처리 evidence를 함께 보여준다. 답변의 핵심은 "위험하다"는 판단이 아니라 "왜 위험하다고 판단했는지"를 Gold 지표와 run evidence로 설명하는 것이다.

## 4. `gold_product_health` 정의

`gold_product_health`는 상품 단위 집계 Gold다. 원천 input은 5GB 이상일 수 있지만, Gold output은 상품별 집계 결과이므로 작아지는 것이 정상이다.

최소 컬럼은 다음과 같다.

| 컬럼 | 타입 | 의미 |
| --- | --- | --- |
| `product_id` | string | 상품 식별자 |
| `product_name` | string | 상품명 |
| `category_l1` | string | 1차 카테고리 |
| `category_l2` | string | 2차 카테고리 |
| `review_count` | integer | 리뷰 수 |
| `average_rating` | number | 평균 평점 |
| `negative_review_count` | integer | 부정 리뷰 수 |
| `negative_review_rate` | number | 부정 리뷰율 |
| `view_count` | integer | 조회 이벤트 수 |
| `cart_count` | integer | 장바구니 이벤트 수 |
| `purchase_count` | integer | 구매 이벤트 수 |
| `conversion_rate` | number | 조회 대비 구매 전환율 |
| `delivery_count` | integer | 배송 행 수 |
| `late_delivery_count` | integer | 지연 배송 수 |
| `late_delivery_rate` | number | 지연 배송율 |
| `risk_score` | number | 운영 리스크 점수 |
| `risk_reasons` | array/string | 리스크 근거 요약 |
| `source_review_rows` | integer | 리뷰 source 처리 행 수 |
| `source_behavior_rows` | integer | 행동 source 처리 행 수 |
| `source_delivery_rows` | integer | 배송 source 처리 행 수 |
| `run_id` | string | 생성 run id |
| `updated_at` | timestamp | Gold 생성 시각 |

MVP의 `risk_score`는 단순 가중치 공식으로 둔다.

```text
risk_score =
  0.35 * negative_review_rate
  + 0.25 * low_rating_score
  + 0.25 * conversion_risk
  + 0.15 * late_delivery_rate
```

보조 계산식은 다음과 같다.

```text
low_rating_score = (5 - average_rating) / 4
conversion_risk = 1 - conversion_rate
negative_review_rate = negative_review_count / review_count
conversion_rate = purchase_count / view_count
late_delivery_rate = late_delivery_count / delivery_count
```

`review_count`, `view_count`, `delivery_count`가 0인 경우에는 0 나누기를 피해야 한다. MVP에서는 denominator가 0이면 해당 rate를 0 또는 null로 둘지 M3가 결정하고, M6는 그 의미를 그대로 표시한다.

## 5. 최소 파이프라인 설계

권장 pipeline은 raw JSONL을 바로 끝까지 밀지 않고, bronze partitioned Parquet를 중간 계층으로 둔다.

```text
raw facts
  reviews_seed
  behavior_events_seed
  delivery_trips_seed
  product_master_seed

-> bronze partitioned Parquet
  bronze_reviews
  bronze_behavior
  bronze_delivery
  dim_product_master

-> silver metrics
  silver_review_metrics_by_product
  silver_behavior_metrics_by_product
  silver_delivery_metrics_by_product

-> gold_product_health
```

설계 기준은 다음과 같다.

- 5GB는 `reviews_seed`, `behavior_events_seed`, `delivery_trips_seed` 같은 fact input이 담당한다.
- `product_master_seed`는 dimension table이므로 작아도 된다.
- `input_total_bytes >= 5GB`는 fact input 기준으로 계산한다.
- raw JSONL만 5GB로 직접 처리하면 느리고 불안정할 수 있으므로, raw ingest와 bronze Parquet 변환을 분리한다.
- M6는 raw 5GB를 직접 분석하지 않는다. M6는 M5 Catalog가 가리키는 Gold output을 SQL로 조회한다.
- Gold output이 5GB일 필요는 없다. 상품별 집계 결과는 원천보다 작아지는 것이 정상이다.

## 6. 1차 목표

1차 목표는 작은 데이터 기능 smoke와 5GB input 기반 main pipeline 처리를 모두 닫는 것이다.

### 1차 A: 기능 smoke

작은 입력으로 전체 기능 경로를 먼저 닫는다.

| 항목 | 목표 |
| --- | --- |
| 입력 | 작은 reviews/behavior/delivery/product seed |
| 변환 | bronze/silver/gold 최소 transform |
| Gold | `gold_product_health` 생성 |
| Catalog | M5 Catalog에 `dataset_product_health_gold` 등록 |
| Query | M6가 실제 Gold file을 SQL 조회 |
| UI | M1이 위험 상품군과 근거 표시 |

### 1차 B: 5GB main input 처리

기능 smoke와 같은 transform으로 5GB 이상 input을 처리한다.

완료 기준은 다음과 같다.

- `input_total_bytes >= 5GB`
- source별 `row_count`
- source별 `bytes`
- source별 `duration_ms`
- source별 `input_path`
- bronze output path
- silver output path
- gold output path
- `run_id`
- `gold_product_health` 생성
- M5 Catalog 등록
- M6 실제 Gold SQL 조회
- M1 위험 상품군/근거 표시

1차가 끝나면 발표에서는 다음까지 말할 수 있다.

```text
AskLake는 5GB 이상 raw/bronze input을 처리해 상품 리스크 Gold인 gold_product_health를 생성했고,
이 Gold를 Catalog, SQL, AI Query, UI로 조회할 수 있다.
```

## 7. 2차 목표

2차 목표는 5GB input 기반 `gold_product_health` 파이프라인을 발표 클릭 흐름으로 안정화하는 것이다.

발표 중에는 5GB 처리를 live로 돌리지 않는다. 사전 실행된 run, Catalog, evidence를 보여주고, SQL query와 UI 조회만 live로 한다.

완료 기준은 다음과 같다.

| 흐름 | 완료 기준 |
| --- | --- |
| Run | 5GB 처리 run이 `succeeded` 상태로 조회된다 |
| Catalog | `dataset_product_health_gold`가 같은 `run_id`와 output path를 가진다 |
| Query | M6가 Gold output을 DuckDB/SqlEngineAdapter 뒤에서 조회한다 |
| Evidence | source별 rows/bytes/duration과 Gold rows/bytes가 표시된다 |
| UI | M1에서 run -> catalog -> ask -> evidence 흐름이 끊기지 않는다 |
| 발표 | 5GB 처리 live run 없이도 안정적으로 설명 가능하다 |

2차가 끝나면 Week2 메인 발표 데모는 가능하다고 본다.

## 8. 3차 목표

3차 목표는 50GB input 처리다. 50GB는 발표 확장/고난도 목표이며, 1차와 2차가 완료된 뒤 진행한다.

필수 hardening은 다음과 같다.

| 영역 | 필요 작업 |
| --- | --- |
| Spark | Docker Spark cluster 또는 명확한 distributed Spark 실행 |
| Storage | MinIO-compatible storage 또는 object storage 경로 |
| Layout | partitioned Parquet/Bronze |
| Runtime | driver/executor memory 계획 |
| Disk | raw, bronze, silver, gold, temp, shuffle, output disk 계획 |
| Write | Spark output path와 object upload/write 경로 정리 |
| Failure | partial output cleanup |
| Rerun | rerun/idempotency 기준 |
| Evidence | source lineage와 Gold lineage 분리 |

100GB는 이번 Week2 계획의 필수 목표가 아니다. 50GB 성공 이후 후속 확장 후보로만 둔다.

## 9. M1~M6 책임 분리

| 모듈 | 책임 | 1차 작업 | 2차 작업 | 3차 작업 | 의존성 |
| --- | --- | --- | --- | --- | --- |
| M1 | 발표 UI, risk/evidence 표시 | 위험 상품군, risk_score, 근거 지표 표시 | run/catalog/query/evidence 클릭 흐름 안정화 | 50GB benchmark 요약 표시 | M5 Catalog, M6 AI Query |
| M2 | 대용량 read/write/runtime/storage/Spark execution evidence | 5GB fact input read/write, bronze/gold output evidence | runtime profile과 storage evidence 안정화 | Spark cluster, object storage, 50GB 처리 | M3 TransformSpec, M5 runner call |
| M3 | `gold_product_health` schema, silver/gold transform, risk_score semantics | schema와 최소 transform 확정 | MVP 규모 transform 안정화 | 50GB partition/quality rule 보강 | M2 runtime, M5 workflow |
| M4 | Kafka replay/streaming evidence | 1차 blocker 아님 | behavior event replay evidence | streaming evidence 또는 Kafka scale | behavior event contract |
| M5 | workflow, ExecutionResult, CatalogMetadata, lineage | `dataset_product_health_gold` Catalog 등록 | 5GB run/Catalog/evidence 연결 | 50GB run lineage와 rerun state | M2 result, M3 output facts |
| M6 | M5 Catalog 기반 Gold SQL 조회, answer evidence | Gold SQL 조회와 answer evidence | 대표 질문 안정화, guardrail 유지 | 50GB Gold query는 동일 경계 유지 | M5 CatalogMetadata |

책임 경계는 강하게 유지한다.

- M3는 transform semantics를 소유한다.
- M2는 runtime/storage/Spark execution evidence를 소유한다.
- M5는 run state, `ExecutionResult`, `CatalogMetadata`, lineage를 소유한다.
- M6는 M5 Catalog를 읽고 Gold output만 SQL 조회한다.
- M1은 발표 UI와 evidence 표시를 소유한다.
- M4는 1차 blocker가 아니다.

## 10. Evidence 기준

5GB input 처리는 말이 아니라 evidence로 증명해야 한다.

최소 evidence는 다음과 같다.

| Evidence | 의미 |
| --- | --- |
| `run_id` | smoke, 5GB, 50GB run을 구분 |
| `input_total_bytes` | 5GB 이상 input 증명 |
| source별 `row_count` | reviews/behavior/delivery 처리 행 수 |
| source별 `bytes` | source별 입력 크기 |
| source별 `duration_ms` | source별 처리 시간 |
| source별 `input_path` | 재현 가능한 입력 경로 |
| bronze output path | raw -> bronze 산출물 위치 |
| silver output path | silver metrics 위치 |
| gold output path | `gold_product_health` 위치 |
| Gold row count | 상품별 Gold 행 수 |
| Gold bytes | Gold output 크기 |
| transform version | 같은 transform으로 smoke/5GB/50GB를 돌렸는지 확인 |
| runtime mode | local, spark local, docker spark 등 |
| Spark version | 가능하면 기록 |

`ExecutionResult`에는 입력 처리 evidence를 남기고, `CatalogMetadata`에는 Gold output과 lineage를 남긴다. M1과 M6는 이 evidence를 재계산하지 않고 소비한다.

## 11. 발표 메시지

### 말해도 되는 것

- 5GB 이상 raw/bronze input을 처리해 `gold_product_health`를 생성했다.
- Gold는 상품 단위 집계라 원본보다 작아지는 것이 정상이다.
- 리뷰, 행동, 배송 데이터를 상품 기준으로 연결해 위험 상품군을 찾는다.
- 발표 중에는 5GB 처리를 live로 돌리지 않고, 사전 실행된 run evidence와 Catalog를 보여준 뒤 SQL/UI 조회를 live로 한다.
- 50GB는 3차 확장 목표이며, Spark cluster와 storage hardening을 포함한다.

### 말하면 안 되는 것

- Gold 파일이 5GB다.
- 실제 운영 중인 자사 쇼핑몰 데이터다.
- `risk_score`가 검증된 ML 모델이다.
- 50GB 또는 100GB도 이미 처리된다.
- Kafka가 1차 Gold 생성의 필수 입력이다.
- M6가 5GB raw를 직접 분석한다.
- Taxi 별도 evidence만으로 상품 리스크 Gold가 완성됐다.

## 12. 리스크와 대응

| 리스크 | 영향 | 대응 |
| --- | --- | --- |
| 5GB fact input 확보 리스크 | 1차 핵심 gate 실패 | reviews/behavior/delivery fact를 scale-out하고, 파일 크기 기준을 먼저 고정 |
| JSONL 대용량 처리 리스크 | 처리 시간 증가, 실패 가능 | raw -> bronze partitioned Parquet 구조 채택 |
| Spark local mode 한계 | 5GB는 가능해도 50GB에서 불안정 | 1차는 5GB, 3차는 Docker Spark cluster로 분리 |
| M3 transform 지연 | Gold 생성 불가 | 최소 schema/risk_score부터 닫고 고급 지표는 후순위 |
| M5 Catalog lineage 누락 | 5GB 처리와 Gold 주장이 분리됨 | source별 evidence와 Gold lineage를 같은 `run_id`로 연결 |
| M6가 raw를 조회하는 설계 오류 | SQL/AI Query가 느리고 경계 위반 | M6는 Gold output만 조회하도록 guardrail 유지 |
| 발표 중 live run 실패 | 발표 실패 | 5GB 처리는 사전 실행, SQL/UI 조회만 live |
| 50GB 디스크/temp/shuffle 리스크 | 머신 병목, partial output | raw/bronze/silver/gold/temp/shuffle/output disk 계획 수립 |
| 기존 Week2 기준과 충돌 | Source of Truth drift | 먼저 PM 확장안으로 관리하고 구현 뒤 Source of Truth 반영 |

## 13. 실행 순서

PR/Phase는 작게 나눈다.

| Phase | 목표 | 산출물 |
| --- | --- | --- |
| Phase 1 | planning/contract 문서화 | 이 PM 확장안, `gold_product_health` contract 초안 |
| Phase 2 | small `gold_product_health` smoke | 작은 input으로 Gold 생성, focused test |
| Phase 3 | raw -> bronze Parquet path | reviews/behavior/delivery bronze output |
| Phase 4 | 5GB input generation/preparation | 5GB fact input, file count/bytes manifest |
| Phase 5 | 5GB transform run evidence | `input_total_bytes >= 5GB`, source별 evidence, Gold output |
| Phase 6 | M5 Catalog integration | `dataset_product_health_gold`, lineage, `ExecutionResult` |
| Phase 7 | M6 SQL/AI Query integration | Gold SQL 조회, representative questions |
| Phase 8 | M1 presentation UI integration | risk/evidence display, click flow |
| Phase 9 | 2차 발표 flow hardening | precomputed 5GB run + live SQL/UI demo |
| Phase 10 | 50GB hardening | Docker Spark cluster, storage, partition, disk/shuffle plan |

Phase 1~5가 1차 목표다. Phase 6~9가 2차 목표다. Phase 10이 3차 목표다.

## 14. 현재 repo 기준 참고 상태

현재 repo에는 다음 evidence가 있다.

| 영역 | 현재 상태 |
| --- | --- |
| M1 raw seed | `reviews_seed`, `product_master_seed`, `behavior_events_seed` 생성 기록이 있다. 현재 scale report 기준 reviews 100,000행, product 10,000행, behavior 30,000행이다. |
| delivery seed | `delivery_trips_seed` 100,000행 JSONL/Parquet 생성 기록이 있다. |
| M2 Taxi local batch | 48MB 월별 Taxi Parquet 처리 evidence가 있다. GB scale 증거는 아니다. |
| M2 Taxi Spark scale | PySpark local mode와 MinIO-compatible upload smoke는 있다. 5GB 실제 실행은 아직 pending이다. |
| M5 | Workflow/Catalog spine은 존재한다. `dataset_product_health_gold` 연결은 필요하다. |
| M6 | DuckDB/SqlEngineAdapter 기반 SQL 조회 경로는 존재한다. `gold_product_health` allowed columns/query 연결은 필요하다. |

현재 구현된 것을 `gold_product_health` 완료로 말하면 안 된다. 이 문서의 핵심 산출물은 목표와 실행 계획이다.

## 15. Source of Truth 반영 후보

이 문서가 승인되고 1차 구현 evidence가 생기면 아래 문서 반영을 검토한다.

- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

반영 순서는 Source of Truth 계층을 따른다. Source of Truth를 수정하기 전에는 이 문서를 확장안으로만 취급한다.
