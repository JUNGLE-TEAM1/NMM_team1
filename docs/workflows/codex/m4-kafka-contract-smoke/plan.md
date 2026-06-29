# M4 Kafka replay 설정 보강 계획

## 브랜치

- Branch: `codex/m4-kafka-contract-smoke`
- Workspace: `docs/workflows/codex/m4-kafka-contract-smoke`
- GitHub issue: `#274`
- Created: 2026-06-28

## 목표

- M4 Kafka replay 실행 환경변수 예시를 `.env.example`에 추가한다.
- 실패 producer batch row를 dead-letter JSONL로 저장한다.
- local evidence JSON과 dead-letter JSONL 자동 삭제 기준을 환경변수로 조정할 수 있게 한다.
- M4 Kafka 계약과 검증 문서를 현재 설정 기준으로 맞춘다.

## 범위

- `.env.example`에 `KAFKA_REPLAY_*`, `KAFKA_LOG_RETENTION_HOURS` 예시 추가.
- `kafka-replay-console/server.mjs`에 `KAFKA_REPLAY_DEAD_LETTER_DIR`, `KAFKA_REPLAY_EVIDENCE_RETENTION_DAYS` 처리 추가.
- `contracts/kafka_topic_contract.sample.json`에 `failed_rows`, `skipped_rows`, `dead_letter_path`, retention env 정보 추가.
- `docs/03`, `docs/05`, `docs/06`, M4 manual verification, report 정렬.
- Node 문법 검사, contract JSON 검사, M4 evidence backend test 검증.

## 범위 제외

- Kafka를 `gold_product_health` 생성 필수 입력으로 연결하지 않는다.
- Docker Kafka를 새로 띄워 실제 broker failure smoke를 재실행하지 않는다.
- 로컬 untracked 산출물은 포함하지 않는다.

## 완료 기준

- [x] `.env.example`에 M4 Kafka replay 설정 예시가 있다.
- [x] 실패 batch row가 `KAFKA_REPLAY_DEAD_LETTER_DIR/<run_id>.jsonl`로 저장되도록 구현되어 있다.
- [x] `KAFKA_REPLAY_EVIDENCE_RETENTION_DAYS`로 오래된 evidence와 dead-letter를 정리할 수 있다.
- [x] JSON syntax check가 통과한다.
- [x] `node --check kafka-replay-console/server.mjs`가 통과한다.
- [x] M4 Kafka replay evidence backend test가 통과한다.
- [x] GitHub issue `#274`가 생성된다.
- [ ] PR 추적이 연결된다.
