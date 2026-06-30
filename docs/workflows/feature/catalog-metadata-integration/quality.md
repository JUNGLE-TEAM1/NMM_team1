# Catalog metadata integration 품질 게이트

- TDD status: backend publish test 추가 후 구현.
- Required checks: backend focused tests, frontend build, interface/workflow docs, regression/manual verification 반영.
- Regression focus: queued/unmaterialized run은 catalog에 등록되지 않고, 같은 run publish는 중복 row를 만들지 않는다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| backend focused tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_job_run_handoff.py backend/tests/test_target_dataset_draft_persistence.py` | passed | 11 passed |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| HTTP smoke | draft/run/execute/publish/list API 호출 후 cleanup | passed | `source_type=target_dataset_job_run`, `lineage.run_id`, `metrics.row_count`, catalog list match 확인 |
| browser smoke | `/runs`에서 `Catalog 등록` 클릭 후 `/datasets/gold` 확인 | passed | registered Gold Dataset과 rows/bytes/path 표시 확인 후 smoke data cleanup |
| docs propagation | `docs/03`, `docs/05`, `docs/06`, `docs/07`, `docs/08` 확인 | passed | C-6 publish 계약과 검증 절차 반영 |
