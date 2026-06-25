# No issue finalize fix 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Not needed. This is a narrow helper bug fix discovered while finalizing PR #79.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| No-issue finalize behavior | Allow PR finalize without linked issue; set issue status to `n/a` | `--no-issue` is an allowed workspace exception and PR #79 used it | Codex / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| No-issue finalize | linked issue later becomes mandatory again | restore failure when issue is missing |
