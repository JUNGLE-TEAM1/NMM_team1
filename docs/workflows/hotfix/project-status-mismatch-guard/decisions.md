# Project status mismatch guard 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

-

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Project mismatch handling | detect + recommend human-approved alignment | 자동으로 Project Status를 바꾸면 사람이 의도적으로 둔 운영판 상태를 덮을 수 있으므로, 감지와 승인형 보정 안내만 강화한다. | user prompt / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| GitHub Project automation rule edit | GitHub Project 설정 변경은 repo 파일 변경이 아니며 별도 사람 확인이 필요하다. | Project automation이 계속 closed issue를 `Ready`로 되돌릴 때 | 별도 운영 보정 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Project mismatch handling | Project Status lookup이 권한 문제로 status summary를 불안정하게 만들면 | lookup failure를 더 조용한 warning으로 낮추거나 문서 안내만 유지 |
