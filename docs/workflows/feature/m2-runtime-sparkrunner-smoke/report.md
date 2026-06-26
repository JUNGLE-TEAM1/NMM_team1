# M2 RuntimeConfig SparkRunner smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-runtime-sparkrunner-smoke`, `docs/workflows/feature/m2-runtime-sparkrunner-smoke`
- Date: 2026-06-26
- Workspace state: draft
- Context Budget mode: Lite Read
- Primary context read: `plan.md`, `runner-boundary-decision.md`, `docs/12-quality-gates.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`
- Escalated context read: existing `Week2LocalRunner`, Week2 workflow/catalog tests, `contracts/runtime_config.sample.json`
- Context omitted intentionally: full UI/M5/M6 implementation documents; this PR does not integrate runner selection, Catalog persistence, or Query UI
- Changed: added M2 `RuntimeConfig`, `Week2SparkRunner` local Parquet smoke, `pyarrow` backend dependency, focused runner test, and `spark_runner_smoke` fixture fields in `contracts/runtime_config.sample.json`
- Verified: failing test first recorded; `backend/tests/test_week2_spark_runner.py` -> 1 passed; Week2 focused tests -> 15 passed; all backend tests -> 37 passed; backend Docker image build passed; Docker runner smoke -> 1 passed; `git diff --check`; `python3 -m json.tool contracts/runtime_config.sample.json`; manual verification review for output path/row count/bytes/duration evidence; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`
- Remaining: no PR created yet; no push after implementation; real Spark cluster execution, M5 runner selection integration, SQL smoke, and Taxi large-data evidence are follow-up work
- Next context: decide whether to commit this PR 1 scope, then prepare PR with `Closes #131`; after merge, choose M5 runner integration, SQL smoke, or Taxi evidence by team dependency
- Risk: `Week2SparkRunner` is Spark-compatible local smoke, not real distributed Spark execution. It proves the input/output/result boundary and Parquet path before heavier Spark wiring.
