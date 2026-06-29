# M1 product health readiness UI 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: `/catalog`와 `/query`에 `dataset_product_health_gold` readiness panel을 추가했다. Product Health Gold가 없으면 missing badge와 M2/M3/M5 후속 책임을 표시하고, 실제 증거 없이 ready 성공으로 보이지 않게 했다.
- Verified: `cd frontend && npm run build`, `git diff --check`, `GET /api/week2/catalog/dataset_product_health_gold` 404 smoke, docker browser smoke(`/catalog?smoke=product-health-ready-2`, `/query?smoke=product-health-ready-2`), `scripts/validate-harness.sh --strict` 통과.
- Remaining: GitHub PR 생성 후 remote checks 확인. 실제 ready 상태 smoke는 `gold_product_health` 산출물과 Catalog lineage가 준비된 뒤 별도 확인 필요.
- Next context: M2/M3/M5/M6 흐름이 `dataset_product_health_gold` CatalogMetadata, `storage.local_fallback_path`, query allowlist, lineage를 제공하면 M1 panel이 ready로 바뀌는지 검증한다.
- Risk: UI-only 변경이며 backend/data/contract 변경 없음. 기존 캐시가 이전 번들을 보여줄 수 있어 smoke는 cache-busting query로 수행했다.
