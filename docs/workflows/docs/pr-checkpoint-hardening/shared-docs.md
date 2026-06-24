# PR checkpoint hardening 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | branch workspace 전환 checkpoint가 tracked 변경만 자동 포함한다는 운영 규칙 추가 | Development Operations 계층 정렬 | low |
| `docs/08-development-workflow.md` | 작은 변경 PR 선택과 branch switch checkpoint 규칙 명확화 | workflow 단계 오해 방지 | low |
| `docs/09-collaboration-agreement.md` | Small Change PR Agreement와 automation safety에 checkpoint 제외 규칙 추가 | 협업 중 개인/무관 파일 stage 방지 | low |
| `docs/10-next-action-menu.md` | `Small Change Completion Decision`의 `PR 진행`을 Pre-PR checkpoint 진입으로 명확화 | remote action 우회 오해 방지 | low |
| `docs/11-git-sync-policy.md` | dirty checkpoint tracked-only 정책과 untracked 보고 규칙 추가 | Git sync 정책과 script 동작 정렬 | low |
| `docs/13-human-command-flow.md` | branch switch/작은 변경 PR 명령 예시 보강 | 사람이 짧은 명령을 줬을 때 AI 행동 정렬 | low |

## Integration Notes / 통합 메모

- `scripts/start-workflow.sh` checkpoint staging 변경과 `scripts/test-harness.sh` fixture 추가가 함께 merge되어야 한다.

## Conflicts To Resolve / 해결할 충돌

- 
