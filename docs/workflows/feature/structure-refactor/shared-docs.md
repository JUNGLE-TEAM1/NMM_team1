# Structure refactor 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | frontend layering을 resource API client, feature hook, render component 구조로 갱신 | 구현 구조와 Source of Truth를 맞추기 위해 | 낮음 |
| `docs/03-interface-reference.md` | 직접 변경 없음 | API contract는 유지된다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 직접 변경 없음 | acceptance behavior는 유지된다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 직접 변경 없음 | 기존 smoke/regression 경로가 유지된다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 직접 변경 없음 | M5 demo script는 그대로 유효하다. | 낮음 |

## Integration Notes / 통합 메모

- `asklakeClient.js`는 기존 import 호환을 위해 re-export entrypoint로 남겼다. 신규 코드는 resource별 API client를 우선 사용한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
