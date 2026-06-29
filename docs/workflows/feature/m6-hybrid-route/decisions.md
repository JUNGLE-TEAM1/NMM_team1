# M6 Hybrid Route 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교가 필요한 고영향 구조 변경은 아니다. 기존 M6 SQL planner와 Catalog RAG-lite index 위에 deterministic route decision layer를 추가하고, external LLM/vector DB는 후속으로 유지한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Hybrid route 방식 | deterministic `QueryRouter` | 2주차 local MVP에서 external LLM 없이 `sql`/`rag`/`hybrid`/`unsupported`를 안정적으로 검증하기 위해 | user Step 7 request / 2026-06-29 |
| RAG-only 실행 | SQL validate/execute를 호출하지 않고 CatalogMetadata evidence summary 반환 | schema/lineage 설명 질문은 SQL이 필요 없고 SQL local path 실패와 섞이면 안 되기 때문 | AI implementation / 2026-06-29 |
| Hybrid summary | SQL 결과 summary 뒤에 CatalogMetadata 근거 사용 문장을 추가 | 외부 LLM 없이도 Hybrid가 SQL rows와 RAG-lite evidence를 함께 썼음을 M1이 볼 수 있게 하기 위해 | AI implementation / 2026-06-29 |
| Branch base | Step 6 PR #241 위 stacked branch | Step 7은 Step 6 Catalog RAG-lite index에 의존하고, PR #241은 아직 merge 전이기 때문 | AI implementation / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| external LLM answer generation | 다음 빌드업 단계이며 provider/API key/prompt policy 결정이 필요함 | LLMAdapter Phase 시작 시 | M6 external LLM Phase |
| real semantic route classifier | 현재는 deterministic keyword route로 충분한 local MVP 검증 단계 | 대표 질문에서 route 오분류가 누적될 때 | M6 route quality follow-up |
| M1 richer route display | M1 소유 UI 변경이다. | M1 evidence display 연동 Phase 시작 시 | M1 evidence display follow-up |
| PR #241 merge 후 rebase/retarget | pull/rebase/merge는 사람 확인이 필요함 | PR #241 merge 후 Step 7 PR을 main으로 정리할 때 | Pre-PR/merge checkpoint |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Deterministic route keyword set | 대표 질문에서 `rag`/`hybrid`가 과하게 잡히거나 놓칠 때 | `QueryRouter` term set과 tests를 함께 조정한다. |
| RAG-only success status | 근거가 부족한 Catalog 설명이 성공처럼 보이는 경우 | retrieval hit/evidence sufficiency guard를 추가한다. |
