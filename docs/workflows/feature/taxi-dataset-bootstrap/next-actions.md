# M2 taxi dataset bootstrap 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: dataset strategy drafted
- Summary: M2는 `yellow_tripdata_2024-01.parquet`를 로컬 기준 파일로 두고, 전체 Taxi dataset 적재 목표는 후속 `scale-target` 범위로 분리한다.

## Recommended Next Action / 권장 다음 행동

- `contracts/*.sample.json` 기준으로 M2 Taxi mapping 초안을 작성한다.
- Reason: 구현을 시작하기 전에 M2가 어떤 입력을 받고 어떤 `ExecutionResult`/`CatalogMetadata`를 내보낼지 M1/M5/M6와 맞춰야 한다.

## Options / 선택지

1. Taxi contract mapping 초안을 작성한다.
2. `demo`/`fixed` row 수와 date range를 먼저 확정한다.
3. PostgreSQL 적재 스크립트 구현 branch로 넘어간다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 다음 작업으로 1번을 권장한다.

## Last User Choice / 마지막 사용자 선택

- `yellow_tripdata_2024-01.parquet`로 로컬에서 작게 시작하되, 전체 Taxi dataset 적재 목표는 별도 scale target으로 분리한다.

## Next AI Action / 다음 AI 행동

- option 1이면 `source_config`, `workflow_definition`, `execution_result`, `catalog_metadata`의 Taxi mapping을 workspace 문서에 초안 작성한다.
- option 2이면 `notes.md`와 `plan.md`에 정확한 row/date 기준을 기록한다.
- option 3이면 이 branch의 문서 범위를 닫고 구현 branch를 새로 만든다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
