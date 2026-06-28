# M6 Catalog RAG Index 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교가 필요한 고영향 구조 변경은 아니다. 기존 SQL-first M6 위에 local deterministic Catalog RAG-lite index를 얹고, 외부 vector DB/LLM은 후속으로 유지한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Index 범위 | CatalogMetadata 안전 metadata chunk만 사용 | M6가 M5 Catalog source of truth를 읽기 전용으로 소비하고, 원본 파일/secret/local path가 retrieval에 섞이는 것을 막기 위해 | user Step 6 request / 2026-06-28 |
| Embedding 구현 | `LocalTokenEmbeddingAdapter` deterministic local embedding | 외부 provider/API key 없이 TDD와 local smoke에서 안정적으로 검증하기 위해 | AI implementation / 2026-06-28 |
| Cache 전략 | optional local persisted index + `dataset_id + run_id + updated_at` signature | index는 source of truth가 아니라 derived cache이며, M5 catalog 변경 시 stale rebuild가 필요하기 때문 | AI implementation / 2026-06-28 |
| Route 동작 | 현재는 SQL-first 유지, `route=rag`로 바꾸지 않음 | 이번 Phase는 검색 index 기반을 만드는 단계이고 Hybrid/LLM은 후속 단계이기 때문 | AI implementation / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| external vector DB | Week2 local MVP 범위를 넘고 infra/secret/ops 결정이 필요함 | local index가 성능/규모 한계에 도달할 때 | post-M6 RAG infra Phase |
| real embedding provider | API key, 비용, prompt/data policy 결정이 필요함 | 외부 LLM/embedding provider를 붙일 때 | M6 external LLM/embedding Phase |
| `route=rag` 실제 응답 | 현재 SQL 결과 없는 RAG-only 답변 생성기가 없다. | Catalog-only 질문을 SQL 없이 답해야 할 때 | M6 Hybrid/RAG route Phase |
| M1 trace UI 표시 | M1 소유 화면 변경이다. | M1이 richer evidence 표시 Phase를 열 때 | M1 evidence display follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Local deterministic embedding | 검색 품질이 대표 질문에서 부족하거나 false positive가 많을 때 | embedding adapter를 교체하되 `EmbeddingAdapter` port 뒤에서 변경한다. |
| Persisted cache | cache 파일이 demo 환경에서 stale/permission 문제를 만들 때 | in-memory mode로 fallback하거나 cache path 설정을 분리한다. |
