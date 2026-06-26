# M1 AI Query Live UI 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Query result source | `AIQueryResult.query_result` 우선 | Week 2 Source of Truth에서 canonical SQL execution result로 정의되어 있다. | Phase implementation / 2026-06-26 |
| Evidence rendering | optional grounding fields defensive rendering | M6 #152 fields는 additive optional shape이므로 없는 값 때문에 UI가 깨지면 안 된다. | Phase implementation / 2026-06-26 |
| M1 responsibility boundary | M1은 SQL/summary/evidence를 생성하지 않음 | M6 책임인 retrieval/scoring/summary 생성과 M1 표시 책임을 분리한다. | Phase implementation / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 8000번 container rebuild | 현재 작업은 UI 연결이며 container rebuild/compose 재기동은 PR 범위 밖이다. | demo smoke를 기본 5173/8000 조합에서 다시 해야 할 때 | follow-up or operator action |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 8000번 backend가 오래된 route를 계속 제공 | latest container rebuild 또는 13000/18000 host smoke 경로 사용 |
