# Main AI Query Product Health Runtime Stack 계획

## Phase

- ID: C-48
- Branch/work location: `feature/main-sync-product-health-runtime-stack`, `docs/workflows/feature/main-sync-product-health-runtime-stack`
- Goal: `origin/main`의 AI Query route/RAG/LLM/UI 계약을 현재 Product Health runtime/catalog 흐름 위에 안전하게 적용하기 위한 설계를 고정한다.

## 변경 시작 계층

- Earliest impacted layer: Interface
- Propagation path: Interface -> Acceptance -> Regression -> Manual Verification -> Workflow
- 이번 작업 범위: Phase 설계 문서와 workflow queue 반영만 수행한다. 코드와 Source of Truth 계약 본문 수정은 후속 구현 Phase에서 진행한다.

## Source of Truth 읽기 범위

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`의 Dataset Module Connection Queue
- `docs/03-interface-reference.md`의 `AIQueryResult`, `CatalogMetadata`, Product Health 식별자/Gold schema 관련 섹션
- 관련 reports: `catalog-ai-query-clean-room-handoff`, `product-health-preset-synthesis`, `m6-response-contract-trace`, `m6-catalog-rag-index`, `m6-llm-answer-adapter`

## 목표 계약

### AIQueryResult

- `query_result`를 canonical SQL 실행 결과로 둔다.
- top-level `sql`, `rows`는 M1/UI 호환 mirror로 유지한다.
- `route`는 `sql`, `rag`, `hybrid`, `unsupported`를 허용한다.
- `retrieval_trace[]`는 catalog/schema/metric/lineage 근거를 표시한다.
- `answer_metadata`는 LLM 답변 출처, fallback 여부, evidence grounding 상태를 표시한다.
- `evidence[]`는 selected CatalogDataset/run/path/schema/metrics/lineage와 일치해야 한다.

### QueryEvidence

- 현재 브랜치의 `evidence[].storage.local_fallback_path`는 유지한다.
- SQL/DuckDB handoff와 화면 검수에서는 local path가 필요하다.
- 외부 LLM context에는 `local_fallback_path`, `/tmp`, `.parquet`, secret, credential, token을 전달하지 않는다.
- 따라서 `AIQueryResult`용 evidence와 `LLMAnswerContext`용 safe evidence를 분리한다.

### CatalogMetadata

Product Health 대표 경로는 아래 식별자를 고정한다.

- `pipeline_product_health_e2e`
- `dataset_product_health_gold`
- `gold_product_health`

AI Query가 소비할 최소 shape는 다음 항목을 포함해야 한다.

- `tenant_id`
- `dataset_id`
- `name`
- `schema.fields`
- `storage.local_fallback_path`
- `metrics.row_count`
- `metrics.bytes`
- `metrics.quality`
- `metrics.semantics`
- `lineage.pipeline_id`
- `lineage.run_id`
- `lineage.source_ids`
- `query.table_name`
- `query.allowed_columns`
- `query.default_limit`
- `query.timeout_seconds`

### Product Health Gold schema

표준 컬럼:

- `product_id`
- `category`
- `product_name`
- `risk_score`
- `negative_review_rate`
- `conversion_rate`
- `late_delivery_rate`

현재 브랜치 호환 컬럼:

- `internal_product_id`
- `scenario_bucket`
- `risk_driver`

호환 전략:

- SQL planner는 `product_id`가 있으면 우선 사용한다.
- `product_id`가 없고 `internal_product_id`가 있으면 `internal_product_id`를 product display id로 사용한다.
- Product Health summary와 UI는 `product_id ?? internal_product_id`를 표시한다.
- `scenario_bucket`, `risk_driver`는 있으면 optional evidence/detail로 표시하되 필수 schema로 승격하지 않는다.

## 계약 충돌 표

| 영역 | `origin/main` 기준 | 현재 브랜치 기준 | 적용 전략 |
| --- | --- | --- | --- |
| AI Query route | `sql/rag/hybrid/unsupported` | 주로 `sql/unsupported` | main의 `QueryRouter` 계약을 가져온다. |
| Evidence storage | LLM-safe context에서 path 제거 | UI/SQL handoff에서 `storage.local_fallback_path` 필요 | 응답 evidence는 유지, LLM context만 sanitize한다. |
| Product id | `product_id` 중심 | `internal_product_id` 호환 필요 | planner/summary/display에서 둘 다 허용한다. |
| Catalog source | Week2 catalog store + fixture fallback | runtime CatalogDataset/publish 결과 우선 | 현재 runtime catalog source를 source of truth로 둔다. |
| RAG index | schema/metric/lineage chunk | catalog trace는 단순 catalog hit 중심 | main의 RAG index를 추가하되 live catalog 우선순위를 유지한다. |
| LLM | template/openai adapter | deterministic summary 중심 | LLM adapter를 도입하고 fallback은 template로 둔다. |
| UI | 분리된 `AiQueryPage.jsx` | 현재 브랜치 UI 구조와 충돌 가능 | 화면 전체 덮어쓰기보다 trace/evidence/CTA 단위로 이식한다. |
| Metrics | `input_total_bytes` 등 main 기준 | `processed_input_total_bytes`, `available_source_total_bytes` 등 Product Health evidence | metric key를 합집합으로 유지하고 display label만 정리한다. |

## 파일별 적용 전략

| 파일 | 전략 | 이유 | 위험 |
| --- | --- | --- | --- |
| `backend/app/domain/llm_answer.py` | main에서 신규 도입 | LLM answer metadata 계약의 독립 domain | 낮음 |
| `backend/app/domain/ai_query.py` | 부분 병합 | 현재 `QueryEvidence.storage`를 보존하면서 `AnswerMetadata`/route trace를 확장 | 중간 |
| `backend/app/services/query_router.py` | main에서 도입 | route 분기 계약이 독립적 | 낮음 |
| `backend/app/services/catalog_rag_index.py` | main에서 도입 후 sensitive filter 보강 | schema/metric/lineage trace 근거 제공 | 중간 |
| `backend/app/services/catalog_retriever.py` | 부분 병합 | RAG score를 추가하되 Product Health alias와 live catalog 우선순위 유지 | 중간 |
| `backend/app/services/ai_query.py` | 부분 병합 | route/RAG/LLM orchestration만 가져오고 runtime catalog/evidence storage는 보존 | 높음 |
| `backend/app/adapters/template_llm_adapter.py` | main에서 도입 후 Product Health id fallback 보강 | 데모 fallback 안정성 | 중간 |
| `backend/app/adapters/openai_llm_adapter.py` | main에서 도입 후 safe context 검증 | 외부 LLM option과 fallback | 중간 |
| `backend/app/core/settings.py` | 부분 병합 | LLM env 추가 | 낮음 |
| `backend/app/core/container.py` | 부분 병합 | LLM/retriever wiring 추가, 현재 runtime catalog source 보존 | 중간 |
| `frontend/src/app/pages/AiQueryPage.jsx` | 화면 구조에 따라 부분 이식 | trace/evidence/session/sample questions가 유용하지만 현재 app 구조와 충돌 가능 | 높음 |
| `frontend/src/api/asklakeClient.js` | 필요한 API helper만 이식 | 기존 endpoint와 response shape 보존 | 낮음 |
| `contracts/ai_query_result.sample.json` | 후속 구현 Phase에서 갱신 | 계약 예시 drift 방지 | 중간 |
| `contracts/product_health_catalog_metadata.sample.json` | 후속 구현 Phase에서 추가/갱신 | Product Health 대표 catalog fixture 고정 | 중간 |

## 구현 순서

1. Domain contract를 먼저 확장한다.
2. `QueryRouter`와 route tests를 추가한다.
3. `CatalogRetrievalIndex`와 safe chunk tests를 추가한다.
4. `CatalogRetriever`에 RAG hit score를 연결한다.
5. `Week2AIQueryService`에 route/RAG/LLM orchestration을 얹는다.
6. LLM adapters와 settings/container wiring을 추가한다.
7. Product Health runtime CatalogDataset을 우선 소비하는 회귀 테스트를 맞춘다.
8. Frontend AI Query trace/evidence UI를 현재 app 구조에 맞게 이식한다.
9. Browser smoke로 Product Health 질문 경로를 확인한다.

## 완료 기준

- C-48 설계 문서가 workspace에 기록되어 있다.
- `docs/08-development-workflow.md`에 후속 Phase가 추가되어 있다.
- 전체 main merge 없이 파일별 이식 전략이 명시되어 있다.
- Product Health runtime catalog가 AI Query source of truth라는 원칙이 문서화되어 있다.
- 후속 구현 Phase에서 사용할 테스트 목록과 위험이 명확하다.
