# Target Dataset run handoff 품질 게이트

- TDD status: backend focused test 추가.
- Required checks: backend focused tests, frontend build, contract JSON validation, HTTP smoke, browser smoke, diff check.
- Regression focus: Target Dataset draft 저장/조회와 data navigation route를 깨지 않는다.
- Execution guard: queued run handoff를 실제 runner 실행 성공으로 표현하지 않는다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| backend focused tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_target_dataset_draft_persistence.py` | passed | 6 passed |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| contract JSON | `jq -e . contracts/target_dataset_job_run.sample.json contracts/target_dataset_draft.sample.json contracts/source_dataset.sample.json contracts/external_connection.sample.json` | passed | JSON valid |
| HTTP smoke | local backend `POST /api/target-dataset-drafts`, `POST /api/target-dataset-job-runs`, `GET /api/target-dataset-job-runs` | passed | queued run 생성과 list 조회 확인 |
| browser smoke | `/jobs/gold-build`에서 `Run 준비`, `/runs` 확인 | passed | queued run, target name, runner-not-triggered note 표시 |
| smoke cleanup | SQLite cleanup + API 조회 | passed | `run_handoff_smoke` record 없음 |
| diff check | `git diff --check -- backend/app/domain/schemas.py backend/app/ports/metadata_store.py backend/app/adapters/sqlite_metadata_store.py backend/app/api/source_catalog.py backend/tests/test_target_dataset_job_run_handoff.py contracts/target_dataset_job_run.sample.json frontend/src/api/targetDatasetDraftApi.js frontend/src/app/App.jsx docs/03-interface-reference.md docs/08-development-workflow.md docs/reports/README.md docs/reports/target-dataset-run-handoff.md docs/workflows/feature/target-dataset-run-handoff` | passed | whitespace issue 없음 |
