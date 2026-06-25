# AskLake 2주차 QueryResult 계약 보완 프롬프트 보고서

## Short Report / 짧은 보고

- Type: Docs / Project Context
- Date: 2026-06-25
- Changed: `SqlEngineAdapter.execute()` 반환 shape와 `AIQueryResult` fixture를 정렬하기 위한 보완 프롬프트를 `docs/project-context/asklake-week2-module-plan/query-result-contract-prompt.md`로 추가하고 project context README에 연결했다.
- Verified: `scripts/validate-harness.sh --strict`
- Remaining: 실제 `docs/03` QueryResult 섹션 보완과 `contracts/ai_query_result.sample.json`의 `query_result` 추가는 별도 보완 작업에서 진행한다.
- Next context: 다음 작업자는 `query-result-contract-prompt.md`를 입력으로 기존 Week 2 contract setup Phase를 보완하거나 작은 follow-up Phase를 진행한다.
- Risk: 이 문서는 실행 프롬프트이며 `QueryResult` 계약 자체가 아니다. 실제 계약 보완 전까지 M6 구현은 시작하지 않는 편이 안전하다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: `docs/project-context/asklake-week2-module-plan/README.md`, 이전 검수 결과, 사용자 제공 보완 프롬프트
- Escalated context read: not needed
- Context omitted intentionally: runtime source, fixture implementation, full Source of Truth audit
