# AskLake 2주차 QueryResult 계약 보완 프롬프트

## 목적

AskLake 2주차 공통 계약 설정 Phase에서 빠진 `QueryResult` 최소 계약을 보완한다.

이 프롬프트는 `SqlEngineAdapter.execute()` 반환 shape와 `AIQueryResult` 소비 shape를 맞춰, M6 RAG/AI Query와 M1 UI가 같은 SQL 실행 결과 계약을 쓰게 하기 위한 실행 지시문이다.

## 프롬프트

```text
AskLake 2주차 공통 계약 설정 Phase 보완 작업을 진행한다.

목표:
- `SqlEngineAdapter.execute()`가 반환하는 `QueryResult` 최소 계약을 Week 2 contract package에 명확히 추가한다.
- M6가 SQL 실행 결과를 만들고 M1이 화면에 표시할 때 같은 shape를 쓰도록 `AIQueryResult`와 `docs/03-interface-reference.md`를 정렬한다.
- 기존 6개 fixture contract의 범위는 유지하고, 실제 DuckDB 실행 구현은 하지 않는다.

필수로 먼저 읽을 문서:
- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`의 `QueryResult 공통 형식` 섹션
- `docs/03-interface-reference.md`의 `AskLake Week 2 Contract Package` 섹션
- `contracts/ai_query_result.sample.json`
- `docs/workflows/feature/asklake-week2-contract-setup/report.md`
- `docs/workflows/feature/asklake-week2-contract-setup/quality.md`

작업 범위:
1. `docs/03-interface-reference.md`의 Week 2 Contract Package 섹션에 `QueryResult` 최소 필드를 추가한다.
   - `engine`
   - `sql`
   - `columns`
   - `rows`
   - `row_count`
   - `duration_ms`
   - `executed_at`
2. `SqlEngineAdapter.execute(sql, context)`의 반환이 이 `QueryResult` shape임을 명시한다.
3. `contracts/ai_query_result.sample.json`에 `query_result` 객체를 추가한다.
   - `query_result.sql`은 기존 top-level `sql`과 같은 값을 쓰거나, top-level `sql`을 제거하지 않고 중복 허용 사유를 명시한다.
   - `query_result.rows`는 기존 top-level `rows`와 같은 값을 쓰거나, top-level `rows`를 UI 편의 필드로 둔다.
   - 가능하면 이번 보완에서는 기존 top-level `sql`, `rows`를 제거하지 않는다. 후속 M6 구현이 덜 깨지게 하기 위함이다.
4. 필요한 경우 `docs/workflows/feature/asklake-week2-contract-setup/decisions.md` 또는 `notes.md`에 `QueryResult`를 `AIQueryResult` 내부 객체로 우선 둔 이유를 기록한다.
5. `docs/workflows/feature/asklake-week2-contract-setup/quality.md`와 `report.md`에 보완 검증 결과를 업데이트한다.
6. durable report가 필요하면 `docs/reports/asklake-week2-contract-setup.md`에도 짧게 보완 내용을 추가한다.

제외 범위:
- 별도 `contracts/query_result.sample.json` 추가
- 실제 DuckDB 실행 구현
- `SqlEngineAdapter` Python interface 구현
- M6 RAG/AI Query 구현
- UI 변경
- 기존 top-level `sql`, `rows` 제거

검증:
- `jq -e . contracts/*.sample.json >/dev/null`
- `PYTHONPATH=backend pytest backend/tests -q`
- `scripts/validate-harness.sh --strict`

완료 기준:
- `docs/03`에서 `QueryResult` 최소 shape를 확인할 수 있다.
- `AIQueryResult` fixture가 `query_result`를 포함한다.
- `SqlEngineAdapter.execute()` 반환 계약과 `AIQueryResult.query_result`가 같은 필드명을 쓴다.
- 기존 6개 fixture JSON이 모두 유효하다.
- backend tests와 strict harness validation이 통과한다.
```

## 사용 메모

- 이 프롬프트는 검수에서 발견된 보완점인 `QueryResult` shape 누락을 해결하기 위한 후속 입력이다.
- 보완 작업은 기존 Week 2 contract setup Phase의 작은 follow-up으로 수행할 수 있다.
- 실제 SQL engine 구현, M6 구현, UI 구현은 이 프롬프트의 범위가 아니다.
