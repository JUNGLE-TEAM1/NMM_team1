# M2 SQL runtime smoke source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m2-minio-object-upload`
- `docs/workflows/docs/m6-sql-first-week2-buildup`

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
| `feature/m2-minio-object-upload` | `docs/workflows/feature/m2-minio-object-upload` | `5d05bea` | 2026-06-27 | M2 storage/local fallback/MinIO context |
| `docs/m6-sql-first-week2-buildup` | `docs/workflows/docs/m6-sql-first-week2-buildup` | `5d05bea` | 2026-06-27 | M6 SQL MVP 우선순위와 M2 SQL runtime ownership |

## Integration Notes / 통합 메모

- 이번 branch는 두 source branch를 코드로 통합하지 않고, main에 merge된 evidence를 읽어 후속 구현 범위를 정했다.
