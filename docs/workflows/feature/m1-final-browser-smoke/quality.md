# M1 final browser smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: no
- Reason: 검증 전용 browser smoke Phase이며 제품 코드 변경이 없다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: browser smoke와 build/route/API checks 통과
- Refactor notes: 코드 refactor 없음

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| Docker build | `DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 COMPOSE_PROJECT_NAME=asklake_m1_final_smoke BACKEND_PORT=18002 FRONTEND_PORT=13002 docker compose -p asklake_m1_final_smoke build backend frontend` | passed | default buildx path failed with `x-docker-expose-session-sharedkey`; legacy build fallback succeeded |
| Docker run | `COMPOSE_PROJECT_NAME=asklake_m1_final_smoke BACKEND_PORT=18002 FRONTEND_PORT=13002 docker compose -p asklake_m1_final_smoke up -d backend frontend` | passed | backend `18002`, frontend `13002` ready |
| backend health | `curl -fsS http://127.0.0.1:18002/health` | passed | returned `{"service":"asklake-backend","status":"ok","app":"AskLake"}` |
| frontend routes | `curl -fsSI http://127.0.0.1:13002/{etl,catalog,query}` | passed | all returned `HTTP/1.1 200 OK` |
| Week2 run API | `POST /api/week2/workflows/pipeline_reviews_json_e2e/runs` with `local_runner` | passed | returned `run_reviews_demo_001` via curl and `run_reviews_demo_002` via browser; status `fallback_succeeded` |
| Week2 catalog API | `GET /api/week2/catalog/dataset_reviews_gold` | passed | `lineage.run_id=run_reviews_demo_001` in curl check; browser later confirmed `run_reviews_demo_002` |
| Week2 query API | `POST /api/week2/ai/query` | passed | `status=succeeded`, `route=sql`, `engine=duckdb`, `rows=3`, `evidence=1`, `retrieval_trace=1` |
| browser `/etl` smoke | in-app browser at `http://127.0.0.1:13002/etl` | passed with follow-up | `local_runner 실행` created `run_reviews_demo_002`; output and Catalog lineage displayed |
| browser `/catalog` smoke | in-app browser at `http://127.0.0.1:13002/catalog` | passed | displayed `dataset_reviews_gold`, `run_reviews_demo_002`, local fallback path, DuckDB query readiness |
| browser `/query` smoke | in-app browser at `http://127.0.0.1:13002/query` | passed | sample query displayed `succeeded`, `passed`, SQL, `duckdb`, rows `B003/B001/B002`, evidence for `run_reviews_demo_002` |
| browser console errors | `tab.dev.logs({ levels: ['error'], limit: 20 })` | passed | `[]` |
| build/typecheck | `cd frontend && npm run build` | passed | Vite production build passed |
| lint | `git diff --check` | passed | whitespace check passed after report/workspace updates |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | strict harness validation passed after shared-docs/decisions alignment |

## CI/CD Gate / CI-CD 게이트

- CI required: if PR is created
- CI result: local checks passed; remote CI passed on PR #238. GitHub checks `harness`, `container-smoke`, `manifest-smoke`, `linked-issue`, `pr-size-hard-gate`, `pr-template-drift`, `migration-schema-security`, and `risk-warning` all completed with `SUCCESS`.
- Deploy/publish required: no
- Deployment confirmation:
- Rollback/smoke notes: local compose project `asklake_m1_final_smoke` was used only for smoke and was stopped with `docker compose -p asklake_m1_final_smoke down --remove-orphans`.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| backend full pytest | 이번 Phase는 제품 코드 변경 없는 browser smoke이며 API/browser E2E를 직접 확인했다. | n/a |
| 5GB input evidence | M2/M3/M5 통합 책임이며 이번 M1 smoke 범위 밖이다. | n/a |
| `gold_product_health` final Gold path | M3/M2/M5 후속 통합 책임이며 이번 M1 smoke 범위 밖이다. | n/a |

## Smoke Finding / 스모크 발견 사항

- `/etl`의 browser flow에서 `Catalog detail` CTA를 클릭하면 live Catalog 화면이 아니라 `/dataset` placeholder로 이동했다.
- 직접 `/catalog` 경로에서는 `dataset_reviews_gold`, `run_reviews_demo_002`, local fallback path, DuckDB query readiness가 정상 표시됐다.
- 이 Phase는 검증 전용이므로 CTA 수정은 후속 M1 UI Phase로 넘긴다.
