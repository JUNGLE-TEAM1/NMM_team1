# Gold dataset runtime materialization 보고서

## Phase

- Type: Feature Phase
- Branch/work location: `feature/gold-dataset-runtime-materialization`
- Date: 2026-06-30
- Workspace state: 구현 및 local/browser 검증 완료

## Goal / 목표

- Gold Dataset build가 materialized Silver Dataset parquet를 입력으로 local Gold parquet를 생성하게 한다.
- local output success와 MinIO/S3-compatible object upload evidence를 분리한다.

## Changed Files / 변경 파일

- `backend/app/services/target_dataset_local_runner.py`
- `backend/app/api/source_catalog.py`
- `backend/tests/test_target_dataset_local_materialization.py`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/workflows/feature/gold-dataset-runtime-materialization/plan.md`
- `docs/workflows/feature/gold-dataset-runtime-materialization/quality.md`

## Implementation Summary / 구현 요약

- prepared Gold가 있으면 기존처럼 `prepared_gold_reference`로 유지한다.
- prepared Gold가 없고 Silver parquet가 있으면 `silver_parquet_to_gold` 모드로 Gold parquet를 생성한다.
- runtime Gold output은 prepared gold directory가 아니라 `data/dataset_runs/<run_id>/gold/` 아래에 저장해 prepared/reference 영역을 오염시키지 않는다.
- runtime evidence에 `object_storage.status=not_uploaded`와 expected `object_uri`를 남겨 MinIO upload success와 구분한다.
- `/runs` UI에서 `Silver parquet to Gold` 완료 문구와 bytes/storage fact를 표시한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_week2_storage_adapter.py -q
npm --prefix frontend run build
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/gold-dataset-runtime-materialization/quality.md`
- Quality gate status: 통과
- TDD status: focused backend tests 수정 및 통과
- CI/check result: local focused tests/build 통과
- Browser smoke: `/runs`에서 `dataset_c28_browser_gold` 실행 성공

## Regression Guard / 회귀 보호

- Checked feature: prepared Gold reference, Silver parquet Gold materialization, storage evidence separation
- Protected behavior: prepared Gold path와 runtime output path가 섞이지 않는다.
- Result: 통과

## Failure Scenario / 실패 시나리오

- Reviewed failure: MinIO upload 미실행을 성공으로 오인
- Expected behavior: local parquet 생성은 성공, object storage는 `not_uploaded`
- Verification: backend assertion + browser smoke run card
- Result: 통과

## Manual Verification / 수동 검증

- Environment: local frontend `http://127.0.0.1:13011`, backend `http://127.0.0.1:18000`
- Result: `dataset_c28_browser_gold` run 실행 성공
- Evidence:
  - Run id: `986517ff-3224-4100-9c7c-9c1072bd0a2a`
  - Output: `data/dataset_runs/986517ff-3224-4100-9c7c-9c1072bd0a2a/gold/dataset_c28_browser_gold.parquet`
  - UI facts: rows `1000`, bytes `9.0 KiB`, storage `not_uploaded`

## Document Updates / 문서 업데이트

- Updated: `docs/03` Gold execute 계약, C-28 plan, quality, report
- Not updated and why: Catalog publish/AI Query는 C-30에서 runtime Gold output 기준으로 정렬한다.

## Failed / Incomplete / Follow-Up TODO

- 실제 MinIO upload는 Gold runner에서 opt-in으로 아직 실행하지 않았다.
- join/aggregate/score recipe는 demo-safe generated Gold rows로 표현했다.

## Context For Next Phase / 다음 Phase 문맥

- 다음 Phase는 C-29 `feature/jobs-runs-runtime-integration`.
- Jobs definition과 Runs execution evidence를 source/silver/gold 전체로 더 균일하게 정렬하면 된다.

## Secret / Migration / Env Check

- Secret check: raw credential 저장 없음.
- Migration/data change: browser smoke용 `dataset_c28_browser_gold` draft/run과 local Gold parquet 생성.
- Env change: 18000 backend를 새 코드로 재시작해 browser smoke 확인.

## Final Judgment / 최종 판단

- Done: C-28 완료
- Remaining risk: production-grade recipe engine과 object upload execution은 후속 Phase
