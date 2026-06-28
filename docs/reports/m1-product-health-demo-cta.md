# M1 product health demo CTA 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: `/query` demo question 후보를 Product Health SQL intents, Unsupported guardrail, Legacy reviews path 3그룹으로 정리했다. `top_risk`, `top_negative_review`, `low_conversion`, `top_late_delivery`, `top_rating` CTA와 unsupported 예시를 추가하고 기존 `submitQuery(question)` 흐름을 재사용했다.
- Verified: `cd frontend && npm run build`, CTA keyword scan, `git diff --check`, docker browser smoke(`/query?smoke=product-health-cta`), `scripts/validate-harness.sh --strict` 통과. Browser smoke에서 Product Health CTA 5개, unsupported CTA 1개, legacy CTA 3개 표시와 unsupported 클릭 후 `route=unsupported`/blocked 표시 및 console error 없음 확인.
- Remaining: GitHub PR 생성 후 remote checks 확인. 실제 supported Product Health CTA가 `route=sql`과 DuckDB rows로 성공하는 smoke는 `dataset_product_health_gold` CatalogMetadata/Gold output 준비 뒤 별도 확인 필요.
- Next context: Product Health integration evidence가 닫히면 M1 CTA -> M6 SQL planner -> DuckDB result -> evidence/retrieval_trace 표시까지 재검증한다.
- Risk: UI-only 변경이며 backend/API/schema/data 변경 없음. Product Health Gold 미준비 상태에서는 supported CTA가 blocked/local path missing이 될 수 있으므로 readiness panel과 함께 해석해야 한다.
