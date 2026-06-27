# M2 Taxi scale evidence 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m2-taxi-scale-evidence`, `docs/workflows/feature/m2-taxi-scale-evidence`
- Date: 2026-06-27
- Workspace state: draft
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, current workspace files, Taxi runner/test files
- Escalated context read: TLC official page/download probing, previous M2 Taxi runner implementation
- Context omitted intentionally: full Source of Truth audit; this step is scoped to M2 Taxi scale evidence setup and download/run probing
- Changed: Added `pyspark==4.1.2`, `Week2TaxiSparkRunner`, and `scripts/week2_m2_taxi_spark_local_evidence.py` for PySpark local mode Taxi evidence. Workspace plan/quality/next actions were updated. Existing pyarrow Taxi runner changes were excluded to keep the PR under the hard size gate.
- Verified: PySpark local install smoke succeeded with Spark `4.1.2`; focused Taxi Spark/storage tests passed; M5 boundary-focused suite passed; local January 2024 Spark demo smoke succeeded; temporary MinIO smoke succeeded with `spark_upload_taxi_daily_metrics`; backend Docker container smoke passed with the PySpark test skipped when Java is absent.
- Remaining: TLC direct 5GB download could not run from CLI because CloudFront/S3 GET requests returned `403`. User-downloaded monthly Parquet files can be placed under `data/raw/taxi/yellow_tripdata_2019_2025/` and rerun as Spark directory input. Docker Spark cluster remains required for final M2 completion but is not part of this PR slice.
- Next context: when files exist locally, run the Taxi Spark evidence CLI with `--input data/raw/taxi/yellow_tripdata_2019_2025 --profile local-full-month` and record row/bytes/duration/output evidence. Follow-up after this PR is Docker Spark cluster wiring and, later, Airflow/M5 invocation.
- Risk: current Spark evidence is PySpark local mode on the developer machine. It proves Spark read/transform/write and MinIO-compatible upload, not distributed cluster scheduling, executor scaling, or Spark direct `s3a://` write.
