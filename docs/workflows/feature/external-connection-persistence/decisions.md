# External connection persistence 결정 기록

| Decision | Status | Rationale |
| --- | --- | --- |
| credential 저장 | deferred | C-1은 `credential_ref` metadata만 저장하고 실제 secret value는 저장하지 않는다. |
| connection test | deferred | 실제 외부 시스템 연결은 connector/runtime Phase로 분리한다. |
| External Connection contract | accepted | UI의 External Connection은 새 독립 개념이 아니라 기존 `SourceConnection` / `SourceConfig.connection_ref`의 사용자-facing label로 매핑한다. |
| 새 `/api/external-connections` 생성 | accepted | 실제 credential/connection test 없이 metadata와 inspect preview만 저장하는 최소 persistence API로 제한한다. Source Dataset은 이 connection id/name/type을 참조한다. |
| M3/M4 source-specific options | accepted | CSV/JSON/JSONL option은 M3, Kafka option은 M4 계약을 우선하고 C-1은 공통 connection reference까지만 담당한다. |
