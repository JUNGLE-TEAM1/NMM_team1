# Structure refactor 계획

## 브랜치

- Branch: `feature/structure-refactor`
- Workspace: `docs/workflows/feature/structure-refactor`
- Created: 2026-06-22

## 목표

- M6~M8 확장과 외부 데모 프론트 흡수를 쉽게 하기 위해 현재 MVP frontend/backend 구조를 얇게 리팩토링한다.
- 동작과 API contract는 유지하고, 상태 orchestration과 transform 책임을 분리한다.

## 범위

- frontend API client를 shared HTTP client와 resource별 client로 분리한다.
- catalog source form/list/detail orchestration을 `useCatalog` hook과 작은 component로 분리한다.
- pipeline run orchestration을 `usePipelineRun` hook으로 분리한다.
- demo default name 생성 로직을 shared helper로 분리한다.
- backend select transform을 `domain/transforms.py`로 이동한다.
- `docs/02-architecture.md`의 frontend layering 설명을 현재 구조에 맞춘다.

## 범위 제외

- UI redesign 또는 외부 데모 frontend 적용.
- 신규 source connector, 신규 transform, run history 기능.
- SQLiteMetadataStore 대규모 repository 분해.
- 실제 AWS/EKS deploy.

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

- not needed. 작은 구조 리팩토링 branch로 처리한다.

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
