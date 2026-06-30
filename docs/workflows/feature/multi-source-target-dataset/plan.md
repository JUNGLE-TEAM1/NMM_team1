# Multi-source Target Dataset 계획

## 브랜치

- Branch: `feature/multi-source-target-dataset`
- Workspace: `docs/workflows/feature/multi-source-target-dataset`
- Created: 2026-06-30

## 목표

- Target Dataset draft가 여러 Source Dataset을 입력으로 받을 수 있게 한다.
- Product Health 추천 template 경로에서 `reviews`, `behavior`, `delivery`, `product_master` role을 실제 Source Dataset metadata에 매핑한다.
- M3 `source_id`와 AskLake `source_dataset_id` 연결을 Target Dataset metadata, `process_rule`, `job_definition`에 저장한다.

## 범위

- `TargetDatasetCreate` / `TargetDatasetRecord`에 additive `source_mappings[]` schema를 추가한다.
- `/api/target-datasets` 저장 시 mapping source dataset 존재 여부를 검증한다.
- SQLite metadata store에 `source_mappings_json`을 저장하고 기존 single-source field는 primary/backward-compatible reference로 유지한다.
- Target Dataset wizard Source/Process/Review 화면에서 Product Health source role mapping을 확인/수정할 수 있게 한다.
- `docs/03-interface-reference.md`에 API/schema 변경을 반영하고, Acceptance/Regression/Manual Verification은 기존 guard를 검토한다.
- backend focused tests와 frontend build를 통과시킨다.

## 범위 제외

- M2 runner multi-source 실제 실행
- Silver/Gold preview와 sample row preview
- Catalog 등록 / AI Query 연결
- 자유형 transform builder
- Target Dataset 수정/삭제/복제

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/reports/product-health-processing-template.md`

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

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step N - [STEP_NAME]

#### 목표

- [STEP_GOAL]

#### 범위

- [STEP_SCOPE]

#### 범위 제외

- [STEP_OUT_OF_SCOPE]

#### 구현 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
```

#### 검증 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
```

#### 완료 기준

- [ ] [STEP_COMPLETION_CRITERION]

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
