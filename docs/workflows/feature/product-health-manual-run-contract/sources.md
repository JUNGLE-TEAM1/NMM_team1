# Product Health Manual Run contract source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- PR 4 Source Snapshot branch/workspace: 팀원 담당, 아직 merge 전. 계약은 `source_snapshot_artifact_v1`와 parquet artifact URI를 기준으로 구두/채팅 공유함.
- PR #310 Product Health Gold v2: `chore/product-health-catalog-poc`, open PR. 같은 파일을 직접 수정하지 않되, PR 5A service가 Product Health contract files를 읽어 v2 merge 이후 값을 따라가도록 구현함.

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
| main | n/a | `218741b8` | 2026-06-30 | PR #305까지 merge된 최신 main에서 branch 생성 |
| PR #310 `chore/product-health-catalog-poc` | n/a | GitHub PR diff | 2026-06-30 | Gold v2 schema/version 확장. PR 5A는 dynamic contract file read로 대응 |

## Integration Notes / 통합 메모

- PR 5B는 `source_snapshot_inputs[].source_dataset_id`로 PR 4의 latest successful snapshot을 찾고, `artifact_uri`, `row_count`, `bytes`, `schema`를 채워야 한다.
- PR 6은 `catalog_payload.status`가 `pending_product_health_execution`인 payload를 등록 완료로 취급하지 않는다. 실제 성공 run에서 `storage_uri`와 metrics가 채워진 payload를 등록한다.
