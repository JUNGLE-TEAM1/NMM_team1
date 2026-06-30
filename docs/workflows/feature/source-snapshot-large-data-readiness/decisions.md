# Source Snapshot large data readiness decisions

이 파일은 고영향 선택과 그 결과를 기록한다.

- Decision status: accepted

## Accepted Decisions

| Decision | Rationale | Date |
| --- | --- | --- |
| C-36은 full ingest 구현이 아니라 bounded sample boundary hardening으로 제한한다. | Product Health 5GB evidence는 이미 별도 processed input evidence로 존재하며, Source Snapshot endpoint는 현재 sample 기반이다. 이번 Phase에서 full runner를 얹으면 scope가 커진다. | 2026-06-30 |
| Snapshot metadata는 DB migration 없이 응답 모델 기본/계산 필드로 추가한다. | 기존 snapshot rows와 SQLite schema를 깨지 않고 UI/API contract를 보강할 수 있다. | 2026-06-30 |

## Deferred Decisions

| Decision | Deferred reason | Revisit trigger |
| --- | --- | --- |
| Full 5GB Source ingest runner | Spark/Airflow/retry/backfill과 연결되는 별도 runtime Phase가 필요하다. | C-37 이후 Product Health source inventory와 runner 연결 범위가 확정될 때 |
