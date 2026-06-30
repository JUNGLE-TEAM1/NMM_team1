# M3 Logical L0-L16 Selected Improvement Contract v2.1.1

이 문서는 `selected-improvement-contract-v2.1.1.md`의 P0/P1 보강 내용을 **논리 L0-L16 기준**으로 다시 정리한 canonical 계약 문서다. 기존 v2.1.1 문서는 물리 `l0`~`l10` artifact layout과 schema 상세를 보존하는 reference로 둔다. 발표, 구현 판단, M1/M2/M5/M6 연결 설명은 이 문서를 따른다.

## 0. 판정

v2.1.1의 핵심 방향은 유지한다. 다만 “L0-L10 계약”이라는 표현은 더 이상 canonical이 아니다.

- Canonical logical layer: `L0`~`L16`
- Physical artifact layout: `l0`~`l10`
- Logical layer version: `m3.logical_layers.v3_l0_l16`
- M3 role: unknown CSV/JSON/JSONL/Parquet onboarding, AI-safe recommendation, deterministic preview spec, quality/readiness gate, catalog/query/vector handoff
- M3 non-role: production Spark execution, raw storage ownership, streaming runtime, watermark enforcement, vector index serving, full unstructured retrieval

## 1. Common Contract Rules

### 1.1 Artifact header

모든 JSON artifact는 아래 공통 header를 가진다.

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "string",
    "artifact_version": "string",
    "schema_version": "string",
    "created_at": "ISO-8601 string",
    "producer": "M1|M2|M3|M5|M6",
    "access_class": "raw_restricted|profile_internal|ai_safe|catalog_internal|catalog_public|query_context_safe",
    "physical_layer": "l0|l1|...|l10",
    "logical_layer": "L0|L1|...|L16",
    "logical_layer_version": "m3.logical_layers.v3_l0_l16"
  }
}
```

### 1.2 Ref rule

모든 `*_ref`는 string `artifact_id`다. URI, checksum, byte size, access class는 L16의 `artifact_reference_manifest.json`에서 resolve한다.

Artifact가 아닌 값에는 `_ref`를 쓰지 않는다.

| 값 | 허용 이름 |
| --- | --- |
| 외부 checkpoint handle | `checkpoint_external_id` |
| artifact로 저장된 checkpoint | `checkpoint_artifact_ref` |
| secret manager key | `salt_secret_id` |
| human review row | `review_id` |
| decision trace row | `decision_trace_id` |

### 1.3 Physical/logical mapping

| Physical folder | Logical layers |
| --- | --- |
| `l0` | `L0` |
| `l1` | `L1` |
| `l2` | `L2` |
| `l3` | `L3`, `L4`, `L5` |
| `l4` | `L6`, `L7`, `L8` |
| `l5` | `L9` |
| `l6` | `L10`, `L11`, `L12` |
| `l7` | `L13` |
| `l8` | `L14` |
| `l9` | `L15` |
| `l10` | `L16` |

## 2. Logical L0-L16 Layer Contract

### L0 Raw Source Unit Manifest

역할: raw object, stream window, hybrid window를 `source_unit_id` 중심으로 고정한다. M3는 raw payload를 복사하거나 변형하지 않는다.

입력:

- M1 source registration
- local/MinIO/object path
- object metadata 또는 stream window metadata

출력:

- `l0/object_stream_manifest.json`
- `l0/source_manifest.json`
- `l0/raw_replay_pointer.json`

필수 규칙:

- object-backed record는 `object_id`가 있어야 한다.
- stream-backed record는 `stream_window_id`와 offset/checkpoint anchor가 있어야 한다.
- `source_units[]`와 `objects[]`/`stream_windows[]`는 양방향 consistency를 만족해야 한다.
- orphan object/window는 block이다.
- `object_batch`, `stream_window`, `hybrid_window`별 허용 조합을 validator가 검사한다.

M 연결:

- From M1: source registration
- To M3 L1: source unit, object/window identity, replay pointer

### L1 Bronze Envelope and Rescue Lane

역할: raw sample과 parse failure를 모두 Bronze envelope로 감싼다. 실패 row를 버리지 않는 것이 핵심이다.

출력:

- `l1/bronze_envelope_samples.manifest.json`
- `l1/bronze_envelope_samples.jsonl`
- `l1/rescue_lane.manifest.json`
- `l1/rescue_lane.jsonl`
- `l1/bronze_envelope_spec.json`

필수 규칙:

- parse 실패, encoding 실패, schema conflict는 rescue lane에 남긴다.
- replay locator는 L0 source unit과 연결되어야 한다.
- raw preview는 bounded/redacted preview만 허용한다.
- full raw payload를 AI input이나 catalog context에 넣지 않는다.

### L2 Profile and Data Shape Snapshot

역할: unknown source의 format, field, type, null ratio, nested path, PII hint, semantic hint를 profile로 만든다.

출력:

- `l2/format_detection.json`
- `l2/profile_snapshot.json`
- `l2/{format}_profile.json`
- `l2/schema_fingerprint.json`

필수 규칙:

- CSV는 dialect/header/width conflict를 기록한다.
- JSON/JSONL은 path flatten/trie와 parse error를 기록한다.
- Parquet은 lightweight core에서 직접 full parse하지 못하면 extension-required profile contract로 routing한다.
- `full_data_scan_by_m3=false`
- `ai_data_plane_allowed=false`

### L3 AI-Safe Evidence Reduction

역할: L2 profile을 AI가 볼 수 있는 bounded/redacted evidence로 줄인다.

출력:

- `l3/ai_recommendation_input_pack.json`
- `l3/field_evidence_reducer.json`
- `l3/redaction_map.json`
- `l3/policy_context_pack.json`
- `l3/unknown_data_recommendation_pack.json`

필수 규칙:

- raw payload, full row dump, secret value는 AI input 금지다.
- PII candidate는 redacted example만 허용한다.
- evidence budget에는 sampled field count, example cap, raw payload exclusion이 명시돼야 한다.
- row-level AI call count는 0이어야 한다.

### L4 Metadata and Template Retrieval

역할: schema/profile/catalog evidence로 compatible template 후보를 찾는다.

출력:

- `l3/metadata_retrieval_index_plan.json`
- `l3/gold_template_candidate_retrieval.json`

필수 규칙:

- vectorDB는 schema/profile/catalog/template 검색 보조다.
- vector similarity는 Gold metric 값의 정확성 증거가 아니다.
- retrieval candidate는 matched fields와 missing evidence를 함께 가져야 한다.
- `gold_product_health_v1` 후보는 product key, review/rating, conversion, delivery evidence를 분리해 기록해야 한다.

### L5 Candidate Grounding Gate

역할: L4 후보가 실제 source evidence를 갖췄는지 확인한다.

출력:

- `l3/candidate_grounding_report.json`

필수 규칙:

- denominator 없는 rate metric은 trusted metric으로 통과하지 못한다.
- PII field는 default vector/query metadata로 쓰지 못한다.
- owner review가 필요한 metric은 `needs_owner_review` 또는 caveat로 남긴다.

### L6 Silver Recommendation Draft

역할: Bronze -> Silver 정제 정책 draft를 만든다.

출력:

- `l4/silver_policy_recommendation_draft.json`

필수 규칙:

- action은 allowlist 안에 있어야 한다.
- PII handling은 `none|mask|hash`만 허용한다.
- 숨김 여부는 `catalog_exposure=hidden` 또는 `query_context_exposure=forbidden`으로 표현한다.
- draft는 실행 권한이 없다. L9 승인이 필요하다.

### L7 Gold Recommendation Draft

역할: Silver -> Gold model, product health template, risk score policy draft를 만든다.

출력:

- `l4/gold_model_recommendation_draft.json`
- `l4/product_health_gold_template_draft.json`
- `l4/risk_score_policy_recommendation_draft.json`

필수 규칙:

- Gold는 optional이다.
- `gold_product_health` output schema는 고정할 수 있지만, `risk_score` 공식은 source evidence에 따라 policy draft로 추천한다.
- `conversion_rate`는 numerator와 denominator evidence가 모두 있어야 candidate다.
- `late_delivery_rate`는 delivery denominator evidence가 있어야 candidate다.
- 없는 component는 0점 처리하지 않고 risk coverage에 missing으로 남긴다.

### L8 Vector and Semantic Handoff Draft

역할: M6/vector extension에 넘길 schema/profile/catalog metadata handoff draft를 만든다.

출력:

- `l4/vector_embedding_handoff_template.json`
- `l4/ai_generation_trace.json`

필수 규칙:

- M3 core는 embedding을 만들지 않는다.
- M3 core는 vector index를 유지하지 않는다.
- vector handoff는 numeric correctness evidence가 아니다.
- payload filter key, access policy, blocked raw input이 있어야 한다.

### L9 User Decision and Approval State

역할: L6/L7/L8 draft를 사용자가 승인/수정/보류/거절한다.

출력:

- `l5/silver_policy_decision.json`
- `l5/gold_policy_decision.json`
- `l5/gold_to_gold_policy_decision.json`
- `l5/approval_state.json`
- `l5/recommendation_diff.json`

필수 규칙:

- Silver, Gold, Gold-to-Gold, product health template, risk score policy, vector handoff 승인 상태를 분리한다.
- Gold status는 `not_requested|deferred|needs_owner_review|approved|rejected` 중 하나다.
- Gold가 not requested/deferred여도 Silver approval을 막지 않는다.
- 승인되지 않은 risk score policy는 compile 금지다.

### L10 Silver Deterministic Spec Compiler

역할: 승인된 Silver decision만 deterministic preview spec으로 컴파일한다.

출력:

- `l6/silver_transform_spec.json`

필수 규칙:

- `write_mode=preview_only`
- `input_ref`는 Bronze/Silver working source를 artifact id로 가리킨다.
- `preview_scope`는 `source_unit_ids[]`, `object_ids[]`, `stream_window_ids[]` 중심이다.
- legacy `window_id`는 core schema에서 금지한다.

### L11 Gold Deterministic Spec Compiler

역할: 승인된 Gold decision만 deterministic preview spec으로 컴파일한다.

출력:

- `l6/gold_generation_spec.json`

필수 규칙:

- Gold not requested/deferred는 spec에 non-executable state로 남긴다.
- Gold approved일 때만 operations를 가진다.
- aggregate params는 `input_ref`, `group_by[]`, `dimensions[]`, `measures[]`, `time_window`, `cardinality_guard` 구조다.

### L12 Compiler Validation and Unsupported Action Gate

역할: L10/L11 spec이 M2 preview에 넘겨도 안전한지 검사한다.

출력:

- `l6/compiler_validation_result.json`
- `l6/unsupported_action_report.json`
- `l6/layered_transform_graph.json`

필수 block 조건:

- per-row AI call
- generated code execution
- unbounded collect
- production write
- unsupported action
- legacy `window_id`
- artifact ref resolve 불가

### L13 Silver Preview Evidence Gate

역할: M2/local harness가 L10 spec으로 만든 Silver preview evidence를 검증한다.

출력:

- `l7/silver_preview_ref.json`
- `l7/silver_preview_validation_result.json`
- `l7/pii_exposure_report.json`
- `l7/silver_quality_axis.json`
- `l7/silver_quarantine_report.json`

필수 규칙:

- M3는 preview를 직접 실행했다고 claim하지 않는다.
- execution owner는 M2다.
- PII exposure와 query context exposure를 분리해 검증한다.

### L14 Gold Preview Readiness Gate

역할: M2/local harness가 L11 spec으로 만든 Gold preview evidence 또는 Gold 보류 상태를 readiness input으로 만든다.

출력:

- `l8/gold_preview_ref.json`
- `l8/gold_preview_validation_result.json`
- `l8/metric_definition_draft.json`
- `l8/gold_readiness_input_report.json`
- `l8/semantic_caveat_report.json`

필수 규칙:

- `gold_readiness_axis_ref`가 nullable이면 안 된다. Gold not requested/deferred여도 L15에서 axis artifact는 항상 만들어야 한다.
- Gold status는 `not_requested|deferred|pass|warn|block`으로 명시된다.
- metric definition이 없으면 Gold trusted query context로 노출하지 않는다.

### L15 Three-Axis Readiness Gate

역할: processing quality, catalog safety, gold readiness를 분리 판정한다.

출력:

- `l9/processing_quality_axis.json`
- `l9/catalog_safety_axis.json`
- `l9/gold_readiness_axis.json`
- `l9/gate_summary.json`

필수 precedence rule:

1. Silver readiness는 `processing_quality`와 `catalog_safety`만으로 계산한다.
2. Gold readiness는 Silver readiness 위에 별도 축으로 적용한다.
3. Gold `block|deferred|not_requested`는 Silver status를 오염시키지 못한다.
4. processing 또는 catalog safety가 block이면 Silver와 Gold query context 모두 blocked 또는 not ready다.
5. Gold not requested는 실패가 아니라 `gold_context_status=not_requested`다.

### L16 Catalog, Query, and Vector Handoff Package

역할: M5/M6가 사용할 최종 catalog/query/vector handoff package를 만든다.

출력:

- `l10/catalog_sync_contract_package.json`
- `l10/catalog_metadata_draft.json`
- `l10/sql_context_pack.json`
- `l10/field_level_lineage.json`
- `l10/semantic_catalog_vector_index_template.json`
- `l10/artifact_reference_manifest.json`
- `l10/handoff_package.json`
- `exports/transform_spec.json`
- `exports/schema_definition.json`
- `exports/workflow_definition.json`
- `exports/catalog_metadata.json`

필수 규칙:

- `catalog_sync_contract_package.json`에는 `m6_context_status`가 top-level로 직접 있어야 한다.
- L15 `gate_summary.m6_context_status`, L16 `catalog_sync_contract_package.m6_context_status`, L16 `sql_context_pack.m6_context_status`는 일치해야 한다.
- 불일치하면 catalog sync validation은 block이다.
- allowed query columns는 `query_context_exposure != forbidden`만 포함한다.
- Gold metrics는 Gold context가 `ready|ready_with_caveat`일 때만 SQL context에 들어간다.

## 3. Product Health Gold Contract

`gold_product_health`는 L7에서 template/policy draft로 제안되고, L9에서 승인된 뒤, L11에서 preview spec으로 컴파일된다.

### 3.1 최소 schema

```text
product_id
product_name
category_l1
review_count
average_rating
negative_review_rate
view_count
purchase_count
conversion_rate
delivery_count
late_delivery_rate
risk_score
```

### 3.2 zero denominator

| Metric | Rule |
| --- | --- |
| `average_rating` | rating count가 0이면 null |
| `negative_review_rate` | review count가 0이면 null |
| `conversion_rate` | view count가 0이면 null |
| `late_delivery_rate` | delivery count가 0이면 null |
| `risk_score` | 사용 가능한 approved component가 없으면 null |

### 3.3 risk_score

`risk_score` output column은 고정한다. 하지만 계산식은 모든 source에 전역 고정하지 않는다. L7 risk score policy draft가 source evidence를 보고 component를 추천하고, L9에서 사용자가 승인해야 한다.

지원 가능한 기본 component:

- `negative_review_rate`
- `low_rating_score`
- `low_conversion_score`
- `late_delivery_rate`

없는 component는 0으로 넣지 않는다. 사용 가능한 component만 weight를 재정규화하고, 누락 사유는 `risk_score_coverage`에 남긴다.

## 4. M Handoff Contract

| From -> To | Contract |
| --- | --- |
| M1 -> M3 | L0 source registration, L9 user approval/edit state |
| M3 -> M2 | L10 Silver preview spec, L11 Gold preview spec |
| M2 -> M3 | L13 Silver preview evidence, L14 Gold preview evidence |
| M3 -> M5 | L9 approval state, L16 catalog sync package |
| M3 -> M6 | L16 SQL context, semantic/vector handoff, L15 caveats |

M4는 현재 M3 core contract의 direct producer/consumer로 넣지 않는다. 실제 역할이 배정되면 해당 direct handoff에만 추가한다.

## 5. Extension Hooks

아래 항목은 중요하지만 core에 넣지 않고 hook만 둔다.

| Hook | Hook 위치 | 이유 |
| --- | --- | --- |
| Stream runtime | L0/L10/L11/L16 | offset/checkpoint 이상의 runtime semantics는 M2/infra 책임이다. |
| Watermark/late event | L11/L14/L15 | streaming Gold 운영에는 필요하지만 core onboarding 필수 조건은 아니다. |
| Schema drift/evolution | L2/L15/L16 | 반복 운영 후 확장할 항목이다. |
| Production execution report | M2 extension | L13/L14는 preview evidence다. |
| Unstructured/retrieval | L2/L3/L8/L16 | PDF/image/audio/RAG는 별도 feature family다. |

## 6. Acceptance Checklist

- [ ] 모든 artifact에 `logical_layer`와 `logical_layer_version`이 있다.
- [ ] physical `l0`~`l10` path와 logical `L0`~`L16` mapping이 `layer_map.py`와 일치한다.
- [ ] `*_ref`는 string artifact id이며 `artifact_reference_manifest`에서 resolve된다.
- [ ] L0 `source_units[]` 양방향 consistency가 검증된다.
- [ ] L3 AI input에 raw payload/full row/secret value가 없다.
- [ ] L6/L7/L8 draft는 L9 승인 전 실행되지 않는다.
- [ ] L10/L11 spec은 `write_mode=preview_only`만 허용한다.
- [ ] L12 compiler validation이 unsafe action을 block한다.
- [ ] L15에서 Gold readiness가 Silver readiness를 오염시키지 않는다.
- [ ] Gold not requested/deferred도 L15 `gold_readiness_axis.json`을 만든다.
- [ ] L16 package, gate summary, SQL context의 `m6_context_status`가 일치한다.
- [ ] product-health `risk_score`는 fixed output column이지만 source-adaptive approved policy로 계산된다.

## 7. 최종 판단

M3 v2.1.1의 canonical 계약은 Logical L0-L16이다. physical l0-l10은 compatibility layer일 뿐이다. 이 구분을 문서, 코드 header, report, 발표에서 유지해야 M3가 “T 로직을 설계하고 preview 실행 가능성을 검증하지만, production Spark 실행은 M2로 넘기는 모듈”이라는 역할을 정확히 닫을 수 있다.
