# M6 SQL-first 2주차 빌드업 계획 보강 notes

## 작업 메모

- 사용자는 M6가 현재 SQL도 충분하지 않은 상태라고 지적했고, 2주차 계획에 이를 먼저 반영하길 요청했다.
- 현재 M6는 `Week2AIQueryService`, `SqlEngineAdapter`, `FakeSqlEngine`, CatalogMetadata evidence grounding 기반 skeleton이다.
- 이번 문서 변경은 RAG/LLM을 2주차 구현 범위로 올리는 것이 아니라, SQL MVP를 먼저 닫는 실행 순서를 명시한다.

## 결정된 표현

- M6 최종 방향: RAG/LLM 포함 완성형.
- 2주차 후속 실행 우선순위: SQL MVP 완성.
- SQL MVP 의미: Amazon Reviews 대표 CatalogMetadata의 output file을 `storage.local_fallback_path`, `query.table_name`, `query.allowed_columns`, `query.default_limit` 기준으로 안전하게 조회한다.
- 후속 순서: SQL MVP -> SQL Planner 강화 -> 응답 계약 보강 -> CatalogMetadata 기반 RAG -> Hybrid query -> 외부 LLM 답변 생성 -> M1 evidence 표시 연동.

## 범위 경계

- M6는 M5 CatalogMetadata를 읽기만 한다.
- M5는 Catalog 저장/API/lineage를 계속 소유한다.
- M2는 SQL engine runtime boundary를 소유한다.
- M3는 schema/profile/TransformSpec를 소유한다.
- M4는 Kafka ingestion/evidence를 소유한다.
- M1은 결과 표시를 소유한다.
