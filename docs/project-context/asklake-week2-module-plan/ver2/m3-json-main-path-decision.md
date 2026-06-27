# AskLake Week2 ver2 M3 Product Health Transform Decision

## 목적

이 문서는 M3가 먼저 맡을 상품 리스크 분석 대표 path와 닫힌 PR #105의 회수 범위를 결정한다.

Phase 3에서 M6 Semantic/RAG-lite/AI Query 분석 대표 경로는 reviews/behavior/delivery fact input과 product dimension을 처리해 `gold_product_health`를 만들고, M5 Workflow/Catalog -> M6 Semantic/RAG-lite/AI Query -> M1 UI로 연결하는 방향으로 확정했다. Phase 5는 M3가 이 경로에서 만들 최소 산출물과 PR #105를 어떻게 다룰지 정한다.

Week2의 대표 Gold는 `gold_product_health`다. M3는 Amazon Reviews JSON을 reviews fact input으로 유지하고, behavior/delivery/product input을 결합하는 schema/TransformSpec/silver-gold semantics를 소유하되, runtime/storage/Spark session을 이번 slice에서 떠안지 않는다.

## 결정

M3의 첫 구현 대상은 `gold_product_health`를 만들기 위한 reviews/behavior/delivery/product input의 최소 schema와 TransformSpec이다. Amazon Reviews JSON 또는 동등한 JSON/JSONL sample은 reviews fact input으로 사용한다.

PR #105는 그대로 merge하지 않는다. 대신 source material로 읽고, JSON inspection/profile/schema inference에 해당하는 작은 조각만 Phase 6 runner boundary 이후 후속 구현에서 회수한다.

5GB input 처리는 M2 runtime/storage/Spark evidence와 연결된다. Kafka Event는 1차 blocker가 아니며, 2차 이후 behavior replay evidence 또는 3차 streaming evidence로 둔다. 이번 M3 결정은 M3의 분석 대표 semantics와 과부하 guardrail을 정하는 결정이다.

## PR #105 관찰

PR #105 정보:

- PR: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/105
- 작성자: `Wish-Upon-A-Star`
- 상태: closed, not merged
- Head branch: `origin/codex/m3-json-recommendations`
- 주요 커밋: `feat: add json source recommendations backend`, `feat: allow json source registration in catalog UI`
- diff 규모: 14 files, 974 insertions, 39 deletions

주요 변경 후보:

| 파일 | 판단 | 이유 |
| --- | --- | --- |
| `backend/app/adapters/json_source.py` | 회수 후보 | JSON/JSONL/gzip read, flatten, field profile, schema inference 로직이 M3 분석 대표 path와 직접 관련 있다. |
| `backend/app/domain/schemas.py` | 부분 회수 후보 | `JsonProfile`, `JsonFieldProfile`, recommendation bundle류가 있으나 현재 shared schema에 바로 섞기에는 범위가 크다. |
| `backend/tests/test_source_catalog.py` | 부분 회수 후보 | JSON inspect/profile 기대 동작을 테스트로 재구성할 수 있다. |
| `backend/app/api/source_catalog.py`, `backend/app/services/source_catalog.py` | 보류 | source catalog registration과 API 확장은 M1/M3/M5 boundary가 정리된 뒤 다룬다. |
| `frontend/src/features/catalog/*`, `frontend/src/api/*`, `frontend/src/app/styles.css` | 이번 회수 제외 | UI/source registration polish는 분석 대표 path 최소 구현 뒤 연결한다. |
| `backend/app/services/week2_workflow.py` | 이번 회수 제외 | M5 runner boundary 전 code 변경으로 섞지 않는다. |

## M3 최소 산출물

M3의 첫 구현 slice는 아래 여섯 가지를 만든다.

1. reviews/behavior/delivery/product source schema facts
2. JSON/JSONL sample inspection
3. bronze/silver/gold 최소 `TransformSpec` shape
4. `gold_product_health` schema
5. `risk_score`와 핵심 metric semantics
6. M5 Catalog에 넘길 metadata facts

각 산출물의 의미:

| 산출물 | 내용 | 넘기는 대상 |
| --- | --- | --- |
| Source schema facts | reviews/behavior/delivery/product field, type, nullable, source role | M5 runner input과 M6 evidence |
| JSON inspection | file format, record path, sampled row count, sample rows | M3 내부 test와 M5 runner input |
| `TransformSpec` minimal shape | raw -> bronze -> silver metrics -> `gold_product_health` 의도 | Phase 6 runner boundary |
| `gold_product_health` schema | product id, category, review/behavior/delivery metrics, `risk_score`, source row counts | M5 Catalog metadata와 M6 SQL allowlist |
| Metric semantics | `negative_review_rate`, `conversion_rate`, `late_delivery_rate`, `risk_score` 계산 기준 | M1/M6 표시와 answer evidence |
| Catalog metadata facts | dataset id, source id/path/type, profile summary, output convention hint | M5 Catalog store/API |

## 회수할 수 있는 로직

PR #105에서 회수 가능한 구현 아이디어:

- `.json`, `.jsonl`, `.ndjson`, gzip JSONL 처리
- top-level array와 JSONL sampled read
- nested object flatten
- field type inference
- nullable/missing count 계산
- target column name 충돌 해소
- sample value 제한

회수 시 조건:

- M3 module 또는 adapter로 작게 가져온다.
- M5 `Week2WorkflowService`를 직접 수정하지 않는다.
- M1 source catalog UI를 동시에 바꾸지 않는다.
- shared schema는 Phase 6 boundary와 맞는 최소 타입만 추가한다.
- tests는 JSON inspection/profile/TransformSpec 최소 shape에 집중한다.

## 이번 분석 대표 path에서 제외

- broad source catalog registration UI
- recommendation bundle UI polish
- source catalog API 전면 확장
- M5 workflow code와 직접 결합한 JSON runner 변경
- runtime/storage/Spark session 구현
- Spark session 생성 또는 Spark runtime config 소유
- Kafka streaming to Gold를 1차 blocker로 만드는 작업
- 50GB runtime hardening

## Phase 6으로 넘길 질문

- M3의 `TransformSpec`를 M5 runner boundary에 어떤 필드로 넘길지
- `SchemaDefinition`과 `TransformSpec` 중 어느 쪽이 Catalog metadata의 canonical source가 될지
- M2 SparkRunner가 local runner와 같은 result shape를 반환할 때 M3 profile facts를 어디에 담을지
- 5GB input evidence의 source별 metrics를 `ExecutionResult.task_results[]`와 Catalog lineage 중 어디까지 중복 기록할지

## Phase 5 완료 기준

- M3 분석 대표 path가 `gold_product_health`로 고정되어 있다.
- 5GB input evidence가 M2 runtime 책임이고, M3는 transform semantics 책임임을 훼손하지 않는다.
- Kafka가 1차 Gold 생성 blocker가 아님을 훼손하지 않는다.
- PR #105를 그대로 merge하지 않고 source material로만 다루는 이유가 명시되어 있다.
- 회수 후보와 제외 범위가 파일/기능 기준으로 분리되어 있다.
- Phase 6 runner boundary가 이어받을 M3 최소 산출물이 명시되어 있다.
