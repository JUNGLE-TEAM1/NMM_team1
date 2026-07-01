# Manual Run Scheduler Boundary 보고서

## Short Report / 짧은 보고

- Type: Phase C-51
- Date: 2026-07-01
- Changed: schedule 저장은 metadata-only이고 manual execute만 output evidence를 만든다는 경계를 테스트와 UI 문구로 보강했다.
- Verified: focused backend 26 passed, frontend build passed, Jobs/Runs browser smoke passed, `git diff --check` passed.
- Remaining: full browser demo smoke에서 실제 클릭 흐름 전체를 확인한다.
- Next context: Full Browser Demo Smoke.
- Risk: 실제 scheduler, cron worker, Airflow DAG trigger, Spark submit, retry/backfill은 후속 runtime orchestration 범위다.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/workflows/feature/manual-run-scheduler-boundary/plan.md`
- `docs/workflows/feature/manual-run-scheduler-boundary/quality.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Implementation Summary / 구현 요약

- Target Dataset schedule update 테스트가 Job Run을 만들지 않는지 확인한다.
- Silver Dataset schedule update 테스트가 materialization record를 만들지 않는지 확인한다.
- queued Gold Build Run은 explicit execute 전 `output_path`, `row_count`, `output_bytes`가 없음을 확인한다.
- Jobs 화면 문구를 schedule intent metadata와 manual execute boundary 중심으로 보강했다.
- Schedule modal 문구에서 scheduler 등록, DAG trigger, lake output 생성이 없음을 명확히 표시했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_target_dataset_draft_persistence.py backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_job_run_handoff.py -q
npm --prefix frontend run build
git diff --check
```

## Manual Verification / 수동 검증

- Environment: `VITE_PROXY_TARGET=http://127.0.0.1:8000 npm --prefix frontend run dev -- --host 127.0.0.1`
- Routes: `/jobs/connection-sync`, `/jobs/silver-transform`, `/jobs/gold-build`, `/runs`
- Result: non-blank render, C-51 wording visible, no Vite runtime error.

## Regression Guard / 회귀 보호

- Checked feature: schedule metadata update, queued run creation, Jobs/Runs wording
- Protected behavior: schedule update alone does not create run/materialization/output evidence.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: placeholder schedule이 cron 등록, DAG trigger 성공, Spark job success처럼 보이는 상태
- Expected behavior: placeholder는 metadata intent only로 표시되고 실행은 manual execute path로만 진행된다.
- Verification: focused tests and Jobs browser smoke
- Result: passed

## Secret / Migration / Env Check

- Secret check: raw credential 추가 없음
- Migration/data change: 없음
- Env change: 없음

## Final Judgment / 최종 판단

- Done: C-51 완료.
- Remaining risk: 실제 클릭 흐름 전체 smoke는 다음 Phase에서 확인한다.
