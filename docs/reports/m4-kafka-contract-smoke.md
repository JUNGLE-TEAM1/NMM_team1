# M4 Kafka 구현 보고서

## 한눈 요약

- M4는 CSV 이벤트 데이터를 Kafka topic으로 다시 흘려보내는 재생 경로를 만들었다.
- 만든 것은 Kafka 실행 환경, 재생 콘솔 API, CSV -> Kafka -> Parquet 데모 스크립트, 재생 증거 조회용 백엔드 API다.
- 데이터는 CSV 파일에서 시작해 JSON 메시지로 바뀌고, Kafka topic에 들어간다.
- 실행 결과는 `data/results/week2/_metadata/kafka_replay/` 아래 JSON 증거로 남는다.
- 이 증거는 M1 화면, M5 실행 증거, M3 후속 처리에서 확인할 수 있는 M4 인계 지점이다.

## M4가 맡은 역할

M4는 “실시간처럼 들어오는 원본 이벤트”를 담당한다.

원래 파일만 있으면 배치처럼 한 번에 읽는 흐름만 보인다.
M4는 같은 데이터를 Kafka로 흘려보내서 “이 데이터가 이벤트 스트림으로 들어올 수 있다”는 것을 보여준다.

M4가 하는 것:

- Kafka topic 이름과 원본 이벤트 모양을 정한다.
- CSV row를 JSON 메시지로 바꿔 Kafka에 넣는다.
- 몇 건을 보냈는지, 실패가 있었는지, 어느 topic으로 갔는지 증거를 남긴다.
- 후속 M3/M5가 읽을 수 있도록 계약 파일과 백엔드 조회 API를 제공한다.

M4가 하지 않는 것:

- Silver/Gold 변환을 만들지 않는다.
- Catalog 저장을 직접 소유하지 않는다.
- 1차 발표의 `gold_product_health` 필수 생성 경로를 막는 차단 요소가 아니다.

## 구현한 것

| 파일 | 역할 |
| --- | --- |
| `docker-compose.yml` | 로컬 Kafka, Zookeeper, Kafka UI 실행 환경 |
| `kafka-replay-console/server.mjs` | CSV를 찾고, 샘플을 만들고, Kafka로 재생하고, 실행 증거를 저장하는 Node.js API |
| `kafka-replay-console/package.json` | 재생 콘솔 실행 스크립트와 `kafkajs` 의존성 |
| `scripts/kafka_replay_to_parquet_demo.py` | CSV를 Kafka에 넣고 다시 읽어서 Parquet으로 저장하는 데모 CLI |
| `backend/app/services/week2_kafka_replay_evidence.py` | 저장된 Kafka 재생 증거 JSON을 읽는 서비스 |
| `backend/app/api/week2_kafka_replay.py` | M4 증거를 백엔드 API로 노출하는 route |
| `backend/tests/test_week2_kafka_replay_evidence.py` | M4 증거 조회 서비스와 API 검증 |
| `contracts/kafka_topic_contract.sample.json` | M4가 M3/M5에 넘기는 Kafka topic 계약 |
| `docs/manual-verification/08-kafka-replay-parquet-demo.md` | 사람이 직접 Kafka 재생과 Parquet 출력을 확인하는 절차 |

## 데이터 흐름

```text
CSV 이벤트 파일
↓
CSV row를 JSON 메시지로 변환
↓
Kafka topic에 전송
↓
소비자가 topic에서 읽음
↓
Parquet 파일 또는 실행 증거 JSON으로 저장
↓
backend API에서 실행 증거 조회
```

코드 기준 흐름:

```text
POST /api/replay/start
↓
kafka-replay-console/server.mjs
↓
Kafka topic 생성 또는 확인
↓
CSV 한 줄씩 읽기
↓
Kafka 메시지 전송
↓
data/results/week2/_metadata/kafka_replay/<run_id>.json 저장
↓
GET /api/week2/kafka-replay/health
GET /api/week2/kafka-replay/runs
GET /api/week2/kafka-replay/runs/{run_id}
```

## 사용한 데이터셋

현재 실제 증거에 사용된 데이터는 생성 샘플 CSV다.

| 항목 | 값 |
| --- | --- |
| 파일 | `demo-output/replay-samples/sample-65536-bytes.csv` |
| 크기 | 약 65KB |
| 전체 row | 909 |
| 실제 전송 row | 25 |
| key column | `user_id` |
| 이벤트 종류 | `view`, `click`, `purchase` |

샘플 row 모양:

```csv
event_id,user_id,event_type,event_time,amount,payload
evt-1,user-1,view,2023-11-14T22:13:21.000Z,2,"sample payload 1"
evt-2,user-2,click,2023-11-14T22:13:22.000Z,3,"sample payload 2"
evt-3,user-3,purchase,2023-11-14T22:13:23.000Z,4,"sample payload 3"
```

수동 확인 문서에서는 로컬 CSV 예시로 `2019-Dec_1MB_sample.csv`를 넣어 Kafka -> Parquet 흐름을 확인할 수 있게 했다.

## Kafka 계약

M4 계약 파일은 `contracts/kafka_topic_contract.sample.json`이다.

중요 값:

- 생산자: `M4`
- 소비자: `M3`, `M5`
- source_id: `source_kafka_reviews_events_demo`
- topic: `asklake.reviews.raw_events`
- 이벤트 key: `event_id`
- 이벤트 시간 컬럼: `event_time`
- 이벤트 모양: `event_id`, `event_time`, `event_type`, `payload`

즉 M4는 이런 약속을 남긴다.

```text
이 topic에 원본 이벤트가 들어온다.
event_id로 이벤트를 구분한다.
event_time으로 이벤트 시간을 판단한다.
M3는 원본 이벤트 모양을 보고 변환을 이어갈 수 있다.
M5는 실행 증거를 run evidence로 기록할 수 있다.
```

## 저장 위치

Kafka 메시지 자체는 Kafka broker에 들어간다.

로컬 Kafka 설정:

- broker 내부 주소: `kafka:9092`
- 호스트 접근 주소: `localhost:29092`
- Kafka UI: `http://localhost:8084`
- topic 예시: `harness-evidence-smoke-231017`

M4 실행 증거는 파일로 저장된다.

```text
data/results/week2/_metadata/kafka_replay/<run_id>.json
data/results/week2/_metadata/kafka_replay/latest.json
```

Parquet 데모 출력은 실행자가 넘긴 `--output` 경로에 저장된다.

예시:

```text
demo-output/kafka-replay-parquet/xflow_replay_2019_dec_sample.parquet
demo-output/kafka-replay-parquet/kafka-replay-parquet-preview.html
```

## 실제 실행 증거

현재 확인된 최신 실행 증거:

| 항목 | 값 |
| --- | --- |
| run id | `run_kafka_replay_20260627141017_dt7ymv` |
| 상태 | `succeeded` |
| topic | `harness-evidence-smoke-231017` |
| 원본 파일 | `sample-65536-bytes.csv` |
| 파티션 수 | 3 |
| 초당 전송 설정 | 1000 |
| 묶음 크기 | 20 |
| 전송 row | 25 |
| 실패 row | 0 |
| 오류 수 | 0 |
| 진행률 | 100 |
| 걸린 시간 | 414ms |

이 증거로 확인되는 것:

- CSV row가 Kafka topic으로 들어갔다.
- 실패 row가 없다.
- 실행 결과가 하네스가 읽을 수 있는 JSON으로 남았다.
- 후속 API가 이 JSON을 읽어 상태를 보여줄 수 있다.

## 실패 정보 저장 위치

실패도 성공과 같은 위치에 저장된다.

```text
data/results/week2/_metadata/kafka_replay/<run_id>.json
data/results/week2/_metadata/kafka_replay/latest.json
```

실패할 때 확인할 필드:

| 필드 | 뜻 |
| --- | --- |
| `status` | 실행 상태. 실패하면 `failed` |
| `health.status` | 화면/API용 상태. 실패하면 `error` |
| `error` | 실제 오류 메시지 |
| `metrics.error_count` | 오류 발생 수 |
| `metrics.failed_rows` | 실패 처리된 row 수 |
| `metrics.skipped_rows` | 건너뛴 row 수 |

주의할 점:

- 현재 M4는 Kafka가 batch를 받기 전에 오류가 나면 실패 batch row를 dead-letter JSONL로 저장한다.
- dead-letter 기본 경로는 `data/results/week2/_metadata/kafka_replay/dead-letter/<run_id>.jsonl`이다.
- 저장되는 값은 `run_id`, `job_id`, `topic`, `key`, `raw_value`, `error`다.

## 백엔드 API

M4 증거는 백엔드에서 아래 API로 확인한다.

| API | 역할 |
| --- | --- |
| `GET /api/week2/kafka-replay/health` | 최신 Kafka 재생 상태 요약 |
| `GET /api/week2/kafka-replay/runs` | 저장된 실행 목록 |
| `GET /api/week2/kafka-replay/runs/{run_id}` | 특정 실행 상세 |

백엔드는 Kafka에 직접 붙어서 메시지를 다시 읽는 게 아니다.
`data/results/week2/_metadata/kafka_replay/`에 남은 JSON 증거를 읽는다.

## 환경변수

M4 재생 콘솔이 읽는 환경변수:

| 환경변수 | 역할 | 기본값 |
| --- | --- | --- |
| `KAFKA_REPLAY_PORT` | 재생 콘솔 API 포트 | `5189` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka 접속 주소 | `localhost:29092` |
| `KAFKA_UI_URL` | Kafka UI 주소 | `http://localhost:8084` |
| `KAFKA_REPLAY_FULL_COUNT_MAX_BYTES` | CSV 전체 row count를 세는 최대 파일 크기 | `67108864` |
| `KAFKA_REPLAY_EVIDENCE_DIR` | 실행 증거 저장 위치 | `data/results/week2/_metadata/kafka_replay` |
| `KAFKA_REPLAY_DEAD_LETTER_DIR` | 실패 row JSONL 저장 위치 | `data/results/week2/_metadata/kafka_replay/dead-letter` |
| `KAFKA_REPLAY_EVIDENCE_RETENTION_DAYS` | evidence JSON과 dead-letter JSONL 자동 삭제 기준 일수 | `7` |

질문 답:

- 저장경로는 `KAFKA_REPLAY_EVIDENCE_DIR`로 바꿀 수 있다.
- 실패 row 저장 경로는 `KAFKA_REPLAY_DEAD_LETTER_DIR`로 바꿀 수 있다.
- Kafka broker 보관 시간은 `docker-compose.yml`의 `KAFKA_LOG_RETENTION_HOURS`로 조정할 수 있다.
- M4 evidence JSON과 dead-letter JSONL 자동 삭제 기준은 `KAFKA_REPLAY_EVIDENCE_RETENTION_DAYS`로 조정한다.
- `KAFKA_REPLAY_EVIDENCE_RETENTION_DAYS=0`이면 자동 삭제를 끈다.

## 검증

검증한 것:

- `contracts/kafka_topic_contract.sample.json` JSON 문법 검사 통과
- `backend/tests/test_week2_kafka_replay_evidence.py` 테스트 3개 통과
- `scripts/validate-harness.sh --strict` 통과

이번 정리 PR에서 한 추가 작업:

- `contracts/kafka_topic_contract.sample.json`에 남아 있던 M4 재생 속도와 원본 파일 TODO를 실제 실행 증거 값으로 확정했다.
- 확정값은 `rate_per_second=1000`, `source_file=demo-output/replay-samples/sample-65536-bytes.csv`다.

## 머지 전 확인할 파일

네가 먼저 볼 파일은 이것이다.

1. `docs/reports/m4-kafka-contract-smoke.md`
2. `contracts/kafka_topic_contract.sample.json`
3. `kafka-replay-console/server.mjs`
4. `backend/app/api/week2_kafka_replay.py`
5. `backend/app/services/week2_kafka_replay_evidence.py`
6. `docs/manual-verification/08-kafka-replay-parquet-demo.md`

## 최종 판단

M4는 Kafka 기반 실시간 이벤트 유입 경로를 보여주는 구현이다.

CSV 파일을 이벤트처럼 Kafka에 넣고, topic/row/처리량/실패 여부를 증거 JSON으로 남기며, 백엔드 API로 그 증거를 확인할 수 있게 했다.

딱 기억해.

M4는 Gold 데이터를 만드는 쪽이 아니라, 원본 이벤트가 Kafka로 들어왔다는 것을 증명하고 후속 처리팀이 이어받을 수 있게 만드는 쪽이다.
