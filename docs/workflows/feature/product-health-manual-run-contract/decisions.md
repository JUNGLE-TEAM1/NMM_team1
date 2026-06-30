# Product Health Manual Run contract 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full brief not needed. 선택지가 좁고 PR 5A 범위가 계약 block 추가로 제한되어 있어 lightweight accepted decision으로 기록한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Product Health Manual Run contract schema source | `contracts/product_health_*.sample.json`을 runtime에 읽어 `schema_version`, Gold contract version, output schema, allowed columns를 채운다 | #310 Gold v2가 머지되어도 PR 5A code가 같은 contract file을 따라가게 하기 위함 | User direction + Codex, 2026-06-30 |
| PR 5A execution boundary | 실제 Gold 생성 없이 `pending_product_health_execution` 계약 block만 추가한다 | PR 4/5B/6/7/8 병렬 작업을 막지 않으면서 shared handoff shape를 먼저 고정 | User direction + Codex, 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Actual source snapshot lookup and artifact fill | PR 4 Source Snapshot API/metadata가 아직 merge 전 | PR 4 merge 후 PR 5B 시작 | PR 5B |
| Actual Product Health Gold parquet generation | PR 5A는 contract-only 범위 | M2/Product Health runner 연결 시작 | PR 5B |
| Catalog registration execution | PR 6 담당 범위 | PR 6 merge 또는 catalog registration endpoint 확정 | PR 6 / integration |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Product Health contract file path changes | #310 또는 후속 PR이 `contracts/product_health_*.sample.json` path를 변경 | `ProductHealthManualRunContractService`의 contract path import를 갱신하고 focused tests 재실행 |
| PR 4 snapshot lookup contract changes | PR 4가 `source_dataset_id`가 아닌 다른 key로 latest snapshot lookup을 확정 | `source_snapshot_inputs[].snapshot_lookup`와 docs/03 계약 갱신 |
