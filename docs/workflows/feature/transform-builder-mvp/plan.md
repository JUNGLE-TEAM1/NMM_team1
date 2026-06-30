# Transform Builder MVP 계획

## 브랜치

- Branch: `feature/transform-builder-mvp`
- Workspace: `docs/workflows/feature/transform-builder-mvp`
- Created: 2026-06-30

## 목표

- Target Dataset Processing 화면을 Product Health Transform Builder MVP로 바꿔 사용자가 M3 추천 규칙을 읽고 저장할 수 있게 한다.
- M3 TransformSpec/Gold Contract를 기반으로 Source role mapping과 내부 처리 단계 요약을 표시하고 `process_rule.builder_config`에 저장한다.

## 범위

- `frontend/src/app/App.jsx`의 Product Health 추천 template Process 화면 개선.
- role별 Source mapping과 내부 normalize/aggregate/join/derive/load 검토 UI 추가.
- aggregate metric, join key, `risk_score`, Gold schema는 review-only/locked로 표시.
- Target Dataset 저장 payload에 수정된 `steps[]`와 `builder_config` 포함.
- 변경된 metadata shape를 `docs/03`, `docs/05`, `docs/07`에 최소 반영.

## 범위 제외

- M2 runner 실행 연결.
- Spark/Data Lake bronze/silver/gold 실제 실행.
- Silver/Gold sample rows preview.
- Catalog 등록, AI Query 연결.
- 자유형 transform DSL editor.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `contracts/product_health_transform_spec.sample.json`
- `contracts/product_health_gold_contract.sample.json`

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

- Step 1: 현재 Product Health Processing Template UI와 저장 payload 확인.
- Step 2: Transform Builder MVP UI와 `process_rule.builder_config` 저장 구조 구현.
- Step 3: Source of Truth 최소 문서와 evidence 업데이트.
- Step 4: frontend build, backend focused tests, harness validation으로 검증.

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
