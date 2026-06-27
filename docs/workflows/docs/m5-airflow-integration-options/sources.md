# M5 Airflow integration option guide source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/codex/m5-airflow-adapter`

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
| `codex/m5-airflow-adapter` | `docs/workflows/codex/m5-airflow-adapter` | merged in `8812690` | 2026-06-26 | 직전 M5 adapter 작업과 남은 Airflow runtime smoke 문맥 확인 |

## Integration Notes / 통합 메모

- 주요 참고 문서: `AGENTS.md`, `docs/00-layer-map.md`, `docs/14-decision-option-brief.md`, `docs/project-context/asklake-week2-module-plan/ver2/README.md`, `revised-nonoverlap-responsibility.md`, `runner-boundary-decision.md`, `docs/reports/m5-airflow-adapter.md`
- 주요 참고 코드: `backend/app/services/week2_airflow_adapter.py`, `backend/app/services/week2_workflow.py`, `docker-compose.yml`
