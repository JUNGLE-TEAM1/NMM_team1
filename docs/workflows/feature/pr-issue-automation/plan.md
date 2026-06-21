# PR issue automation 계획

## 브랜치

- Branch: `feature/pr-issue-automation`
- Workspace: `docs/workflows/feature/pr-issue-automation`
- Created: 2026-06-22

## 목표

- branch workspace 생성 시 팀 규칙에 따라 GitHub issue를 기본 생성하고, issue/PR 연결 정보를 `sync.md`에 기록한다.
- PR 준비 단계에서 linked issue 기반 closing keyword를 만들고 PR body 초안을 제공한다.
- push/PR 생성/issue 상태 확인 같은 원격 작업은 사람이 명시한 플래그가 있을 때만 실행한다.

## 범위

- `scripts/start-workflow.sh`가 기본으로 issue를 생성하고, 예외용 `--no-issue`를 지원하도록 변경
- `scripts/prepare-pr.sh` 추가
- `scripts/status-workflow.sh`가 issue/PR 상태 필드를 표시하도록 확장
- PR 템플릿과 Git sync 정책, 사람 명령 흐름 문서 업데이트
- 현재 branch workspace 기록과 검증 결과 업데이트

## 범위 제외

- PR merge 자동화
- 실제 GitHub issue 생성 성공 보장; `gh` 미설치/미인증이면 local workspace를 만들고 실패 이유를 기록
- 실제 원격 push/PR 생성 실행

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

## 완료 기준

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
