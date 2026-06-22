# Completion handoff choice details 계획

## 브랜치

- Branch: `feature/completion-handoff-choice-details`
- Workspace: `docs/workflows/feature/completion-handoff-choice-details`
- Created: 2026-06-22

## 목표

- complete + PR-ready 상태에서 AI가 선택지별 절차, 장점, 주의사항을 설명하도록 하네스 규칙을 보강한다.

## 범위

- `docs/08-development-workflow.md`의 완료 후 handoff 선택지 규칙을 보강한다.
- `docs/13-human-command-flow.md`의 완료 branch 응답 예시를 보강한다.
- `docs/10-next-action-menu.md`에 complete + PR-ready 선택지 상세를 추가한다.
- `scripts/status-workflow.sh`의 추천 문구를 선택지별 설명 안내로 바꾼다.
- `scripts/validate-harness.sh`에 선택지 설명 guard를 추가한다.

## 범위 제외

- 실제 PR/merge/deploy/AWS resource 생성.
- 제품 코드 구현.
- 기존 완료 PR의 retroactive 수정.

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

## 완료 기준

- [x] 선택지별 진행 절차가 문서화되어 있다.
- [x] 선택지별 장점과 주의사항이 문서화되어 있다.
- [x] PR만 생성하는 경우와 merge/finalize까지 진행하는 경우가 구분되어 있다.
- [x] 다음 Phase/보류 선택지가 오해되지 않도록 정리되어 있다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
