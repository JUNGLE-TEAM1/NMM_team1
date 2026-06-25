# Big dataset manipulation context alignment 노트

## 진행 메모

- Source of Truth에는 pipeline, Parquet, row count, bytes, duration, `QueryResult`가 이미 있었지만 제품 서사에서는 대용량/복합 데이터셋 조작 목표가 약하게 드러났다.
- 이번 변경은 제품 서사와 검증 기준을 보강하고, 기존 계약 필드 의미를 처리 증거로 연결한다.

## 결정

- 새 API/schema 필드는 추가하지 않는다.
- production-grade distributed processing은 후속 범위로 둔다.

## 열린 질문

- Spark/Flink/Trino/Athena 중 무엇을 언제 실제 구현 경로로 올릴지는 별도 Decision 대상이다.

## 링크 / 증거

- `docs/project-context/asklake-week2-module-plan/plan.md`의 Amazon Reviews JSON, PostgreSQL Batch, Kafka Streaming 계획
- `docs/03-interface-reference.md`의 Week 2 `ExecutionResult`, `CatalogMetadata`, `QueryResult`
