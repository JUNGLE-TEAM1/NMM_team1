# M5 Overview Demo Guide source 기록

## Primary Context Read

| Source | Why |
| --- | --- |
| `AGENTS.md` | repository 작업 규칙 |
| `docs/00-layer-map.md` | 변경 영향 계층 확인 |
| `docs/15-context-budget-rule.md` | Context Budget mode 확인 |
| `docs/project-context/asklake-week2-module-plan/ver2/README.md` | Week2 ver2 M5 책임 문맥 |
| `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md` | 기존 `/etl` 학습 가이드 |
| `docs/03-interface-reference.md` | Week2 M5 contracts/API/status 기준 |
| `docs/05-acceptance-scenarios-and-checklist.md` | M5 acceptance 항목 |
| `docs/06-regression-and-failure-scenarios.md` | M5 failure/regression 기준 |
| `docs/07-manual-verification-playbook.md` | M5 manual verification 경로 |

## Code Context Read

| Source | Why |
| --- | --- |
| `frontend/src/app/App.jsx` | `/etl` M5 demo cockpit UI 흐름 |
| `frontend/src/api/week2Api.js` | frontend API client |
| `frontend/product-health-airflow-demo.html` | product-health standalone demo page |
| `backend/app/api/week2_workflow.py` | Week2 workflow API route |
| `backend/app/services/week2_workflow.py` | M5 핵심 service |
| `backend/app/services/week2_local_runner.py` | local runner 대표 경로 |
| `backend/app/services/week2_airflow_adapter.py` | Airflow adapter |
| `backend/app/services/week2_product_health_runner.py` | product-health handoff runner |
| `backend/app/services/week2_catalog_store.py` | run/catalog local persistence |
| `backend/tests/test_week2_workflow_catalog.py` | M5 run/catalog regression evidence |
| `backend/tests/test_week2_airflow_adapter.py` | Airflow adapter regression evidence |

## Related Reports

| Report | Why |
| --- | --- |
| `docs/reports/m5-airflow-smoke-integration.md` | M5 local/demo completion evidence |
| `docs/reports/m5-product-health-catalog-lineage.md` | product-health Catalog lineage evidence |
| `docs/reports/m5-local-runner-representative-path.md` | local runner representative path evidence |
| `docs/workflows/feature/m5-demo-cockpit-ui/report.md` | `/etl` demo cockpit UI evidence |

## Required Source Files / 읽어야 할 source 파일

이 workspace를 handoff할 때 아래 파일을 함께 본다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`
