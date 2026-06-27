# M6 SQL-first 2주차 빌드업 계획 보강 다음 행동

## Current State / 현재 상태

- State: complete
- Summary: Week2 ver2 문서에 M6 SQL-first 우선순위를 반영했다.
- 실제 backend SQL adapter 구현은 아직 시작하지 않았다.
- RAG/LLM은 SQL MVP 이후 후속 확장으로 남아 있다.

## Recommended Next Action / 권장 다음 행동

- M6 SQL MVP 구현 Phase를 시작한다.
- `DuckDBSqlEngine` 또는 동등 SQL adapter를 `SqlEngineAdapter` 뒤에 추가한다.
- Amazon Reviews CatalogMetadata의 `storage.local_fallback_path` 기반 실제 query test를 작성한다.

## Options / 선택지

1. M6 SQL MVP 구현 Phase를 시작한다.
2. 이번 문서 변경을 commit/PR로 올린다.
3. M6 장기 RAG/LLM 계획을 별도 roadmap 문서로 더 자세히 나눈다.
4. 현재 변경을 로컬에만 보류한다.

## Waiting On Human / 사람 응답 대기

- 없음.

## Last User Choice / 마지막 사용자 선택

- "프롬프트를 반영해줘"

## Next AI Action / 다음 AI 행동

- 로컬 검증 결과를 보고하고, 사용자가 요청하면 commit/PR로 이어간다.
