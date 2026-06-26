# Notion issue sync last-write-wins hotfix Decisions

Use this file to record high-impact choices and their outcomes.
Use `docs/14-decision-option-brief.md` when a choice needs structured candidate comparison.

- Decision status: accepted

## Decision Option Briefs

- Decision Option Brief는 생략했다. 사용자가 hotfix 방향을 명확히 지정했고, 선택지가 아니라 기존 파괴적 기준 제거가 핵심이었다.

## Accepted Decisions

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 동기화 기준 | Last-Write-Wins 양방향 동기화 | 한쪽 서비스를 Source of Truth로 고정하면 반대편 사용자의 최신 수정을 삭제/덮어쓸 수 있다. | User request / 2026-06-26 |
| 부재 처리 | absence는 삭제가 아니라 생성/복구 또는 conflict | Notion query 누락, marker stale, Project item 누락이 실제 삭제 의도임을 증명하지 못한다. | User request / 2026-06-26 |
| 삭제 허용 범위 | 명시적 `issues.deleted` 이벤트에서만 Notion archive | 현재 Notion schema에 tombstone이 없으므로 archived/trash/row 없음만으로 Project item을 삭제하지 않는다. | User request / 2026-06-26 |
| 검증 방식 | 외부 API 없는 Node smoke test와 정적 destructive-call check | 운영 Project/Notion 데이터 변경 없이 hotfix 핵심 회귀를 확인하기 위해서다. | Codex / 2026-06-26 |

## Deferred Decisions

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| live dry-run workflow 확인 | secrets와 실제 GitHub Actions 환경이 필요함. | branch push 후 `workflow_dispatch` dry_run 실행 가능할 때 | `hotfix/notion-lww-sync` |

## Revisit / Rollback Conditions

| Decision | Condition | Action |
| --- | --- | --- |
| Last-Write-Wins | 같은 grace window에서 양쪽 데이터가 다르면 자동 overwrite하지 않고 Conflict로 남긴다. | Notion `Sync Error`를 확인해 사람이 어느 쪽을 살릴지 결정한다. |
| 삭제 정책 | 명시적 삭제 이벤트 외에 Project item 삭제가 필요해지면 tombstone 속성을 먼저 설계한다. | Notion schema/Interface 문서를 업데이트한 별도 작업으로 진행한다. |
