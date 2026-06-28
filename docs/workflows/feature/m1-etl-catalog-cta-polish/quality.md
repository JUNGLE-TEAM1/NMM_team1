# M1 ETL Catalog CTA polish 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: no
- Reason: 작은 M1 UI navigation target polish이며 별도 unit test harness가 없다. build와 browser click smoke로 회귀를 검증한다.
- Failing test first: skipped
- Expected failure command/result: n/a
- Pass command/result: `cd frontend && npm run build` passed; browser smoke에서 `/etl -> Catalog detail` 클릭 후 `/catalog/dataset_reviews_gold` URL과 CatalogMetadata detail 표시 확인.
- Refactor notes: `WEEK2_DEFAULT_CATALOG_DETAIL_URL` 상수로 기본 catalog detail URL을 공유하고, `/catalog/<dataset>` 입력은 display URL을 그대로 보존하도록 `navigate()`를 보강했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | n/a | skipped | frontend lint script 없음 |
| unit/focused test | n/a | skipped | frontend test script 없음; browser smoke로 대체 |
| integration/contract test | route/static check + browser smoke | passed | `rg -n "WEEK2_DEFAULT_CATALOG_DETAIL_URL|path\\.startsWith\\(\"/catalog/\"\\)|navigate\\(WEEK2_DEFAULT_CATALOG_DETAIL_URL\\)" frontend/src/app/App.jsx`; in-app browser fresh bundle smoke passed |
| build/typecheck | `cd frontend && npm run build` | passed | Vite build passed, output asset `index-CBfRFTUw.js` after final change |
| container browser smoke | `DOCKER_BUILDKIT=0 BACKEND_PORT=18009 FRONTEND_PORT=13009 docker compose -p asklake_m1_etl_catalog_cta build frontend && ... up -d frontend`; browser `/etl?cachebust=m1-cta-2` | passed | `local_runner 실행` 버튼 1개, `Catalog detail` 버튼 1개, final URL `http://127.0.0.1:13009/catalog/dataset_reviews_gold`, title `Amazon Reviews Gold`, `dataset_reviews_gold`/`CatalogMetadata` 표시, console errors 0 |
| whitespace check | `git diff --check` | passed | no output |
| harness validation | `scripts/validate-harness.sh --strict` | passed | strict harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | strict harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, after PR creation
- CI result: pending
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 문제 발생 시 `frontend/src/app/App.jsx`의 route helper와 ETL handoff CTA 변경을 되돌린다. Docker buildx 세션 오류는 classic builder fallback(`DOCKER_BUILDKIT=0`)으로 우회했다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend unit test | test script 없음 | 사용자 phase 진행 지시 / 2026-06-29 |
