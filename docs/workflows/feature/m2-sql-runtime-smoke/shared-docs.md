# M2 SQL runtime smoke 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | Adapter boundary 추가는 이미 `docs/03`에 정의된 범위 안이다. | low |
| `docs/03-interface-reference.md` | `Settings.week2_sql_engine="duckdb"` opt-in runtime smoke 문구 추가 | default fake와 actual DuckDB smoke 경계를 구분하기 위해 | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | 이번 Phase는 기존 Week 2 SQL 계약의 구현 증거 추가이며 새 acceptance scenario는 만들지 않는다. | low |
| `docs/06-regression-and-failure-scenarios.md` | SQL runtime adapter guardrail 추가 | M6가 DuckDB를 직접 import하거나 guardrail 없이 file query하는 회귀를 막기 위해 | low |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | smoke command는 branch `quality.md`와 report에 기록한다. 반복 절차로 승격되면 후속 반영한다. | low |

## Integration Notes / 통합 메모

- `docs/03`와 `docs/06`만 직접 수정했다.

## Conflicts To Resolve / 해결할 충돌

- 현재 없음.
