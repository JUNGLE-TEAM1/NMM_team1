# External connection persistence 결정 기록

| Decision | Status | Rationale |
| --- | --- | --- |
| credential 저장 | deferred | C-1은 `credential_ref` metadata만 저장하고 실제 secret value는 저장하지 않는다. |
| connection test | deferred | 실제 외부 시스템 연결은 connector/runtime Phase로 분리한다. |
| External Connection contract | accepted | UI의 External Connection은 새 독립 개념이 아니라 기존 `SourceConnection` / `SourceConfig.connection_ref`의 사용자-facing label로 매핑한다. |
| 새 `/api/external-connections` 생성 | deferred | 기존 `/sources`, Week2 `SourceConfig`, Source Connector boundary와 충돌 가능성이 있어 구현 전 최소 API/fixture adapter 선택을 별도 확인한다. |
| M3/M4 source-specific options | accepted | CSV/JSON/JSONL option은 M3, Kafka option은 M4 계약을 우선하고 C-1은 공통 connection reference까지만 담당한다. |
