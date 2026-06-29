# External connection persistence 결정 기록

| Decision | Status | Rationale |
| --- | --- | --- |
| credential 저장 | deferred | C-1은 `credential_ref` metadata만 저장하고 실제 secret value는 저장하지 않는다. |
| connection test | deferred | 실제 외부 시스템 연결은 connector/runtime Phase로 분리한다. |

## Decision Option Briefs / 결정 옵션 브리프

- not needed yet

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
