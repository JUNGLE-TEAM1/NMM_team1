# Product Health Manual Run execution 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | `TargetDatasetRunCreate.source_snapshots[]`, Product Health success/failure status, Product Health handoff scope를 추가 | PR 4/5B/6/7/8이 공유할 run result 계약 | 중간: PR 4/6과 같은 필드명을 유지해야 함 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Product Health snapshot 기반 성공 실행과 snapshot 누락 실패 기준 추가 | acceptance가 PR 5A pending 계약에 머무르지 않게 함 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | snapshot 없이 성공처럼 보이는 실패 시나리오 추가 | Catalog/AI Query가 실패 run을 성공 dataset으로 소비하지 않게 보호 | 중간 |
| `docs/07-manual-verification-playbook.md` | Product Health run의 missing snapshot 실패와 source snapshot 성공 확인 절차 추가 | 발표 전 API/manual smoke 경로 정렬 | 낮음 |

## Integration Notes / 통합 메모

- PR 4가 latest snapshot 저장소를 붙이면 `source_snapshots[]`와 같은 shape를 `source_dataset_id` 기준으로 조회할 수 있어야 한다.
- PR 6은 `catalog_payload.status=ready_for_catalog_registration`인 run만 Catalog 등록 대상으로 삼는다.

## Conflicts To Resolve / 해결할 충돌

- 없음. 단, PR #312가 merge되기 전이면 PR 5B는 #312 위에 쌓인 stacked branch로 PR을 올려야 한다.
