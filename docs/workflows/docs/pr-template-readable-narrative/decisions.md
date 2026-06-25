# PR 템플릿 문단형 설명 보강 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. 사용자가 문단형 설명 템플릿 방향을 명시적으로 선택했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| PR body structure | 7섹션 문단형 handoff | 긴 audit checklist보다 리뷰어가 목적, 변경, 검증, 위험을 빠르게 이해하기 쉽다. | user / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 기존 remote PR 본문 재보정 | 이번 branch는 앞으로 생성되는 템플릿/자동 draft 보강만 다룸 | 사용자가 별도 remote cleanup을 요청할 때 | 별도 docs/ops 작업 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 7섹션 문단형 handoff | PR body가 다시 장황한 체크리스트가 되거나 핵심 검증 정보가 빠짐 | `.github/pull_request_template.md`와 `scripts/prepare-pr.sh`를 함께 조정 |
