# Week2 M3 JSON main path decision 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- M3 JSON main path selection: Amazon Reviews JSON first, with PR #105 used as source material rather than merged directly.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M3 main path | Amazon Reviews JSON / JSONL sample first | Phase 3 main E2E path를 code 구현으로 이어가기 위해 선택 | User request to proceed through Phase 6 / 2026-06-25 |
| PR #105 handling | Selective recovery, not direct merge | PR #105는 JSON inspection 재료가 있지만 UI/API/source catalog까지 범위가 넓고 runner boundary 전 code 결합 위험이 있음 | User request to proceed through Phase 6 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Runner boundary fields | Phase 6까지 보류 | `TransformSpec`, `SchemaDefinition`, runner result shape 결정 필요 | Phase 6 `docs/week2-runner-boundary-decision` |
| M3 code function names | implementation PR까지 보류 | PR #105에서 회수할 함수/타입 이름은 code context에서 결정 | Future M3 implementation branch |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| PR #105 selective recovery | JSON profile logic이 current main schema와 충돌함 | 더 작은 adapter/test slice로 분해하거나 별도 interface decision 작성 |
