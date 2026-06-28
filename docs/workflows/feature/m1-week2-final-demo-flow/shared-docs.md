# M1 Week2 final demo flow 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

Actual Source of Truth update: none. 이 파일은 `docs/02~07` 검토 결과와 통합자가 확인할 메모를 남기는 기록이며, 현재 branch가 Source of Truth 변경을 요구한다는 뜻이 아니다.

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | none | frontend display polish only | low |
| `docs/03-interface-reference.md` | none | 기존 `CatalogMetadata`/`AIQueryResult` 필드 소비만 수행 | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | none | 기존 Week2 demo flow 수용 기준을 변경하지 않음 | low |
| `docs/06-regression-and-failure-scenarios.md` | none | fake success 방지와 missing local path 안내를 UI에 반영 | low |
| `docs/07-manual-verification-playbook.md` | none | route/build/static 검증으로 충분하며 수동 절차 변경 없음 | low |

## Integration Notes / 통합 메모

- #200 `feature/m5-airflow-smoke-integration`은 `/etl` UI를 크게 바꾸므로 이 branch는 `/etl` 대규모 수정이나 같은 파일 영역의 재구성을 피한다.
- #204 `feature/m6-duckdb-runtime-integration`은 DuckDB runtime wiring을 담당한다. 이 branch는 응답의 `query_result.engine`을 표시하고 readiness를 해석할 뿐 runtime wiring을 소유하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- #200 또는 #204가 먼저 merge되면 M1 final smoke branch를 최신 `origin/main`으로 재검토해야 한다.
