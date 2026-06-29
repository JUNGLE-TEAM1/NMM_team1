# Data integration source type picker 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | backend/API/schema 변경 없음 | low |
| `docs/03-interface-reference.md` | none | 실제 interface contract 변경 없음 | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | 추후 데이터 통합 UX acceptance에 source type picker를 반영할 수 있음 | 이번 Phase는 branch workspace 내 demo UI 보정 | medium |
| `docs/06-regression-and-failure-scenarios.md` | 추후 source type filter/search/sort 회귀 기준을 추가할 수 있음 | demo 핵심 흐름이 될 가능성 있음 | medium |
| `docs/07-manual-verification-playbook.md` | 추후 manual verification에 source type 선택 절차를 추가할 수 있음 | 사람 데모 확인 경로가 필요 | medium |

## Integration Notes / 통합 메모

- 이번 Phase에서는 공유 Source of Truth 문서를 직접 수정하지 않고 branch workspace와 frontend 구현만 보정했다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
