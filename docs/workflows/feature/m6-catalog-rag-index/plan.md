# M6 Catalog RAG Index 계획

## 브랜치

- Branch: `feature/m6-catalog-rag-index`
- Workspace: `docs/workflows/feature/m6-catalog-rag-index`
- Created: 2026-06-28

## 목표

- M6 Step 6로 `CatalogMetadata`를 M6 전용 RAG-lite 검색 index로 변환한다.
- index 대상은 dataset name, schema fields, metrics, lineage, query allowlist, freshness로 제한한다.
- M6가 기존 SQL-first 답변을 유지하면서, `retrieval_trace`에 catalog/schema/metric/lineage chunk 근거를 더 자세히 남길 수 있게 한다.
- 외부 vector DB 없이 local deterministic embedding과 optional persisted cache로 구현한다.

## 범위

- `RetrievalIndex` port와 `EmbeddingAdapter` port 추가.
- `CatalogRetrievalIndex` 구현 추가.
- deterministic local embedding adapter 추가.
- CatalogMetadata에서 안전한 chunk를 만든다:
  - catalog/query allowlist/freshness chunk
  - schema field chunk
  - metric chunk
  - lineage chunk
- `dataset_id + lineage.run_id + updated_at` 기반 signature로 index stale 여부를 판단한다.
- optional local persisted index cache를 지원한다.
- `CatalogRetriever`가 index hit를 함께 반환하고, `Week2AIQueryService`가 index hit를 `retrieval_trace`에 추가한다.
- focused tests로 chunk 생성, semantic-ish search ranking, stale rebuild, AI query trace 확장을 검증한다.

## 범위 제외

- 외부 vector DB.
- real embedding provider 또는 external LLM.
- `route=rag` 또는 `route=hybrid` 실제 실행.
- Hybrid query.
- M1 UI 변경.
- M5 Catalog 저장/수정.
- 원본 파일 전체 indexing 또는 full document RAG.
- 범용 NL2SQL 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md` RAG Index state, `AIQueryResult.route`, `retrieval_trace`
- `docs/05-acceptance-scenarios-and-checklist.md` Ask/Evidence acceptance
- `docs/06-regression-and-failure-scenarios.md` M6 route/retrieval trace regression
- `docs/07-manual-verification-playbook.md` product risk M6 manual check
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md` M6 RAG-lite boundary
- `docs/reports/m6-response-contract-trace.md`
- `backend/app/services/catalog_retriever.py`
- `backend/app/services/ai_query.py`
- `backend/tests/test_week2_ai_query.py`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed. 이번 Phase는 한 의미 단위인 `M6 Catalog RAG Index`만 다룬다.

## 완료 기준

- [x] `RetrievalIndex` port가 추가된다.
- [x] `EmbeddingAdapter` port가 추가된다.
- [x] CatalogMetadata 안전 필드만 index chunk로 변환한다.
- [x] index chunk에는 원본 파일 전체, secret, credential, local fallback path가 들어가지 않는다.
- [x] 질문과 관련 높은 schema/metric/lineage/catalog chunk가 높은 score로 선택된다.
- [x] `dataset_id + run_id + updated_at`이 바뀌면 persisted cache가 stale로 판단되어 재생성된다.
- [x] M6 `retrieval_trace`가 기존 catalog trace와 함께 index hit trace를 포함한다.
- [x] SQL-first route와 기존 SQL/DuckDB behavior는 유지된다.
- [x] focused tests, backend tests, contract JSON, harness validation 결과가 `quality.md`와 report에 기록된다.
