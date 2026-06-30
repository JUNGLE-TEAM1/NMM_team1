# L3 AI Input Evidence Pack 상세 설계

## 1. 역할

L3는 AI 추천을 만들기 전의 안전 장치다. L3는 L2 profile을 AI가 볼 수 있는 bounded, redacted, structured evidence pack으로 변환한다. 이 단계가 없으면 AI가 raw record, rescue snippet, PII candidate, secret candidate를 직접 볼 위험이 생긴다.

L3는 추천 계층이 아니다. L3는 L4가 사용할 입력을 만든다. 따라서 L3 산출물에는 “이 field를 drop하라” 같은 최종 정책이 아니라 “이 field는 이런 type 후보와 이런 risk를 가진다”는 evidence가 들어간다.

## 2. 선택 방식

선택 방식은 `Redaction-first Evidence Pack`이다. L2 profile에서 field name, source path, inferred type, null ratio, type conflict, capped redacted examples, PII/secret candidate, semantic hint, confidence를 추출한다.

AI 입력 크기를 제한하기 위해 evidence budget을 둔다. 최대 field 수, field당 example 수, 전체 character 수, rescue sample 수를 제한한다. budget을 넘는 정보는 summary나 count로만 남긴다.

## 3. 선택 이유

대용량 비정형/반정형 데이터에서 AI를 모든 row에 실시간 적용하는 것은 현실적이지 않다. L3를 두는 이유는 AI가 볼 정보와 보지 말아야 할 정보를 분리하기 위해서다. AI는 control-plane에서 profile evidence를 보고 추천하고, data-plane의 실제 row 처리에는 들어가지 않는다.

또한 개인정보와 secret을 추천 단계에서부터 줄여야 한다. L4 draft와 generation trace는 M5에 저장될 수 있고, UI에 노출될 수 있다. 이때 raw PII가 들어가면 이후 계층에서 아무리 막아도 이미 늦다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l3/ai_recommendation_input_pack.json` | L4 model이 읽는 유일한 AI 입력 package다. |
| `l3/redaction_map.json` | 어떤 field/example이 어떤 이유로 masking/redaction 되었는지 기록한다. |
| `l3/unknown_data_recommendation_pack.json` | unknown CSV/JSON/JSONL source에서 L4가 일반 추천, product health template, vector handoff를 만들 때 쓸 domain/signal 요약이다. |
| `l3/metadata_retrieval_index_plan.json` | L3A. schema/profile/column/gold template 문서를 vectorDB에 넣기 위한 control-plane index plan이다. |
| `l3/gold_template_candidate_retrieval.json` | L3B. 현재 source profile로 검색/매칭된 Gold template top-k 후보와 missing evidence를 기록한다. |
| `l3/candidate_grounding_report.json` | L3C. embedding similarity 이후 exact type/name, denominator, join overlap, PII, preview, approval 조건을 검증한다. |
| `l3/evidence_budget_report.json` | budget 적용 결과, 누락/축약된 evidence, confidence 영향을 기록한다. |
| `l3/pii_candidate_summary.json` | PII/secret candidate와 권장 handling hint를 요약한다. |

## 5. 장점

첫째, AI 입력을 통제한다. raw file, full stream, full rescue lane을 모델에 넣는 비현실적 구조를 막는다.

둘째, 보안과 감사 가능성이 높아진다. 어떤 evidence가 redaction되었는지 trace가 남으므로 나중에 추천 근거와 안전성 판단을 설명할 수 있다.

셋째, L4 output 품질이 안정된다. free-form raw examples보다 structured field evidence를 주면 strict schema 추천을 만들기 쉽다.

## 6. 단점과 문제

첫째, redaction이 과하면 AI가 의미를 잘못 추론할 수 있다. 예를 들어 field value pattern이 모두 가려지면 timestamp, code, category, free text 구분이 어려워진다.

둘째, PII detection은 완벽하지 않다. false positive는 field를 불필요하게 제한하고, false negative는 민감정보 노출 위험을 만든다.

셋째, evidence budget이 작으면 복잡한 nested source에서 rare field나 low-frequency issue가 빠질 수 있다.

## 7. 가능 범위

L3는 structured/semi-structured source의 field-level evidence를 다룬다. CSV column, JSON path, JSONL field path, Parquet column path를 모두 field evidence로 표현할 수 있다.

AI 입력은 source-level summary, field-level profile, failure summary, redacted examples, policy hints로 제한한다. 이 정도면 Silver 정제 추천과 Gold 후보 추천에 필요한 핵심 근거는 제공할 수 있다.

`unknown_data_recommendation_pack.json`은 source 구조를 모른다는 전제를 정면으로 다룬다. 이 artifact는 product/entity key, review feedback, free text, time series, conversion event, delivery event 같은 신호가 관찰됐는지와 어떤 field가 그 신호를 뒷받침하는지를 기록한다. 여기서 중요한 점은 L3가 추천을 확정하지 않는다는 것이다. L3는 “이 source가 product health 템플릿에 쓸 수 있는 근거를 일부 갖고 있다” 또는 “conversion/delivery 근거가 없다”처럼 L4가 판단할 수 있는 evidence만 만든다.

vector/embedding도 같은 원칙을 따른다. L3는 text field 후보, entity key 후보, metadata 후보를 제안할 수 있지만 embedding을 계산하거나 vector index를 만들지 않는다. PII candidate는 기본적으로 embedding 후보에서 제외하고, downstream M6 또는 vector extension이 별도 approval과 policy validation을 거쳐야 한다.

L3 내부는 세 부분으로 나눈다. `L3A Metadata Retrieval Index Plan`은 raw row가 아니라 schema/profile/catalog/gold-template metadata만 vectorDB에 넣을 document로 만든다. `L3B Gold Template Candidate Retrieval`은 현재 source profile과 template metadata를 비교해 `gold_product_health_v1` 같은 후보를 찾는다. `L3C Candidate Grounding`은 similarity 결과를 그대로 믿지 않고 exact name/type compatibility, value range 필요성, join overlap 필요성, denominator rule, PII/query exposure rule, Spark preview 필요성, user approval 필요성을 확인한다.

이 구조에서 vectorDB는 Gold 값을 더 정확하게 계산하는 장치가 아니다. vectorDB는 unknown schema에서 “어떤 Gold 후보를 검토할지”를 더 잘 찾는 장치다. 실제 값의 정확성은 L6 deterministic spec, M2 Spark preview/full run, L8/L9 validation, L5 approval로 확인한다.

## 8. 한계

L3는 unstructured retrieval pack을 core로 만들지 않는다. PDF/image/audio chunking과 citation policy는 별도 extension hook이다. L3는 AI recommendation의 정확성을 보장하지 않는다. L4 draft는 L5에서 사람이 수정/승인해야 한다.

따라서 발표에서 `gold_product_health`, `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate`가 “정확히 구현됐다”고 말하면 안 된다. L3 관점에서 정확한 표현은 “unknown source profile에서 해당 Gold 템플릿을 추천할 근거와 부족한 근거를 분리해 L4로 넘긴다”이다.

## 9. 검증 기준

`ai_recommendation_input_pack.json`에는 raw payload가 직접 들어가면 안 된다. `forbidden_raw_payload=true` 조건을 만족해야 한다. PII candidate field는 example이 redacted되어야 한다. 모든 input ref는 artifact id string이어야 한다.

`unknown_data_recommendation_pack.json`은 conversion/delivery/review/product/text 신호를 field evidence로 설명해야 한다. 관찰되지 않은 신호는 빈칸으로 두지 말고 `not_observed` 또는 missing evidence로 남겨야 한다. 특히 review-only source에서 `conversion_rate`나 `late_delivery_rate`를 자동 산출 가능하다고 표시하면 계약 위반이다.

## 10. Handoff

L3는 L2 profile을 받아 L4 AI recommendation draft로 넘긴다. L4 model은 L3 pack만 입력으로 사용해야 하며, L0/L1 raw artifact를 직접 읽으면 계약 위반이다.
