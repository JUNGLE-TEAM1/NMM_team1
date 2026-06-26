# Guardrail Scenario Audit 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

| Decision | Options Considered | Selected | Reason |
| --- | --- | --- | --- |
| scenario audit 실행 위치 | every-PR hard gate / read-only manual or scheduled audit / remote-changing E2E | read-only manual or scheduled audit | 운영 lifecycle drift는 remote state와 noise tolerance에 의존하므로 매 PR hard fail보다 audit이 적합하다. |
| PR size/risk 처리 | hard fail / advisory warning / no check | advisory warning | 크기 기준은 사람 판단 요소가 커서 지금은 리뷰 보조가 적합하다. |
| admin setting 확인 | 이번 Phase에서 변경 / read-only 후속 / 미기록 | read-only 후속 | branch protection, required checks, secret scanning은 repo admin 권한과 팀 합의가 필요하다. |

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Test tier split | Tier 1 PR CI, Tier 2 read-only audit, Tier 3 admin audit, Tier 4 human-approved E2E | 강제 가능한 단위와 사람 판단 흐름을 분리 | Phase execution / 2026-06-26 |
| No PR size hard gate | PR size/risk hard gate 추가 없음 | 크기 기준은 사람 판단 요소가 커서 advisory warning으로 유지 | Phase execution / 2026-06-26 |
| Main system guardrails | GitHub ruleset + secret scanning + migration/schema/security required check | 사용자가 시스템 강제 적용을 명시 지시했고, 기계가 안정적으로 감지/차단 가능한 항목이다. | User / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| branch protection/required checks 실제 PR 동작 확인 | ruleset은 적용됐지만 새 required workflow는 이 branch가 PR로 올라간 뒤 실제 check 표시를 확인해야 한다 | PR 생성 후 checks 확인 시 | current PR handoff |
| PR risk warning hard gate 승격 | 기준과 override 정책이 사람 판단 영역 | 큰 PR warning이 반복되고 리뷰 병목이 실제로 발생할 때 | follow-up risk policy phase |
| read-only scenario audit script 추가 | 이번 Phase는 테스트 계획과 책임 경계 정리까지가 목표 | 팀이 scheduled/manual audit 실행을 원할 때 | follow-up guardrail audit automation |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| read-only scenario audit 우선 | drift가 반복적으로 merge 직전에만 발견됨 | fixture 또는 manual workflow로 자동화 범위 확대 검토 |
| no hard PR risk gate | 대형 PR이 반복적으로 장애를 유발함 | threshold, override label, reviewer approval 정책 재논의 |
