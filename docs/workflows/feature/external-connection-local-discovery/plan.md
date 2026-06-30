# External Connection local discovery 계획

## Status

- 2026-06-30: 구현 및 focused 검증 완료.
- 2026-06-30: `prepared_dataset` 묶음 옵션 제거. Amazon/MEP/Behavior/Taxi 원천을 개별 preset으로 선택하도록 보정.
- 실제 저장/ingest가 아니라 External Connection 생성 전 schema discovery 단계만 처리했다.

## 목표

External Connection 생성/검사 단계에서 `local_file`, `local_folder`의 실제 로컬 파일/폴더를 읽어 schema discovery 결과를 보여준다.

## 범위

- CSV, JSONL, JSON, Parquet file, Parquet directory의 최소 schema/sample/bytes discovery.
- 데모 원천 preset: Amazon Reviews JSONL, MEP Product JSON, Behavior Events JSONL, Taxi Delivery Parquet.
- External Connection Review에 실제 검사 결과를 저장 가능한 metadata로 반영.
- 파일이 없거나 읽을 수 없는 경우 blocked/error 상태 표시.
- `contracts/external_connection.sample.json`, `contracts/source_config.sample.json`와 화면 payload 정렬.

## 제외 범위

- DB/S3/Kafka credential 연결.
- Kafka consume/replay trigger.
- Airflow/Spark runner 실행.
- 원본 파일 ingest 또는 row 변환.
- secret 값 저장.

## 선행 조건

- C-13 또는 현재 데이터셋 관리 UI 기준선.
- `data/local_sources/product_health`, `data/raw/taxi`, `backend/samples` 중 하나 이상이 로컬에 존재.

## 구현 대상 파일 예상

- `backend/app/api/source_catalog.py`
- `backend/app/services/*discovery*.py` 또는 기존 connector 확장
- `backend/app/domain/schemas.py`
- `frontend/src/api/externalConnectionApi.js`
- `frontend/src/app/App.jsx`
- 필요 시 focused backend/frontend tests

## API/contract 영향

- External Connection inspect endpoint 또는 create-before-inspect payload가 필요할 수 있다.
- schema preview shape는 `ColumnSchema[]`와 호환해야 한다.
- actual credential/secret contract는 다루지 않는다.

## UI 영향

- Connection Configure 단계에서 `소스 검사`가 실제 파일/폴더 검사로 동작한다.
- 검사 결과에 format, schema fields, sample rows, bytes, row count 가능 범위가 표시된다.
- 실패 시 다음 단계가 차단되고 이유를 보여준다.

## Acceptance Criteria

- 존재하는 local JSONL/CSV 파일을 검사하면 schema preview와 bytes가 표시된다.
- 존재하는 Parquet directory를 검사하면 파일 수와 schema preview가 표시된다.
- 없는 경로를 입력하면 저장 가능한 성공 상태로 표시하지 않는다.
- mock schema가 실제 검사 결과를 덮어쓰지 않는다.

## Regression / Failure Scenario

- 잘못된 경로, 지원하지 않는 확장자, 깨진 JSONL/CSV, 빈 폴더를 실패로 표시한다.
- 대용량 파일은 전체 load로 UI/API를 멈추지 않고 bounded sampling 또는 metadata scan을 사용한다.

## Manual Verification

1. `backend/samples/product_health_reviews_seed.jsonl`로 local_file connection을 검사한다.
2. `data/raw/taxi/yellow_tripdata_2019_2025`로 local_folder connection을 검사한다.
3. 없는 경로를 입력해 error 상태와 다음 단계 차단을 확인한다.

## Data / Evidence 확인 항목

- 파일 존재 여부.
- 파일 크기.
- schema field count.
- sample row count.
- row count가 정확/추정/미측정인지 표시.

## Execution Notes

- `POST /api/external-connections/inspect`를 추가했다.
- `local_file`, `local_folder`만 실제 local discovery 대상으로 둔다.
- `prepared_dataset`은 raw bundle 전체를 하나의 Source Dataset처럼 보이게 만들어 제외했다.
- JSONL/JSON/CSV는 bounded sample만 읽고, Parquet은 metadata/schema 중심으로 읽는다.
- 없는 경로와 지원하지 않는 connector는 400 error로 차단한다.
- UI는 inspect 성공 결과가 있을 때만 다음 단계와 저장을 허용한다.

## Blocked Condition

- 로컬 데이터 경로가 없거나 읽기 권한이 없다.
- Parquet/JSONL reader dependency가 현재 환경에 없다.
- UI에서 저장할 schema preview contract가 기존 `ColumnSchema`와 충돌한다.

## Report 기준

- `docs/reports/external-connection-local-discovery.md`에 검사한 경로, 성공/실패 케이스, 남은 connector 범위를 기록한다.
