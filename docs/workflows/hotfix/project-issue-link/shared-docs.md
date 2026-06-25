# Project issue link Hotfix 공유 문서 변경 제안

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | branch workspace 생성 시 Project add와 `In Progress`, issue close 시 `Done` status 결과 기록 규칙 추가 | development operations owns branch/issue setup | low |
| `docs/11-git-sync-policy.md` | default issue Project 연결, `In Progress`, close/finalize 시 `Done` status 정책 추가 | Git sync policy owns issue/PR lifecycle records | low |

## Integration Notes / 통합 메모

- `scripts/start-workflow.sh`가 issue 생성 실패, project 권한 부족, status update 실패를 fatal로 처리하지 않고 `sync.md`에 기록한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
