# Frontend design system foundation 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: no
- Reason: 이번 Phase는 UI 구조 리팩토링과 component extraction이며 backend/core logic/API contract 변경이 없다. 현재 frontend unit test harness가 없으므로 build와 smoke/static checks로 대체한다.
- Failing test first: skipped
- Expected failure command/result: frontend unit test script 없음
- Pass command/result: `npm --prefix frontend run build` passed; browser smoke passed on 대표 route; static route/design-system check passed.
- Refactor notes: 기능 동작 변경 없이 design-system primitive, app shell, route helper를 분리한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | n/a | skipped | `frontend/package.json`에 lint script 없음 |
| unit/focused test | n/a | skipped | frontend test script 없음; build/static smoke로 대체 |
| integration/contract test | `rg -n "design-system|AppShell|normalizePath|routeToUrl|routeEntries|dataViewForPath" frontend/src` | passed | `frontend/src/design-system/*`, `frontend/src/app/AppShell.jsx`, `frontend/src/app/routes.js`, `styles.css` token import 확인 |
| stale local definition check | `rg -n "function PageHeader|function ToastNotice|function InfoCard|function EmptyState|function DataTable|function AiCopilotDock|const navItems|function normalizePath|function routeToUrl" frontend/src/app/App.jsx` | passed | exit 1/no output; `App.jsx`의 기존 local shell/primitive/route 정의 제거 확인 |
| build/typecheck | `npm --prefix frontend run build` | passed | Vite production build succeeded: 1724 modules, JS gzip 94.28 kB, CSS gzip 13.17 kB |
| browser smoke | in-app browser on `http://127.0.0.1:5177` | passed-with-notes | `/`, `/connections`, `/datasets/source`, `/datasets/silver`, `/jobs/gold-build`, `/runs`, `/catalog`, `/query`에서 shell/sidebar/page header 렌더링, fatal console error 0. Backend `127.0.0.1:18000` 미기동으로 Vite proxy `ECONNREFUSED` log는 발생했으나 이번 structural refactor 검증 범위 밖이다. |
| diff whitespace | `git diff --check` | passed | output 없음 |
| workspace status | `scripts/status-workflow.sh docs/workflows/feature/frontend-design-system-foundation` | passed-with-notes | required workspace files 0개 누락; completion/pre-merge/remote gates는 PR 전 단계로 남음 |
| harness validation | `scripts/validate-harness.sh` | failed-unrelated | 이번 workspace가 아니라 과거 여러 workspace의 missing file / sources handoff 누락 때문에 253 issues로 실패 |
| strict harness validation | `scripts/validate-harness.sh --strict` | skipped | 기본 harness가 기존 누적 workspace 결함으로 실패하여 이번 Phase 검증 신호로 사용하지 않음 |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, local equivalent
- CI result: local equivalent passed for frontend build/static/browser smoke; repo-wide harness is blocked by pre-existing workspace hygiene failures unrelated to this branch.
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: frontend structural refactor이므로 rollback은 `frontend/src/app/*`, `frontend/src/design-system/*`, workspace docs 변경을 되돌린다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend lint | lint script 없음 | yes |
| frontend unit test | test script 없음 | yes |
