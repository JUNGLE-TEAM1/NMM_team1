# 데이터 통합 Target Step 계획

## 브랜치

- Branch: `feature/data-integration-target-step`
- Workspace: `docs/workflows/feature/data-integration-target-step`
- Created: 2026-06-29

## 선행 조건

- `feature/data-integration-wizard-flow` 완료 또는 사람이 wizard Source/Transform UX를 확인한다.

## 목표

- 사용자가 pipeline 실행 결과로 생성될 target dataset 이름을 설정할 수 있게 한다.
- Source와 Transform 설정 결과가 target 요약으로 이어지게 한다.

## 범위

- 데이터 통합 화면의 Target step만 확장한다.
- `target_name` 입력을 제공한다.
- 입력값이 Target 카드 상태와 Review 준비 상태에 반영된다.
- backend는 현재 pipeline create contract를 유지한다.

## 범위 제외

- 실제 저장소 선택, S3 path 설정, Parquet 설정.
- target schema editor.
- Catalog trust gate 연결.
- Run 실행 구현.
- backend/API/schema 변경.

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
- `frontend/src/api/pipelineApi.js`
- `backend/app/domain/schemas.py`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md

`feature/data-integration-target-step` branch workspace 범위만 구현한다.
데이터 통합 flow의 Target 단계에 결과 dataset 이름 입력을 추가한다.
`target_name` 값은 Target 카드 상태와 Review 준비 상태에 반영한다.
현재 pipeline create contract를 유지하고 저장소/S3/Parquet/target schema editor는 구현하지 않는다.
Run 실행은 후속 Phase로 남긴다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

target name이 비어 있을 때 다음 단계/run 준비 상태가 막히는지 확인한다.
target name 입력 후 flow 상태가 명확히 바뀌는지 확인한다.
기존 pipeline create payload와 필드명이 일치하는지 확인한다.
검증 결과를 `quality.md`와 report에 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] Target step에서 `target_name`을 입력할 수 있다.
- [x] 입력값이 Target 카드와 Review 준비 상태에 반영된다.
- [x] 저장소/S3/Parquet/target schema editor 범위가 추가되지 않았다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
