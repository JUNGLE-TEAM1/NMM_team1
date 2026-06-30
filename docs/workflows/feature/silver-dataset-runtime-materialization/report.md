# Silver dataset runtime materialization 보고서

## Phase

- Type: Feature Phase
- Branch/work location: `feature/silver-dataset-runtime-materialization`
- Date: 2026-06-30
- Workspace state: 구현 및 local/browser 검증 완료

## Goal / 목표

- Source Dataset 또는 Source Snapshot에서 Silver Dataset local materialization을 실행하고 evidence를 남긴다.
- Silver metadata 생성과 실제 parquet output 생성을 UI/API에서 분리한다.

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/adapters/sqlite_metadata_store.py`
- `backend/app/ports/metadata_store.py`
- `backend/app/api/source_catalog.py`
- `backend/app/services/silver_dataset_materialization.py`
- `backend/tests/test_silver_dataset_persistence.py`
- `frontend/src/api/silverDatasetApi.js`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/03-interface-reference.md`
- `docs/workflows/feature/silver-dataset-runtime-materialization/plan.md`
- `docs/workflows/feature/silver-dataset-runtime-materialization/quality.md`

## Implementation Summary / 구현 요약

- `silver_dataset_materializations` SQLite table을 추가했다.
- `POST /api/silver-datasets/{dataset_id}/materializations`와 `GET /api/silver-datasets/{dataset_id}/materializations`를 추가했다.
- 최신 Source Snapshot이 있으면 그 JSONL을 우선 입력으로 사용하고, 없으면 local source raw scope를 bounded read한다.
- Silver schema preview 기준 field projection과 string trim을 적용한 뒤 `data/local_sources/product_health/silver/<silver_name>.parquet`로 저장한다.
- Silver 상세 modal에 `Silver materialization evidence` 섹션과 수동 실행 버튼을 추가했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_silver_dataset_persistence.py backend/tests/test_source_dataset_persistence.py -q
npm --prefix frontend run build
curl -s -o /tmp/silver_mat_status.txt -w '%{http_code}\n' http://127.0.0.1:18000/api/silver-datasets/not-found/materializations
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/silver-dataset-runtime-materialization/quality.md`
- Quality gate status: 통과
- TDD status: focused backend tests 추가 및 통과
- CI/check result: local focused tests/build 통과
- Browser smoke: Silver 상세에서 `Silver output 생성` 실행 후 `succeeded`, `row_count=100`, parquet output path 표시 확인

## Regression Guard / 회귀 보호

- Checked feature: Silver Dataset persistence, Source Snapshot handoff
- Protected behavior: metadata-only Silver와 실제 materialized Silver가 섞이지 않는다.
- Result: 통과

## Failure Scenario / 실패 시나리오

- Reviewed failure: missing source file materialization
- Expected behavior: 400 응답, materialization evidence 미생성
- Verification: `test_create_silver_dataset_materialization_rejects_missing_source_file`
- Result: 통과

## Manual Verification / 수동 검증

- Environment: local frontend `http://127.0.0.1:13011`, backend `http://127.0.0.1:18000`
- Result: `silver_c26_runtime_discovery_smoke` 상세 modal에서 Silver output 생성 성공
- Evidence:
  - Output: `data/local_sources/product_health/silver/silver_c26_runtime_discovery_smoke.parquet`
  - Input: `data/source_snapshots/source_c26_runtime_discovery_smoke/20260630T133508Z-9def9ede.jsonl`

## Document Updates / 문서 업데이트

- Updated: `docs/03` Silver materialization API 계약, C-27 plan, quality, report
- Not updated and why: `docs/02` architecture는 C-28~C-29에서 Gold/Run executor evidence까지 정렬하며 갱신한다.

## Failed / Incomplete / Follow-Up TODO

- Spark distributed execution, DB/S3/Kafka direct ingest, quarantine file persistence는 제외했다.
- 현재 transform은 demo-safe projection/trim 중심이며 복잡한 rule engine은 후속 범위다.

## Context For Next Phase / 다음 Phase 문맥

- 다음 Phase는 C-28 `feature/gold-dataset-runtime-materialization`.
- Gold materialization은 materialized Silver parquet를 입력으로 사용하고 local + S3-compatible output evidence를 남기면 된다.

## Secret / Migration / Env Check

- Secret check: raw credential 저장 없음.
- Migration/data change: `silver_dataset_materializations` table 추가. local smoke에서 Silver parquet 생성.
- Env change: 18000 backend를 새 코드로 재시작해 browser smoke 확인.

## Final Judgment / 최종 판단

- Done: C-27 완료
- Remaining risk: production-grade transform/quarantine/retry는 후속 Phase
