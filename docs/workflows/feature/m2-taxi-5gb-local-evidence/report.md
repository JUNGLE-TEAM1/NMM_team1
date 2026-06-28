# M2 Taxi 5GB local Spark evidence 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-taxi-5gb-local-evidence`, `docs/workflows/feature/m2-taxi-5gb-local-evidence`
- Date: 2026-06-29
- Workspace state: in-progress
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, workspace files, `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/07-manual-verification-playbook.md`
- Escalated context read: real Taxi 5GB execution failure logs during local Spark run
- Context omitted intentionally: unrelated M1/M4/M5/M6 implementation details
- Changed: `Week2TaxiSparkRunner` now handles Parquet directory input, Taxi monthly schema drift, driver memory option, and vectorized reader toggle. Evidence CLI records those runtime options.
- Verified: focused PySpark runner tests passed; 4.87GB Taxi Parquet directory produced `gold_taxi_daily_metrics` Parquet and summary evidence.
- Remaining: Docker Spark cluster, MinIO/S3 durable write smoke, Airflow/M5 invocation, Product Health 5GB representative path.
- Next context: M2 should move to Docker Spark cluster setup before Product Health 5GB evidence, unless integration pressure makes M5 Airflow invocation more urgent.
- Risk: Taxi Gold metric is supporting evidence only. It must not be presented as the Week 2 representative Product Health path.
