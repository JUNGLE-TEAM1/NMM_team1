# M6 response contract route and retrieval trace 노트

## 진행 메모

- 2026-06-28: `scripts/start-workflow.sh feature m6-response-contract-trace "M6 response contract route and retrieval trace"`로 branch workspace와 issue #232를 생성했다.
- 2026-06-28: TDD 먼저 적용했다. `AIQueryResult.route`와 `retrieval_trace`를 기대하는 test를 추가한 뒤 실행했을 때 기존 model에 field가 없어 실패했다.
- 2026-06-28: `RetrievalTraceItem` model과 `AIQueryResult.route`, `AIQueryResult.retrieval_trace`를 추가했다.
- 2026-06-28: `Week2AIQueryService`에서 SQL planner intent를 route로 변환하고, Catalog retrieval score/matched terms/evidence index를 trace로 반환하게 했다.
- 2026-06-28: SQL 질문은 `route=sql`, unsupported 질문은 `route=unsupported`로 검증했다. local path missing blocked는 SQL route가 guardrail에서 막힌 것이므로 `route=sql`로 둔다.
- 2026-06-28: `contracts/ai_query_result.sample.json`, `docs/03`, `docs/05`, `docs/06`, `docs/07`에 response contract와 검증 기준을 반영했다.

## 결정

- route enum은 후속 확장까지 고려해 `sql`, `rag`, `hybrid`, `unsupported`로 고정한다.
- 현재 단계의 trace는 CatalogMetadata 선택 근거를 나타내는 `source_type=catalog` item으로 시작한다.
- RAG/Hybrid/LLM 구현은 후속 단계로 남긴다.

## 열린 질문

- 없음. M1 UI 표시와 RAG/Hybrid trace 확장은 후속 Phase 범위다.

## 링크 / 증거

- GitHub issue: #232, `https://github.com/JUNGLE-TEAM1/NMM_team1/issues/232`
- Previous M6 report: `docs/reports/m6-sql-planner-intents.md`
- Focused validation: `backend/tests/test_week2_ai_query.py`, `backend/tests/test_sql_planner.py`, `backend/tests/test_week2_ai_query_duckdb.py`, `backend/tests/test_duckdb_sql_engine.py`
