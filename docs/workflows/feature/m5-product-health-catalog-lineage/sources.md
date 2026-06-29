# M5 Product-Health Catalog Lineage Sources

| Source | Purpose |
| --- | --- |
| `AGENTS.md` | Phase/workspace/report 규칙 확인 |
| `docs/00-layer-map.md` | Interface/schema 변경 전파 기준 확인 |
| `docs/03-interface-reference.md` | Week 2 contract package, route, ID, path, SQL context 기준 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Week 2 acceptance link |
| `docs/06-regression-and-failure-scenarios.md` | 실패 run / Catalog overwrite 회귀 기준 |
| `docs/07-manual-verification-playbook.md` | M5 manual verification 경로 |
| `backend/app/services/week2_workflow.py` | M5 Workflow/Catalog service 구현 |
| `backend/app/services/week2_airflow_adapter.py` | pipeline별 Airflow DAG routing 구현 |
| `airflow/dags/asklake_week2_product_health.py` | product-health Airflow smoke DAG 구현 |
| `frontend/product-health-airflow-demo.html` | 독립 product-health Airflow demo page 구현 |
| `backend/tests/test_week2_workflow_catalog.py` | M5 run/catalog regression tests |
| `decisions.md` | handoff/deferred decision 기록 |
