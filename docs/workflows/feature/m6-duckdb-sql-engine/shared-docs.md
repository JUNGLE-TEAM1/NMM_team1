# M6 DuckDB SQL engine 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | 현 문서 수준은 adapter boundary를 이미 포함한다. | 낮음 |
| `docs/03-interface-reference.md` | 변경 없음 | 이미 `DuckDBSqlEngine`, `SqlEngineAdapter`, `QueryResult` 최소 계약을 정의한다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | 이번 Phase는 existing Week 2 AI query SQL 실행 검증으로 충분하다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | missing path/guardrail regression은 focused tests와 workspace evidence로 기록한다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | local focused/backend tests와 PR checks로 검증한다. | 낮음 |

## Integration Notes / 통합 메모

- `backend/requirements.txt`에 `duckdb` dependency를 추가한다.
- Source of Truth 문서 변경은 이번 Phase에서 필요하지 않다.

## Conflicts To Resolve / 해결할 충돌

- 
