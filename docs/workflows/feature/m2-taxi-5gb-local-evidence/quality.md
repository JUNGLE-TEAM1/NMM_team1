# M2 Taxi 5GB local Spark evidence 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: yes
- Reason: 실제 5GB Taxi 묶음은 디렉터리 입력이고 월별 Parquet schema가 조금씩 달랐다. 기존 테스트는 단일 파일 happy path만 확인했다.
- Failing test first: 기존 구현은 디렉터리 입력 bytes와 서로 다른 `passenger_count` type을 한 번에 검증하지 못했다.
- Expected failure command/result: `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_taxi_spark_runner.py -q`는 sandbox 안에서 PySpark socket bind 제한으로 실패할 수 있어 escalated local run으로 확인했다.
- Pass command/result: `2 passed in 7.91s`
- Refactor notes: Taxi Parquet 파일을 파일별로 읽고 필요한 column type으로 정규화한 뒤 `unionByName`으로 합치도록 변경했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | no output after merging `origin/main` `53e07e04` |
| unit/focused test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python -m pytest backend/tests/test_week2_taxi_spark_runner.py -q` | passed | `2 passed in 7.14s` after merging `origin/main` `53e07e04` |
| integration/contract test | `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python scripts/week2_m2_taxi_spark_local_evidence.py --input '<LOCAL_TAXI_PARQUET_DIR>' --profile local-full-month --run-id run_taxi_5gb_local_spark_001 --master 'local[2]' --driver-memory 8g --disable-vectorized-reader --summary-path data/results/m2_taxi_5gb_local_evidence/run_taxi_5gb_local_spark_001_summary.json` | passed | input `308,010,490 rows`, `4,871,531,583 bytes`; output `2,608 rows`, `225,057 bytes`; duration `107,366ms` |
| build/typecheck | `PYTHONPATH=backend .venv/bin/python -m py_compile backend/app/services/week2_taxi_spark_runner.py scripts/week2_m2_taxi_spark_local_evidence.py` | passed | no output after merging `origin/main` `53e07e04` |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` after merging `origin/main` `53e07e04` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, after PR
- CI result: local checks passed; remote CI pending after PR
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Docker Spark cluster smoke | 이번 PR은 PySpark local mode 5GB evidence만 닫고, Docker Spark cluster는 후속 작업으로 남기기로 했다. | user-directed scope |
| Airflow DAG 내부 Spark 호출 | M5 통합 후속 작업이며 이번 evidence runner 직접 실행 범위가 아니다. | user-directed scope |
