# Target dataset job draft 품질 게이트

- TDD status: 구현 Phase 시작 시 draft persistence contract 테스트부터 판단한다.
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Manual verification: source 선택, process 설정, schedule 설정, draft 저장.
- Regression focus: Review에서 실행 완료처럼 보이면 안 된다.
