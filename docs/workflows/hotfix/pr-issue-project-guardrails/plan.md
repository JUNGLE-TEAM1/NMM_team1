# PR/Issue/Project guardrail Hotfix 계획

## 브랜치

- Branch: `hotfix/pr-issue-project-guardrails`
- Workspace: `docs/workflows/hotfix/pr-issue-project-guardrails`
- Created: 2026-06-27

## 목표

- PR 템플릿 drift와 linked issue 없는 PR이 쉽게 통과하는 문제를 Hotfix로 막는다.
- `연결된 Issue: 연결된 issue 없음` 예외는 승인 문구가 있을 때만 통과하게 한다.
- 열린 PR의 Project 상태는 `Review`, merge/finalize 완료 후만 `Done`이라는 기준을 문서에 명확히 남긴다.
- 현재 열린 PR은 읽기 전용으로 감사하고, 원격 보정은 실행하지 않는다.

## 범위

- `.github/scripts/check-pr-linked-issue.js`와 focused test 수정.
- PR template drift check workflow 추가.
- `docs/system-guardrails.md`, `docs/12-quality-gates.md`, `docs/11-git-sync-policy.md`, `docs/13-human-command-flow.md`, `docs/04-development-guide.md` 최소 보강.
- 열린 PR 보정 목록을 report에 기록.

## 범위 제외

- 기존 PR body 수정.
- GitHub issue 생성, close, reopen.
- GitHub Project status 이동.
- repository ruleset required context 직접 변경.
- PR merge/finalize/cleanup.

## 완료 기준

- [x] linked issue check 테스트 통과
- [x] PR template drift audit fixture 통과/실패 테스트 유지
- [x] harness validation 통과
- [x] 현재 열린 PR 보정 목록 기록
- [x] Hotfix report 작성
