# M5 Runner Selection Catalog Guard 품질 기록

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed
- Quality gate detail: local checks passed after rebase onto `origin/main` `11b746e`
- Source Of Truth impact: none. 이번 변경은 M5 service guard와 workspace 운영 문서에 한정된다.
- Harness test impact: none

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M5 executor selection은 runner boundary와 Catalog/run history 안전성에 직접 영향을 준다. unknown/future executor가 Airflow fallback으로 조용히 흘러가는 regression을 막아야 한다.
- Failing test first: yes
- Expected failure command/result: `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py -q` -> failed as expected before `Week2WorkflowInvalidExecutorError` existed.
- Pass command/result: `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py backend/tests/test_week2_ai_query.py -q` -> 22 passed
- Refactor notes: no broad refactor. `Week2WorkflowService`에 supported executor guard만 추가했다.

## 검증 전략

- 각 slice는 focused pytest만 우선 실행한다.
- full backend tests, frontend build, Docker smoke, `scripts/validate-harness.sh --strict`는 Phase 종료 또는 영향 범위가 넓어진 경우에만 실행한다.
- 실제 Airflow/Spark/MinIO smoke는 이번 Phase 범위 제외다.

## Slice별 검증

| Slice | Command | Result | Note |
| --- | --- | --- | --- |
| Slice 1 baseline | `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py backend/tests/test_week2_ai_query.py -q` | passed, 18 passed in 0.39s | M5/M6 focused baseline |
| Slice 2 executor guard expected failure | `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py -q` | failed as expected, missing `Week2WorkflowInvalidExecutorError` before implementation | TDD guard test introduced first |
| Slice 2 executor guard pass | `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py -q` | passed, 13 passed in 0.39s | unknown executor service/API guard |
| Slice 3 future runner defer | `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py backend/tests/test_week2_ai_query.py -q` | passed, 20 passed in 0.38s | `spark` is rejected/deferred instead of silently using Airflow fallback |
| Slice 4 final | `git diff --check`; `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py backend/tests/test_week2_ai_query.py -q` | passed; passed, 20 passed in 0.44s | Phase 종료 경량 검증 |
| Slice 5 runtime_config future runner guard | `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py -q`; `PYTHONPATH=backend python3 -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py backend/tests/test_week2_ai_query.py -q` | passed, 15 passed in 0.38s; passed, 22 passed in 0.34s | `spark_runner` and typo executors rejected before run creation |
| Post-rebase validation | `git diff --check`; `scripts/validate-harness.sh --strict`; `PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py backend/tests/test_week2_ai_query.py -q` | passed; passed; passed, 25 passed in 0.52s | `origin/main` `11b746e` 위로 rebase 후 재검증 |

## CI / Broader Validation

- Full backend tests: not run. 이번 변경은 M5 workflow/API/service guard와 workspace 문서에 한정되어 focused tests로 검증했다.
- Frontend build: not run. UI 변경 없음.
- Docker/container smoke: not run. 실제 Airflow/Spark/MinIO 연결 범위 아님.
- Harness strict validation: `scripts/test-harness.sh` passed locally after documentation contract fix, 31 regression cases.

## CI/CD Gate / CI-CD 게이트

- CI required: yes before PR
- CI result: local focused checks and strict harness passed after rebase onto `origin/main` `11b746e`; remote CI rerun pending after force-with-lease push.
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: additive service guard. Rollback은 `Week2WorkflowInvalidExecutorError` guard와 관련 tests 제거.
