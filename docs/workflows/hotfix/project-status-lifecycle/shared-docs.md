# Project status lifecycle 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/11-git-sync-policy.md` | linked issue / Project lifecycle 상세 규칙 추가 | GitHub Issue / Project / PR sync policy의 Source of Truth | low |
| `docs/04-development-guide.md` | lifecycle 상세 중복을 제거하고 `docs/11` 참조로 축소 | 규칙 중복과 drift 방지 | low |
| `docs/08-development-workflow.md` | Project Status Lifecycle 얇은 참조 추가 | 실행 workflow에서 정책 위치를 찾기 쉽게 함 | low |
| `docs/10-next-action-menu.md` | PR Ready 메뉴에 lifecycle note 추가 | PR open 시 Review, merge/finalize 후 Done 흐름을 선택지 문맥에 반영 | low |

## Integration Notes / 통합 메모

- 변경 시작점은 Git sync policy change이며, 영향 문서는 Development Operations / Workflow / Next Action Menu로 제한했다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
