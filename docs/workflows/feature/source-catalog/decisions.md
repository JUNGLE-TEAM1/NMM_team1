# Source catalog 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- M3 follows PR #32's plan: CSV/local file first, SQLite behind `MetadataStore`, string UUID public ids.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Metadata store boundary | `MetadataStore` protocol + `SQLiteMetadataStore` | Keeps MVP local while preserving future PostgreSQL/MongoDB implementations. | User requested M3 진행 / 2026-06-22 |
| First source implementation | CSV/local file path | No secrets or external DB needed; enough to prove source/catalog flow. | User requested M3 진행 / 2026-06-22 |
| Frontend M3 scope | Source form + catalog list/detail in app shell | Gives a usable first-screen workflow without building pipeline UI yet. | User requested M3 진행 / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| File upload UI | Keep out of M3 implementation | Sample path registration is enough for MVP source/catalog proof. | M3/M5 demo review |
| PostgreSQL/MongoDB store | Defer implementation | Store boundary exists, but extra DB infra is not needed for M3. | M6/M9/M15 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Need external source demo | Add PostgreSQL connector in M6 after M3 API stabilizes. | Split follow-up |
| SQLite limits surface | Add migration/import path and Postgres/Mongo store implementation. | Store migration branch |
