# Frontend Shell Split 보고서

## Short Report / 짧은 보고

- Type: Phase C-48A
- Date: 2026-07-01
- Changed: `App.jsx`에서 shell/sidebar/topbar를 `AppShell.jsx`로 분리하고, route/nav 기준을 `routes.js`로 통일했다.
- Verified: frontend build, diff whitespace check, browser route smoke를 통과했다.
- Remaining: Dataset workspace 내부 state/action 분리는 C-48B로 남겼다.
- Next context: C-48B는 `SourcesPage`, `useSourcesPageState`, `sourcesPageModel`을 도메인별로 나누는 작업부터 시작한다.
- Risk: Vite default proxy target이 `127.0.0.1:18000`이라 검증 시 `VITE_PROXY_TARGET=http://127.0.0.1:8000`가 필요했다.

---

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/data-lake-runtime-stack`, `docs/workflows/feature/frontend-shell-split`
- Date: 2026-07-01
- Workspace state: completed

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- `App.jsx`의 shell/router/page composition 책임을 줄이고 route behavior는 유지한다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/AppShell.jsx`
- `frontend/src/app/routes.js`
- `docs/workflows/feature/frontend-shell-split/*`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Implementation Summary / 구현 요약

- `AppShell`을 추가해 sidebar, topbar, health button, AI helper toggle, nav rendering을 분리했다.
- `App.jsx`가 `routes.js`의 `navItems`, `normalizePath`, `routeToUrl`, `dataViewForPath`를 사용하도록 변경했다.
- Dataset workspace route 조건문을 `dataViewForPath(activePath)` 기반 단일 outlet으로 줄였다.
- `SourcesPage` 내부 state/action은 C-48B 범위로 남기고 건드리지 않았다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: browser `control-in-app-browser`
- Reason: local frontend route smoke 확인
- Impact: 주요 route와 alias가 shell/sidebar/page surface를 정상 렌더링하는지 확인했다.

## Verification Commands / 검증 명령

```bash
npm --prefix frontend run build
git diff --check
VITE_PROXY_TARGET=http://127.0.0.1:8000 npm --prefix frontend run dev -- --host 127.0.0.1
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/frontend-shell-split/quality.md`
- Quality gate status: passed
- TDD status: not applicable; behavior-preserving frontend refactor.
- CI/check result: local build and route smoke passed.
- Skipped checks: full dataset create/edit click path deferred to C-48B.
- CD/deploy gate: not applicable.

## Regression Guard / 회귀 보호

- Checked feature: route/navigation shell behavior.
- Protected behavior: `/connections`, `/datasets/*`, `/jobs/*`, `/runs`, `/catalog`, `/query`, `/`, `/datasets`, `/jobs`.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-48A.
- Environment: local backend `127.0.0.1:8000`, frontend `127.0.0.1:5173`.
- Result: passed.
- Failure/limitation: default Vite proxy target caused HTTP 502 until `VITE_PROXY_TARGET` was set to backend port 8000.
- Evidence: browser smoke returned shell/sidebar/page surface/active nav for all checked routes with no console errors.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: `C-48A Frontend Shell Split`
- Status: passed.
- Evidence: `AppShell.jsx` split, `routes.js` usage, route smoke.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: Dataset workspace internals are still large and should be handled in C-48B.
