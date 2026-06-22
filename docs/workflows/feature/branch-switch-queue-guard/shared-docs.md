# Branch switch and queue guard 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | branch switch confirmation과 remaining branch queue 규칙 추가 | branch 전환과 PR finalize 후 남은 작업을 사람이 놓치지 않게 하기 위해 | 중간 |
| `docs/11-git-sync-policy.md` | 전환 전 확인, conflict stop, PR finalize 후 queue check 정책 추가 | sync/remote 작업 흐름과 branch queue 확인을 연결하기 위해 | 중간 |
| `docs/13-human-command-flow.md` | 다음 브랜치 전환/남은 브랜치 확인 응답 흐름 추가 | 사람 명령에 대한 AI 동작을 명확히 하기 위해 | 낮음 |
| `docs/10-next-action-menu.md` | Remaining Branch Queue 메뉴 추가 | 여러 branch가 남은 상황의 선택지를 표준화하기 위해 | 낮음 |
| `scripts/list-active-branches.sh` | read-only branch queue 요약 스크립트 추가 | status-workflow와 분리해 여러 branch 상태를 확인하기 위해 | 중간 |
| `scripts/validate-harness.sh` | 새 스크립트와 문서 규칙 guard 추가 | 하네스 규칙 누락 방지 | 중간 |

## Integration Notes / 통합 메모

- `scripts/status-workflow.sh`는 단일 workspace 요약 도구로 유지한다.
- `scripts/list-active-branches.sh`는 여러 branch queue 요약 전용 read-only 도구다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
