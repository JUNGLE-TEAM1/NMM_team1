# 데이터 통합 Review & Run Step 계획

## 브랜치

- Branch: `feature/data-integration-review-run-step`
- Workspace: `docs/workflows/feature/data-integration-review-run-step`
- Created: 2026-06-29

## 선행 조건

- 상태: Superseded.
- `Dataset Creation UX Reframe Queue`의 `feature/target-dataset-scheduling-review`로 대체한다.
- 이 workspace는 삭제하지 않고 이전 generic pipeline 실행 시나리오 기록으로 보존한다.

## 목표

- 이전 목표: Source, Transform, Target 설정을 한 번에 검토하고 기존 pipeline create/run API로 실행할 수 있게 한다.
- 현재 결정: 데모의 주 흐름은 generic pipeline 실행이 아니라 Source Dataset / Target Dataset 생성으로 재설계한다.

## 범위

- 이 workspace에서는 추가 구현을 진행하지 않는다.
- 후속 구현은 `feature/target-dataset-scheduling-review` plan을 따른다.

## 범위 제외

- 이 workspace를 삭제하거나 기존 prototype evidence를 되돌리는 작업.
- generic pipeline create/run API를 데모 주 흐름에 추가하는 작업.
- Target Dataset 생성 wizard 후반부 구현.

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
- `frontend/src/features/pipeline/usePipelineRun.js`
- `backend/app/api/pipelines.py`
- `backend/app/services/pipeline.py`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md

이 workspace는 superseded 상태이므로 구현하지 않는다.
Target Dataset 생성 후반부가 필요하면 `feature/target-dataset-scheduling-review` branch workspace를 따른다.
이전 generic pipeline Review & Run 시나리오는 prototype evidence로만 보존한다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

구현 대상이 아니므로 새 UI/API 검증을 실행하지 않는다.
`docs/08-development-workflow.md`에서 이 Phase가 superseded로 표시되고, 대체 Phase가 `feature/target-dataset-scheduling-review`로 안내되는지 확인한다.
검증 결과를 `quality.md`와 report에 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [ ] 이 workspace가 superseded 상태로 표시된다.
- [ ] 대체 Phase가 `feature/target-dataset-scheduling-review`로 명시된다.
- [ ] 새 구현을 진행하지 않는다.
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
