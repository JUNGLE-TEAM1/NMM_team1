# Cross-platform tooling 계획

## 브랜치

- Branch: `chore/cross-platform-tooling`
- Workspace: `docs/workflows/chore/cross-platform-tooling`
- Created: 2026-06-24

## 목표

- WSL2에서 `scripts/*.sh` direct execution을 막는 line ending/tooling 문제를 repo 차원에서 줄인다.
- `scripts/validate-harness.sh`, `scripts/status-workflow.sh`, `scripts/test-harness.sh`가 usable `rg` 없이도 동작하도록 fallback을 추가한다.
- `scripts/smoke-container-app.sh`가 WSL2 + Docker Desktop integration에서 buildx/credential helper 오류를 만나도 local-only fallback으로 smoke를 계속 시도하게 만든다.
- 실제 WSL2 재검증 결과와 남은 host prerequisite를 evidence로 남긴다.

## 범위

- `.gitattributes`로 `*.sh` LF checkout을 강제한다.
- harness/status/test script에 Python 기반 `rg` fallback을 추가한다.
- smoke script에 Python launcher fallback과 Docker buildx/credential helper fallback을 추가한다.
- WSL worktree metadata mismatch를 더 쉽게 진단할 수 있도록 `start-workflow.sh` 오류 메시지를 보강한다.
- `docs/04-development-guide.md`, `docs/07-manual-verification-playbook.md`, `docs/manual-verification/00-environment-setup.md`, `docs/08-development-workflow.md`를 실제 WSL2 운영 기준에 맞게 갱신한다.
- `docs/reports/windows-wsl2-smoke-execution.md`를 최신 evidence로 작성하고 `docs/reports/README.md` index를 갱신한다.
- 현재 workspace 증거를 완료 상태로 기록한다.

## 범위 제외

- 제품 기능 구현 또는 API/schema 변경
- host 전역 `node`, `rg`, Docker plugin 설치
- native Windows PowerShell/CMD 동등 실행 지원
- push, PR 생성, merge, 외부 리소스 변경

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
