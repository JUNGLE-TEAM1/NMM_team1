# Notion issue sync last-write-wins hotfix Quality Gates

Use this file to record TDD and CI/CD evidence for this branch.

- Quality gate status: passed-with-skips

## TDD Plan

- Applies: yes
- Reason: 동기화 방향 결정과 파괴적 삭제 방지 로직을 바꾸는 regression-prone hotfix이다.
- Failing test first: 기존 자동 테스트가 없어서 `tests/notion-issue-sync-hotfix-smoke.js`를 추가해 핵심 순수 로직을 고정했다.
- Expected failure command/result: 구현 전에는 `chooseSyncDirection()`이 문자열만 반환하고 conflict/closed 보존 helper가 없어 동일한 검증을 통과할 수 없었다.
- Pass command/result: `node tests/notion-issue-sync-hotfix-smoke.js` 통과.
- Refactor notes: 외부 API 호출 없이 검증 가능한 helper만 `_private`로 노출했다.

## Branch Checks

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | 공백 오류 없음. LF/CRLF 안내 warning만 출력됨. |
| unit/focused test | `node tests/notion-issue-sync-hotfix-smoke.js` | passed | LWW 방향 결정, conflict, label/assignee 정렬 무시, closed→Done 보존 확인. |
| integration/contract test | `rg -n "deleteProjectV2Item|removeProjectItem|removeGitHubIssueNotionMarker|shouldArchiveNotionMissingFromProject|isRecentGitHubProjectChange|GITHUB_RECENT_CHANGE_MS|archiveNotionPage\\(" .github/scripts/notion-issue-sync.js` | passed | `archiveNotionPage()`는 explicit `issues.deleted` 경로에만 남음. |
| build/typecheck | `node --check .github/scripts/notion-issue-sync.js` | passed | JavaScript syntax check 통과. |
| harness validation | `scripts/validate-harness.sh` | passed | Git Bash로 실행, Harness validation passed. |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Git Bash로 실행, in-progress workspace completion-only checks skip 후 passed. |
| workflow edge cases | `tests/workflow-edge-cases.sh` | passed | Git Bash로 실행, workflow edge case tests passed. |
| workspace status | `scripts/status-workflow.sh docs/workflows/hotfix/notion-lww-sync` | passed | PR checklist ready: yes. |

## CI/CD Gate

- CI required: no
- CI result: 로컬 검증으로 대체. 이 hotfix branch는 아직 push/PR/Actions 실행을 하지 않았다.
- Deploy/publish required: no
- Deployment confirmation: not needed
- Rollback/smoke notes: 문제 발생 시 `.github/scripts/notion-issue-sync.js`와 `.github/workflows/notion-issue-sync.yml` 변경을 revert하고 workflow를 `dry_run=true`로 먼저 재실행한다.

## Skipped Checks

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| live GitHub/Notion write smoke | 실제 Project/Notion 데이터를 변경할 수 있어 로컬에서는 실행하지 않음. workflow `dry_run=true`로 먼저 확인 필요. | no |
| YAML parser | 로컬에 `ruby`/YAML parser가 없어 실행하지 못함. workflow 파일은 수동 검토와 diff 검증으로 확인. | no |
