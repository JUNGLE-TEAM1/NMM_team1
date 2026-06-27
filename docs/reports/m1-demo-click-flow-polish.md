# M1 Demo Click Flow Polish 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-26
- Changed: `/sources -> /runs -> /catalog -> /ask` demo flow CTA, run/catalog/query handoff panels, demo question buttons, mobile handoff layout polish.
- Verified: `cd frontend && npm run build`, route smoke, CTA keyword check, backend AI Query smoke, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: PR push/CI/check 확인, PR merge/finalize/cleanup은 사람 확인 필요.
- Next context: M2/M3/M4 evidence path가 준비되면 Taxi/Kafka status card 또는 dashboard chart 범위를 별도 Phase로 판단한다.
- Risk: browser automated click smoke는 in-app browser control timeout으로 완료하지 못했고, route/CTA/API smoke로 대체했다.

## Phase

- Type: feature
- Branch/work location: `feature/m1-demo-click-flow-polish`, `docs/workflows/feature/m1-demo-click-flow-polish`
- Date: 2026-06-26
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`

## Goal / 목표

- 발표자가 M1 화면에서 Week2 대표 흐름을 끊김 없이 클릭할 수 있게 정리한다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/workflows/feature/m1-demo-click-flow-polish/*`
- `docs/reports/m1-demo-click-flow-polish.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- `/sources`에서 workflow 실행 화면으로 이동하는 CTA를 추가했다.
- run 성공 후 catalog detail과 AI Query로 이동하는 handoff panel을 추가했다.
- catalog 목록/detail에서 AI Query로 이동하는 CTA를 추가했다.
- AI Query 결과에서 run/catalog로 돌아가는 review loop panel을 추가했다.
- demo question 후보 버튼을 추가하되 답변/SQL/evidence 생성은 M6 API가 담당하도록 유지했다.

## Verification Commands / 검증 명령

```bash
cd frontend && npm run build
curl -fsSI http://127.0.0.1:13000/dataset
curl -fsSI http://127.0.0.1:13000/etl
curl -fsSI http://127.0.0.1:13000/catalog/dataset_reviews_gold
curl -fsSI http://127.0.0.1:13000/query
rg -n "Workflow 실행으로 이동|CatalogMetadata 확인으로 이동|AI Query 실행|근거에서 run과 catalog|demoQuestions|Demo question" frontend/src/app/App.jsx frontend/src/app/styles.css
curl -fsS -X POST http://127.0.0.1:18000/api/week2/ai/query -H 'Content-Type: application/json' -d '{"question":"리뷰가 가장 많은 상품 알려줘"}'
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m1-demo-click-flow-polish/quality.md`
- Quality gate status: passed
- TDD status: not applicable; frontend route/CTA polish only
- CI/check result: local equivalent passed; PR CI pending after push
- Skipped checks: browser automated click smoke skipped due in-app browser control timeout
- CD/deploy gate: not required

## Regression Guard / 회귀 보호

- Checked feature: M1 demo click flow
- Protected behavior: polish does not fake success or generate M6 answer in M1.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: 발표용 polish가 fake success처럼 보이는 경우.
- Expected behavior: CTA는 route handoff만 담당하고 success는 backend/M6 response에서만 표시한다.
- Verification: code review, keyword check, AI Query API smoke.
- Result: passed

## Manual Verification / 수동 검증

- Document executed: route/API smoke based on Week 2 manual verification criteria
- Environment: frontend dev `127.0.0.1:13000`, backend compose `127.0.0.1:18000`
- Result: routes returned 200 and AI Query returned `succeeded passed dataset_reviews_gold 1 1`.
- Failure/limitation: in-app browser automation timed out during navigation.
- Evidence: workspace `quality.md`

## Secret / Migration / Env Check

- Secret check: no secrets added
- Migration/data change: none
- Env change: none committed

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: 발표 직전 사람이 열린 13000 화면에서 한 번 직접 클릭 흐름을 확인하는 것이 좋다.
