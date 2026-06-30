# L4 AI Recommendation Draft 상세 설계

## 1. 역할

L4는 AI가 Silver 정제 방식과 Gold 생성 후보를 제안하는 계층이다. L4의 출력은 실행 spec이 아니다. L4는 draft이며, L5에서 사람이 수정하거나 승인해야만 L6 compiler로 갈 수 있다.

L4는 Silver와 Gold를 분리한다. Silver recommendation은 column/path 단위 정제 정책을 제안한다. Gold recommendation은 metric table, dimension summary, entity summary, event aggregate 같은 분석 모델 후보를 제안한다.

발표용 product health Gold도 이 계층에서 다룬다. 다만 `gold_product_health`, `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate`는 실행 완료 결과가 아니라 L4의 strict draft/template이다. L4는 관찰된 field evidence로 “가능한 metric”, “근거 부족 metric”, “owner review가 필요한 metric”을 분리하고, L5 승인 전에는 어떤 metric도 신뢰된 Gold로 확정하지 않는다.

## 2. 선택 방식

선택 방식은 `Strict Silver/Gold Recommendation Draft`다. AI 출력은 자유 텍스트가 아니라 schema가 있는 JSON draft여야 한다. action vocabulary도 제한한다. 예를 들어 `select`, `rename`, `cast`, `parse_timestamp`, `normalize_null`, `flatten_struct`, `explode_array`, `json_string`, `mask`, `hash`, `drop`, `quarantine_if_invalid`, `aggregate`, `needs_review` 같은 action만 허용한다.

Gold는 별도 `gold_model_recommendation_draft.json`으로 만든다. Silver가 table shape를 안정화하는 추천이라면, Gold는 grain, dimensions, measures, semantic definition, caveats, owner review 필요 여부를 추천한다.

presentation product health는 별도 `product_health_gold_template_draft.json`으로 둔다. 이 파일은 대표 demo에서 보여줄 metric shape와 필요한 source evidence를 명시하지만, conversion event나 delivery event가 없으면 `conversion_rate`, `late_delivery_rate`를 `needs_source_evidence`로 유지한다. review text에 “shipping”이라는 단어가 있다는 이유만으로 delivery fact metric을 만들면 안 된다.

vector/embedding은 `vector_embedding_handoff_template.json`으로 분리한다. M3는 text/entity/metadata field 후보와 privacy rule만 넘긴다. embedding 계산, chunk materialization, vector index build, retrieval serving은 core L4가 아니라 downstream extension hook이다.

## 3. 선택 이유

AI 추천은 유용하지만 그대로 실행하면 위험하다. unknown source에서는 AI가 field 의미를 과신하거나, PII 처리 없이 catalog 노출을 제안하거나, nested array explode처럼 비용이 큰 연산을 제안할 수 있다. strict draft는 이런 위험을 L5/L6에서 검증 가능하게 만든다.

Silver와 Gold를 분리하는 이유도 현실적이다. Silver는 기술적 정제 문제이고 Gold는 의미/비즈니스 모델 문제다. Silver는 자동 추천이 상대적으로 가능하지만 Gold는 owner review가 필요한 경우가 많다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l4/silver_policy_recommendation_draft.json` | field/path별 Silver transform policy 후보를 담는다. |
| `l4/gold_model_recommendation_draft.json` | Gold metric/table/model 후보와 caveat를 담는다. |
| `l4/product_health_gold_template_draft.json` | 발표용 `gold_product_health` metric template과 metric별 source evidence 상태를 담는다. |
| `l4/risk_score_policy_recommendation_draft.json` | `risk_score` component, weight, missing-component handling을 source evidence별로 추천한다. |
| `l4/vector_embedding_handoff_template.json` | text/entity/metadata 후보와 embedding/index handoff 안전 정책을 담는다. |
| `l4/ai_generation_trace.json` | 모델, prompt version, input pack ref, retry, validation 결과를 남긴다. |
| `l4/recommendation_validation_result.json` | draft schema validation과 unsupported action 후보를 기록한다. |

## 5. 장점

첫째, UI에서 수정하기 쉽다. L5 화면은 strict draft를 field별 row나 card로 보여주고 사용자가 action, target name, exposure, caveat를 수정할 수 있다.

둘째, compiler가 검증하기 쉽다. L6는 제한된 action vocabulary와 params schema를 기준으로 실행 가능 여부를 판단한다.

셋째, Gold가 준비되지 않은 상태를 자연스럽게 표현한다. Gold draft는 `not_requested`, `needs_owner_review`, `deferred` 같은 상태로 이어질 수 있다.

## 6. 단점과 문제

첫째, AI output이 schema를 만족하지 않으면 retry나 repair가 필요하다. strict schema는 안전하지만 모델 출력 실패 처리 로직이 필요하다.

둘째, AI 추천은 근거가 있어도 최종 진실이 아니다. 특히 Gold semantic은 domain owner 검토 없이 확정하면 안 된다.

셋째, action vocabulary가 너무 좁으면 실제 source의 복잡한 정제를 표현하지 못한다. 반대로 너무 넓으면 L6 compiler와 M2 execution이 불안정해진다.

## 7. 가능 범위

Silver는 rename, cast, timestamp parsing, null normalization, nested struct flattening, bounded array handling, JSON string preservation, PII mask/hash/drop, invalid row quarantine을 추천할 수 있다.

Gold는 aggregate, metric table, dimension summary, entity summary, event aggregate, needs review 후보를 추천할 수 있다. 다만 Gold 추천은 owner review required 여부와 confidence를 반드시 포함해야 한다.

product health template의 기본 metric은 다음처럼 취급한다.

| Metric | L4 기본 판정 | 근거 |
| --- | --- | --- |
| `negative_review_rate` | product key와 rating 또는 review text가 있으면 candidate, 없으면 `needs_source_evidence` | review fact에서 비교적 직접 도출 가능하지만 negative threshold는 owner review 필요 |
| `risk_score` | `policy_recommendation_ready` 또는 `needs_source_evidence` | 컬럼명은 고정하지만 계산식과 weight는 전역 고정하지 않는다. L4가 source evidence 기반 policy를 추천하고 L5가 승인/수정해야 실행 가능 |
| `conversion_rate` | conversion numerator와 visit/session/impression denominator가 모두 있을 때만 candidate | Amazon review-only source에는 보통 denominator가 없어 invented metric 위험이 큼 |
| `late_delivery_rate` | delivery timestamp/late flag와 delivered denominator가 있을 때만 candidate | review text나 rating만으로 배송 지연률을 확정하면 안 됨 |
| `review_volume`, `average_rating` | product key와 rating/review evidence가 있으면 supporting candidate | product health 설명을 돕는 보조 metric |

## 8. 한계

L4는 execution을 하지 않는다. L4는 production table을 만들지 않고, M2 Spark job을 직접 실행하지 않는다. L4는 L3 input pack 밖의 raw data를 보면 안 된다. 또한 L4는 unsupported action을 조용히 삭제하면 안 되고 report로 남겨야 한다.

`product_health_gold_template_draft.json`도 동일하게 execution이 아니다. 이 템플릿은 L5에서 사용자가 선택, 수정, 승인해야 하고, 승인된 뒤에도 L6가 deterministic aggregate spec으로 컴파일할 수 있는 부분만 M2로 넘어간다. 근거 부족 metric은 L6로 넘어가지 않아야 한다.

`vector_embedding_handoff_template.json`은 L6 Spark aggregate spec이 아니다. 이 파일은 M6 또는 vector extension이 별도 index build request를 만들 때 참고할 template이다. core M3가 embedding model을 호출하거나 vector DB에 쓰는 흐름은 이번 계약에 포함하지 않는다.

## 9. 검증 기준

L4 draft는 schema validation을 통과해야 한다. 모든 action은 allowlist 안에 있어야 한다. 모든 ref는 artifact id string이어야 한다. Gold draft가 없는데 L5 Gold decision을 만들면 block이다.

product health template은 `negative_review_rate`, `risk_score`, `conversion_rate`, `late_delivery_rate`의 상태를 모두 명시해야 한다. 특히 `conversion_rate`와 `late_delivery_rate`는 필요한 source evidence가 없으면 반드시 `needs_source_evidence` 또는 `template_only`로 남아야 한다. `risk_score`는 `selected_risk_score_policy(risk_score_policy_recommendation_ref)` 형태로만 표현하고, `risk_score_policy_recommendation_draft.json`에 component/weight 후보, weight guardrail, missing-component rule, L5 approval requirement가 있어야 한다. vector handoff template은 `m3_embedding_execution=false`를 포함해야 한다.

## 10. Handoff

L4는 L3 AI input pack을 받아 L5 decision/edit UI로 넘긴다. L5는 L4 draft를 그대로 승인할 수도 있고, 사용자가 field/action/Gold model을 수정한 decision body를 만들 수도 있다.
