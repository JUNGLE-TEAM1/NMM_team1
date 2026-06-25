# GitHub record drift audit 보강 계획

## 브랜치

- Branch: `docs/github-record-drift-audit`
- Workspace: `docs/workflows/docs/github-record-drift-audit`
- Created: 2026-06-25

## 목표

- #112처럼 UI/수동 `gh`/오래된 스크립트 경로로 생성된 GitHub issue/PR이 한국어 템플릿과 PR handoff 규칙을 우회했는지 읽기 전용으로 감지한다.
- PR-ready 상태 요약에서 linked issue/PR drift를 보여 자동 PR 생성 전 사람이 확인할 수 있게 한다.

## 범위

- `scripts/audit-github-records.sh`를 추가해 issue title/body/label, PR title/body, closing keyword drift를 점검한다.
- `scripts/status-workflow.sh`가 linked issue/PR이 있을 때 drift audit 결과를 표시하고 PR-ready 자동 진행 blocker로 반영한다.
- 하네스 fixture test와 static validation guard를 추가한다.
- 관련 Source of Truth 문서(`docs/11`, `docs/12`, `docs/13`)에 운영 규칙을 기록한다.

## 범위 제외

- 기존 GitHub issue/PR(#112 포함)의 원격 수정.
- GitHub record 자동 보정.
- PR #114의 PR 템플릿 문단형 본문 변경 병합 또는 재작업.

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
