# Small change PR decision 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. 사용자가 구체적 보강 범위와 완료 기준을 제시했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Small change PR default | 팀 공유 산출물이면 PR 기본값 | 작은 변경이라도 main 기준으로 남겨야 하면 팀 review/history가 필요함 | user request / 2026-06-24 |
| Included/excluded file separation | PR 전 파일 분리 필수 | `.DS_Store`, 개인 초안, unrelated untracked file 혼입 방지 | user request / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `scripts/start-workflow.sh` dirty checkpoint hardening | script behavior change는 별도 테스트와 범위가 필요함 | checkpoint가 unrelated untracked file을 포함하는 문제가 반복됨 | future harness script hardening Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Small Change PR Decision | 작은 변경이 개인 초안인지 팀 공유 산출물인지 모호함 | `Small Change Completion Decision` 메뉴로 사람 선택을 받음 |
