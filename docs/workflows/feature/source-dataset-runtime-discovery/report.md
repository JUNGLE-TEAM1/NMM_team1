# Source dataset runtime discovery

## 요약

Source Dataset 생성 흐름에 External Connection discovery 경계를 연결했다. Local file/folder connection은 schema preview가 있으면 Source Dataset으로 저장할 수 있고, PostgreSQL/MongoDB/S3/Kafka처럼 connection test만 된 runtime connector는 `Schema discovery pending`으로 표시하고 저장을 막는다.

## 변경 사항

- Source Dataset wizard에 discovery 상태를 추가했다.
- local connection은 schema preview 기반으로 다음 단계와 저장을 허용한다.
- runtime connector는 connection tested 상태와 schema discovery 미지원 상태를 분리해서 보여준다.
- Source Dataset 저장 전에 schema preview가 비어 있으면 UI에서 차단한다.

## 검증

- frontend build 성공.
- browser smoke:
  - `conn_postgres_runtime_smoke` 선택 시 `Schema discovery pending`, 다음 버튼 비활성화.
  - local file connection 선택 시 다음 버튼 활성화.
  - `source_c26_runtime_discovery_smoke` 저장 성공.
- backend list 확인:
  - `source_c26_runtime_discovery_smoke`
  - `connection_type=local_file`
  - `schema_preview` 10 fields
  - `file_evidence.status=file_backed`

## 남은 범위

- PostgreSQL table schema discovery.
- MongoDB collection sample/schema discovery.
- S3 object sample/schema discovery.
- Kafka topic consume/replay 기반 schema discovery.
