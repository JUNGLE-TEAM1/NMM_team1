# M1 product health demo CTA 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: no
- Reason: backend planner/API/contract는 바꾸지 않고 M1 `/query` 화면의 demo CTA 구성만 변경했다. 기존 query 실행 흐름은 `submitQuery(question)` 그대로 재사용했다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: `cd frontend && npm run build` 통과
- Refactor notes: 기존 flat `demoQuestions`를 `demoQuestionGroups`로 바꿔 Product Health SQL intents, unsupported guardrail, legacy reviews path를 분리했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not run | skipped | 별도 lint script를 확인하지 않았고 build/smoke로 대체했다. |
| unit/focused test | not run | skipped | UI-only CTA 변경이며 기존 focused UI test harness가 없어 browser smoke로 대체했다. |
| integration/contract test | browser smoke `/query?smoke=product-health-cta` | passed | CTA 클릭 후 unsupported route/blocked 표시를 확인했다. |
| build/typecheck | `cd frontend && npm run build` | passed | Vite build 통과, 최종 asset `index-Bw9K6oKL.js`. |
| CTA keyword scan | `rg -n "demoQuestionGroups|top_risk|top_negative_review|low_conversion|top_late_delivery|top_rating|unsupported|demo-question-groups|demo-question-group|Product Health SQL intents|Unsupported guardrail|Legacy reviews path" frontend/src/app/App.jsx frontend/src/app/styles.css` | passed | Product Health CTA 그룹과 intent label이 기대 위치에 존재한다. |
| docker browser smoke | `docker compose -p asklake_m1_product_health_cta up -d backend frontend`; browser `/query?smoke=product-health-cta` | passed | Product Health SQL intents 5개, unsupported 1개, legacy 3개 표시. unsupported CTA 클릭 후 textarea 반영, `route=unsupported`, blocked SQL message, console error 없음. |
| diff whitespace | `git diff --check` | passed | whitespace error 없음. |
| harness validation | `scripts/validate-harness.sh --strict` | passed | strict 실행에 포함되어 `Harness validation passed.` 확인. |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR 생성 후 GitHub checks 확인
- CI result: pending until PR creation
- Deploy/publish required: no
- Deployment confirmation: local docker compose smoke only
- Rollback/smoke notes: 변경은 M1 UI CTA 표시 추가에 한정된다. rollback은 `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`의 `demoQuestionGroups`와 관련 CSS를 이전 flat button list로 되돌린다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| lint | 별도 lint command를 이번 Phase에서 실행하지 않았다. `npm run build`, browser smoke, strict harness로 대체했다. | AI 기록 |
| unit/focused test | UI-only CTA 변경이며 기존 focused UI test가 없어 browser smoke로 대체했다. | AI 기록 |
