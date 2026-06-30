# M3 Logical L0-L16 Split Layer Map

## 1. 왜 L0-L10을 L0-L16으로 쪼갰는가

기존 L0-L10은 큰 흐름을 설명하기에는 충분했지만, 발표와 구현 계약 관점에서는 L3, L4, L6이 너무 넓었다. 특히 L3 안에는 AI-safe evidence 생성, metadata/vector retrieval 후보, Gold 후보 grounding이 같이 들어가 있었고, L4 안에는 Silver draft, Gold draft, vector handoff draft가 같이 들어가 있었다. L6도 Silver spec, Gold spec, compiler validation을 한 단계로 묶고 있어서 “무엇이 실패했는지”, “누가 수정해야 하는지”, “어느 M으로 넘겨야 하는지”가 흐려졌다.

새 구조는 실행 책임과 승인 책임 기준으로 나눈다. AI가 볼 수 있는 입력을 만드는 단계, AI/검색이 후보를 찾는 단계, 후보가 실제 데이터 증거를 갖췄는지 막는 단계, 사용자가 고르는 단계, deterministic spec으로 고정하는 단계, M2 실행 증거를 받아 gate하는 단계를 분리한다. 이러면 unknown CSV/JSON/JSONL/반정형 데이터에서도 “AI 추천은 control-plane”, “Spark/MinIO/local harness 실행은 검증용 또는 M2 runtime 영역”, “M3의 실제 산출물은 spec/catalog/handoff”라는 경계가 유지된다.

중요한 호환성 규칙은 그대로 둔다. 실제 파일 폴더와 artifact id는 기존 `l0`~`l10` 물리 위치를 유지한다. 대신 모든 JSON artifact는 `physical_layer`, `logical_layer`, `logical_layer_version`을 함께 가진다. 따라서 기존 참조는 깨지지 않고, 새 발표/계약 기준은 `logical_layer = L0~L16`으로 읽으면 된다.

## 2. 전체 흐름 한 줄 요약

```text
M1 source registration
-> L0 raw identity
-> L1 bronze envelope
-> L2 profile/data shape
-> L3 AI-safe evidence
-> L4 metadata/template retrieval
-> L5 candidate grounding
-> L6 Silver draft
-> L7 Gold draft
-> L8 vector/semantic draft
-> L9 user approval
-> L10 Silver spec
-> L11 Gold spec
-> L12 compiler safety gate
-> M2 preview execution
-> L13 Silver preview evidence
-> L14 Gold preview evidence
-> L15 readiness gate
-> L16 M5/M6 catalog/query/vector handoff
```

## 3. Old -> New mapping

| Old | New | 의미 변화 |
| --- | --- | --- |
| `L0` | `L0` | 원본 source unit, object/window, checksum, replay locator 보존. |
| `L1` | `L1` | Bronze envelope와 rescue lane. |
| `L2` | `L2` | CSV/JSON/JSONL profile, schema snapshot, data shape contract. |
| `L3` | `L3 + L4 + L5` | AI-safe evidence, metadata/template retrieval, candidate grounding을 분리. |
| `L4` | `L6 + L7 + L8` | Silver recommendation, Gold recommendation, vector/semantic handoff draft를 분리. |
| `L5` | `L9` | 사용자 수정/승인 상태. 새 구조에서는 Silver, Gold, Gold-to-Gold, risk policy, vector handoff를 각각 승인 상태로 둔다. |
| `L6` | `L10 + L11 + L12` | Silver spec, Gold spec, compiler validation을 분리. |
| `L7` | `L13` | Silver preview evidence gate. |
| `L8` | `L14` | Gold preview readiness gate. |
| `L9` | `L15` | processing/catalog/gold 3-axis readiness gate. Gold 실패가 Silver context를 오염시키지 않는다. |
| `L10` | `L16` | catalog sync, SQL context, semantic/vector handoff package. |

## 4. 새 L0-L16 단계별 정의

| Layer | 한마디 정의 | 입력 | 출력 | 실제로 보는 파일 |
| --- | --- | --- | --- | --- |
| `L0` | raw를 변환하지 않고 다시 찾을 수 있게 source unit 단위로 고정한다. | M1 source 등록 정보, local/MinIO/object path | object/window manifest, checksum, replay locator | `l0/object_stream_manifest.json`, `l0/source_manifest.json` |
| `L1` | raw 일부를 Bronze envelope로 감싸고 parse 실패를 rescue lane으로 보존한다. | L0 manifest | bronze sample manifest, rescue lane, envelope spec | `l1/bronze_envelope_samples.manifest.json`, `l1/rescue_lane.manifest.json` |
| `L2` | unknown CSV/JSON/JSONL의 형태, 필드, 타입, PII 후보, data shape을 profile로 만든다. | L1 bounded samples | profile snapshot, format profile, schema fingerprint | `l2/profile_snapshot.json`, `l2/format_profile.json` |
| `L3` | AI가 봐도 되는 bounded/redacted evidence만 만든다. | L2 profile | AI input pack, field reducer, redaction map, policy context | `l3/ai_recommendation_input_pack.json`, `l3/unknown_data_recommendation_pack.json` |
| `L4` | profile/catalog/schema evidence로 가능한 template 후보를 찾는다. | L3 evidence | metadata retrieval index plan, Gold template candidate retrieval | `l3/metadata_retrieval_index_plan.json`, `l3/gold_template_candidate_retrieval.json` |
| `L5` | 후보가 실제 데이터 증거를 갖췄는지 막거나 통과시킨다. | L4 candidates | candidate grounding report | `l3/candidate_grounding_report.json` |
| `L6` | Bronze -> Silver 정제 정책을 draft로 추천한다. | L3/L5 evidence | silver policy recommendation draft | `l4/silver_policy_recommendation_draft.json` |
| `L7` | Silver -> Gold 모델, product health, risk policy를 draft로 추천한다. | L5 grounded candidate | gold model draft, product health template, risk score policy | `l4/gold_model_recommendation_draft.json`, `l4/product_health_gold_template_draft.json` |
| `L8` | vectorDB/semantic search에 넘길 후보 field와 안전 정책을 draft로 만든다. | L3 evidence, L5 grounding | vector embedding handoff template, AI generation trace | `l4/vector_embedding_handoff_template.json`, `l4/ai_generation_trace.json` |
| `L9` | 사용자가 Silver/Gold/Gold-to-Gold/risk/vector를 승인, 보류, 거절한다. | M1 UI edits, M5 stored state, L6-L8 drafts | approval state, policy decisions, recommendation diff | `l5/approval_state.json`, `l5/*_policy_decision.json` |
| `L10` | 승인된 Silver 결정을 deterministic preview-only spec으로 컴파일한다. | L9 Silver approval | Silver transform spec | `l6/silver_transform_spec.json` |
| `L11` | 승인된 Gold 결정을 deterministic preview-only spec으로 컴파일한다. | L9 Gold approval | Gold generation spec | `l6/gold_generation_spec.json` |
| `L12` | spec이 안전한지 검사하고 unsupported action을 막는다. | L10/L11 specs | compiler validation, unsupported action report, layer graph | `l6/compiler_validation_result.json`, `l6/unsupported_action_report.json` |
| `L13` | M2/local harness가 실행한 Silver preview evidence를 검증한다. | M2 preview result over L10 spec | Silver preview validation, PII exposure, quarantine report | `l7/silver_preview_validation_result.json`, `l7/pii_exposure_report.json` |
| `L14` | M2/local harness가 실행한 Gold preview evidence와 semantic caveat를 검증한다. | M2 preview result over L11 spec | Gold readiness input, metric definition, semantic caveat | `l8/gold_readiness_input_report.json`, `l8/metric_definition_draft.json` |
| `L15` | processing, catalog safety, gold readiness를 3축으로 판정한다. | L13 Silver evidence, L14 Gold evidence | gate summary, three axis reports | `l9/gate_summary.json`, `l9/*_axis.json` |
| `L16` | M5/M6가 쓰는 catalog, SQL context, lineage, vector handoff package를 묶는다. | L15 gate + all refs | catalog sync package, SQL context, semantic vector template, exports | `l10/catalog_sync_contract_package.json`, `l10/sql_context_pack.json`, `exports/*.json` |

## 5. M 연결을 실제 실행 흐름 기준으로만 적으면

| 흐름 | 실제 연결 |
| --- | --- |
| M1 -> M3 | M1이 source 등록과 사용자 decision UI를 제공한다. M3는 L0에서 source identity를 받고, L9에서 사용자의 승인/보류/거절 상태를 받는다. |
| M3 -> M2 | M3는 L10 Silver spec과 L11 Gold spec을 `write_mode=preview_only`로 넘긴다. M2는 Spark/local runner로 실행하고, 실행 증거를 L13/L14로 돌려준다. |
| M3 -> M5 | M3는 L9 approval state와 L16 catalog sync package를 넘긴다. M5는 workflow state, artifact refs, catalog 저장을 담당한다. |
| M3 -> M6 | M3는 L16 SQL context와 semantic/vector handoff template을 넘긴다. M6는 L15 caveat와 exposure rule을 보고 query context로 사용한다. |

M4는 현재 이 M3 core contract의 직접 producer/consumer로 넣지 않는다. 실제 프로젝트에서 M4가 특정 UI, monitoring, 또는 execution result producer 역할을 맡는다는 계약이 생기면 그때 해당 단계의 direct handoff에만 추가한다.

## 6. 판단 기준을 어디서 적용하는가

| 판단 | 적용 Layer | 기준 |
| --- | --- | --- |
| unknown data를 AI에 보낼 수 있는가 | `L3` | raw payload 금지, PII redaction, field evidence cap, row-level AI call 0. |
| product health Gold 후보가 가능한가 | `L4` + `L5` | product/entity key, rating/review evidence, conversion denominator, delivery evidence를 분리해서 확인. |
| Silver 정책을 바로 spec으로 만들 수 있는가 | `L6` -> `L9` -> `L10` | draft가 있어도 L9 승인 전에는 deterministic spec으로 고정하지 않는다. |
| Gold를 만들 수 있는가 | `L7` -> `L9` -> `L11` | Gold는 not_requested/deferred/approved/rejected를 명시한다. 승인 전 Gold spec은 비어 있거나 deferred 상태여야 한다. |
| vectorDB가 정확도를 올리는가 | `L8` + `L16` | schema/profile/catalog 검색 정확도는 올릴 수 있지만 metric 값의 수치 정확도 증거가 될 수는 없다. |
| spec이 Spark로 안전한가 | `L12` | generated code, per-row AI, unbounded collect, production write, legacy window_id를 block. |
| Silver와 Gold readiness가 섞이지 않는가 | `L15` | Silver는 processing_quality + catalog_safety로 판정하고, Gold readiness는 별도 축으로만 적용한다. |
| M6가 질의해도 되는가 | `L16` | L15 `m6_context_status`, exposure rule, allowed columns, query caveat를 함께 넘긴다. |

## 7. 구현 반영 규칙

1. 모든 새 JSON artifact에는 `artifact_header.logical_layer`, top-level `logical_layer`, `logical_layer_version`을 넣는다.
2. 기존 artifact id와 파일 위치는 유지한다. 예를 들어 `l4/product_health_gold_template_draft.json`은 물리적으로는 `l4`지만 논리적으로는 `L7`이다.
3. `run_summary.json`에는 `layer_contract_version`, `split_summary`, `logical_layers`를 넣어 전체 L0-L16을 한 번에 검증할 수 있게 한다.
4. `l6/layered_transform_graph.json`은 더 이상 L0-L10 노드만 만들지 않고, L0-L16 노드와 edge를 만든다.
5. 기존 `*_ref`는 물리 artifact id를 유지한다. ref resolution은 L16 `artifact_reference_manifest.json`에서 한다.
