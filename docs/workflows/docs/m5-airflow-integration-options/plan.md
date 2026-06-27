# M5 Airflow integration option guide 계획

## 브랜치

- Branch: `docs/m5-airflow-integration-options`
- Workspace: `docs/workflows/docs/m5-airflow-integration-options`
- Created: 2026-06-26

## 목표

- M5 실제 Airflow 연결 전에 정해야 하는 실행 방식, DAG 위치, 결과 전달, shared storage, fallback, polling, 인증 선택지를 문서화한다.
- 지금 프로젝트 상황에서 추천할 선택지를 명확히 남긴다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/` 아래에 Airflow 연결 선택지 문서를 추가한다.
- `ver2/README.md` 읽는 순서에 새 문서를 연결한다.
- 이번 문서 작업의 검증/보고 workspace evidence를 남긴다.

## 범위 제외

- 실제 Airflow compose, DAG, adapter code 변경은 하지 않는다.
- PR 생성/merge/finalize/branch cleanup은 하지 않는다.
- 기존 untracked 학습 가이드 파일은 건드리지 않는다.

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
