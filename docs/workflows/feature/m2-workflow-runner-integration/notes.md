# M2 Workflow runner 연동 노트

## 진행 메모

- 2026-06-27: 이전 PR #163에서 `Week2SparkRunner`가 Amazon Reviews JSONL을 Parquet로 쓰는 local evidence는 완료됐다.
- 2026-06-27: 이번 branch는 M5 `Week2WorkflowService`가 `executor=spark_runner` 요청을 받아 M2 runner를 호출하는 연결 통로만 구현한다.
- 2026-06-27: `spark_runner`는 아직 M3의 Bronze/Silver/Gold transformation semantics를 실행하지 않는다. 현재 책임은 입력 파일을 읽고 Parquet output과 실행 metric을 반환하는 runtime boundary다.

## 결정

- `spark_runner`는 `local_runner`, `airflow`와 같은 workflow executor 선택지로 추가한다.
- output path는 기존 Week 2 output root 아래 `reviews/gold/run_id=<run_id>/<target_dataset>.parquet` 형태로 둔다. 이름은 기존 catalog target과 맞추되, 이번 PR은 Gold 비즈니스 변환 완료를 주장하지 않는다.

## 열린 질문

- Airflow DAG 안에서 `spark_runner`를 호출하는 방식은 M5 후속 작업에서 정한다.
- M3 `TransformSpec`가 준비된 뒤 `spark_runner`가 변환 spec까지 실행할지, 별도 M3 job logic을 호출할지는 후속 통합에서 정한다.

## 링크 / 증거

- 이전 M2 evidence PR: #163
- linked issue: #166
