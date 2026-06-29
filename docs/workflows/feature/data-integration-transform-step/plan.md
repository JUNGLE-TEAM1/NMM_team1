# 데이터 통합 Transform Step 계획

## 브랜치

- Branch: `feature/data-integration-transform-step`
- Workspace: `docs/workflows/feature/data-integration-transform-step`
- Created: 2026-06-29

## 선행 조건

- `feature/data-integration-source-type-picker`에서 Source type picker와 dataset card 선택 UX를 확인했다.

## 목표

- 선택한 source의 컬럼 중 결과 dataset에 남길 컬럼을 고르는 UX를 만든다.
- 현재 AskLake backend 모델의 `select_fields`에 맞는 최소 transform만 다룬다.

## 범위

- 데이터 통합 화면의 Transform step만 확장한다.
- source schema가 있으면 컬럼 체크박스 또는 간단한 multi-select로 표시한다.
- 선택 결과가 Transform 카드 상태에 반영된다.
- Transform label은 `Select Fields`로 명확히 표현한다.

## 범위 제외

- Filter, Join, Aggregate, Cast 같은 추가 transform.
- XFlow full transform palette.
- backend transform schema 확장.
- Target 설정 구현.
- Run 실행 연결.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/01-product-planning.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `frontend/src/features/pipeline/usePipelineRun.js`
- `backend/app/domain/schemas.py`
- `backend/app/domain/transforms.py`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md

`feature/data-integration-transform-step` branch workspace 범위만 구현한다.
데이터 통합 flow의 Transform 단계에 `Select Fields` 설정을 추가한다.
선택된 source schema를 기준으로 컬럼 체크박스 또는 간단한 multi-select를 제공한다.
선택 결과는 Transform 카드 상태에 요약한다.
backend contract는 현재 `select_fields` 모델을 유지하고, 추가 transform은 구현하지 않는다.
Target과 Run 동작은 후속 Phase로 남긴다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

source 선택 전에는 Transform 설정이 비활성 또는 안내 상태인지 확인한다.
컬럼 선택 후 선택 수/컬럼명이 요약되는지 확인한다.
기존 pipeline API의 `select_fields`와 충돌하지 않는지 확인한다.
검증 결과를 `quality.md`와 report에 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] Transform step에서 `Select Fields`만 설정할 수 있다.
- [x] source schema 기반 컬럼 선택 UI가 있다.
- [x] 선택 결과가 Transform 카드에 반영된다.
- [x] 추가 transform과 backend schema 확장이 없다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
