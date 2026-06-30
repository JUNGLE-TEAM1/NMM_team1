# Product Health Source Inventory Binding decisions

- Decision status: accepted

## Accepted Decisions

| Decision | Rationale | Date |
| --- | --- | --- |
| Source 후보는 raw/prepared/missing/mismatch를 구분한다. | Product Health evidence가 여러 경로에 섞여 있어 raw ingestion과 prepared reference를 혼동하기 쉽다. | 2026-06-30 |
| Product Health inventory는 read-only endpoint로 시작한다. | C-37은 원천 후보 binding이 목적이고 Source Dataset row 생성은 기존 `/api/source-datasets` 흐름을 재사용한다. | 2026-06-30 |

## Deferred Decisions

| Decision | Deferred reason | Revisit trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| full ingest runner 연결 | C-37은 inventory binding만 다룬다. | Source 후보와 runner 입력 계약이 정리된 뒤 | C-38 이후 |
