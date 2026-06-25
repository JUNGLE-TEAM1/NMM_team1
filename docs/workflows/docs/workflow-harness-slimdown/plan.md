# Workflow harness slimdown 계획

## 브랜치

- Branch: `docs/workflow-harness-slimdown`
- Workspace: `docs/workflows/docs/workflow-harness-slimdown`
- Created: 2026-06-25

## 목표

- `docs/08-development-workflow.md`가 하위 정책 문서의 상세 규칙을 반복하지 않도록 압축한다.
- Phase 실행 순서와 gate를 유지하되, Git sync, quality, context budget, next action, parallel milestone의 canonical 문서 경계를 분명히 한다.

## 범위

- `docs/08-development-workflow.md`의 중복 설명 축소
- 사용자 추가 요청에 따른 GitHub Issue/PR 템플릿 제목 한국어화
- `scripts/prepare-pr.sh` 자동 PR body를 `.github/pull_request_template.md` 기반으로 정렬
- `scripts/test-harness.sh` prepare-pr 회귀 fixture 보강
- canonical 참조 정리:
  - PR/sync/branch/issue/merge/finalize/cleanup: `docs/11-git-sync-policy.md`
  - TDD/CI/CD/quality evidence: `docs/12-quality-gates.md`
  - Context Budget: `docs/15-context-budget-rule.md`
  - 실제 next-action menu 문구: `docs/10-next-action-menu.md`
  - 사람 명령 예시: `docs/13-human-command-flow.md`
  - 병렬 milestone/manifest/integration ownership: `docs/17-parallel-milestone-protocol.md`
- workspace evidence와 report 작성

## 범위 제외

- 제품 요구사항, architecture, interface, acceptance 내용 변경
- PR/merge/cleanup 승인 정책 의미 변경
- 새 문서 추가
- 원격 push, PR 생성, merge, issue close, branch cleanup 실행
- 기존 unrelated 수정 되돌리기

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/10-next-action-menu.md`
- `docs/11-git-sync-policy.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/15-context-budget-rule.md`
- `docs/17-parallel-milestone-protocol.md`
- `docs/18-harness-regression-policy.md`

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
- [x] Acceptance 영향 없음 확인
- [x] Regression/failure scenario 영향 없음 확인
- [x] Manual verification 영향 없음 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
