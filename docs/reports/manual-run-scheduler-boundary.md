# Manual Run Scheduler Boundary

## Short Report / 짧은 보고

- Type: Phase C-51
- Date: 2026-07-01
- Changed: schedule 저장은 metadata-only이고 manual execute만 output evidence를 만든다는 경계를 테스트와 UI 문구로 보강했다.
- Verified: focused backend 26 passed, frontend build passed, Jobs/Runs browser smoke passed, `git diff --check` passed.
- Remaining: full browser demo smoke에서 실제 클릭 흐름 전체를 확인한다.
- Next context: Full Browser Demo Smoke.
- Risk: 실제 scheduler, cron worker, Airflow DAG trigger, Spark submit, retry/backfill은 후속 runtime orchestration 범위다.

## 변경 파일

- `backend/tests/test_target_dataset_draft_persistence.py`
- `backend/tests/test_silver_dataset_persistence.py`
- `backend/tests/test_target_dataset_job_run_handoff.py`
- `frontend/src/features/datasets/DatasetManageModals.jsx`
- `frontend/src/features/datasets/SourcesNavigationView.jsx`
- `frontend/src/features/datasets/SourcesTargetDatasetWizard.jsx`
- `docs/workflows/feature/manual-run-scheduler-boundary/quality.md`
- `docs/workflows/feature/manual-run-scheduler-boundary/sync.md`
- `docs/workflows/feature/manual-run-scheduler-boundary/next-actions.md`
- `docs/workflows/feature/manual-run-scheduler-boundary/report.md`

## 구현 요약

- Target Dataset schedule update는 Job Run을 생성하지 않는다.
- Silver Dataset schedule update는 materialization record를 생성하지 않는다.
- queued Gold Build Run은 explicit execute 전 output evidence가 없다.
- Jobs 화면과 schedule modal 문구는 schedule intent metadata와 manual execute boundary를 구분한다.

## 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_draft_persistence.py backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_job_run_handoff.py -q
npm --prefix frontend run build
git diff --check
```

Browser smoke:

- `/jobs/connection-sync`
- `/jobs/silver-transform`
- `/jobs/gold-build`
- `/runs`

결과:

- focused backend: 26 passed
- frontend build: passed
- browser smoke: passed
- whitespace check: passed

## 다음 Phase 문맥

- Full Browser Demo Smoke에서 실제 클릭 흐름 전체를 확인한다.
- schedule placeholder가 자동 실행, cron 등록, Airflow/Spark success처럼 보이면 C-51 회귀다.
