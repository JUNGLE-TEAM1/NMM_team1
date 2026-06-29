# Runtime evidence integration 품질 게이트

- TDD status: 구현 Phase 시작 시 `ExecutionResult` contract 테스트부터 판단한다.
- Required checks: backend focused tests, runner smoke, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Manual verification: run detail에서 M2/M4 evidence summary 확인.
- Regression focus: evidence 실패를 성공처럼 표시하지 않는다.
