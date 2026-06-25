# M1 UI Shell 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: no
- Reason: M1은 shared contract나 core logic 구현이 아니라 기존 React entry UI shell 교체와 route surface 구성이다. 자동 test harness가 아직 frontend UI route별로 준비되어 있지 않아 build와 browser smoke로 검증한다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: `npm run build` 통과, browser smoke 통과
- Refactor notes: 사용하지 않는 icon import와 table cell key를 정리했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not available | skipped | `frontend/package.json`에 lint script 없음 |
| unit/focused test | not available | skipped | frontend test script 없음 |
| integration/contract test | `rg -n "window.fetch\|__xflowMock\|VITE_FRONTEND_ONLY\|frontendOnly\|mock-session\|study@xflow\|xflow.frontendOnly\|created_from_pipeline_demo" frontend/src` | passed | 금지된 demo fake marker 없음 |
| integration/contract test | `rg -n "XFlow\|xflow\|xflows\|xflow-demo" frontend/src frontend/index.html frontend/package.json` | passed | frontend에 XFlow branding/storage marker 없음 |
| build/typecheck | `cd frontend && npm run build` | passed | Vite production build 성공 |
| browser smoke | in-app browser, `http://127.0.0.1:5173/{sources,schema-preview,runs,catalog,ask}` | passed | 각 route expected text 확인, console error 없음 |
| visual smoke | in-app browser, demo3-style shell | passed | AskLake logo image, 전체 demo nav, 데이터셋/파이프라인 테이블, AI 도우미 패널 확인 |
| responsive smoke | in-app browser viewport `390x844`, `/runs` | passed | expected text 표시, horizontal overflow 없음 |
| harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | `Harness validation passed.` |

## CI/CD Gate / CI-CD 게이트

- CI required: PR 생성 후 GitHub checks 확인
- CI result: not run locally
- Deploy/publish required: no
- Deployment confirmation: 배포 없음
- Rollback/smoke notes: dev server로 browser smoke 수행

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| TDD failing test first | UI shell 적용 작업이며 기존 frontend test harness가 없다. build/browser smoke로 대체한다. | workspace 기록 |
| backend API integration test | M1 범위 밖이며 실제 M2~M6 backend가 아직 연결되지 않았다. | workspace 기록 |
