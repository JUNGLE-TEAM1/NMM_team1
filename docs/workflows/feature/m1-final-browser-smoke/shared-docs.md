# M1 final browser smoke 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md` | M1 후속 Phase Queue 6~10 추가 | 사용자가 M1이 지금 할 수 있는 작업을 모두 진행할 수 있게 Phase를 생성하라고 지시했다. | low; project context 문서이며 제품 API/schema 계약은 변경하지 않는다. |

## Integration Notes / 통합 메모

- `/etl -> /catalog -> /query` smoke는 통과했지만 `/etl`의 `Catalog detail` CTA가 `/dataset` placeholder로 이동하는 follow-up이 있다.
- Product Health 대표 경로 완료 증거가 아니라 `dataset_reviews_gold` supporting path smoke evidence다.

## Conflicts To Resolve / 해결할 충돌

- none
