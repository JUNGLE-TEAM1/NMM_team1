# Week2 runner boundary decision 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md` | Add M2/M3/M5 runner boundary decision | 병렬 구현 전 공유 호출 계약 고정 | low, docs-only |
| `docs/project-context/asklake-week2-module-plan/ver2/README.md` | Link `runner-boundary-decision.md` in reading order and current 기준 | ver2 문서 탐색 순서 갱신 | low, docs-only |
| `docs/reports/README.md` | Add latest report index entry | Phase evidence 탐색성 유지 | low, docs-only |

## Integration Notes / 통합 메모

- Interface/schema code 변경은 없다. 후속 implementation PR에서 adapter-first로 반영한다.

## Conflicts To Resolve / 해결할 충돌

- 없음
