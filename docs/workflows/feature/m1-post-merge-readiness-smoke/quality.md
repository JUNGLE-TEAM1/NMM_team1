# M1 post-merge readiness smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: no, unless the smoke exposes a functional regression that requires code changes
- Reason: 이번 Phase의 기본 목적은 최신 main 기준 M1 browser/manual verification과 문서 상태 정리다. UI 또는 backend logic을 바꾸지 않는다면 TDD를 적용하지 않는다.
- Failing test first: not applicable at Phase creation
- Expected failure command/result: not applicable at Phase creation
- Pass command/result: `cd frontend && npm run build` 통과, Docker browser smoke 통과
- Refactor notes: 모바일 `/query` smoke에서 `.page-stack` overflow가 발견되어 640px 이하 `.page-header` 좌우 음수 margin을 제거했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not run | skipped | 별도 lint script가 없어 build/browser smoke로 대체했다. |
| unit/focused test | not run | skipped | UI smoke와 CSS 보완 범위이며 focused UI test harness가 없어 browser smoke로 대체했다. |
| API catalog smoke | `curl -fsS http://127.0.0.1:18008/api/week2/catalog/dataset_product_health_gold || true` | passed | Product Health CatalogMetadata가 404로 확인되어 ready 전환 근거가 없음을 확인했다. |
| API query smoke | `curl -fsS -X POST http://127.0.0.1:18008/api/week2/ai/query ...top_risk...` | passed | `route=unsupported`, `status=blocked`, rows 0, `dataset_reviews_gold` fallback evidence 반환. |
| integration/contract test | browser smoke `/query?smoke=post-merge-readiness-after-fix` | passed | Product Health readiness missing, M2/M3/M5 `not-ready`, M6 `blocked`, M1 `ready`, CTA 클릭 후 `route=unsupported`, rows 0, fake risk row 없음, console error 없음. |
| mobile layout smoke | browser viewport `390x844`, `/query?smoke=post-merge-readiness-mobile-after-fix` | passed | readiness item 5개가 1열 배치, document scroll width 375, overflow 없음. |
| build/typecheck | `cd frontend && npm run build` | passed | Vite build 통과, 최종 asset `index-CGMK-FMT.css`, `index-Dh2sri8q.js`. |
| docker compose smoke | `DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 ... docker compose -p asklake_m1_post_merge_smoke up -d --build backend frontend` | passed | 기본 BuildKit gRPC header 오류 후 classic build로 backend/frontend 구동. |
| diff whitespace | `git diff --check --cached` | passed | whitespace error 없음. |
| harness validation | `scripts/validate-harness.sh --strict` | passed | strict 실행에 포함되어 `Harness validation passed.` 확인. |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: pending PR
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| TDD | 기본 범위가 최신 main browser smoke와 문서 정리이고, 보완은 CSS overflow fix라 TDD 대신 browser desktop/mobile smoke로 확인했다. | AI 기록 |
| lint | 별도 lint script가 없는 frontend라 `npm run build`와 browser smoke로 대체했다. | AI 기록 |
