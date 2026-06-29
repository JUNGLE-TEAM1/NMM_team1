# M2 Docker Spark Taxi evidence 노트

## 진행 메모

- `gh` 토큰이 invalid이고 GitHub 앱도 issue/PR 생성 권한이 403이라 원격 issue 생성 없이 `--no-issue` workspace로 시작했다. 작업 후 GitHub 앱으로 issue/PR 생성을 다시 시도했지만 둘 다 403으로 실패했다.
- 현재 branch는 `feature/m2-taxi-5gb-local-evidence`의 runner 보강에 의존한다. 해당 PR이 아직 GitHub에 생성/merge되지 못했기 때문에 이 branch는 로컬에서 그 branch를 fast-forward merge한 상태로 진행했다.
- `apache/spark:4.0.1`은 M3 compose와 같은 공개 Spark image라 선택했다. `apache/spark-py:4.0.1` manifest는 없었다.
- 첫 Docker smoke 실패 원인은 `SPARK_LOCAL_IP=m2-spark-driver`가 driver container 내부에서 resolve되지 않는 문제였다. driver hostname/alias와 runner network 기본값을 보정했다.
- 두 번째 Docker smoke 실패 원인은 Spark image Python이 3.10인데 `datetime.UTC`가 Python 3.11 기능이어서 발생했다. `timezone.utc` alias로 호환 보강했다.
- 이후 small smoke와 5GB smoke 모두 성공했다.

## 결정

- Driver는 Docker 안에서 실행한다.
- Spark image는 `apache/spark:4.0.1` 공개 image로 시작한다.
- Worker는 2개로 둔다.
- Schema drift는 runner 보정 대상으로 본다.
- Docker cluster smoke는 작은 Taxi 파일을 먼저 실행하고, 성공하면 5GB Taxi directory를 실행한다.

## 열린 질문

- GitHub issue/PR 자동화 권한 복구가 필요하다. 현재 `gh auth status`는 invalid token이고 GitHub 앱 issue/PR create는 403이다.
- 이전 `feature/m2-taxi-5gb-local-evidence` PR이 main에 들어간 뒤 이 branch를 main 기준으로 정리해야 한다.
- Branch push는 성공했다. 수동 PR URL은 `https://github.com/JUNGLE-TEAM1/NMM_team1/pull/new/feature/m2-docker-spark-taxi-evidence`다.

## 링크 / 증거

- Small Docker Spark summary: `data/results/m2_taxi_spark_docker_evidence/run_taxi_docker_spark_small_001_summary.json` (gitignored)
- 5GB Docker Spark summary: `data/results/m2_taxi_spark_docker_evidence/run_taxi_docker_spark_5gb_001_summary.json` (gitignored)
- Small result: input `10,000 rows`, `4,442,620 bytes`; output `6 rows`, `4,593 bytes`; duration `8,578ms`.
- 5GB result: input `308,010,490 rows`, `4,871,531,583 bytes`; output `2,608 rows`, `225,261 bytes`; duration `105,872ms`.
- Output Parquet readback result: small output `6 rows`, 5GB output `2,608 rows`, both with `gold_taxi_daily_metrics` columns.
