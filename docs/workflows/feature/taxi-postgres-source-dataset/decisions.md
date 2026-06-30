# Taxi PostgreSQL Source Dataset 등록 결정 기록

- Decision status: mixed

| 결정 | 상태 | 이유 |
| --- | --- | --- |
| 저장 전 연결 테스트 | accepted | 사이드 챗에서 `/api/external-connections/test`와 UI gating이 추가되어, 저장 전 schema preview smoke까지 이번 slice에 포함한다. |
| password 저장 방식 | accepted | password 원문은 저장하지 않고 `password_secret_ref` env 참조만 저장한다. |
| 첫 적재 범위 | accepted | `yellow_tripdata_2026_partial`의 첫 파일 1개를 smoke로 적재했다. |
| `cbd_congestion_fee` | accepted | 사용자가 드롭해도 된다고 했다. loader 적재 대상에서 제외한다. |
| `airport_fee` 정규화 | accepted | `airport_fee` / `Airport_fee`를 lowercase `airport_fee`로 통합한다. |
| `source_file`, `service_year_month` | pending human confirmation | 사용자가 이유 설명과 허락을 요구했다. 이번 구현에는 넣지 않았다. |

## 보류 결정 설명

- `source_file`: 파일별 불량 row 추적, 부분 재적재, lineage evidence에 유리하다.
- `service_year_month`: 월별 검증/필터/재적재와 partition-like 운영에 유리하다.
- 둘 다 분석 필수 컬럼은 아니므로 승인 전에는 table schema에 넣지 않는다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| password 저장 방식 | `password_secret_ref` only | password 원문 저장 없이 schema discovery에 필요한 env 참조만 보존 | Phase implementation / 2026-06-30 |
| 저장 전 연결 테스트 | `/api/external-connections/test` | connection metadata 저장 없이 PostgreSQL schema preview를 먼저 검증 | side-chat integration / 2026-06-30 |
| 첫 적재 범위 | 2026 partial 첫 파일 | Source Dataset registration smoke를 빠르게 닫기 위해 | user + Phase implementation / 2026-06-30 |
| Taxi fee normalization | lowercase `airport_fee`, drop `cbd_congestion_fee` | 사용자 요청과 schema drift 대응 | user / 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Target Run/Catalog/AI Query | 이번 목표는 Source Dataset 저장 | Taxi Source Dataset 저장 후 target 실행 요구 | follow-up |
| `source_file`, `service_year_month` | 사용자 승인 필요 | 사용자가 추가 승인 | current or follow-up |
