# M1 Demo Click Flow Polish 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Demo flow navigation | route CTA only | Phase 5는 presentation polish이며 backend contract를 만들지 않는다. | Phase implementation / 2026-06-26 |
| Demo questions | fixed candidate buttons call M6 API | M1이 답변을 생성하지 않고 M6의 `AIQueryResult` 생성 책임을 유지한다. | Phase implementation / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Full browser click automation | in-app browser control timeout으로 route/CTA/API smoke 대체 | Browser control 안정화 또는 발표 직전 수동 확인 시 | manual verification |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| CTA가 fake success처럼 보임 | 문구를 route handoff 중심으로 유지하고 M6/API 결과만 성공으로 표시한다. |
