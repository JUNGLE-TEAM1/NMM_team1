# AI query dataset context 품질 게이트

- TDD status: 구현 Phase 시작 시 SQL context/validation 테스트부터 판단한다.
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Manual verification: dataset 선택, 질문 실행, SQL/rows/evidence 표시.
- Regression focus: write SQL, unsupported dataset, empty result가 안전하게 처리되어야 한다.
