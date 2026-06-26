# M1 Catalog Live UI next actions

## Recommended Next Action

- PR 생성과 CI 확인 후, 다음 Phase인 `M1 AI Query Live UI`로 이동한다.
- Reason: run과 catalog가 live API를 소비하므로, 다음 발표 흐름은 M6 `AIQueryResult`를 `/ask`에서 표시하는 것이다.

## Options

| Option | Action | When to Choose |
| --- | --- | --- |
| 1 | PR 생성 | local validation이 통과했을 때 |
| 2 | latest main sync | PR이 behind-main 또는 conflict로 막힐 때 |
| 3 | Phase 4 진행 | PR review/CI가 통과하고 M6 query 화면 연결로 넘어갈 때 |
| 4 | 보류 | M5 CatalogMetadata shape가 곧 바뀔 예정일 때 |

## 다음 작업 후보

- `/ask`에서 `askWeek2AiQuery(question)`을 호출한다.
- SQL, rows, summary, evidence, selected catalog를 표시한다.
- catalog가 없을 때 먼저 run/catalog를 생성하라는 안내를 표시한다.

