# Guardrail protocol split 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 하네스 책임 경계 | 강제 가능한 안전장치는 GitHub/CI/platform, 하네스는 협업 프로토콜 | 룰 증식과 엣지케이스 비용을 줄이면서 실제 차단은 시스템에 맡기기 위해 | user / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 repository settings 적용 | repo admin 권한과 팀 합의가 필요하며 이번 Phase 범위가 문서 정리임 | `docs/system-guardrails.md`에서 `requires-admin` 또는 `planned` 항목 확정 후 | follow-up system guardrail application Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| guardrail/protocol split | 하네스 문서가 강제 룰을 반복하거나 협업 프로토콜이 사라지는 경우 | `docs/system-guardrails.md`와 관련 Source of Truth 문서를 재정렬 |
