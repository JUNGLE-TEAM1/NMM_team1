# Data integration screen reset 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | Data Integration UX Rebuild Queue 추가 | Phase A~B-5 실행 순서와 확인 단위를 Source of Truth workflow에 연결 | 낮음. workflow queue 추가이며 API/schema 변경 없음 |

## Integration Notes / 통합 메모

- `docs/08-development-workflow.md` 변경은 이 branch diff에 적용됨.

## Conflicts To Resolve / 해결할 충돌

- 없음. PR-ready 전 원격 main 변경과 queue 위치 충돌 여부 확인 필요.
