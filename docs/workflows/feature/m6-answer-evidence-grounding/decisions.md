# M6 answer evidence grounding 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- n/a

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| AIQueryResult evidence grounding 방식 | 기존 evidence 필드를 유지하고 optional `table_name`, `schema_fields`, `metrics`, `lineage`, `retrieval_terms`를 추가 | M1 호환성을 깨지 않으면서 Week2 Ask/Evidence 기준의 schema/metric/lineage/retrieval 근거를 표시할 수 있다. | user directive / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| real LLM/vector DB/full RAG | Week2 기본 범위 밖이므로 보류 | 발표 후 full RAG 또는 provider 연결을 별도 Phase로 승인할 때 | 후속 M6 확장 |
| real SQL engine | 이번 Phase는 fake SQL guardrail/smoke 유지 | M2 runtime SQL profile 또는 DuckDB adapter Phase가 열릴 때 | 후속 runtime adapter |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| evidence grounding shape | M1 UI가 optional field를 처리하지 못하거나 contract가 과하다고 판단되면 | 기존 4개 evidence 필드만 필수로 유지하고 richer fields는 M1 표시 범위에 맞춰 축소한다. |
