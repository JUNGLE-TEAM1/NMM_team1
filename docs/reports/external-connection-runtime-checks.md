# External connection runtime checks

## Type

- Phase: C-25
- Branch/workspace: `feature/external-connection-runtime-checks`
- Date: 2026-06-30

## Summary

External Connection에 PostgreSQL, MongoDB, MinIO/S3, Kafka lightweight runtime connection test를 추가했다. `inspect`는 local file/folder schema discovery로 유지하고, 새 `test` endpoint는 runtime reachability만 확인한다.

## Changed

- `backend/app/domain/schemas.py`: `ExternalConnectionTestRequest`, `ExternalConnectionTestResult` 추가.
- `backend/app/services/external_connection_runtime.py`: connector별 runtime check service 추가.
- `backend/app/api/source_catalog.py`: `POST /api/external-connections/test` 추가, credential policy `connection_test_enabled=true` 보정.
- `backend/requirements.txt`: runtime connector client 의존성 추가.
- `frontend/src/api/externalConnectionApi.js`: `testExternalConnection` 추가.
- `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`: `/connections` runtime check panel 추가.
- `docs/03`, `docs/06`, `docs/07`: C-25 contract/guardrail/manual verification 반영.

## Verification

| Check | Result |
| --- | --- |
| `.venv/bin/pip install -r backend/requirements.txt` | passed |
| `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_runtime_checks.py backend/tests/test_external_connection_persistence.py -q` | `12 passed` |
| `npm --prefix frontend run build` | passed |
| PostgreSQL actual API smoke | passed |
| MongoDB actual API smoke | passed |
| MinIO/S3 actual API smoke | passed |
| Kafka actual API smoke | passed |
| Browser `/connections` smoke | panel visible, PostgreSQL click passed, no console errors |

## Runtime Evidence

| Connector | Endpoint/Resource | Capabilities | Boundary |
| --- | --- | --- | --- |
| PostgreSQL | `127.0.0.1:15432/asklake` | `driver_connect`, `lightweight_query` | no schema discovery |
| MongoDB | `mongodb://127.0.0.1:27017/admin` | `driver_connect`, `ping` | no collection schema discovery |
| MinIO/S3 | `http://127.0.0.1:9000/asklake-demo` | `driver_connect`, `bucket_list` | no object schema discovery |
| Kafka | `127.0.0.1:29092` | `broker_metadata`, `topic_list` | no replay/consume trigger |

## Acceptance Check

- PostgreSQL/MongoDB/MinIO/Kafka local runtime connection test가 통과한다.
- secret raw value가 저장되거나 응답에 포함되지 않는다.
- connection test 실패 시 driver exception은 redacted error로 감싼다.
- UI는 test success를 schema discovery 완료로 보이지 않게 표시한다.

## Regression / Failure Scenario Check

- raw credential field는 request options에서 거부된다.
- `secret_refs`는 env var name 형태만 허용한다.
- response는 `secret_values_exposed=false`, `schema_discovery_completed=false`를 반환한다.

## Next

- C-26 `feature/source-dataset-runtime-discovery`: Source Dataset 생성 단계에서 실제 discovery 경계를 확장한다.
