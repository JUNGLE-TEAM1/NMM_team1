# Week2 implementation transition 계획

## 브랜치

- Branch: `docs/week2-implementation-transition`
- Workspace: `docs/workflows/docs/week2-implementation-transition`
- Created: 2026-06-25

## 목표

- ver2 책임 분리를 기존 main 구현 위에 안전하게 얹기 위한 implementation transition plan을 작성한다.
- 기존 구현을 폐기하지 않고 M5 workflow/catalog를 중심 anchor로 유지한다.
- Phase 3~6이 결정해야 할 main E2E path, M3 JSON path, runner boundary의 입력을 준비한다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md` 생성
- `ver2/README.md` 읽는 순서와 Phase 2 링크 업데이트
- workspace evidence 작성
- 문서/하네스 검증

## 범위 제외

- runtime code 변경
- `docs/03-interface-reference.md`, `contracts/*.sample.json` 변경
- M3 PR #105 코드 회수 결정
- M2 SparkRunner 또는 M5 runner boundary 구현

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/original-vs-revised-flow.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

Week2 ver2 implementation transition plan을 작성한다.
기존 구현을 rewrite하지 않고, M5 `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore`를 중심 통합점으로 유지하는 전환 계획을 문서화한다.
M3 transformation spec/job logic, M2 SparkRunner, M6 Catalog source 전환은 후속 Phase 결정으로 남긴다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
전환 계획에 `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore`, `SparkRunner`, `TransformSpec`, `M5 Catalog`가 언급되는지 확인한다.
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

- [ ] 기존 구현 중 유지할 anchor가 명시되어 있다.
- [ ] ver2가 rewrite 계획이 아님을 명시한다.
- [ ] adapter-first 전환 순서가 명시되어 있다.
- [ ] 다음 Phase인 main E2E path 확정의 입력이 준비되어 있다.
- [ ] 검증 결과를 `quality.md`와 `report.md`에 기록한다.
