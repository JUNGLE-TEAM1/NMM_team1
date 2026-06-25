# 한국어 GitHub Issue/PR 템플릿 개선 계획

## 브랜치

- Branch: `docs/korean-github-templates`
- Workspace: `docs/workflows/docs/korean-github-templates`
- Created: 2026-06-25

## 목표

- GitHub Issue 템플릿과 PR 템플릿을 한국어 중심으로 자세히 개선한다.
- 하네스 운영 규칙은 바꾸지 않고, 작성자가 Phase Workflow에 필요한 정보를 빠뜨리지 않도록 템플릿 질문을 보강한다.

## 범위

- `.github/pull_request_template.md`를 한국어 PR 체크리스트와 작성 가이드로 확장한다.
- `.github/ISSUE_TEMPLATE/` 아래에 기능 요청, 버그 리포트, 문서/운영 개선, Hotfix 템플릿을 추가한다.
- Issue template selector 설정을 추가한다.

## 범위 제외

- `docs/04`, `docs/08`, `docs/12` 등 하네스 Source of Truth 규칙 변경.
- 라이선스 조항 추가 또는 변경.
- 제품 기능, CI workflow, 배포 설정 변경.

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
