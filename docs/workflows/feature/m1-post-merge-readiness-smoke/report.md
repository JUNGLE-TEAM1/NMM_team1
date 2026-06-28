# M1 post-merge readiness smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-post-merge-readiness-smoke`, `docs/workflows/feature/m1-post-merge-readiness-smoke`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Lite Read -> Escalate Read
- Primary context read: `AGENTS.md`, `docs/08-development-workflow.md`, `docs/10-next-action-menu.md`, latest merged/open PR status, M1/M2/M6 관련 최신 report 일부
- Escalated context read: browser skill, `docs/05`, `docs/06`, `docs/07`의 Product Health representative path/fake success 기준, M1/M2/M6 latest reports
- Context omitted intentionally: 전체 report archive와 미병합 PR #245/#241 구현 상세는 읽지 않음. 이번 Phase는 최신 `origin/main`에 merge된 범위만 검증했다.
- Changed: 최신 main 기준 M1 `/query` smoke를 수행했고, 모바일 overflow 보완으로 `frontend/src/app/styles.css`에서 640px 이하 `.page-header` 좌우 음수 margin을 제거했다. `docs/reports/m1-demo-readiness-panel.md`, `docs/reports/m1-product-health-demo-cta.md`의 stale PR 상태 문구를 merge 완료 상태로 정리했다.
- Verified: `cd frontend && npm run build`, Docker compose backend/frontend smoke, Product Health catalog 404 API smoke, Product Health CTA API smoke, browser desktop CTA/readiness/route trace smoke, mobile viewport smoke, `git diff --check --cached`, `scripts/validate-harness.sh --strict` 통과.
- Remaining: 실제 `dataset_product_health_gold` CatalogMetadata/Gold output 준비 뒤 supported Product Health CTA가 `route=sql`과 DuckDB rows로 성공하는지 후속 Phase에서 확인한다.
- Next context: M3 PR #245 또는 Product Health final Gold/Catalog evidence가 merge되면 M1 readiness ready 전환과 SQL success smoke를 재실행한다.
- Risk: 현재 main/로컬에는 `dataset_product_health_gold` 최종 Catalog/Gold output이 없으므로 ready 표시는 기대하면 안 된다. 현재 정상 상태는 Product Health missing, M2/M3/M5 `not-ready`, M6 `blocked`다.
