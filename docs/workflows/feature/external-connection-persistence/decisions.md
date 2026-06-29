# External connection persistence 결정 기록

| Decision | Status | Rationale |
| --- | --- | --- |
| credential 저장 | deferred | C-1은 `credential_ref` metadata만 저장하고 실제 secret value는 저장하지 않는다. |
| connection test | deferred | 실제 외부 시스템 연결은 connector/runtime Phase로 분리한다. |
