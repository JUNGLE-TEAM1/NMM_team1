# Kafka replay evidence UI 계획

## 목표

`contracts/kafka_topic_contract.sample.json`과 `/api/week2/kafka-replay/*` 조회 API를 기준으로 Kafka replay evidence를 UI에서 확인한다.

## 진행 상태

- Status: completed
- Date: 2026-06-30
- `/runs`에 Kafka Replay Evidence read-only panel을 추가했다.

## 범위

- Kafka replay health 조회.
- replay run list/latest evidence 표시.
- message count, throughput, lag, error count 등 표시 가능한 field 정리.
- evidence missing 상태 표시.

## 제외 범위

- 실제 Kafka topic consume/produce trigger.
- Kafka broker 실행.
- replay source file 생성.
- Source/Silver/Gold ETL 실행.

## 선행 조건

- `backend/app/api/week2_kafka_replay.py` 라우트 유지.
- `contracts/kafka_topic_contract.sample.json` 존재.

## 구현 대상 파일 예상

- `frontend/src/api/week2KafkaReplayApi.js`
- `frontend/src/app/App.jsx`
- 필요 시 `backend/app/services/week2_kafka_replay_evidence.py`
- focused frontend build/browser smoke

## API/contract 영향

- 기존 GET API를 우선 사용한다.
- 실행 trigger endpoint는 만들지 않는다.
- 계약에 TODO로 남은 replay source/rate는 blocked로 표시한다.

## UI 영향

- 실행 기록 또는 Jobs 근처에 Kafka replay evidence panel을 추가할 수 있다.
- 데이터셋 생성 흐름에는 직접 실행 버튼을 넣지 않는다.

## Acceptance Criteria

- Kafka replay health가 보인다.
- replay run이 있으면 list/detail이 보인다.
- evidence가 없으면 broker 실패처럼 보이지 않고 `evidence 없음`으로 표시된다.

## Regression / Failure Scenario

- API 404/empty list가 전체 화면을 깨지 않는다.
- replay evidence를 실제 Kafka consume 성공으로 오해시키지 않는다.

## Manual Verification

1. Kafka replay evidence panel 진입.
2. health 조회.
3. runs empty 또는 latest evidence 표시 확인.

## Data / Evidence 확인 항목

- `data/results/week2/_metadata/kafka_replay/latest.json`
- `contracts/kafka_topic_contract.sample.json`

## Blocked Condition

- 실제 Kafka replay 실행을 요구받았지만 broker/topic/source file 정보가 없다.
- M4 replay evidence 파일 위치가 확정되지 않았다.

## Report 기준

- `docs/reports/kafka-replay-evidence-ui.md`에 evidence 조회 상태와 실제 consume 제외 범위를 기록한다.
