# M6 SQL planner intent rules 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 option brief는 작성하지 않았다. Week2 ver2 문서에서 다음 빌드업 순서는 이미 `SQL Planner 강화`로 정해져 있고, 이번 Phase는 범용 NL2SQL이 아닌 deterministic planner extraction이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| SQL planner scope | deterministic `top_count`, `top_rating`, `top_risk`, `top_negative_review`, `low_conversion`, `top_late_delivery`, `unsupported` intent rules | 최신 Week2 대표 path가 `gold_product_health`로 바뀌었으므로 Step 4 planner가 reviews-only가 되면 바로 다음 단계와 어긋난다. | user "4단계 계획대로 수정해줘" / 2026-06-28 |
| reviews regression | keep `top_count` and `top_rating` | 기존 reviews demo/API tests가 아직 main의 executable fixture로 남아 있어 regression guard로 유지한다. | AI implementation / 2026-06-28 |
| product health catalog selection | add CatalogRetriever aliases for `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate` | planner가 product health SQL을 만들 수 있어도 retriever가 catalog를 잘못 고르면 대표 path가 깨진다. | AI implementation / 2026-06-28 |
| unsupported handling | `blocked/unsupported_question` without SQL engine call | fake/default SQL 성공처럼 보이는 confident answer를 막기 위해서다. | AI implementation / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 범용 NL2SQL | 2주차 SQL MVP 범위를 넘고 LLM/RAG 설계가 필요하다. | SQL planner deterministic rules가 안정된 뒤 | M6 후속 Step |
| public route/retrieval_trace | 이번 Phase는 public response shape를 키우지 않는다. | 응답 계약 보강 단계 시작 | M6 후속 Step |
| `dataset_product_health_gold` sample contract | 현재 `contracts/catalog_metadata.sample.json`는 reviews fixture를 유지한다. | M3/M5 product health fixture와 함께 추가 | M6/M3/M5 contract/data slice |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `unsupported_question` guardrail | M1 UI가 새 failure code를 표시하지 못한다. | M1 표시 연동 또는 error copy fallback을 추가한다. |
