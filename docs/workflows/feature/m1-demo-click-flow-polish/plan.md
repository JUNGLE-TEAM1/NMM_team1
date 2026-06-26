# M1 Demo Click Flow Polish 계획

## 브랜치

- Branch: `feature/m1-demo-click-flow-polish`
- Workspace: `docs/workflows/feature/m1-demo-click-flow-polish`
- Created: 2026-06-27

## 목표

- 발표자가 M1 화면에서 Week2 대표 흐름을 끊김 없이 클릭할 수 있게 `/sources -> /runs -> /catalog -> /ask` CTA를 정리한다.

## 범위

- `/sources`에서 workflow 실행 화면으로 이동하는 CTA 추가.
- run 성공 후 catalog detail과 AI Query로 이동하는 CTA 추가.
- catalog 목록/detail에서 AI Query로 이동하는 CTA 추가.
- AI Query 결과에서 run/catalog로 돌아가는 CTA 추가.
- demo question 후보 버튼 추가. 답변 생성은 M6 API만 사용한다.
- route 응답, frontend build, CTA keyword, backend AI Query smoke 검증.

## 범위 제외

- 새로운 backend API 추가.
- 실제 auth/RBAC 구현.
- chart library 기반 시각화 완성.
- M2/M3/M4 데이터 처리 로직 보완.
- 다른 팀원 PR 수정.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m1-live-ui-phase-plan.md`
- `docs/03-interface-reference.md`

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
