# 03. Interface Reference

Use this document for APIs, CLI commands, UI contracts, event schemas, background jobs, internal tools, or external integration contracts.

## 1) Common Rules

- Base URL / command namespace / entrypoint: TBD
- Request/response format: TBD
- Naming conventions: code identifiers remain in their original language; collaboration documents are written in Korean.
- Pagination/sorting/filtering: TBD
- Idempotency: TBD

## 2) Auth / Access Control

- Authentication: TBD
- Authorization: TBD
- Public/private boundaries: TBD

## 3) Status / Error / Failure Format

| Condition | Expected Result |
| --- | --- |
| TBD | TBD |

## 4) Interface List

| Interface | Type | Purpose |
| --- | --- | --- |
| GitHub PR body closing keyword | PR metadata | Linked issue가 있으면 `Closes #<issue-number>` 또는 동등한 closing keyword를 포함한다. |
| TBD product interface | API/CLI/UI/Event/Job | 프로젝트 기능 확정 후 작성한다. |

## 5) Core Interface Details

### GitHub PR Body Closing Keyword

- Type: PR metadata
- Input: linked GitHub issue number
- Output: PR body contains a closing keyword such as `Closes #123`
- Success behavior: merge 후 GitHub issue가 자동 close되고 downstream Project/Notion sync가 정리된다.
- Failure behavior: issue가 열린 상태로 남을 수 있으므로 PR 전에 수정한다.
- Related acceptance criteria: `docs/05`
- Related regression/failure scenarios: `docs/06`

## 6) Internal Tools / External Integrations

### Notion Issue Sync

- Purpose: GitHub Issue / Project 상태와 Notion board 동기화
- Input: GitHub issue/project events, Notion secrets
- Output: Notion database and GitHub Project state updates
- Timeout/retry/fallback: GitHub Actions 로그와 `Sync Error` 필드를 확인한다.

## 7) Open Issues

- 실제 제품 API/UI/Job 계약은 첫 기능 Phase에서 확정한다.
