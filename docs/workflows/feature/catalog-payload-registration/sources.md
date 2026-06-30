# Catalog payload 기반 Catalog 등록 Source 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- 

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Direct Sources / 직접 읽은 source

| Source | Purpose |
| --- | --- |
| `AGENTS.md` | repository workflow and Korean artifact rules |
| `docs/00-layer-map.md` | interface/schema change propagation path |
| `docs/03-interface-reference.md` | Week 2 `ExecutionResult` and `CatalogMetadata` contract |
| `docs/05-acceptance-scenarios-and-checklist.md` | acceptance link for no path guessing |
| `docs/06-regression-and-failure-scenarios.md` | regression guard for `catalog_payload.storage_uri` |
| `docs/07-manual-verification-playbook.md` | Airflow/manual result verification steps |
| `docs/15-context-budget-rule.md` | Escalate Read rule for contract/data changes |
| `backend/app/services/week2_airflow_adapter.py` | Manual Run/Airflow result payload adapter |
| `backend/app/services/week2_workflow.py` | Catalog registration path |
| `backend/tests/test_week2_airflow_adapter.py` | adapter contract tests |
| `backend/tests/test_week2_workflow_catalog.py` | workflow/catalog regression tests |
| `contracts/execution_result.sample.json` | producer payload fixture |
| `contracts/catalog_metadata.sample.json` | consumer Catalog fixture |
| `contracts/catalog_metadata.product_health.sample.json` | product-health Catalog fixture alignment |

## Integration Notes / 통합 메모

- PR 5A final artifact shape는 아직 live 확인하지 않았다.
