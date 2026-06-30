# External connection runtime checks 품질 기록

## Context Budget

- Mode: Escalate Read
- 이유: connector runtime, credential/secret boundary, API contract 변경이 포함된다.
- 읽은 문서: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md` C-25 섹션, `docs/workflows/feature/external-connection-runtime-checks/plan.md`, C-23/C-24 report, `docs/03-interface-reference.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`
- 사용 skill/tool: browser skill, in-app browser verification

## 검증 명령

```bash
.venv/bin/pip install -r backend/requirements.txt
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_runtime_checks.py backend/tests/test_external_connection_persistence.py -q
npm --prefix frontend run build
```

- 결과: backend focused tests `12 passed`, frontend build 성공.

## 실제 Runtime API Smoke

- backend: `http://127.0.0.1:18000`
- endpoint: `POST /api/external-connections/test`

| Connector | Result | Capabilities | Boundary |
| --- | --- | --- | --- |
| PostgreSQL | passed | `driver_connect`, `lightweight_query` | schema discovery not run |
| MongoDB | passed | `driver_connect`, `ping` | collection schema discovery not run |
| MinIO/S3 | passed | `driver_connect`, `bucket_list` | object schema discovery not run |
| Kafka | passed | `broker_metadata`, `topic_list` | replay/consume not run |

## Browser Smoke

- URL: `http://127.0.0.1:5173/connections`
- 확인:
  - `Runtime connection checks` panel 표시.
  - PostgreSQL/MongoDB/MinIO/Kafka card 4개 표시.
  - PostgreSQL `연결 테스트` 클릭 후 `passed` 결과 표시.
  - `schema discovery, ingest, Source Dataset 생성은 수행하지 않습니다.` 문구 표시.
  - console error 없음.
  - 화면에 MinIO raw secret 값 없음.

## Regression / Failure Scenario

- raw credential field를 request options에 넣으면 `400`으로 거부한다.
- `secret_refs`는 env var name 형태만 허용한다.
- driver exception은 class name 중심의 redacted error로 감싼다.
- response는 `secret_values_exposed=false`, `schema_discovery_completed=false`를 반환한다.
