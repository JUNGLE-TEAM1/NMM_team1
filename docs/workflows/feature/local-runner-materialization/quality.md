# Local runner materialization 품질 게이트

- TDD status: backend focused test 추가.
- Required checks: backend focused tests, frontend build, contract JSON validation, HTTP smoke, browser smoke, diff check.
- Regression focus: queued run handoff 생성/조회와 navigation route를 깨지 않는다.
- Execution guard: C-4.5 local materialization을 Airflow/Spark/5GB 처리로 표현하지 않는다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| backend focused tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_target_dataset_draft_persistence.py` | passed | 8 passed |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| contract JSON | `jq -e . contracts/target_dataset_job_run.sample.json contracts/target_dataset_draft.sample.json` | passed | JSON valid |
| HTTP smoke | local backend draft/run 생성 후 `/execute` | passed | succeeded, row_count 1, output_bytes > 0, Silver/Gold files 존재 |
| browser smoke | `/runs`에서 `Local 실행` 클릭 | passed | succeeded, rows 1, output path 표시 |
| smoke cleanup | SQLite cleanup + output cleanup + API 조회 | passed | `materialize_smoke` record 없음 |
| diff check | `git diff --check -- backend/app/domain/schemas.py backend/app/ports/metadata_store.py backend/app/adapters/sqlite_metadata_store.py backend/app/api/source_catalog.py backend/app/services/target_dataset_local_runner.py backend/tests/test_target_dataset_local_materialization.py contracts/target_dataset_job_run.sample.json frontend/src/api/targetDatasetDraftApi.js frontend/src/app/App.jsx docs/03-interface-reference.md docs/08-development-workflow.md docs/reports/README.md docs/reports/local-runner-materialization.md docs/workflows/feature/local-runner-materialization` | passed | whitespace issue 없음 |
