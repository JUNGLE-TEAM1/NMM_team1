# External connection persistence 품질 게이트

- TDD status: 구현 Phase 시작 시 API contract 테스트부터 판단한다.
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Security check: secret value 저장/노출 금지.
- Manual verification: External Connection 생성, 목록 조회, Source Dataset wizard 후보 반영.
