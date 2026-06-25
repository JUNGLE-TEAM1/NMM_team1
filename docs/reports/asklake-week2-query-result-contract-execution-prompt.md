# AskLake 2주차 QueryResult 계약 보완 실행 프롬프트 보고서

## Short Report / 짧은 보고

- Type: Docs / Project Context
- Date: 2026-06-25
- Changed: `QueryResult` 계약 누락을 실제로 보완하기 위한 실행 프롬프트를 `docs/project-context/asklake-week2-module-plan/query-result-contract-execution-prompt.md`로 추가하고 project context README에 연결했다.
- Verified: `scripts/validate-harness.sh --strict`
- Remaining: 실제 `docs/03` QueryResult 계약 추가, `contracts/ai_query_result.sample.json`의 `query_result` 추가, workspace/report 보완은 이 실행 프롬프트를 사용한 후속 작업에서 진행한다.
- Next context: 다음 작업자는 `query-result-contract-execution-prompt.md`를 입력으로 실제 QueryResult 계약 보완 작업을 수행한다.
- Risk: 이 문서는 실행 프롬프트이며 실제 계약 보완 자체가 아니다. `QueryResult` 누락은 후속 실행 전까지 열린 리스크로 남는다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read
- Primary context read: 사용자 제공 보완 실행 프롬프트, `docs/project-context/asklake-week2-module-plan/README.md`
- Escalated context read: not needed
- Context omitted intentionally: runtime source, fixture implementation, full Source of Truth audit
