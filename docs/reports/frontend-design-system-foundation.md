# Frontend design system foundation 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-07-01
- Changed: `frontend/src/design-system/` token/primitive foundation 추가, `AppShell` 분리, route/nav mapping 분리, `App.jsx` shell/route 중복 축소, `docs/02` frontend layering 갱신.
- Verified: `npm --prefix frontend run build` passed, static extraction checks passed, `git diff --check` passed, browser smoke passed on 대표 route 8개. Backend 미기동으로 Vite proxy `ECONNREFUSED` log는 발생했다.
- Remaining: `SourcesPage` domain state/API/view 분리는 다음 Phase로 남김. repo-wide harness는 기존 historical workspace hygiene 문제로 실패.
- Next context: 다음 Phase는 `SourcesPage` state ownership map 작성 후 dataset feature modules/hooks 분리부터 시작한다.
- Risk: foundation만 만든 상태라 `App.jsx`는 여전히 크다. domain decomposition 없이는 장기 유지보수성이 충분히 좋아지지 않는다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/frontend-design-system-foundation`, `docs/workflows/feature/frontend-design-system-foundation`
- Date: 2026-07-01
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/15-context-budget-rule.md`

## Goal / 목표

- `App.jsx`에 몰린 shell, route, 공통 UI primitive 책임을 분리해 후속 domain refactor가 가능한 기반을 만든다.
- 기능 동작, API contract, backend/data path는 유지한다.

## Changed Files / 변경 파일

- `frontend/src/design-system/*`
- `frontend/src/app/AppShell.jsx`
- `frontend/src/app/routes.js`
- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/02-architecture.md`
- `docs/workflows/feature/frontend-design-system-foundation/*`
- `docs/reports/README.md`
- `docs/reports/frontend-design-system-foundation.md`

## Implementation Summary / 구현 요약

- 기존 class와 selector를 보존하는 얇은 design-system wrapper를 추가했다.
- sidebar/topbar/toast/copilot dock layout을 `AppShell`로 옮겼다.
- nav item, path normalization, canonical route URL, dataset workspace route mapping을 `routes.js`로 옮겼다.
- `App.jsx`는 feature page와 domain state를 유지하되 shell/routes/primitives를 import하도록 줄였다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: Browser plugin `control-in-app-browser`, Node REPL browser runtime
- Reason: local Vite app route smoke를 실제 브라우저에서 확인하기 위해 사용했다.
- Impact: 대표 route에서 shell/sidebar/page header 렌더링과 fatal console error 0개를 확인했다.
- Not used because: image generation, spreadsheet, document, deployment skill은 관련 없음.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, target frontend files, workspace docs
- Escalated context read: `docs/05`, `docs/06`, `docs/07` 관련 route/UI/smoke 항목, browser skill instruction
- Context omitted intentionally: backend/data/API implementation, full historical report audit, full `SourcesPage` domain split design

## Baseline Codebase Adoption / 기존 코드베이스 baseline 적용

- Current base commit: `82752323`
- Existing run/build/test commands: `npm --prefix frontend run build`, `scripts/validate-harness.sh`, `scripts/status-workflow.sh`
- Existing CI/PR/branch policy: remote pull/merge/rebase/PR merge는 사람 확인 필요; feature branch push/PR은 PR-ready 후 별도 선택
- Existing docs/code mapped: `docs/02` frontend layering, `App.jsx`, `styles.css`
- Missing or stale docs: repo-wide harness 대상 historical workspace 다수가 필수 파일 누락 또는 sources handoff 누락 상태
- Infrastructure gaps: frontend lint/unit test script 없음
- Next Phase candidates: `SourcesPage` domain hook/page split
- P0 before first risky implementation feature: state ownership map과 route/data contract 보호선 작성
- Deferred gaps and reason: `SourcesPage` 73개 state 분해는 이번 foundation 범위를 넘어서 후속 Phase로 분리
- Accepted risk: `App.jsx` 대형 파일 상태가 일부 남음
- Gaps intentionally left: no React Router/Tailwind/shadcn dependency adoption
- Next-change adoption plan: dataset workspace paths부터 feature folder와 hooks로 이동

## Verification Commands / 검증 명령

```bash
npm --prefix frontend run build
rg -n "design-system|AppShell|normalizePath|routeToUrl|routeEntries|dataViewForPath" frontend/src
rg -n "function PageHeader|function ToastNotice|function InfoCard|function EmptyState|function DataTable|function AiCopilotDock|const navItems|function normalizePath|function routeToUrl" frontend/src/app/App.jsx
git diff --check
scripts/status-workflow.sh docs/workflows/feature/frontend-design-system-foundation
scripts/validate-harness.sh
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/frontend-design-system-foundation/quality.md`
- Quality gate status: passed-with-skips
- TDD status: not applied; behavior-preserving UI structure refactor and no frontend unit harness
- CI/check result: frontend build/static/browser smoke passed locally
- Skipped checks: frontend lint/unit test absent; strict harness skipped because base harness fails on unrelated historical workspaces
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/frontend-design-system-foundation/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: foundation-first split accepted; new UI dependency adoption and full `SourcesPage` domain split deferred
- Revisit/rollback condition: if AppShell/routes extraction changes route behavior, revert `frontend/src/app/AppShell.jsx`, `frontend/src/app/routes.js`, and related `App.jsx` imports

## Regression Guard / 회귀 보호

- Checked feature: UI route/shell rendering
- Protected behavior: `/` still normalizes to `/datasets/source`; 대표 pages still render shell/sidebar/page header
- Result: browser smoke passed on `/`, `/connections`, `/datasets/source`, `/datasets/silver`, `/jobs/gold-build`, `/runs`, `/catalog`, `/query`

## Failure Scenario / 실패 시나리오

- Reviewed failure: `docs/06` build/test/smoke 없이 기능 완료 선언 금지, UI route breakage
- Expected behavior: local build and browser smoke evidence recorded before completion
- Verification: `npm --prefix frontend run build`, browser smoke, static route extraction check
- Result: passed, with repo-wide harness failure recorded as unrelated existing hygiene issue

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` route/browser smoke concern
- Environment: local Vite dev server `http://127.0.0.1:5177`
- Result: representative route smoke passed
- Failure/limitation: backend was not required for this structural refactor; API data freshness was not tested. Backend `127.0.0.1:18000` 미기동으로 Vite proxy `ECONNREFUSED` log는 발생했다.
- Evidence: shell/sidebar/page header rendered on 8 representative paths, fatal browser console error 0

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: API/UI route, local health/smoke evidence, build/smoke/manual verification result 기록
- Status: satisfied for this frontend structure Phase
- Evidence: route helper/static search and browser smoke results in `quality.md`

## Document Updates / 문서 업데이트

- Updated: `docs/02-architecture.md`, branch workspace docs, this report, `docs/reports/README.md`
- Not updated and why: `docs/03` API/schema contract unchanged; `docs/05`, `docs/06`, `docs/07` criteria reused without Source of Truth change

## Failed / Incomplete / Follow-Up TODO

- `SourcesPage` domain state/API/view split remains.
- repo-wide `scripts/validate-harness.sh` fails on pre-existing historical workspace missing files and sources handoff issues.

## Context For Next Phase / 다음 Phase 문맥

- Start from `SourcesPage` state ownership map.
- Prefer `features/datasets/` modules for Source/Silver/Gold dataset workspace views.
- Keep `routes.js` and `design-system` stable unless a repeated UI pattern proves it needs a new primitive.

## Secret / Migration / Env Check

- Secret check: no secret or credential changes
- Migration/data change: none
- Env change: none

## Final Judgment / 최종 판단

- Done: design-system foundation and app shell/route separation are ready for review.
- Remaining risk: `App.jsx` is still large because domain decomposition is intentionally deferred.
