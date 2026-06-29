# External connection persistence 품질 게이트

- Quality gate status: deferred

- TDD status: 구현 Phase 시작 시 API contract 테스트부터 판단한다.
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Security check: secret value 저장/노출 금지.
- Manual verification: External Connection 생성, 목록 조회, Source Dataset wizard 후보 반영.
- Current check: contract alignment only. Code/API tests are deferred until minimal persistence/API shape is selected.
- Regression focus: External Connection을 기존 `SourceConnection` / `SourceConfig.connection_ref`와 무관한 새 schema로 invent하지 않는다.

## TDD Plan / TDD 계획

- Applies: TBD when implementation starts
- Reason: planning/contract alignment workspace; implementation not started
- Failing test first: not applicable yet
- Expected failure command/result: not applicable yet
- Pass command/result: not applicable yet
- Refactor notes: none

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| diff check | `git diff --check` | passed | conflict resolution whitespace check |
| harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |
| harness regression | `scripts/test-harness.sh` | passed | Harness regression tests passed: 31 |

## CI/CD Gate / CI-CD 게이트

- CI required: yes for implementation PR
- CI result: local quality gates passed before PR update
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: not applicable yet

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| implementation tests | contract alignment only | n/a |
