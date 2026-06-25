# Week2 M3 JSON main path decision 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/ver2/m3-json-main-path-decision.md` | Add M3 JSON main path and PR #105 selective recovery decision | M3 구현 시작 전 범위 폭주 방지 | low, docs-only |
| `docs/project-context/asklake-week2-module-plan/ver2/README.md` | Link `m3-json-main-path-decision.md` in reading order and current 기준 | ver2 문서 탐색 순서 갱신 | low, docs-only |
| `docs/reports/README.md` | Add latest report index entry | Phase evidence 탐색성 유지 | low, docs-only |

## Integration Notes / 통합 메모

- Interface/schema 변경은 없다. PR #105는 read-only로만 검토했다.

## Conflicts To Resolve / 해결할 충돌

- 없음
