# M1 ETL Catalog CTA polish 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-etl-catalog-cta-polish`, `docs/workflows/feature/m1-etl-catalog-cta-polish`
- Date: 2026-06-29
- Changed: `/etl`의 `Catalog detail` CTA가 `WEEK2_DEFAULT_DATASET_ID` 기반 live detail URL(`/catalog/dataset_reviews_gold`)로 직접 이동하도록 수정했다. `navigate()`가 `/catalog/<dataset>` 입력을 display URL로 보존하게 보강했다.
- Verified: `cd frontend && npm run build`, Docker compose rebuilt frontend smoke, in-app browser `/etl -> local_runner 실행 -> Catalog detail` click smoke 통과. 최종 URL `/catalog/dataset_reviews_gold`, title `Amazon Reviews Gold`, `dataset_reviews_gold`/`CatalogMetadata` 표시, console error 0.
- Remaining: Product Health 최종 `dataset_product_health_gold` SQL success smoke는 upstream Gold/Catalog evidence 준비 뒤 별도 Phase에서 진행한다. PR 생성 후 remote CI 확인이 남았다.
- Next context: `m1-final-browser-smoke`에서 남긴 `/etl` CTA placeholder follow-up을 소비했다. #257 issue는 시작 직후 `CLOSED/Done` drift가 있어 reopen했다.
- Risk: backend/API/schema/data 변경 없음. UI route helper 변경은 `/catalog/<dataset>` path 보존으로 제한된다.

## Verification Commands / 검증 명령

```bash
cd frontend && npm run build
DOCKER_BUILDKIT=0 BACKEND_PORT=18009 FRONTEND_PORT=13009 docker compose -p asklake_m1_etl_catalog_cta build frontend
BACKEND_PORT=18009 FRONTEND_PORT=13009 docker compose -p asklake_m1_etl_catalog_cta up -d backend frontend
# Browser smoke:
# http://127.0.0.1:13009/etl?cachebust=m1-cta-2
# click `local_runner 실행` -> click `Catalog detail`
# expect URL `/catalog/dataset_reviews_gold`, title `Amazon Reviews Gold`, `dataset_reviews_gold`/`CatalogMetadata`, console errors 0
```

## Acceptance / Regression / Manual Verification

- Acceptance: `docs/05`의 Catalog detail 확인 경로와 M1 demo click flow를 보강했다. Week2 Product Health 최종 5GB/Gold 수용 기준은 이번 범위가 아니다.
- Regression: `/catalog/<dataset>` browser URL이 `/dataset` placeholder로 떨어지지 않도록 route display URL을 보존한다.
- Manual verification: in-app browser fresh bundle smoke로 `/etl -> Catalog detail` 클릭 흐름을 검증했다.
