# M2 MinIO S3-compatible storage adapter source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- not an integration workspace

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
| `main` | n/a | `58931a4` | 2026-06-27 | PR #169 merge 후 최신 main에서 시작 |

## Integration Notes / 통합 메모

- `feature/m2-taxi-local-batch-evidence`에서 남긴 Taxi out-of-period 품질 맥락은 이번 PR 범위가 아니다.
- M3/M5/M6 handoff에는 `RuntimeConfig.storage`, `CatalogMetadata.s3_uri`, `storage.local_fallback_path`를 사용한다.
