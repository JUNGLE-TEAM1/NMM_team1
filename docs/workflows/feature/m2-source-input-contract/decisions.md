# M2 source input 계약 확장 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 옵션 비교는 열지 않는다. 이번 작업은 이미 확정된 M2 `RuntimeConfig.source_inputs[]` 안에서 미래 source connection shape를 additive로 확장하는 구현이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| source input field compatibility | legacy `input_format`/`input_path` 유지 + 새 `source_type`/`format`/`path` 추가 | 기존 M3/M5/M6 소비자를 깨지 않고 UI source connection 계약으로 확장하기 위해 | 사용자 요청 / 2026-06-28 |
| current executable source type | `local_file` only | DB/Kafka connector 없이 성공으로 위장하지 않기 위해 | Phase implementation / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| actual S3 connector | 이번 작업은 contract compatibility이며 object storage read 구현은 별도 scope | M2가 remote object read smoke를 시작할 때 | M2 storage/source connector |
| PostgreSQL/MongoDB/Kafka connector | UI source connection과 secret handling, M5 SourceConfig 변환이 먼저 맞아야 함 | M1/M5 source connection contract가 확정될 때 | M1/M2/M5 source integration |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| source input additive fields | downstream consumer가 unknown field를 reject한다 | legacy-only fixture로 되돌리지 말고 consumer validation을 먼저 확인한다. 필요 시 docs/03에서 compatibility transition rule을 보강한다. |
| unsupported source type failed result | M5가 validation 단계에서 runner failed result 대신 preflight error를 요구한다 | M5 workflow layer에서 preflight를 추가하고 M2 runner guard는 유지한다. |
