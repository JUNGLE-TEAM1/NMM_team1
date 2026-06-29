# External connection persistence 결정 기록

- Decision status: mixed

| Decision | Status | Rationale |
| --- | --- | --- |
| credential 저장 | deferred | C-1은 `secret_ref` / `SourceConfig.connection_ref.secret_ref` metadata만 저장하고 실제 secret value는 저장하지 않는다. |
| connection test | deferred | 실제 외부 시스템 연결은 connector/runtime Phase로 분리한다. |
| External Connection contract | accepted | UI의 External Connection은 새 독립 개념이 아니라 기존 `SourceConnection` / `SourceConfig.connection_ref`의 사용자-facing label로 매핑한다. |
| 새 `/api/external-connections` 생성 | deferred | 기존 `/sources`, Week2 `SourceConfig`, Source Connector boundary와 충돌 가능성이 있어 구현 전 최소 API/fixture adapter 선택을 별도 확인한다. |
| M3/M4 source-specific options | accepted | CSV/JSON/JSONL option은 M3, Kafka option은 M4 계약을 우선하고 C-1은 공통 connection reference까지만 담당한다. |

## Decision Option Briefs / 결정 옵션 브리프

- not needed yet

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| External Connection contract | Existing `SourceConnection` / `SourceConfig.connection_ref` mapping | Existing M2~M6 contracts already define source connection/reference boundaries | User direction and workspace audit / 2026-06-29 |
| M3/M4 source options | Keep module ownership | M3 owns CSV/JSON/JSONL options and M4 owns Kafka options | Contract audit / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| New `/api/external-connections` route | It may duplicate existing `/sources` and Week2 `SourceConfig` boundary | Minimal persistence/API vs fixture adapter choice | C-1 implementation follow-up |
| Connection test | Real connector execution is outside C-1 demo-safe scope | Connector/runtime implementation phase | later connector/runtime phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| SourceConnection mapping | Existing backend route cannot represent reusable connection references | Write a Decision Option Brief before adding a new entity/API |
