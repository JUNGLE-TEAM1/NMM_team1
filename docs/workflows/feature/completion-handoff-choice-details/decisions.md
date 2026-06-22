# Completion handoff choice details 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- No option brief needed; this is a small harness wording and validation guard refinement requested by the user.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Completion choice details | Require procedure, advantage, caution, and state-change explanation for each complete + PR-ready option | Helps humans choose between PR, hardening, next Phase, hold, and external approval without guessing what each option does | User requested on 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Long status output | Keep status output short and document details in workflow docs | Avoid noisy terminal output while preserving detailed guidance | Revisit if users want full menu printed by script |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Completion choice details | Choice descriptions become stale or too verbose | Update `docs/10-next-action-menu.md` and validation guard together |
