# Week2 M6 RAG scope 보강 confirmation 기록

## User Confirmations / 사용자 확인

| At | Prompt / Question | Human Response | Result |
| --- | --- | --- | --- |
| 2026-06-26 | 리뉴얼된 M6 Semantic/RAG/AI Query에서 RAG가 사라진 것 같은지 확인 | 사용자가 원래 RAG가 있었는지 확인 요청 | 기존 문서에서 RAG가 있었고 ver2 일부 문서에서 약하게 보인다고 확인 |
| 2026-06-26 | 문서 보강 프롬프트 생성 | 사용자가 프롬프트 생성을 요청 | RAG-lite 범위 보강 프롬프트 제공 |
| 2026-06-26 | 프롬프트 적용 | 사용자가 프롬프트 적용 요청 | 이 branch에서 문서 보강 진행 |

## AI Assumptions / AI 가정

- 이번 변경은 문서 표현 보강이며 API/schema/runtime 계약 변경은 아니다.
- RAG는 이번 기본 범위에서 external vector DB가 아니라 CatalogMetadata 기반 RAG-lite로 제한한다.
