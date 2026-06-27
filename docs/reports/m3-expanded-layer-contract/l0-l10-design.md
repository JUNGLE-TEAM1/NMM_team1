# M3 L0-L10 설계 해설서

이 문서는 M3가 맡는 unknown CSV/JSON/JSONL/Parquet onboarding 흐름을 L0부터 L10까지 읽기 쉬운 설계 문서로 정리한 것이다. 기존 계약 문서인 `selected-improvement-contract-v2.1.md`가 필수 schema와 validator rule을 고정한다면, 이 문서는 왜 그런 계층을 택했는지, 각 계층이 어떤 파일을 만들고 어떤 팀 모듈로 넘기는지, 무엇까지 가능하고 무엇은 한계인지 설명한다.

핵심 판단은 단순하다. M3는 대용량 데이터를 직접 모두 정제하는 실행 엔진이 아니다. M3는 raw source를 안전하게 추적하고, 일부 profile과 sample을 근거로 Silver/Gold 생성 방식을 추천하며, 사람이 수정/승인한 결과를 M2가 실행할 수 있는 deterministic spec으로 고정하고, M5/M6가 쓸 catalog/query context를 넘기는 control-plane이다. 따라서 AI는 L3-L4의 추천 구간에만 들어가고, L6 이후는 compiler, preview, gate, catalog handoff로 처리한다.

## 1. 전체 선택안

| Layer | 선택안 | 한 줄 역할 |
| --- | --- | --- |
| `L0` | Object + Stream Hybrid Manifest | 원본을 복제하지 않고 `source_unit_id` 중심으로 replay 가능한 source 단위를 고정한다. |
| `L1` | Bronze Envelope + Rescue Lane | 정상 parse record와 parse failure를 모두 잃지 않는 bronze envelope를 만든다. |
| `L2` | Format-specialized Profile Pack | CSV/JSON/JSONL/Parquet마다 다른 profile evidence를 만든다. |
| `L3` | Redaction-first AI Evidence Pack | AI가 볼 수 있는 안전하고 제한된 evidence pack을 만든다. |
| `L4` | Strict Silver/Gold Recommendation Draft | AI가 Silver policy와 Gold model 후보를 strict schema로 추천한다. |
| `L5` | Approval and Decision Contract | 사용자가 Silver/Gold 추천을 각각 수정, 승인, 보류, 거절한다. |
| `L6` | Preview-only Deterministic Spec Compiler | 승인된 decision만 M2 preview 실행용 deterministic spec으로 compile한다. |
| `L7` | Silver Preview Validation | M2가 실행한 Silver preview 결과를 구조, 타입, PII, quarantine 관점으로 검증한다. |
| `L8` | Gold Preview Input Report | Gold preview와 metric/semantic readiness 판단에 필요한 input report를 만든다. |
| `L9` | Three-axis Quality Gate | processing quality, catalog safety, gold readiness를 분리해 최종 상태를 판정한다. |
| `L10` | Catalog and Query Context Handoff | M5 catalog 저장과 M6 SQL/AI 질의 context로 넘길 package를 만든다. |

## 2. 전체 흐름

```text
M1 source registration
-> L0 source unit manifest
-> L1 bronze envelope and rescue lane
-> L2 format-specialized profile snapshot
-> L3 redacted AI recommendation input pack
-> L4 silver/gold recommendation drafts
-> L5 user decision and approval state
-> L6 preview-only deterministic specs
-> M2 L7 silver preview execution and validation
-> M2 L8 gold preview input/report
-> L9 three-axis gate
-> L10 M5 catalog package and M6 query context package
```

실제 실행 경계는 명확하다. M1은 source 등록 정보를 준다. M3는 L0-L6에서 분석, 추천, 결정 계약, preview spec을 만든다. M2는 L6 spec을 받아 Spark나 동등한 실행 엔진으로 preview를 수행한다. M3는 M2의 preview 결과를 다시 L7-L9에서 해석하고 gate를 만든다. M5는 artifact와 approval/catalog state를 저장한다. M6는 L10 query context를 사용해 SQL/AI 질의를 안전하게 수행한다.

## 3. 설계 원칙

첫째, raw data-plane과 AI control-plane은 분리한다. 20GB, 50GB, 100GB급 파일이나 실시간 유입 데이터를 모두 AI에 넣는 구조는 현실적이지 않다. AI는 L2 profile과 L3 redacted evidence pack만 보고 추천한다. 원본 전체 처리와 preview 실행은 deterministic spec과 M2 실행 계층이 맡는다.

둘째, 모든 계층은 `artifact_id` 기반 reference를 사용한다. `*_ref` 필드에 URI, checksum, metadata object를 직접 넣지 않는다. 모든 ref는 string artifact id이고, 실제 위치, 크기, checksum, access class는 `artifact_reference_manifest.json`에서 resolve한다. 이 규칙이 없으면 catalog, approval, preview evidence가 서로 다른 파일을 가리키는 문제가 생긴다.

셋째, Silver와 Gold는 의도적으로 분리한다. Silver는 source 구조를 안정화하고 안전하게 질의 가능한 형태로 만드는 정제 계층이다. Gold는 metric, aggregate, semantic model, owner meaning이 들어간 분석 계층이다. Silver가 승인되어도 Gold는 `not_requested`, `deferred`, `needs_owner_review`, `blocked`가 될 수 있어야 한다.

넷째, L6 이후의 spec은 preview-only다. L6 spec은 production write를 허용하지 않는다. `write_mode=preview_only`만 허용해야 M3가 운영 테이블을 직접 덮어쓰는 책임 범위로 밀려나지 않는다. production execution, watermark runtime, sink commit, retry/rollback은 core가 아니라 extension hook 또는 M2/infra 계약이다.

다섯째, catalog에 올릴 수 있는 정보와 query context에 넣을 수 있는 정보는 별도 검증한다. 어떤 필드는 Silver physical output에는 남아도 catalog default visible이면 안 된다. 어떤 필드는 catalog에는 hidden으로 존재해도 M6 query context에는 포함되면 안 된다. 그래서 PII handling, catalog exposure, query context exposure를 분리한다.

## 4. Main Artifact Map

| Layer | 주요 파일 | 다음 계층이 이 파일을 쓰는 이유 |
| --- | --- | --- |
| `L0` | `l0/object_stream_manifest.json` | L1이 같은 source unit을 다시 읽고 record locator를 만들기 위해 필요하다. |
| `L1` | `l1/bronze_envelope_samples.jsonl`, `l1/rescue_lane.jsonl` | L2가 정상 sample과 failure summary를 함께 profile해야 한다. |
| `L2` | `l2/profile_snapshot.json`, format별 profile files | L3가 AI input evidence를 만들 때 raw 대신 profile만 사용한다. |
| `L3` | `l3/ai_recommendation_input_pack.json`, `l3/redaction_map.json` | L4 AI model이 볼 수 있는 안전한 입력 범위를 고정한다. |
| `L4` | `l4/silver_policy_recommendation_draft.json`, `l4/gold_model_recommendation_draft.json` | L5 UI가 추천을 수정/승인할 수 있는 structured draft다. |
| `L5` | `l5/silver_policy_decision.json`, `l5/gold_policy_decision.json`, `l5/approval_state.json` | L6 compiler가 AI draft가 아니라 승인된 decision만 compile한다. |
| `L6` | `l6/silver_transform_spec.json`, `l6/gold_generation_spec.json`, `l6/compiler_validation_result.json` | M2 preview 실행의 deterministic input이다. |
| `L7` | `l7/silver_preview_validation_result.json`, `l7/pii_exposure_report.json` | L9가 Silver processing quality와 catalog safety를 판정한다. |
| `L8` | `l8/gold_readiness_input_report.json`, `l8/metric_definition_draft.json` | L9가 Gold readiness를 최종 판정할 근거다. |
| `L9` | `l9/processing_quality_axis.json`, `l9/catalog_safety_axis.json`, `l9/gold_readiness_axis.json`, `l9/gate_summary.json` | L10이 M5/M6로 넘길 최종 status와 caveat를 만든다. |
| `L10` | `l10/catalog_sync_contract_package.json`, `l10/catalog_metadata_draft.json`, `l10/sql_context_pack.json`, `l10/artifact_reference_manifest.json` | M5 catalog 저장과 M6 query context 생성의 최종 handoff다. |

## 5. 선택 이유 요약

현재 조합을 택한 이유는 대용량과 unknown structure를 동시에 다루기 위해서다. 단순한 “AI가 json 구조를 보고 정제 추천” 방식은 작은 demo에는 맞지만, CSV dialect mismatch, JSON nested array, JSONL malformed line, Parquet schema mismatch, PII exposure, Gold semantic ambiguity를 모두 설명하기 어렵다. 반대로 처음부터 streaming production runtime, watermark, drift operation까지 core에 넣으면 M3 범위가 M2/infra와 섞여 제품 경계가 흐려진다.

따라서 core는 source unit, bronze rescue, format profile, redacted AI evidence, strict recommendation, approval, preview-only spec, preview validation, three-axis gate, catalog/query handoff까지만 책임진다. stream runtime, watermark, schema drift, production execution, unstructured/retrieval은 extension hook으로 위치만 둔다. 이 방식이 팀 프로젝트 안에서 “지금 구현 가능한 core”와 “나중에 확장할 수 있는 운영 기능”을 분리한다.

## 6. 가능 범위

이 설계는 unknown CSV, JSON, JSONL, Parquet source를 대상으로 한다. CSV는 delimiter/header/quote/null token 추정, JSON/JSONL은 path trie와 nested field profile, Parquet은 schema/statistics 중심 profile을 만들 수 있다. 대용량에서는 전체 row를 AI에 넣지 않고 sample, sketch, count, histogram, null ratio, failure summary, redacted examples만 L3로 넘긴다.

실시간성은 “core runtime 처리”가 아니라 “micro-batch/window 단위 source_unit 처리”로 다룬다. 즉 L0에서 stream window나 object batch를 같은 `source_unit_id`로 묶고, L1-L10은 해당 unit을 기준으로 reproducible artifact를 만든다. full streaming state, watermark enforcement, late event merge는 M3 core가 아니라 extension hook 또는 M2/infra로 넘긴다.

## 7. 한계와 비범위

M3는 production data writer가 아니다. L6 spec은 preview-only이고, production write mode를 지원하지 않는다. M3는 AI가 추천한 내용을 사람이 보지 않고 자동으로 운영 catalog에 publish하는 구조도 아니다. L5 approval과 L9 gate가 있어야 L10 handoff가 안전하다.

또한 M3 core는 PDF, image, audio 같은 unstructured source를 본격적으로 처리하지 않는다. unstructured/retrieval은 별도 extension hook이다. schema drift도 반복 실행과 운영 관측이 충분히 쌓인 뒤 별도 report로 확장할 항목이지, 첫 core 계약에 복잡한 evolution policy를 억지로 넣을 항목은 아니다.

## 8. 계층별 상세 문서

| Layer | 상세 문서 |
| --- | --- |
| `L0` | [L0 Raw Preservation](layers/l0-raw-preservation.md) |
| `L1` | [L1 Bronze Envelope](layers/l1-bronze-envelope.md) |
| `L2` | [L2 Profile Snapshot](layers/l2-profile-snapshot.md) |
| `L3` | [L3 AI Evidence Pack](layers/l3-ai-evidence-pack.md) |
| `L4` | [L4 Recommendation Draft](layers/l4-recommendation-draft.md) |
| `L5` | [L5 Decision Approval](layers/l5-decision-approval.md) |
| `L6` | [L6 Spec Compiler](layers/l6-spec-compiler.md) |
| `L7` | [L7 Silver Preview](layers/l7-silver-preview.md) |
| `L8` | [L8 Gold Preview Input](layers/l8-gold-preview-input.md) |
| `L9` | [L9 Three-axis Gate](layers/l9-three-axis-gate.md) |
| `L10` | [L10 Catalog Handoff](layers/l10-catalog-handoff.md) |

## 9. 최종 판단

L0-L10 분해는 계층이 많아 보이지만 실제로는 책임을 작게 자른 것이다. 특히 L3-L6을 쪼갠 이유가 중요하다. L3는 AI 입력, L4는 AI 추천, L5는 사용자 결정, L6은 deterministic compile이다. 이 네 구간을 분리하지 않으면 “AI가 추천한 것”, “사용자가 승인한 것”, “M2가 실행할 수 있는 것”이 섞인다.

이 설계의 가장 큰 장점은 설명 가능성과 안전성이다. 어떤 필드가 왜 drop/hash/mask/cast되었는지, Gold가 왜 준비되지 않았는지, catalog에는 왜 안 보이는지, M6 query context에는 왜 빠졌는지를 artifact chain으로 추적할 수 있다. 가장 큰 단점은 산출물이 많아진다는 점이다. 그러나 산출물 수 증가보다 위험한 것은 raw, AI recommendation, approval, execution spec, catalog state가 한 파일 안에서 섞이는 것이다.
