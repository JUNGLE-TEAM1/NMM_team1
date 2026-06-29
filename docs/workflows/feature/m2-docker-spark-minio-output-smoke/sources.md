# M2 Docker Spark MinIO output smoke source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m2-minio-object-upload`
- `docs/workflows/feature/m2-taxi-scale-evidence`
- `docs/workflows/feature/m2-docker-spark-taxi-evidence`

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
| `feature/m2-minio-object-upload` | `docs/workflows/feature/m2-minio-object-upload` | current `main` | 2026-06-29 | 기존 MinIO actual upload smoke와 `Week2StorageAdapter` 계약을 확인했다. |
| `feature/m2-taxi-scale-evidence` | `docs/workflows/feature/m2-taxi-scale-evidence` | current `main` | 2026-06-29 | Taxi Spark local + MinIO upload smoke가 이미 성공했음을 확인했다. |
| `feature/m2-docker-spark-taxi-evidence` | `docs/workflows/feature/m2-docker-spark-taxi-evidence` | current `main` | 2026-06-29 | Docker Spark master/worker/driver 실행 경로를 확인했다. |

## Integration Notes / 통합 메모

- 이번 branch는 위 세 작업을 새로 다시 만드는 것이 아니라, Docker Spark evidence script에서 MinIO upload smoke를 한 번에 실행할 수 있게 연결한다.
