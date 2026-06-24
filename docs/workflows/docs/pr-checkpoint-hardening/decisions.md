# PR checkpoint hardening 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Decision Option Brief not needed. The selected hardening is low-risk and directly follows the user's approved prompt.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Dirty checkpoint scope | Track only existing Git modifications/deletions in automatic checkpoint | Prevent `.DS_Store`, personal drafts, and unrelated untracked files from entering history | user prompt / 2026-06-24 |
| Small change PR wording | Treat `PR 진행` in Small Change Completion Decision as entry to `Pre-PR Human Checkpoint` | Keep small-change menu from bypassing remote-action confirmation | user prompt / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Dirty checkpoint scope | A future workflow needs untracked files in automatic checkpoint | Add explicit opt-in flag or human-confirmed stage step with regression coverage |
