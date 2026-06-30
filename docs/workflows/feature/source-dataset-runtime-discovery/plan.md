# Source dataset runtime discovery 계획

## 목표

External Connection runtime check 결과를 Source Dataset 생성 흐름에 연결하고, 가능한 connector에 대해서 schema discovery 결과를 Source Dataset review에 표시한다.

## 상태

- 2026-06-30: 계획 생성. 현재 schema discovery는 local file/folder만 가능하고 DB/S3/Kafka는 connection test와 schema discovery가 분리되어야 한다.
- 2026-06-30: 구현 완료. Source Dataset wizard에서 local file/folder는 schema preview로 저장 가능하고, PostgreSQL/MongoDB/S3/Kafka는 `Schema discovery pending`으로 차단된다.

## 범위

- Source Dataset wizard에서 External Connection 선택 후 discovery 실행.
- local file/folder schema discovery 유지.
- PostgreSQL/MongoDB/S3/Kafka는 connection test 완료 상태와 schema discovery 지원 여부를 표시.
- 지원되는 connector부터 Source Dataset draft 저장에 schema preview 연결.

## 제외 범위

- 모든 connector의 full schema discovery 완료.
- Kafka topic consume/replay를 Source Dataset 생성 중 실행.
- DB table 전체 scan.
- S3 object 대용량 read.

## 선행 조건

- C-23 runtime verification report.
- C-24 `/runs` panel restore.
- C-25 External Connection runtime checks.

## 구현 대상 파일 예상

- `frontend/src/app/App.jsx`
- `frontend/src/api/externalConnectionApi.js`
- `frontend/src/api/sourceDatasetApi.js`
- `backend/app/services/external_connection_discovery.py`
- backend/frontend focused tests

## Acceptance Criteria

- Source Dataset 생성 시 선택한 External Connection의 상태가 보인다.
- local file/folder는 실제 schema/sample/bytes를 review에 표시한다.
- DB/S3/Kafka는 아직 discovery 미지원이면 명확히 blocked/deferred로 표시한다.
- 저장 후 Source Dataset 목록으로 돌아간다.

## Regression / Failure Scenario

- 연결 확인만 된 DB/S3/Kafka가 schema discovered처럼 보이면 실패다.
- missing local path가 성공으로 저장되면 실패다.
- review에 raw credential이 노출되면 실패다.

## Manual Verification

1. local file connection에서 Source Dataset을 생성한다. 결과: `source_c26_runtime_discovery_smoke` 저장 확인.
2. schema preview/sample rows/bytes를 확인한다. 결과: schema preview 10 fields, file evidence `file_backed`, bytes `539809`.
3. DB/S3/Kafka connection을 선택했을 때 지원 범위 안내를 확인한다. 결과: `conn_postgres_runtime_smoke` 선택 시 `Schema discovery pending`, 다음 버튼 비활성화.
4. 저장 후 목록 복귀를 확인한다. 결과: 저장 성공 notice와 목록 표시 확인.

## Report 기준

- `docs/reports/source-dataset-runtime-discovery.md`에 connector별 discovery matrix와 UI smoke 결과를 기록한다.
