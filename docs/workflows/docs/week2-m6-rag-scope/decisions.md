# Week2 M6 RAG scope 보강 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 큰 후보 비교가 필요한 구조 변경은 아니다. 기존 Week2 결정의 `M6 RAG·AI Query` 책임을 ver2 문서에 더 명확히 반영하는 범위다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M6 RAG 범위 | CatalogMetadata 기반 Semantic/RAG-lite/AI Query | RAG 책임을 유지하되 외부 vector DB/full document RAG로 범위가 커지지 않게 하기 위해 | user request / 2026-06-26 |
| Full RAG 범위 | 외부 vector DB, full document RAG, 대규모 indexing, real LLM provider 연결은 후속 확장 | Week2 기본 분석 대표 path를 흔들지 않기 위해 | user request / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `contracts/*.sample.json`에 RAG/retrieval 필드 추가 | 이번 변경은 project-context 문구 보강이며 실제 contract 변경이 아님 | M6 구현에서 `AIQueryResult.evidence` shape 변경이 필요할 때 | M6 implementation or interface/contracts Phase |
| 외부 vector DB/full document RAG | Week2 기본 범위가 커짐 | CatalogMetadata 기반 query가 안정화되고 문서/비정형 검색이 필요할 때 | post-Week2 research/design |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| RAG-lite wording | 팀이 RAG를 실제 vector DB/document retrieval로 즉시 구현하기로 결정할 때 | 별도 Decision Option Brief와 interface/contracts 변경 Phase를 연다. |
