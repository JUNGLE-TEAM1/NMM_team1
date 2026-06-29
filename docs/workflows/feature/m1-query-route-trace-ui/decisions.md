# M1 query route trace UI 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

-

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Phase 7 구현 범위 | 기존 M6 response contract 소비 UI | `AIQueryResult.route`와 `retrieval_trace[]`는 이미 backend contract에 있으므로 M1은 표시/guard만 추가하고 backend/schema 변경을 하지 않는다. | 사용자 지시 / 2026-06-28 |
| TDD 적용 여부 | TDD 생략, build/API/browser smoke로 검증 | backend/core logic 변경이 없고 frontend 테스트 러너가 없으므로 UI smoke와 production build로 완료 기준을 검증한다. | 사용자 지시 / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Product Health 대표 경로 route/trace 표시 | 이번 Phase는 `dataset_reviews_gold` supporting path로 route/trace UI만 검증한다. | `dataset_product_health_gold` 최종 통합 route가 준비될 때 | M1 product health readiness/demo CTA 후속 Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 기존 M6 response contract 소비 | M6 `route` 또는 `retrieval_trace` field shape가 변경된다. | `frontend/src/app/App.jsx`의 route/trace 렌더링과 `docs/03-interface-reference.md` 영향 검토 |
