# M2 Taxi 5GB local Spark evidence 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: `Week2TaxiSparkRunner`가 Parquet directory 입력, 월별 Taxi schema drift, Spark driver memory option, Parquet vectorized reader toggle을 처리하게 했다.
- Verified: PySpark local mode로 사용자 제공 Taxi Parquet directory를 실행했다. 입력 `308,010,490 rows`, `4,871,531,583 bytes`; 출력 `2,608 rows`, `225,057 bytes`; 실행 시간 `107,366ms`.
- Remaining: Docker Spark cluster, MinIO/S3 durable write, Airflow/M5 invocation, Product Health 5GB 대표 경로.
- Next context: 같은 Taxi 5GB 입력으로 Docker Spark cluster를 붙여보고, M1/M3가 Product Health 5GB 입력과 최종 spec을 준비하면 대표 경로 evidence를 실행한다.
- Risk: Taxi daily Gold는 M2 runtime scale 보조 증거다. Week 2 대표 데모 경로인 `pipeline_product_health_e2e` / `gold_product_health`를 대체하지 않는다.

---

## Phase

- Type: feature
- Branch/work location: `feature/m2-taxi-5gb-local-evidence`, `docs/workflows/feature/m2-taxi-5gb-local-evidence`
- Date: 2026-06-29
- Workspace state: local validation passed; PR pending

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/07-manual-verification-playbook.md`
- `docs/12-quality-gates.md`

## Goal / 목표

- PySpark local mode가 5GB급 Taxi Parquet directory를 읽고 Gold Parquet output과 실행 증거를 남기는지 확인한다.

## Changed Files / 변경 파일

- `backend/app/services/week2_taxi_spark_runner.py`
- `scripts/week2_m2_taxi_spark_local_evidence.py`
- `backend/tests/test_week2_taxi_spark_runner.py`
- `docs/03-interface-reference.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/feature/m2-taxi-5gb-local-evidence/*`

## Implementation Summary / 구현 요약

- Taxi Spark runner가 단일 파일뿐 아니라 Parquet directory도 입력으로 받을 수 있게 했다.
- 월별 Taxi Parquet의 type 차이를 daily metric에 필요한 공통 type으로 맞춘 뒤 Spark에서 합치게 했다.
- local Spark 5GB 실행을 위해 `--driver-memory`와 `--disable-vectorized-reader` option을 추가했다.
- summary에 driver memory와 vectorized reader 사용 여부를 남긴다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_taxi_spark_runner.py -q

PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python scripts/week2_m2_taxi_spark_local_evidence.py \
  --input '<LOCAL_TAXI_PARQUET_DIR>' \
  --profile local-full-month \
  --run-id run_taxi_5gb_local_spark_001 \
  --master 'local[2]' \
  --driver-memory 8g \
  --disable-vectorized-reader \
  --summary-path data/results/m2_taxi_5gb_local_evidence/run_taxi_5gb_local_spark_001_summary.json
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m2-taxi-5gb-local-evidence/quality.md`
- Quality gate status: passed-with-skips
- TDD status: applied to directory input bytes and schema drift reproduction
- CI/check result: pending
- Skipped checks: Docker Spark cluster, Airflow DAG-internal Spark invocation, MinIO/S3 durable write
- CD/deploy gate: not required

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`
- Environment: local PySpark `4.1.2`, `SPARK_LOCAL_IP=127.0.0.1`, Spark master `local[2]`, driver memory `8g`
- Result: succeeded
- Evidence: `data/results/m2_taxi_5gb_local_evidence/run_taxi_5gb_local_spark_001_summary.json` and output Parquet path recorded in summary

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: M2 Taxi local batch supporting evidence
- Status: satisfied for local Spark supporting evidence
- Evidence: input rows/bytes, duration, output path, output rows/bytes are recorded in summary

## Failed / Incomplete / Follow-Up TODO

- First 5GB attempt exposed Taxi monthly schema drift; fixed by per-file canonicalization.
- Second attempt exposed local JVM heap pressure; fixed by `--driver-memory 8g` and `--disable-vectorized-reader`.
- Docker Spark cluster remains required before final M2 completion.
- Product Health 5GB representative path remains separate and must be run when M1/M3 input/spec are ready.

## Secret / Migration / Env Check

- Secret check: no secret added
- Migration/data change: no tracked data migration; result files are gitignored evidence artifacts
- Env change: local PySpark execution needs Java and enough local memory

## Final Judgment / 최종 판단

- Done: Taxi 5GB local Spark supporting evidence is complete.
- Remaining risk: local Spark success does not prove Docker cluster execution or Product Health representative workflow.
