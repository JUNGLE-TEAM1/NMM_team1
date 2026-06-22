# Harness flow consistency audit 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

-

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| `PR 진행` wording normalization | Keep merge/finalize included in `PR 진행`; clarify stop conditions separately | Matches team rule and prevents reverting to PR-create-only interpretation | Codex / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| none | none | none | none |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Completion handoff wording becomes ambiguous again | Re-run harness flow consistency audit and strengthen validation guard |
