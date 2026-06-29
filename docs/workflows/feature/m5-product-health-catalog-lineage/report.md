# M5 Product-Health Catalog Lineage 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-06-29
- Changed: M5 workflow/catalog가 `pipeline_product_health_e2e`와 `dataset_product_health_gold`를 인식하고, product-health Airflow smoke DAG와 독립 demo page까지 확인 경로를 추가했다.
- Verified: product-health Airflow routing focused, frontend build, combined focused suite, Docker Airflow live smoke, standalone UI Airflow smoke, `git diff --check`, strict harness 통과.
- Remaining: 실제 5GB product-health transform/runner는 M2/M3 후속 연결 대상이다.
- Next context: M6는 `dataset_product_health_gold` Catalog의 `storage.local_fallback_path`, `query.table_name=gold_product_health`, `query.allowed_columns`를 읽어 DuckDB query를 붙일 수 있다.
- Risk: 현재 product-health runner와 Airflow DAG는 M5 계약 고정용 smoke fixture이며, 발표용 실제 evidence는 M2/M3 runner 결과로 교체해야 한다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: current branch `feature/m5-airflow-smoke-integration`, workspace `docs/workflows/feature/m5-product-health-catalog-lineage/`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Lite Read with targeted implementation reads
- Branch note: 기존 dirty 변경 때문에 branch 전환은 수행하지 않음.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

## Goal / 목표

- `pipeline_product_health_e2e` 실행 결과를 M5 표준 run/catalog/lineage로 연결한다.

## Implementation Summary / 구현 요약

- `Week2WorkflowService`를 pipeline id별 workflow bundle registry로 확장했다.
- product-health run id sequence를 `run_product_health_demo_###`로 분리했다.
- product-health fixture contract와 handoff runner를 추가했다.
- `dataset_product_health_gold` Catalog에 `gold_product_health` table name, allowlist, schema, metrics, lineage를 저장한다.
- 실패한 product-health run이 latest successful Catalog를 덮지 않는 테스트를 추가했다.
- `asklake_week2_product_health` Airflow DAG를 추가했다.
- `Week2AirflowAdapter`가 `pipeline_id`별로 DAG id를 선택하도록 확장했다.
- `frontend/product-health-airflow-demo.html` 독립 demo page를 추가했다.
- product-health Catalog가 로컬 metadata에 함께 있을 때도 리뷰 질문은 reviews Catalog를 우선 선택하도록 `CatalogRetriever` tie-break를 보강했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py -q
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_ai_query.py -q
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_airflow_adapter.py -q
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_ai_query_duckdb.py -q
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_ai_query.py backend/tests/test_week2_spark_runner.py backend/tests/test_week2_airflow_adapter.py backend/tests/test_week2_ai_query_duckdb.py -q
cd frontend && npm run build
docker compose -f docker-compose.airflow.yml up -d
curl -s -u airflow:airflow http://127.0.0.1:8080/api/v1/dags/asklake_week2_product_health
curl -s -X POST http://127.0.0.1:8002/api/week2/workflows/pipeline_product_health_e2e/runs -H 'Content-Type: application/json' -d '{"executor":"airflow","triggered_by":"m5_airflow_live_smoke"}'
curl -s http://127.0.0.1:8002/api/week2/catalog/dataset_product_health_gold
git diff --check
scripts/validate-harness.sh --strict
```

## Regression Guard / 회귀 보호

- Checked feature: M5 reviews workflow/catalog, product-health workflow/catalog, Airflow fallback/success/routing, Docker Airflow DAG live run, Spark runner smoke, standalone demo page build and UI smoke.
- Protected behavior: 실패 run은 run history에 남지만 latest successful Catalog를 덮지 않는다.
- Result: focused tests passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`의 Week 2 M5 Airflow local smoke와 product-health Airflow demo page 점검.
- Environment: Docker Airflow compose, backend `http://127.0.0.1:8002`, frontend `http://127.0.0.1:5173/product-health-airflow-demo.html`.
- Result: Airflow DAG `asklake_week2_product_health` 로드, `run_product_health_demo_003` API smoke 성공, `run_product_health_demo_004` UI smoke 성공.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Week 2 M5 product-health path acceptance.
- Status: implemented for M5 contract/catalog layer.
- Evidence: `backend/tests/test_week2_workflow_catalog.py`, `backend/tests/test_week2_airflow_adapter.py`, Airflow run `run_product_health_demo_003`, UI run `run_product_health_demo_004`.

## Secret / Migration / Env Check

- Secret check: 새 secret 없음.
- Migration/data change: DB migration 없음. local Parquet handoff fixture output만 생성.
- Env change: Airflow live smoke에서만 `ASKLAKE_WEEK2_AIRFLOW_BASE_URL`, `ASKLAKE_WEEK2_PRODUCT_HEALTH_AIRFLOW_DAG_ID`, Airflow basic auth env를 사용했다. 새 secret 값은 추가하지 않았다.

## Final Judgment / 최종 판단

- Done: M5 product-health workflow/catalog/lineage contract와 Airflow/UI 확인 경로 구현.
- Remaining risk: 실제 5GB input evidence와 transform semantics는 M2/M3 후속 runner가 제공해야 한다.
