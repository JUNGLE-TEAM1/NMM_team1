# Week2 data path scope clarity 계획

## 브랜치

- Branch: `docs/week2-data-path-scope-clarity`
- Workspace: `docs/workflows/docs/week2-data-path-scope-clarity`
- Created: 2026-06-26

## 목표

- Week2 ver2 문서에서 분석 대표 경로와 세 데이터 처리/evidence 경로의 관계를 명확히 한다.
- Amazon Reviews JSON은 AI Query/분석 대표 경로로 고정하되, Taxi Batch와 Kafka Event도 필수 처리/evidence 경로임을 명시한다.
- 정형/반정형/이벤트 통합 분석을 위한 synthetic companion dataset 설계는 후속 리서치로 분리한다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/m3-json-main-path-decision.md`
- branch workspace evidence와 Phase report 작성

## 범위 제외

- runtime code 변경
- `docs/03-interface-reference.md`, `contracts/*.sample.json` 변경
- synthetic companion dataset 실제 생성
- Taxi/Kafka를 M6 분석 필수 연결로 승격

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

- [x] 문서만 읽어도 "세 데이터 경로는 모두 구현, 분석 대표 경로는 Amazon Reviews" 기준이 분명하다.
- [x] Taxi/Kafka가 선택 사항으로 오해되지 않는다.
- [x] M6 분석 연결은 Amazon Reviews에 우선 고정된다는 점이 분명하다.
- [x] multi-dataset synthetic analysis는 후속 리서치로 분리되어 있다.
- [x] 검증 결과를 `quality.md`와 `report.md`에 기록한다.
