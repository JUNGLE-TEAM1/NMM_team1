# M2 Taxi Docker Spark evidence 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: `apache/spark:4.0.1` 기반 Docker Spark master 1개, worker 2개, driver 1개 실행 경로를 추가했다. 기존 Taxi Spark runner는 local master일 때만 `SPARK_LOCAL_IP=127.0.0.1`을 기본값으로 두도록 보정했다.
- Verified: 작은 Taxi 파일 smoke와 5GB Taxi directory smoke가 모두 Docker Spark cluster에서 성공했고, summary JSON에 input rows/bytes, duration, output path, output rows/bytes를 남겼다.
- Remaining: Branch push는 성공했지만 GitHub issue/PR 자동 생성은 현재 인증 권한 403으로 보류다. Product Health 5GB 대표 경로, MinIO/S3 durable write, Airflow DAG 내부 Spark 호출은 후속 작업이다.
- Next context: `feature/m2-taxi-5gb-local-evidence`가 main에 먼저 반영된 뒤 이 branch를 main 기준으로 정리한다.
- Risk: 공개 image에서 runtime dependency를 `pip install`로 주입하므로 반복 실행 시간이 늘 수 있다. 반복 실행이 불안정하면 후속으로 작은 custom image를 만든다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m2-docker-spark-taxi-evidence`, `docs/workflows/feature/m2-docker-spark-taxi-evidence`
- Date: 2026-06-29
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`

## Goal / 목표

Docker 안에서 Spark driver/master/worker를 실행해 Taxi Parquet을 읽고 `gold_taxi_daily_metrics` Parquet을 만드는 경로를 증명한다.

## Changed Files / 변경 파일

- `docker/m2-taxi-spark-docker-compose.yml`
- `scripts/week2_m2_taxi_spark_docker_evidence.sh`
- `backend/app/services/week2_taxi_spark_runner.py`
- `backend/app/services/week2_storage_adapter.py`
- `scripts/week2_m2_taxi_spark_local_evidence.py`
- `backend/tests/test_week2_taxi_spark_runner.py`
- `docs/03-interface-reference.md`
- `docs/07-manual-verification-playbook.md`

## Implementation Summary / 구현 요약

Docker Compose는 Spark master 1개, worker 2개, driver 1개를 띄운다. host의 Taxi 데이터 directory는 `/data/taxi`로 읽고, repo의 결과 directory는 `/app/data/results/...`로 쓴다.

기존 Taxi Spark runner는 local master와 Docker cluster master를 구분한다. local mode에서는 Java gateway 안정화를 위해 `SPARK_LOCAL_IP=127.0.0.1`을 기본값으로 두고, `spark://m2-spark-master:7077` 같은 cluster master에서는 driver hostname/alias로 worker가 driver를 찾게 둔다.

Docker image의 Python 3.10에서도 storage adapter가 동작하도록 `datetime.UTC` 사용을 `timezone.utc` alias로 보정했다.

## Verification Commands / 검증 명령

```bash
ASKLAKE_TAXI_HOST_DIR='/Users/liamtsy/Desktop/asklake_taxi_data copy' scripts/week2_m2_taxi_spark_docker_evidence.sh small
ASKLAKE_TAXI_HOST_DIR='/Users/liamtsy/Desktop/asklake_taxi_data copy' scripts/week2_m2_taxi_spark_docker_evidence.sh 5gb
scripts/week2_m2_taxi_spark_docker_evidence.sh down
```

## Manual Verification / 수동 검증

- Small Docker Spark: input `10,000 rows`, `4,442,620 bytes`; output `6 rows`, `4,593 bytes`; duration `8,578ms`.
- 5GB Docker Spark: input `308,010,490 rows`, `4,871,531,583 bytes`; output `2,608 rows`, `225,261 bytes`; duration `105,872ms`.
- Output Parquet readback: small output `6 rows`, 5GB output `2,608 rows`, both with the expected `gold_taxi_daily_metrics` columns. pyarrow emitted macOS sandbox CPU info warnings, but readback succeeded.
- Evidence files are under `data/results/m2_taxi_spark_docker_evidence/` and intentionally gitignored.

## Failed / Incomplete / Follow-Up TODO

- `gh` token is invalid and GitHub app issue/PR creation returned 403, so issue/PR automation needs auth repair before this branch can be opened automatically. Manual PR URL: `https://github.com/JUNGLE-TEAM1/NMM_team1/pull/new/feature/m2-docker-spark-taxi-evidence`.
- This branch is stacked on `feature/m2-taxi-5gb-local-evidence`. Merge that branch first, then rebase or recreate this PR against updated main.
- Product Health 5GB representative evidence remains the next M2 evidence target after M1/M3 final input/spec readiness.

## Secret / Migration / Env Check

- Secret check: no credential committed.
- Migration/data change: no migration. Docker smoke writes gitignored evidence under `data/results/`.
- Env change: Docker and the local Taxi directory are required for manual verification.

## Final Judgment / 최종 판단

- Done: Docker Spark standalone Taxi evidence path is implemented and smoke-tested.
- Remaining risk: PR automation is blocked by GitHub auth, and the branch depends on the previous M2 local Spark evidence branch.
