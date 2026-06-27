# M6 DuckDB runtime integration 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 고영향 option brief는 작성하지 않았다. `docs/03-interface-reference.md`와 Week2 project context에서 MVP SQL engine은 이미 `DuckDBSqlEngine` behind `SqlEngineAdapter`로 결정되어 있었고, 이번 Phase는 그 결정을 runtime에 연결하는 낮은 선택 범위의 구현이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M6 runtime 기본 SQL engine | `duckdb` | Week 2 MVP 계약은 `QueryResult.engine=duckdb`이고, fake 기본값은 실제 output file 검산을 숨긴다. | 문서 결정 + 사용자 3단계 개발 지시 / 2026-06-27 |
| fake engine 사용 방식 | `WEEK2_SQL_ENGINE=fake` 또는 test settings로 명시 선택 | legacy fixture smoke와 unit test는 유지하되 앱 기본 흐름은 실제 DuckDB를 탄다. | AI implementation / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| SQL planner 고도화 | 이번 Phase는 engine runtime 연결만 다룬다. | intent별 SQL 생성 정확도를 높이는 단계 시작 | M6 후속 Step |
| RAG/LLM 연결 | SQL MVP 이후로 계획된 범위다. | SQL MVP 안정화 후 Catalog RAG/LLM 단계 시작 | M6 후속 Step |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| DuckDB 기본 runtime | DuckDB dependency가 CI/container에서 설치되지 않아 `engine_unavailable`이 반복된다. | dependency/build 경로를 수정하거나 임시로 `WEEK2_SQL_ENGINE=fake`를 명시하고 이슈를 남긴다. |
