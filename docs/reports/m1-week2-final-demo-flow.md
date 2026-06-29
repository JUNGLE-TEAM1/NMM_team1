# M1 Week2 final demo flow 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-27
- Changed: `/catalog`에 M6 DuckDB query readiness 표시를 추가하고, `/query`에 DuckDB runtime/SQL rows/evidence 상태와 `local_path_missing` 안내를 추가했다.
- Verified: `npm run build` in `frontend/`, runtime display keyword check, route smoke on Vite `127.0.0.1:13001`, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: #200과 #204가 merge된 뒤 최신 main 기준으로 최종 browser click smoke를 다시 수행하는 것이 좋다. PR을 만들 경우 linked issue 생성/closing keyword 기록이 필요하다.
- Next context: M1은 M5/M6 runtime을 소유하지 않고, 최신 Catalog/AIQueryResult를 화면에서 명확히 표시하는 final demo polish만 담당한다.
- Risk: #200이 `/etl` UI를 크게 바꾸므로 merge 순서에 따라 `frontend/src/app/App.jsx` 충돌 가능성이 있다.

## Phase

- Type: feature
- Branch/work location: `feature/m1-week2-final-demo-flow`, `docs/workflows/feature/m1-week2-final-demo-flow`
- Date: 2026-06-27
- Workspace state: complete

## Goal / 목표

- 최신 Week2 M5/M6 연결 흐름을 M1 화면에서 발표자가 이해하기 쉽게 확인할 수 있게 한다.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/workflows/feature/m1-week2-final-demo-flow/*`
- `docs/reports/m1-week2-final-demo-flow.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- Catalog 목록 화면에 `local output`, `readonly SQL`, `lineage` readiness 표시를 추가했다.
- AI Query 화면에 `DuckDB runtime`, `SQL rows`, `evidence` readiness 표시를 추가했다.
- `local_path_missing` 오류가 보이면 workflow 실행 후 다시 query해야 한다는 안내를 표시한다.
- M5/M6 backend runtime, runner, Catalog store, SQL engine 로직은 변경하지 않았다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: default shell/apply_patch workflow
- Reason: Markdown handoff와 frontend build 검증만 필요한 작은 Phase다.
- Impact: specialized browser/document tool은 결과에 영향을 주지 않았다.
- Not used because: live backend/browser click smoke는 #200/#204 merge 후 최신 main에서 수행하는 편이 안전하다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read, Week2 ver2 문맥과 M1 UI 영향 확인을 위해 선택적으로 확장
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, current workspace files, current frontend files
- Escalated context read: `docs/project-context/asklake-week2-module-plan/ver2/README.md`, `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`, #200/#204 source branch report/diff summary
- Context omitted intentionally: backend runner/catalog/query internals, M3/M4 implementation details, production deploy/AWS flows

## Verification Commands / 검증 명령

```bash
cd frontend && npm run build
rg -n "DuckDB Query가 읽을 evidence|DuckDB runtime|local_path_missing|M6 DuckDB 실제 SQL runtime|runtime-readiness-panel|runtime-check" frontend/src/app/App.jsx frontend/src/app/styles.css
curl -fsSI http://127.0.0.1:13001/catalog
curl -fsSI http://127.0.0.1:13001/catalog/dataset_reviews_gold
curl -fsSI http://127.0.0.1:13001/query
curl -fsSI http://127.0.0.1:13001/etl
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m1-week2-final-demo-flow/quality.md`
- Quality gate status: passed
- TDD status: not applicable; frontend display polish only
- CI/check result: local equivalent passed
- Skipped checks: backend tests skipped because backend/core logic did not change
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/m1-week2-final-demo-flow/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: M1 follow-up은 frontend display polish로 제한하고, #200/#204는 inspect only로 두며 직접 merge하지 않는다.
- Revisit/rollback condition: #200/#204 merge 후 `frontend/src/app/App.jsx` 충돌 또는 `query_result.engine`/`local_path_missing` 응답 shape 변경이 확인되면 defensive rendering만 재검토한다.

## Regression Guard / 회귀 보호

- Checked feature: M1 final demo display polish
- Protected behavior: M1 displays M5/M6 runtime evidence without creating fake success or owning backend runtime logic.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: AI Query가 output file 없이 성공처럼 보이는 경우.
- Expected behavior: `local_path_missing`이면 workflow 실행이 먼저 필요하다는 안내를 표시한다.
- Verification: code review, keyword check, frontend build.
- Result: passed

## Manual Verification / 수동 검증

- Document executed: route smoke only
- Environment: frontend Vite dev server `127.0.0.1:13001`
- Result: `/catalog`, `/catalog/dataset_reviews_gold`, `/query`, `/etl` returned 200.
- Failure/limitation: live backend API/browser click smoke는 수행하지 않았다. #200/#204 merge 후 최신 main에서 최종 click smoke를 다시 수행하는 편이 안전하다.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Current Baseline Acceptance의 catalog detail 확인, 실패 output을 ready/success처럼 표시하지 않는 기준, Target MVP Query/Ask의 evidence 표시 기준
- Status: partially verified for M1 display layer
- Evidence: `/catalog` readiness 표시와 `/query` runtime/evidence 상태 표시 build/route/static check 통과. 실제 backend E2E는 후속 smoke로 남김.

## Document Updates / 문서 업데이트

- Updated: branch workspace 문서, durable report, `docs/reports/README.md`
- Not updated and why: `docs/02`, `docs/03`, `docs/05`, `docs/06`, `docs/07`은 기존 `CatalogMetadata`/`AIQueryResult` 소비와 frontend display polish만 수행했으므로 변경하지 않았다.

## Failed / Incomplete / Follow-Up TODO

- #200/#204 merge 후 최신 `origin/main` 기준으로 최종 browser click smoke를 다시 수행한다.
- PR 진행 시 linked issue를 만들고 PR closing keyword를 `sync.md`에 기록한다.
- live backend API smoke는 이번 local display polish 검증에서는 수행하지 않았다.

## Context For Next Phase / 다음 Phase 문맥

- Week2 ver2 확장안은 `docs/project-context/asklake-week2-module-plan/ver2/`에 project context로 저장되어 있으며, Source of Truth와 충돌하면 Source of Truth가 우선한다.
- M1은 M5/M6 runtime/backend/contract를 소유하지 않고, 최신 run/catalog/query/evidence 상태를 화면에 표시하는 책임만 가진다.
- #200은 `/etl` UI 변경, #204는 DuckDB runtime wiring을 담당하므로 merge 순서에 따라 이 branch의 별도 PR, 보류, 흡수 여부를 결정한다.

## Secret / Migration / Env Check

- Secret check: no secrets added
- Migration/data change: none
- Env change: none committed

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: #200/#204 merge order에 따라 `frontend/src/app/App.jsx` 충돌 또는 중복 UI polish가 생길 수 있다.
