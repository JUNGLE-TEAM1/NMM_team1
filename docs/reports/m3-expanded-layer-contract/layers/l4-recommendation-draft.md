# L4 AI Recommendation Draft 상세 설계

## 1. 역할

L4는 AI가 Silver 정제 방식과 Gold 생성 후보를 제안하는 계층이다. L4의 출력은 실행 spec이 아니다. L4는 draft이며, L5에서 사람이 수정하거나 승인해야만 L6 compiler로 갈 수 있다.

L4는 Silver와 Gold를 분리한다. Silver recommendation은 column/path 단위 정제 정책을 제안한다. Gold recommendation은 metric table, dimension summary, entity summary, event aggregate 같은 분석 모델 후보를 제안한다.

## 2. 선택 방식

선택 방식은 `Strict Silver/Gold Recommendation Draft`다. AI 출력은 자유 텍스트가 아니라 schema가 있는 JSON draft여야 한다. action vocabulary도 제한한다. 예를 들어 `select`, `rename`, `cast`, `parse_timestamp`, `normalize_null`, `flatten_struct`, `explode_array`, `json_string`, `mask`, `hash`, `drop`, `quarantine_if_invalid`, `aggregate`, `needs_review` 같은 action만 허용한다.

Gold는 별도 `gold_model_recommendation_draft.json`으로 만든다. Silver가 table shape를 안정화하는 추천이라면, Gold는 grain, dimensions, measures, semantic definition, caveats, owner review 필요 여부를 추천한다.

## 3. 선택 이유

AI 추천은 유용하지만 그대로 실행하면 위험하다. unknown source에서는 AI가 field 의미를 과신하거나, PII 처리 없이 catalog 노출을 제안하거나, nested array explode처럼 비용이 큰 연산을 제안할 수 있다. strict draft는 이런 위험을 L5/L6에서 검증 가능하게 만든다.

Silver와 Gold를 분리하는 이유도 현실적이다. Silver는 기술적 정제 문제이고 Gold는 의미/비즈니스 모델 문제다. Silver는 자동 추천이 상대적으로 가능하지만 Gold는 owner review가 필요한 경우가 많다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l4/silver_policy_recommendation_draft.json` | field/path별 Silver transform policy 후보를 담는다. |
| `l4/gold_model_recommendation_draft.json` | Gold metric/table/model 후보와 caveat를 담는다. |
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

## 8. 한계

L4는 execution을 하지 않는다. L4는 production table을 만들지 않고, M2 Spark job을 직접 실행하지 않는다. L4는 L3 input pack 밖의 raw data를 보면 안 된다. 또한 L4는 unsupported action을 조용히 삭제하면 안 되고 report로 남겨야 한다.

## 9. 검증 기준

L4 draft는 schema validation을 통과해야 한다. 모든 action은 allowlist 안에 있어야 한다. 모든 ref는 artifact id string이어야 한다. Gold draft가 없는데 L5 Gold decision을 만들면 block이다.

## 10. Handoff

L4는 L3 AI input pack을 받아 L5 decision/edit UI로 넘긴다. L5는 L4 draft를 그대로 승인할 수도 있고, 사용자가 field/action/Gold model을 수정한 decision body를 만들 수도 있다.
