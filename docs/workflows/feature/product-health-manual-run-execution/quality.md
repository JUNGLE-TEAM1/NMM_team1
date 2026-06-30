# Product Health Manual Run execution 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: Product Health Manual Run의 성공/실패 계약과 parquet output 생성은 후속 PR 4/6/7/8이 의존하는 공유 실행 계약이다.
- Failing test first: 기존 `test_product_health_target_dataset_run_exposes_manual_run_contract`는 PR 5A pending 계약을 기대했기 때문에 PR 5B 실행 요구와 맞지 않았다.
- Expected failure command/result: `PYTHONPATH=backend pytest backend/tests/test_target_dataset_run_handoff.py -q`는 기본 Python 환경에 `pyarrow`가 없어 collection 전에 실패했다. repo `.venv`에는 `pyarrow==18.1.0`이 있어 `.venv/bin/python`으로 재실행했다.
- Pass command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_target_dataset_run_handoff.py -q` -> `5 passed in 0.55s`.
- Refactor notes: Product Health Target run만 별도 실행 경로로 분기하고, 일반 Target run은 기존 Week2 fixture handoff를 유지했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not run | skipped | 별도 lint command가 repo 표준으로 고정되어 있지 않아 관련 pytest/harness로 검증 |
| unit/focused test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_target_dataset_run_handoff.py -q` | passed | `5 passed in 0.55s` |
| integration/contract test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_target_dataset_run_handoff.py backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py tests/test_product_health_contracts.py backend/tests/test_week2_product_health_l6_evidence.py backend/tests/test_week2_spark_runner.py -q` | passed | `30 passed in 0.65s` |
| build/typecheck | not run | skipped | backend-only contract/runtime slice이며 frontend build 영향 없음 |
| harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | 완료 상태 재실행 결과 `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR 생성 후 GitHub checks 확인 필요
- CI result: PR #315 GitHub checks passed after PR body update
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: Product Health 실행 경로는 `process_rule.type=product_health_gold_pipeline`에만 적용되므로 일반 Target Dataset run은 기존 fixture handoff로 rollback 가능

## GitHub Checks / GitHub 확인

- PR: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/315
- Result: all checks passed
- Checks: `container-smoke`, `harness`, `linked-issue`, `manifest-smoke`, `migration-schema-security`, `pr-size-hard-gate`, `pr-template-drift`, `risk-warning`
- Note: initial `pr-template-drift`, `migration-schema-security`, `pr-size-hard-gate` failed because PR body did not use the 7-section handoff, did not fill `API/schema 영향`, and exceeded size hard gate without the allowed large PR exception. PR body was updated; rerun checks passed.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend build | backend API/runtime/docs 변경만 포함. UI 변경 없음 | no |
| live browser smoke | PR 5B는 API 실행 계약이며 frontend 표시 연결은 후속 UI/PR에서 확인 | no |
