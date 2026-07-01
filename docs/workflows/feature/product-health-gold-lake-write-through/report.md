# Product Health Gold Lake Write-through 보고서

## Short Report / 짧은 보고

- Type: Phase C-49
- Date: 2026-07-01
- Changed: Product Health prepared Gold parquet 실행이 prepared path를 최신 output으로 노출하지 않고 `data/lake/gold/run_id=<run_id>/...parquet`에 copy/write-through한 파일을 Run output으로 저장하게 했다.
- Verified: focused backend 14 passed, frontend build passed, `git diff --check` passed.
- Remaining: C-50에서 Catalog/AI Query가 같은 lake output을 읽는지 clean-room handoff를 닫는다.
- Next context: C-50 Product Health lake Catalog handoff.
- Risk: full 5GB ETL, Airflow/Spark 실행, MinIO upload는 여전히 후속 범위다.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/workflows/feature/product-health-gold-lake-write-through/plan.md`
- `docs/workflows/feature/product-health-gold-lake-write-through/quality.md`
- `docs/reports/data-lake-storage-alignment.md`
- `docs/reports/gold-dataset-runtime-materialization.md`
- `docs/reports/product-health-silver-gold-run-execution.md`

## Implementation Summary / 구현 요약

- `TargetDatasetLocalRunner.reference_prepared_gold()`가 prepared parquet를 `gold_run_path(run.id, draft.gold_output)`로 `copy2`한 뒤 lake output path를 반환한다.
- `runtime_evidence.materialization_mode`를 `prepared_gold_write_through`로 분리하고 `reference_evidence.path`에 prepared input path를 남겼다.
- `prepared_output=false`, `prepared_reference=true`, `write_through=true`로 최신 output과 prepared reference 역할을 구분했다.
- `/runs` UI의 mode label에 `prepared parquet write-through`를 추가했다.
- materialization/publish regression tests를 C-49 기준으로 갱신했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py -q
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_product_health_preset_synthesis.py -q
npm --prefix frontend run build
git diff --check
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/product-health-gold-lake-write-through/quality.md`
- Quality gate status: passed
- TDD status: focused regression tests updated before final verification
- CI/check result: local checks passed
- Skipped checks: planned `backend/tests/test_product_health_gold_lineage_preset.py`는 현재 저장소에 없어 관련 publish/preset 테스트로 대체

## Regression Guard / 회귀 보호

- Checked feature: prepared Product Health Gold local runner execution
- Protected behavior: `data/local_sources/product_health/gold/gold_product_health.parquet`가 최신 Run output으로 저장되지 않는다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: 성공 Run인데 lake output file이 없거나 row/bytes evidence가 없는 상태
- Expected behavior: output file exists under `data/lake/gold/run_id=<run_id>/`, `row_count=1000`, `output_bytes` equals file size
- Verification: `backend/tests/test_target_dataset_local_materialization.py`
- Result: passed

## Manual Verification / 수동 검증

- Document executed: C-49 focused local validation
- Environment: local pytest/build
- Result: passed
- Failure/limitation: browser click-through는 수행하지 않았다. UI 영향은 mode label 1개이며 build로 확인했다.
- Evidence: focused backend 14 passed, frontend build passed

## Secret / Migration / Env Check

- Secret check: raw credential 추가 없음
- Migration/data change: metadata schema migration 없음. 실행 시 lake output parquet 파일을 생성한다.
- Env change: 없음

## Final Judgment / 최종 판단

- Done: C-49 완료.
- Remaining risk: C-50에서 Catalog/AI Query가 prepared reference가 아닌 lake output path를 계속 쓰는지 확인해야 한다.
