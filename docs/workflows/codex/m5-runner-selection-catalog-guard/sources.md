# M5 Runner Selection Catalog Guard Sources

## Primary Sources

| Source | Reason |
| --- | --- |
| `AGENTS.md` | repository workflow rules |
| `docs/00-layer-map.md` | context loading and propagation routing |
| `docs/08-development-workflow.md` | branch workspace and Phase workflow |
| `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md` | current Week2 M1~M6 handoff basis |
| `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md` | M2/M3/M5 runner boundary |
| `backend/app/services/week2_workflow.py` | current M5 workflow implementation |
| `backend/app/services/week2_airflow_adapter.py` | current Airflow adapter boundary |
| `backend/tests/test_week2_workflow_catalog.py` | focused workflow/catalog behavior tests |

## Context Budget Mode

- Mode: Lite Read with targeted implementation reads
- Escalation trigger: interface/schema changes, real Airflow/Spark integration, PR-ready sync
