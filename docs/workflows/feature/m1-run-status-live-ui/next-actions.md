# M1 Run Status Live UI next actions

## Recommended Next Action

- Phase 3 `M1 Catalog Live UI`를 진행한다.
- Reason: `/runs`가 M5 run result를 소비하기 시작했으므로, 다음 발표 흐름은 output dataset을 `/catalog`와 detail 화면에서 확인하는 것이다.

## Options

| Option | Action | When to Choose |
| --- | --- | --- |
| 1 | Phase 3 진행 | PR review/CI가 통과하고 `/catalog` live metadata 연결로 넘어갈 때 |
| 2 | backend 포함 smoke 보강 | M5 backend dev server를 바로 켤 수 있고 run 성공 payload를 검증하고 싶을 때 |
| 3 | 보류 | M5 `ExecutionResult` 또는 catalog payload shape가 곧 바뀔 예정일 때 |

## 다음 작업 후보

- `/catalog`와 catalog detail 화면에서 `getWeek2Catalog("dataset_reviews_gold")`를 호출한다.
- run 전 404 또는 empty catalog 상태를 정상 안내로 표시한다.
- schema, metrics, storage, lineage를 placeholder 대신 live payload 기반으로 표시한다.
- 가능하면 backend dev server와 함께 run -> catalog 수동 smoke를 진행한다.

## 보류

- polling
- executor selection UI
- M5 backend 변경
- M6 query 화면 연결
