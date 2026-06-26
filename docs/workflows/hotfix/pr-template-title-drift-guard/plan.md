# PR 템플릿 제목 drift guard 보강 계획

## 브랜치

- Branch: `hotfix/pr-template-title-drift-guard`
- Workspace: `docs/workflows/hotfix/pr-template-title-drift-guard`
- Created: 2026-06-26

## 목표

- PR 생성 경로와 GitHub record audit이 한국어 중심 PR 제목과 7섹션 PR handoff 본문을 일관되게 요구하게 한다.
- `PR #105` 같은 단순 PR 번호 참조를 linked issue closing keyword 누락으로 오탐하지 않게 한다.
- drift가 감지된 workspace는 `PR checklist ready`가 clear로 보이지 않게 한다.

## 범위

- `scripts/prepare-pr.sh` PR 제목 보정
- `scripts/audit-github-records.sh` PR 제목/본문 drift 및 closing keyword 판정 보강
- `scripts/status-workflow.sh` record drift 시 PR-ready 차단
- `scripts/test-harness.sh` fixture 회귀 테스트 추가
- 관련 운영 문서 최소 업데이트

## 범위 제외

- 이미 merge된 GitHub PR 본문/제목 원격 보정
- 팀원 PR 생성 권한 또는 GitHub branch protection 변경
- 제품 runtime, API/schema, data migration 변경

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
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
