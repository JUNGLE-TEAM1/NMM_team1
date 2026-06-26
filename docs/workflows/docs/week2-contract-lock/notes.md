# Week2 contract lock 노트

## 진행 메모

- `docs/03`의 Week 2 Contract Package를 기준으로 추천 잠금안을 적용했다.
- 새 fixture는 `contracts/runtime_config.sample.json`, `contracts/transform_spec.sample.json`, `contracts/kafka_topic_contract.sample.json`이다.
- 기존 `contracts/execution_result.sample.json`에는 `duration_ms`와 metric semantics를 추가했다.
- `docs/05`, `docs/06`, `docs/07`은 새 fixture 세트를 확인하도록 최소 갱신했다.

## 결정

- M2/M3/M4 추가 계약은 final storage schema가 아니라 fixture-first consumer/producer 계약으로 잠근다.
- Source/schema preview backend route는 이번 작업에서 구현하지 않고 fixture-first로 둔다.
- 현재 executable Week 2 route는 workflow run/status/catalog와 AI query로 명시한다.

## 열린 질문

- 실제 MinIO endpoint, fixed/extended sample row count, M4 replay rate는 담당 모듈이 검증 후 fixture TODO를 교체한다.
- `RuntimeConfig.runner = "spark"` 적용은 M2 Spark smoke와 M5 runner selection 구현 뒤에만 가능하다.

## 링크 / 증거

- `contracts/*.sample.json` JSON 유효성 확인 완료
- `PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_week2_workflow_catalog.py backend/tests/test_week2_local_runner.py backend/tests/test_week2_ai_query.py` 통과
