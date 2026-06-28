# M1 post-merge readiness smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: 최신 `main` 기준 M1 `/query` Product Health readiness/CTA/route trace를 재검증했다. 모바일 smoke에서 발견한 `.page-stack` overflow를 막기 위해 640px 이하 `.page-header` 좌우 음수 margin을 제거했다. `m1-demo-readiness-panel`, `m1-product-health-demo-cta` report의 stale PR 상태 문구를 merge 완료 상태로 정리했다.
- Verified: `cd frontend && npm run build`, Docker compose backend/frontend smoke, Product Health catalog 404 API smoke, Product Health CTA API smoke, browser desktop CTA/readiness/route trace smoke, mobile viewport smoke 통과. Desktop smoke에서 M2/M3/M5 `not-ready`, M6 `blocked`, M1 `ready`, CTA 클릭 후 `route=unsupported`, rows 0, fake risk row 없음, console error 없음 확인. Mobile smoke에서 readiness 1열, document scroll width 375, overflow 없음 확인.
- Remaining: `dataset_product_health_gold` 최종 CatalogMetadata/Gold output 준비 뒤 supported Product Health CTA가 `route=sql`과 DuckDB rows로 성공하는 smoke는 후속 Phase에서 확인한다.
- Next context: M3 PR #245 또는 Product Health final evidence가 merge되면 M1 readiness ready 전환과 SQL success smoke를 재실행한다.
- Risk: 현재 main/로컬에는 Product Health 최종 Catalog/Gold output이 없으므로 M1은 ready를 표시하지 않는 것이 정상이다. 이번 Phase는 fake success 방지와 화면 회귀 검증이다.
