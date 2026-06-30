# Full Browser Demo Smoke decisions

- Decision status: accepted

## Accepted Decisions

| Decision | Rationale | Date |
| --- | --- | --- |
| C-40은 검수 Phase로 둔다. | 전체 흐름에서 나온 문제를 한 Phase에서 모두 고치면 scope가 커지므로 gap 분류와 Hotfix 생성이 더 안전하다. | 2026-06-30 |
| High/Medium findings는 별도 Hotfix 후보로 분리한다. | core path는 통과했지만 데모 안정성 이슈를 한 번에 섞어 고치면 scope가 커진다. | 2026-07-01 |

## Deferred Decisions

| Decision | Deferred reason | Revisit trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 발견된 UI/UX 문제 일괄 수정 | 검수 결과가 나온 뒤 severity에 따라 분리한다. | C-40 browser smoke 결과 | Hotfix 또는 후속 Phase |
