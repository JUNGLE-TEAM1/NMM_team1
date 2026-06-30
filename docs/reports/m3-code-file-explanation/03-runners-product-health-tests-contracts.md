# M3 Logical L0-L16 Runner, Product Health, Tests, Contracts 해설

이 문서는 M3 core 코드 밖의 검증/보조 파일을 **logical L0-L16 기준**으로 설명한다. 여기의 Spark/MinIO runner는 M3 production runtime이 아니라, M3가 만든 L0-L16 계약과 preview-only spec이 대용량/다양한 source에서 실제로 말이 되는지 확인하는 로컬 검증 하네스다. 파일명에 `l0_l6`이나 `l0_l10`이 남아 있어도 의미 기준은 logical L0-L16이며, physical `l0`~`l10` 산출물 위치는 compatibility layer로만 해석한다.

## Runner/Test가 검증하는 Logical L0-L16 범위

| Logical group | 검증 초점 | 관련 파일 |
| --- | --- | --- |
| `L0-L2` | source unit, Bronze sample, profile/schema snapshot이 unknown CSV/JSON/JSONL/Parquet에서 생성되는지 확인 | `m3_l0_l6_spark_contract_pipeline.py`, `test_m3_expanded_contract.py` |
| `L3-L5` | AI-safe evidence, metadata/template retrieval, product-health grounding이 raw full scan/row-level AI 없이 가능한지 확인 | `m3_l0_l6_spark_contract_pipeline.py`, `test_m3_expanded_contract.py` |
| `L6-L8` | Silver draft, Gold draft, vector handoff draft가 사용자 수정 가능한 추천으로 남는지 확인 | `m3_l0_l6_spark_contract_pipeline.py`, `contracts/product_health_*.sample.json` |
| `L9-L12` | approval state, Silver/Gold preview-only spec, compiler validation, unsupported action gate가 안전한지 확인 | `test_m3_expanded_contract.py`, `contracts/product_health_transform_spec.sample.json` |
| `L13-L16` | preview evidence, 3-axis readiness, catalog/M6/vector handoff가 실제 downstream에서 해석 가능한지 확인 | `m3_weighted_window_parallel_runner.py`, `test_product_health_contracts.py` |

대상 파일:

- [m3_contract_cli.py](D:/NMM_team1/tools/m3_contract_cli.py)
- [m3_contract_planner.py](D:/NMM_team1/tools/m3_contract_planner.py)
- [m3_l0_l10_spark_contract_pipeline.py](D:/NMM_team1/tools/m3_l0_l10_spark_contract_pipeline.py)
- [m3_l0_l6_spark_contract_pipeline.py](D:/NMM_team1/tools/m3_l0_l6_spark_contract_pipeline.py)
- [m3_weighted_window_parallel_runner.py](D:/NMM_team1/tools/m3_weighted_window_parallel_runner.py)
- [product_health_reference_transform.py](D:/NMM_team1/tools/product_health_reference_transform.py)
- [product_health_spark_validation.py](D:/NMM_team1/tools/product_health_spark_validation.py)
- [test_m3_expanded_contract.py](D:/NMM_team1/tests/test_m3_expanded_contract.py)
- [test_product_health_contracts.py](D:/NMM_team1/tests/test_product_health_contracts.py)
- [test_product_health_reference_transform.py](D:/NMM_team1/tests/test_product_health_reference_transform.py)
- [contracts/product_health_*.sample.json](D:/NMM_team1/contracts)

## Thin Entrypoint 파일

### [m3_contract_cli.py](D:/NMM_team1/tools/m3_contract_cli.py)

| Line range | 설명 |
| --- | --- |
| 1 | `m3_contract.cli.main` import. 실제 구현은 `tools/m3_contract/cli.py`에 있고, 이 파일은 wrapper다. |
| 4-5 | 직접 실행될 때 `main()` 반환값을 process exit code로 쓴다. 과거 또는 편의 실행 경로를 유지하는 역할이다. |

### [m3_contract_planner.py](D:/NMM_team1/tools/m3_contract_planner.py)

| Line range | 설명 |
| --- | --- |
| 1 | future annotation 활성화. |
| 3 | `m3_contract.cli.main` import. 이름은 planner지만 현재 별도 planner 로직 없이 같은 M3 CLI를 호출한다. |
| 6-7 | 직접 실행 시 CLI main을 실행한다. `m3_contract_cli.py`와 사실상 같은 thin wrapper다. |

### [m3_l0_l10_spark_contract_pipeline.py](D:/NMM_team1/tools/m3_l0_l10_spark_contract_pipeline.py)

| Line range | 설명 |
| --- | --- |
| 1-7 | canonical M3 physical l0-l10 Spark-backed contract validation entrypoint라는 docstring. 구현은 backward compatibility 때문에 기존 `m3_l0_l6_spark_contract_pipeline.py`에 남겨둔다고 설명한다. 여기서 l0-l10은 논리 단계가 아니라 물리 artifact layout 이름이고, 문서 해석 기준은 logical L0-L16이다. |
| 11 | 실제 `main`을 legacy 이름의 pipeline 파일에서 가져온다. |
| 14-15 | 직접 실행 시 imported `main()`을 실행한다. 파일명은 physical l0-l10 wrapper지만 본체는 더 오래된 l0-l6 이름의 파일이다. 둘 다 logical L0-L16 검증 하네스의 compatibility 이름이다. |

## [m3_l0_l6_spark_contract_pipeline.py](D:/NMM_team1/tools/m3_l0_l6_spark_contract_pipeline.py)

이 파일은 이름과 달리 physical l0-l10 Spark-backed local validation harness다. 논리 의미는 확장된 L0-L16 계약을 따라가지만, 산출물 폴더와 runner 이름은 기존 l0-l10 호환명을 유지한다. M3 core production이 아니라 MinIO/Spark 환경에서 M3 L0-L16 계약이 대용량/다양한 source에서도 말이 되는지 검증하고 보고서를 만드는 용도다.

| Line range | 설명 |
| --- | --- |
| 1-10 | 파일 목적 선언. physical `l0`는 full raw inventory를 참조하고, physical `l1`~`l10`은 bounded Spark sample/profile/preview를 사용한다. logical 의미는 L0-L16이며, production materialization은 M2 책임이라고 명시한다. |
| 14-31 | 표준 라이브러리와 PySpark DataFrame/SparkSession/functions/types import. |
| 34-39 | repo root, S3 env, raw manifest, artifact root, report root, Spark local temp 기본 경로. 여기서 local 검증 산출물은 F drive와 repo report로 나뉜다. |
| 42-50 | PySpark 설치 경로에서 Hadoop AWS/S3A jar URI를 찾아 Spark에 넘기기 위한 helper. |
| 53-63 | `DatasetSpec` dataclass. dataset key, display name, source id, domain, format, S3 URI, raw key prefix, description을 갖는다. |
| 65-116 | 기본 dataset 정의. Amazon review JSONL, Amazon metadata JSONL, NYC taxi CSV, NYC taxi Parquet mirror, Taobao event JSONL을 대상으로 한다. |
| 119-189 | physical l0-l10 / logical L0-L16 subtopic 목차. artifact 생성뿐 아니라 Markdown/HTML report 생성 목차로도 쓰인다. 논리 L0-L16의 canonical 기준은 `layer_map.py`다. |
| 192-235 | 시간/run id/directory/write/hash helper. JSON, JSONL, text artifact 저장에 사용된다. |
| 238-271 | `.env` 읽기, raw manifest JSONL 로딩, S3A URI 파싱, artifact root 상대경로 변환. |
| 274-320 | sample value 축약, JSON flatten, JSON type 판정, identifier normalization. profile/report에서 안전한 표시를 위해 필요하다. |
| 323-356 | field name classifier. sensitive, identifier, business key 등을 이름 기반으로 분류한다. |
| 359-363 | source contract mismatch 감지. 예를 들어 taxi dataset인데 ecommerce event field가 나오면 mismatch로 본다. |
| 365-385 | 간단한 YAML-like serializer. 일부 spec/report text 출력에 사용된다. |
| 388-412 | HTML report wrapper와 CSS. |
| 415-473 | `SparkM3Pipeline.__init__`과 `run()`. Spark session, run id, artifact/report root, raw manifest, S3 env, sample limits, source window 정보를 보관하고 dataset별 처리를 실행한다. |
| 475-540 | dataset directory, source unit id, object id, artifact write, progress update helper. |
| 542-572 | raw manifest에서 dataset object를 찾고, boto3 client를 lazy init하며, MinIO bucket 보장과 text object upload를 담당한다. |
| 574-695 | CSV/JSONL Range sampling. 전체 파일을 읽지 않고 source window byte range로 나눠 line sample을 만든다. CSV는 header probe를 별도로 처리한다. |
| 697-722 | Parquet sample URI 선택. raw manifest object를 정렬하고 source-window modulo 방식으로 일부 file만 선택한다. |
| 723-768 | dataset 하나의 전체 처리 순서. physical l0부터 l10까지 builder를 호출하고 layer별 progress를 기록한다. 논리 의미는 L0-L16 split과 연결된다. |
| 769-965 | L0 구현. raw object inventory, source manifest, source unit manifest, consistency result, file inventory, chunk manifest, raw version index, storage policy, replay manifest, query mirror ref를 만든다. |
| 966-1080 | Spark sample loading. JSONL/CSV는 Range sample을 local/S3 object로 만들고 Spark가 읽는다. Parquet은 selected file URI를 직접 Spark가 읽는다. |
| 1082-1216 | L1 구현. Spark sample rows를 Bronze envelope로 감싸고 parse status, replay locator, raw hash, payload, rescue lane, sample provenance check를 만든다. |
| 1217-1472 | L2 구현. profile job request/result, schema fingerprint, CSV dialect, JSONL validation, JSON path trie, large-source sketch, type router, two-stage profile, profile snapshot을 만든다. |
| 1473-1807 | L3 구현. field classification, PII candidate, Silver rule, Gold model 후보, AI input pack, product-health 후보, Gold-to-Gold option, policy context, approval draft를 만든다. |
| 1808-2094 | L4 구현. Silver preview parquet, Gold preview parquet, recommendation draft, M2 preview job request, JSON/YAML spec, transform graph, compiler validation, unsupported action report, preview validation result를 만든다. |
| 2044-2066 | `build_silver_df()`. rule별 source column select, struct/array/map JSON string화, sensitive hash 처리, `_m3_run_id`, `_source_id`, `_source_uri` 추가. |
| 2068-2082 | `build_gold_df()`. 첫 Gold model 기준 dimension groupBy와 row_count/numeric average를 만든다. dimension이 없으면 전체 row count fallback. |
| 2084-2094 | `gold_semantic_warnings()`. taxi group collapse, ecommerce semantic confirmation, fallback model 같은 owner review warning을 만든다. |
| 2095-2404 | L5 구현. processing quality, catalog safety, gold readiness를 분리하고 row loss/growth, zero rows, schema compatibility, PII, source mismatch, gold semantic warning을 검사한다. |
| 2389-2403 | PII candidate detection helper. field list에서 PII 후보를 추출한다. |
| 2405-2684 | L6 구현. compiler package, M2 execution bundle, operation params schema, compiler validation, PII query context validator, catalog metadata draft, lineage, M6 SQL context, artifact manifest, caveat, handoff package를 만든다. |
| 2685-2738 | L7 구현. Silver preview validation import contract와 Silver structural axis를 만든다. |
| 2740-2803 | L8 구현. Gold preview job contract, validation import, metric definition draft, semantic readiness axis를 만든다. |
| 2805-2839 | `context_statuses()`. processing/catalog/gold status를 Silver/Gold/M6 context status로 변환한다. Gold 문제는 Silver readiness를 오염시키지 않도록 분리한다. |
| 2841-2891 | L9 구현. processing, catalog, gold readiness axis와 precedence rule, gate summary를 만든다. |
| 2893-3062 | L10 구현. final catalog sync package, SQL context, M1 feedback, M2 handoff, M5 catalog upsert payload, M6 query context payload, module integration contract, artifact manifest, context consistency result를 만든다. |
| 3064-3183 | caveat summary, artifact manifest, run summary 생성. dataset별 bytes, rows, status, quality score, handoff refs를 합산한다. |
| 3185-3541 | Markdown/HTML report 생성. summary, subtopic report, index board를 만든다. |
| 3544-3598 | `create_spark()`. S3A endpoint/key/secret/path-style, memory/core/shuffle/local dir/jar/driver host를 설정해 SparkSession을 만든다. |
| 3601-3625 | CLI args. Spark master, S3A jar, sample rows, source window, memory/core, dataset filter 등을 받는다. |
| 3628-3683 | `main()`. source window 검증, S3 env/raw manifest 로딩, dataset filter, Spark 생성, pipeline 실행, summary stdout 출력, Spark stop. |

주의: 이 파일의 Spark 실행은 M3 계약 검증용이다. 발표에서 “M3가 Spark production ETL을 한다”고 말하면 안 되고, “M3 spec이 M2 Spark로 실행 가능한지 검증했다”고 말해야 맞다.

## [m3_weighted_window_parallel_runner.py](D:/NMM_team1/tools/m3_weighted_window_parallel_runner.py)

이 파일은 여러 source window를 병렬 Spark application처럼 실행하는 orchestrator다. pipeline 자체가 아니라 실행 분할/상태 모니터링/merge report를 담당한다.

| Line range | 설명 |
| --- | --- |
| 1-6 | weighted parallel validation runner 목적과 scope boundary 선언. Docker/notebook/local Spark concerns를 M3 계약 artifact에 넣지 않는다고 설명한다. |
| 23-31 | physical l0-l10 pipeline의 dataset/default path/manifest loader를 import한다. 이 loader가 읽는 산출물은 logical L0-L16 의미로 해석한다. |
| 34-38 | repo root, canonical pipeline path, current status Markdown/HTML path. |
| 40-52 | physical l0-l10 / logical L0-L16 stage map. status board와 summary에 layer별 M3 scope를 표시한다. |
| 54-68 | dataset별 window count와 짧은 이름. 큰 JSONL source는 여러 window로, CSV는 1개로 둔다. |
| 70-88 | required artifacts. task 성공 여부를 physical l0-l10 핵심 산출물 존재로 검증한다. |
| 91-146 | 시간, 파일 쓰기/읽기, raw manifest bytes 계산, Spark cluster UI JSON 조회 helper. |
| 149-209 | `Task` dataclass. dataset/window/run id/log/process/progress/summary/validation 상태를 담는다. |
| 212-252 | `build_tasks()`. dataset별 raw bytes와 window count를 계산하고 큰 작업부터 정렬한다. |
| 255-299 | `task_command()`. 각 task를 `m3_l0_l10_spark_contract_pipeline.py` subprocess로 실행하는 command line을 만든다. |
| 302-346 | `start_task()`, `refresh_task()`. subprocess 시작, stdout/stderr log, progress/summary 갱신. |
| 349-370 | `validate_task_artifacts()`. required artifact 존재, processing quality, sample provenance, transformation quality, L10 consistency로 pass/warn/block 판정. |
| 373-505 | `merge_summary()`. 모든 task 결과를 합쳐 window count, completed/failed, sample rows, preview rows, quality status, speedup, dataset status counts를 만든다. |
| 508-617 | `render_html()`. auto-refresh status board HTML을 만든다. |
| 620-657 | `render_markdown()`. scope boundary, physical l0-l10 / logical L0-L16 stage map, dataset/task summary를 Markdown으로 만든다. |
| 660-671 | status files write. summary JSON/MD/HTML, current status, task-result JSON을 저장한다. |
| 674-698 | `run()`. queue에서 `max_parallel_apps`만큼 task를 실행하고 poll마다 refresh/status write를 반복한다. |
| 701-733 | CLI args와 main. Spark cluster, max parallel apps, sample size, output root 등을 받는다. |

## [product_health_reference_transform.py](D:/NMM_team1/tools/product_health_reference_transform.py)

이 파일은 `gold_product_health` 계약이 실제로 실행 가능한 의미인지 확인하는 deterministic reference runner다. M2 production Spark runtime이 아니라, M3 계약의 semantic reference다.

| Line range | 설명 |
| --- | --- |
| 1-7 | 목적 선언. fixed output columns, zero denominator behavior, source-adaptive risk scoring 검증이라고 밝힌다. |
| 21-34 | `OUTPUT_COLUMNS`. `product_id`, `product_name`, `category_l1`, `review_count`, `average_rating`, `negative_review_rate`, `view_count`, `purchase_count`, `conversion_rate`, `delivery_count`, `late_delivery_rate`, `risk_score` 순서를 고정한다. |
| 36-41 | `BASE_RISK_WEIGHTS`. negative review 0.35, low rating 0.30, low conversion 0.20, late delivery 0.15. 실제 계산에서는 사용 가능한 component만 재정규화한다. |
| 44-58 | nested path와 first non-empty value helper. unknown JSON/CSV에서 다양한 column 이름을 흡수한다. |
| 61-98 | numeric/bool/datetime parsing helper. 잘못된 숫자, infinite, 잘못된 datetime은 null로 둔다. |
| 100-145 | JSONL/JSON/CSV record iterator. JSON은 list, `{records|rows|data|items: []}`, 단일 object를 모두 처리한다. |
| 147-177 | `source_evidence()`. input path/bytes, scanned rows, product id present/missing rows, unique product ids, scan limit, evidence scope를 만든다. |
| 180-197 | review/product/behavior/delivery source에서 product id를 찾는 함수들. `product_id`, `parent_asin`, `asin`, `item_id`, nested `item.item_id`를 후보로 본다. |
| 200-223 | product name, review product name hint, behavior product name hint, category_l1 추출. review `title`은 product name으로 쓰지 않도록 별도 hint 함수가 있다. |
| 225-235 | behavior action과 view/purchase action classifier. view/impression/pv/product_impression, purchase/buy/order/checkout 계열을 구분한다. |
| 238-265 | product master load와 hint merge. product master가 우선이고, review/behavior hint는 보강용이다. |
| 267-284 | `aggregate_reviews()`. product id별 review count, rating sum/count, negative review count를 만든다. rating <= 2 또는 negative sentiment를 negative로 본다. |
| 287-298 | `aggregate_behavior()`. view count와 purchase count를 product id별로 센다. |
| 301-314 | `aggregate_delivery()`. late flag 또는 delivered_at > promised_at이면 late delivery로 센다. |
| 317-333 | ratio와 derived score helper. denominator 0이면 ratio는 `None`; low rating, low conversion component를 만든다. |
| 335-353 | `risk_score_for()`. non-null component만 사용하고 base weight를 해당 component 합으로 재정규화한다. component가 하나도 없으면 risk score는 `None`. |
| 356-395 | `build_gold_rows()`. product universe를 product master/review/behavior/delivery product id union으로 만들고 row별 metrics와 risk coverage를 생성한다. |
| 398-418 | JSONL/CSV/JSON writer. CSV header는 `OUTPUT_COLUMNS` 순서다. |
| 421-511 | `run()`. evidence, product hints, aggregates, gold rows를 만들고 `gold_product_health.jsonl`, `gold_product_health.csv`, `risk_score_coverage.jsonl`, `product_health_reference_summary.json`을 저장한다. |
| 514-538 | CLI args와 main. source별 input, row limit, output limit, identity mapping approval flag를 받는다. |

zero denominator 정책:

- `average_rating`: rating count가 0이면 null
- `negative_review_rate`: review count가 0이면 null
- `conversion_rate`: view count가 0이면 null
- `late_delivery_rate`: delivery count가 0이면 null
- `risk_score`: 사용 가능한 component가 하나도 없으면 null

## [product_health_spark_validation.py](D:/NMM_team1/tools/product_health_spark_validation.py)

이 파일은 product-health 의미를 Spark/MinIO에서 검증하는 harness다. reference transform과 같은 column/metric 의미를 Spark DataFrame 연산으로 증명한다.

| Line range | 설명 |
| --- | --- |
| 1-17 | 파일 목적. fixed schema, source-level aggregation, product universe, null denominator, adaptive risk score를 Spark에서 검증한다고 설명한다. |
| 34-54 | output columns와 risk base weights. reference transform과 같은 의미를 유지한다. |
| 56-129 | review/product/behavior/delivery Spark schema. nested item/interaction field도 일부 지원한다. |
| 132-176 | Spark builder. S3A endpoint/key/secret/path-style, executor/core/memory/shuffle/jar 설정을 넣는다. credential은 인자 또는 env에서 받아야 한다. |
| 179-191 | JSON read helper와 ratio-or-null Spark expression. denominator가 0이면 null double. |
| 194-207 | source별 product id coalesce expression. |
| 210-245 | reviews/behavior/delivery aggregate. reference transform과 같은 count/rate 준비값을 Spark groupBy로 만든다. |
| 247-296 | product dimensions. product master, review hint, behavior hint를 product id 기준으로 합쳐 name/category를 결정한다. |
| 299-346 | `build_gold()`. product universe union 후 left join, count null은 0, rates는 zero denominator null, risk score는 non-null component weight sum으로 재정규화한다. |
| 349-383 | controlled seed case. full metric, missing denominator, no evidence 케이스를 검증할 수 있는 작은 Spark DataFrame을 만든다. |
| 386-400 | case별 input 선택. Amazon review+metadata, Taobao behavior-only, controlled seed를 지원한다. |
| 403-436 | case summary. row count, metric non-null counts, zero denominator evidence, top risk sample, Spark info, risk policy를 기록한다. |
| 439 | local summary JSON writer. |
| 444-485 | `run()`. case별 Gold DataFrame을 만들고 JSON/Parquet을 MinIO output URI에 쓴 뒤 summary JSON을 local에 저장한다. |
| 488-528 | CLI args와 main. S3 credential, source URI, output URI, summary path, Spark resource option을 받는다. |

## Test 파일

### [test_m3_expanded_contract.py](D:/NMM_team1/tests/test_m3_expanded_contract.py)

| Line range | 보증 내용 |
| --- | --- |
| 15-76 | JSONL review, CSV order, pretty JSON document, fake Parquet fixture를 만든다. |
| 79-182 | `m3_contract_cli.py`를 subprocess로 실행하는 helper. format/source id/run id/output dir/gold decision을 바꿔 M3 산출물을 만든다. |
| 185-230 | JSON loader, artifact ref resolver, legacy `window_id` 금지 assertion helper. |
| 233-385 | deferred/not_requested Gold에서도 expanded L0-L16 contract가 유지되는지 검증한다. product-health template, risk policy, vector handoff, L15 gate, L16 handoff, artifact refs를 본다. |
| 387-424 | CSV orders가 product-health로 오분류되지 않는지 검증한다. product key/rating evidence가 없으면 product-health/risk policy가 `needs_source_evidence`여야 한다. |
| 426-440 | pretty JSON이 JSONL parse error가 아니라 JSON document profile로 처리되는지 검증한다. |
| 442-455 | Parquet은 lightweight core parser가 직접 파싱하지 않고 extension/M2 profile required contract로 routing되는지 검증한다. |
| 457-474 | Gold approved일 때 aggregate params가 structured schema를 가지며 L9 Silver/Gold context가 ready 계열인지 검증한다. |

### [test_product_health_contracts.py](D:/NMM_team1/tests/test_product_health_contracts.py)

| Line range | 보증 내용 |
| --- | --- |
| 10-34 | expected product-health columns와 source ids를 고정한다. |
| 37-79 | gold contract와 risk score policy를 검증한다. schema, source requirements, anti-pattern, zero denominator, approval gate, adaptive weights, blocked claims를 본다. |
| 81-127 | transform spec이 `gold_product_health` E2E를 겨냥하는지 확인한다. reference runner, Spark harness, source evidence, full outer join, risk score operation contract를 검증한다. |
| 129-146 | schema/catalog/workflow fixture가 M6 query와 M1 display에 필요한 table name, columns, demo query, lineage, workflow config를 갖는지 확인한다. |
| 148-164 | vector index handoff가 metric value evidence가 아니라 semantic catalog search helper임을 고정한다. |

### [test_product_health_reference_transform.py](D:/NMM_team1/tests/test_product_health_reference_transform.py)

| Line range | 보증 내용 |
| --- | --- |
| 11-17 | JSONL write/read helper. |
| 19-124 | mixed sources에서 fixed schema, source evidence, full outer product universe, zero denominator, risk coverage가 작동하는지 검증한다. |
| 126-160 | debug output limit이 있으면 output truncation metadata가 정확히 기록되는지 검증한다. |
| 162-185 | review `title`을 product name으로 오해하지 않도록 막는다. |
| 187-218 | behavior-only nested JSONL에서 `item.item_id`, `item.category_id`를 읽어 product row를 유지하고 conversion rate를 계산하는지 검증한다. |

## Product Health Contract Fixtures

| Fixture | 고정하는 계약 |
| --- | --- |
| [product_health_gold_contract.sample.json](D:/NMM_team1/contracts/product_health_gold_contract.sample.json) | `gold_product_health`의 grain, output schema, source requirements, metric semantics, zero denominator, anti-patterns, M3/M2/M5/M6 claim boundary를 고정한다. |
| [product_health_risk_score_policy.sample.json](D:/NMM_team1/contracts/product_health_risk_score_policy.sample.json) | risk score가 L9 승인 전 draft 추천이며, source evidence adaptive weight, missing component exclusion, coverage metadata, approval/block condition을 따라야 함을 고정한다. |
| [product_health_transform_spec.sample.json](D:/NMM_team1/contracts/product_health_transform_spec.sample.json) | reviews/behavior/delivery/product master read -> normalize -> source-level aggregate -> full outer product id join -> metric derivation -> load 순서를 고정한다. |
| [product_health_schema_definition.sample.json](D:/NMM_team1/contracts/product_health_schema_definition.sample.json) | M1/M5/M6가 참조할 Gold schema field path/type/nullability를 고정한다. |
| [product_health_catalog_metadata.sample.json](D:/NMM_team1/contracts/product_health_catalog_metadata.sample.json) | catalog table name, storage placeholder, schema, lineage, allowed query columns, canonical demo query, M3 contract refs를 고정한다. |
| [product_health_workflow_definition.sample.json](D:/NMM_team1/contracts/product_health_workflow_definition.sample.json) | M1/M5 workflow graph를 고정한다. source nodes, normalize, aggregate, join/score, load node와 edge, runner primary/fallback 정책을 담는다. |
| [product_health_vector_index_handoff.sample.json](D:/NMM_team1/contracts/product_health_vector_index_handoff.sample.json) | M6/vector extension의 semantic catalog index template이다. dataset/metric docs, payload filter keys, search policy, accuracy boundary를 고정하며 numeric correctness 증거가 아님을 명시한다. |

## Runner/Product Health 주의점

1. `m3_l0_l6_spark_contract_pipeline.py`는 파일명과 달리 physical l0-l10 artifact layout까지 구현한다. 문서 해석 기준은 logical L0-L16이고, 이 runner는 그 계약이 Spark/MinIO 검증 환경에서도 성립하는지 확인한다.
2. `m3_l0_l10_spark_contract_pipeline.py`는 canonical 이름 wrapper이고, 본체가 아니다.
3. Spark pipeline과 weighted runner는 local 검증/보고서 harness다. M3 production core로 설명하면 안 된다.
4. product-health `risk_score`는 전역 고정 공식이 아니라 available component만 쓰고 weight를 재정규화한다.
5. vector index handoff는 catalog/search 보조다. metric numeric correctness를 증명하거나 올려주는 장치가 아니다.
