# PR finalization state source 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | post-merge 상태는 GitHub PR/issue 상태를 기준으로 확인한다는 운영 규칙 추가 | stale `sync.md` final field 오판 방지 | low |
| `docs/08-development-workflow.md` | PR finalization 완료 기준과 handoff 절차를 GitHub 상태 확인 중심으로 정렬 | 이미 merge된 PR에 finalization 기록을 다시 넣는 오해 방지 | low |
| `docs/09-collaboration-agreement.md` | post-merge GitHub 상태를 authoritative source로 보는 협업 합의 추가 | 상태 요약 일관성 | low |
| `docs/10-next-action-menu.md` | Remaining Branch Queue가 stale `sync.md`와 GitHub 상태를 구분하도록 보강 | 다음 행동 추천 오류 방지 | low |
| `docs/11-git-sync-policy.md` | `prepare-pr --finalize`의 역할과 stale final field 한계 문서화 | Git sync 정책 명확화 | low |
| `docs/13-human-command-flow.md` | PR 완료/남은 branch 질문에서 GitHub 상태를 우선 보고하도록 명령 흐름 보강 | 사람의 짧은 명령 대응 정렬 | low |

## Integration Notes / 통합 메모

- `scripts/status-workflow.sh`, `scripts/list-active-branches.sh`, `scripts/test-harness.sh` 변경과 함께 merge되어야 한다.

## Conflicts To Resolve / 해결할 충돌

- none
