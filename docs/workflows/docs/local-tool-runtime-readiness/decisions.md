# Local Tool Runtime Readiness 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. This Phase clarifies an execution rule and keeps host-level install behind human confirmation.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Safe start boundary | installed local-only runtime may be started by AI | prevents avoidable validation skips without expanding into install/cloud actions | user request / 2026-06-24 |
| Host-level install boundary | host-level install, license, admin elevation, system service, cost/external resource need human confirmation | these can change the user's machine or incur external risk | user request / 2026-06-24 |
| Script changes | no smoke/helper script change in this Phase | the incident is covered by docs rule; automation can be evaluated later | Codex / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| tool-specific installer automation | out of scope for this docs rule | repeated readiness failures for the same tool | future harness tooling Phase |
| BuildKit fallback in smoke script | script behavior change needs separate risk/test review | default BuildKit path keeps failing in local/CI | future script hardening Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Safe start rule | agent starts a runtime that asks for license/admin/secret/cost approval | stop and require human confirmation |
| Readiness evidence | skipped checks appear without readiness attempt | update `quality.md` and report before PR |
