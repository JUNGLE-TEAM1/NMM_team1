# M1 final browser smoke 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: 제품 코드는 변경하지 않고 M1 후속 Phase queue와 최신 main 기준 browser smoke evidence를 기록했다.
- Verified: 최신 Docker Compose build/run, backend health, frontend `/etl`/`/catalog`/`/query` routes, Week2 run/catalog/query API, in-app browser `/etl -> /catalog -> /query` smoke, `cd frontend && npm run build`.
- Remaining: `/etl`의 `Catalog detail` CTA가 `/dataset` placeholder로 이동한다. 직접 `/catalog` route는 정상이며 CTA 수정은 후속 M1 UI Phase로 넘긴다.
- Next context: 다음 M1 작업은 M6 `route`/`retrieval_trace` UI 보강 또는 `/etl` CTA를 live `/catalog`로 연결하는 작은 UI fix 중 하나다.
- Risk: 이번 smoke는 `dataset_reviews_gold` legacy/supporting path 기준이다. `gold_product_health` final Gold와 5GB lineage 완료 증거로 해석하면 안 된다.

## Phase

- Type: feature
- Branch/work location: `feature/m1-final-browser-smoke`, `docs/workflows/feature/m1-final-browser-smoke`
- Date: 2026-06-28
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/07-manual-verification-playbook.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- `docs/reports/m1-week2-final-demo-flow.md`

## Verification Summary / 검증 요약

- Docker project: `asklake_m1_final_smoke`
- Backend: `http://127.0.0.1:18002`
- Frontend: `http://127.0.0.1:13002`
- `/etl`: `local_runner 실행`으로 `run_reviews_demo_002` 생성, `fallback_succeeded`, output, Catalog lineage 표시 확인
- `/catalog`: `dataset_reviews_gold`, `run_reviews_demo_002`, local fallback path, DuckDB query readiness 표시 확인
- `/query`: sample question 실행 후 `succeeded`, `passed`, `duckdb`, SQL rows `B003/B001/B002`, evidence `run_reviews_demo_002` 표시 확인
- Browser console errors: `[]`

## Commands / 명령

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
```

## Finding / 발견 사항

- `/etl` smoke에서 `Catalog detail` CTA는 live Catalog가 아니라 `/dataset` placeholder로 이동했다.
- top-level route `/catalog`는 live Catalog 화면으로 정상 동작했다.
- 후속 M1 UI 작업에서 `/etl`의 Catalog CTA target을 live Catalog route로 맞추는 것을 권장한다.

## Final Judgment / 최종 판단

- Done: yes, for M1 final browser smoke.
- Remaining risk: Product Health 대표 경로 통합은 아직 별도 M2/M3/M5 책임이며, 이번 smoke는 M1 화면이 기존 Week2 reviews path를 끝까지 표시할 수 있음을 증명한다.
