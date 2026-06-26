# Week2 M1 synthetic raw demo data 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes, lightweight focused test
- Reason: data contract 변환 로직이 M3 필수 6필드와 synthetic behavior event shape를 지켜야 한다.
- Failing test first: `python3 -m pytest tests/test_week2_m1_synthetic_raw.py -q`
- Expected failure command/result: failed because local Python environments do not include `pytest`
- Pass command/result: `python3 -m unittest tests/test_week2_m1_synthetic_raw.py` -> `Ran 3 tests in 0.000s`, `OK`
- Refactor notes: pytest 의존 없이 표준 라이브러리 `unittest`로 focused test를 실행 가능하게 조정했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not run | skipped | Python script is covered by focused unittest and execution smoke; no repo lint command exists for scripts |
| unit/focused test | `python3 -m unittest tests/test_week2_m1_synthetic_raw.py` | passed | `Ran 3 tests in 0.000s`, `OK` |
| integration/contract test | JSONL required-field validation command in report | passed | `row_count=10000`, `bad_rows=[]`, fields match M3 contract |
| local runner smoke | `PYTHONPATH=backend python3 ... Week2LocalRunner ... contracts/workflow_definition.sample.json` | passed | `status=fallback_succeeded`, `row_count=10000`, `output_row_count=539` |
| build/typecheck | not applicable | skipped | no frontend/backend build changed |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.`; unrelated in-progress workspaces skipped by strict completion-only checks |

## CI/CD Gate / CI-CD 게이트

- CI required: yes if PR is opened
- CI result: local validation only; remote CI after PR if opened
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: remove `scripts/week2_m1_synthetic_raw.py`, focused test, and workspace/report docs; ignored `data/` can be regenerated or deleted locally.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| pytest | local Python and bundled Python do not include pytest; converted focused test to `unittest` | not required |
| frontend build | frontend not changed | not required |
| backend full pytest | backend runtime code not changed; local runner smoke directly checked generated review seed against existing workflow | not required |
