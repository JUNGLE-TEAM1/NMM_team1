# M5 Airflow smoke integration source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/docs/m5-airflow-integration-options/`

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
| docs/m5-airflow-integration-options | `docs/workflows/docs/m5-airflow-integration-options/` | `8812690` | 2026-06-27 | 추천안: separate compose + repo DAG + shared local volume + result artifact |

## Integration Notes / 통합 메모

- No multi-branch integration conflict. This feature branch carries the accepted option guide changes plus implementation.
