# M6 Catalog RAG Index 노트

## 진행 메모

- 2026-06-28: `scripts/start-workflow.sh feature m6-catalog-rag-index "M6 Catalog RAG Index"`로 branch workspace와 issue #237을 생성했다.
- 2026-06-28: Step 6 범위를 CatalogMetadata 기반 RAG-lite index로 고정했다. 외부 vector DB, real embedding provider, LLM, Hybrid route는 제외했다.
- 2026-06-28: TDD로 `backend/tests/test_catalog_retrieval_index.py`와 `backend/tests/test_week2_ai_query.py` trace regression을 먼저 추가했다.
- 2026-06-28: expected failure 확인: `ModuleNotFoundError: No module named 'app.adapters.local_embedding'`.
- 2026-06-28: `RetrievalIndex`, `EmbeddingAdapter` port와 `RetrievalIndexChunk/Hit/Snapshot` domain model을 추가했다.
- 2026-06-28: `LocalTokenEmbeddingAdapter`와 `CatalogRetrievalIndex`를 추가했다.
- 2026-06-28: `CatalogRetriever`가 index hit를 함께 반환하고, `Week2AIQueryService`가 index hit를 `retrieval_trace`에 추가하도록 연결했다.
- 2026-06-28: `contracts/ai_query_result.sample.json`, `docs/03`, `docs/05`, `docs/06`, `docs/07`에 RAG-lite trace와 safety/stale 기준을 반영했다.

## 결정

- index는 M6 derived cache이며 M5 Catalog source of truth를 대체하지 않는다.
- chunk 대상은 dataset identity, schema, metrics, lineage, query allowlist, freshness로 제한한다.
- `storage.local_fallback_path`, raw file contents, secret, credential은 index text에 포함하지 않는다.

## 열린 질문

- 없음. RAG-only route, Hybrid route, external embedding/LLM은 후속 Phase로 남긴다.

## 링크 / 증거

- GitHub issue: #237, `https://github.com/JUNGLE-TEAM1/NMM_team1/issues/237`
- Previous M6 report: `docs/reports/m6-response-contract-trace.md`
- Focused validation: `backend/tests/test_catalog_retrieval_index.py`, `backend/tests/test_week2_ai_query.py`, `backend/tests/test_sql_planner.py`, `backend/tests/test_week2_ai_query_duckdb.py`, `backend/tests/test_duckdb_sql_engine.py`, `backend/tests/test_app_container.py`
