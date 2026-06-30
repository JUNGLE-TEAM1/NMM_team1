# M3 Core Logical L9-L16 및 Layer Map 코드 해설

이 문서는 M3 core의 뒤쪽 절반을 **logical L9-L16 기준**으로 설명한다. `l5_decision.py`부터 `l10_handoff.py`까지의 파일명은 물리 artifact folder 이름을 따른다. 하지만 우리가 발표, 계약, 판단 기준에서 쓰는 번호는 `tools/m3_contract/layer_map.py`의 logical L0-L16이다. 예를 들어 `l10_handoff.py`는 논리 L10이 아니라 논리 L16 handoff artifact를 물리 `l10/` 폴더에 쓰는 파일이다.

## Logical L9-L16 코드 매핑

| Logical Layer | 실제 코드 | 핵심 산출물 |
| --- | --- | --- |
| `L9` | `l5_decision.py` | `silver_policy_decision.json`, `gold_policy_decision.json`, `gold_to_gold_policy_decision.json`, `approval_state.json` |
| `L10` | `l6_compiler.py` | `silver_transform_spec.json` |
| `L11` | `l6_compiler.py` | `gold_generation_spec.json` |
| `L12` | `l6_compiler.py` | `compiler_validation_result.json`, `unsupported_action_report.json`, `layered_transform_graph.json` |
| `L13` | `l7_silver_preview.py` | `silver_preview_ref.json`, `silver_preview_validation_result.json`, `pii_exposure_report.json`, `silver_quality_axis.json` |
| `L14` | `l8_gold_preview.py` | `gold_preview_ref.json`, `metric_definition_draft.json`, `gold_readiness_input_report.json`, `semantic_caveat_report.json` |
| `L15` | `l9_gate.py` | `processing_quality_axis.json`, `catalog_safety_axis.json`, `gold_readiness_axis.json`, `gate_summary.json` |
| `L16` | `l10_handoff.py` | `catalog_sync_contract_package.json`, `sql_context_pack.json`, `semantic_catalog_vector_index_template.json`, `artifact_reference_manifest.json`, `exports/*` |

대상 파일:

- [l5_decision.py](D:/NMM_team1/tools/m3_contract/l5_decision.py)
- [l6_compiler.py](D:/NMM_team1/tools/m3_contract/l6_compiler.py)
- [l7_silver_preview.py](D:/NMM_team1/tools/m3_contract/l7_silver_preview.py)
- [l8_gold_preview.py](D:/NMM_team1/tools/m3_contract/l8_gold_preview.py)
- [l9_gate.py](D:/NMM_team1/tools/m3_contract/l9_gate.py)
- [l10_handoff.py](D:/NMM_team1/tools/m3_contract/l10_handoff.py)
- [layer_map.py](D:/NMM_team1/tools/m3_contract/layer_map.py)

## [l5_decision.py](D:/NMM_team1/tools/m3_contract/l5_decision.py)

이 파일은 logical L6-L8 추천 초안을 logical L9 사용자 결정 계약으로 고정한다. Silver는 기본 preview 승인 상태로 두고, Gold는 사용자가 `approved`를 명시한 경우에만 compile 가능하게 만든다.

| Line range | 설명 |
| --- | --- |
| 1-7 | future annotation, `Path`, `Any`, artifact/write helper import. |
| 9 | `VALID_GOLD_DECISIONS`. Gold 상태는 `not_requested`, `deferred`, `needs_owner_review`, `approved`, `rejected`만 허용한다. |
| 12-18 | `build_l5()` signature. physical `l4` 결과, 즉 logical L6-L8 draft 묶음과 output dir, source/run id, gold decision을 받는다. |
| 19 | docstring. editable recommendation draft를 user decision contract로 lock한다고 설명한다. |
| 21-24 | gold decision 유효성 검사와 `l5` 폴더 생성. 허용되지 않은 상태는 즉시 `ValueError`. |
| 25-42 | `silver_policy_decision` 생성. L4 Silver draft ref, 승인 상태, field 목록, decision trace id, review id를 담는다. 현재 Silver는 preview를 위해 기본 승인된다. |
| 43 | Gold가 `approved`일 때만 L4 Gold draft의 models를 선택한다. 그 외에는 selected model을 빈 배열로 둔다. |
| 44-62 | `gold_policy_decision` 생성. Gold draft ref, decision status, requested 여부, selected models, decision reason, trace/review id를 담는다. |
| 63-78 | `gold_to_gold_policy_decision` 생성. Gold-to-Gold는 optional이라 항상 `not_requested`, `user_selectable=True`, `selected_models=[]`로 시작한다. |
| 79-124 | `approval_state` 생성. Silver compile allowed는 true, Gold compile allowed는 `gold_decision == "approved"`일 때만 true다. product health template, risk score policy, vector handoff는 deferred로 남겨 별도 승인이 필요하다고 명시한다. |
| 125-138 | `recommendation_diff` 생성. Silver 변경은 없고, Gold가 승인되지 않았으면 draft는 보존되지만 compile 승인되지 않았다는 diff를 남긴다. |
| 139-143 | L5 JSON 산출물 5개 저장. |
| 144-150 | physical `l5` 결과 dict 반환. logical L10-L15 단계가 이 decision/approval state를 읽는다. |
| 153-162 | `_gold_decision_reason()`. Gold 상태별 사람이 읽는 reason을 만든다. |

주의할 점: body 안의 `"layer": "L9"`는 물리 파일 `l5`와 다르다. 새 논리 계층에서는 사용자 결정 단계가 L9라서 이렇게 기록된다.

## [l6_compiler.py](D:/NMM_team1/tools/m3_contract/l6_compiler.py)

이 파일은 logical L9 결정 결과를 deterministic preview-only spec으로 컴파일한다. M3가 직접 Spark 실행을 하지 않고, M2가 실행할 수 있는 선언형 operation contract만 만든다.

| Line range | 설명 |
| --- | --- |
| 1-8 | future annotation, `Path`, `Any`, artifact/write helper, logical layer map import. |
| 10-24 | `SUPPORTED_ACTIONS`. compiler가 처리할 수 있는 action vocabulary다. 여기에 없는 action이나 `needs_review`는 block 대상이다. |
| 27-35 | `build_l6()` 시작. L0 source unit ids, unsupported action, silver operations, gold operations를 계산한다. Gold operation은 approval state에서 compile allowed일 때만 생성된다. |
| 37-55 | `silver_transform_spec` 생성. logical layer는 L10, execution owner는 M2, write mode는 `preview_only`, input은 L1 Bronze sample, output은 L7 Silver preview다. |
| 51 | `preview_scope`. `source_unit_ids`, `object_ids`, `stream_window_ids`를 사용한다. legacy `window_id`를 쓰지 않는 구조다. |
| 53 | runtime 금지 목록. per-row AI call, generated code execution, unbounded collect, production write를 block한다. |
| 56-75 | `gold_generation_spec` 생성. logical layer는 L11, input은 L7 Silver preview, output은 L8 Gold preview. Gold가 승인되지 않았으면 operations는 빈 배열이다. |
| 76-99 | `layered_transform_graph` 생성. logical L0-L16 layer map을 노드로 만들고 인접 edge를 구성한다. |
| 100-108 | `unsupported_action_report` 생성. deterministic compiler가 처리할 수 없는 action을 기록한다. |
| 109-114 | compiler validation 생성 후 physical `l6` 산출물 5개를 저장한다. 논리 의미는 L10 Silver spec, L11 Gold spec, L12 compiler gate다. |
| 115-121 | physical `l6` 결과 dict 반환. logical L13-L16 단계가 spec과 validation 결과를 읽는다. |
| 124-140 | `_silver_operations()`. 첫 operation은 drop이 아닌 field select이고, 이후 field별 action을 operation으로 변환한다. |
| 143-164 | `_operation_for_action()`. action 종류별 params schema를 만든다. rename, cast, parse_timestamp, mask/hash, json/flatten/explode/null/quarantine 계열이 구분된다. |
| 167-184 | `_gold_operations()`. Gold model마다 aggregate operation을 만든다. params는 `input_ref`, `group_by`, `dimensions`, `measures`, `time_window`, `cardinality_guard` 구조다. |
| 187-204 | `_unsupported_actions()`. `needs_review` 또는 `SUPPORTED_ACTIONS` 밖 action을 block 항목으로 바꾼다. |
| 207-271 | `_compiler_validation()`. per-row AI, generated code, unbounded collect, preview-only write mode, unsupported action, legacy `window_id`를 검사한다. 하나라도 block이면 overall_status가 block이다. |
| 274-279 | `_contains_legacy_window_id()`. dict/list를 재귀 탐색해 `window_id` 키가 남아 있는지 확인한다. |

## [l7_silver_preview.py](D:/NMM_team1/tools/m3_contract/l7_silver_preview.py)

이 파일은 Silver preview를 실행하지 않는다. L6 Silver spec을 M2가 실행해야 한다는 ref를 만들고, compiler/PII/query exposure 관점의 preview validation evidence를 구성한다.

| Line range | 설명 |
| --- | --- |
| 1-7 | import 및 common helper. |
| 9-18 | `build_l7()` 시작. L5 Silver fields에서 PII fields, query forbidden fields를 분리하고 L6 compiler status가 block이면 structural status도 block으로 둔다. |
| 19-35 | `silver_preview_ref` 생성. execution owner는 M2, M3 execution status는 `not_executed_by_m3`, write mode는 `preview_only`. |
| 36-58 | `silver_preview_validation_result` 생성. compiler passed, preview-only write mode, PII exposure declared, query forbidden fields excluded check를 담는다. |
| 59-81 | `pii_exposure_report` 생성. PII field의 source/target, pii handling, catalog exposure, query context exposure를 기록한다. |
| 82-96 | `silver_quality_axis` 생성. validation result와 PII report를 묶는 axis artifact다. |
| 97-111 | `silver_quarantine_report` 생성. 현재 M3는 실제 row quarantine count를 만들지 않고, M2 preview execution에서 import될 값이라고 명시한다. |
| 112-116 | L7 산출물 저장. |
| 117-123 | physical `l7` 결과 dict 반환. 논리 의미는 L13 Silver preview evidence다. |

## [l8_gold_preview.py](D:/NMM_team1/tools/m3_contract/l8_gold_preview.py)

이 파일은 optional Gold의 preview/readiness input을 만든다. Gold가 not requested/deferred/rejected여도 그 상태를 명시적으로 남겨 Silver gate와 섞이지 않게 한다.

| Line range | 설명 |
| --- | --- |
| 1-7 | import 및 common helper. |
| 9-18 | `build_l8()` 시작. L5 Gold decision에서 status, requested 여부, approved 여부, selected models를 가져온다. approved일 때만 metric definitions를 만든다. |
| 19-35 | `gold_preview_ref` 생성. approved여도 M3는 실행하지 않고, 승인 전이면 execution status를 `not_requested_or_deferred`로 둔다. |
| 36-50 | `metric_definition_draft` 생성. selected Gold model의 measures를 metric 단위로 펼친 결과가 들어간다. |
| 51-68 | `gold_readiness_input_report` 생성. L9 gate가 읽을 Gold status, requested 여부, preview ref, metric ref, semantic candidate, caveats를 모은다. |
| 69-87 | `gold_preview_validation_result` 생성. approved+metric이면 pass, not requested면 not_requested, deferred면 deferred, 그 외는 warn이다. |
| 88-96 | `semantic_caveat_report` 생성. Gold 관련 caveat만 별도 artifact로 둔다. |
| 97-102 | L8 산출물 저장. `gold_preview_ref.json`과 `gold_preview_result.json`은 같은 preview 객체를 저장한다. |
| 103-109 | physical `l8` 결과 dict 반환. 논리 의미는 L14 Gold preview readiness evidence다. |
| 112-127 | `_metric_definitions()`. Gold model measures를 metric id/name/operation/field/grain/semantic status로 펼친다. owner review 필요 모델은 metric semantic status도 `needs_owner_review`. |
| 130-139 | `_semantic_status_candidate()`. L5 Gold status와 metric 상태를 L9가 이해할 수 있는 pass/warn/block/deferred/not_requested로 변환한다. |
| 142-152 | `_gold_caveats()`. not requested/deferred/rejected/owner review 상황별 caveat 문구를 만든다. |

## [l9_gate.py](D:/NMM_team1/tools/m3_contract/l9_gate.py)

이 파일은 최종 readiness gate다. 핵심은 Silver readiness를 processing quality와 catalog safety로만 계산하고, Gold readiness는 별도 축으로 적용하는 것이다.

| Line range | 설명 |
| --- | --- |
| 1-7 | import 및 common helper. |
| 9-19 | `build_l9()` 시작. L7에서 processing/catalog status를, L8에서 gold status를 뽑고 `_m6_context()`로 Silver/Gold context status를 계산한다. |
| 20-36 | `processing_quality_axis` 생성. Silver preview/compiler validation 결과를 기반으로 pass/block과 caveat를 기록한다. |
| 37-53 | `catalog_safety_axis` 생성. PII exposure report를 기반으로 pass/warn/block을 기록한다. |
| 54-75 | `gold_readiness_axis` 생성. Gold input report와 metric definition ref, owner review id, blocking reasons, caveats, M6 gold context candidate를 담는다. |
| 76-99 | `gate_summary` 생성. 세 axis ref, preview scope ref, `m6_context_status`, `safe_to_run_silver`, `safe_to_run_gold`, required caveats를 모은다. |
| 100-103 | L9 산출물 저장. |
| 104-109 | physical `l9` 결과 dict 반환. 논리 의미는 L15 three-axis readiness gate다. |
| 112-117 | `_processing_status()`. L7 validation이 block이면 block, 아니면 pass. |
| 119-126 | `_catalog_status()`. query forbidden + PII handling none이면 block, PII/forbidden field가 있으면 warn, 없으면 pass. |
| 129-133 | `_gold_axis_status()`. L8 semantic candidate가 허용 상태면 그대로 쓰고, 모르는 값은 warn으로 낮춘다. |
| 136-157 | `_m6_context()`. processing/catalog block이면 Silver blocked. Gold 미요청이면 not_requested. Gold deferred/rejected/block이면 Gold만 not_ready. Gold warn이나 Silver caveat가 있으면 Gold ready_with_caveat. |
| 159-164 | `_gold_blocking_reasons()`. Gold rejected/block에만 blocking reason을 붙인다. |
| 167-171 | `_required_caveats()`. axis들의 caveat를 합쳐 gate summary에 넣는다. |

중요한 해석: Gold가 `deferred`여도 Silver는 processing/catalog가 pass면 `ready`가 된다. 이것이 L9 3-axis precedence rule의 핵심이다.

## [l10_handoff.py](D:/NMM_team1/tools/m3_contract/l10_handoff.py)

이 파일은 M3 core의 마지막 포장 단계다. M5 catalog/workflow 저장, M6 SQL/query context, vector search handoff, export contract가 여기서 나온다.

| Line range | 설명 |
| --- | --- |
| 1-8 | JSON/path/type/common helper와 logical layer version import. |
| 11-32 | `build_l10()` 시작. 함수명은 물리 `l10/` handoff builder라는 뜻이고, 논리 단계로는 L16 handoff package를 만든다. L9 M6 context status를 읽고, allowed columns, Gold metric definitions, catalog metadata, SQL context, lineage, sync package, vector template을 만든다. |
| 34-40 | `catalog_metadata_draft`, `sql_context_pack`, `field_level_lineage`, `catalog_sync_contract_package`, `semantic_catalog_vector_index_template`, 1차 `artifact_reference_manifest` 저장. |
| 41-59 | `handoff_package` 생성과 저장. catalog package, metadata, SQL context, vector template, artifact manifest, M6 context status를 한 번에 묶는다. |
| 60-61 | handoff package 생성 후 artifact manifest를 다시 만든다. 이때 handoff package까지 manifest에 포함시키려는 의도다. |
| 62-71 | `exports` 폴더 생성 후 `transform_spec.json`, `schema_definition.json`, `workflow_definition.json`, `catalog_metadata.json` export 저장. |
| 72-86 | physical `l10` 결과 dict 반환. 논리 의미는 L16 catalog/query/vector handoff package다. |
| 89-106 | `_allowed_columns()`. L5 Silver fields 중 query forbidden field를 제외하고 M6 query-safe column 목록을 만든다. |
| 109-165 | `_catalog_metadata()`. publish 가능 여부, dataset id/name, source format, Bronze/Silver/Gold layer status, quality axes, semantic template refs, caveats, lineage/sql refs를 만든다. |
| 168-208 | `_sql_context()`. M6가 사용할 SQL context pack. Silver table은 기본 포함, Gold metric이 준비된 경우에만 Gold preview table을 allowed table에 추가한다. |
| 211-232 | `_field_lineage()`. source path, silver field, recommended actions, PII handling을 field-level lineage로 만든다. |
| 235-365 | `_semantic_catalog_vector_index_template()`. dataset card, product health template doc, schema field docs, metric definition docs, filter key, retrieval policy, accuracy boundary를 만든다. 값 정확성 증명이 아니라 catalog/search 보조라는 경계를 포함한다. |
| 368-428 | `_catalog_sync_package()`. M5/M6가 필요한 주요 artifact ref 집합과 version set, M6 context status, Gold metric 보유 여부를 묶는다. |
| 431-484 | `_artifact_reference_manifest()`. output directory 아래 JSON artifact를 읽어 artifact id/name/access/logical/physical layer, checksum, URI, byte size를 manifest로 만든다. |
| 487-543 | `export_transform_spec()`. M2/M5 소비용 transform spec. Silver select/normalize/load를 기본으로 만들고, metrics가 있으면 Gold aggregate stage를 추가한다. |
| 545-574 | `export_schema_definition()`. M1/M5/M6가 볼 schema definition. drop field 제외, type/nullability/nested kind/transform hints를 기록한다. |
| 577-615 | `export_workflow_definition()`. M5 workflow graph. source, silver select, normalize, optional gold aggregate, load node와 edges를 만든다. |
| 618-654 | `export_catalog_metadata()`. catalog metadata export. query 가능 여부, allowed columns, storage placeholder, lineage, freshness, M3 refs를 담는다. |
| 657-662 | `_casts()`. cast 또는 parse_timestamp 추천 field만 transform hint로 추출한다. |
| 665-674 | `_gold_layer_status()`. L5 Gold decision과 L9 Gold context를 catalog layer status로 변환한다. ready 계열이면 available, not requested/deferred/review는 그대로, 나머지는 blocked. |

주의할 점: `artifact_reference_manifest`는 physical `l10`, 즉 logical L16 handoff 생성 중간에 두 번 만들어지며, exports 저장은 그 뒤에 실행된다. 따라서 현재 반환되는 manifest가 export 파일까지 포함한다고 해석하면 안 된다.

## [layer_map.py](D:/NMM_team1/tools/m3_contract/layer_map.py)

이 파일은 물리 artifact path의 `l0-l10`과 논리 레이어 `L0-L16`을 연결한다. 코드와 문서/발표에서 “l10 폴더”와 “논리 L16”을 혼동하지 않게 해주는 기준표다.

| Line range | 설명 |
| --- | --- |
| 1-6 | future annotation, `Any` import, logical layer version 상수 선언. |
| 9-39 | `LOGICAL_LAYERS` L0-L2. raw source unit manifest, bronze envelope/rescue lane, profile/data shape snapshot 정의. |
| 40-75 | L3-L5. AI-safe evidence reduction, metadata/template retrieval, candidate grounding gate 정의. |
| 76-109 | L6-L8. Silver recommendation draft, Gold recommendation draft, vector/semantic handoff draft 정의. |
| 110-125 | L9. physical `l5`의 decision/approval/diff artifact를 logical user decision layer로 매핑한다. |
| 126-159 | L10-L12. physical `l6`의 Silver spec, Gold spec, compiler validation/unsupported action/graph를 논리 compiler 단계로 나눈다. |
| 160-191 | L13-L14. physical `l7` Silver preview evidence와 physical `l8` Gold readiness evidence 정의. |
| 192-226 | L15-L16. physical `l9` final gate와 physical `l10` catalog/query/vector handoff package 정의. |
| 230-256 | `SPLIT_SUMMARY`. 기존 L3/L4/L5/L6/L7-L10을 왜 새 L0-L16으로 쪼갰는지 설명한다. |
| 259-315 | `_ARTIFACT_LOGICAL_LAYER`. `(physical layer, artifact name)` tuple을 canonical logical layer로 매핑한다. |
| 318-327 | `logical_layer_for_artifact()`. 명시 매핑이 있으면 반환하고, 없으면 `l숫자` fallback, 그 외는 `UNKNOWN`. |

## Logical L9-L16 주의점

1. L9는 추천을 실행하지 않고 approval state를 고정한다.
2. L10/L11은 M2가 실행할 preview-only Silver/Gold spec을 만든다. M3가 Spark production write를 한다고 말하면 안 된다.
3. L12는 실행 전 compiler gate다. unsupported action, generated code, per-row AI, production write, legacy `window_id`가 여기서 막혀야 한다.
4. L13/L14는 preview 결과 자체보다 preview reference와 readiness evidence를 다룬다.
5. L15에서 Silver와 Gold는 분리된다. Gold가 미요청/보류/거절이어도 Silver가 ready일 수 있다.
6. L16은 M5/M6 handoff package를 만든다. 실제 catalog DB write, SQL serving, vector index build는 downstream 책임이다.
