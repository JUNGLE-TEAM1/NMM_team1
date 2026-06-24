# Trust State Model 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | Catalog dataset response에 `owner`, `trust_status`, `trust_gate_result`를 추가하고 `POST /api/catalog/datasets/{dataset_id}/trust-gate` 최소 계약을 기록 | API contract가 확장됨 | 낮음. baseline `status: ready`는 유지됨 |

## Integration Notes / 통합 메모

- `docs/05`, `docs/06`, `docs/07`은 이미 Trust Gate, Query/Ask 후보 차단, manual Trust Gate 점검 기준을 포함하므로 추가 수정하지 않았다.
- 다음 Source Connector / Query Policy Phase는 `trust_status`와 `trust_gate_result`를 소비 contract로 사용할 수 있다.

## Conflicts To Resolve / 해결할 충돌

- 현재 없음.
