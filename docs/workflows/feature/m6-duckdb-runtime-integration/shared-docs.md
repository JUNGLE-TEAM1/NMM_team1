# M6 DuckDB runtime integration 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | Adapter 뒤 DuckDB MVP는 기존 architecture/project-context 결정과 일치한다. | 낮음 |
| `docs/03-interface-reference.md` | 변경 없음 | 이미 `M6 AI Query -> SqlEngineAdapter -> DuckDBSqlEngine for MVP`와 `QueryResult.engine=duckdb`를 명시한다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | `QueryResult` 기반 SQL 검산 acceptance를 코드로 충족한다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | evidence 없는 답변, 처리 증거 없는 성공 표시를 막는 방향으로 구현했다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | Week2/Ask evidence 확인 절차를 바꾸지 않고 해당 절차를 실행했다. | 낮음 |
| `backend/app/core/settings.py` | `week2_sql_engine` 설정과 `WEEK2_SQL_ENGINE` env override 추가 | runtime 기본 DuckDB와 명시 fake 선택을 구분한다. | 낮음 |
| `backend/app/core/container.py` | 기본 `DuckDBSqlEngine`, explicit fake 선택 | 실제 M6 앱 흐름에 DuckDB adapter를 연결한다. | 낮음 |
| `backend/tests/test_app_container.py` | runtime engine selection test 추가 | default DuckDB 회귀를 막는다. | 낮음 |
| `backend/tests/test_week2_ai_query.py` | Week2 workflow output 기반 AI query가 DuckDB row를 반환하는 expectation 보강 | fake row가 성공처럼 보이는 회귀를 막는다. | 낮음 |

## Integration Notes / 통합 메모

- M5 Catalog store/API는 변경하지 않았다. M6는 `Week2CatalogStoreSource`로 catalog를 읽고, DuckDB는 adapter 내부에서만 import된다.
- local runner output file이 없으면 DuckDB guardrail은 기존 Step 1/2와 같이 blocked path로 동작한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
