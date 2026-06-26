# M5 Airflow Adapter source 기록

## Primary Sources

| Source | Reason |
| --- | --- |
| `backend/app/services/week2_airflow_adapter.py` | 구현 대상 |
| `backend/app/services/week2_workflow.py` | Airflow fallback 소비자 |
| `backend/tests/test_week2_workflow_catalog.py` | existing workflow fallback/success tests |
| `contracts/execution_result.sample.json` | result contract |
| `contracts/workflow_definition.sample.json` | Airflow runner context |
| `docs/workflows/codex/m5-airflow-adapter/decisions.md` | workspace decision handoff |

## Excluded local files

- `docs/project-context/asklake-week2-module-plan/ver2/m5-technical-depth-study-guide.md`: untracked local note; read for context only, not staged.
