# External Connection local discovery 보고서

## Phase

- Type: Feature Phase C-14
- Branch/work location: `feature/external-connection-persistence`, `docs/workflows/feature/external-connection-local-discovery/`
- Date: 2026-06-30
- Workspace state: 기존 작업 트리가 넓게 dirty인 상태에서 C-14 관련 파일만 추가/수정했다.

## Goal / 목표

- External Connection 생성 전 `local_file`, `local_folder`에 대해 실제 local path 기반 schema discovery를 제공한다.

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/api/source_catalog.py`
- `backend/app/services/external_connection_discovery.py`
- `backend/tests/test_external_connection_discovery.py`
- `frontend/src/api/externalConnectionApi.js`
- `frontend/src/app/App.jsx`
- `docs/workflows/feature/external-connection-local-discovery/plan.md`
- `docs/workflows/feature/external-connection-local-discovery/quality.md`

## Implementation Summary / 구현 요약

- `POST /api/external-connections/inspect` endpoint를 추가했다.
- CSV, JSONL, JSON, Parquet file/directory를 bounded sample 또는 metadata 중심으로 검사한다.
- inspect 결과에 format, dataset label, confidence, schema preview, sample rows, bytes, file count, row count status를 포함했다.
- UI의 `소스 검사` 버튼이 mock preview 대신 실제 inspect API를 호출한다.
- inspect 성공 결과가 있을 때만 다음 단계와 저장이 가능하게 했다.
- 없는 경로와 지원하지 않는 connector는 실패 상태로 표시하고 다음 단계 이동을 차단한다.
- `Prepared Dataset` 묶음 옵션을 제거하고, Amazon Reviews JSONL, MEP Product JSON, Behavior Events JSONL, Taxi Delivery Parquet preset으로 분리했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_external_connection_discovery.py -q
npm run build
git diff --check
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/external-connection-local-discovery/quality.md`
- Quality gate status: passed
- TDD status: focused backend tests added after implementation
- CI/check result: local focused tests/build passed
- Skipped checks: full repo test suite, CI

## Manual Verification / 수동 검증

- Document executed: C-14 plan Manual Verification
- Environment: local backend `127.0.0.1:18000`, frontend `127.0.0.1:5173`
- Result:
  - JSONL local file discovery 성공
  - missing path error 차단 성공
  - Taxi Parquet folder discovery 성공
- Evidence: `quality.md`에 브라우저 smoke 결과 기록

## Regression Guard / 회귀 보호

- 기존 External Connection persistence CRUD 테스트를 함께 실행했다.
- `inspect` route를 `/{connection_id}`보다 먼저 배치해 route 충돌을 방지했다.
- 저장 payload는 inspect 결과 schema를 우선 사용하고 mock schema fallback은 후순위로 유지했다.

## Failure Scenario / 실패 시나리오

- 없는 경로는 400 error로 응답한다.
- UI는 실패 상태를 표시하고 `다음` 버튼을 비활성화한다.

## Remaining / 남은 일

- DB/S3 credential discovery, Kafka consume/replay, Airflow DAG trigger, Spark runner 실행은 후속 Phase 범위다.
- Product Health 원천별 Source/Silver/Gold 연결 검증은 후속 Phase에서 이어간다.

## Secret / Migration / Env Check

- Secret check: secret 추가 없음.
- Migration/data change: schema migration 없음.
- Env change: 새 런타임 env 없음. 검증용 서버는 종료했다.

## Final Judgment / 최종 판단

- Done: C-14 완료.
- Remaining risk: local discovery는 metadata/sample 중심이며 운영 ETL 실행은 포함하지 않는다.
