# M2 source input 계약 확장 확인 기록

## User confirmation

- 사용자가 `source_type`과 `format`의 계층 차이를 확인한 뒤, 기존 호환을 유지한 채 구조를 미리 수정해 달라고 요청했다.
- 사용자가 이슈와 브랜치를 먼저 열고 작업을 시작하라고 요청했다.

## Remote confirmation

- Initial GitHub issue creation failed because `gh` token was invalid.
- GitHub App issue/branch creation also failed with 403.
- User requested GitHub auth recovery.
- `gh auth login -h github.com -w`, `gh auth refresh -s read:project`, and `gh auth refresh -s project` completed.
- Issue #233 was created and added to GitHub Project Status `In Progress`.
