# Frontend SourcesPage decomposition 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/frontend-sources-page-decomposition`, `docs/workflows/feature/frontend-sources-page-decomposition`
- Date: 2026-07-01
- Workspace state: local validation passed
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, current Phase workspace docs, relevant `docs/05`, `docs/06`, `docs/07` search excerpts.
- Escalated context read: none
- Context omitted intentionally: 전체 reports audit와 전체 Source of Truth full read는 생략. 이번 변경은 frontend file boundary refactor이며 API/data/schema contract 변경 없음.
- Changed: `SourcesPage`와 dataset workspace helper를 `frontend/src/features/datasets/SourcesPage.jsx`로 이동, `formatMetric`/`formatBytes`를 `frontend/src/app/formatters.js`로 이동, `App.jsx`를 route shell/top-level pages 중심으로 축소, `docs/02-architecture.md` frontend layering 갱신.
- Verified: `npm --prefix frontend run build`, `git diff --check`, static `rg` boundary checks, line count check, in-app browser route smoke 8 paths, `scripts/status-workflow.sh docs/workflows/feature/frontend-sources-page-decomposition`.
- Remaining: `SourcesPage.jsx`는 여전히 5526 lines라 내부 hook/view/modal split이 다음 Phase 후보.
- Next context: Phase 3에서는 `SourcesPage.jsx`의 state/effect/API list loading과 wizard modal sections를 먼저 나눈다.
- Risk: 백엔드가 로컬에서 실행 중이 아니어서 API 성공 smoke는 미검증. Vite proxy API notice는 표시됐지만 frontend route/render와 console error는 통과.

## Verification Commands / 검증 명령

```bash
npm --prefix frontend run build
git diff --check
rg -n "features/datasets|SourcesPage|formatters|formatMetric|formatBytes" frontend/src
rg -n "function SourcesPage|function CredentialSecretPolicyPanel|function DatasetTypeChoiceModal|function SourceStartModal|function formatMetric|function formatBytes" frontend/src/app/App.jsx
wc -l frontend/src/app/App.jsx frontend/src/features/datasets/SourcesPage.jsx frontend/src/app/formatters.js
```

## Browser Smoke / 브라우저 스모크

- Dev server: `http://127.0.0.1:5177`
- Paths: `/`, `/connections`, `/datasets/source`, `/datasets/silver`, `/datasets/gold`, `/jobs/connection-sync`, `/jobs/silver-transform`, `/jobs/gold-build`
- Result: all paths mounted root, shell, page stack, and expected title text. Console error count: 0.
- Limitation: backend API proxy target `127.0.0.1:18000` was not running, so API notice/500 text appeared on most pages.
- Harness validation: `scripts/validate-harness.sh` failed from historical unrelated workspaces with missing required files/source handoff gaps. Current workspace status script passed required-file and quality checks.

## Regression / Manual Verification

- Acceptance: `docs/05` dataset/source/silver/gold UI evidence items reviewed as behavior-preserving route/render check.
- Regression: `docs/06` C-16/C-21/C-25/C-38/frontend quality gate 관련 failure scenarios reviewed; no API/data behavior changed.
- Manual verification: `docs/07` dataset/gold/jobs browser paths used as route smoke substitute for this refactor.

## Final Judgment / 최종 판단

- Done: yes, Phase 2 local validation passed.
- Remaining risk: API-backed interactions require backend runtime smoke in a later integration pass.
