# Main AI Query Product Health Runtime Stack 결정 기록

- Decision status: accepted

## Accepted Decisions

| Decision | Rationale | Date |
| --- | --- | --- |
| `origin/main` 전체 merge를 전제로 하지 않는다. | 현재 브랜치의 Product Health runtime/source-silver-gold 흐름과 충돌 위험이 크다. | 2026-07-01 |
| AI Query는 main의 route/RAG/LLM 구조를 따른다. | `sql/rag/hybrid/unsupported`, retrieval trace, answer metadata가 데모 설명력을 높인다. | 2026-07-01 |
| Product Health runtime catalog 결과를 source of truth로 둔다. | 사용자가 만든 Gold/Catalog 결과를 바로 질문하는 clean-room demo 흐름이 핵심이다. | 2026-07-01 |
| `evidence.storage.local_fallback_path`는 응답에서 유지한다. | Catalog/Run/AI Query handoff가 같은 file/run을 가리키는지 UI와 테스트에서 검증해야 한다. | 2026-07-01 |
| 외부 LLM context는 path/secret safe view로 분리한다. | LLM prompt에 local path, parquet path, credential/token이 노출되면 안 된다. | 2026-07-01 |
| Product display id는 `product_id ?? internal_product_id`로 처리한다. | main과 현재 브랜치의 Product Health schema 차이를 안전하게 흡수한다. | 2026-07-01 |

## Deferred Decisions

| Decision | Deferred reason | Revisit trigger | Target |
| --- | --- | --- | --- |
| `scenario_bucket`, `risk_driver`를 표준 Gold schema로 승격할지 | 현재는 branch-specific enrichment 성격이 강하다. | 데모 질문/화면에서 해당 필드를 핵심 근거로 요구할 때 | 후속 구현 Phase |
| 외부 OpenAI provider를 데모 기본값으로 켤지 | secret/env와 네트워크 의존이 있어 demo 안정성을 해칠 수 있다. | 실제 API key와 fallback 정책을 사람이 승인할 때 | 후속 운영 결정 |
| Frontend `AiQueryPage.jsx`를 통째로 가져올지 | 현재 브랜치 app 구조와 충돌 가능성이 높다. | backend 계약 이식 후 UI diff를 다시 확인할 때 | Frontend 적용 Phase |
