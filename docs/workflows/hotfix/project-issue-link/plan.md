# Project issue link Hotfix 계획

## 브랜치

- Branch: `codex/local-issue-project-followup`
- Workspace: `docs/workflows/hotfix/project-issue-link`
- Created: 2026-06-25

## 목표

- `scripts/start-workflow.sh`가 생성한 GitHub issue를 `JUNGLE-TEAM1` Project `3`에 자동 추가하고 Status를 `In Progress`로 설정한다.
- 이미 빠진 issue와 과거 issue를 Project `3`에 연결하고 상태를 정리한다.

## 범위

- GitHub issue 생성 직후 project item add 실행.
- workspace `sync.md`에 project 추가와 Status 설정 결과 기록.
- linked issue close/finalize 시 Project Status를 `Done`으로 설정.
- status summary와 harness regression test 보강.

## 범위 제외

- Project field 값 자동 설정.
- PR merge/finalize/cleanup 정책 변경.
- Project field 구조 변경.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/08-development-workflow.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`

## 구현 프롬프트

```text
GitHub issue 자동 생성 흐름에서 조직 Project 3 연결이 빠지지 않게 고치고, 실패 이유를 sync.md에 기록한다.
```

## 검증 프롬프트

```text
GitHub issue #78의 project 연결을 확인하고, start-workflow regression test와 strict harness validation을 실행한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] issue `#78`이 Project `3`에 연결되어 있고 `In Progress` 상태다.
- [x] 과거 closed issue가 Project `3`에 연결되어 있고 `Done` 상태다.
- [x] 새 issue 생성 시 project add 명령이 실행된다.
- [x] project add와 `In Progress` 설정 결과가 `sync.md`와 status summary에 표시된다.
- [x] issue close/finalize 시 `Done` 설정 결과가 `sync.md`에 표시된다.
- [x] regression test와 strict validation이 통과한다.
