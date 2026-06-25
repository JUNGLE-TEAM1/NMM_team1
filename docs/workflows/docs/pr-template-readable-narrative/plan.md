# PR 템플릿 문단형 설명 보강 계획

## 브랜치

- Branch: `docs/pr-template-readable-narrative`
- Workspace: `docs/workflows/docs/pr-template-readable-narrative`
- Created: 2026-06-25

## 목표

- PR 본문을 긴 감사 체크리스트가 아니라 사람이 읽기 쉬운 문단형 review handoff로 정리한다.
- `.github/pull_request_template.md`와 `scripts/prepare-pr.sh` 자동 PR body draft가 같은 7섹션 구조를 따르게 한다.

## 범위

- `.github/pull_request_template.md`를 7섹션 문단형 구조로 보강
- `scripts/prepare-pr.sh` PR body draft 생성 구조를 새 템플릿에 맞게 변경
- `scripts/test-harness.sh` prepare-pr fixture 갱신
- `scripts/validate-harness.sh` static guard 갱신
- 관련 Source of Truth 문서 최소 반영: `docs/04`, `docs/11`, `docs/13`
- workspace evidence와 report 작성

## 범위 제외

- 기존 remote issue/PR 본문 재보정
- 제품 기능/API/schema/data 변경
- PR merge/finalize/cleanup 실행
- 라이선스 문구 변경

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/04-development-guide.md`
- `docs/11-git-sync-policy.md`
- `docs/13-human-command-flow.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

PR 템플릿을 문단형 review handoff 구조로 보강한다.
`.github/pull_request_template.md`와 `scripts/prepare-pr.sh`가 summary, 변경 내용, 검증, 영향 범위, 리뷰어 요청, 남은 일, merge 전 확인을 같은 순서로 제공하게 한다.
기존 remote issue/PR 본문은 수정하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
`scripts/prepare-pr.sh --dry-run docs/workflows/docs/pr-template-readable-narrative`로 실제 PR body draft를 확인한다.
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

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
