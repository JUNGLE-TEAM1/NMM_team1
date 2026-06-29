# M5 Product-Health Catalog Lineage 품질 기록

- Quality gate status: passed
- Source Of Truth impact: yes. Week 2 Interface/Acceptance/Regression/Manual Verification 문서를 product-health M5 path에 맞춰 최소 갱신했다.
- Harness test impact: workspace 문서와 Week 2 contract fixture가 추가되어 strict harness 확인이 필요하다.
- Airflow/UI follow-up impact: product-health DAG routing test, frontend build, strict harness 재확인이 필요하다.

## TDD Plan / TDD 계획

- Applies: yes
- Reason: product-health workflow/catalog route와 실패 run overwrite 방지는 M5 public contract에 직접 영향을 준다.
- Failing test first: no
- Reason for no red phase: 사용자가 완성 계획을 제공했고 기존 service 구조를 registry로 확장하면서 focused regression test를 같은 slice에서 추가했다.

## Test Strategy

- 기존 reviews workflow/catalog 회귀를 먼저 고정한다.
- product-health 신규 route/catalog/lineage/failure overwrite 테스트를 추가한다.
- M5 변경이 M6 Catalog 소비와 M2 Spark smoke를 깨지 않는지 focused suite로 확인한다.

## Results

| Check | Command | Result |
| --- | --- | --- |
| M5 workflow/catalog focused | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py -q` | passed, 18 passed |
| M5 + M6 focused | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_ai_query.py -q` | passed, 29 passed |
| M2 Spark runner smoke | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` | passed, 4 passed |
| M5 Airflow adapter focused | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py -q` | passed, 5 passed |
| M6 DuckDB focused | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_ai_query_duckdb.py -q` | passed, 1 passed |
| combined focused suite | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_ai_query.py backend/tests/test_week2_spark_runner.py backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_ai_query_duckdb.py -q` | passed, 39 passed |
| whitespace check | `git diff --check` | passed |
| strict harness | `scripts/validate-harness.sh --strict` | passed |
| product-health Airflow routing focused | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q` | passed, 24 passed |
| frontend standalone demo build | `cd frontend && npm run build` | passed, `dist/product-health-airflow-demo.html` emitted |
| combined focused suite after Airflow/UI | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_ai_query.py backend/tests/test_week2_spark_runner.py backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_ai_query_duckdb.py -q` | passed, 41 passed |
| whitespace check after Airflow/UI | `git diff --check` | passed |
| strict harness after Airflow/UI | `scripts/validate-harness.sh --strict` | passed |
| Airflow Docker DAG load | `docker compose -f docker-compose.airflow.yml up -d`; `curl -s -u airflow:airflow http://127.0.0.1:8080/api/v1/dags/asklake_week2_product_health` | passed, `has_import_errors=false`, `is_active=true`, webserver/scheduler healthy |
| product-health Airflow live API smoke | `POST http://127.0.0.1:8002/api/week2/workflows/pipeline_product_health_e2e/runs` with `{"executor":"airflow"}` | passed, `run_product_health_demo_003`, `status=succeeded`, Airflow DAG state `success` |
| Airflow artifact/output smoke | `ls -l data/week2/_airflow_results/run_product_health_demo_003.json data/week2/product_health/gold/run_id=run_product_health_demo_003/dataset_product_health_gold.parquet` | passed, artifact and parquet output exist |
| standalone UI Airflow smoke | `http://127.0.0.1:5173/product-health-airflow-demo.html`, API base `http://127.0.0.1:8002`, executor `airflow` | passed, UI showed `run_product_health_demo_004`, `status=succeeded`, `gold_product_health`, 12 allowed columns |

## Skipped Checks

- Full backend tests: not run. 변경 범위는 Week 2 M5 workflow/catalog와 focused contract tests에 한정된다.
- Remote CI: not run. Push/PR 없음.

## CI/CD Gate

- CI required: yes before PR/merge
- CI result: not run
- Deploy/publish required: no
- Rollback/smoke notes: product-health M5 path는 fixture contract, Airflow live DAG run, local Parquet output, standalone demo page로 검증했다.
