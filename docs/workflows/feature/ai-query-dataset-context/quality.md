# AI query dataset context 품질 게이트

- TDD status: 구현 Phase 시작 시 SQL context/validation 테스트부터 판단한다.
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Manual verification: dataset 선택, 질문 실행, SQL/rows/evidence 표시.
- Regression focus: write SQL, unsupported dataset, empty result가 안전하게 처리되어야 한다.

## TDD Plan / TDD 계획

- Applies: TBD when implementation starts
- Reason: planning workspace; implementation not started
- Failing test first: not applicable yet
- Expected failure command/result: not applicable yet
- Pass command/result: not applicable yet
- Refactor notes: none

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| harness validation | `scripts/validate-harness.sh` | pending | implementation not started |

## CI/CD Gate / CI-CD 게이트

- CI required: yes for implementation PR
- CI result: pending
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: not applicable yet

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| implementation tests | planning workspace only | n/a |
