# M6 answer evidence grounding 노트

## 진행 메모

- M6 마지막 단계는 new provider 연결이 아니라 CatalogMetadata 기반 evidence grounding 마감으로 제한했다.
- TDD로 `schema_fields` 누락 실패를 먼저 확인한 뒤, `QueryEvidence` optional fields와 summary grounding을 구현했다.
- 기존 M1 호환성을 위해 `dataset_id`, `run_id`, `s3_uri`, `freshness`는 그대로 유지했다.

## 결정

- `AIQueryResult.evidence`에 optional richer fields를 추가한다.
- real LLM, vector DB, full RAG, real SQL engine은 이번 Phase에서 제외한다.

## 열린 질문

- M1이 richer evidence를 어떤 UI hierarchy로 표시할지는 M1 live UI Phase에서 결정한다.

## 링크 / 증거

- Linked issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/151
- Focused TDD: `backend/tests/test_week2_ai_query.py`
