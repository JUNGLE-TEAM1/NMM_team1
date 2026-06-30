# External connection runtime checks 계획

## 목표

External Connection이 PostgreSQL, MongoDB, S3/MinIO, Kafka에 대해 raw credential을 저장하지 않고 connection test만 수행할 수 있는 최소 runtime check API를 추가한다.

## 상태

- 2026-06-30: 계획 생성. 현재 `/api/external-connections/inspect`는 `local_file/local_folder`만 실제 discovery 대상이고 DB/S3/Kafka는 차단된다.
- 2026-06-30: 완료. `POST /api/external-connections/test`와 `/connections` runtime check panel을 추가했고 PostgreSQL/MongoDB/MinIO/Kafka 실제 local runtime test를 통과했다.

## 범위

- `secret_ref` 또는 local env reference 기반 connection test request contract 정의.
- PostgreSQL ping 또는 lightweight query.
- MongoDB ping.
- S3/MinIO bucket list 또는 object list.
- Kafka topic list 또는 broker metadata check.
- raw password/access key/token은 request/response/log/metadata에 저장하지 않는다.

## 제외 범위

- schema discovery 완료.
- credential secret backend/Vault 도입.
- connector별 대용량 read.
- Source Dataset 생성 wizard 변경.

## 선행 조건

- C-22 credential policy.
- local runtime verification report.
- demo env variable naming 합의.

## 구현 대상 파일 예상

- `docs/03-interface-reference.md`
- `docs/06-regression-and-failure-scenarios.md`
- `backend/app/domain/schemas.py`
- `backend/app/api/source_catalog.py`
- `backend/app/services/*connection*`
- `backend/tests/test_external_connection_runtime_checks.py`
- `frontend/src/app/App.jsx`

## API/contract 영향

- 새 endpoint 후보: `POST /api/external-connections/test`
- request는 connector type과 reference names를 받는다.
- response는 `status`, `connector_type`, `checked_capabilities`, `safe_summary`, `secret_values_exposed=false`만 반환한다.

## Acceptance Criteria

- PostgreSQL/MongoDB/MinIO/Kafka local runtime에 대한 connection test가 통과한다.
- secret raw value가 저장되거나 응답에 포함되지 않는다.
- connection test 실패 시 secret value를 echo하지 않는다.
- UI는 test success를 schema discovery 완료로 오해하게 만들지 않는다.

## Regression / Failure Scenario

- raw credential이 DB, metadata JSON, console log, error response에 남으면 실패다.
- Airflow metadata Postgres를 AskLake external DB로 자동 사용하면 실패다.
- connection test success를 Source Dataset 생성 완료로 표시하면 실패다.

## Manual Verification

1. local env reference를 설정한다.
2. PostgreSQL/MongoDB/S3/Kafka connection test를 실행한다.
3. response와 logs에 secret value가 없는지 확인한다.
4. UI가 `연결 확인됨`과 `schema discovery 필요`를 구분하는지 확인한다.

## Report 기준

- `docs/reports/external-connection-runtime-checks.md`에 connector별 test 결과와 secret redaction evidence를 기록한다.
