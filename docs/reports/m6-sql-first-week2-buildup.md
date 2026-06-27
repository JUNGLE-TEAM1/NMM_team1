# M6 SQL-first 2주차 빌드업 계획 보강 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-27
- Changed: Week2 ver2 문서에 M6 현재 상태가 template SQL/fake SQL skeleton임을 명시하고, 2주차 후속 실행 우선순위를 SQL MVP 완성으로 정렬했다. M6는 M5 CatalogMetadata를 읽기 전용으로 소비하고, RAG/LLM은 SQL MVP 이후 확장한다는 경계를 추가했다.
- Verified: `rg -n "SQL-first|SQL MVP|fake/template|local_fallback_path|범용 NL2SQL|RAG/LLM|읽기 전용" docs/project-context/asklake-week2-module-plan/ver2`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: 실제 `DuckDBSqlEngine` 또는 SQL planner 구현은 다음 M6 implementation Phase에서 진행한다.
- Next context: 다음 M6 작업은 Amazon Reviews CatalogMetadata의 `storage.local_fallback_path`, `query.table_name`, `query.allowed_columns`, `query.default_limit`로 실제 SQL MVP를 닫는 Phase다.
- Risk: 문서상 장기 빌드업에는 RAG/LLM이 남아 있지만, 2주차 실행 범위로 오해하지 않아야 한다.
