# M2 Amazon Reviews JSONL runner evidence 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-amazon-reviews-runner-evidence`, `docs/workflows/feature/m2-amazon-reviews-runner-evidence`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/workflows/docs/week2-main-e2e-path/decisions.md`, `docs/workflows/docs/week2-main-e2e-path/notes.md`, `docs/workflows/feature/week2-m1-synthetic-raw/report.md`, `backend/app/services/week2_spark_runner.py`, `backend/tests/test_week2_spark_runner.py`
- Escalated context read: not needed
- Context omitted intentionally: M3 Bronze implementation internals, M5 Workflow/Catalog adapter internals, SQL engine implementation, Taxi benchmark plan
- Changed: added `scripts/week2_m2_amazon_reviews_runner_evidence.py`, `tests/test_week2_m2_amazon_reviews_runner_evidence.py`, and workspace evidence docs for Amazon Reviews JSONL runner proof.
- Verified: focused unittest, existing `Week2SparkRunner` regression, sample evidence smoke, M1 synthetic raw 10,000행 generation, synthetic raw runner evidence, Parquet row count verification, `origin/main` merge, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: none for current main/integration consumption. Historical PR/issue lifecycle may be audited separately if needed.
- Next context: after merge, choose M5 runner integration or SQL smoke as the next M2/M5/M6 handoff. M1 synthetic raw can be regenerated with the recorded command because generated `data/` artifacts stay ignored.
- Risk: this is local `pyarrow` Parquet evidence, not distributed Spark execution. It proves the runner boundary and output evidence path, not GB/TB scale processing.

## 실행 증거

기본 sample 실행 명령:

```bash
.venv/bin/python scripts/week2_m2_amazon_reviews_runner_evidence.py --summary-path data/results/m2_amazon_reviews_runner_evidence/summary.json
```

핵심 결과:

- status: `succeeded`
- input: `backend/samples/amazon_reviews_demo.jsonl`
- input logical shape: `amazon_reviews_json`
- input row count: `4`
- required fields present: `true`
- output path: `data/results/m2_amazon_reviews_runner_evidence/spark_smoke/run_id=run_m2_amazon_reviews_evidence_001/amazon_reviews_demo.parquet`
- output row count: `4`
- output bytes: `1898`
- duration: `27ms`

M1 synthetic raw가 로컬에 있는 경우 같은 명령을 아래처럼 확장한다.

```bash
.venv/bin/python scripts/week2_m2_amazon_reviews_runner_evidence.py \
  --input data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl \
  --output-root data/results/m2_amazon_reviews_runner_evidence \
  --run-id run_m2_amazon_reviews_synthetic_001 \
  --summary-path data/results/m2_amazon_reviews_runner_evidence/synthetic_summary.json
```

실제 M1 synthetic raw 10,000행 실행 결과:

- generation command: `.venv/bin/python scripts/week2_m1_synthetic_raw.py --category Gift_Cards --review-rows 10000 --product-rows 1000 --events-per-product 3`
- review seed: `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`
- review seed row count: `10000`
- product seed row count: `1000`
- behavior event row count: `3000`
- required fields present: `true`
- runner status: `succeeded`
- synthetic input bytes: `2264170`
- synthetic output row count: `10000`
- synthetic output bytes: `731455`
- synthetic runner duration: `119ms` after merging `origin/main`
- synthetic output path: `data/results/m2_amazon_reviews_runner_evidence/spark_smoke/run_id=run_m2_amazon_reviews_synthetic_001/reviews_seed.parquet`
- direct Parquet verification: actual rows `10000`, columns `review_id`, `product_id`, `rating`, `review_text`, `review_time`, `verified_purchase`, `run_id`
