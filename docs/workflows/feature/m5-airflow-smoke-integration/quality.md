# M5 Airflow smoke integration 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `Week2AirflowAdapter`가 Airflow 성공 후 shared result artifact를 읽어야 하는 contract 변경이다.
- Failing test first: `test_week2_airflow_adapter_reads_shared_result_artifact`
- Expected failure command/result: `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py -q` -> 4 failed, 1 passed. `Week2AirflowConfig`가 `result_root`를 아직 받지 못해 실패했다.
- Pass command/result: `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py -q` -> 5 passed.
- Refactor notes: Airflow DAG run response 직접 payload와 shared result artifact payload를 모두 지원하되, local fallback은 Airflow 실패 시에만 service 계층에서 선택되도록 유지했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| whitespace | `git diff --check` | pass | no output |
| unit/focused test | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py -q` | pass | 5 passed |
| unit/focused test | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q` | pass | 21 passed |
| final focused test | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q` | pass | 21 passed after combined M5 local/demo documentation cleanup |
| backend regression | `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests -q` | pass | 51 passed after installing `backend/requirements.txt` into `.venv` |
| Airflow DAG syntax | `python3 -m py_compile airflow/dags/asklake_week2_reviews.py` | pass | DAG imports with stdlib-only smoke logic |
| Airflow compose config | `docker compose -f docker-compose.airflow.yml config` | pass | compose renders successfully |
| Airflow local smoke | `docker compose -f docker-compose.airflow.yml up -d`; `curl -s http://localhost:8080/health`; `curl -s -u airflow:airflow http://localhost:8080/api/v1/dags/asklake_week2_reviews`; backend POST to `/api/week2/workflows/pipeline_reviews_json_e2e/runs` with `executor=airflow` | pass | DAG active, DAG run `run_reviews_demo_065` state `success`, backend run status `succeeded` |
| result artifact | `ls -l data/week2/_airflow_results`; `rg -n "week2_result" data/week2/_airflow_results/run_reviews_demo_065.json` | pass | `run_reviews_demo_065.json` exists and contains `week2_result` |
| output dataset | `head -n 5 data/week2/reviews/gold/run_id=run_reviews_demo_065/dataset_reviews_gold.jsonl` | pass | 3 gold rows written |
| Catalog update | `curl -s http://127.0.0.1:18000/api/week2/catalog/dataset_reviews_gold` | pass | Catalog lineage run_id is `run_reviews_demo_065`; metrics row_count 3, bytes 195 |
| strict harness validation | `scripts/validate-harness.sh --strict` | pass | Harness validation passed |
| integration harness validation | `scripts/validate-harness.sh --integration` | pass | Harness validation passed after source option-guide workspace completion |

## CI/CD Gate / CI-CD 게이트

- CI required: no local-only change in this turn
- CI result: not run locally beyond test/build/smoke commands
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: local Airflow containers are started by `docker compose -f docker-compose.airflow.yml up -d`; stop with `docker compose -f docker-compose.airflow.yml down` when no longer needed.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| production Airflow deploy | 이번 Phase 목표는 local smoke 연결이다. | not needed |
| MinIO/S3 storage smoke | 이번 Phase는 local shared volume handoff를 검증한다. | not needed |
| SparkRunner/M2 runtime smoke | 이번 Phase는 Airflow 연결과 M5 boundary 검증이다. | not needed |
