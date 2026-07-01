# Main AI Query Product Health Runtime Stack 품질 계획

- Quality gate status: passed

## TDD Plan

- Applies: yes
- First failing targets:
  - `backend/tests/test_query_router.py`
  - `backend/tests/test_catalog_retrieval_index.py`
  - `backend/tests/test_openai_llm_adapter.py`
  - `backend/tests/test_week2_ai_query.py`
  - `backend/tests/test_week2_ai_query_duckdb.py`

## Backend Required Checks

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_query_router.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_catalog_retrieval_index.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_openai_llm_adapter.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_ai_query.py backend/tests/test_week2_ai_query_duckdb.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_ai_query_dataset_context.py backend/tests/test_target_dataset_catalog_publish.py -q
```

## Frontend Required Checks

```bash
npm --prefix frontend run build
```

## Browser Smoke Plan

1. AI Query 페이지 진입.
2. Product Health `risk_score` 질문 실행.
3. selected dataset이 `dataset_product_health_gold`인지 확인.
4. `route=sql` 결과 table/summary 확인.
5. 근거 질문으로 `route=hybrid` trace 확인.
6. schema/lineage 질문으로 `route=rag` trace 확인.
7. 예측/매출 질문으로 `route=unsupported` guardrail 확인.
8. evidence의 run id, catalog id, local path가 최신 Product Health catalog와 일치하는지 확인.

## Known Skips / Constraints

- Spark/Java 의존 테스트는 로컬 Java Runtime이 없으면 known failure 또는 skip reason으로 기록한다.
- 외부 OpenAI 호출은 기본 검증에서 실행하지 않는다. Adapter는 fake `http_post` 테스트로 검증한다.

## CI/CD Gate

- CI required: yes, when implementation PR opens.
- CI result: remote CI not run; local quality gates passed.
- Deploy/publish required: no.

## Current Planning Check

```bash
git diff --check
```

## Executed Checks

```bash
PYTHONPATH=backend:. ./.venv/bin/pytest backend/tests/test_query_router.py backend/tests/test_catalog_retrieval_index.py backend/tests/test_openai_llm_adapter.py backend/tests/test_week2_ai_query.py backend/tests/test_week2_ai_query_duckdb.py backend/tests/test_ai_query_dataset_context.py -q
PYTHONPATH=backend:. ./.venv/bin/python -m py_compile backend/app/domain/ai_query.py backend/app/domain/llm_answer.py backend/app/domain/retrieval_index.py backend/app/services/ai_query.py backend/app/services/catalog_retriever.py backend/app/services/catalog_rag_index.py backend/app/services/query_router.py backend/app/adapters/template_llm_adapter.py backend/app/adapters/openai_llm_adapter.py backend/app/adapters/local_embedding.py backend/app/core/container.py backend/app/core/settings.py
npm --prefix frontend run build
PYTHONPATH=backend:. ./.venv/bin/pytest backend/tests -q --ignore=backend/tests/test_week2_taxi_spark_runner.py
git diff --check
```

## Results

- Focused AI Query route/RAG/LLM tests: passed, 29 passed.
- Python compile check: passed.
- Frontend build: passed.
- Backend non-Spark suite: passed, 184 passed.
- Browser smoke: passed on `http://127.0.0.1:51748/query`; default Product Health SQL query rendered rows, direct hybrid question showed `route=hybrid`, schema/metric trace, and no console errors.

## Skipped / Deferred

- Full Spark local-mode test file `backend/tests/test_week2_taxi_spark_runner.py` was excluded because this local environment previously lacked Java Runtime.
- External OpenAI live call was not executed. `OpenAILLMAdapter` was verified with fake `http_post` and template fallback tests.
