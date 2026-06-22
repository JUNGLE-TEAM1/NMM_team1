# Internal step prompt standard 계획

## 브랜치

- Branch: `feature/internal-step-prompt-standard`
- Workspace: `docs/workflows/feature/internal-step-prompt-standard`
- Created: 2026-06-22

## 목표

- 큰 Phase를 내부 단계로 나눌 때 Step별 구현/검증 프롬프트와 완료 기준을 저장하는 표준 양식을 하네스에 추가한다.

## 범위

- `docs/08-development-workflow.md`에 내부 단계별 프롬프트 규칙과 양식을 추가한다.
- `docs/workflows/README.md`에 workspace 파일 역할을 보강한다.
- `scripts/start-workflow.sh`의 새 workspace `plan.md` 템플릿에 `## 내부 단계별 프롬프트` 선택 섹션을 추가한다.
- `scripts/validate-harness.sh`에 Step 구조 guard를 추가한다.
- 현재 workspace 기록과 검증 결과를 업데이트한다.

## 범위 제외

- M2 제품 코드 구현.
- 기존 완료 workspace의 plan 구조 일괄 마이그레이션.
- Step별 독립 branch 분리 정책 변경.

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

- [x] 내부 단계별 프롬프트 저장 규칙이 문서화되어 있다.
- [x] 새 workspace `plan.md` 템플릿에 `## 내부 단계별 프롬프트` 선택 섹션이 있다.
- [x] 작은 Phase는 내부 단계 섹션을 쓰지 않아도 validation이 실패하지 않는다.
- [x] `### Step`을 쓰는 workspace는 구현/검증/완료 기준 구조를 갖도록 validation이 검사한다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
