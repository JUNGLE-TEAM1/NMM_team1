# AskLake 2주차 QueryResult 계약 보완 실행 프롬프트

## 목적

AskLake 2주차 공통 계약 설정 Phase에서 누락된 `QueryResult` 계약을 실제로 보완한다.

이 프롬프트는 `docs/03-interface-reference.md`, `contracts/ai_query_result.sample.json`, Week 2 contract setup workspace/report를 함께 갱신해 `SqlEngineAdapter.execute()` 반환 shape와 `AIQueryResult.query_result`를 정렬하기 위한 실행 지시문이다.

## 프롬프트

```text
AskLake 2주차 QueryResult 계약 보완 작업을 실행한다.

목표:
- 이전 검수에서 확인된 `QueryResult` 계약 누락을 실제로 보완한다.
- `SqlEngineAdapter.execute()` 반환 shape, `AIQueryResult.query_result`, `docs/03-interface-reference.md`의 Week 2 Contract Package가 같은 필드명을 쓰게 정렬한다.
- 실제 SQL engine, DuckDB, M6 RAG/AI Query, UI 구현은 하지 않는다.

필수로 먼저 읽을 문서:
- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`의 `AskLake Week 2 Contract Package` 섹션
- `docs/project-context/asklake-week2-module-plan/query-result-contract-prompt.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`의 `QueryResult 공통 형식` 섹션
- `contracts/ai_query_result.sample.json`
- `docs/workflows/feature/asklake-week2-contract-setup/report.md`
- `docs/workflows/feature/asklake-week2-contract-setup/quality.md`

작업 범위:
1. `docs/03-interface-reference.md`의 Week 2 Contract Package 섹션에 `QueryResult` 최소 계약을 추가한다.
   - `engine`
   - `sql`
   - `columns`
   - `rows`
   - `row_count`
   - `duration_ms`
   - `executed_at`

2. `SqlEngineAdapter.execute(sql, context)`의 반환이 `QueryResult` shape임을 명시한다.

3. `contracts/ai_query_result.sample.json`에 `query_result` 객체를 추가한다.
   - `query_result.engine`
   - `query_result.sql`
   - `query_result.columns`
   - `query_result.rows`
   - `query_result.row_count`
   - `query_result.duration_ms`
   - `query_result.executed_at`

4. 기존 top-level `sql`, `rows`는 제거하지 않는다.
   - 이번 보완에서는 backward-compatible UI 편의 필드로 유지한다.
   - `query_result`가 canonical SQL execution result이고, top-level `sql`/`rows`는 M1 표시 편의 필드라는 설명을 문서나 fixture 주변 기록에 남긴다.

5. `docs/workflows/feature/asklake-week2-contract-setup/notes.md` 또는 `decisions.md`에 아래 결정을 기록한다.
   - `QueryResult`는 별도 `contracts/query_result.sample.json`로 분리하지 않고 `AIQueryResult.query_result` 내부 객체로 우선 둔다.
   - 이유: 이번 주 M6 -> M1 소비 경계를 빠르게 안정화하기 위한 최소 보완이며, 독립 Query API 구현 시 별도 contract로 승격할 수 있다.

6. `docs/workflows/feature/asklake-week2-contract-setup/quality.md`, `report.md`, `docs/reports/asklake-week2-contract-setup.md`에 보완 내용과 검증 결과를 업데이트한다.

제외 범위:
- 별도 `contracts/query_result.sample.json` 추가
- 실제 `SqlEngineAdapter` Python interface 구현
- DuckDB 실행 구현
- M6 RAG/AI Query 구현
- UI 변경
- 기존 top-level `sql`, `rows` 제거
- Airflow/local runner 구현 변경

검증:
- `jq -e . contracts/*.sample.json >/dev/null`
- `PYTHONPATH=backend pytest backend/tests -q`
- `scripts/validate-harness.sh --strict`

완료 기준:
- `docs/03`에서 `QueryResult` 최소 shape와 `SqlEngineAdapter.execute()` 반환 계약을 확인할 수 있다.
- `contracts/ai_query_result.sample.json`에 `query_result`가 있다.
- `query_result` 필드명이 `docs/03`의 `QueryResult` 계약과 일치한다.
- 기존 6개 fixture JSON이 모두 유효하다.
- backend tests와 strict harness validation이 통과한다.
- report에 이 보완이 실제 계약 보완으로 완료됐고, 더 이상 단순 프롬프트 추가가 아님을 명확히 기록한다.
```

## 사용 메모

- 이 프롬프트는 실제 계약 보완 작업을 실행하기 위한 입력이다.
- 이전 `query-result-contract-prompt.md`는 보완 방향을 정리한 프롬프트이고, 이 파일은 `docs/03`과 fixture/report를 실제로 고치는 실행 프롬프트다.
- 이 프롬프트를 실행하기 전까지 `QueryResult` 계약 누락은 아직 해결된 것이 아니다.
