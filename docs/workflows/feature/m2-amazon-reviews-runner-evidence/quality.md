# M2 Amazon Reviews JSONL runner evidence 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: partial
- Reason: 이번 작업은 기존 `Week2SparkRunner`의 새 core logic이 아니라, Amazon Reviews JSONL evidence CLI와 shape 검증을 추가하는 좁은 wrapper다. strict red/green TDD 대신 focused regression test를 추가했다.
- Failing test first: not performed
- Expected failure command/result: `python3 -m unittest tests/test_week2_m2_amazon_reviews_runner_evidence.py` -> failed because system Python had no `pyarrow`
- Pass command/result: `.venv/bin/python -m unittest tests/test_week2_m2_amazon_reviews_runner_evidence.py` -> `Ran 2 tests`, `OK`
- Refactor notes: script는 기존 `RuntimeConfig`와 `Week2SparkRunner`를 호출한다. 새 공유 contract나 Taxi/M3 transform logic은 추가하지 않았다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| whitespace | `git diff --check` | passed | output 없음 |
| unit/focused test | `.venv/bin/python -m unittest tests/test_week2_m2_amazon_reviews_runner_evidence.py` | passed | `Ran 2 tests in 0.071s`, `OK`; sandbox sysctl warning은 non-fatal |
| runner regression | `PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q` | passed | `1 passed in 0.11s` |
| manual evidence smoke | `.venv/bin/python scripts/week2_m2_amazon_reviews_runner_evidence.py --summary-path data/results/m2_amazon_reviews_runner_evidence/summary.json` | passed | status `succeeded`, input row count `4`, output row count `4`, output bytes `1898`, duration `27ms` |
| M1 synthetic raw generation | `.venv/bin/python scripts/week2_m1_synthetic_raw.py --category Gift_Cards --review-rows 10000 --product-rows 1000 --events-per-product 3` | passed | `reviews_seed.jsonl` 10,000 rows, `product_master_seed.jsonl` 1,000 rows, `behavior_events_seed.jsonl` 3,000 rows, required fields present `true` |
| synthetic raw runner evidence | `.venv/bin/python scripts/week2_m2_amazon_reviews_runner_evidence.py --input data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl --output-root data/results/m2_amazon_reviews_runner_evidence --run-id run_m2_amazon_reviews_synthetic_001 --summary-path data/results/m2_amazon_reviews_runner_evidence/synthetic_summary.json` | passed | after merging `origin/main`, status `succeeded`, input row count `10000`, output row count `10000`, input bytes `2264170`, output bytes `731455`, duration `119ms` |
| parquet output verification | `.venv/bin/python -c "from pathlib import Path; import pyarrow.parquet as pq; p=Path('data/results/m2_amazon_reviews_runner_evidence/spark_smoke/run_id=run_m2_amazon_reviews_synthetic_001/reviews_seed.parquet'); t=pq.read_table(p); print({'path': str(p), 'rows': t.num_rows, 'columns': t.column_names, 'bytes': p.stat().st_size})"` | passed | actual Parquet rows `10000`, columns `review_id`, `product_id`, `rating`, `review_text`, `review_time`, `verified_purchase`, `run_id` |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | ready-for-review 상태에서 `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, when PR opens
- CI result: not run yet
- Deploy/publish required: no
- Deployment confirmation: not needed
- Rollback/smoke notes: rollback은 `scripts/week2_m2_amazon_reviews_runner_evidence.py`, `tests/test_week2_m2_amazon_reviews_runner_evidence.py`, 이 workspace 문서 변경을 되돌리면 된다. generated `data/results/...`는 ignored local evidence다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| real Spark cluster execution | 이번 branch는 Spark 교체 가능한 runner boundary를 local `pyarrow` Parquet smoke로 검증한다. | workspace scope |
| SQL smoke | Parquet output 이후 별도 검산 branch 범위다. | workspace scope |
| Taxi evidence | Amazon Reviews main path evidence와 분리한다. | workspace scope |
