# M2 source input 계약 확장 품질 기록

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `RuntimeConfig.source_inputs[]` shared contract가 바뀌므로 기존 field 호환과 새 field 실행 경로를 regression test로 고정해야 한다.
- Failing test first: `test_week2_spark_runner_accepts_source_type_format_path_aliases`, `test_week2_spark_runner_fails_for_unsupported_connection_source_type`
- Expected failure command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` -> 2 failed, 5 passed. 기존 `RuntimeSourceInput`이 `input_format` / `input_path`만 필수로 요구했다.
- Pass command/result: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` -> 7 passed
- Refactor notes: 기존 legacy field를 유지하고 새 `source_type` / `format` / `path`는 같은 local file reader로 들어가게 했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| unit/focused test | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` | passed | 7 passed |
| CLI smoke | `PYTHONPATH=backend .venv/bin/python scripts/week2_m2_product_health_runtime_smoke.py --summary-path data/results/m2_product_health_runtime_smoke/source_input_contract_summary.json` | passed | 4 sources, 11 rows, 1412 input bytes, 6719 output bytes |
| contract JSON validation | `python3 -m json.tool contracts/runtime_config.sample.json` | passed | JSON parse OK |
| diff check | `git diff --check` | passed | whitespace conflict 없음 |
| compileall | `.venv/bin/python -m compileall backend/app scripts/week2_m2_product_health_runtime_smoke.py` | passed | Python syntax/import compile OK |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, after PR
- CI result: pending PR creation
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: revert `RuntimeSourceInput` additive fields and related tests/docs if M5/M3 consumers cannot tolerate the expanded contract.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| full backend tests | focused runner contract change라 직접 관련 test와 smoke를 우선 실행 | no explicit separate confirmation |
| remote CI | GitHub auth/permission blocks push/PR | blocked |
| actual S3/PostgreSQL/MongoDB/Kafka connector smoke | 이번 scope는 contract compatibility only | user requested compatibility change |

## 예정 검증

- `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q`
- `python3 -m json.tool contracts/runtime_config.sample.json`
- `git diff --check`

## 결과

- TDD baseline: `backend/tests/test_week2_spark_runner.py`에 새 테스트 2개 추가 후 첫 실행에서 2 failed, 5 passed를 확인했다. 실패 원인은 `RuntimeSourceInput`이 `input_format` / `input_path`만 필수로 요구했기 때문이다.
- Focused test: `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` passed, 7 passed.
- Runtime smoke: `PYTHONPATH=backend .venv/bin/python scripts/week2_m2_product_health_runtime_smoke.py --summary-path data/results/m2_product_health_runtime_smoke/source_input_contract_summary.json` passed.
- Contract JSON: `python3 -m json.tool contracts/runtime_config.sample.json` passed.
