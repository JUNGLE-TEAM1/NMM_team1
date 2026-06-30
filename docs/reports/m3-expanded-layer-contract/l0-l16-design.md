# M3 Logical L0-L16 설계 해설서

이 문서는 M3가 맡는 unknown CSV/JSON/JSONL/Parquet onboarding 흐름을 **논리 L0부터 L16까지** 다시 정리한 canonical 설계 문서다. 기존 `L0-L10` 문서는 큰 덩어리 기준의 초안이었고, 현재 기준은 `tools/m3_contract/layer_map.py`의 `m3.logical_layers.v3_l0_l16`이다.

중요한 구분은 하나다.

- **Logical L0-L16**: 발표, 구현 계약, 판단 기준, M1/M2/M5/M6 handoff에서 쓰는 실제 의미 단계.
- **Physical l0-l10**: 기존 artifact id와 폴더 호환성을 위해 남긴 저장 위치. 예를 들어 논리 L16 산출물은 물리 `l10/` 폴더에 저장된다.

M3는 대용량 데이터를 직접 모두 정제하는 실행 엔진이 아니다. M3는 raw source를 안전하게 추적하고, bounded profile/sample을 근거로 Silver/Gold 생성 방식을 추천하며, 사람이 수정/승인한 결과를 M2가 실행할 수 있는 deterministic preview spec으로 고정하고, M5/M6가 쓸 catalog/query/vector context를 넘기는 control-plane이다.

## 1. 전체 선택안

| Logical Layer | 이름 | 한 줄 역할 | 물리 산출물 위치 |
| --- | --- | --- | --- |
| `L0` | Raw Source Unit Manifest | 원본을 복제하지 않고 `source_unit_id` 중심으로 replay 가능한 source 단위를 고정한다. | `l0/*` |
| `L1` | Bronze Envelope and Rescue Lane | 정상 parse record와 parse failure를 모두 잃지 않는 Bronze envelope를 만든다. | `l1/*` |
| `L2` | Profile and Data Shape Snapshot | CSV/JSON/JSONL/Parquet마다 다른 profile, schema, type, PII 후보 evidence를 만든다. | `l2/*` |
| `L3` | AI-Safe Evidence Reduction | AI가 볼 수 있는 bounded/redacted evidence pack만 만든다. | `l3/ai_recommendation_input_pack.json`, `l3/redaction_map.json` |
| `L4` | Metadata and Template Retrieval | schema/profile/catalog evidence로 Gold template, vector/search 후보를 찾는다. | `l3/metadata_retrieval_index_plan.json`, `l3/gold_template_candidate_retrieval.json` |
| `L5` | Candidate Grounding Gate | 후보가 실제 source evidence를 갖췄는지 막거나 통과시킨다. | `l3/candidate_grounding_report.json` |
| `L6` | Silver Recommendation Draft | Bronze -> Silver 정제, typing, masking, quarantine 정책 draft를 만든다. | `l4/silver_policy_recommendation_draft.json` |
| `L7` | Gold Recommendation Draft | Silver -> Gold 모델, product health, risk score policy draft를 만든다. | `l4/gold_model_recommendation_draft.json`, `l4/product_health_gold_template_draft.json`, `l4/risk_score_policy_recommendation_draft.json` |
| `L8` | Vector and Semantic Handoff Draft | vectorDB/semantic search에 넘길 schema/profile/catalog metadata 후보를 만든다. | `l4/vector_embedding_handoff_template.json`, `l4/ai_generation_trace.json` |
| `L9` | User Decision and Approval State | 사용자가 Silver, Gold, Gold-to-Gold, risk, vector handoff를 승인/보류/거절한다. | `l5/*_policy_decision.json`, `l5/approval_state.json` |
| `L10` | Silver Deterministic Spec Compiler | 승인된 Silver 결정을 M2 preview 실행용 deterministic spec으로 컴파일한다. | `l6/silver_transform_spec.json` |
| `L11` | Gold Deterministic Spec Compiler | 승인된 Gold 결정을 optional deterministic preview spec으로 컴파일한다. | `l6/gold_generation_spec.json` |
| `L12` | Compiler Validation and Unsupported Action Gate | per-row AI, generated code, unbounded collect, production write, unsupported action을 막는다. | `l6/compiler_validation_result.json`, `l6/unsupported_action_report.json`, `l6/layered_transform_graph.json` |
| `L13` | Silver Preview Evidence Gate | M2/local harness가 실행한 Silver preview evidence를 검증한다. | `l7/silver_preview_validation_result.json`, `l7/pii_exposure_report.json` |
| `L14` | Gold Preview Readiness Gate | Gold preview evidence, metric definition, semantic caveat를 검증한다. | `l8/gold_readiness_input_report.json`, `l8/metric_definition_draft.json` |
| `L15` | Three-Axis Readiness Gate | processing quality, catalog safety, gold readiness를 분리해 최종 판정한다. | `l9/gate_summary.json`, `l9/*_axis.json` |
| `L16` | Catalog, Query, and Vector Handoff Package | M5 catalog 저장과 M6 SQL/AI/vector 질의 context로 넘길 package를 만든다. | `l10/*`, `exports/*` |

## 2. 전체 흐름

```text
M1 source registration
-> L0 raw source unit manifest
-> L1 bronze envelope / rescue lane
-> L2 profile / data shape snapshot
-> L3 AI-safe evidence reduction
-> L4 metadata / template retrieval
-> L5 candidate grounding gate
-> L6 Silver recommendation draft
-> L7 Gold recommendation draft
-> L8 vector / semantic handoff draft
-> L9 user decision / approval state
-> L10 Silver deterministic preview spec
-> L11 Gold deterministic preview spec
-> L12 compiler validation / unsupported action gate
-> M2 preview execution
-> L13 Silver preview evidence gate
-> L14 Gold preview readiness gate
-> L15 three-axis readiness gate
-> L16 M5 catalog / M6 query / vector handoff package
```

실제 실행 경계는 명확하다.

| 연결 | 실제 흐름 |
| --- | --- |
| M1 -> M3 | M1은 source 등록 정보를 L0에 주고, 사용자의 승인/수정/보류/거절 상태를 L9에 준다. |
| M3 -> M2 | M3는 L10 Silver spec과 L11 Gold spec을 `write_mode=preview_only`로 넘긴다. M2는 Spark 또는 동등 실행 엔진으로 preview를 수행한다. |
| M2 -> M3 | M2는 preview result, row count, schema, quality, metric evidence를 L13/L14에 돌려준다. |
| M3 -> M5 | M3는 L9 approval state와 L16 catalog sync package를 넘긴다. M5는 workflow, artifact, catalog state를 저장한다. |
| M3 -> M6 | M3는 L16 SQL context와 semantic/vector handoff template을 넘긴다. M6는 L15 caveat와 exposure rule을 보고 query context로 사용한다. |

## 3. 설계 원칙

### 3.1 Raw data-plane과 AI control-plane 분리

20GB, 50GB, 100GB급 파일이나 실시간 유입 데이터를 모두 AI에 넣는 구조는 현실적이지 않다. AI는 L2 profile과 L3 redacted evidence pack만 보고 추천한다. 원본 전체 처리와 preview 실행은 deterministic spec과 M2 실행 계층이 맡는다.

### 3.2 추천, 승인, 컴파일 분리

L6/L7/L8은 draft다. AI 또는 deterministic heuristic이 만든 추천일 뿐이다. L9에서 사용자가 승인/보류/거절한 decision만 L10/L11 compiler로 넘어간다. 이 분리가 없으면 “AI가 말한 것”, “사용자가 승인한 것”, “실행 가능한 spec”이 섞인다.

### 3.3 Silver와 Gold 분리

Silver는 source 구조를 안정화하고 안전하게 질의 가능한 형태로 만드는 정제 계층이다. Gold는 metric, aggregate, semantic model, owner meaning이 들어간 분석 계층이다. Gold가 `not_requested`, `deferred`, `needs_owner_review`, `rejected`여도 Silver가 processing/catalog safety를 통과하면 ready일 수 있어야 한다.

### 3.4 preview-only 실행 경계

L10/L11 spec은 `write_mode=preview_only`만 허용한다. production write, sink commit, watermark runtime, retry/rollback은 M3 core가 아니라 M2/infra/extension hook 책임이다.

### 3.5 Catalog exposure와 query context exposure 분리

어떤 필드는 Silver output에는 남아도 catalog default visible이면 안 된다. 어떤 필드는 catalog에는 hidden으로 존재해도 M6 query context에는 포함되면 안 된다. 그래서 `pii_handling`, `catalog_exposure`, `query_context_exposure`를 분리한다.

## 4. Main Artifact Map

| Logical Layer | 주요 파일 | 다음 단계가 쓰는 이유 |
| --- | --- | --- |
| `L0` | `l0/object_stream_manifest.json`, `l0/source_manifest.json`, `l0/raw_replay_pointer.json` | L1이 같은 source unit을 다시 읽고 record locator를 만들기 위해 필요하다. |
| `L1` | `l1/bronze_envelope_samples.jsonl`, `l1/rescue_lane.jsonl`, `l1/bronze_envelope_spec.json` | L2가 정상 sample과 failure/rescue policy를 함께 profile해야 한다. |
| `L2` | `l2/profile_snapshot.json`, `l2/format_detection.json`, `l2/schema_fingerprint.json` | L3가 raw 대신 profile만 사용해 AI-safe evidence를 만든다. |
| `L3` | `l3/ai_recommendation_input_pack.json`, `l3/field_evidence_reducer.json`, `l3/redaction_map.json` | L4/L5/L6/L7/L8이 raw 없이 추천 근거를 읽는다. |
| `L4` | `l3/metadata_retrieval_index_plan.json`, `l3/gold_template_candidate_retrieval.json` | template/vector 후보 검색이 값 정확성 증거가 아니라 후보 검색임을 고정한다. |
| `L5` | `l3/candidate_grounding_report.json` | Gold/product health/vector 후보가 실제 source evidence를 갖췄는지 gate한다. |
| `L6` | `l4/silver_policy_recommendation_draft.json` | L9 UI가 Silver 정제 정책을 수정/승인할 수 있다. |
| `L7` | `l4/gold_model_recommendation_draft.json`, `l4/product_health_gold_template_draft.json`, `l4/risk_score_policy_recommendation_draft.json` | L9 UI가 Gold와 risk score policy를 따로 승인/보류할 수 있다. |
| `L8` | `l4/vector_embedding_handoff_template.json`, `l4/ai_generation_trace.json` | M6/vector extension이 schema/profile/catalog search 후보를 알 수 있다. |
| `L9` | `l5/approval_state.json`, `l5/silver_policy_decision.json`, `l5/gold_policy_decision.json` | L10/L11 compiler가 AI draft가 아니라 승인된 decision만 컴파일한다. |
| `L10` | `l6/silver_transform_spec.json` | M2가 Silver preview를 실행할 deterministic input이다. |
| `L11` | `l6/gold_generation_spec.json` | M2가 approved Gold preview를 실행할 deterministic input이다. |
| `L12` | `l6/compiler_validation_result.json`, `l6/unsupported_action_report.json` | M2 실행 전에 unsafe/unsupported spec을 block한다. |
| `L13` | `l7/silver_preview_validation_result.json`, `l7/pii_exposure_report.json` | L15가 processing quality와 catalog safety를 판정한다. |
| `L14` | `l8/gold_readiness_input_report.json`, `l8/metric_definition_draft.json` | L15가 Gold readiness를 판정한다. |
| `L15` | `l9/processing_quality_axis.json`, `l9/catalog_safety_axis.json`, `l9/gold_readiness_axis.json`, `l9/gate_summary.json` | L16이 M5/M6에 넘길 최종 status와 caveat를 만든다. |
| `L16` | `l10/catalog_sync_contract_package.json`, `l10/catalog_metadata_draft.json`, `l10/sql_context_pack.json`, `l10/semantic_catalog_vector_index_template.json`, `l10/artifact_reference_manifest.json`, `exports/*.json` | M5 catalog 저장과 M6 query/vector context 생성의 최종 handoff다. |

## 5. Product Health Gold 위치

`gold_product_health`는 L7에서 draft로 제안되고, L9에서 사용자가 승인해야 하며, L11에서 deterministic Gold spec으로 컴파일된다. L14/L15에서 metric evidence와 readiness를 검증한 뒤에만 L16 SQL/catalog context에 trusted metric으로 노출된다.

최소 output column 이름은 고정할 수 있다.

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

하지만 `risk_score` 계산식은 모든 dataset에 전역 고정하면 안 된다. L7의 `risk_score_policy_recommendation_draft.json`이 source evidence를 보고 component와 weight를 추천하고, L9에서 사용자가 승인해야 한다. 사용 가능한 component가 없으면 `risk_score = null`이며, missing component는 0점으로 넣지 않고 `risk_score_coverage`에 남긴다.

## 6. 가능 범위와 한계

이 설계는 unknown CSV, JSON, JSONL, Parquet source를 대상으로 한다. CSV는 delimiter/header/quote/null token 추정, JSON/JSONL은 path trie와 nested field profile, Parquet은 schema/statistics 중심 profile을 만들 수 있다. 대용량에서는 전체 row를 AI에 넣지 않고 sample, sketch, count, histogram, null ratio, failure summary, redacted examples만 L3로 넘긴다.

실시간성은 core runtime 처리가 아니라 micro-batch/window 단위 `source_unit_id` 처리로 다룬다. full streaming state, watermark enforcement, late event merge는 M3 core가 아니라 extension hook 또는 M2/infra 책임이다.

## 7. 최종 판단

L0-L16 분해는 계층을 늘리기 위한 분해가 아니라 실패 원인과 책임자를 정확히 나누기 위한 분해다. L3/L4/L5는 AI evidence, retrieval, grounding을 분리한다. L6/L7/L8은 Silver, Gold, vector draft를 분리한다. L10/L11/L12는 Silver spec, Gold spec, compiler validation을 분리한다. L13/L14/L15/L16은 preview evidence, readiness, catalog/query handoff를 분리한다.

이 구조가 유지되어야 M3가 “T 로직을 설계하고 preview 실행 가능성을 검증하지만, 실제 production Spark 실행은 M2로 넘기는 역할”을 명확히 끝낼 수 있다.
