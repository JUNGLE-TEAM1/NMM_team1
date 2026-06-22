# Internal step prompt standard 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- No separate option brief needed; this is a low-risk harness standardization that documents an existing convention.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Internal Step prompt storage | Store Step prompts in workspace `plan.md` under `## 내부 단계별 프롬프트` | Keeps Phase-wide and Step-level prompts in one branch planning file while quality/report/decision evidence stays in the existing files | User requested on 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Separate `steps.md` file | Avoided for now to keep the workspace file set stable | Revisit if `plan.md` becomes too large in multiple big Phases | Future harness cleanup |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Internal Step prompt storage | Step-level prompts become too noisy in `plan.md` | Consider a dedicated `steps.md` and update start/status/validation scripts |
