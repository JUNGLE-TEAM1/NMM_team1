# Main backup tag script 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/project-context/ad-hoc-main-backup-tag-prompt.md` | 공용 실행 수단을 `scripts/create-main-backup-tag.sh`로 안내 | 다른 사람/agent도 같은 스크립트로 `origin/main` backup tag를 만들 수 있게 하기 위해 | low |
| `docs/project-context/README.md` | 기존 등록 항목 유지 | project-context index에서 backup tag prompt 위치를 찾을 수 있게 하기 위해 | low |

## Integration Notes / 통합 메모

- `docs/project-context/ad-hoc-main-backup-tag-prompt.md`는 참고 맥락이며 Source of Truth가 아니다.
- 실제 공용 실행은 `scripts/create-main-backup-tag.sh`가 담당한다.

## Conflicts To Resolve / 해결할 충돌

- 없음
