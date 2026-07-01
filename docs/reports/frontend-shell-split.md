# Frontend Shell Split 보고서

## Short Report / 짧은 보고

- Type: Phase C-48A
- Date: 2026-07-01
- Changed: `App.jsx` shell/sidebar/topbar를 `AppShell.jsx`로 분리하고, route/nav 기준을 `routes.js`로 통일했다.
- Verified: `npm --prefix frontend run build`, `git diff --check`, browser route smoke 통과.
- Remaining: Dataset workspace 내부 state/action 분리는 C-48B로 남음.
- Next context: `SourcesPage`, `useSourcesPageState`, `sourcesPageModel` 경계를 C-48B에서 나눈다.
- Risk: local smoke에서는 `VITE_PROXY_TARGET=http://127.0.0.1:8000`가 필요했다.
