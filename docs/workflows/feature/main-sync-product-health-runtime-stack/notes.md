# Main AI Query Product Health Runtime Stack 노트

## 2026-07-01

- 사용자 요청: `origin/main`의 AI Query 부분이 좋아 보이므로 현재 브랜치에 적용하려면 어떤 계약을 가져와야 하는지 분석하고, Phase 설계 프롬프트를 실제 문서에 반영한다.
- 판단: `origin/main` 전체 merge가 아니라 AI Query 계약 중심의 단계적 이식이 필요하다.
- 이유: 현재 브랜치는 Product Health runtime/source-silver-gold/catalog handoff 계약이 더 진전되어 있고, main을 통째로 덮으면 `evidence.storage.local_fallback_path`, runtime source lineage, `internal_product_id` 호환이 손상될 수 있다.

## 핵심 원칙

- AI Query 구조는 main을 따른다.
- 데이터 source of truth는 현재 브랜치의 Product Health runtime catalog 결과로 둔다.
- `AIQueryResult` response evidence는 운영/검수용 path를 유지한다.
- 외부 LLM context는 safe evidence만 받는다.
- `product_id`와 `internal_product_id`는 둘 다 허용한다.
