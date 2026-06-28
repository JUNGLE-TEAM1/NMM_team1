# M1 demo readiness panel 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-29
- Changed: `/query` 화면에 M2/M3/M5/M6/M1 모듈별 demo readiness panel을 추가했다. Product Health Gold/Catalog 준비 상태를 기준으로 M2 runtime evidence, M3 Gold semantics, M5 Catalog lineage, M6 SQL evidence, M1 browser smoke 상태를 `ready`, `blocked`, `not-ready`, `unknown`으로 표시한다.
- Verified: `cd frontend && npm run build`, readiness keyword scan, `git diff --check`, docker browser smoke(`/query?smoke=demo-readiness-panel`), mobile viewport smoke, `scripts/validate-harness.sh --strict` 통과. Browser smoke에서 M2/M3/M5/M6/M1 5개 항목 표시, Product Health Gold 미준비 상태가 fake success로 보이지 않음, console error 없음 확인.
- Remaining: GitHub PR 생성 후 remote checks 확인. 실제 `dataset_product_health_gold` CatalogMetadata/Gold output이 준비된 뒤 ready 전환과 Product Health SQL success smoke는 후속 Phase에서 확인한다.
- Next context: M2/M3/M5/M6 integration evidence가 닫히면 M5 Catalog lineage와 M6 SQL evidence가 `ready`로 바뀌는지 `/query`에서 재검증한다.
- Risk: UI-only 변경이며 backend/API/schema/data 변경 없음. M2/M3/M5/M6 상태 계산 API가 없으므로 panel은 현재 M1이 조회 가능한 Product Health Catalog readiness에서 보수적으로 파생한다.
