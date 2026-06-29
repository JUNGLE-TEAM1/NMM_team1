# M2 product health runtime smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-product-health-runtime-smoke`, `docs/workflows/feature/m2-product-health-runtime-smoke`
- Date: 2026-06-28
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, Week2 ver2 team handoff/main path/runner boundary docs
- Escalated context read: `docs/03-interface-reference.md`, M3 v2.1.1 L0/L1/L10 docs, existing M2 runner/runtime tests
- Context omitted intentionally: full M3 L0-L10 implementation internals, Docker Spark cluster setup, M5 Airflow DAG internals
- Changed: `RuntimeConfig.source_inputs[]`와 `Week2SparkRunner` multi-source pass-through 실행을 추가해 reviews/behavior/delivery/product raw input을 source별 Parquet output과 `Week2RunnerResult` 호환 evidence로 남기게 했다.
- Verified: failing test first 확인, focused test 5 passed, Product Health runtime CLI smoke succeeded, contract JSON validation, backend 전체 테스트 73 passed, diff check, harness/strict harness, compileall passed.
- Remaining: M3 L6 `TransformSpec` 실제 실행, `gold_product_health` 최종 집계, Docker Spark cluster, 5GB input evidence, Airflow DAG 내부 SparkRunner 호출은 후속 작업이다.
- Next context: M2는 여러 raw source를 같은 run에서 읽고 source별 Parquet/evidence를 만들 수 있다. M3는 이 경로 위에 Bronze/Silver/Gold semantics를 얹고, M5는 directory `output_path`와 source별 `task_results[].output_path` 소비 방식을 확인해야 한다.
- Risk: 현재 실행은 local pyarrow pass-through smoke다. Spark cluster/distributed execution이나 M3 semantic transform을 증명하지 않는다.

## Canonical Report / 표준 보고서

- `docs/reports/m2-product-health-runtime-smoke.md`
