# Local Tool Runtime Readiness 계획

## 브랜치

- Branch: `docs/local-tool-runtime-readiness`
- Workspace: `docs/workflows/docs/local-tool-runtime-readiness`
- Created: 2026-06-24

## 목표

- local validation에 필요한 tool/runtime이 설치되어 있으나 꺼져 있을 때 AI가 먼저 readiness check와 safe start를 시도하도록 하네스 규칙을 보강한다.
- 설치, 권한 상승, 라이선스, 비용/외부 리소스 생성은 사람 확인 대상임을 명확히 한다.

## 범위

- `docs/04-development-guide.md`에 Local Tool/Runtime Readiness 절차 추가.
- `docs/12-quality-gates.md`에 readiness evidence와 skipped check 전 선행 시도 기록 추가.
- `docs/07-manual-verification-playbook.md`에 manual verification 전 readiness check/safe start 규칙 추가.
- `docs/08-development-workflow.md` 완료 게이트에 readiness evidence 추가.
- `docs/13-human-command-flow.md` 검증 응답에서 installed/running/stopped/fallback/blocked 상태 구분 추가.
- Mid-Phase Steering 규칙을 `docs/08`, `docs/09`, `docs/10`, `docs/13`에 추가하고 report index를 갱신.
- Phase workspace와 report 기록.

## 범위 제외

- 실제 Docker/Homebrew/host-level tool 설치.
- smoke script 또는 CI job 변경.
- 제품 기능 코드 수정.
- AWS/EKS/cloud resource start를 safe start로 취급하는 규칙 추가.
- Mid-Phase Steering을 제품 기능 scope나 runtime behavior 변경으로 확장.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/04-development-guide.md`
- `docs/07-manual-verification-playbook.md`
- `docs/13-human-command-flow.md`

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
