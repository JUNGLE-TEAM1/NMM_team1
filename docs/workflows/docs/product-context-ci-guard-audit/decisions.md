# Product context CI guard audit 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. Product context guard is a low-risk CI/static validation choice and does not change product scope.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Product context strict guard | Add CI-safe static anchors to `scripts/validate-harness.sh --strict` | MVP v1/current baseline and Target MVP drift is high-impact, but stable anchors avoid semantic overreach | user request / 2026-06-24 |
| Remote/human approval checks in CI | Exclude from CI | CI cannot reliably know human approval context or mutable GitHub remote state | user request / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Pre-PR checkpoint evidence hard enforcement | ready workspace PR intent can be ambiguous; current policy already records preferred section | repeated missing checkpoint evidence in ready PR workspaces | follow-up harness policy Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Product context strict guard | false positives on valid Korean/English mixed wording | narrow patterns or move to manual audit |
| Target MVP next phase anchor | team intentionally chooses a different first implementation Phase | update `docs/08` and validation guard together |
