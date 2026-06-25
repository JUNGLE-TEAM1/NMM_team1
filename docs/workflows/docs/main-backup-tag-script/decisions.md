# Main backup tag script 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 고영향 브랜치 정책 변경이 아니라 보조 실행 스크립트 추가로 처리한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Backup execution route | `scripts/create-main-backup-tag.sh` 추가 + project-context prompt 보강 | 다른 사람/agent도 같은 명령으로 `origin/main` backup tag를 만들 수 있게 하되, 하네스 Source of Truth 정책은 늘리지 않기 위해 | user request / 2026-06-26 |
| Backup target | `origin/main` | 로컬 `main`이나 현재 작업 브랜치가 아니라 GitHub 원격 main 스냅샷을 기준으로 삼기 위해 | user clarification / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Formal recurring backup policy | 현재는 사용자가 명시적으로 요청할 때만 실행하면 충분함 | 매일 자동/반복 실행 요구가 생길 때 | future operations Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Backup script | 태그 naming, remote target, push 동작이 팀 운영과 맞지 않는다고 판단될 때 | 스크립트 또는 project-context prompt를 수정한다. |
