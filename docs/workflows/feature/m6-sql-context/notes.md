# M6 SQL execution context 노트

## 진행 메모

- 2026-06-27: PR #182 문서 브랜치와 구현을 섞지 않기 위해 `origin/main` 기준 `feature/m6-sql-context`를 생성했다.
- 2026-06-27: M6 Step 1로 `CatalogMetadata.storage.local_fallback_path`를 `SqlEngineContext`에 전달하고, path가 없으면 `local_path_missing` guardrail로 blocked 처리했다.
- 2026-06-27: local default Python에는 pytest/FastAPI가 없어 `/private/tmp/nmm_team1_pydeps`에 임시 dependency target을 설치해 backend tests를 실행했다.

## 결정

- Step 1에서는 실제 파일 존재 여부/readability를 검사하지 않는다. 이는 DuckDB adapter 또는 guardrail 강화 단계로 넘긴다.

## 열린 질문

- PR #182가 merge되기 전 이 branch PR을 열 경우, Source of Truth drift를 어떻게 처리할지 확인이 필요하다.

## 링크 / 증거

- PR #182: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/182
- focused test: `env PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests/test_week2_ai_query.py` -> 11 passed
- backend suite: `env PYTHONPATH=/private/tmp/nmm_team1_pydeps:backend python -m pytest backend/tests` -> 56 passed
