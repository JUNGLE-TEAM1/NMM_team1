# M1 final browser smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/m1-final-browser-smoke`, `docs/workflows/feature/m1-final-browser-smoke`
- Date: 2026-06-28
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`, this workspace `plan.md`
- Escalated context read: browser skill, `frontend/package.json`, `docker-compose.yml`, `infra/docker/frontend.nginx.conf`, `docs/07-manual-verification-playbook.md`
- Context omitted intentionally: M2/M3/M5/M6 backend implementation internals beyond API/runtime smoke
- Changed: 제품 코드는 변경하지 않고 M1 final browser smoke evidence를 기록했다.
- Verified: 최신 코드 compose build/run, backend health, frontend `/etl`/`/catalog`/`/query` routes, Week2 run/catalog/query API, browser `/etl -> /catalog -> /query` smoke, frontend build.
- Remaining: `/etl`의 `Catalog detail` CTA가 `/dataset` placeholder로 이동하는 follow-up이 있다. `gold_product_health` final Gold/5GB evidence는 여전히 M2/M3/M5 통합 책임이다.
- Next context: 다음 M1 Phase는 route/trace UI 보강 또는 `/etl` CTA를 live `/catalog`로 연결하는 작은 UI fix를 선택한다.
- Risk: 이번 smoke는 `dataset_reviews_gold` legacy/supporting path 기준이다. Product Health 대표 경로 완료 증거로 오해하면 안 된다.

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m1-final-browser-smoke`, `docs/workflows/feature/m1-final-browser-smoke`
- Date: 2026-06-28
- Workspace state: complete

## Goal / 목표

- 최신 main 기준 M1 발표 흐름 `/etl -> /catalog -> /query`가 화면에서 끊기지 않는지 확인한다.

## Changed Files / 변경 파일

- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- `docs/workflows/feature/m1-final-browser-smoke/*`
- `docs/workflows/feature/m1-query-route-trace-ui/*`
- `docs/workflows/feature/m1-product-health-readiness-ui/*`
- `docs/workflows/feature/m1-product-health-demo-cta/*`
- `docs/workflows/feature/m1-demo-readiness-panel/*`
- `docs/reports/m1-final-browser-smoke.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- M1 후속 Phase 6~10 workspace를 생성하고 M1 phase plan에 연결했다.
- Phase 6에서는 제품 코드 변경 없이 최신 compose build/run과 browser smoke를 수행했다.
- `/etl`에서 `local_runner 실행`으로 `run_reviews_demo_002`를 만들고 output/Catalog lineage 연결을 확인했다.
- `/catalog`에서 `dataset_reviews_gold`, `run_reviews_demo_002`, local fallback path, DuckDB query readiness를 확인했다.
- `/query`에서 sample question이 `route=sql`, `engine=duckdb`, rows/evidence/trace를 표시하는지 확인했다.

## Verification Commands / 검증 명령

```bash
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 COMPOSE_PROJECT_NAME=asklake_m1_final_smoke BACKEND_PORT=18002 FRONTEND_PORT=13002 docker compose -p asklake_m1_final_smoke build backend frontend
COMPOSE_PROJECT_NAME=asklake_m1_final_smoke BACKEND_PORT=18002 FRONTEND_PORT=13002 docker compose -p asklake_m1_final_smoke up -d backend frontend
curl -fsS http://127.0.0.1:18002/health
curl -fsSI http://127.0.0.1:13002/etl
curl -fsSI http://127.0.0.1:13002/catalog
curl -fsSI http://127.0.0.1:13002/query
curl -fsS -X POST http://127.0.0.1:18002/api/week2/workflows/pipeline_reviews_json_e2e/runs -H 'content-type: application/json' -d '{"executor":"local_runner","triggered_by":"m1_final_browser_smoke"}'
curl -fsS http://127.0.0.1:18002/api/week2/catalog/dataset_reviews_gold
curl -fsS -X POST http://127.0.0.1:18002/api/week2/ai/query -H 'content-type: application/json' -d '{"question":"Amazon reviews에서 평점 높은 상품 알려줘"}'
cd frontend && npm run build
git diff --check
scripts/validate-harness.sh --strict
```

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`의 local/container smoke 기준과 M1 final browser smoke workspace plan.
- Environment: Docker Compose project `asklake_m1_final_smoke`, backend `http://127.0.0.1:18002`, frontend `http://127.0.0.1:13002`, in-app browser.
- Result: `/etl`에서 `run_reviews_demo_002` 생성, `/catalog`에서 같은 run lineage와 local fallback path 확인, `/query`에서 DuckDB SQL rows와 evidence 확인.
- Evidence: browser console error logs `[]`; query 화면에 `succeeded`, `passed`, `duckdb`, `B003/B001/B002`, `dataset_reviews_gold`, `run: run_reviews_demo_002` 표시.
- Limitation: `/etl`의 `Catalog detail` CTA는 `/dataset` placeholder로 이동했다. 직접 `/catalog` route는 정상이다.

## Final Judgment / 최종 판단

- Done: yes, for M1 final browser smoke evidence.
- Remaining risk: Product Health 대표 경로가 아니라 `dataset_reviews_gold` supporting path smoke이며, `/etl` -> live Catalog CTA 연결은 후속 UI fix가 필요하다.
