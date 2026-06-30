# Product Health Manual Run contract 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | `TargetDatasetRun.execution_result.product_health_manual_run_contract` shape 추가 | PR 4/5B/6/7/8이 같은 Manual Run 결과 계약을 읽어야 함 | 중간: #310 Gold v2 계약과 schema_version/allowed_columns 동기화 필요 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Product Health Manual Run 계약 acceptance 항목 추가 | 실제 Gold 생성 전에도 pending handoff contract가 있어야 함 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | Product Health Manual Run 계약이 실행 완료처럼 보이지 않아야 하는 regression guard 추가 | PR 5A 계약 block이 Gold 완료/Catalog 완료로 오해되는 것을 방지 | 낮음 |
| `docs/07-manual-verification-playbook.md` | C-4 점검에 `product_health_manual_run_contract` 확인 단계 추가 | 사람이 API 응답에서 PR 5A 계약을 직접 확인 가능해야 함 | 낮음 |

## Integration Notes / 통합 메모

- PR 4는 `source_dataset_id` 기준 latest successful parquet snapshot을 제공하고, PR 5B는 이 contract의 `source_snapshot_inputs[]`를 실제 snapshot 값으로 채운다.
- PR 6은 성공 run에서 `catalog_payload.storage_uri`, `schema`, `metrics`, `lineage`, `query.allowed_columns`, `m3_contract_refs`를 Catalog 등록 입력으로 사용한다.
- #310이 머지되면 `contracts/product_health_*.sample.json`의 v2 schema/version을 이 service가 읽어 contract block에 반영한다.

## Conflicts To Resolve / 해결할 충돌

- #310과 직접 같은 파일 충돌은 없지만, Gold v2 계약이 머지된 뒤 focused test를 다시 돌려 schema/allowed_columns가 v2로 따라가는지 확인한다.
