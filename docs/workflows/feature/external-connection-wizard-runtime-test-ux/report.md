# External connection wizard runtime test UX

## 요약

External Connection 생성 wizard 안에서 DB/S3/Kafka 계열 connector를 선택하고 실제 runtime connection test를 실행하도록 보정했다. 이제 별도 진단 패널이 아니라 `연결 생성 -> Configure -> 실제 연결 테스트 -> Review -> 저장` 흐름에서 접속 가능 여부를 확인한다.

## 변경 사항

- PostgreSQL, MongoDB, MinIO/S3, Kafka를 생성 wizard의 실제 선택 가능한 connector로 정리했다.
- runtime connector에는 env ref 입력 UI를 추가했고 raw credential 값 입력/저장은 하지 않는다.
- Configure 단계에서 `POST /api/external-connections/test`를 호출한다.
- runtime test 성공 시에만 Review로 이동할 수 있게 했다.
- runtime connector 저장 시 schema discovery 완료처럼 보이지 않도록 `schema_preview=[]`로 저장한다.
- `/connections` 첫 화면의 `Runtime connection checks` 진단 패널을 제거했다.

## 검증

- `npm --prefix frontend run build`: 성공.
- PostgreSQL runtime test API smoke: `passed`, `secret_values_exposed=false`, `schema_discovery_completed=false`.
- Browser smoke:
  - `/connections`에서 PostgreSQL 선택.
  - `실제 연결 테스트` 성공.
  - Review 이동 가능.
  - `conn_postgres_runtime_smoke` 저장 확인.

## 남은 범위

- DB table schema discovery, Mongo collection sample, S3 object schema discovery는 C-26 이후 범위다.
- Kafka topic consume/replay trigger는 아직 없다.
- connection test result audit persistence는 아직 없다.
