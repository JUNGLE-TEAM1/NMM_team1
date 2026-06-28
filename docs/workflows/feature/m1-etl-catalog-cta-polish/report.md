# M1 ETL Catalog CTA polish 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-etl-catalog-cta-polish`, `docs/workflows/feature/m1-etl-catalog-cta-polish`
- Date: 2026-06-29
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/reports/m1-final-browser-smoke.md`
- Escalated context read: browser plugin instruction for local browser verification
- Context omitted intentionally: Product Health M2/M3/M5/M6 implementation internals; 이번 Phase는 M1 UI navigation polish만 다룸
- Changed: `/etl`의 `Catalog detail` CTA가 `WEEK2_DEFAULT_DATASET_ID` 기반 live detail URL(`/catalog/dataset_reviews_gold`)로 직접 이동하도록 수정했다. `navigate()`가 `/catalog/<dataset>` 입력을 display URL로 보존하게 보강했다.
- Verified: `cd frontend && npm run build`, Docker compose backend/frontend smoke with rebuilt frontend, in-app browser `/etl -> local_runner 실행 -> Catalog detail` click smoke 통과. 최종 URL `/catalog/dataset_reviews_gold`, title `Amazon Reviews Gold`, `dataset_reviews_gold`/`CatalogMetadata` 표시, console error 0.
- Remaining: Product Health 최종 `dataset_product_health_gold` SQL success smoke는 upstream Gold/Catalog evidence 준비 뒤 별도 Phase에서 진행한다. PR 생성 후 remote CI 확인이 남았다.
- Next context: 이 PR은 #257을 닫아야 한다. #257 issue는 시작 직후 `CLOSED/Done` drift가 있어 reopen했고, Project status는 GitHub 응답상 아직 `Done`으로 남아 있다.
- Risk: UI route helper 변경은 `/catalog/<dataset>` 경로 보존으로 제한된다. backend/API/schema/data 변경 없음.
