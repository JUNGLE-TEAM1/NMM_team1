# AskLake 2주차 공통 계약 설정 프롬프트 보고서

## Short Report / 짧은 보고

- Type: Docs / Project Context
- Date: 2026-06-25
- Changed: AskLake 2주차 구현 전 공통 계약 설정 Phase를 시작하기 위한 프롬프트를 `docs/project-context/asklake-week2-module-plan/contract-setup-prompt.md`로 추가하고, project context README의 읽는 순서와 등록 목록에 연결했다.
- Verified: `scripts/validate-harness.sh --strict`
- Remaining: 실제 `contracts/*.sample.json` 생성과 Source of Truth 반영 여부 판단은 별도 공통 계약 설정 Phase에서 진행한다.
- Next context: 다음 작업자는 `contract-setup-prompt.md`를 입력으로 `docs/asklake-week2-contract-setup` 또는 `feature/asklake-week2-contract-setup` Phase를 시작한다.
- Risk: 이 문서는 실행 프롬프트이며 구현 계약 자체가 아니다. 세부 path, row count, fixture 필드 값은 공통 계약 설정 Phase 전까지 임의 확정하지 않는다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `docs/project-context/README.md`, `docs/project-context/asklake-week2-module-plan/README.md`, `docs/project-context/asklake-week2-module-plan/decisions.md`, `docs/project-context/asklake-week2-module-plan/plan.md`
- Escalated context read: `docs/03-interface-reference.md`, `docs/08-development-workflow.md`, `docs/reports/_template.md`
- Context omitted intentionally: runtime source, contract fixture implementation, full report history
