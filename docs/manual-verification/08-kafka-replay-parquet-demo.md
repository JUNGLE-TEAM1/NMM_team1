# 08. Kafka Replay to Parquet Demo

## 목적

기존 CSV 샘플을 Kafka topic에 replay하고, consumer가 읽은 메시지를 Parquet 파일로 저장되는 것까지 로컬에서 확인한다.

이 문서는 Spark/S3 운영 구현이 아니라 데모 확인용 경량 흐름이다. 운영 흐름에서는 Spark Structured Streaming이 consumer 역할을 하고, micro-batch 단위로 S3에 Delta/Parquet 파일을 append한다.

## 준비

- Docker Kafka container 이름이 `kafka`여야 한다. 다르면 스크립트에 `--container`를 넘긴다.
- Kafka CLI가 container 안에 있어야 한다: `kafka-console-producer`, `kafka-console-consumer`.
- Python에 Parquet 저장 의존성이 필요하다.

```bash
python -m pip install pandas pyarrow
```

Kafka UI를 같이 보고 싶으면 별도 UI container를 띄운다.

```bash
docker run -d --name xflow-kafka-ui \
  --network xflow_default \
  -p 8084:8080 \
  -e KAFKA_CLUSTERS_0_NAME=local \
  -e KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=kafka:9092 \
  provectuslabs/kafka-ui:latest
```

## 실행

```bash
python scripts/kafka_replay_to_parquet_demo.py \
  --csv "D:\DownloadsSSD\15GB짜리 데이터\2019-Dec_1MB_sample.csv" \
  --topic xflow_replay_2019_dec_sample \
  --output demo-output/kafka-replay-parquet/xflow_replay_2019_dec_sample.parquet \
  --preview-html demo-output/kafka-replay-parquet/kafka-replay-parquet-preview.html
```

스크립트가 하는 일은 딱 이 순서다.

1. CSV row를 JSON message로 바꿔 Kafka topic에 넣는다.
2. 새 consumer group으로 topic을 처음부터 읽는다.
3. 읽은 JSON object들을 Parquet 파일로 저장한다.
4. 선택하면 HTML preview도 만든다.

## UI에서 볼 것

- Kafka UI: `http://localhost:8084`
- `Topics` -> `xflow_replay_2019_dec_sample`: 들어간 JSON 메시지 모양 확인
- `Consumers` -> 스크립트 출력에 나온 consumer group: 누가 읽었는지, lag가 0까지 줄었는지 확인

Parquet 파일 자체는 Kafka UI에 안 나온다. 아래처럼 preview 서버를 띄워서 본다.

```bash
python -m http.server 8099 --directory demo-output/kafka-replay-parquet
```

브라우저에서 연다.

```text
http://localhost:8099/kafka-replay-parquet-preview.html
```

## AskLake 하네스 evidence 확인

`kafka-replay-console` API로 replay를 실행하면 job 진행 상태가 아래 경로에 저장된다.

```text
data/results/week2/_metadata/kafka_replay/<run_id>.json
data/results/week2/_metadata/kafka_replay/latest.json
```

backend가 켜져 있으면 아래 API로 같은 evidence를 확인한다.

```bash
curl -fsS http://localhost:8000/api/week2/kafka-replay/health
curl -fsS http://localhost:8000/api/week2/kafka-replay/runs
curl -fsS http://localhost:8000/api/week2/kafka-replay/runs/<run_id>
```

확인 기준:

- `contract`가 `KafkaReplayEvidence`다.
- `metrics.sent_rows`가 replay로 보낸 row 수와 맞는다.
- `metrics.error_count`가 실패 시나리오가 아니면 `0`이다.
- `lineage.source_file`에서 `lineage.kafka_topic`으로 흐름이 남는다.
- `health.status`가 실행 중에는 `running`, 완료 뒤에는 `ok`다.

## 운영 흐름으로 읽기

데모 흐름:

```text
CSV replay -> Kafka -> demo consumer -> local Parquet
```

운영 흐름:

```text
real-time source -> Kafka -> Spark Structured Streaming -> S3 Delta/Parquet -> Trino SQL
```

즉 이 데모의 consumer 저장 부분을 운영에서는 Spark가 맡는다.
