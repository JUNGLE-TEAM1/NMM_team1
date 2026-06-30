# External connection wizard runtime test UX 계획

## 목표

External Connection 생성 wizard 안에서 connector별 입력 폼과 연결 테스트를 자연스럽게 수행하도록 재배치한다. 현재 `/connections` 첫 화면의 runtime check panel은 검증용 성격이 강하므로, 실제 사용자 흐름에서는 `연결 생성 -> credential/resource 입력 -> 연결 테스트 -> preview/review -> 저장` 순서로 보이게 한다.

## 상태

- 2026-06-30: 계획 생성. C-25에서 `POST /api/external-connections/test`와 `/connections` runtime check panel은 추가됐지만, 최종 UX상 연결 테스트는 connection 생성 wizard 내부에 있어야 한다.
- 2026-06-30: 구현 완료. 연결 생성 wizard에서 PostgreSQL/MongoDB/MinIO/S3/Kafka를 선택하고 실제 runtime connection test를 통과해야 Review로 이동한다. `/connections` 첫 화면의 runtime check panel은 제거했다.

## 범위

- External Connection wizard 단계를 connector별 입력 흐름에 맞게 재구성한다.
- PostgreSQL/MongoDB/S3/MinIO/Kafka connector type을 생성 wizard에서 선택 가능하게 정리한다.
- connector별 필요한 입력 필드를 표시한다.
  - PostgreSQL: host, port, database, username/password 또는 env ref.
  - MongoDB: URI 또는 host/port/database, username/password 또는 env ref.
  - S3/MinIO: endpoint, bucket/prefix, access key/secret key 또는 env ref.
  - Kafka: bootstrap servers, topic, 필요 시 SASL credential 또는 env ref.
  - Local File/Folder: file/folder path, credential 없음.
- `연결 테스트` 버튼을 Configure 단계에 배치하고 `POST /api/external-connections/test`를 호출한다.
- 테스트 성공과 schema discovery 완료를 UI에서 분리한다.
- 저장되는 External Connection metadata에는 raw credential 값을 넣지 않고 `secret_ref` 또는 local demo env ref만 남긴다.
- 기존 `/connections` 첫 화면 runtime check panel은 제거하거나 개발/diagnostic 영역으로 축소한다.

## 제외 범위

- secret manager/Vault 도입.
- raw credential 영구 저장.
- DB table schema discovery, Mongo collection sample, S3 object schema discovery.
- Kafka consume/replay trigger.
- Source Dataset 생성 흐름과 실제 row ingest.

## 선행 조건

- C-25 `POST /api/external-connections/test`가 동작한다.
- credential policy가 `connection_test_enabled=true`, `secret_ref_only`, `secret_values_exposed=false` 경계를 유지한다.

## 구현 대상 파일 예상

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `frontend/src/api/externalConnectionApi.js` 필요 시 보정
- 필요 시 `docs/03-interface-reference.md`
- 필요 시 `docs/07-manual-verification-playbook.md`
- `docs/reports/external-connection-wizard-runtime-test-ux.md`

## API/contract 영향

- 새 backend endpoint는 만들지 않는다.
- 기존 `POST /api/external-connections/test`를 wizard 내부에서 사용한다.
- create/update metadata payload에 raw credential field가 들어가지 않아야 한다.

## Acceptance Criteria

- 연결 생성 wizard에서 PostgreSQL/MongoDB/S3/MinIO/Kafka connector를 선택하고 각 형식에 맞는 입력 폼을 볼 수 있다.
- credential 입력 UI는 password/access key/secret key를 일반 텍스트로 노출하지 않는다.
- 연결 테스트가 생성 wizard 안에서 실행된다.
- 테스트 성공 후에도 UI가 `schema discovery 완료`, `Source Dataset 생성 완료`, `ingest 완료`로 표현하지 않는다.
- 저장되는 metadata에 raw credential 값이 포함되지 않는다.
- `/connections` 첫 화면이 검증용 runtime panel 때문에 난잡해 보이지 않는다.

## Regression / Failure Scenario

- password/access key/secret key/token이 External Connection metadata, response, console, report에 남으면 실패다.
- 연결 테스트 성공을 Source Dataset 생성 완료로 표시하면 실패다.
- Local File/Folder에도 불필요한 credential 입력창이 보이면 실패다.
- DB/S3/Kafka connector가 schema preview를 실제로 읽은 것처럼 보이면 실패다.

## Manual Verification

1. `/connections`에서 `연결 생성`을 누른다. 결과: 확인.
2. Local File/Folder는 credential 없이 path 입력과 local inspect가 가능한지 확인한다. 결과: 기존 흐름 유지.
3. PostgreSQL/MongoDB/S3/MinIO/Kafka는 connector별 입력 필드와 `연결 테스트` 버튼이 보이는지 확인한다. 결과: 확인.
4. local demo env ref 기준으로 연결 테스트가 통과하는지 확인한다. 결과: PostgreSQL browser smoke 통과, API smoke 통과.
5. Review/저장 화면에서 raw credential 값이 보이거나 저장되지 않는지 확인한다. 결과: env ref 이름만 사용, response `secret_values_exposed=false`.
6. `/connections` 목록에서 테스트 상태가 metadata와 구분되어 보이는지 확인한다. 결과: 저장된 runtime connection은 `schema_preview=[]`, schema discovery pending 경계 유지.

## Report 기준

- `docs/reports/external-connection-wizard-runtime-test-ux.md`에 UI 변경, browser smoke, secret redaction evidence, 남은 schema discovery gap을 기록한다.
