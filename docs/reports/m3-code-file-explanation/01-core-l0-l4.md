# M3 Core Logical L0-L8 코드 해설

이 문서는 M3 core의 앞쪽 절반을 **logical L0-L8 기준**으로 설명한다. 파일명과 builder 이름은 compatibility 때문에 `l0_raw.py`부터 `l4_recommendation.py`까지지만, 실제 논리 역할은 L0-L8까지 확장되어 있다. 특히 `l3_recommend.py`는 L3 AI-safe evidence뿐 아니라 L4 metadata/template retrieval과 L5 grounding gate를 같이 만들고, `l4_recommendation.py`는 L6 Silver draft, L7 Gold draft, L8 vector/semantic draft를 같이 만든다.

## Logical L0-L8 코드 매핑

| Logical Layer | 실제 코드 | 핵심 산출물 |
| --- | --- | --- |
| `L0` | `l0_raw.py` | `object_stream_manifest.json`, `source_manifest.json`, `raw_replay_pointer.json` |
| `L1` | `l1_bronze.py` | `bronze_envelope_samples.json`, `rescue_lane.json`, `bronze_envelope_spec.json` |
| `L2` | `l2_profile.py` | `profile_snapshot.json`, `format_detection.json`, `schema_fingerprint.json` |
| `L3` | `l3_recommend.py` | `ai_recommendation_input_pack.json`, `field_evidence_reducer.json`, `redaction_map.json` |
| `L4` | `l3_recommend.py` | `metadata_retrieval_index_plan.json`, `gold_template_candidate_retrieval.json` |
| `L5` | `l3_recommend.py` | `candidate_grounding_report.json`, product-health source evidence 판정 |
| `L6` | `l4_recommendation.py` | `silver_policy_recommendation_draft.json` |
| `L7` | `l4_recommendation.py` | `gold_model_recommendation_draft.json`, `product_health_gold_template_draft.json`, `risk_score_policy_recommendation_draft.json` |
| `L8` | `l4_recommendation.py` | `vector_embedding_handoff_template.json`, `ai_generation_trace.json` |

대상 파일:

- [__init__.py](D:/NMM_team1/tools/m3_contract/__init__.py)
- [cli.py](D:/NMM_team1/tools/m3_contract/cli.py)
- [common.py](D:/NMM_team1/tools/m3_contract/common.py)
- [l0_raw.py](D:/NMM_team1/tools/m3_contract/l0_raw.py)
- [l1_bronze.py](D:/NMM_team1/tools/m3_contract/l1_bronze.py)
- [l2_profile.py](D:/NMM_team1/tools/m3_contract/l2_profile.py)
- [l3_recommend.py](D:/NMM_team1/tools/m3_contract/l3_recommend.py)
- [l4_recommendation.py](D:/NMM_team1/tools/m3_contract/l4_recommendation.py)

## [__init__.py](D:/NMM_team1/tools/m3_contract/__init__.py)

이 파일은 `tools.m3_contract` 패키지의 정체성과 버전을 선언한다. 실행 로직은 없지만, M3가 storage/execution neutral control-plane이라는 전제를 패키지 최상단에서 고정한다.

| Line range | 설명 |
| --- | --- |
| 1-7 | 패키지 docstring. M3가 logical L0-L16 metadata, AI-safe evidence, recommendation draft, decision contract, preview-only spec, quality gate, catalog/query handoff artifact를 만든다고 선언한다. 동시에 실제 물리 출력 폴더는 backward compatibility 때문에 `l0-l10`으로 유지된다고 못 박는다. |
| 9 | `__all__ = ["__version__"]`. 이 패키지에서 외부 공개 심볼을 버전 값으로 제한한다. |
| 11 | `__version__ = "0.2.1"`. 현재 M3 contract package 버전이다. 산출물 schema version과는 별개로 Python 패키지 자체의 버전이다. |

## [cli.py](D:/NMM_team1/tools/m3_contract/cli.py)

이 파일은 M3 core 계약 생성 파이프라인의 실제 CLI 진입점이다. 사용자가 입력 source와 option을 넘기면 compatibility builder 기준으로 `build_l0()`부터 `build_l10()`까지 순서대로 호출하고, logical 의미 기준으로는 L0부터 L16까지의 산출물 위치와 M1/M2/M5/M6 handoff를 `run_summary.json`으로 묶는다.

| Line range | 설명 |
| --- | --- |
| 1 | future annotation 활성화. Python type hint가 런타임에서 문자열 평가되어 순환 참조 부담을 줄인다. |
| 3-4 | `argparse`, `Path` import. CLI 인자 파싱과 파일 경로 처리를 위한 기본 의존성이다. |
| 6 | `write_json` import. 마지막 `run_summary.json` 저장에 사용한다. |
| 7-17 | `build_l0`부터 `build_l10`까지 builder를 모두 가져온다. 여기서 `build_l10`은 논리 L10이라는 뜻이 아니라, 기존 물리 `l10/` handoff 폴더를 만드는 마지막 builder다. 논리 단계 기준으로는 L0-L16 흐름을 조립한다. |
| 18 | `LOGICAL_LAYERS`, `LOGICAL_LAYER_VERSION`, `SPLIT_SUMMARY` import. 최종 summary에 물리 `l0-l10`과 논리 `L0-L16`의 관계를 설명하기 위해 쓴다. |
| 21-22 | `parse_args()` 선언과 parser 생성. 설명 문구는 unknown CSV/JSON/JSONL source에 대해 M3 logical L0-L16 contract를 만든다고 말한다. |
| 23 | `--source` 필수 인자. 파일 또는 디렉터리 입력이며, M3는 이 원본을 복사하지 않고 참조와 bounded sample만 기록한다. |
| 24 | `--source-id` 필수 인자. 모든 artifact id와 source unit id의 안정적 prefix로 쓰인다. |
| 25 | `--output` 필수 인자. 물리 산출물 폴더는 여기에 `l0`, `l1`, ... 형태로 생긴다. |
| 26 | `--run-id` 기본값. 같은 source라도 실행을 구분하는 id다. |
| 27 | `--format` 선택값. `auto`, `csv`, `json`, `jsonl`, `parquet`, `text`를 허용한다. `auto`면 L2에서 확장자와 sample로 감지한다. |
| 28-29 | `--sample-rows`, `--sample-bytes`. M3가 control-plane evidence로 읽는 sample 상한이다. 실시간/대용량에서 전체 row를 AI나 Python으로 읽지 않게 하는 핵심 안전장치다. |
| 30-31 | checksum mode와 checksum byte 수. L0 raw fingerprint가 full checksum을 쓸지, prefix checksum을 쓸지, 생략할지 결정한다. |
| 32 | `--ai-model-slot`. 실제 모델 호출이 아니라 L4 `ai_generation_trace`에 어떤 추천 slot으로 생성됐는지 기록하는 값이다. |
| 33-38 | `--gold-decision`. Gold 상태를 `not_requested`, `deferred`, `needs_owner_review`, `approved`, `rejected` 중 하나로 받는다. 기본값은 `deferred`라서 Gold 추천은 보이지만 실행 가능한 spec으로 자동 확정되지 않는다. |
| 39 | argparse 결과를 반환한다. |
| 42-44 | `run(args)` 시작. source와 output을 `Path`로 바꾼다. |
| 45 | L0 실행. raw source unit/object manifest와 replay pointer를 만든다. |
| 46 | L1 실행. Bronze envelope sample과 rescue lane contract를 만든다. |
| 47 | L2 실행. L1 sample과 L0 files/object 정보를 기반으로 profile snapshot과 schema fingerprint를 만든다. |
| 48 | L3 실행. L2 profile을 AI-safe evidence, domain signal, retrieval candidate로 줄인다. |
| 49 | L4 실행. Silver recommendation, Gold recommendation, product health, risk score, vector handoff draft를 만든다. |
| 50 | L5 실행. L4 draft를 사용자 decision/approval state로 고정한다. |
| 51 | L6 실행. 승인 상태를 deterministic preview-only spec으로 compile한다. |
| 52 | L7 실행. Silver preview reference와 validation evidence를 만든다. |
| 53 | L8 실행. Gold preview/readiness evidence를 만든다. |
| 54 | L9 실행. processing quality, catalog safety, gold readiness 3축 gate를 계산한다. |
| 55 | L10 실행. catalog metadata, SQL context, vector handoff, artifact manifest, export 계약을 만든다. |
| 56-63 | `summary` 기본값. source/run/output, logical layer version, split summary, logical layer 목록을 넣는다. |
| 63-88 | logical layer별 주요 산출물 경로 목록. 발표나 UI에서 “L3가 어떤 파일을 냈는지”, “L10이 무엇을 넘기는지”를 빠르게 보여주는 요약이다. |
| 89 | M3 scope 경계. M3는 planning, recommendation, preview-only spec, catalog/query handoff만 담당하고 distributed runtime, production write, raw copy는 담당하지 않는다고 명시한다. |
| 90 | L2 profile 안의 `data_shape_contract`를 summary에 끌어올린다. source가 CSV인지 JSON인지, extension required인지 등을 한눈에 보려는 목적이다. |
| 91-96 | M1/M2/M5/M6 handoff 설명. M1은 source 등록과 decision UI, M2는 preview-only spec 실행, M5는 approval/catalog 저장, M6는 query/vector context 사용으로 분리된다. |
| 97 | L9 `gate_summary.m6_context_status`를 summary에 넣는다. 최종적으로 M6가 Silver/Gold context를 쓸 수 있는지 보여주는 값이다. |
| 98 | L10 catalog 품질 정보를 summary에 넣는다. |
| 100-101 | `run_summary.json` 저장 후 summary 반환. |
| 104-107 | `main()`. 인자 파싱, 실행, 출력 경로 print, 정상 종료 코드 0 반환을 한다. |
| 110-111 | 직접 실행 시 `SystemExit(main())`로 CLI 프로그램처럼 종료한다. |

## [common.py](D:/NMM_team1/tools/m3_contract/common.py)

이 파일은 M3 core 전체가 공유하는 기반 함수 묶음이다. artifact id/header/ref, JSON writer, checksum, source 탐색, format 감지, JSON flatten, type inference, PII/semantic hint가 여기에 있다.

| Line range | 설명 |
| --- | --- |
| 1 | future annotation 활성화. |
| 3-10 | `csv`, `hashlib`, `json`, `re`, `datetime`, `timezone`, `Path`, `Any`, `Iterable` import. CSV/JSON parsing, hashing, timestamp, path, type hint에 쓰인다. |
| 11 | `LOGICAL_LAYER_VERSION`, `logical_layer_for_artifact` import. `with_header()`가 physical artifact를 logical L0-L16 layer로 매핑할 때 쓴다. |
| 13 | `JSONValue` alias. JSON flatten 함수가 받을 수 있는 재귀적 JSON 타입을 명시한다. |
| 16-18 | `utc_now()`. UTC timestamp를 초 단위 ISO 문자열로 만든다. 모든 artifact header의 `created_at`에 사용된다. |
| 20-22 | `artifact_id()`. layer/name/source/run 조합을 lowercase artifact id로 만든다. M3의 모든 `*_ref`는 이 id 문자열을 가리킨다. |
| 25-47 | `artifact_header()`. source id, run id, artifact id/name, physical layer, logical layer, schema version, producer, access class 등 공통 header를 만든다. |
| 49-50 | `artifact_ref()`. artifact body에서 다른 artifact를 참조할 때 header 전체가 아니라 artifact id 문자열만 반환한다. |
| 53-85 | `with_header()`. body와 header를 하나의 artifact dict로 감싼다. header뿐 아니라 최상위에도 `artifact_id`, `artifact_name`, `physical_layer`, `logical_layer`, `logical_layer_version`, `schema_version`, `access_class`, `body`를 둔다. |
| 88-90 | `ensure_dir()`. 출력 폴더를 부모까지 생성한다. |
| 92-95 | `write_json()`. JSON 파일을 UTF-8, indent 2, key sort, `ensure_ascii=False`로 저장한다. |
| 97-101 | `write_jsonl()`. row iterable을 JSONL로 저장한다. 대용량 raw가 아니라 bounded artifact/sample 출력용이다. |
| 104-105 | `read_json()`. UTF-8 JSON 파일을 읽는다. |
| 108-110 | `stable_json_hash()`. sort key, compact separator로 JSON을 안정 직렬화하고 SHA-256을 계산한다. schema fingerprint와 manifest hash에 사용된다. |
| 113-118 | `file_sha256()`. 파일 전체 SHA-256을 1MB chunk로 계산한다. full checksum mode에서 쓴다. |
| 121-126 | `iter_source_files()`. source가 파일이면 1개, 디렉터리면 recursive file list를 반환한다. 존재하지 않으면 명시적으로 실패한다. |
| 129-130 | `source_uri()`. 로컬 파일 path를 absolute file URI로 바꾼다. |
| 133-157 | `file_fingerprint()`. 파일 크기, 수정 시각, URI, path, checksum mode, checksum bytes, checksum 값을 만든다. `none`, `prefix`, `full` 모드를 분리해 대용량 원본에서 full hash 비용을 피할 수 있다. |
| 160-180 | `sample_text_lines()`. 여러 파일에서 row/byte 상한 안에서 line sample을 만든다. raw hash와 raw preview는 남기지만 1000자까지만 inline으로 둔다. |
| 183-214 | `detect_format()`. format hint가 `auto`가 아니면 그대로 사용하고, 아니면 확장자와 sample 내용으로 JSONL/CSV/text를 판단한다. parquet은 확장자로만 감지하고 core parser는 extension 필요로 넘긴다. |
| 217-234 | `flatten_json()`. dict/list를 JSON path 기반 field map으로 평탄화한다. list 자체도 field로 기록하고 첫 번째 element를 `[]` path로 샘플링한다. |
| 237-257 | `value_type()`. Python 값과 문자열 패턴을 `null`, `bool`, `integer`, `number`, `array`, `object`, `integer_string`, `number_string`, `datetime_string`, `string` 등으로 분류한다. |
| 260-263 | `normalize_name()`. field 이름을 lowercase snake case에 가깝게 정규화한다. |
| 266-269 | `source_path_to_target()`. JSON path나 nested path를 Silver target column 후보명으로 바꾼다. |
| 272-283 | `to_project_type()`. raw dominant type을 프로젝트 타입으로 축약한다. numeric string은 numeric, datetime string은 timestamp, object/array는 json, null은 string fallback이다. |
| 286-288 | `pii_hint()`. field name에 email/phone/address/name/user/customer/ssn/ip가 있으면 PII 후보로 본다. |
| 291-310 | `semantic_hints()`. field name 기반으로 identifier, measure, time, text, review, conversion, delivery, pii_candidate 같은 semantic hint를 붙인다. |
| 313-328 | `csv_dialect()`. `csv.Sniffer`로 delimiter/quote/header를 추정한다. 실패하면 comma delimiter와 낮은 confidence로 fallback한다. |

## [l0_raw.py](D:/NMM_team1/tools/m3_contract/l0_raw.py)

이 파일은 M3의 raw preservation 단계다. 원본 데이터 payload를 복사하거나 수정하지 않고, source unit, object id, checksum, replay pointer만 만든다.

| Line range | 설명 |
| --- | --- |
| 1 | future annotation 활성화. |
| 3-4 | `Path`, `Any` import. |
| 6 | L0이 쓰는 common helper import. file fingerprint, source file traversal, stable hash, artifact wrapping, JSON write가 핵심이다. |
| 9-16 | `build_l0()` signature. source, out dir, source/run id, checksum mode/bytes를 받는다. |
| 17 | docstring. raw data를 copy/mutate하지 않는 L0 source-unit manifest 생성이라고 밝힌다. |
| 19-21 | `l0` 출력 폴더 생성, source file 목록 수집. |
| 22-23 | `objects`, `source_units` 배열 초기화. |
| 25-28 | 파일별 loop. 1부터 시작하는 index로 `object_id`, `source_unit_id`를 만들고 fingerprint를 계산한다. |
| 29-44 | `objects` entry 생성. object id, source unit id, URI, path, checksum, checksum mode, size, compression, partition, modified_at을 담는다. |
| 45-53 | `source_units` entry 생성. 현재 lightweight CLI는 각 파일을 `object_batch` source unit으로 보고 object id 하나와 연결한다. stream window는 빈 배열이다. |
| 55-74 | `object_stream_manifest` body 구성. source root/kind/format, source units, object count, total bytes, object 목록, stream window 목록, raw policy가 들어간다. |
| 68-73 | raw policy. `copy_raw_payload=False`, `mutate_raw_payload=False`라서 M3가 원본 저장소나 payload를 소유하지 않음을 계약으로 남긴다. |
| 75 | manifest body의 stable hash를 추가한다. |
| 76-84 | `object_stream_manifest` artifact 생성. schema version은 `m3.l0.object_stream_manifest.v2_1_1`, access class는 `catalog_internal`. |
| 85-102 | `source_manifest` artifact 생성. source unit id 목록과 `object_stream_manifest_ref`를 제공한다. |
| 103-120 | `raw_replay_pointer` artifact 생성. raw restricted artifact로 object URI와 source unit id를 담고, M2가 materialization할 때 source_unit/object/locator를 쓰라는 replay contract를 남긴다. |
| 122-125 | `object_stream_manifest.json`, `source_manifest.json`, `raw_replay_pointer.json`, backward-compatible `raw_manifest.json` 저장. |
| 126-133 | 후속 레이어가 쓸 files, manifest, replay, objects, source units를 반환한다. |

## [l1_bronze.py](D:/NMM_team1/tools/m3_contract/l1_bronze.py)

이 파일은 L0 raw object를 bounded Bronze sample envelope로 감싼다. 전체 Bronze materialization이 아니라 L2 profile과 L3 recommendation에 필요한 control-plane sample lane만 만든다.

| Line range | 설명 |
| --- | --- |
| 1 | future annotation 활성화. |
| 3-5 | `hashlib`, `Path`, `Any` import. raw line hash, path, type hint에 사용한다. |
| 7 | `artifact_ref`, `source_uri`, `utc_now`, `with_header`, writer helper import. |
| 10-17 | `build_l1()` signature. L0 결과, output dir, source/run id, max row/byte를 받는다. |
| 18 | docstring. Bronze envelope contract와 bounded sample lane을 만든다고 설명한다. |
| 20-23 | `l1` 폴더 생성, L0 objects를 path 기준 dict로 변환, `_sample_bronze_records()` 호출. |
| 24-45 | `bronze_envelope_samples` manifest 생성. L0 manifest ref, sample count, row/byte limit, sample policy, JSONL artifact 이름을 담는다. |
| 46-73 | `rescue_lane` manifest 생성. parse 불가 record와 schema conflict를 어떻게 보존할지 규칙으로 남긴다. |
| 74-101 | `bronze_envelope_spec` 생성. required columns, parse status enum, optional artifact ref field, replay locator rule을 정의한다. |
| 102-107 | manifest/spec JSON과 sample/rescue JSONL 저장. `sample_records.jsonl`은 호환용 alias다. |
| 108-114 | L2에서 사용할 `samples`와 L1 artifact들을 반환한다. |
| 117-124 | `_sample_bronze_records()` signature. 파일 목록, object metadata, source/run id, row/byte limit를 받는다. |
| 125-127 | rows와 consumed byte counter 초기화, 파일 loop 시작. |
| 128 | 현재 파일의 L0 object metadata를 path로 찾는다. |
| 129-131 | 파일을 binary로 열고 line number와 raw bytes를 순회한다. |
| 132-133 | row 또는 byte limit에 도달하면 즉시 현재 sample을 반환한다. |
| 134-136 | byte offset과 consumed bytes를 갱신하고 raw bytes를 UTF-8 replacement decode한다. |
| 137-167 | Bronze sample record 생성. record id, source/object manifest refs, source unit id, stream window null, object/line/byte locator, parse status, payload preview, raw sha256, raw size, source URI/path, ingest time이 들어간다. |
| 168 | 다음 line의 byte start 갱신. |
| 169 | 모든 파일 처리 후 rows 반환. |

## [l2_profile.py](D:/NMM_team1/tools/m3_contract/l2_profile.py)

이 파일은 L1 bounded sample을 CSV/JSON/JSONL/text profile snapshot으로 바꾼다. M3가 unknown source를 이해하고 logical L3-L5 evidence/retrieval/grounding 근거를 만들 수 있게 하는 첫 분석 레이어다.

| Line range | 설명 |
| --- | --- |
| 1 | future annotation 활성화. |
| 3-7 | CSV/JSON parser, Counter/defaultdict, Path, Any import. |
| 9 | L2에 필요한 common helper import. format detection, CSV dialect, JSON flatten, PII hint, stable hash, type inference, header/write가 들어온다. |
| 12-27 | `_field_summary()`. raw stats를 field summary list로 변환한다. type counts, observed count, null ratio, examples, pii hint를 계산한다. |
| 30-39 | `_record_field()`. field별 type counter와 example을 누적한다. example은 최대 5개, 200자까지만 둔다. |
| 41-57 | `_profile_jsonl()`. sample line을 JSON parse하고 flatten한다. parse 실패는 error count로 남기고, 성공한 row만 field stats에 반영한다. |
| 60-68 | `_profile_json_document()` 앞부분. sample preview를 하나의 document 문자열로 합치고, 비어 있으면 parsed 0 반환, document parse 실패 시 JSONL fallback을 탄다. |
| 70-85 | JSON document가 list면 각 item을 `$[]` prefix로 flatten하고, dict면 `$` 기준으로 flatten한다. document mode parser stats를 반환한다. |
| 88-105 | `_profile_csv()`. CSV dialect 감지, header 추정, data rows 분리, width conflict 계산, field stats 생성. |
| 108-116 | `_data_shape_contract()` signature. format, detection, parser stats, fields, source unit ids, object ids를 받는다. |
| 117-129 | format별 structure class와 core support status 결정. CSV는 structured, JSON/JSONL은 semi-structured, text는 limited, 그 외는 extension required. |
| 130-169 | data shape contract body. bounded evidence, streaming bigdata contract, format handling matrix, M2/M5/M6 handoff, claim boundary를 포함한다. |
| 172-180 | `build_l2()` signature. L1 samples, L0 files, L0 dict, output dir, ids, format hint를 받는다. |
| 181-184 | `l2` 폴더 생성, format detection 실행. |
| 185-190 | detected format에 따라 JSON document, JSONL, CSV profiler를 선택한다. |
| 191-196 | 기타 format fallback. raw text field `$raw_text` 하나로 profile하고 parser stats를 만든다. parquet/text/unknown의 lightweight fallback이다. |
| 197-200 | schema fingerprint basis와 source unit/object ids 준비. |
| 201-208 | `_data_shape_contract()` 호출. |
| 209-239 | `profile_body` 구성. format detection/router, data shape contract, sample/field count, fields, parser stats, schema fingerprint, format profile ref를 담는다. |
| 240-248 | `profile_snapshot` artifact 생성. |
| 249-263 | `format_detection` artifact 생성. detection dict를 body에 펼친다. |
| 264-281 | `{fmt}_profile` artifact 생성. scope, data shape contract, fields, parser stats를 담는다. |
| 282-290 | `schema_fingerprint` artifact 생성. fingerprint와 basis를 저장한다. |
| 291-294 | L2 JSON artifact 4개 저장. |
| 295 | profile, fingerprint, detection, format profile 반환. |

## [l3_recommend.py](D:/NMM_team1/tools/m3_contract/l3_recommend.py)

이 파일은 L2 profile을 AI/model이 볼 수 있는 안전한 근거 묶음으로 줄인다. 원본 payload 전체나 row-level AI는 금지하고, field evidence, redaction, domain signal, metadata retrieval plan, Gold template candidate, grounding report를 만든다.

| Line range | 설명 |
| --- | --- |
| 1-8 | regex/path/type/common helper import. token matching, artifact creation, semantic hint, target name normalization에 필요하다. |
| 10-13 | `_dominant_type()`. type count dict에서 가장 많이 나온 타입을 반환한다. |
| 16-20 | `build_l3()` signature와 docstring. L2 profile을 AI-safe evidence packs로 줄이고 executable recommendation은 만들지 않는다. |
| 21-51 | L2 fields를 순회해 `field_evidence`와 `redaction_map` 생성. PII 후보 field는 example을 `[REDACTED_PII]`로 바꾼다. |
| 52-53 | L2 data shape contract를 가져오고 source processing contract를 만든다. |
| 55-82 | `ai_recommendation_input_pack` artifact. L2 profile ref, redaction map ref, field evidence, evidence budget, raw payload 금지, row-level AI call 0을 담는다. |
| 83-102 | `field_evidence_reducer` artifact. L2 profile에서 logical L3 evidence로 줄일 때 full raw payload drop, example cap, PII redaction, null/type evidence 보존 규칙을 남긴다. |
| 103-111 | `redaction_map` artifact. field별 redaction 적용 여부와 reason을 담는다. |
| 112-127 | `policy_context_pack` artifact. Silver/Gold objective와 M3 scope boundary를 정리한다. |
| 128-139 | helper들이 만든 unknown data pack, metadata index plan, template retrieval, grounding report까지 JSON으로 저장한다. |
| 140-150 | physical `l3` 결과 dict 반환. logical L6-L8 recommendation draft가 여기서 `field_evidence`와 retrieval/grounding 결과를 사용한다. |
| 153-217 | `_unknown_data_recommendation_pack()`. unknown source에 대해 Silver cleaning, general Gold aggregate, product health template, vector handoff template 후보와 blocked claim을 기록한다. |
| 219-246 | `_domain_signals()`. product key, review, text, time series, commercial measure, conversion event, delivery event 신호를 field token/hint로 감지한다. |
| 249-267 | `_source_processing_contract()`. M3 runtime role을 control-plane only로 두고, large/realtime/unstructured 처리는 M2/M6/extension boundary로 넘긴다. |
| 269-290 | `_vector_candidate_fields()`. text/entity/metadata 후보 field를 나눈다. PII 후보는 기본적으로 제외한다. |
| 293-301 | `_field_projection()`. field evidence를 짧은 참조 형태로 줄인다. |
| 304-423 | `_metadata_retrieval_index_plan()`. schema profile document, built-in `gold_product_health_v1` template document, column profile documents, payload filter key, blocked input을 만든다. Vector DB는 추천 검색 보조지 값 정확성 증거가 아니라고 명시한다. |
| 425-491 | `_gold_template_candidate_retrieval()`. product/rating/review/conversion/delivery evidence를 찾아 `gold_product_health_v1` 후보 점수와 missing evidence를 계산한다. |
| 494-580 | `_candidate_grounding_report()`. template 후보가 draft로 넘어갈 수 있는지 exact name/type compatibility, denominator, PII exposure, Spark preview, user approval check로 나눈다. |
| 583-604 | `_field_blob()`, `_field_terms()`, `_field_has_any_token()`. field 이름을 token화하고 matching한다. |
| 607-608 | `_field_has_any_hint()`. semantic hint 교집합을 확인한다. |
| 611-655 | product key, rating, review text, conversion, delivery field classifier. product id와 customer/user/order id를 구분하려는 필터가 들어 있다. |
| 658-674 | `_product_health_missing_evidence()`. product health template에 부족한 근거를 label list로 만든다. |
| 677-686 | conversion numerator/denominator helper. purchase/order/checkout 계열과 view/session/click 계열을 나눠 찾는다. |
| 689-696 | `_matched_field_ids()`. matched field group에서 field id set을 추출한다. PII query exposure check에 사용된다. |

## [l4_recommendation.py](D:/NMM_team1/tools/m3_contract/l4_recommendation.py)

이 파일은 logical L3-L5 evidence/retrieval/grounding 결과를 편집 가능한 logical L6-L8 추천 초안으로 바꾼다. Silver cleaning policy, generic Gold aggregate, product-health Gold template, risk score policy, vector handoff template, AI generation trace가 여기서 만들어진다.

| Line range | 설명 |
| --- | --- |
| 1-8 | regex/path/type/common helper import. |
| 10-25 | `ALLOWED_ACTIONS`. `select`, `rename`, `cast`, `parse_timestamp`, `mask`, `hash`, `drop`, `aggregate`, `needs_review` 등 추천에서 허용되는 action vocabulary다. |
| 28-35 | `build_l4()` signature. physical `l3` 결과, output dir, source/run id, ai model slot을 받는다. 논리적으로는 L3-L5 근거를 받아 L6-L8 draft를 만든다. |
| 37-43 | output folder 생성 후 Silver field recommendation, Gold model recommendation, risk score policy, product health template, vector handoff template을 계산한다. |
| 44-60 | `derived_gold_options`. product health Gold template은 deferred, Gold-to-Gold follow-up은 not_requested로 남긴다. 사용자가 선택해야 compile 가능하다는 구조다. |
| 61-77 | `silver_policy_recommendation_draft` artifact. allowed actions, field별 recommendation, `needs_user_decision` status를 담는다. |
| 78-99 | `gold_model_recommendation_draft` artifact. generic gold models, derived gold options, product health/risk/vector refs를 담는다. |
| 100-123 | `ai_generation_trace` artifact. deterministic fallback인지, model slot declared인지, raw payload를 보지 않았는지, row-level AI call이 0인지 기록한다. |
| 124-129 | physical `l4` 산출물 6개 저장. 논리 의미는 L6 Silver draft, L7 Gold/product-health/risk draft, L8 vector handoff/AI trace다. |
| 130-137 | physical `l4` 결과 dict 반환. logical L9 decision이 이 dict를 받아 승인 상태를 만든다. |
| 140-171 | `_silver_field_recommendation()`. field별 target name/type, action, PII handling, catalog/query exposure를 추천한다. PII면 mask, timestamp면 parse, numeric/bool이면 cast, json이면 json_string, null ratio가 있으면 normalize_null. |
| 174-218 | `_gold_model_recommendations()`. dimension/measure field 조합으로 generic aggregate model을 추천한다. dimension과 measure가 없으면 record count fallback을 만든다. |
| 221-300 | `_product_health_gold_template()` 전반. product key/rating/review/conversion/delivery/time field를 찾고 product-health metric template을 만든다. |
| 246-252 | `risk_score` metric template. 공식은 고정 상수가 아니라 `risk_score_policy_recommendation_ref`를 참조한다. 사용 가능한 component가 없으면 `needs_source_evidence`. |
| 301-347 | product health template artifact body. `template_id=gold_product_health`, default decision deferred, compile default false, required output columns, metric templates, preview supporting metrics, risk policy status를 담는다. |
| 350-428 | `_risk_score_policy_recommendation()`. source evidence에 따라 candidate components, recommended weights, formula, missing components, zero denominator policy, approval requirements를 만든다. |
| 431-485 | `_risk_score_components()`. negative review, low rating, low conversion, late delivery component를 evidence가 있을 때만 추가한다. |
| 488-499 | `_recommended_component_weights()`. base weight를 사용 가능한 component만으로 재정규화한다. 데이터에 없는 component를 0점으로 넣지 않는다. |
| 502-506 | `_risk_formula()`. weights가 없으면 `None`, 있으면 weighted average formula string을 반환한다. |
| 509-527 | `_risk_missing_components()`. product key, review/rating, conversion numerator/denominator, delivery signal 부족분을 계산한다. |
| 530-535 | `_risk_policy_id()`. 사용 가능한 component 조합에 따라 policy id를 만든다. |
| 537-597 | `_vector_embedding_handoff_template()`. text/entity/metadata 후보, chunking/privacy/index build extension hook을 만든다. M3는 embedding을 만들거나 vector index를 유지하지 않는다고 명시한다. |
| 600-625 | field token/hint matching helper. |
| 628-660 | product key/rating/review text 대표 field 선택 helper. PII 후보와 order/customer/user/session/review id를 제외하려는 조건이 들어 있다. |
| 663-688 | field 검색과 conversion evidence helper. |
| 691-713 | `_metric_template()`. product-health metric draft의 공통 dict를 만든다. metric id, formula template, required evidence, available fields, missing evidence, owner review flag, caveat를 표준화한다. |
| 716-738 | missing evidence helper. conversion/delivery metric에 필요한 source evidence 부족분을 계산한다. |
| 741-749 | `_field_projection()`. template 안에서 field를 짧게 참조하기 위한 projection을 만든다. |

## Logical L0-L8 주의점

1. L0-L2는 원본을 소유하지 않고, source unit, bounded sample, profile snapshot만 만든다.
2. L3-L5는 AI 추천 전 근거를 안전하게 줄이고, template 후보가 실제 source evidence를 갖췄는지 판정하는 control-plane이다. row-level AI, raw payload full scan, embedding build는 금지하거나 extension으로 넘긴다.
3. L6-L8은 추천 draft 영역이다. Silver, Gold, vector handoff가 각각 분리되어야 하며, 이 단계의 결과는 아직 실행 spec이 아니다.
4. product-health Gold는 L7에서 “draft/template”으로만 나온다. L9 승인 전에는 실행 가능한 Gold가 아니다.
5. risk_score는 데이터셋별 evidence에 따라 component와 weight가 달라진다. 전역 고정 공식으로 설명하면 틀린다.
5. PII 판단은 현재 이름 기반 heuristic이다. 최종 보안 판정이라기보다 catalog/query exposure를 보수적으로 제한하기 위한 1차 경고다.
