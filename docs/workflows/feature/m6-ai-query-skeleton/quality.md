# M6 AI Query 스켈레톤 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M6는 integration contract, SQL guardrail, API response shape를 바꾸므로 regression 위험이 있다.
- Failing test first: `backend/tests/test_week2_ai_query.py`를 먼저 추가해 route, retrieval, guardrail 기대 동작을 고정한다.
- Expected failure command/result: `pytest`와 기본 Python에 dependency가 없어 최초 실행은 runner/dependency 없음으로 실패. 임시 venv 설치 후 첫 runnable focused test는 `ValidationResult.failure_code` convenience property 누락으로 3 failed, 1 passed.
- Pass command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> 4 passed; `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests -q` -> 22 passed.
- Refactor notes: JSON 응답 계약은 `guardrail.failure_code`를 유지하고, Python test 편의를 위해 `ValidationResult.failure_code` property만 추가했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not run | skipped | no Python linter configured in repo |
| unit/focused test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` | pass | 4 passed |
| integration/contract test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_venv/bin/python -m pytest backend/tests -q` | pass | 22 passed |
| build/typecheck | `python3 -m compileall backend/app` | pass | backend app compiled |
| JSON contract validation | `jq -e . contracts/*.sample.json >/dev/null` | pass | all fixture JSON valid |
| container backend pytest | `docker build -f infra/docker/backend.Dockerfile -t asklake-backend:m6-fix .` | blocked locally | Docker daemon unavailable: `connect: no such file or directory`; CI `container-smoke` previously failed because contracts fixture was not copied into image, fixed by copying `contracts/` and robust fixture path lookup |
| harness validation | `scripts/validate-harness.sh` | not run separately | covered by strict command |
| strict harness validation | `scripts/validate-harness.sh --strict` | pass | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, before PR merge
- CI result: 
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| lint | no Python lint command is defined in current repo scripts or requirements | n/a |
| real DuckDB/Parquet SQL execution | excluded from this skeleton; M3/M5 real Catalog/Parquet path is not ready yet | n/a |
