# Harness status entrypoints 계획

## 브랜치

- Branch: `docs/harness-status-entrypoints`
- Workspace: `docs/workflows/docs/harness-status-entrypoints`
- Created: 2026-06-28

## 목표

- 하네스 품질 평가에서 드러난 온보딩/현황 파악 약점을 줄이기 위해 현재 상태 확인 entrypoint를 문서화한다.
- 활성 branch/workspace 상태와 historical report 탐색 순서를 분리해 새 작업자가 과거 evidence에 묻히지 않게 한다.

## 범위

- `docs/workflows/README.md`에 현재 하네스 상태를 확인하는 빠른 진입점과 10분 운영 루트를 추가한다.
- `docs/reports/README.md`에 report를 읽는 순서와 active state/evidence의 경계를 추가한다.
- 작업 workspace에 문서 변경 의도와 검증 결과를 기록한다.

## 범위 제외

- workspace 상태를 구조화된 YAML/JSON으로 분리하는 변경.
- `validate-harness.sh`, `test-harness.sh`, `start-workflow.sh` 모듈화.
- Git branch 전환, pull, merge, rebase, push, PR 생성, GitHub issue 생성.
- 제품 기능 코드 또는 CI workflow 동작 변경.

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

- [ ] `docs/workflows/README.md`에 상태 확인 entrypoint가 있다.
- [ ] `docs/reports/README.md`에 evidence reading ladder가 있다.
- [ ] TDD/검증 생략 사유와 harness validation 결과가 `quality.md`에 기록되어 있다.
- [ ] report에 변경 파일, 남은 위험, 다음 문맥이 기록되어 있다.
