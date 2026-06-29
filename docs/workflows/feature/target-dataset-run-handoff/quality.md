# Target dataset run handoff 품질 게이트

- TDD status: 구현 Phase 시작 시 M5 workflow/run API 테스트부터 판단한다.
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Manual verification: run 생성, status 조회, 실패/대기/성공 표시.
- Regression focus: `M5 데모` nav를 되살리지 않는다.
