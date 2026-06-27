# M5 local/demo completion 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-27
- Changed: local Airflow compose, Week 2 repo DAG, Airflow result artifact handoff, adapter artifact read, env example, tests, `/etl` M5 demo cockpit UI, contract/acceptance/regression/manual verification docs, learning guides.
- Verified: TDD red/green, focused Week2 tests, full backend tests, frontend build, browser local runner smoke, DAG syntax, compose config, real local Airflow smoke, result artifact/output/Catalog, strict/integration harness validation.
- Remaining: production Airflow deployment, MinIO/S3, SparkRunner/M2 runtime, async UI are intentionally out of scope.
- Next context: this completes the M5 local/demo slice: local Airflow smoke plus `/etl` demo cockpit evidence. PR/review can follow; production-grade orchestration is a later slice.
- Risk: first run pulls a large Airflow image; `8080` must be available or `AIRFLOW_PORT` must be changed. The current branch is behind `origin/main`, so PR/sync must check remote conflicts.

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m5-airflow-smoke-integration`, `docs/workflows/feature/m5-airflow-smoke-integration`
- Date: 2026-06-27
- Workspace state: ready-for-review

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py -q
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_workflow_catalog.py -q
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests -q
npm run build
python3 -m py_compile airflow/dags/asklake_week2_reviews.py
docker compose -f docker-compose.airflow.yml config
docker compose -f docker-compose.airflow.yml up -d
curl -s http://localhost:8080/health
curl -s -u airflow:airflow http://localhost:8080/api/v1/dags/asklake_week2_reviews
curl -s -X POST http://127.0.0.1:18000/api/week2/workflows/pipeline_reviews_json_e2e/runs -H 'content-type: application/json' -d '{"executor":"airflow","triggered_by":"m5_owner"}'
curl -s -u airflow:airflow http://localhost:8080/api/v1/dags/asklake_week2_reviews/dagRuns/run_reviews_demo_065
curl -s http://127.0.0.1:18000/api/week2/catalog/dataset_reviews_gold
scripts/validate-harness.sh --strict
scripts/validate-harness.sh --integration
```

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`
- Environment: local Docker Airflow on `http://localhost:8080`, backend smoke server on `http://127.0.0.1:18000`
- Result: `run_reviews_demo_065` succeeded through Airflow. Result artifact and output JSONL were created under `data/week2`; Catalog lineage and metrics were updated.
- UI Result: browser smoke at `/etl` created `run_reviews_demo_069`; four verdict cards, output URI, matching `CatalogMetadata.lineage.run_id`, and raw JSON evidence were visible; browser error logs 0.
- Evidence: Airflow DAG run state `success`; backend run status `succeeded`; `data/week2/_airflow_results/run_reviews_demo_065.json`; `data/week2/reviews/gold/run_id=run_reviews_demo_065/dataset_reviews_gold.jsonl`; UI smoke run `run_reviews_demo_069`.

## Final Judgment / 최종 판단

- Done: yes, for M5 local/demo slice.
- Remaining risk: production orchestration, object storage, Spark runtime, and UI async polling are not included in this slice.
