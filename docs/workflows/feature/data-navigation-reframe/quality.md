# Data navigation reframe 품질 게이트

- TDD status: frontend IA 보정이므로 frontend build와 browser smoke로 확인한다.
- Required checks: frontend build, browser smoke, diff check.
- Regression focus: 기존 `/dataset` 호환과 생성 wizard 진입을 깨지 않는다.
- Execution guard: Jobs/Runs 화면이 실제 실행 완료처럼 보이지 않게 한다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| browser smoke | `http://127.0.0.1:13011/connections` 등 route 직접 확인 | passed | 상위 메뉴 4개, 데이터셋/작업 하위 메뉴, `/dataset` 호환, Runs empty state 확인 |
| derived data smoke | smoke record 3종 생성 후 route 확인 | passed | Connections/Source/Silver/Gold/Silver Jobs/Gold Jobs에 파생 표시 확인 |
| smoke cleanup | SQLite cleanup + API 조회 | passed | `nav_smoke` record 없음 |
| diff check | `git diff --check -- frontend/src/app/App.jsx frontend/src/app/styles.css docs/03-interface-reference.md docs/08-development-workflow.md docs/reports/README.md docs/reports/data-navigation-reframe.md docs/workflows/feature/data-navigation-reframe` | passed | whitespace issue 없음 |
