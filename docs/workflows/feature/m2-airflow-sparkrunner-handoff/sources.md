# M2 Airflow SparkRunner handoff source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- 별도 source branch를 병합하지 않는다. 현재 `main` 기준 M2/M5 경계를 보강한다.

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
| `main` | `docs/project-context/asklake-week2-module-plan/ver2` | `76e7ac45` | 2026-06-29 | runner boundary와 M5 Airflow integration option 확인 |
| `main` | `docs/workflows/feature/m2-workflow-runner-integration` | `76e7ac45` | 2026-06-29 | `spark_runner` direct executor와 M5 workflow service 연결 확인 |
| `main` | `docs/workflows/feature/m2-docker-spark-minio-output-smoke` | `76e7ac45` | 2026-06-29 | M2 남은 후속 작업과 MinIO/S3 범위 확인 |

## Integration Notes / 통합 메모

- 현재 열린 M5 PR #269는 Airflow/DAG/UI 쪽 작업이다. 이 branch는 M5 PR을 건드리지 않고, M5가 호출할 수 있는 M2-owned CLI를 제공한다.
