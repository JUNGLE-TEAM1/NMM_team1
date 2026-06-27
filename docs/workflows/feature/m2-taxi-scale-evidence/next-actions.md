# M2 Taxi scale evidence 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: PySpark local evidence ready; 5GB scale input pending
- Summary: Taxi pyarrow runner는 Parquet 디렉터리 입력을 처리하도록 보강되었고, PySpark local mode로 10,000행 Taxi smoke와 MinIO-compatible upload smoke가 성공했다. 다만 현재 CLI 환경에서 TLC CloudFront/S3 직접 다운로드가 `403`으로 차단되어 약 5GB 원본 다운로드는 완료하지 못했다.

## Recommended Next Action / 권장 다음 행동

- 브라우저나 다른 다운로드 경로로 `yellow_tripdata` 월별 Parquet 파일을 `data/raw/taxi/yellow_tripdata_2019_2025/` 아래에 둔 뒤 Spark local mode directory input evidence를 실행한다.
- Reason: 현재 Spark local 경로는 작은 Taxi Parquet에서 검증되었고, 5GB evidence는 같은 경로에 input만 디렉터리로 바꾸면 된다.

## Options / 선택지

1. 사람이 TLC 파일을 내려받아 `data/raw/taxi/yellow_tripdata_2019_2025/`에 넣고, AI가 Spark directory input evidence를 실행한다.
2. 현재 PR은 PySpark local smoke + MinIO upload smoke + 5GB 재실행 명령까지로 닫고, 5GB 실행은 후속 증거로 남긴다.
3. Docker Spark cluster wiring 이슈/브랜치를 후속으로 만든다.
4. `fhvhv_tripdata`처럼 더 큰 TLC 파일을 쓰도록 별도 schema/runner 대응 작업을 새로 잡는다.

## Waiting On Human / 사람 응답 대기

- 5GB 실제 원본 실행을 원하면 월별 `yellow_tripdata` Parquet 파일을 로컬 ignored 경로에 준비해야 한다.
- CLI에서 공식 TLC/CloudFront/S3 GET 요청은 `403`으로 차단된 상태다.

## Last User Choice / 마지막 사용자 선택

- 

## Next AI Action / 다음 AI 행동

- option 1이면 `PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python scripts/week2_m2_taxi_spark_local_evidence.py --input data/raw/taxi/yellow_tripdata_2019_2025 --profile local-full-month --run-id run_taxi_yellow_2019_2025_spark_scale_001 --summary-path data/results/m2_taxi_spark_local_evidence/run_taxi_yellow_2019_2025_spark_scale_001_summary.json`를 실행한다.
- option 2이면 현재 변경과 Spark/MinIO smoke 증거를 정리한 뒤 PR 준비 검증으로 넘어간다.
- option 3이면 Docker Spark cluster 후속 이슈/브랜치를 만든다.
- option 4이면 현재 branch 범위를 수정하거나 후속 이슈로 분리한다.
