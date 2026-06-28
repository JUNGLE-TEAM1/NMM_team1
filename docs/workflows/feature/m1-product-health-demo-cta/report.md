# M1 product health demo CTA 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-product-health-demo-cta`, `docs/workflows/feature/m1-product-health-demo-cta`
- Date: 2026-06-29
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md` Phase queue, workspace `plan.md`, `quality.md`, `sync.md`, `next-actions.md`, `docs/reports/m6-sql-planner-intents.md`, `docs/reports/m6-response-contract-trace.md`, `docs/reports/week2-product-risk-source-of-truth-propagation.md`, `docs/05`, `docs/06`, `docs/07` 관련 M6 route/Product Health 항목
- Escalated context read: browser skill `control-in-app-browser` for local web smoke
- Context omitted intentionally: 전체 SoT audit는 하지 않음. 이번 Phase는 UI CTA 표시 보강이며 Source of Truth 변경 없음.
- Changed: `frontend/src/app/App.jsx`의 demo question 후보를 Product Health SQL intents/Unsupported guardrail/Legacy reviews path 그룹으로 바꾸고, `frontend/src/app/styles.css`에 CTA grouping 스타일을 추가했다.
- Verified: CTA intent classification, `cd frontend && npm run build`, CTA keyword scan, `git diff --check`, docker browser smoke(`/query?smoke=product-health-cta-remediation`), `scripts/validate-harness.sh --strict` 통과.
- Remaining: GitHub PR 생성 후 remote checks 확인. 실제 supported CTA의 `route=sql` 성공 smoke는 `dataset_product_health_gold` CatalogMetadata/Gold output이 준비된 뒤 재검증 필요.
- Next context: Product Health integration evidence가 닫히면 `top_risk` CTA가 `dataset_product_health_gold` evidence와 DuckDB rows로 이어지는지 확인한다.
- Risk: 현재 환경에서는 Product Health Gold가 아직 없으므로 supported CTA 성공 대신 unsupported guardrail과 CTA 표시만 검증했다.
