# Source of truth alignment 계획

## 브랜치

- Branch: `docs/source-of-truth-alignment`
- Workspace: `docs/workflows/docs/source-of-truth-alignment`
- Created: 2026-06-22

## 목표

- M3~M5 구현 후 남은 Source of Truth 문서 표현을 현재 코드/하네스 상태와 맞춘다.
- 구현된 범위와 미래 후보가 섞여 보이는 항목을 분리한다.

## 범위

- `docs/01-product-planning.md`의 MVP 범위, 확정/열림 항목 정리.
- `docs/02-architecture.md`의 `PipelineService`/future `PipelineRunner` 경계 정리.
- `docs/03-interface-reference.md`의 milestone 번호와 pipeline endpoint 계약 정리.
- `docs/07-manual-verification-playbook.md`의 MVP 수동 검증 문구를 `select_fields` 구현에 맞춘다.

## 범위 제외

- 제품 runtime code 변경.
- 신규 기능, 신규 API, 신규 하네스 규칙.
- 외부 demo frontend 적용.

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

- not needed. 작은 문서 정합성 branch로 처리한다.

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
