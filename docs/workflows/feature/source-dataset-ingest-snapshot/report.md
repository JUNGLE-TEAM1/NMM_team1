# Source dataset ingest snapshot 보고서

## Phase

- Type: Feature Phase
- Branch/work location: `feature/source-dataset-ingest-snapshot`
- Date: 2026-06-30
- Workspace state: 구현 및 local/browser 검증 완료

## Goal / 목표

- Source Dataset metadata 생성 이후 실제 row/object/message를 raw snapshot으로 materialize하고 evidence를 남긴다.
- Source Dataset 생성과 raw ingest/snapshot 실행을 UI에서 분리한다.

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/adapters/sqlite_metadata_store.py`
- `backend/app/ports/metadata_store.py`
- `backend/app/api/source_catalog.py`
- `backend/app/services/source_dataset_snapshot.py`
- `backend/tests/test_source_dataset_persistence.py`
- `frontend/src/api/sourceDatasetApi.js`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/03-interface-reference.md`
- `docs/workflows/feature/source-dataset-ingest-snapshot/plan.md`
- `docs/workflows/feature/source-dataset-ingest-snapshot/quality.md`

## Implementation Summary / 구현 요약

- `source_dataset_snapshots` SQLite table을 추가했다.
- `POST /api/source-datasets/{dataset_id}/snapshots`와 `GET /api/source-datasets/{dataset_id}/snapshots`를 추가했다.
- local file/folder는 bounded row snapshot을 `data/source_snapshots/<dataset>/...jsonl`로 저장한다.
- runtime connector는 저장된 External Connection metadata와 실행 시점 `secret_refs/options`를 받아 bounded discovery sample을 snapshot으로 저장할 수 있는 서비스 경로를 추가했다.
- Source Dataset 상세 modal에 `Raw snapshot evidence` 섹션과 수동 실행 버튼을 추가했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_external_connection_discovery.py -q
npm --prefix frontend run build
curl -s -o /tmp/source_snapshots_status.txt -w '%{http_code}\n' http://127.0.0.1:18000/api/source-datasets/a0882fab-3f09-45f2-bfff-a4c629692d77/snapshots
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/source-dataset-ingest-snapshot/quality.md`
- Quality gate status: 통과
- TDD status: focused backend tests 추가 및 통과
- CI/check result: local focused tests/build 통과
- Browser smoke: Source Dataset 상세에서 `Raw snapshot 생성` 실행 후 `succeeded`, `row_count=100`, output path 표시 확인

## Regression Guard / 회귀 보호

- Checked feature: Source Dataset persistence와 External Connection discovery
- Protected behavior: metadata-only 생성과 실제 snapshot 실행이 섞이지 않는다.
- Result: 통과

## Failure Scenario / 실패 시나리오

- Reviewed failure: missing local path snapshot
- Expected behavior: 400 응답, snapshot evidence 미생성
- Verification: `test_create_source_dataset_snapshot_rejects_missing_input_path`
- Result: 통과

## Manual Verification / 수동 검증

- Environment: local frontend `http://127.0.0.1:13011`, backend `http://127.0.0.1:18000`
- Result: Source Dataset 상세 modal에서 snapshot 생성 버튼과 evidence 카드 확인
- Evidence: `data/source_snapshots/source_c26_runtime_discovery_smoke/20260630T133508Z-9def9ede.jsonl`

## Document Updates / 문서 업데이트

- Updated: `docs/03` Source Dataset snapshot API 계약, C-26C plan, quality, report
- Not updated and why: `docs/02` architecture는 storage/runtime 경계가 C-27~C-29에서 한 번 더 바뀔 수 있어 이번 Phase에서는 API/interface 계약만 반영했다.

## Failed / Incomplete / Follow-Up TODO

- PostgreSQL/MongoDB/S3/Kafka runtime snapshot UI는 아직 credential/secret_ref 재입력 surface가 없다.
- bounded snapshot은 demo-safe sample 중심이며 운영형 full ingest/retry/backfill은 제외했다.

## Context For Next Phase / 다음 Phase 문맥

- 다음 Phase는 C-27 `feature/silver-dataset-runtime-materialization`.
- Silver materialization은 `source_dataset_snapshots`의 최신 snapshot 또는 source raw scope를 입력으로 삼아 output path/row count/bytes/schema validation evidence를 남기면 된다.

## Secret / Migration / Env Check

- Secret check: raw credential 저장 없음. runtime connector snapshot은 `secret_refs`만 요청한다.
- Migration/data change: `source_dataset_snapshots` table 추가. local smoke에서 `data/source_snapshots/...jsonl` 생성.
- Env change: 18000 backend를 새 코드로 재시작해 browser smoke 확인.

## Final Judgment / 최종 판단

- Done: C-26C 완료
- Remaining risk: runtime connector별 full ingest UX는 후속 Phase로 분리
