# M2 MinIO 실제 업로드 smoke 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | local MinIO endpoint, credential env name, opt-in object upload smoke 기준 반영 | M2/M5/M6이 storage contract와 secret 처리 기준을 같이 봐야 한다. | 중간: RuntimeConfig fixture와 code가 함께 바뀐다 |
| `docs/06-regression-and-failure-scenarios.md` | storage URI/local fallback/object upload prefix drift 회귀 기준 보강 | local fallback과 remote object key가 갈라지는 실패를 막아야 한다. | 낮음 |

## Integration Notes / 통합 메모

- 이번 PR은 `docs/02`, `docs/05`, `docs/07`까지 넓히지 않는다. 계약과 회귀 기준은 `docs/03`, `docs/06`에만 최소 반영한다.
- M2는 object upload smoke를 제공하지만 bucket 운영 정책과 cloud credential 정책은 아직 소유하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- none
