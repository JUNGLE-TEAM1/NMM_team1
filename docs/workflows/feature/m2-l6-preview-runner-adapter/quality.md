# M2 L6 preview runner adapter 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `RuntimeConfig`와 `Week2SparkRunner`의 runner contract가 바뀌고 M3 L6 spec handoff를 소비하므로 focused regression test가 필요하다.
- Failing test first: `test_week2_spark_runner_executes_l6_silver_preview_spec`, `test_week2_spark_runner_executes_l6_gold_aggregate_spec`, `test_week2_spark_runner_executes_l6_nested_and_quarantine_operations`, `test_week2_spark_runner_executes_l6_hash_operation`, `test_week2_spark_runner_fails_l6_hash_without_policy`, `test_week2_spark_runner_fails_l6_unsupported_operation`
- Expected failure command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` -> 3 failed, 5 passed. 기존 runner가 `transform_spec`을 무시하고 pass-through output만 만들었다.
- Pass command/result: `PYTHONPATH=backend /Users/liamtsy/Desktop/krafton_jungle/NMM_team1/.venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` -> 13 passed after main sync and allowlist expansion
- Refactor notes: 기존 single-input 및 `source_inputs[]` pass-through 경로는 유지하고, `transform_spec` 또는 `transform_spec_path`가 있을 때만 L6 preview adapter로 분기했다. M3 L6 allowlist 13개 operation을 preview 범위에서 지원하되, `hash`는 HMAC-SHA256 policy/secret reference가 없으면 실패시키고 `quarantine_if_invalid`는 rule이 없으면 실패시킨다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| diff check | `git diff --check` | passed | whitespace conflict 없음 |
| unit/focused test | `PYTHONPATH=backend /Users/liamtsy/Desktop/krafton_jungle/NMM_team1/.venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` | passed | 13 passed |
| contract sample smoke | `PYTHONPATH=backend /Users/liamtsy/Desktop/krafton_jungle/NMM_team1/.venv/bin/python -c '...'` | passed | `contracts/runtime_config.sample.json`의 `l6_preview_runtime_smoke` 실행 성공, 3 rows, output 1176 bytes |
| contract JSON validation | `jq -e . contracts/*.sample.json` | passed | 모든 contract sample JSON parse OK |
| backend full tests | `PYTHONPATH=backend /Users/liamtsy/Desktop/krafton_jungle/NMM_team1/.venv/bin/python -m pytest backend/tests -q` | passed with escalation | 91 passed |
| build/typecheck | `/Users/liamtsy/Desktop/krafton_jungle/NMM_team1/.venv/bin/python -m compileall backend/app scripts` | passed | Python syntax/import compile OK |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, after PR
- CI result: previous PR #230 remote checks 8/8 passed before allowlist expansion. After this update is pushed, GitHub Actions must rerun and be checked again.
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: revert `RuntimeConfig.transform_spec*` fields and L6 preview adapter if M3/M5 handoff contract changes before merge.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Docker Spark cluster | 이번 PR은 M3 L6 spec을 M2 runner 경계에 붙이는 local preview adapter이며, Docker Spark cluster는 후속 M2 scale/runtime Phase 범위다. | yes, scope confirmed |
| Airflow DAG-internal SparkRunner 호출 | M5 Airflow DAG 내부 wiring은 별도 integration Phase에서 다룬다. 이번 PR은 M5가 직접 `spark_runner`를 호출할 수 있는 runner 경계까지만 검증한다. | yes, scope confirmed |
| 5GB Product Health input run | 이번 PR은 spec adapter 기능 검증이다. 5GB evidence는 팀원이 input 묶음을 준비한 뒤 같은 runner 경로로 후속 실행한다. | yes, scope confirmed |
