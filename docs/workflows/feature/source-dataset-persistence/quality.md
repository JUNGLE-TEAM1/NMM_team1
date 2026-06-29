# Source dataset persistence 품질 게이트

- TDD status: 구현 Phase 시작 시 API contract 테스트부터 판단한다.
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Manual verification: connection 선택, raw scope 설정, Source Dataset 저장/조회.
- Regression focus: 이미 등록된 Source Dataset을 다시 source로 등록하는 오해가 없어야 한다.
