# Main AI Query Product Health Runtime Stack 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-07-01
- Changed: `origin/main` AI Query route/RAG/LLM 계약을 현재 Product Health runtime 브랜치에 파일 단위로 이식했다.
- Verified: focused AI Query tests 29개, backend non-Spark 184개, frontend build, py_compile, browser smoke를 통과했다.
- Remaining: Spark local-mode test는 Java Runtime 의존으로 이번 local gate에서 제외했다. OpenAI live call은 실행하지 않았다.
- Next context: 후속 polish가 필요하면 AI Query 화면의 RAG summary 노출과 Product Health live catalog 선택 설명을 다듬는다.
- Risk: main 전체 merge가 아니라 부분 이식이므로, origin/main의 frontend split 구조 전체는 아직 가져오지 않았다.

---

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/main-sync-product-health-runtime-stack`, `docs/workflows/feature/main-sync-product-health-runtime-stack`
- Date: 2026-07-01
- Workspace state: completed

## Goal / 목표

- main의 AI Query 개선 구조를 현재 Product Health runtime/catalog source of truth 위에 얹고, Product Health 데모 질문에서 `sql/hybrid/rag/unsupported` route를 검증한다.

## Changed Files / 변경 파일

- `docs/08-development-workflow.md`
- `docs/workflows/feature/main-sync-product-health-runtime-stack/*`
- `backend/app/domain/ai_query.py`
- `backend/app/domain/llm_answer.py`
- `backend/app/domain/retrieval_index.py`
- `backend/app/ports/embedding_adapter.py`
- `backend/app/ports/llm_adapter.py`
- `backend/app/ports/retrieval_index.py`
- `backend/app/adapters/local_embedding.py`
- `backend/app/adapters/openai_llm_adapter.py`
- `backend/app/adapters/template_llm_adapter.py`
- `backend/app/services/ai_query.py`
- `backend/app/services/catalog_rag_index.py`
- `backend/app/services/catalog_retriever.py`
- `backend/app/services/query_router.py`
- `backend/app/core/container.py`
- `backend/app/core/settings.py`
- `backend/tests/test_catalog_retrieval_index.py`
- `backend/tests/test_openai_llm_adapter.py`
- `backend/tests/test_query_router.py`
- `backend/tests/test_week2_ai_query.py`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

## Implementation Summary / 구현 요약

- C-48 Phase를 Dataset Module Connection Queue에 추가했다.
- `QueryRouter`를 추가해 `sql`, `hybrid`, `rag`, `unsupported` route를 분기한다.
- `CatalogRetrievalIndex`를 추가해 catalog/schema/metric/lineage chunks를 retrieval trace로 노출한다.
- `TemplateLLMAdapter`와 `OpenAILLMAdapter`를 추가하고 기본 provider는 template로 유지했다.
- `answer_metadata`를 `AIQueryResult`에 추가해 provider/fallback/grounding 상태를 표시한다.
- `evidence.storage.local_fallback_path`는 응답 evidence에 유지하고 LLM context에서는 제거했다.
- Product Health live CatalogDataset이 있으면 generic metadata 질문도 fixture보다 live catalog를 우선 선택하게 했다.

## Verification Commands / 검증 명령

```bash
git diff --check
PYTHONPATH=backend:. ./.venv/bin/pytest backend/tests/test_query_router.py backend/tests/test_catalog_retrieval_index.py backend/tests/test_openai_llm_adapter.py backend/tests/test_week2_ai_query.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_ai_query_dataset_context.py -q
PYTHONPATH=backend:. ./.venv/bin/python -m py_compile backend/app/domain/ai_query.py backend/app/domain/llm_answer.py backend/app/domain/retrieval_index.py backend/app/services/ai_query.py backend/app/services/catalog_retriever.py backend/app/services/catalog_rag_index.py backend/app/services/query_router.py backend/app/adapters/template_llm_adapter.py backend/app/adapters/openai_llm_adapter.py backend/app/adapters/local_embedding.py backend/app/core/container.py backend/app/core/settings.py
npm --prefix frontend run build
PYTHONPATH=backend:. ./.venv/bin/pytest backend/tests -q --ignore=backend/tests/test_week2_taxi_spark_runner.py
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/main-sync-product-health-runtime-stack/quality.md`
- Quality gate status: passed
- TDD status: focused tests added for QueryRouter, CatalogRetrievalIndex, OpenAI adapter, and existing Week2 AI Query regressions updated.
- CI/check result: local focused tests, non-Spark backend suite, frontend build, py_compile, and browser smoke passed.
- CD/deploy gate: not applicable

## Regression Guard / 회귀 보호

- Checked feature: AI Query route/RAG/LLM integration
- Protected behavior: Product Health runtime catalog remains AI Query source of truth and LLM context does not receive local paths.
- Result: passed by tests and browser smoke.

## Manual Verification / 수동 검증

- Document executed: C-48 manual verification draft.
- Result: browser smoke passed for `/query` SQL and hybrid route.
- Limitation: full click path from Connection -> Source -> Silver -> Gold -> Run -> Catalog -> AI Query was not rerun in this Phase.

## Secret / Migration / Env Check

- Secret check: no secret changes.
- Migration/data change: none.
- Env change: optional `WEEK2_LLM_PROVIDER`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`, `OPENAI_TIMEOUT_SECONDS` settings are now recognized. Default remains template/no external call.

## Final Judgment / 최종 판단

- Done: yes.
- Remaining risk: Spark Java-dependent tests and OpenAI live provider smoke remain outside this local validation.
