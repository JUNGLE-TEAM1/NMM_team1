# M5 local/demo completion 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m5-airflow-smoke-integration`, `docs/workflows/feature/m5-airflow-smoke-integration`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/project-context/asklake-week2-module-plan/ver2/README.md`, `m5-airflow-integration-options.md`, `runner-boundary-decision.md`, `backend/app/services/week2_airflow_adapter.py`, `backend/app/services/week2_workflow.py`, `backend/app/services/week2_local_runner.py`, `backend/tests/test_week2_airflow_adapter.py`
- Escalated context read: Airflow/runtime integration risk로 `docker-compose.yml`, contracts, workflow tests를 확인
- Context omitted intentionally: production Airflow deployment, MinIO/S3, SparkRunner/M2 implementation, full async UI
- Changed: `docker-compose.airflow.yml`, repo DAG `airflow/dags/asklake_week2_reviews.py`, `Week2AirflowAdapter` shared result artifact read, `.env.example`, tests, Source of Truth docs, `/etl` M5 demo cockpit UI, manual/technical learning guides, workspace evidence.
- Verified: adapter TDD, focused Week2 tests, full backend tests, frontend build, browser local runner smoke, DAG syntax, compose config, real local Airflow smoke, result artifact/output/Catalog, strict harness validation, integration harness validation.
- Remaining: production Airflow deployment, MinIO/S3 storage, SparkRunner/M2 runtime, async UI are intentionally out of scope.
- Next context: 사용자는 추천안 구현과 남은 M5 정리 전체 진행을 선택했다. 완료 범위는 local Airflow smoke + M5 demo cockpit UI를 묶은 M5 local/demo slice이며 production 완성이 아니다.
- Risk: first local run requires pulling a large Airflow image; port `8080` must be free or `AIRFLOW_PORT` must be changed. Latest checked `origin/main` through `e640f90` is merged locally, but remote PR body guardrails still need linked issue/no-issue and large PR exception correction before merge readiness.

## Changed Files / 변경 파일

- `docker-compose.airflow.yml`: local Airflow smoke stack.
- `airflow/dags/asklake_week2_reviews.py`: Airflow DAG that runs Week 2 demo workflow and writes output/result artifacts.
- `backend/app/services/week2_airflow_adapter.py`: passes `airflow_result_file` and reads shared result artifact after DAG success.
- `backend/tests/test_week2_airflow_adapter.py`: TDD coverage for shared result artifact handoff.
- `.env.example`: local Airflow smoke env values.
- `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`: `/etl` M5 demo cockpit UI with executor selection, result interpretation, verdict cards, evidence board, Catalog lineage, and raw JSON evidence.
- `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`: contract, acceptance, regression, manual verification update.
- `docs/project-context/asklake-week2-module-plan/ver2/m5-airflow-integration-options.md`: decision guide.
- `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md`: M5 demo cockpit learning and experiment guide.
- `docs/project-context/asklake-week2-module-plan/ver2/m5-technical-depth-study-guide.md`: M5 technical depth study guide.
- `docs/workflows/docs/m5-airflow-integration-options`, `docs/workflows/feature/m5-airflow-smoke-integration`, `docs/workflows/feature/m5-demo-cockpit-ui`: option, Airflow smoke, and UI workspace evidence.

## Verification / 검증

- `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py -q` -> 5 passed.
- `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q` -> 21 passed.
- `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests -q` -> 51 passed before main sync; 66 passed after latest `origin/main` sync.
- `npm run build` in `frontend/` -> passed.
- Browser smoke at `http://127.0.0.1:5173/etl` -> run `run_reviews_demo_069`, four verdict cards, output URI, matching `CatalogMetadata.lineage.run_id`, browser error logs 0.
- `python3 -m py_compile airflow/dags/asklake_week2_reviews.py` -> passed.
- `docker compose -f docker-compose.airflow.yml config` -> passed.
- `docker compose -f docker-compose.airflow.yml up -d` -> Airflow webserver/scheduler/postgres running.
- `curl -s http://localhost:8080/health` -> metadatabase and scheduler healthy.
- `curl -s -u airflow:airflow http://localhost:8080/api/v1/dags/asklake_week2_reviews` -> DAG active, not paused, no import errors.
- Backend POST `/api/week2/workflows/pipeline_reviews_json_e2e/runs` with `executor=airflow` -> run `run_reviews_demo_065`, status `succeeded`.
- Airflow API `dagRuns/run_reviews_demo_065` -> state `success`.
- `data/week2/_airflow_results/run_reviews_demo_065.json` exists and contains `week2_result`.
- `data/week2/reviews/gold/run_id=run_reviews_demo_065/dataset_reviews_gold.jsonl` exists with 3 output rows.
- `curl -s http://127.0.0.1:18000/api/week2/catalog/dataset_reviews_gold` -> Catalog metrics and lineage updated from Airflow result.
- `scripts/validate-harness.sh --strict` -> Harness validation passed.
- `scripts/validate-harness.sh --integration` -> Harness validation passed.
- Post-main-sync validation after merging `origin/main` through `e640f90`: `npm run build`, full backend pytest, strict harness, integration harness, and `git diff --check` all passed.
