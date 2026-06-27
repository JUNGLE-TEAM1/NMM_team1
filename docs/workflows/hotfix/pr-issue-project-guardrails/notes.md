# PR/Issue/Project guardrail Hotfix 노트

- 발견: PR template shape audit은 `scripts/audit-github-records.sh`에 있었지만 PR required check가 아니었다.
- 발견: `linked-issue` check는 단순 `연결된 Issue: 연결된 issue 없음` 예외를 통과시켜 실제 issue 없이도 통과할 수 있었다.
- 결정: no-issue 예외는 `No Linked Issue Exception: approved` 또는 `연결된 Issue 예외: 승인`이 있을 때만 통과한다.
- 결정: 열린 PR의 linked issue Project status는 `Review`가 기준이며, `Done`은 PR merge/finalize 이후만 사용한다.
