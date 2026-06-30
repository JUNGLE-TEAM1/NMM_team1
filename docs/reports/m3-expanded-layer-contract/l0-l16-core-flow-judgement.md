# M3 Logical L0-L16 핵심 흐름과 판단 기준

이 문서는 M3의 실제 판단 흐름만 뽑은 canonical 요약이다. 기존 `L0-L10` 요약은 큰 단계 기준이었고, 현재 기준은 logical `L0-L16`이다.

핵심은 M3가 데이터를 직접 대량 실행하는 엔진이 아니라, unknown CSV/JSON/JSONL/Parquet source를 분석해서 Silver/Gold 생성 계약을 만들고 M2/M5/M6로 넘기는 control-plane이라는 점이다.

## 1. 전체 흐름

```text
M1 source 등록
-> L0 원본 단위 고정
-> L1 Bronze envelope / rescue lane
-> L2 Profile / schema snapshot
-> L3 AI-safe evidence pack
-> L4 Metadata/template retrieval
-> L5 Candidate grounding gate
-> L6 Silver recommendation draft
-> L7 Gold recommendation draft
-> L8 Vector/semantic handoff draft
-> L9 사용자 수정/승인
-> L10 Silver deterministic preview spec
-> L11 Gold deterministic preview spec
-> L12 Compiler validation / unsupported action gate
-> M2 preview execution
-> L13 Silver preview evidence gate
-> L14 Gold preview readiness gate
-> L15 Three-axis readiness gate
-> L16 M5 catalog / M6 query / vector handoff
```

## 2. 판단 기준의 큰 분류

| 판단 종류 | 적용 위치 | 핵심 질문 |
| --- | --- | --- |
| Evidence 판단 | L0-L3 | 이 source를 잃지 않고 추적할 수 있는가, AI에게 줄 만큼 안전하게 요약됐는가 |
| Retrieval/Grounding 판단 | L4-L5 | schema/profile/catalog 근거로 찾은 후보가 실제 source evidence를 갖췄는가 |
| Recommendation 판단 | L6-L8 | 어떤 Silver 정제, Gold 모델, vector handoff를 draft로 추천할 수 있는가 |
| Approval/Compile 판단 | L9-L12 | 사용자가 승인했는가, M2가 deterministic preview spec으로 실행할 수 있는가 |
| Readiness/Handoff 판단 | L13-L16 | preview 결과가 안전한가, Gold 의미가 준비됐는가, M5/M6에 노출해도 되는가 |

AI는 L3 evidence를 입력으로 삼아 L6/L7/L8 draft를 만드는 control-plane에만 들어간다. raw row 전체, full stream, production data-plane에는 들어가지 않는다.

## 3. Layer별 핵심 판단

| Layer | 받는 것 | 처리 핵심 | 판단 기준 | 통과하면 넘기는 것 |
| --- | --- | --- | --- | --- |
| L0 Raw Source Unit | M1 source 등록 정보, object/file/window 정보 | 원본 source unit을 고정한다. | checksum/etag/size가 있는가, object/window가 `source_unit_id`와 양방향 일치하는가, orphan이 없는가 | source manifest, object stream manifest, replay pointer |
| L1 Bronze Envelope | L0 manifest와 원본 preview 범위 | parse 성공/실패를 모두 envelope로 감싼다. | parse 실패를 버리지 않았는가, object locator나 stream offset/checkpoint anchor가 있는가 | bronze sample, rescue lane, envelope spec |
| L2 Profile Snapshot | L1 sample/rescue summary | format별 profile을 만든다. | format confidence, type conflict, null ratio, nested path, dialect/sketch가 기록됐는가 | profile snapshot, schema fingerprint, field profile |
| L3 AI-safe Evidence | L2 profile/schema/sketch | AI가 볼 bounded/redacted evidence로 줄인다. | raw payload 금지, PII redaction, field evidence cap, row-level AI call 0 | AI input pack, redaction map, policy context |
| L4 Template Retrieval | L3 evidence | metadata/template/vector 후보를 찾는다. | vectorDB/search가 metric correctness 증거로 오해되지 않는가, candidate source가 기록됐는가 | metadata retrieval plan, template candidate retrieval |
| L5 Candidate Grounding | L4 candidates | 후보가 실제 데이터 증거를 갖췄는지 gate한다. | product key, denominator, PII exposure, owner review 필요 여부가 분리됐는가 | candidate grounding report |
| L6 Silver Draft | L3/L5 evidence | Bronze -> Silver 정제 정책을 추천한다. | action allowlist, PII handling, catalog/query exposure, quarantine 정책이 있는가 | Silver policy recommendation draft |
| L7 Gold Draft | L5 grounded candidate | Gold model, product health, risk score policy를 추천한다. | metric이 source evidence 없이 invented 되지 않았는가, risk score가 policy draft로 분리됐는가 | Gold model draft, product health template, risk policy |
| L8 Vector/Semantic Draft | L3 evidence, L5 grounding | vectorDB/semantic handoff 후보를 만든다. | raw chunk/embedding을 M3 core가 만들지 않는가, metadata-only search 경계가 있는가 | vector handoff template, AI generation trace |
| L9 User Decision | L6-L8 drafts, M1/M5 decision | 사용자가 승인/보류/거절한다. | Silver/Gold/Gold-to-Gold/risk/vector 승인 상태가 분리됐는가 | approval state, policy decisions |
| L10 Silver Spec | L9 Silver approval | approved Silver decision만 spec으로 compile한다. | `write_mode=preview_only`, deterministic action, source unit scope | silver transform spec |
| L11 Gold Spec | L9 Gold approval | approved Gold decision만 spec으로 compile한다. | not_requested/deferred는 non-executable 상태로 남는가 | gold generation spec |
| L12 Compiler Gate | L10/L11 specs | unsafe/unsupported spec을 block한다. | per-row AI, generated code, unbounded collect, production write, legacy window_id 금지 | compiler validation, unsupported action report |
| L13 Silver Evidence | M2 preview over L10 | Silver preview 결과를 검증한다. | row count, schema, cast/null error, PII exposure, quarantine | Silver validation, PII report |
| L14 Gold Evidence | M2 preview over L11 또는 Gold 보류 상태 | Gold metric readiness evidence를 만든다. | metric grain, denominator, semantic caveat, owner review | Gold readiness input, metric definition |
| L15 Readiness Gate | L13/L14 evidence | processing/catalog/gold 3축 판정 | Gold 실패가 Silver ready를 오염시키지 않는가 | gate summary, axes |
| L16 Handoff | L15 gate + artifact refs | M5/M6 package를 만든다. | 모든 ref resolve, m6 context status 일치, allowed column만 노출 | catalog sync package, SQL context, vector handoff, exports |

## 4. 데이터 처리 흐름 기준

### 4.1 Raw -> Bronze

L0-L1은 정제가 아니라 유실 방지다. 컬럼명을 바꾸거나 type cast를 확정하지 않는다.

통과 기준:

- 같은 `source_unit_id`로 다시 읽을 수 있어야 한다.
- object/file은 checksum, size, object_id가 있어야 한다.
- stream은 stream_window_id, offset/checkpoint anchor가 있어야 한다.
- parse 실패 row도 rescue lane에 남아야 한다.

### 4.2 Bronze -> Profile

L2는 unknown data를 AI와 compiler가 이해할 수 있는 evidence로 바꾼다.

통과 기준:

- CSV면 delimiter/header/quote/encoding confidence가 있어야 한다.
- JSON/JSONL이면 path trie와 nested/array 구조가 있어야 한다.
- Parquet이면 schema/logical type/row group 단서가 있어야 한다.
- null ratio, type conflict, cardinality hint, example value는 bounded되어야 한다.

### 4.3 Profile -> AI-safe Evidence -> Candidate Retrieval

L3-L5는 AI/retrieval control-plane이다.

통과 기준:

- raw row dump가 AI input에 없어야 한다.
- PII/secret candidate는 redacted evidence로만 들어가야 한다.
- product key, review signal, conversion event, delivery event가 observed/not_observed로 분리돼야 한다.
- vectorDB는 schema/profile/catalog/template 검색을 돕는 장치일 뿐 metric 값을 맞추는 증거가 아니다.
- 후보 Gold metric은 denominator나 owner review 필요성이 명시돼야 한다.

### 4.4 Candidate -> Draft -> Approval -> Spec

L6-L12는 추천을 실행 가능한 계약으로 바꾸는 구간이다.

통과 기준:

- Silver는 field/action 단위로 승인되어야 한다.
- Gold는 `approved`, `deferred`, `needs_owner_review`, `not_requested`, `rejected` 상태가 명확해야 한다.
- `risk_score`는 output column은 고정하되, 공식/가중치는 `risk_score_policy_recommendation_draft`로 분리한다.
- L9 승인 전에는 L10/L11 compiler가 실행 가능한 operation으로 만들면 안 된다.
- L12는 unsupported action과 unsafe runtime feature를 block해야 한다.

### 4.5 Preview -> Gate -> Catalog/Query

L13-L16은 “만들 수 있다”와 “노출해도 된다”를 분리한다.

| Axis | 보는 것 | block 예시 |
| --- | --- | --- |
| processing_quality | compiler 결과, row count, cast/null error, quarantine ratio, replay consistency | preview row가 비정상적으로 사라짐, cast 실패 과다, replay 불가 |
| catalog_safety | PII exposure, catalog exposure, query context exposure, forbidden fields | PII가 default visible, raw JSON/rescue가 query allowed |
| gold_readiness | L9 Gold decision, L14 metric evidence, owner review, denominator evidence | Gold approved인데 preview 없음, conversion denominator 없음, risk policy 미승인 |

## 5. Product Health Gold 판단 위치

| Metric | 판단 위치 | 기준 |
| --- | --- | --- |
| `negative_review_rate` | L5/L7 후보, L9 승인, L14/L15 검증 | product key + rating/review signal + review_count denominator |
| `average_rating` | L7 후보, L13/L14 preview | rating field와 scale 확인 |
| `conversion_rate` | L5 evidence, L7 candidate, L14/L15 readiness | purchase/order numerator와 view/session/impression denominator가 둘 다 있어야 함 |
| `late_delivery_rate` | L5 evidence, L7 candidate, L14/L15 readiness | late flag 또는 promised/delivered timestamp와 delivery_count denominator |
| `risk_score` | L7 policy 추천, L9 policy 승인, L11 compile, L14/L15 coverage 검증 | formula/weight 전역 고정 금지. 승인된 component만 사용하고 없는 component는 0이 아니라 제외/null 처리 |

Amazon review-only source만 있으면 `negative_review_rate`, `average_rating`, `review_count`는 후보가 될 수 있다. 하지만 `conversion_rate`, `late_delivery_rate`는 behavior/delivery evidence가 없으면 `needs_source_evidence`로 남아야 한다.

## 6. 판단 실패 시 되돌아가는 곳

| 실패 위치 | 되돌아갈 곳 | 이유 |
| --- | --- | --- |
| L0 source unit mismatch | M1 source registration / L0 manifest | 원본 단위가 틀리면 모든 lineage가 흔들린다. |
| L1 parse/rescue 누락 | L1 bronze envelope | 실패 row를 잃으면 quality와 profile 판단이 왜곡된다. |
| L2 format confidence 낮음 | L2 profile 재생성 또는 sample 범위 조정 | profile 근거가 약하면 추천 품질도 낮다. |
| L3 PII/raw payload 노출 | L3 redaction/evidence budget | AI input과 trace가 위험해진다. |
| L4/L5 후보 grounding 실패 | source evidence 보강 또는 Gold 후보 보류 | denominator 없는 metric을 Gold로 확정하면 안 된다. |
| L6/L7/L8 unsupported recommendation | draft 수정 또는 L9에서 보류/거절 | compiler가 실행할 수 없는 action은 L12에서 block된다. |
| L9 미승인/보류 | 사용자 결정 | M3는 사용자 승인 없이 Gold/risk/vector를 확정하지 않는다. |
| L10/L11 spec 오류 | L9 decision 또는 draft 수정 | preview-only, allowlist, params schema 위반이다. |
| L12 compiler block | L10/L11 spec 수정 | M2에 넘기면 안 되는 spec이다. |
| L13 Silver quality block | L10 spec 또는 L9 Silver decision | 구조/PII/품질 문제는 Silver 쪽 수정이 필요하다. |
| L14 Gold readiness block | L7 Gold template, L9 decision, source evidence | semantic metric은 owner/evidence가 필요하다. |
| L15 catalog safety block | L9 exposure decision 또는 L13 PII validation | M6 query context 노출이 위험하다. |
| L16 ref/status mismatch | L16 package 재생성 | M5/M6가 서로 다른 artifact chain을 보면 안 된다. |

## 7. 한 문장 요약

L0-L3은 모르는 원본을 잃지 않고 AI-safe evidence로 줄이는 구간이고, L4-L8은 검색/추천 후보를 만들고 source evidence를 확인하는 구간이며, L9-L12는 사람이 승인한 deterministic spec으로 고정하는 구간이고, L13-L16은 preview evidence를 바탕으로 Silver/Gold/catalog/query 노출 가능성을 분리 판단하는 구간이다.
