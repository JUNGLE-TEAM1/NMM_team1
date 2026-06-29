# M6 Hybrid Route 노트

## 진행 메모

- 2026-06-29: `scripts/start-workflow.sh feature m6-hybrid-route "M6 Hybrid Route"`로 branch workspace와 issue #266을 생성했다.
- 2026-06-29: PR #241 `feature/m6-catalog-rag-index` 위에서 stacked branch로 시작했다. 사람 확인 없는 pull/merge/rebase는 실행하지 않았다.
- 2026-06-29: TDD로 `backend/tests/test_query_router.py`와 `backend/tests/test_week2_ai_query.py`의 hybrid/rag-only regression을 먼저 추가했다.
- 2026-06-29: expected failure 확인: `ModuleNotFoundError: No module named 'app.services.query_router'`.
- 2026-06-29: `QueryRouter`와 `QueryRouteDecision`을 추가해 `sql`, `rag`, `hybrid`, `unsupported` route를 결정하게 했다.
- 2026-06-29: `Week2AIQueryService`가 route decision에 따라 SQL 실행, RAG-only no-SQL 응답, Hybrid summary를 분기하도록 연결했다.
- 2026-06-29: `contracts/ai_query_result.sample.json`, `docs/03`, `docs/05`, `docs/06`, `docs/07`에 Hybrid/RAG-only route 기준을 반영했다.

## 결정

- route 결정은 external LLM 없이 deterministic keyword rule로 한다.
- RAG-only route는 SQL engine validate/execute를 호출하지 않는다.
- Hybrid route는 SQL을 먼저 실행하고 Catalog RAG-lite evidence로 summary와 trace를 보강한다.

## 열린 질문

- 없음. external LLM, real semantic route classifier, M1 richer display는 후속 Phase로 남긴다.

## 링크 / 증거

- GitHub issue: #266, `https://github.com/JUNGLE-TEAM1/NMM_team1/issues/266`
- Source PR: #241, `https://github.com/JUNGLE-TEAM1/NMM_team1/pull/241`
- Previous M6 report: `docs/reports/m6-catalog-rag-index.md`
- Focused validation: `backend/tests/test_query_router.py`, `backend/tests/test_week2_ai_query.py`
