# PR 템플릿 제목 drift guard 보강 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/11-git-sync-policy.md` | PR 제목은 한국어 중심이어야 하며 conventional/English-only 제목은 drift로 본다는 정책과 단순 PR 번호 참조 오탐 방지 규칙을 추가 | Git sync/PR handoff 정책 변경 | low |
| `docs/12-quality-gates.md` | GitHub record drift audit 증거 범위에 Korean-centered PR title policy와 closing keyword detection을 추가 | 하네스 변경 검증 기준 반영 | low |
| `docs/13-human-command-flow.md` | record drift가 있으면 PR 진행을 멈추고 보정 또는 사람 확인을 받는 흐름 추가 | 사람 명령 흐름의 stop condition 반영 | low |

## Integration Notes / 통합 메모

- 제품 runtime/API/schema 문서 영향 없음.

## Conflicts To Resolve / 해결할 충돌

- 없음.
