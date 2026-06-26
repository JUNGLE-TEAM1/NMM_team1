# PR risk warning 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: PR risk warning은 threshold와 risky path 판정이 핵심이므로 focused test로 경계를 고정한다.
- Failing test first: yes
- Expected failure command/result: `node tests/pr-risk-warning.test.js` -> `MODULE_NOT_FOUND` for `../.github/scripts/check-pr-risk`
- Pass command/result: `node tests/pr-risk-warning.test.js` -> passed
- Refactor notes: warning logic은 CommonJS module export와 GitHub Action CLI entrypoint를 함께 제공한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `bash -n scripts/start-workflow.sh scripts/status-workflow.sh scripts/validate-harness.sh scripts/prepare-pr.sh scripts/harness-flow-check.sh` | passed | shell syntax 유지 확인 |
| unit/focused test | `node tests/pr-risk-warning.test.js`; `node tests/pr-linked-issue-check.test.js` | passed | PR risk warning, linked issue check 회귀 확인 |
| integration/contract test | `BASE_SHA=origin/main HEAD_SHA=HEAD node .github/scripts/check-pr-risk.js` | passed | PR risk summary CLI 출력 확인 |
| build/typecheck | n/a | not applicable | 문서/Node script 변경이며 build 대상 없음 |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: local equivalent passed; remote CI는 PR 생성 후 확인 필요
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| deploy/publish | 배포 변경 없음 | n/a |
