# M6 Answer UX Metadata 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M1 answer UX source | M6 returns `answer_metadata`; M1 displays it without recomputing scoring | UI should not parse `summary` text or infer provider/fallback from route alone | User request / 2026-06-29 |

### M1은 answer metadata를 표시만 한다

- Decision: M6가 `source`, `provider`, `fallback_used`, `fallback_reason`, `used_evidence_indexes`, `grounding_state`를 반환한다.
- Reason: M1은 UI/UX 표시 책임만 갖고, M6 route/scoring/provider policy를 재계산하지 않아야 한다.
- Impact: `AIQueryResult`에 additive field가 추가되지만 기존 fields는 유지된다.

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
|  |  |  |  |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
|  |  |  |
