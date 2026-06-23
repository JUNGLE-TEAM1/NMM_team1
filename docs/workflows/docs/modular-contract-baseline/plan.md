# Modular Contract Baseline 계획

## 브랜치

- Branch: `docs/modular-contract-baseline`
- Workspace: `docs/workflows/docs/modular-contract-baseline`
- Created: 2026-06-24

## 목표

- Target MVP를 병렬 workstream으로 실행할 수 있게 shared contract, module ownership, mock/fake boundary, integration spine을 확정한다.
- 기존 R1~R7은 삭제하지 않고 workstream alias로 보존한다.
- 실제 runtime 구현 없이 Source of Truth와 `.milestones/target-mvp/manifest.yaml` 초안을 정렬한다.

## 범위

- `docs/01`, `docs/03`, `docs/05~08`의 R0.5 / Workstream Pool / Integration Spine 문맥 정렬.
- `.milestones/target-mvp/manifest.yaml`, `status.yaml`, `decisions.md` 초안 생성.
- R0.5 report와 workspace evidence 기록.
- local harness validation 실행.

## 범위 제외

- backend/frontend runtime code 구현.
- 실제 병렬 worktree/thread/branch 생성.
- Trino, 외부 LLM, Kubernetes cloud deploy 필수화.
- 모든 endpoint와 DB migration 상세 확정.

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
