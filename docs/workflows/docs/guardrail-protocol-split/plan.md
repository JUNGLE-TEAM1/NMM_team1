# Guardrail protocol split 계획

## 브랜치

- Branch: `docs/guardrail-protocol-split`
- Workspace: `docs/workflows/docs/guardrail-protocol-split`
- Created: 2026-06-26

## 목표

- 현재 하네스에 섞여 있는 강제 룰과 협업 프로토콜을 분리한다.
- 강제 가능한 안전장치는 GitHub/CI/platform이 책임지는 `System Guardrails`로 분리한다.
- 하네스 문서는 AI와 사람이 작업 상태, 판단 근거, 검증 결과, 복구 경로를 공유하는 `Harness Protocol` 중심으로 정리한다.

## 범위

- `docs/system-guardrails.md` 신설 계획과 실제 문서 추가.
- 현재 하네스 규칙을 `System Guardrails`와 `Harness Protocol`로 분류.
- `AGENTS.md`의 작업 규칙 최소화 검토.
- `docs/00-layer-map.md`에 system guardrails 문서 위치 반영 검토.
- `docs/04-development-guide.md` 운영 규칙 정리 검토.
- `docs/11-git-sync-policy.md`의 Git/PR 강제 룰 정리 검토.
- `docs/12-quality-gates.md`의 CI/CD 강제 룰과 기록 프로토콜 분리 검토.
- branch start issue 생성, PR linked issue 필수, GitHub Project status sync 흐름을 시스템 가드레일과 하네스 프로토콜로 분리.
- 필요 시 `docs/09-collaboration-agreement.md`, `docs/10-next-action-menu.md`, `docs/13-human-command-flow.md` 표현 정렬.

## 범위 제외

- 실제 GitHub branch protection 설정 변경.
- repository settings 변경.
- secret scanning/push protection 직접 활성화.
- GitHub Environment reviewer 설정 변경.
- CODEOWNERS enforcement 설정 변경.
- production/deploy/cloud resource 변경.
- 기능 구현 또는 런타임 코드 변경.
- 새 GitHub Action 또는 bot 구현.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/08-development-workflow.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/04-development-guide.md @docs/08-development-workflow.md @docs/11-git-sync-policy.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md

하네스 문서 구조를 정리한다.
현재 하네스에 섞여 있는 강제 룰과 협업 프로토콜을 분리한다.
강제 가능한 안전장치는 GitHub/CI/platform이 책임지는 System Guardrails로 분리하고, 하네스 문서는 작업 상태, 판단 근거, 검증 결과, 복구 경로를 공유하는 Harness Protocol 중심으로 정리한다.

`docs/system-guardrails.md`를 추가하고, 시스템이 맡아야 할 항목은 기존 문서에서 반복 강제하지 않고 새 문서를 참조하도록 정리한다.
branch start issue 생성은 local branch creation을 GitHub가 직접 알 수 없다는 한계를 반영해 `scripts/start-workflow.sh` 책임과 optional branch-push automation 후보로 분리한다.
PR linked issue 필수, PR closing keyword, issue/Project status sync, lifecycle drift detection은 GitHub Actions/Project automation/required check 후보로 `docs/system-guardrails.md`에 기록한다.
실제 GitHub/repository settings, deploy/cloud resource, production-impacting 설정은 변경하지 않는다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

1. Inventory: 현재 강제 룰과 협업 프로토콜 후보를 분류한다.
2. Split: `docs/system-guardrails.md`를 추가하고 기존 문서의 참조 구조를 정리한다.
3. Lifecycle: branch start issue, PR linked issue, Project status sync 책임을 system/script/harness로 분리한다.
4. Verify: harness validation과 키워드 검색으로 중복/드리프트를 확인한다.

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

- [x] branch workspace가 생성되어 있다.
- [x] `docs/system-guardrails.md`가 추가되어 있다.
- [x] 기존 하네스 문서의 강제 룰과 협업 프로토콜이 분리되어 있다.
- [x] 시스템이 맡아야 할 항목은 하네스 문서에서 반복 강제하지 않고 `docs/system-guardrails.md`를 참조한다.
- [x] branch start issue 생성, PR linked issue 필수, Project status sync 흐름의 책임 위치가 분리되어 있다.
- [x] 실제 시스템 설정이 필요한 항목은 follow-up 상태로 기록되어 있다.
- [x] 하네스 문서는 Phase 진행, 기록, 검증, 복구 흐름을 설명한다.
- [x] 실제 GitHub/repository settings는 변경하지 않았다.
- [x] TDD/skip 상태 기록.
- [x] Acceptance 확인.
- [x] Regression/failure scenario 확인.
- [x] Manual verification 기록.
- [x] CI/check 명령과 결과 기록.
- [x] Report 업데이트.

완료 전 남은 작업:

- [ ] Completion Confirm 기록.
- [ ] Pre-Merge Sync 결과 또는 deferral reason 기록.
- [ ] PR-ready 여부 결정.
