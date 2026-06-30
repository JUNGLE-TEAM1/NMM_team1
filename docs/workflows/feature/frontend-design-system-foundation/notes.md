# Frontend design system foundation 노트

## 진행 메모

- 2026-07-01: `App.jsx`의 sidebar/topbar/toast shell을 `AppShell.jsx`로 분리했다.
- 2026-07-01: nav item, route normalization, canonical URL mapping, dataset workspace route mapping을 `routes.js`로 분리했다.
- 2026-07-01: `design-system/`에 token CSS와 기존 class 기반 primitive wrapper를 추가했다. 새 UI dependency는 추가하지 않았다.
- 2026-07-01: 이번 Phase에서는 `SourcesPage`의 domain state/useEffect/API 로직 분해를 intentionally deferred로 남겼다.

## 결정

- Design-system foundation은 CSS class 호환 wrapper부터 시작한다. Tailwind/shadcn/React Router 도입은 이 Phase에서 하지 않는다.
- 공통 primitive는 `Button`, `Badge`, `PageHeader`, `ToastNotice`, `InfoCard`, `EmptyState`, `DataTable`까지만 추가하고, feature-specific component는 후속 Phase로 남긴다.

## 열린 질문

- 다음 Phase에서 `SourcesPage`를 `features/datasets` 아래 view/hook/API adapter로 나눌 때 먼저 state ownership map을 작성할지 결정이 필요하다.
- repo-wide `scripts/validate-harness.sh`는 과거 workspace hygiene 누적으로 실패한다. 이 Phase PR과 별도 cleanup Phase가 필요하다.

## 링크 / 증거

- `npm --prefix frontend run build` passed.
- Browser smoke: `/`, `/connections`, `/datasets/source`, `/datasets/silver`, `/jobs/gold-build`, `/runs`, `/catalog`, `/query` shell/sidebar/page header rendered; fatal console error 0.
- Browser smoke limitation: backend `127.0.0.1:18000`은 실행하지 않아 Vite proxy `ECONNREFUSED` log가 발생했다. 이번 Phase는 frontend structural refactor라 API data freshness는 검증하지 않았다.
- `scripts/validate-harness.sh` failed with 253 pre-existing historical workspace issues unrelated to this branch.
