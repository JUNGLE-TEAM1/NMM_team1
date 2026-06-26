# Notion issue sync last-write-wins hotfix Notes

## Running Notes

- 기존 스크립트는 closed 이슈, Notion row 부재, Notion archived/trash 상태를 Project item 삭제 또는 Notion archive로 연결했다.
- hotfix 후 정기 동기화 경로에서 `deleteProjectV2Item` mutation과 marker 제거 로직은 제거됐다.
- `archiveNotionPage()`는 explicit `issues.deleted` 이벤트에서만 호출된다.
- `chooseSyncDirection()`은 `direction`, `githubChangedAt`, `notionChangedAt`, `reason`, `diffFields`를 담는 결정 객체를 반환한다.

## Decisions

- `Issue URL` 중복 Notion row는 자동 선택하지 않고 `Conflict`로 기록한다.
- closed 이슈는 Project item을 유지하고 `Done`으로 보존한다.
- 라벨/담당자는 정렬 차이를 변경으로 보지 않는다.

## Open Questions

- 실제 GitHub Actions 환경에서 `workflow_dispatch` dry_run 실행 결과 확인이 필요하다.
- Notion에서 명시적 삭제 의도를 표현하려면 별도 tombstone schema 설계가 필요하다.

## Links / Evidence

- User request: GitHub Project 3 ↔ Notion 동기화 hotfix
- Test: `node tests/notion-issue-sync-hotfix-smoke.js`
- Static check: destructive deletion helper 제거 및 `archiveNotionPage()` 호출 경로 제한 확인
