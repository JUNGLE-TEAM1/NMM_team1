# Dataset Feature Boundary 계획

## Phase

- ID: C-48B
- Branch/work location: `feature/dataset-feature-boundary`
- Current integration branch: `feature/data-lake-runtime-stack`

## 목표

Dataset workspace의 Connection/Source/Silver/Gold/Jobs 상태와 action 경계를 분리해 C-49~C-51 구현이 덜 위험하게 만든다.

## 범위

- `SourcesPage`의 거대한 state/action 묶음을 도메인별 hook 또는 action module로 분리한다.
- Connection, Source Dataset, Silver Dataset, Gold Dataset, Job schedule/Run 준비 action을 구분한다.
- `sourcesPageModel`과 wizard props를 정리하되 UI 동작은 유지한다.
- 기존 dataset API payload와 refresh behavior를 유지한다.

## 제외 범위

- C-49 lake write-through 구현.
- Catalog/AI Query handoff 변경.
- UI redesign, 레이아웃 전면 변경, copy 변경.
- backend router/store split.
- 실제 scheduler 구현.

## 구현 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md

Implement C-48B only.
Refactor frontend Dataset workspace internals so Connection, Source Dataset, Silver Dataset, Gold Dataset, and Jobs state/actions are separated into domain-specific hooks or modules.
Preserve UI behavior, API payloads, route behavior, list refresh, modals, wizard steps, and existing demo flows.
Do not implement Product Health lake write-through, Catalog/AI Query handoff changes, backend changes, or real scheduler behavior in this Phase.
Run frontend build and focused browser/manual checks for dataset pages and jobs pages.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md

Verify C-48B only.
Check Connection, Source, Silver, Gold, and Jobs pages for the same create/detail/edit/delete/schedule/run-ready behavior after refactor.
Run npm --prefix frontend run build and git diff --check.
Record any backend router/store refactor as a later Phase, not this one.
```

## Acceptance Criteria

- Dataset workspace state/actions are separated by domain.
- Existing dataset creation/manage/job flows still work.
- C-49 implementation surface becomes smaller and clearer.
- Frontend build passes.

## Regression / Failure Scenario

- wizard state resets unexpectedly if failed.
- save/update/delete actions stop refreshing lists if failed.
- job schedule/run-ready actions call the wrong API if failed.
