# AI query live catalog readiness 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: AI Query 화면 readiness panel이 `/api/catalog/datasets`의 published Gold CatalogDataset을 우선 표시하도록 보정했다.
- Verified: frontend build passed, backend focused tests 5 passed, diff check passed, browser smoke passed 후 smoke data/output cleanup 완료.
- Remaining: live CatalogDataset detail로 이동하는 CTA 보강 가능.
- Next context: publish된 catalog가 있으면 AI Query readiness panel이 `Live catalog readiness`와 catalog id/path/schema/run_id를 보여야 한다.
- Risk: 표시 보정만 수행했고 backend query/planner 동작은 바꾸지 않았다.
