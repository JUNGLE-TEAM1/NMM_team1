# M3 metadata store plan 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- XFlow reference uses MongoDB/Beanie for app catalog metadata, while also using PostgreSQL for Airflow/metastore/RDB paths. AskLake M3 will not import XFlow's MongoDB dependency, but will preserve a store boundary for later PostgreSQL/MongoDB implementations.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M3 first source type | CSV/local file | No secrets or external DB required; fastest path to catalog demo and M4 pipeline run. | User approved M3 보강 / 2026-06-22 |
| M3 metadata store | SQLite behind `MetadataStore` | Lightweight for MVP, but replaceable via backend store interface. | User approved M3 보강 / 2026-06-22 |
| M3 ID policy | string UUID | Avoids coupling API contracts to SQLite integer ids or MongoDB ObjectId. | User approved M3 보강 / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| File upload UI | Keep out of initial M3 unless needed for demo | Sample path registration is enough to prove source/catalog flow. | M3 implementation scope confirm |
| PostgreSQL/MongoDB metadata store | Defer to later source/store hardening | MVP should avoid extra infrastructure dependency. | M6/M9/M15 option brief |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| CSV/local source is too weak for demo | Add PostgreSQL source connector in M6 or split a follow-up branch after M3 API stabilizes. | Scope follow-up |
| SQLite metadata limits appear | Add PostgreSQL or MongoDB implementation behind `MetadataStore` and migration/import command. | Store migration branch |
