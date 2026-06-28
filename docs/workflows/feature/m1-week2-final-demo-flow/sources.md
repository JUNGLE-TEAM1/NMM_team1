# M1 Week2 final demo flow source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `origin/feature/m5-airflow-smoke-integration`: M5 local Airflow smoke와 `/etl` demo cockpit UI 변경 범위 확인.
- `origin/feature/m6-duckdb-runtime-integration`: M6 DuckDB runtime 기본 연결과 `query_result.engine="duckdb"` smoke 확인.

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
| `origin/main` | n/a | `e640f90` | 2026-06-27 | branch base |
| `origin/feature/m5-airflow-smoke-integration` | `docs/workflows/feature/m5-airflow-smoke-integration` | `7189450` | 2026-06-27 | `/etl` UI를 직접 복제하지 않고 충돌 위험만 확인 |
| `origin/feature/m6-duckdb-runtime-integration` | `docs/workflows/feature/m6-duckdb-runtime-integration` | `bad0c9e` | 2026-06-27 | DuckDB runtime display 기준 확인 |

## Integration Notes / 통합 메모

- 이번 branch는 source branches를 merge하지 않는다. 최신 응답 shape와 demo flow 위험만 문맥으로 사용한다.
