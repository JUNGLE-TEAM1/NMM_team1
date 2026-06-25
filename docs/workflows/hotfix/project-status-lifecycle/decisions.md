# Project status lifecycle 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Project status lifecycle layering | `docs/11-git-sync-policy.md` owns detailed lifecycle; `docs/04`, `docs/08`, `docs/10` keep thin references | 규칙 중복을 줄이고 PR/issue/Project 운영 정책 위치를 명확히 하기 위해 | user prompt / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
|  |  |  |  |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Project status lifecycle layering | 다른 문서가 lifecycle 세부를 다시 중복하기 시작하면 | `docs/11`로 상세를 되돌리고 참조 문서만 얇게 정리 |
