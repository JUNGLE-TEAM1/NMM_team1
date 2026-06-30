# External connection runtime checks 결정 기록

- Decision status: accepted

## 결정

- C-25는 schema discovery가 아니라 lightweight connection test로 제한한다.
- `secret_refs`는 env var name만 허용하고 raw credential field는 거부한다.
- UI는 `/connections` 목록 아래 read-only runtime check panel로 제공한다.

## Deferred Decisions

| Decision | Reason | Revisit Trigger | Target |
| --- | --- | --- | --- |
| connector별 schema discovery | DB/S3/Kafka schema/sample discovery는 connection test보다 큰 범위다 | C-26 시작 | `feature/source-dataset-runtime-discovery` |
| connection test result persistence | 이번 Phase는 test response와 UI smoke까지만 다룬다 | audit/evidence 요구 시 | 후속 Phase |
| credential secret backend | 현재는 local env reference로만 검증한다 | 실제 운영 credential 필요 시 | 별도 security Phase |
