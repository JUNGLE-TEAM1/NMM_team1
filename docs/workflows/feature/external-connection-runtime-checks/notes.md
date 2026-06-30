# External connection runtime checks 메모

## API 경계

- `POST /api/external-connections/test`는 runtime reachability check다.
- `POST /api/external-connections/inspect`는 여전히 local file/folder schema discovery 전용이다.
- DB/S3/Kafka test success는 Source Dataset 생성 완료가 아니다.

## Secret 경계

- request는 raw credential이 아니라 env var name reference를 받는다.
- response에는 credential value가 없다.
- local demo env 값은 실행 환경에만 두고 문서에는 남기지 않는다.

## 실제 smoke 결과

- PostgreSQL: `127.0.0.1:15432/asklake`, `select 1`.
- MongoDB: `mongodb://127.0.0.1:27017/admin`, `ping`.
- MinIO/S3: `http://127.0.0.1:9000/asklake-demo`, `list_objects_v2`.
- Kafka: `127.0.0.1:29092`, `list_topics`.
