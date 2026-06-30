# Frontend SourcesPage decomposition 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-07-01
- Changed: `SourcesPage`와 dataset workspace 전용 constants/helper/wizard/modal/list를 `frontend/src/features/datasets/SourcesPage.jsx`로 이동했다. `formatMetric`, `formatBytes`는 `frontend/src/app/formatters.js`로 분리했고 `App.jsx`는 route shell과 다른 top-level page 중심으로 축소했다. `docs/02-architecture.md` frontend layering에 `features/datasets/`를 추가했다.
- Verified: `npm --prefix frontend run build`, `git diff --check`, static boundary `rg`, line count check, in-app browser route smoke 8 paths, `scripts/status-workflow.sh docs/workflows/feature/frontend-sources-page-decomposition`.
- Remaining: `SourcesPage.jsx`는 아직 5526 lines라 내부 hook/view/modal split이 다음 refactor Phase 후보.
- Next context: `docs/workflows/feature/frontend-sources-page-decomposition/`의 `quality.md`, `report.md`, `next-actions.md`를 읽고 Phase 3 scope를 정한다.
- Risk: backend API target `127.0.0.1:18000`이 실행 중이 아니어서 API-backed success smoke는 미검증. frontend route/render와 console error smoke는 통과.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/frontend-sources-page-decomposition`, `docs/workflows/feature/frontend-sources-page-decomposition`
- Date: 2026-07-01
- Workspace state: local validation passed

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`

## Goal / 목표

- `App.jsx`에 집중된 dataset workspace 구현을 feature boundary로 옮겨 route shell과 domain UI를 분리한다.
- formatter를 공유 utility로 분리해 App page와 dataset feature가 함께 사용하게 한다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/formatters.js`
- `frontend/src/features/datasets/SourcesPage.jsx`
- `docs/02-architecture.md`
- `docs/workflows/feature/frontend-sources-page-decomposition/*`
- `docs/reports/README.md`
- `docs/reports/frontend-sources-page-decomposition.md`

## Implementation Summary / 구현 요약

- `SourcesPage`, dataset wizard/modal/list helper, dataset constants와 mapper/helper를 `features/datasets`로 이동했다.
- `App.jsx`는 `SourcesPage`를 import하고 `dataView`를 전달하는 shell 역할만 유지한다.
- `formatMetric`, `formatBytes`는 `app/formatters.js`로 이동했다.
- `/datasets/gold` smoke 중 빠진 lucide icon import(`Sparkles`, `PlayCircle`)를 발견하고 복구했다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: Browser in-app browser skill, Node REPL browser runtime.
- Reason: frontend route/render smoke와 runtime import 누락 확인.
- Impact: `/datasets/gold`의 root blank 회귀를 발견하고 수정했다.
- Not used because: 별도 E2E framework는 repo에 없음.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, current workflow workspace, relevant `docs/05`/`docs/06`/`docs/07` excerpts.
- Escalated context read: none
- Context omitted intentionally: 전체 Source of Truth/report audit는 생략. API/data/schema contract 변경 없음.

## Verification Commands / 검증 명령

```bash
npm --prefix frontend run build
git diff --check
rg -n "features/datasets|SourcesPage|formatters|formatMetric|formatBytes" frontend/src
rg -n "function SourcesPage|function CredentialSecretPolicyPanel|function DatasetTypeChoiceModal|function SourceStartModal|function formatMetric|function formatBytes" frontend/src/app/App.jsx
wc -l frontend/src/app/App.jsx frontend/src/features/datasets/SourcesPage.jsx frontend/src/app/formatters.js
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/frontend-sources-page-decomposition/quality.md`
- Quality gate status: passed-local
- TDD status: skipped, behavior-preserving frontend file boundary refactor and no frontend test script.
- CI/check result: local equivalent passed.
- Skipped checks: frontend lint/unit test not available; backend API smoke skipped because backend was not running.
- CD/deploy gate: not required.

## Regression Guard / 회귀 보호

- Checked feature: Source/Silver/Gold/Jobs dataset workspace routing and render.
- Protected behavior: route URL/dataView mapping, dataset workspace page titles, shell/page stack mount, shared formatter behavior.
- Result: browser route smoke passed for `/`, `/connections`, `/datasets/source`, `/datasets/silver`, `/datasets/gold`, `/jobs/connection-sync`, `/jobs/silver-transform`, `/jobs/gold-build`.

## Failure Scenario / 실패 시나리오

- Reviewed failure: frontend runtime import 누락으로 특정 route가 blank root가 되는 경우.
- Expected behavior: build/static smoke뿐 아니라 browser route smoke에서 root mount와 page title text를 확인한다.
- Verification: `/datasets/gold` blank를 발견한 뒤 `Sparkles`, `PlayCircle` import를 복구하고 전체 route smoke를 재실행했다.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`의 dataset/gold/jobs browser path 관련 항목을 lightweight route smoke로 대체 실행.
- Environment: Vite dev server `http://127.0.0.1:5177`.
- Result: frontend render smoke passed.
- Failure/limitation: backend API target `127.0.0.1:18000`이 실행 중이 아니어서 API notice가 표시됨.
- Evidence: browser smoke 결과는 workspace `quality.md`와 `report.md`에 기록.
- Harness validation limitation: `scripts/validate-harness.sh`는 과거 workspace들의 누락 파일/source handoff gap 253건으로 실패했다. 이번 workspace 자체는 `scripts/status-workflow.sh docs/workflows/feature/frontend-sources-page-decomposition`에서 required files present와 `Quality gate status: passed-local`을 확인했다.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Source/Silver/Gold Dataset UI evidence, Product Health preset panel, local/container health/smoke check.
- Status: partially satisfied for frontend route/render preservation.
- Evidence: build/static/browser route smoke. API/data success path는 이번 Phase 범위 밖.

## Document Updates / 문서 업데이트

- Updated: `docs/02-architecture.md`, workspace docs, `docs/reports/README.md`, this report.
- Not updated and why: `docs/03-interface-reference.md`, `docs/05`, `docs/06`, `docs/07`은 contract/acceptance/manual flow 변경이 아니라 기존 항목에 evidence만 연결했으므로 수정하지 않음.

## Failed / Incomplete / Follow-Up TODO

- `SourcesPage.jsx` 내부 hook/view/modal split.
- frontend route smoke 자동화 추가.
- backend 실행 상태에서 API-backed dataset interactions smoke.

## Context For Next Phase / 다음 Phase 문맥

- `frontend/src/features/datasets/SourcesPage.jsx`의 state/effect/API refresh logic을 hooks로 먼저 분리한다.
- 이후 modal/list/view section을 작은 presentational components로 분리한다.

## Secret / Migration / Env Check

- Secret check: no secret changes.
- Migration/data change: none.
- Env change: none.

## Final Judgment / 최종 판단

- Done: yes.
- Remaining risk: backend 미기동 상태라 API success interaction은 후속 integration smoke 필요.
