# M1 UI Shell 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-25
- Changed: `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`, `docs/workflows/feature/m1-ui-shell/*`
- Verified: `npm run build`, forbidden marker scan, browser route smoke, responsive smoke
- Remaining: PR readiness 확인, push, PR 생성
- Next context: M2~M6는 M1 route shell과 `shared-docs.md` 연결 표를 기준으로 실제 기능을 붙인다.
- Risk: 실제 backend/API 연결은 아직 없으며, M1은 pending/empty/error state까지만 검증했다.

---

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m1-ui-shell`, `docs/workflows/feature/m1-ui-shell`
- Date: 2026-06-25
- Workspace state: ready-for-review

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/m1-ui-shell-plan.md`

## Goal / 목표

- demo3 UI reference를 AskLake Week 2 M1 UI Shell로 반영한다.
- demo 발표용 fake 동작과 `XFlow` 흔적을 제거하고, 후속 모듈 연결 surface를 만든다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/workflows/feature/m1-ui-shell/*`

## Implementation Summary / 구현 요약

- `/sources`, `/schema-preview`, `/runs`, `/catalog`, `/ask` route shell을 구성했다.
- `SourceConfig`, `SchemaDefinition`, `WorkflowDefinition`, `CatalogMetadata`, `AIQueryResult` preview surface를 배치했다.
- 실제 기능이 없는 영역은 pending/empty/error 상태로 표시하고, 자동 성공/완료 연출은 넣지 않았다.
- 기존 `getHealth()`와 `StatusPill`만 유지해 backend health 실패를 실제 error state로 보여준다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: browser in-app verification
- Reason: frontend UI route, console error, responsive overflow는 자동 build만으로 확인하기 어렵다.
- Impact: 5개 route와 mobile viewport를 직접 검증했다.
- Not used because: 별도 image/document/presentation skill은 이번 작업 범위와 무관하다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`
- Escalated context read: Week 2 module plan, M1 plan, `docs/03`, `docs/05`, `docs/06`, `docs/07`, relevant `docs/08`
- Context omitted intentionally: 전체 historical report와 무관한 post-MVP 문서

## Baseline Codebase Adoption / 기존 코드베이스 baseline 적용

- Current base commit: `a1c6493`
- Existing run/build/test commands: `frontend/package.json`의 `build`, `dev`, `preview`
- Existing CI/PR/branch policy: `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`
- Existing docs/code mapped: Week 2 route/contract package와 기존 frontend app shell
- Missing or stale docs: 없음. 공유 Source of Truth 변경 없음.
- Infrastructure gaps: frontend lint/unit test script 없음
- Next Phase candidates: M2/M3 source 연결, M5 run/catalog 연결, M6 AI Query 연결
- P0 before first risky implementation feature: 실제 API 연결 전 contract fixture와 error shape 재확인
- Deferred gaps and reason: 실제 backend integration은 M1 범위 밖
- Accepted risk: UI shell 검증은 real data flow 검증이 아니다.
- Gaps intentionally left: source 저장, schema inference, workflow run, catalog persistence, AI query execution
- Next-change adoption plan: 각 모듈이 `shared-docs.md` 연결 표의 route에 실제 state와 API를 붙인다.

## Verification Commands / 검증 명령

```bash
cd frontend && npm install
cd frontend && npm run build
rg -n "window.fetch|__xflowMock|VITE_FRONTEND_ONLY|frontendOnly|mock-session|study@xflow|xflow.frontendOnly|created_from_pipeline_demo" frontend/src
rg -n "XFlow|xflow|xflows|xflow-demo" frontend/src frontend/index.html frontend/package.json
npm run dev -- --host 127.0.0.1
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m1-ui-shell/quality.md`
- Quality gate status: passed-with-skips
- TDD status: skipped with reason
- CI/check result: local build/browser smoke passed, CI pending PR
- Skipped checks: lint/unit test not available in frontend package
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/feature/m1-ui-shell/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: demo3 전체 복사 대신 AskLake shell 재구성, fake demo 동작 제거, backend 미연결은 pending/empty/error 표시
- Revisit/rollback condition: route 복잡도 증가 시 router 도입 재검토

## Regression Guard / 회귀 보호

- Checked feature: Week 2 contract 없이 모듈 구현이 시작되는 경우
- Protected behavior: `contracts/*.sample.json`과 `docs/03` Week 2 contract package를 기준으로 UI surface를 구성한다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: demo fake 동작이 실제 테스트 상태와 섞이는 경우
- Expected behavior: 전역 mock, 자동 로그인, 자동 완료, fake success를 만들지 않는다.
- Verification: forbidden marker scan, browser smoke
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` Target MVP / Modular Contract Baseline 관련 항목
- Environment: local Vite dev server `http://127.0.0.1:5173`
- Result: `/sources`, `/schema-preview`, `/runs`, `/catalog`, `/ask` route 표시 확인. console error 없음. mobile `390x844` overflow 없음.
- Failure/limitation: 실제 M2~M6 backend는 연결 전이므로 pending/empty/error state까지만 확인했다.
- Evidence: `quality.md`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Week 2 contract fixture와 route hardening 기준
- Status: passed for M1 shell
- Evidence: route shell이 `SourceConfig`, `SchemaDefinition`, `WorkflowDefinition`, `CatalogMetadata`, `AIQueryResult` surface를 표시한다.

## Document Updates / 문서 업데이트

- Updated: M1 branch workspace 문서
- Not updated and why: 공유 Source of Truth는 기존 contract를 바꾸지 않아 수정하지 않았다.

## Failed / Incomplete / Follow-Up TODO

- M2/M3/M4/M5/M6 실제 기능 연결은 후속 Phase 범위다.
- PR 생성 후 CI 확인과 merge/finalize/cleanup은 사람 확인이 필요하다.

## Context For Next Phase / 다음 Phase 문맥

- M3는 `/sources`, `/schema-preview`에 source 저장, sample reader, schema inference/override를 붙인다.
- M5는 `/runs`, `/catalog`에 workflow execution result, logs, retry, catalog metadata를 붙인다.
- M6는 `/ask`에 dataset allowlist, query result, evidence, chart spec을 붙인다.

## Secret / Migration / Env Check

- Secret check: 새 secret 없음
- Migration/data change: 없음
- Env change: frontend `npm install`로 local `node_modules` 설치

## Final Judgment / 최종 판단

- Done: M1 UI Shell 구현과 로컬 검증 완료
- Remaining risk: 실제 backend integration 전까지는 UI shell 검증에 한정된다.
