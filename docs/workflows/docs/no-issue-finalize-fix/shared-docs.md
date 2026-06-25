# No issue finalize fix 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/11-git-sync-policy.md` | linked issue 없는 `--no-issue` workspace finalize는 PR merged 상태만 확인하고 issue close status를 `n/a`로 기록한다고 명시 | helper 동작과 Git sync policy 정렬 | low |
| `scripts/prepare-pr.sh` | no-issue PR finalize path 허용 | `--no-issue` workspace에서 merged PR finalize가 issue close 단계에서 실패하지 않도록 함 | low |

## Integration Notes / 통합 메모

- Source of Truth 문서 변경 없음. PR #79에서 이미 자동 PR 생성 정책이 반영됐고, 이번 follow-up은 helper implementation fix다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
