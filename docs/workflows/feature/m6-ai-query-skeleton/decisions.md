# M6 AI Query 스켈레톤 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed: 2주차 Source of Truth와 contract fixture가 이미 M6 skeleton의 adapter/template 방향을 정하고 있다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M6 초기 SQL 생성 방식 | Metadata Retrieval + template SQL | 2주차는 자유형 LLM RAG보다 검증 질문 3개와 실제 SQL 수치 일치가 우선이다. | 사용자 학습/확인 대화, 2026-06-25 |
| SQL 실행 구현 | fake `SqlEngineAdapter` 우선 | DuckDB 직접 import 금지와 route/contract skeleton 검증을 먼저 만족한다. 실제 DuckDB는 후속 구현체로 추가한다. | `docs/03-interface-reference.md`, 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 DuckDB 연결 | 현재 Phase는 adapter boundary와 response contract skeleton이 목표다. | M3/M5가 실제 Parquet/local fallback path를 확정하고 SQL 검산을 시작할 때 | M6 SQL engine implementation |
| 외부 LLM SQL 생성 | API key와 prompt/guardrail 안정화가 필요하며 2주차 초반 skeleton 범위를 키운다. | template SQL이 검증 질문 3개를 통과한 뒤 | M6 LLM RAG extension |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
|  |  |  |
