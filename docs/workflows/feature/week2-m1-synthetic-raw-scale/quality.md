# Week2 M1 synthetic raw demo sample scale 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes, focused test + scale validation
- Reason: scale sample도 M3 계약 6필드, manifest option, behavior event type을 유지해야 한다.
- Failing test first: not rerun as a new failing test; PR #154 focused tests remain the regression guard.
- Expected failure command/result: not applicable
- Pass command/result: `python3 -m unittest tests/test_week2_m1_synthetic_raw.py` -> `Ran 3 tests`, `OK`
- Refactor notes: generator selected option 기록을 보강했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not run | skipped | no repo lint command for scripts |
| unit/focused test | `python3 -m unittest tests/test_week2_m1_synthetic_raw.py` | passed | `Ran 3 tests`, `OK` |
| scale generation | `python3 scripts/week2_m1_synthetic_raw.py --category Health_and_Personal_Care --review-rows 100000 --product-rows 10000 --events-per-product 3 --selected-option option_2_recommended_mvp_demo` | passed | review 100,000; product 10,000; behavior 30,000 |
| integration/contract test | JSONL field validation + manifest/summary check | passed | `bad_rows=[]`; selected option `option_2_recommended_mvp_demo` |
| local runner smoke | `PYTHONPATH=backend python3 ... Week2LocalRunner ... contracts/workflow_definition.sample.json` | passed | `fallback_succeeded`, `row_count=100000`, `output_row_count=28190` |
| post-main-sync local runner smoke | `PYTHONPATH=backend python3 ... Week2LocalRunner ... contracts/workflow_definition.sample.json` | passed | after merging latest `origin/main`: `fallback_succeeded`, `row_count=100000`, `output_row_count=28190` |
| second post-main-sync local runner smoke | `PYTHONPATH=backend python3 ... Week2LocalRunner ... contracts/workflow_definition.sample.json` | passed | after second `origin/main` merge: `fallback_succeeded`, `row_count=100000`, `output_row_count=28190` |
| build/typecheck | not applicable | skipped | frontend/backend runtime code not changed |
| harness validation | covered by strict run | passed | `scripts/validate-harness.sh --strict` includes normal harness validation |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes if PR is opened
- CI result: local validation only
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: generated `data/` can be deleted and regenerated; code rollback is reverting generator selected option change.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend build | frontend not changed | not required |
| backend full pytest | backend runtime not changed; focused local runner smoke covers generated seed path | not required |
