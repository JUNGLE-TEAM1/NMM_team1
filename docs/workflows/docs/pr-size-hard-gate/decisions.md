# PR Size Hard Gate 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

| Decision | Options Considered | Selected | Reason |
| --- | --- | --- | --- |
| Size hard gate | warning only / hard gate / hard gate with override | hard gate with override | 사용자가 시스템에서 막고 문제되면 완화하는 방향을 선택했다. |

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| PR size hard gate threshold | 10 non-evidence files, 600 non-evidence lines | 큰 PR을 기본 차단하되 evidence 파일 때문에 막히지 않게 함 | user / 2026-06-26 |
| Override | `Large PR Exception: approved` | 드문 대형 PR은 사람이 명시 승인할 수 있게 함 | user / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Risky path hard gate | 위험 경로는 사람 판단 요소가 커서 warning 유지 | risky path warning 무시가 반복될 때 | follow-up risk policy phase |
| CODEOWNERS review | ownership 기준 미확정 | ownership 기준 확정 시 | follow-up ownership phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 10 files / 600 lines | 정상 작업이 자주 막힘 | threshold 완화 또는 evidence exclusion 조정 |
