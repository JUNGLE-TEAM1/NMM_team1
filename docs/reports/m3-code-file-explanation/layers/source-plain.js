window.M3_LAYER_PLAIN = {
  L0: {
    simpleTitle: "원본에 이름표 붙이기",
    oneLine: "원본 파일을 건드리지 않고, 어디에 있고 나중에 어떻게 다시 찾을 수 있는지만 정확히 기록한다.",
    easyMeaning: "쉽게 말하면 창고에 있는 상자를 열어 내용물을 바꾸는 단계가 아니라, 상자마다 번호표와 위치표를 붙이는 단계다. M3가 raw 데이터를 복사하거나 수정하면 안 되기 때문에, L0는 파일 경로, URI, 크기, checksum, source_unit_id, object_id만 남긴다.",
    why: "뒤 단계에서 문제가 생기면 같은 원본으로 다시 재현해야 한다. source_unit_id와 object_id가 없으면 Bronze/Silver/Gold가 어떤 원본 조각에서 왔는지 추적할 수 없다.",
    inputs: ["사용자가 등록한 파일 또는 폴더", "source_id", "run_id", "checksum 정책"],
    outputs: ["object_stream_manifest.json", "source_manifest.json", "raw_replay_pointer.json"],
    next: "L1은 이 manifest를 보고 sample record를 만들고, L2 이후 단계는 같은 source_unit_id를 계속 따라간다.",
    watch: "원본 내용 해석, CSV/JSON 판별, column 추론은 여기서 하지 않는다. L0에서 format을 단정하면 unknown data 대응이 약해진다.",
    steps: [
      ["찾기", "source 폴더 아래 파일 목록을 안정적으로 모은다."],
      ["이름 붙이기", "각 파일에 object_id와 source_unit_id를 붙인다."],
      ["다시 찾는 법 저장", "URI, checksum, size, modified_at, replay pointer를 artifact로 저장한다."],
    ],
  },
  L1: {
    simpleTitle: "원본 일부를 Bronze 봉투에 담기",
    oneLine: "원본 전체가 아니라 제한된 sample만 읽고, 각 record가 어디서 왔는지 locator와 함께 Bronze 모양으로 감싼다.",
    easyMeaning: "쉽게 말하면 전체 책을 복사하는 게 아니라 몇 쪽만 복사해 책 제목, 페이지 번호, 줄 번호를 같이 붙여 두는 단계다. parse가 실패할 수 있는 데이터도 버리지 않고 rescue lane 규칙으로 보존한다.",
    why: "M3가 대용량 전체를 읽으면 실행 엔진이 되어버린다. 그래서 sample row와 byte 수를 제한하고, 전체 Bronze 실행은 M2가 맡도록 계약만 만든다.",
    inputs: ["L0 files", "L0 objects/source_units", "max_rows", "max_bytes"],
    outputs: ["bronze_envelope_samples.jsonl", "rescue_lane.jsonl", "bronze_envelope_spec.json"],
    next: "L2는 이 sample을 보고 format과 field 구조를 추정한다. M2는 같은 envelope spec으로 전체 Bronze를 만들 수 있다.",
    watch: "sample은 전체 데이터의 완전한 통계가 아니다. 희귀 column, 뒤쪽 파일의 drift, multiline/binary format은 별도 evidence가 필요할 수 있다.",
    steps: [
      ["제한해서 읽기", "row 수와 byte 수 한도를 넘으면 바로 멈춘다."],
      ["위치 남기기", "line_number, byte_start, byte_end, object_id를 record_locator에 넣는다."],
      ["실패 보존", "parse 실패나 schema conflict가 생겨도 rescue lane으로 보낼 규칙을 남긴다."],
    ],
  },
  L2: {
    simpleTitle: "데이터 모양 스냅샷 만들기",
    oneLine: "CSV인지 JSON인지, 어떤 field가 있고 null/type/PII 후보가 어떤지 sample 기준으로 정리한다.",
    easyMeaning: "쉽게 말하면 데이터의 전체 의미를 확정하는 단계가 아니라, 현재 보이는 sample로 목차와 column 후보표를 만드는 단계다. JSON은 펼쳐 보고, CSV는 구분자와 header를 추정하고, Parquet은 core가 직접 읽지 않으면 extension 필요 상태로 남긴다.",
    why: "AI가 raw를 직접 보고 추측하면 비용과 오류가 커진다. 먼저 deterministic profile을 만들어야 L3 AI 추천이 제한된 근거 안에서 움직인다.",
    inputs: ["L1 sample records", "L0 source scope", "format_hint"],
    outputs: ["format_detection.json", "profile_snapshot.json", "schema_fingerprint.json", "format-specific profile"],
    next: "L3는 raw 대신 L2 profile을 AI-safe evidence로 줄인다. L6 Silver 추천의 target_type과 null handling도 여기서 출발한다.",
    watch: "sample 기반 추론은 틀릴 수 있다. null_ratio, inferred_type, semantic_hints는 확정 schema가 아니라 추천 근거다.",
    steps: [
      ["format 추정", "확장자와 sample 내용을 보고 csv/json/jsonl/text/parquet 상태를 정한다."],
      ["field 요약", "field별 type 분포, null 비율, 예시값, PII 후보를 만든다."],
      ["shape 계약", "M3 core가 처리 가능한지, M2나 extension이 필요한지 명시한다."],
    ],
  },
  L3: {
    simpleTitle: "AI가 봐도 되는 증거만 남기기",
    oneLine: "L2 profile에서 raw와 민감한 값을 빼고, AI가 추천에 사용할 수 있는 작은 evidence pack을 만든다.",
    easyMeaning: "쉽게 말하면 AI에게 원본 창고를 통째로 보여주지 않고, column 이름표와 요약표만 건네는 단계다. PII 후보 예시는 가리고, field당 예시 수도 제한한다.",
    why: "실시간/대용량에서 모든 row를 AI에게 보내는 것은 비용과 속도 면에서 비현실적이다. M3의 AI는 data-plane이 아니라 추천 control-plane에만 들어간다.",
    inputs: ["L2 profile_snapshot", "field summaries", "data_shape_contract"],
    outputs: ["ai_recommendation_input_pack.json", "field_evidence_reducer.json", "redaction_map.json", "unknown_data_recommendation_pack.json"],
    next: "L4/L5는 이 evidence로 template 후보와 grounding을 만들고, L6/L7은 Silver/Gold draft를 만든다.",
    watch: "L3는 추천 근거를 만드는 단계지 Silver/Gold를 확정하는 단계가 아니다. 없는 conversion이나 delivery signal을 여기서 만들어내면 안 된다.",
    steps: [
      ["줄이기", "field별 이름, 타입, null ratio, hint만 남긴다."],
      ["가리기", "PII 후보 field의 예시값은 [REDACTED_PII]로 바꾼다."],
      ["금지선 표시", "row-level AI, full raw stream, unredacted rescue lane은 blocked input으로 적는다."],
    ],
  },
  L4: {
    simpleTitle: "맞는 템플릿을 찾을 준비하기",
    oneLine: "schema/profile metadata와 Gold template 후보를 검색하거나 비교할 수 있는 형태로 정리한다.",
    easyMeaning: "쉽게 말하면 새 데이터가 들어왔을 때 '이 데이터는 어떤 Gold 템플릿과 닮았나'를 찾기 위한 색인을 설계하는 단계다. 실제 vectorDB를 만드는 것이 아니라 어떤 문서를 넣고 어떤 key로 찾을지 계획한다.",
    why: "unknown data마다 사람이 처음부터 Gold 모델을 고르면 느리다. schema/profile/catalog metadata를 검색 가능하게 만들면 product-health 같은 후보를 더 안정적으로 찾을 수 있다.",
    inputs: ["L3 field evidence", "L2 format/profile summary", "내장 Gold template 정의"],
    outputs: ["metadata_retrieval_index_plan.json", "gold_template_candidate_retrieval.json"],
    next: "L5는 검색된 Gold 후보가 실제 source field 근거를 갖는지 더 엄격하게 확인한다.",
    watch: "검색 점수나 vector 유사도는 정답 보증이 아니다. 후보를 찾는 데만 쓰고, metric 계산 가능 여부는 L5 이후에서 확인한다.",
    steps: [
      ["문서 만들기", "schema profile, column profile, Gold template을 검색 문서 후보로 만든다."],
      ["후보 점수화", "product/review/conversion/delivery signal이 얼마나 있는지 점수를 낸다."],
      ["부족한 근거 표시", "분모나 delivery evidence가 없으면 missing_or_weak_evidence로 남긴다."],
    ],
  },
  L5: {
    simpleTitle: "추천 후보가 진짜 근거가 있는지 확인하기",
    oneLine: "Gold/product-health 후보가 실제 field와 type 근거를 갖는지 확인하고, 부족한 metric은 부족하다고 표시한다.",
    easyMeaning: "쉽게 말하면 '이 데이터로 product health를 만들 수 있다'고 바로 믿지 않고, product_id 후보, rating/review 후보, view/purchase 후보, delivery 후보가 실제로 있는지 하나씩 대조하는 단계다.",
    why: "Gold는 의미 기반 결과라 잘못 만들면 발표와 제품 모두에서 문제가 된다. 특히 conversion_rate, late_delivery_rate, risk_score는 근거 없는 값을 만들면 안 된다.",
    inputs: ["L4 template candidate", "L3 field evidence", "product/review/conversion/delivery classifier"],
    outputs: ["candidate_grounding_report.json"],
    next: "L7은 grounding 결과를 보고 product-health template과 risk_score policy를 draft로 만든다.",
    watch: "field 이름 matching은 후보 판정이다. product key와 customer/order/review id를 헷갈리지 않도록 보수적으로 봐야 한다.",
    steps: [
      ["필수 근거 확인", "product key와 review/rating evidence가 있는지 본다."],
      ["분모 확인", "conversion과 delivery rate에 필요한 분자/분모가 모두 있는지 본다."],
      ["승인 전 차단", "grounding이 좋아도 L9 승인 전에는 compile로 보내지 않는다."],
    ],
  },
  L6: {
    simpleTitle: "Silver 정제 방법 추천하기",
    oneLine: "각 field를 Silver에서 어떻게 고르고, 이름 바꾸고, 타입 바꾸고, 가리고, null 처리할지 초안을 만든다.",
    easyMeaning: "쉽게 말하면 지저분한 Bronze를 바로 바꾸는 게 아니라, '이 column은 숫자로 바꾸자', '이 field는 PII라 가리자', '이 JSON은 문자열로 안전하게 두자' 같은 작업 지시서 초안을 만드는 단계다.",
    why: "unknown data는 사람 검토 없이 바로 변환하면 위험하다. M3는 추천 draft를 만들고, 사용자가 수정/승인한 뒤에만 spec으로 내린다.",
    inputs: ["L3 field evidence", "PII hint", "inferred type", "null ratio"],
    outputs: ["silver_policy_recommendation_draft.json"],
    next: "L9에서 사용자가 Silver 추천을 승인하면 L10이 deterministic Silver transform spec으로 바꾼다.",
    watch: "L6는 실행이 아니다. 추천 action이 allowed set 밖이면 L12에서 unsupported로 막힌다.",
    steps: [
      ["기본 선택", "drop 조건이 없으면 field를 보존하는 select부터 시작한다."],
      ["타입/시간 처리", "숫자, boolean, timestamp 후보는 cast나 parse_timestamp를 추천한다."],
      ["보안 처리", "PII 후보는 mask와 catalog/query exposure 정책을 함께 붙인다."],
    ],
  },
  L7: {
    simpleTitle: "Gold를 어떻게 만들지 추천하기",
    oneLine: "Gold table 후보, product-health template, risk_score 계산 정책을 데이터 근거에 맞춰 초안으로 만든다.",
    easyMeaning: "쉽게 말하면 Silver 위에 어떤 요약표를 만들 수 있을지 제안하는 단계다. product_id별 리뷰 수, 평균 평점, 부정 리뷰율, 전환율, 배송 지연율, risk_score 같은 항목을 만들 수 있는지 따진다.",
    why: "Gold는 비즈니스 의미가 들어간다. 데이터마다 있는 signal이 다르므로 risk_score를 전역 고정식으로 박으면 안 되고, 가능한 component와 weight를 추천해야 한다.",
    inputs: ["L3/L5 evidence", "Gold template 후보", "product/review/conversion/delivery field 후보"],
    outputs: ["gold_model_recommendation_draft.json", "product_health_gold_template_draft.json", "risk_score_policy_recommendation_draft.json"],
    next: "L9에서 사용자가 Gold와 risk policy를 승인하거나 보류한다. 승인된 경우에만 L11 Gold spec으로 내려간다.",
    watch: "view_count가 없으면 conversion_rate를 만들 수 없고, delivery_count가 없으면 late_delivery_rate를 확정할 수 없다. 없는 metric은 null/deferred로 남겨야 한다.",
    steps: [
      ["일반 Gold 후보", "dimension과 measure가 있으면 count/avg aggregate 후보를 만든다."],
      ["product-health 후보", "product, review, conversion, delivery signal을 보고 metric별 status를 정한다."],
      ["risk_score 정책", "available component만 weight 재정규화하고, missing component는 coverage에 기록한다."],
    ],
  },
  L8: {
    simpleTitle: "검색/벡터 연동 준비하기",
    oneLine: "텍스트 field, entity key, metadata field를 골라 vector/semantic search로 넘길 수 있는 template을 만든다.",
    easyMeaning: "쉽게 말하면 리뷰 본문이나 설명 같은 텍스트를 나중에 검색에 쓸 수 있도록 '어떤 field를 embedding 후보로 보낼지' 목록을 만드는 단계다. M3가 직접 embedding을 만들지는 않는다.",
    why: "schema/profile/catalog metadata를 vectorDB에 넣으면 M6가 사용자의 질문과 맞는 dataset/field/metric을 찾기 쉬워진다. 하지만 raw text와 PII를 무조건 넣으면 위험하다.",
    inputs: ["L3 field evidence", "text/entity/metadata 후보", "PII policy"],
    outputs: ["vector_embedding_handoff_template.json", "ai_generation_trace.json"],
    next: "L16은 이 template을 catalog/query/vector handoff package에 포함한다. 실제 vector index build는 M6 또는 extension 책임이다.",
    watch: "vector similarity는 검색 정확도를 높일 수 있지만 Gold 숫자 값의 정확성을 증명하지 않는다.",
    steps: [
      ["텍스트 후보 찾기", "review/comment/description/title/text 계열 field를 후보로 잡는다."],
      ["PII 제외", "PII 후보 field는 기본 embedding text와 metadata에서 제외한다."],
      ["extension hook", "실제 embedding job은 승인 후 downstream extension이 실행하도록 남긴다."],
    ],
  },
  L9: {
    simpleTitle: "사용자가 고른 선택을 공식 기록하기",
    oneLine: "Silver, Gold, Gold-to-Gold, risk_score, vector handoff를 승인/보류/거절 상태로 고정한다.",
    easyMeaning: "쉽게 말하면 추천 목록에서 사용자가 무엇을 채택했고 무엇을 아직 미뤘는지 도장 찍는 단계다. 추천이 있다는 것과 실행해도 된다는 것은 다르다.",
    why: "Gold는 의미와 business 책임이 들어간다. 사용자가 승인하지 않은 Gold를 자동으로 만들면 다른 M이 잘못된 catalog/query context를 믿게 된다.",
    inputs: ["L6 Silver draft", "L7 Gold draft", "L8 vector handoff draft", "사용자 gold_decision"],
    outputs: ["approval_state.json", "silver_policy_decision.json", "gold_policy_decision.json", "gold_to_gold_policy_decision.json"],
    next: "L10/L11 compiler는 L9에서 compile_allowed가 true인 decision만 spec으로 바꾼다.",
    watch: "Gold가 not_requested나 deferred여도 Silver는 계속 진행될 수 있어야 한다. Gold 상태가 Silver 상태를 오염시키면 안 된다.",
    steps: [
      ["Silver 결정", "preview path에서는 Silver decision을 승인 상태로 고정한다."],
      ["Gold 결정", "approved일 때만 selected_gold_models를 남기고, 아니면 빈 배열로 둔다."],
      ["추적 정보", "review_id와 decision_trace_id로 누가 무엇을 결정했는지 남긴다."],
    ],
  },
  L10: {
    simpleTitle: "Silver 실행 설계도로 바꾸기",
    oneLine: "승인된 Silver decision을 M2가 실행할 수 있는 preview-only transform spec으로 바꾼다.",
    easyMeaning: "쉽게 말하면 사용자가 승인한 Silver 정제 방법을 Spark나 로컬 runner가 읽을 수 있는 작업 지시서로 번역하는 단계다. 여기서도 production write는 금지된다.",
    why: "AI 추천을 바로 코드 실행으로 넘기면 위험하다. M3는 선언형 spec만 만들고, 실제 Spark 실행은 M2가 담당한다.",
    inputs: ["L0 source scope", "L9 silver_policy_decision", "compiler supported actions"],
    outputs: ["silver_transform_spec.json"],
    next: "L12가 spec이 안전한지 검사하고, M2는 preview_only spec을 실행해 evidence를 돌려준다.",
    watch: "generated code execution, per-row AI call, unbounded collect, production_write가 들어가면 안 된다.",
    steps: [
      ["select 만들기", "drop이 아닌 source_path를 columns로 선택한다."],
      ["action 변환", "cast, parse_timestamp, mask, hash, normalize_null 등을 operation으로 바꾼다."],
      ["scope 고정", "preview_scope에 source_unit_ids/object_ids를 넣어 L0 lineage와 연결한다."],
    ],
  },
  L11: {
    simpleTitle: "Gold 실행 설계도로 바꾸기",
    oneLine: "승인된 Gold decision만 M2가 preview로 실행할 수 있는 Gold generation spec으로 바꾼다.",
    easyMeaning: "쉽게 말하면 Gold 요약표를 어떻게 group_by하고 어떤 metric을 계산할지 적은 작업 지시서다. Gold가 승인되지 않았으면 상태만 기록하고 operation은 비워 둔다.",
    why: "Gold는 business 의미가 크다. 승인되지 않은 Gold를 실행 spec에 넣으면 catalog와 M6 query가 잘못된 metric을 노출할 수 있다.",
    inputs: ["L9 gold_policy_decision", "selected_gold_models", "Silver preview ref"],
    outputs: ["gold_generation_spec.json"],
    next: "L12 compiler validation을 통과한 뒤 M2 preview 실행 대상으로 넘어간다.",
    watch: "Gold not_requested/deferred/rejected 상태도 공식 상태로 남겨야 한다. nullable ref로 흐리게 처리하면 downstream이 혼동한다.",
    steps: [
      ["승인 확인", "approval_state.gold.compile_allowed가 true인지 본다."],
      ["aggregate 작성", "group_by, dimensions, measures, time_window, cardinality_guard를 operation params로 만든다."],
      ["preview 제한", "write_mode는 항상 preview_only로 둔다."],
    ],
  },
  L12: {
    simpleTitle: "실행 설계도 안전검사",
    oneLine: "Silver/Gold spec에 위험하거나 지원하지 않는 작업이 없는지 실행 전에 막는다.",
    easyMeaning: "쉽게 말하면 작업 지시서를 M2에 넘기기 전에 금지어 검사를 하는 단계다. production write, per-row AI, generated code, legacy window_id, unsupported action이 있으면 block한다.",
    why: "unknown data에서 AI 추천이 그럴듯해도 실행 불가능하거나 위험한 action이 섞일 수 있다. L12가 없으면 M2 실행 중 실패하거나 범위를 넘을 수 있다.",
    inputs: ["L10 Silver spec", "L11 Gold spec", "supported action set"],
    outputs: ["compiler_validation_result.json", "unsupported_action_report.json", "layered_transform_graph.json"],
    next: "L13/L14는 validation 결과를 preview evidence와 readiness 판단에 사용한다.",
    watch: "L12는 정적 계약 검사다. Spark executor memory, skew, cluster 상태 같은 runtime 문제는 M2 execution evidence가 필요하다.",
    steps: [
      ["금지 패턴 검사", "per_row_ai_call, generated_code_execution, unbounded_collect, production_write를 막는다."],
      ["지원 action 검사", "compiler가 실행 못 하는 action은 unsupported_action_report에 남긴다."],
      ["scope 검사", "legacy window_id 대신 source_unit_ids와 stream_window_ids를 쓰는지 확인한다."],
    ],
  },
  L13: {
    simpleTitle: "Silver 미리보기 품질 확인",
    oneLine: "Silver spec이 안전하게 실행될 수 있는지, PII/query exposure가 어떤지 Silver 품질 축으로 정리한다.",
    easyMeaning: "쉽게 말하면 Silver 결과물을 실제로 만들었다고 주장하는 단계가 아니라, M2가 preview를 실행했거나 실행할 때 확인해야 할 품질 검사표를 만드는 단계다.",
    why: "spec이 있어도 결과가 안전한지는 따로 봐야 한다. PII가 query에 노출되거나 compiler가 block이면 Silver를 ready로 볼 수 없다.",
    inputs: ["L9 silver decision", "L12 compiler validation", "PII/exposure policy"],
    outputs: ["silver_preview_ref.json", "silver_preview_validation_result.json", "pii_exposure_report.json", "silver_quality_axis.json", "silver_quarantine_report.json"],
    next: "L15는 Silver quality axis와 catalog safety axis를 보고 M6 silver_context_status를 만든다.",
    watch: "M3는 실제 full Silver table을 소유하지 않는다. row count나 quarantine count는 M2 preview evidence가 들어오면 더 강해진다.",
    steps: [
      ["compiler 결과 반영", "L12가 block이면 Silver validation도 block으로 본다."],
      ["노출 정책 확인", "PII field와 forbidden query field를 보고 report를 만든다."],
      ["quality axis 생성", "L15가 읽기 쉬운 silver_quality_axis를 만든다."],
    ],
  },
  L14: {
    simpleTitle: "Gold 준비 상태 확인",
    oneLine: "Gold가 요청됐는지, 승인됐는지, metric 정의가 있는지, 어떤 caveat가 필요한지 정리한다.",
    easyMeaning: "쉽게 말하면 Gold를 만들 준비가 되었는지 체크하는 단계다. Gold를 안 만들기로 했으면 not_requested, 나중에 보기로 했으면 deferred, 승인됐지만 의미 검토가 필요하면 warn으로 남긴다.",
    why: "Gold가 준비 안 됐다고 Silver까지 막으면 안 된다. 반대로 Gold가 준비 안 됐는데 M6가 Gold metric을 query에 노출하면 안 된다.",
    inputs: ["L9 gold decision", "L11 gold spec", "selected Gold models"],
    outputs: ["gold_preview_ref.json", "metric_definition_draft.json", "gold_readiness_input_report.json", "gold_preview_validation_result.json", "semantic_caveat_report.json"],
    next: "L15는 이 상태를 gold_readiness_axis로 바꿔 Silver context와 분리한다.",
    watch: "metric definition이 있어도 owner_review_required이면 trusted query exposure에는 caveat가 필요하다.",
    steps: [
      ["Gold 상태 읽기", "not_requested, deferred, approved, rejected를 구분한다."],
      ["metric 정의", "approved일 때만 selected model의 measures를 metric definition으로 펼친다."],
      ["caveat 작성", "Gold 미요청/보류/거절/owner review 필요 상태를 문장으로 남긴다."],
    ],
  },
  L15: {
    simpleTitle: "최종 통과/주의/차단 판단하기",
    oneLine: "Silver 처리 품질, catalog 안전성, Gold 준비 상태를 세 축으로 나눠 최종 context status를 만든다.",
    easyMeaning: "쉽게 말하면 '이 데이터는 쿼리에 써도 되나?'를 한 번에 뭉뚱그리지 않고, Silver는 괜찮은지, catalog 노출은 안전한지, Gold는 준비됐는지를 따로 판단하는 단계다.",
    why: "Gold가 deferred여도 Silver는 사용할 수 있어야 한다. PII 노출 문제와 Gold 의미 문제도 원인이 다르므로 축을 분리해야 한다.",
    inputs: ["L13 Silver evidence", "L14 Gold readiness evidence"],
    outputs: ["processing_quality_axis.json", "catalog_safety_axis.json", "gold_readiness_axis.json", "gate_summary.json"],
    next: "L16은 gate_summary의 m6_context_status를 catalog metadata와 sql_context_pack에 그대로 넣는다.",
    watch: "Gold readiness가 Silver status를 오염시키면 안 된다. Silver는 processing_quality와 catalog_safety만으로 계산한다.",
    steps: [
      ["processing_quality", "Silver validation이 block인지 pass인지 본다."],
      ["catalog_safety", "PII/query exposure가 안전한지 pass/warn/block으로 본다."],
      ["gold_readiness", "Gold가 ready, not_ready, not_requested인지 별도 context로 만든다."],
    ],
  },
  L16: {
    simpleTitle: "다른 M이 읽을 최종 패키지 만들기",
    oneLine: "M5가 저장하고 M6가 query/context에 쓸 수 있도록 catalog, SQL context, vector template, artifact resolver를 묶는다.",
    easyMeaning: "쉽게 말하면 M3가 만든 모든 설계도와 검사 결과를 다른 팀원이 찾기 쉬운 폴더와 목차로 포장하는 단계다. 여기서 실제 DB write나 SQL serving을 하는 것은 아니다.",
    why: "M3 산출물이 많아지면 다른 M이 어떤 artifact를 믿어야 하는지 헷갈린다. L16은 refs와 status를 한 곳에 모아 resolve 가능하게 만든다.",
    inputs: ["L2 profile", "L9 approval state", "L10/L11/L12 specs", "L14 metrics", "L15 gate summary"],
    outputs: ["catalog_metadata_draft.json", "sql_context_pack.json", "field_level_lineage.json", "catalog_sync_contract_package.json", "semantic_catalog_vector_index_template.json", "artifact_reference_manifest.json", "exports/*"],
    next: "M5는 catalog/workflow 저장에 쓰고, M6는 allowed table/column/metric/query caveat와 vector template을 사용한다.",
    watch: "m6_context_status가 gate_summary, sql_context_pack, catalog_sync_contract_package 사이에서 불일치하면 안 된다.",
    steps: [
      ["catalog 작성", "dataset 이름, layer status, quality, semantic template refs를 만든다."],
      ["query context 작성", "M6가 볼 allowed_tables, allowed_columns, metrics, caveats를 만든다."],
      ["ref resolver 작성", "artifact_reference_manifest로 모든 artifact_id를 실제 파일 URI와 checksum에 연결한다."],
    ],
  },
};

window.M3_OVERALL_PLAIN = {
  oneLine: "M3는 데이터를 직접 크게 실행하는 파트가 아니라, unknown data가 들어왔을 때 어떻게 Bronze/Silver/Gold로 바꿀지 설계도와 검사표를 만드는 파트다.",
  bullets: [
    "L0-L2는 원본과 sample을 안전하게 증거화한다.",
    "L3-L8은 AI를 제한된 근거 위에서만 쓰며 Silver/Gold/vector 추천 초안을 만든다.",
    "L9는 사용자가 무엇을 승인했는지 공식 기록한다.",
    "L10-L12는 승인된 것만 preview-only 실행 설계도로 바꾸고 위험한 작업을 막는다.",
    "L13-L15는 실제 preview evidence와 노출 안전성을 보고 pass/warn/block을 나눈다.",
    "L16은 M5/M6가 읽을 catalog/query/vector handoff package를 만든다.",
  ],
};

window.M3_LAYER_EASY_DETAIL = {
  L0: {
    title: "쉽게 말하면: 원본을 만지지 않고 추적 가능한 이름표를 붙인다",
    paragraphs: [
      "L0는 데이터 파일을 열어서 의미를 해석하는 단계가 아니다. 사용자가 어떤 CSV, JSON, JSONL, Parquet, 텍스트, 압축 파일을 등록했는지 모르더라도 먼저 해야 할 일은 원본을 절대 바꾸지 않고, 그 원본을 나중에 정확히 다시 찾을 수 있게 만드는 것이다. 그래서 코드의 `build_l0()`는 `source` 경로를 받고, 그 아래 파일을 찾고, 각 파일마다 `object_id`와 `source_unit_id`를 붙인다. 여기서 `object_id`는 실제 파일 또는 저장 객체를 가리키는 물리 이름표이고, `source_unit_id`는 뒤 단계가 처리 범위를 잡을 때 쓰는 논리 이름표다.",
      "checksum은 이 파일이 같은 파일인지 확인하는 지문 역할을 한다. 기본값 `8 * 1024 * 1024`는 8 MiB만 앞에서 읽어 prefix checksum을 만든다는 뜻이고, 대용량 원본 전체를 해시하느라 L0가 느려지는 문제를 피하기 위한 선택이다. 대신 전체 파일 무결성을 강하게 보장해야 하는 운영 조건이면 full checksum 정책을 선택할 수 있게 열어둔다. 즉 L0는 속도와 재현성 사이에서 기본은 빠른 inventory를 택하고, 더 강한 보증은 정책으로 올릴 수 있게 만든다.",
      "L0가 만드는 manifest에는 파일 URI, 크기, 수정 시각, checksum, 압축 힌트, source_unit/object 연결이 들어간다. 이 정보가 있어야 L1이 sample을 만들 때 어느 파일에서 몇 번째 record를 읽었는지 남길 수 있고, L10/L11이 preview spec을 만들 때 어느 source_unit 범위에 적용할지 지정할 수 있다. M3는 raw payload를 복사하지 않기 때문에 저장 비용을 키우지 않고, M2가 Spark나 다른 runner로 실제 materialization을 할 때도 같은 원본을 다시 찾아갈 수 있다.",
      "이 단계에서 일부러 하지 않는 것도 중요하다. L0는 CSV인지 JSON인지 확정하지 않고, 컬럼 이름이나 타입도 판단하지 않는다. 여기서 성급하게 format을 단정하면 unknown data 대응이 깨지고, raw 보존 단계가 parser처럼 비대해진다. L0의 품질 기준은 '원본을 잃지 않았는가, 나중에 다시 찾을 수 있는가, source_unit과 object의 양방향 참조가 맞는가'다."
    ],
    checkpoints: ["raw payload를 복사하거나 수정하지 않는다", "object_id/source_unit_id/orphan 여부를 검증한다", "대용량 기본값은 prefix checksum이고 full checksum은 선택 정책이다"],
  },
  L1: {
    title: "쉽게 말하면: 원본 일부를 봉투에 담아 어디서 왔는지 적는다",
    paragraphs: [
      "L1은 L0가 붙인 이름표를 따라 실제 파일에서 제한된 양만 읽는다. 전체 100GB를 다 읽는 것이 아니라, `max_rows`와 `max_bytes` 같은 한도를 두고 대표 sample만 Bronze envelope로 만든다. envelope라는 말은 record 값만 던지는 것이 아니라, 그 record가 어떤 object/source_unit에서 왔고 어느 line 또는 byte 구간에서 왔는지 locator를 같이 감싼다는 뜻이다.",
      "CSV나 JSON이 깨져 있거나 중간에 이상한 줄이 있어도 바로 버리지 않는다. 정상적으로 읽히는 record는 sample lane으로 보내고, parse 실패나 타입 충돌처럼 위험한 record는 rescue lane에 남긴다. 이 구조가 필요한 이유는 '정제 과정에서 나쁜 데이터가 조용히 사라지는 문제'를 막기 위해서다. 사용자는 나중에 Silver 정책을 고를 때 이 rescue evidence를 보고 drop, quarantine, repair 중 무엇을 선택할지 판단할 수 있다.",
      "L1의 산출물은 L2가 profile을 만들 때 쓰는 근거가 된다. 예를 들어 sample record, parse failure 수, locator, raw fragment 길이 같은 정보가 있어야 L2가 format detection과 schema snapshot을 만들 수 있다. 동시에 L1은 실제 Bronze 전체 생성 엔진이 아니다. 전체 Bronze materialization은 M2가 Spark로 돌릴 수 있도록 spec과 replay locator만 남기는 것이 M3 역할이다.",
      "따라서 L1의 핵심 판단은 '얼마나 읽을 것인가'와 '실패를 어떻게 보존할 것인가'다. 너무 적게 읽으면 뒤 profile이 약하고, 너무 많이 읽으면 M3가 실행 엔진처럼 느려진다. 그래서 L1은 bounded sample을 기본으로 두고, 실패 record를 숨기지 않는 설계를 선택했다."
    ],
    checkpoints: ["sample 한도를 둔다", "parse failure를 rescue lane에 남긴다", "record마다 object_id와 replay locator를 유지한다"],
  },
  L2: {
    title: "쉽게 말하면: 샘플을 보고 데이터의 모양과 위험 신호를 찍어 둔다",
    paragraphs: [
      "L2는 L1 sample을 보고 이 데이터가 어떤 모양인지 추정한다. CSV인지 JSON인지, row마다 field가 얼마나 안정적인지, nested 구조가 있는지, 숫자처럼 보이는 문자열이 많은지, 비어 있는 값이 많은지 같은 정보를 profile snapshot으로 만든다. unknown data를 받는다는 전제에서는 처음부터 schema를 알고 있다고 가정할 수 없으므로, L2가 '현재 관측한 구조'를 정리하는 역할을 한다.",
      "schema fingerprint는 나중에 같은 source를 다시 분석했을 때 구조가 바뀌었는지 비교하기 위한 지문이다. 예를 들어 오늘은 `rating`이 숫자인데 내일은 문자열이 섞이거나, JSON record에 새 nested field가 생기면 fingerprint와 field profile 차이로 drift 후보를 찾을 수 있다. M3 core가 실시간 drift runtime을 직접 운영하지는 않지만, drift를 감지할 수 있는 snapshot 형식은 여기서 만들어 둔다.",
      "L2는 AI가 볼 수 있는 근거의 출발점이기도 하다. AI에게 원본 전체를 주는 대신 field 이름, inferred type, null ratio, example cap, semantic hint 같은 작은 profile evidence를 만든다. 이렇게 해야 PII와 비용 문제를 줄이고, 대용량/실시간 상황에서도 '모든 row를 AI로 판단한다'는 거짓 구조를 피할 수 있다.",
      "이 단계의 한계도 분명하다. L2의 profile은 bounded sample 기반이라 전체 데이터의 완전한 통계가 아니다. 그래서 L2 결과는 확정 schema가 아니라 snapshot과 confidence로 기록하고, 뒤 L3-L8의 추천도 owner review와 preview validation을 거치게 만든다."
    ],
    checkpoints: ["format_detection과 schema_fingerprint를 만든다", "field별 type/null/example/semantic hint를 기록한다", "profile은 전체 통계가 아니라 bounded evidence임을 표시한다"],
  },
  L3: {
    title: "쉽게 말하면: AI에게 보여줘도 되는 작은 근거 묶음을 만든다",
    paragraphs: [
      "L3부터 AI가 들어올 수 있지만, AI가 raw 데이터 전체를 보지는 않는다. L3는 L2 profile에서 필요한 부분만 골라 AI-safe input pack을 만들고, PII 후보나 과도한 example payload는 redaction map으로 가린다. 즉 AI가 판단하는 대상은 원본 row가 아니라, field 이름, 타입 후보, null 비율, 제한된 예시, 구조 힌트, rescue 통계 같은 control-plane evidence다.",
      "이 단계가 중요한 이유는 대용량과 실시간성을 동시에 지키기 위해서다. 모든 이벤트나 모든 row를 AI에게 보내면 비용과 속도 면에서 불가능하고, 개인정보 노출 위험도 커진다. L3는 'AI는 추천을 돕는 조언자이고 data-plane 실행자는 아니다'라는 경계를 코드로 만든다. 그래서 per-row AI, raw full payload exposure, generated production code 같은 위험한 claim을 blocked_claims로 남긴다.",
      "L3는 이후 Silver와 Gold 추천의 공통 입력이다. Silver 추천은 어떤 field를 남기고 cast/mask/hash/quarantine할지 봐야 하고, Gold 추천은 product, review, rating, conversion, delivery 같은 의미 후보가 실제 field evidence를 갖는지 봐야 한다. L3가 evidence를 작게 정리해 주기 때문에 L6/L7은 같은 근거 위에서 draft를 만들 수 있다.",
      "사용자 관점에서는 L3를 'AI에게 넘기기 전 검열대'로 보면 된다. 이 검열대를 통과하지 못한 정보는 AI 추천에 쓰면 안 되고, 통과한 정보도 확정 답이 아니라 후보를 만드는 재료일 뿐이다."
    ],
    checkpoints: ["PII 후보와 raw 예시 노출을 줄인다", "AI input은 profile evidence로 제한한다", "AI가 row-level 실행자가 아님을 산출물에 명시한다"],
  },
  L4: {
    title: "쉽게 말하면: 과거 schema와 Gold 템플릿을 찾아 참고 후보로 붙인다",
    paragraphs: [
      "L4는 지금 들어온 unknown data를 혼자만 보고 판단하지 않도록 metadata retrieval과 template retrieval 계획을 만든다. 예를 들어 field 이름과 profile이 상품 리뷰 데이터와 비슷하면 product health template 후보를 가져올 수 있고, text field가 많으면 vector handoff template 후보를 가져올 수 있다. 여기서 말하는 VectorDB는 원본 row를 넣는 곳이 아니라 schema/profile/catalog metadata와 template 설명을 찾아오는 보조 기억장치에 가깝다.",
      "중요한 점은 L4의 검색 결과가 정답이 아니라는 것이다. 비슷한 schema가 검색되었다고 해서 바로 Gold metric을 확정하면 오버피팅이 된다. 그래서 L4는 '이 템플릿을 고려할 수 있다'는 후보와 근거만 남기고, 실제 source field가 필요한 numerator/denominator를 갖는지는 L5에서 다시 검사한다.",
      "이 구조는 unknown data에서 정확성을 올리는 데 도움이 된다. 완전히 새로 추론하는 것보다, 기존 catalog metadata와 승인된 template을 참고하면 column mapping과 metric 후보를 더 일관되게 만들 수 있다. 다만 검색이 잘못되면 틀린 domain template이 따라올 수 있으므로, L4는 confidence와 missing evidence를 함께 넘기는 형태가 안전하다.",
      "M3 범위에서는 VectorDB 구축이나 embedding production job을 직접 돌리지 않는다. L4는 어떤 metadata를 색인하면 좋고 어떤 template을 candidate로 가져오면 좋은지 handoff 가능한 계획을 만드는 단계다."
    ],
    checkpoints: ["schema/profile/catalog metadata 검색 후보를 만든다", "Gold template은 참고 후보이지 확정 metric이 아니다", "검색 근거와 confidence를 남겨 L5에서 검증한다"],
  },
  L5: {
    title: "쉽게 말하면: 추천 후보가 실제 데이터 근거를 갖는지 대조한다",
    paragraphs: [
      "L5는 L4에서 찾은 후보와 L3 evidence를 맞대 본다. product health를 만들려면 product_id 후보, rating/review 후보, conversion numerator와 denominator 후보, delivery lateness 후보가 필요하다. L5는 각 후보가 실제 field evidence를 갖는지, 없으면 무엇이 빠졌는지 candidate_grounding_report로 정리한다.",
      "이 단계가 없으면 AI가 그럴듯한 Gold를 만들어도 실제 데이터에는 없는 지표를 만들어낼 수 있다. 예를 들어 Amazon review-only 데이터에는 review_count와 average_rating은 만들 수 있어도 view_count, purchase_count, conversion_rate, late_delivery_rate는 원천 이벤트가 없을 수 있다. L5는 이런 지표를 0으로 꾸며내지 않고 `needs_source_evidence`, `deferred`, `missing_source_evidence`로 표시하게 만든다.",
      "risk_score도 여기서 중요한 기준을 갖는다. risk_score 공식을 하나로 고정하면 특정 데이터셋에는 맞아도 다른 도메인에서는 틀릴 수 있다. 그래서 L5/L7 흐름은 사용할 수 있는 component evidence를 먼저 찾고, 그 component에 맞는 risk policy 후보를 추천하게 만든다. 부정 리뷰율, 낮은 평점, 낮은 전환율, 배송 지연율은 product-health 도메인에서 가능한 구성요소일 뿐이고, 다른 데이터에서는 다른 risk component가 제안되어야 한다.",
      "결국 L5는 'AI 추천을 믿을 수 있게 만드는 접지 단계'다. 후보가 실제 필드와 연결되면 다음 L7에서 Gold draft로 갈 수 있고, 연결되지 않으면 사용자가 승인할 수 없는 초안으로 표시된다."
    ],
    checkpoints: ["metric 후보별 required evidence를 확인한다", "없는 지표를 0이나 임의 값으로 만들지 않는다", "risk_score component는 데이터 근거에 따라 adaptive하게 둔다"],
  },
  L6: {
    title: "쉽게 말하면: Bronze를 Silver로 정리하는 청소 제안서를 만든다",
    paragraphs: [
      "L6는 데이터의 의미 있는 분석 이전에 먼저 구조적으로 쓸 수 있는 Silver를 만들기 위한 정책을 추천한다. 어떤 column을 남길지, 이름을 어떻게 표준화할지, 문자열 숫자를 숫자로 cast할지, timestamp를 parse할지, PII 후보를 mask/hash할지, 너무 불안정한 field를 quarantine할지 같은 결정을 draft로 만든다.",
      "이 단계에서 중요한 것은 아직 실행이 아니라 추천이라는 점이다. L6가 Spark를 직접 돌려 Silver를 만들지는 않는다. 대신 M2가 실행할 수 있는 deterministic transform spec으로 바뀔 수 있도록, 추천 action을 명확한 operation 후보로 표현한다. 사람이 L9에서 승인하거나 수정해야 L10 Silver spec으로 컴파일된다.",
      "unknown CSV/JSON에서는 Silver가 특히 중요하다. 원본 구조가 지저분하거나 nested field가 들쭉날쭉하면 바로 Gold를 만들 수 없다. L6는 먼저 field 선택, type normalize, null 처리, rescue/quarantine 정책을 잡아 Gold 후보가 믿을 수 있는 입력을 갖게 한다.",
      "단점은 이 추천도 sample/profile 기반이라는 것이다. sample에 보이지 않은 edge case가 전체 데이터에 있을 수 있으므로, L13 preview validation에서 실제 실행 evidence로 다시 확인해야 한다. 그래서 L6는 '추천 초안'이고, 품질 보증은 뒤 gate와 함께 완성된다."
    ],
    checkpoints: ["select/cast/normalize/mask/hash/quarantine action을 추천한다", "아직 실행 spec이 아니라 owner review 전 draft다", "L13 preview validation으로 실제 적용 가능성을 다시 확인한다"],
  },
  L7: {
    title: "쉽게 말하면: Silver 위에서 만들 수 있는 Gold 모델과 지표 후보를 설계한다",
    paragraphs: [
      "L7은 Gold를 무조건 만드는 단계가 아니다. 사용자가 원하면 만들 수 있도록 Gold model recommendation draft를 만드는 단계다. generic aggregate, product_health, risk_score policy, Gold-to-Gold 후보처럼 여러 종류의 의미 모델을 source evidence에 맞춰 제안한다. 핵심은 '데이터에 있는 근거만 사용하고, 없는 근거는 deferred로 남기는 것'이다.",
      "발표용 product health 기준에서는 product_id, product_name, category_l1, review_count, average_rating, negative_review_rate, view_count, purchase_count, conversion_rate, delivery_count, late_delivery_rate, risk_score 같은 최소 schema를 템플릿으로 둘 수 있다. 그러나 모든 데이터가 이 컬럼을 만들 수 있는 것은 아니다. review-only 데이터라면 view_count나 purchase_count가 없을 수 있고, delivery event가 없다면 late_delivery_rate는 만들 수 없다. L7은 이 컬럼을 고정 schema 후보로 유지하되, 각 컬럼의 status를 candidate, needs_source_evidence, deferred처럼 나누어야 한다.",
      "risk_score도 고정 수식 하나로 박지 않는다. L7은 사용 가능한 component를 보고 risk_score_policy_recommendation_draft를 만든다. product-health 데이터라면 부정 리뷰율, 낮은 평점, 낮은 전환율, 배송 지연율을 후보 component로 추천할 수 있지만, source evidence가 없는 component는 빠지거나 보류되어야 한다. zero denominator도 여기서 명시한다. 예를 들어 view_count가 0이면 conversion_rate를 0으로 할지 null로 할지 정책으로 고정해야 하고, 보통은 '불가능한 비율을 0으로 꾸미지 않기 위해 null + coverage metadata'가 더 안전하다.",
      "L7의 산출물은 사용자 편집 화면에서 가장 중요하다. 사용자는 Silver가 어떤 정제를 거친 뒤 어떤 Gold가 만들어질 수 있는지 보고, metric 정의와 risk weight를 수정하거나 승인/보류할 수 있어야 한다."
    ],
    checkpoints: ["Gold는 자동 확정이 아니라 추천 draft다", "product_health 최소 schema는 column status와 missing evidence를 함께 둔다", "risk_score 공식과 zero denominator는 source별 정책 추천으로 둔다"],
  },
  L8: {
    title: "쉽게 말하면: 텍스트와 catalog를 벡터 검색으로 넘길 수 있는 설계만 만든다",
    paragraphs: [
      "L8은 embedding을 직접 만들거나 VectorDB에 실제 row를 넣는 단계가 아니다. 대신 어떤 text field, schema 설명, catalog metadata가 vector handoff 대상이 될 수 있는지 template을 만든다. 예를 들어 review text, product description, column description, metric caveat 같은 정보는 M6나 extension 쪽에서 semantic search에 사용할 수 있다.",
      "이 단계가 필요한 이유는 Gold 추천의 정확성을 높이기 위해서다. 단순히 column 이름만 보면 `score`가 평점인지 위험 점수인지 알기 어렵다. catalog metadata와 profile evidence를 vector index로 찾을 수 있으면 과거 승인된 schema나 metric 정의를 더 잘 참고할 수 있다. 하지만 vector retrieval 결과도 정답이 아니므로 L5 grounding과 L9 approval을 거쳐야 한다.",
      "M3 core는 vector build runtime을 소유하지 않는다. chunking, embedding model, index backend, retrieval serving은 extension hook 또는 M6/M5 쪽 책임이다. M3는 어떤 필드를 넣어야 하는지, 어떤 노출 제한이 있는지, 어떤 artifact_ref를 따라가야 하는지 template만 제공한다.",
      "따라서 L8의 좋은 산출물은 '검색하면 좋아질 후보'와 '검색하면 안 되는 정보'를 같이 말해 준다. PII, forbidden query context, raw payload는 vector handoff에서 제외되어야 한다."
    ],
    checkpoints: ["embedding/index build는 core 밖이다", "text/catalog/schema metadata 후보만 handoff한다", "PII와 query-forbidden 정보는 제외한다"],
  },
  L9: {
    title: "쉽게 말하면: 추천을 사람이 고른 공식 결정으로 바꾼다",
    paragraphs: [
      "L9는 추천과 실행 사이의 문이다. L6 Silver draft, L7 Gold draft, L8 vector handoff draft가 있어도 사용자가 승인하지 않으면 deterministic spec으로 내려가면 안 된다. 그래서 L9는 approval_state.json에 무엇이 approved, deferred, rejected, not_requested인지 기록한다.",
      "특히 Silver와 Gold 판단을 분리한다. Gold가 아직 준비되지 않았거나 사용자가 요청하지 않았다고 해서 Silver가 실패한 것은 아니다. Silver readiness는 processing_quality와 catalog_safety로 판단하고, Gold readiness는 그 위에 별도 축으로 얹는다. 이 규칙이 있어야 review-only 데이터처럼 Gold 지표 일부가 부족한 상황에서도 Silver catalog와 query context를 살릴 수 있다.",
      "Gold-to-Gold도 무조건 자동 생성하지 않는다. 이미 만들어진 Gold를 다시 집계하거나 파생 Gold를 만드는 것은 사용자가 원할 때만 선택되어야 한다. L9는 이 선택 상태를 별도로 남겨 L11/L16이 '요청되지 않은 Gold'와 '승인된 Gold'를 구분하게 한다.",
      "L9의 산출물은 뒤 컴파일러가 믿는 유일한 결정 기록이다. AI draft가 그럴듯해도 L9 결정에 없으면 실행 spec으로 컴파일하지 않는 것이 안전하다."
    ],
    checkpoints: ["추천 draft와 승인 decision을 분리한다", "Gold readiness가 Silver status를 오염시키지 않는다", "Gold-to-Gold는 사용자 선택이 있을 때만 진행한다"],
  },
  L10: {
    title: "쉽게 말하면: 승인된 Silver 청소 정책을 실행 가능한 설계도로 바꾼다",
    paragraphs: [
      "L10은 L9에서 승인된 Silver decision만 읽고 silver_transform_spec.json을 만든다. 여기에는 어떤 column을 select할지, 어떤 field를 cast할지, 어떤 PII를 mask/hash할지, 어떤 record를 quarantine할지 같은 operation이 들어간다. 이 spec은 사람이 읽는 문서가 아니라 M2 runner가 실행할 수 있는 계약 형식이어야 한다.",
      "하지만 L10이 실제로 Spark를 실행하지는 않는다. spec의 write_mode는 preview_only로 제한된다. production write를 허용하면 M3가 실행/저장 책임까지 가져가게 되므로 M2/M5 경계가 깨진다. M3는 '이렇게 실행하면 된다'는 설계도를 만들고, M2가 실제 Spark session과 output path를 책임진다.",
      "unknown data 대응을 위해 operation별 params schema도 중요하다. select에는 columns, cast에는 target_type, mask/hash에는 exposure rule, aggregate에는 input_ref와 group_by/measures 같은 구조가 명확해야 한다. 그래야 M2가 임의 해석 없이 spec을 실행할 수 있고, L12가 unsupported action을 막을 수 있다.",
      "L10의 품질은 결정된 정책이 빠짐없이 spec으로 내려갔는지, 승인되지 않은 action이 섞이지 않았는지, source_unit_ids와 artifact_ref가 resolve 가능한지로 판단한다."
    ],
    checkpoints: ["L9 승인 Silver decision만 컴파일한다", "write_mode는 preview_only다", "operation별 params가 M2 실행 계약으로 명확해야 한다"],
  },
  L11: {
    title: "쉽게 말하면: 승인된 Gold 지표만 집계 설계도로 바꾼다",
    paragraphs: [
      "L11은 Gold가 approved일 때만 gold_generation_spec.json을 만든다. product_health나 generic aggregate가 추천되었더라도 L9에서 deferred, not_requested, rejected라면 실제 aggregate operation은 비어 있거나 보류 상태로 남아야 한다. 이 규칙이 있어야 없는 데이터를 억지로 Gold로 만드는 사고를 막을 수 있다.",
      "Gold spec은 Silver를 입력으로 삼는다. raw나 Bronze에서 바로 의미 지표를 만들지 않고, L10 Silver spec이 만든 정제된 field를 기반으로 group_by, dimensions, measures, formula, denominator rule을 표현한다. 예를 들어 conversion_rate는 purchase_count / view_count 같은 numerator와 denominator가 필요하고, denominator가 0일 때 null 또는 0을 어떻게 처리할지 policy가 들어가야 한다.",
      "risk_score는 추천된 정책이 승인된 뒤에만 formula로 내려갈 수 있다. source evidence에 부정 리뷰와 평점만 있으면 그 component만 쓰고, conversion/delivery evidence가 없으면 해당 component는 빠진다. 이렇게 해야 product-health 템플릿을 유지하면서도 데이터셋별 오버피팅을 줄인다.",
      "L11은 Gold를 만들 권한을 갖는 것이 아니라 Gold를 만들 방법을 전달하는 단계다. 실행, 대용량 shuffle, output write, partitioning은 M2가 맡는다."
    ],
    checkpoints: ["Gold approved일 때만 aggregate operation을 만든다", "denominator와 missing evidence rule을 spec에 남긴다", "risk_score component는 승인된 evidence 기반 정책만 사용한다"],
  },
  L12: {
    title: "쉽게 말하면: 설계도에 위험한 명령이 섞였는지 검사한다",
    paragraphs: [
      "L12는 L10/L11 spec을 그대로 믿지 않고 compiler validation을 수행한다. preview_only인지, production write가 들어갔는지, per-row AI 호출이 들어갔는지, generated code 실행 같은 위험한 action이 있는지, artifact_ref가 resolve 가능한지 검사한다. 문제가 있으면 unsupported_action_report에 남기고 block한다.",
      "이 단계는 M3 계약의 안전장치다. AI가 추천한 내용이나 사용자가 수정한 내용이 spec으로 내려오면서 예기치 않은 action이 들어갈 수 있다. L12는 허용된 operation과 params schema만 통과시키고, 모호한 instruction이나 runtime 소유권을 넘어가는 작업은 막는다.",
      "L12가 layered_transform_graph를 만드는 이유는 흐름을 눈으로 추적하기 위해서다. source -> bronze -> silver -> gold -> catalog handoff가 어떤 artifact_ref로 연결되는지 보여 주면 M2/M5/M6가 어느 지점에서 무엇을 받아야 하는지 명확해진다.",
      "L12를 통과했다고 해서 품질이 좋다는 뜻은 아니다. 여기서 검증하는 것은 spec의 안전성과 컴파일 가능성이고, 실제 데이터 품질은 M2 preview 실행 evidence를 받아 L13-L15에서 판단한다."
    ],
    checkpoints: ["preview_only와 allowed operation만 통과시킨다", "unsupported action은 report로 남기고 block한다", "품질 검증이 아니라 spec 안전성 검증이다"],
  },
  L13: {
    title: "쉽게 말하면: Silver preview 실행 결과가 쓸 만한지 확인한다",
    paragraphs: [
      "L13은 M2가 preview로 돌려 준 Silver 실행 evidence를 받아 구조 품질을 본다. row_count가 0인지, cast 실패가 너무 많은지, quarantine 비율이 높은지, required field가 사라졌는지, PII가 query context에 노출될 위험이 있는지 검사한다. 여기서 M3는 Spark를 소유하지 않고, M2가 준 결과를 평가한다.",
      "Silver 품질은 Gold와 분리해서 봐야 한다. Gold 지표가 부족해도 Silver 자체가 정리되어 있고 catalog 안전성이 괜찮으면 M6가 Silver query context를 쓸 수 있다. 그래서 L13은 silver_quality_axis와 pii_exposure_report를 만들어 L15의 processing_quality/catalog_safety 판단 근거로 넘긴다.",
      "PII 처리는 단순히 `pii_handling=mask`라고 끝나지 않는다. catalog_exposure가 hidden인지, query_context_exposure가 forbidden인지, allowed_columns에 민감한 field가 들어갔는지 확인해야 한다. L13은 정제 품질과 노출 안전성을 분리해 기록한다.",
      "L13의 한계는 preview evidence 기반이라는 점이다. production 전체 데이터에서 다른 문제가 있을 수 있으므로, 여기서는 preview 기준 pass/warn/block을 내리고, 운영 drift/runtime은 extension hook으로 남긴다."
    ],
    checkpoints: ["Silver preview 결과의 row/cast/quarantine/PII evidence를 본다", "Gold 부족과 Silver 품질을 분리한다", "query exposure와 catalog exposure를 따로 검사한다"],
  },
  L14: {
    title: "쉽게 말하면: Gold 지표가 의미적으로 준비됐는지 따로 본다",
    paragraphs: [
      "L14는 Gold readiness를 본다. metric definition draft, gold_readiness_input_report, semantic_caveat_report를 만들고, 각 지표가 source evidence와 승인 정책을 갖는지 확인한다. 예를 들어 negative_review_rate는 review_count와 negative review 기준이 필요하고, conversion_rate는 purchase/view 같은 numerator와 denominator가 필요하다.",
      "Gold가 not_requested이거나 deferred여도 L14는 그 상태를 공식적으로 남긴다. 아무 파일도 만들지 않으면 L15/L16이 Gold가 없는 이유를 알 수 없기 때문이다. 따라서 gold_readiness_axis는 nullable하지 않고, not_requested/deferred/pass/warn/block 같은 상태를 명시한다.",
      "product_health에서는 최소 schema가 중요하지만, 모든 column을 억지로 채우면 안 된다. view_count가 없으면 conversion_rate는 deferred 또는 null policy가 되어야 하고, delivery_count가 없으면 late_delivery_rate도 missing evidence로 남아야 한다. risk_score는 승인된 component만으로 계산하거나, 필요한 component가 너무 부족하면 needs_owner_review로 남긴다.",
      "L14는 Silver를 망가뜨리지 않는 Gold 판단이다. Gold readiness가 block이어도 Silver context는 L13과 L15의 Silver 축에서 따로 살아남을 수 있다."
    ],
    checkpoints: ["metric별 evidence, formula, caveat를 남긴다", "not_requested/deferred도 공식 상태로 기록한다", "Gold block이 Silver ready를 막지 않게 분리한다"],
  },
  L15: {
    title: "쉽게 말하면: 품질, catalog 안전성, Gold 준비도를 세 축으로 판정한다",
    paragraphs: [
      "L15는 앞 단계의 결과를 하나의 gate summary로 모은다. 첫 번째 축은 processing_quality로, Silver preview가 실제로 처리 가능한지 본다. 두 번째 축은 catalog_safety로, PII와 query exposure가 안전한지 본다. 세 번째 축은 gold_readiness로, Gold가 의미 지표로 제공될 준비가 되었는지 본다.",
      "가장 중요한 규칙은 precedence다. Silver context는 processing_quality와 catalog_safety만으로 ready, ready_with_caveat, blocked를 결정한다. Gold readiness는 그 위에 별도로 붙는다. 이렇게 해야 Gold가 보류되어도 Silver catalog와 SQL context를 제공할 수 있고, 반대로 Silver가 안전하지 않으면 Gold도 당연히 downstream에 열면 안 된다.",
      "L15의 m6_context_status는 M6가 실제로 무엇을 query context로 사용할 수 있는지 알려준다. allowed table/column이 있는지, Gold metric을 보여도 되는지, caveat를 붙여야 하는지, query를 막아야 하는지 같은 판단이 여기서 정리된다. 이 상태는 L16 catalog_sync_contract_package와 sql_context_pack에도 그대로 들어가야 한다.",
      "이 단계의 결과가 모호하면 다른 M이 서로 다르게 해석한다. 그래서 pass/warn/block, not_requested/deferred 같은 상태값을 명확히 고정하고, Silver와 Gold를 한 덩어리 ready로 뭉개지 않는다."
    ],
    checkpoints: ["processing_quality, catalog_safety, gold_readiness를 분리한다", "Silver readiness는 Gold readiness에 오염되지 않는다", "m6_context_status를 L16까지 일관되게 넘긴다"],
  },
  L16: {
    title: "쉽게 말하면: 다른 M이 바로 읽을 최종 설명서와 목차를 묶는다",
    paragraphs: [
      "L16은 M3가 만든 모든 산출물을 다른 M이 쓸 수 있게 포장한다. catalog_sync_contract_package는 M5가 저장/동기화할 때 필요한 dataset, layer status, quality, artifact refs를 담고, sql_context_pack은 M6가 어떤 table과 column을 query에 열어도 되는지 알려준다. semantic_catalog_vector_index_template은 schema/profile/catalog metadata를 vector 검색 쪽으로 넘길 때 필요한 후보와 제한을 담는다.",
      "artifact_reference_manifest는 매우 중요하다. 앞 단계 산출물에서 `*_ref`는 문자열 artifact_id로만 쓰고, 실제 파일 경로, URI, checksum, byte_size는 이 manifest에서 resolve한다. 이렇게 해야 산출물끼리 경로를 직접 물고 늘어지지 않고, M5나 M6가 같은 방식으로 artifact를 찾을 수 있다.",
      "L16은 실제 catalog DB write나 SQL serving을 하지 않는다. M3는 draft와 handoff package를 만들고, M5가 저장과 workflow state를 책임지며, M6가 query/semantic context를 소비한다. 이 경계를 지켜야 M3가 너무 많은 runtime 책임을 떠안지 않는다.",
      "최종적으로 L16이 잘 만들어졌다는 뜻은 다른 M이 질문 없이 읽을 수 있다는 뜻이다. 어떤 dataset이 Silver인지 Gold인지, Gold가 deferred인지 available인지, 어떤 column이 allowed인지, 어떤 caveat가 붙는지, 어떤 artifact를 따라가야 하는지가 한 패키지 안에서 일관되어야 한다."
    ],
    checkpoints: ["catalog, SQL context, vector template, artifact resolver를 묶는다", "*_ref는 artifact_reference_manifest에서 resolve한다", "M5/M6가 바로 소비할 수 있게 status와 caveat를 일관되게 둔다"],
  },
};

window.M3_LAYER_EXAMPLES = {
  L0: {
    title: "예시로 보면: 파일 내용이 아니라 파일의 신분증을 만든다",
    situation: "예를 들어 `Clothing_Shoes_and_Jewelry.jsonl`과 `nyc_taxi_2024_01.parquet`가 들어왔다고 하자. L0는 이 파일 안의 리뷰 점수나 택시 요금은 보지 않는다. 대신 파일이 어디 있는지, 크기가 얼마인지, 나중에 같은 파일인지 확인할 지문이 무엇인지 기록한다.",
    action: [
      "`Clothing_Shoes_and_Jewelry.jsonl`에는 `amazon_review_object_00001` 같은 object_id를 붙인다.",
      "그 파일을 이번 처리 단위로 쓰기 위해 `amazon_review_unit_00001` 같은 source_unit_id를 붙인다.",
      "파일 경로, URI, size, modified_at, checksum을 manifest에 저장한다."
    ],
    result: [
      "나중에 Silver나 Gold가 이상하면 `이 결과가 어느 원본 파일에서 왔는지` 바로 추적할 수 있다.",
      "원본을 복사하지 않으므로 100GB 데이터를 다 M3 산출물 폴더에 다시 저장하지 않는다.",
      "L1부터 L16까지 같은 source_unit_id를 따라가므로 흐름이 끊기지 않는다."
    ],
    userCheck: "사용자는 여기서 컬럼 의미를 볼 필요가 없다. 대신 `원본을 건드리지 않았는지`, `source_unit_id와 object_id가 빠지지 않았는지`, `나중에 다시 찾을 URI가 맞는지`를 보면 된다.",
  },
  L1: {
    title: "예시로 보면: 원본 전체가 아니라 대표 몇 줄을 위치표와 함께 꺼낸다",
    situation: "100GB JSONL을 전부 읽으면 M3가 실행 엔진이 되어버린다. 그래서 L1은 앞부분 또는 정해진 범위의 일부 record만 읽고, 각 record에 `어느 파일의 몇 번째 줄에서 왔는지`를 붙인다.",
    action: [
      "정상 JSON line은 Bronze sample로 저장한다.",
      "깨진 JSON line이나 예상과 다른 구조는 버리지 않고 rescue lane에 따로 저장한다.",
      "각 sample에 object_id, line_number, byte_start 같은 locator를 남긴다."
    ],
    result: [
      "L2는 이 sample을 보고 CSV/JSON/JSONL 구조와 field 후보를 추정할 수 있다.",
      "parse 실패 데이터가 조용히 사라지지 않아서 나중에 quarantine 정책을 만들 수 있다.",
      "M2는 같은 Bronze envelope 규칙으로 전체 데이터를 Spark에서 처리할 수 있다."
    ],
    userCheck: "사용자는 `왜 전체를 다 안 읽었냐`보다 `sample 한도와 rescue lane이 적절한가`를 봐야 한다. 실패 줄이 많으면 Silver 정제 전에 source 품질 이슈가 있다는 뜻이다.",
  },
  L2: {
    title: "예시로 보면: 샘플을 보고 컬럼 건강검진표를 만든다",
    situation: "Amazon review sample에 `asin`, `reviewText`, `overall`, `reviewTime`이 보인다고 하자. L2는 이것을 보고 `asin은 상품 식별자 후보`, `reviewText는 긴 텍스트 후보`, `overall은 숫자 평점 후보`, `reviewTime은 날짜 후보`처럼 field별 상태표를 만든다.",
    action: [
      "format_detection으로 CSV/JSON/JSONL/Parquet/text 후보를 기록한다.",
      "각 field의 타입 후보, null 비율, 예시 값, nested 여부를 profile_snapshot에 넣는다.",
      "field 구성이 나중에 바뀌었는지 비교할 수 있게 schema_fingerprint를 만든다."
    ],
    result: [
      "AI는 원본 전체가 아니라 이 profile을 보고 추천할 수 있다.",
      "Silver는 어떤 field를 cast하거나 drop할지 판단할 근거를 얻는다.",
      "Gold는 product/review/rating/conversion/delivery 후보가 실제로 있는지 처음 확인할 수 있다."
    ],
    userCheck: "사용자는 `이 타입 추정이 맞는지`, `sample만 보고 너무 확정적으로 말하지 않는지`, `PII나 민감 field 후보가 표시됐는지`를 보면 된다.",
  },
  L3: {
    title: "예시로 보면: AI에게 원본이 아니라 요약된 안전 자료만 보여준다",
    situation: "리뷰 데이터에 사용자 이름, 이메일 같은 민감 후보가 섞여 있을 수 있다. L3는 그런 값을 그대로 AI에게 보내지 않고, field 이름과 통계, 제한된 예시만 남긴 input pack을 만든다.",
    action: [
      "PII 후보 field는 redaction_map에 적고 예시 노출을 줄인다.",
      "긴 텍스트는 몇 개 예시만 제한해서 넣는다.",
      "AI가 판단해야 할 질문을 `Silver 정제 후보`, `Gold 후보`, `vector 후보`처럼 좁힌다."
    ],
    result: [
      "AI 비용이 원본 크기에 비례해서 폭발하지 않는다.",
      "실시간 데이터의 모든 row를 AI가 보는 구조가 아니므로 발표에서 거짓말이 아니다.",
      "추천이 틀렸을 때도 어떤 profile evidence를 보고 추천했는지 trace가 남는다."
    ],
    userCheck: "사용자는 AI input pack에 raw payload가 과하게 들어갔는지, PII 후보가 그대로 노출됐는지, AI가 할 수 없는 일을 하겠다고 쓰지 않았는지 확인한다.",
  },
  L4: {
    title: "예시로 보면: 비슷한 과거 설계도와 템플릿을 찾아 참고한다",
    situation: "새 데이터에 `product_id`, `rating`, `review_text`가 보이면 과거 product health Gold 템플릿과 비슷할 수 있다. L4는 이런 metadata나 template 후보를 찾아 `참고할 만한 설계도`로 붙인다.",
    action: [
      "schema/profile/catalog metadata를 검색할 수 있는 index plan을 만든다.",
      "product health, generic aggregate, vector handoff 같은 template 후보를 가져온다.",
      "검색된 후보가 왜 비슷해 보였는지 field hint와 confidence를 남긴다."
    ],
    result: [
      "AI가 매번 완전히 새로 Gold 구조를 상상하지 않아도 된다.",
      "팀이 이미 승인한 schema나 metric 이름을 재사용하기 쉬워진다.",
      "하지만 검색 결과는 정답이 아니므로 L5에서 실제 source evidence로 다시 검증한다."
    ],
    userCheck: "사용자는 `비슷해서 가져온 템플릿`과 `실제로 이 데이터에서 만들 수 있는 metric`을 구분해야 한다. 검색만 됐다고 Gold를 승인하면 안 된다.",
  },
  L5: {
    title: "예시로 보면: 템플릿에 필요한 재료가 실제 데이터에 있는지 확인한다",
    situation: "product_health 템플릿에는 `conversion_rate = purchase_count / view_count`가 필요하다. 그런데 Amazon review 데이터에는 리뷰는 있어도 view나 purchase 이벤트가 없을 수 있다. L5는 이런 빠진 재료를 찾아낸다.",
    action: [
      "product_id 후보, review/rating 후보, conversion 후보, delivery 후보를 각각 찾는다.",
      "metric별 required_source_evidence와 available_fields를 비교한다.",
      "없는 근거는 missing_source_evidence로 남기고 metric status를 needs_source_evidence 또는 deferred로 둔다."
    ],
    result: [
      "없는 view_count를 0으로 채워 conversion_rate를 만드는 잘못을 막는다.",
      "risk_score도 사용 가능한 component만 후보로 남긴다.",
      "L7 Gold draft가 실제 데이터 근거가 있는 부분과 없는 부분을 분리해서 만들 수 있다."
    ],
    userCheck: "사용자는 `이 지표가 왜 가능하다고 했는지`와 `어떤 지표는 왜 보류됐는지`를 확인한다. 이 표가 비어 있으면 Gold는 아직 확정하면 안 된다.",
  },
  L6: {
    title: "예시로 보면: 지저분한 Bronze를 정리된 Silver로 바꾸는 청소 규칙을 제안한다",
    situation: "Bronze sample에 `overall`은 숫자인데 문자열로 들어오고, `reviewTime`은 날짜처럼 보이고, `reviewerName`은 노출하면 위험할 수 있다고 하자. L6는 이런 field마다 정리 방법을 추천한다.",
    action: [
      "`overall`은 number로 cast하자고 추천한다.",
      "`reviewTime`은 timestamp parse를 추천한다.",
      "`reviewerName` 같은 PII 후보는 mask/hash 또는 query 숨김을 추천한다."
    ],
    result: [
      "Silver는 Gold가 믿고 쓸 수 있는 깨끗한 입력이 된다.",
      "M2가 나중에 실행할 수 있는 operation 후보가 준비된다.",
      "사용자는 L9에서 이 추천을 승인하거나 field별로 수정할 수 있다."
    ],
    userCheck: "사용자는 `drop이 너무 공격적인지`, `PII 처리가 충분한지`, `cast 실패가 많을 field를 억지로 숫자로 만들지 않았는지`를 보면 된다.",
  },
  L7: {
    title: "예시로 보면: 어떤 Gold 표를 만들 수 있는지 지표 후보를 설계한다",
    situation: "발표에서 필요한 `gold_product_health`는 상품별 건강 상태 표다. 예를 들어 product_id별 review_count, average_rating, negative_review_rate, risk_score를 만들 수 있다. 하지만 view_count나 purchase_count가 없으면 conversion_rate는 바로 만들 수 없다.",
    action: [
      "product_health 최소 컬럼 목록을 template으로 만든다.",
      "각 컬럼이 candidate인지, missing evidence인지, deferred인지 표시한다.",
      "risk_score는 데이터에 있는 component만 써서 policy 후보를 만든다."
    ],
    result: [
      "review-only 데이터에서는 review 기반 product health는 가능하고, conversion/delivery metric은 보류될 수 있다.",
      "행동 로그 데이터가 함께 있으면 view_count, purchase_count, conversion_rate까지 후보가 될 수 있다.",
      "risk_score 공식은 고정값이 아니라 source evidence와 사용자 승인에 따라 확정된다."
    ],
    userCheck: "사용자는 `Gold를 만들지 말지`, `어떤 metric을 승인할지`, `risk_score 가중치를 어떻게 둘지`, `zero denominator를 null로 할지 0으로 할지`를 고른다.",
  },
  L8: {
    title: "예시로 보면: 나중에 의미 검색에 쓸 설명 카드만 넘긴다",
    situation: "M6가 `배송이 늦은 상품 위험도를 보여줘` 같은 질문을 받으려면 catalog와 metric 설명을 잘 찾아야 한다. L8은 원본 row를 vectorDB에 넣는 것이 아니라, field 설명과 metric caveat 같은 metadata를 검색용 후보로 넘긴다.",
    action: [
      "review_text 같은 text field 후보를 찾는다.",
      "catalog column 설명, metric 설명, caveat를 vector handoff template에 넣는다.",
      "PII나 query forbidden field는 vector handoff에서 제외한다."
    ],
    result: [
      "M6나 extension이 semantic search를 만들 때 어떤 정보를 색인할지 알 수 있다.",
      "Gold 추천도 과거 승인된 metadata를 더 잘 참고할 수 있다.",
      "M3 core는 embedding 계산이나 vector index build를 직접 하지 않는다."
    ],
    userCheck: "사용자는 `검색에 넣으면 정확도가 올라갈 설명`과 `검색에 넣으면 안 되는 민감 정보`가 분리됐는지 확인한다.",
  },
  L9: {
    title: "예시로 보면: 추천서에 사용자가 서명해야 실행 설계도로 넘어간다",
    situation: "AI가 `overall을 rating으로 쓰자`, `negative_review_rate를 만들자`, `conversion_rate는 근거가 없으니 보류하자`고 추천했다고 하자. L9는 사용자가 이 추천을 그대로 승인했는지, 일부 수정했는지, 거절했는지 기록한다.",
    action: [
      "Silver 정제 정책 승인 상태를 저장한다.",
      "Gold 생성 요청 여부와 metric별 승인 상태를 저장한다.",
      "risk_score와 vector handoff, Gold-to-Gold 선택도 별도로 저장한다."
    ],
    result: [
      "승인된 것만 L10/L11 spec으로 내려간다.",
      "Gold가 보류되어도 Silver는 별도로 ready가 될 수 있다.",
      "나중에 왜 이 Gold가 만들어졌는지 decision trace를 설명할 수 있다."
    ],
    userCheck: "사용자는 여기서 실제로 결정을 내린다. `추천이 마음에 든다`가 아니라 `이 정책을 실행 설계도로 내려도 된다`는 승인인지 확인해야 한다.",
  },
  L10: {
    title: "예시로 보면: 승인된 Silver 청소법을 M2가 읽는 작업 지시서로 바꾼다",
    situation: "사용자가 `overall을 number로 바꾸고, reviewerName은 숨기고, reviewText는 남긴다`고 승인했다면 L10은 이것을 `select`, `cast`, `mask`, `quarantine` 같은 operation으로 정리한다.",
    action: [
      "선택할 column 목록을 spec에 넣는다.",
      "cast, normalize, mask, hash 같은 params를 operation별로 넣는다.",
      "write_mode를 preview_only로 고정한다."
    ],
    result: [
      "M2는 이 spec을 Spark/local runner에 맞게 실행할 수 있다.",
      "M3가 직접 Spark session을 열거나 production table에 쓰지 않는다.",
      "승인되지 않은 field나 action은 spec에 들어가면 안 된다."
    ],
    userCheck: "사용자는 `이 작업 지시서가 내가 승인한 Silver 정책과 같은지`, `preview_only인지`, `M2가 해석하기 애매한 문장이 없는지`를 본다.",
  },
  L11: {
    title: "예시로 보면: 승인된 Gold 지표만 집계 작업 지시서로 바꾼다",
    situation: "사용자가 product_health에서 review_count, average_rating, negative_review_rate, risk_score만 승인했다고 하자. L11은 이 metric만 aggregate spec으로 만들고, conversion_rate나 late_delivery_rate는 근거가 없으면 넣지 않는다.",
    action: [
      "Gold 입력은 Silver output으로 둔다.",
      "group_by는 product_id나 category 같은 승인된 dimension으로 둔다.",
      "metric formula, denominator rule, missing evidence policy를 명시한다."
    ],
    result: [
      "M2는 Silver를 입력으로 Gold preview를 만들 수 있다.",
      "없는 지표를 임의로 0으로 채우지 않는다.",
      "Gold not_requested/deferred이면 spec은 비어 있거나 보류 상태로 남는다."
    ],
    userCheck: "사용자는 `Gold spec이 실제로 내가 선택한 metric만 담는지`, `risk_score 공식이 source evidence 기반인지`, `0으로 나누는 경우 정책이 명확한지`를 확인한다.",
  },
  L12: {
    title: "예시로 보면: 작업 지시서에 금지 명령이 있는지 검사한다",
    situation: "누군가 spec에 `모든 row마다 AI 호출`, `production table에 바로 write`, `임의 Python code 실행` 같은 위험한 내용을 넣었다고 하자. L12는 이런 작업을 통과시키지 않는다.",
    action: [
      "허용된 operation인지 검사한다.",
      "write_mode가 preview_only인지 검사한다.",
      "artifact_ref와 source_unit_id가 resolve 가능한지 검사한다."
    ],
    result: [
      "M2에 위험하거나 애매한 spec이 넘어가지 않는다.",
      "문제가 있으면 compiler_validation_result와 unsupported_action_report에 block으로 남긴다.",
      "흐름 그래프로 source -> silver -> gold 연결을 확인할 수 있다."
    ],
    userCheck: "사용자는 `막힌 이유가 맞는지`, `지원하지 않는 action을 억지로 통과시키지 않았는지`, `정상 spec이 괜히 막히지 않았는지`를 본다.",
  },
  L13: {
    title: "예시로 보면: Silver 미리 실행 결과가 실제로 괜찮은지 점검한다",
    situation: "M2가 L10 spec으로 5GB preview를 돌렸더니 row_count는 충분하지만, rating cast 실패가 30% 나오고 PII 후보가 allowed_columns에 남아 있다고 하자. L13은 이것을 Silver 품질 문제와 노출 문제로 기록한다.",
    action: [
      "row_count, cast_error_rate, quarantine_rate 같은 실행 결과를 본다.",
      "PII exposure와 query exposure를 따로 검사한다.",
      "silver_quality_axis와 pii_exposure_report를 만든다."
    ],
    result: [
      "Silver가 query 가능한 수준인지 pass/warn/block으로 판단할 수 있다.",
      "Gold가 부족한 문제와 Silver 품질 문제를 섞지 않는다.",
      "사용자는 어떤 정제 정책을 다시 수정해야 하는지 알 수 있다."
    ],
    userCheck: "사용자는 `warn이 왜 warn인지`, `block이면 어떤 field/action 때문인지`, `PII가 숨겨졌는지`를 확인한다.",
  },
  L14: {
    title: "예시로 보면: Gold 지표가 말이 되는지 따로 검사한다",
    situation: "Gold product health preview에서 review_count와 average_rating은 잘 나오지만, conversion_rate는 view_count가 없어서 만들 수 없다고 하자. L14는 이것을 Gold readiness 문제로 기록하고 Silver까지 실패로 만들지는 않는다.",
    action: [
      "metric별 numerator, denominator, source field, formula를 확인한다.",
      "not_requested, deferred, needs_source_evidence 같은 상태를 명확히 남긴다.",
      "semantic_caveat_report에 사용자가 알아야 할 한계를 적는다."
    ],
    result: [
      "Gold가 보여줄 수 있는 지표와 보류해야 할 지표가 분리된다.",
      "risk_score도 component 부족 여부를 caveat로 남긴다.",
      "M6가 Gold metric을 답변에 쓸 때 caveat를 같이 붙일 수 있다."
    ],
    userCheck: "사용자는 `Gold를 발표에 써도 되는지`, `보류된 metric을 숨길지 caveat로 보여줄지`, `risk_score 설명이 충분한지`를 본다.",
  },
  L15: {
    title: "예시로 보면: 세 개의 신호등으로 최종 사용 가능 상태를 정한다",
    situation: "Silver 처리는 pass, catalog 노출은 warn, Gold readiness는 deferred일 수 있다. L15는 이것을 하나로 뭉개지 않고 세 축으로 나눠 M6 context status를 만든다.",
    action: [
      "processing_quality로 Silver 실행 품질을 본다.",
      "catalog_safety로 PII/query 노출을 본다.",
      "gold_readiness로 Gold metric 준비 상태를 본다."
    ],
    result: [
      "Silver는 ready_with_caveat이지만 Gold는 not_ready라고 말할 수 있다.",
      "Gold가 block이어도 Silver catalog를 살릴 수 있다.",
      "M6는 어떤 table과 metric을 답변에 써도 되는지 정확히 알 수 있다."
    ],
    userCheck: "사용자는 `Silver와 Gold가 따로 판정됐는지`, `m6_context_status가 L16까지 일관되는지`, `warn caveat가 빠지지 않았는지`를 본다.",
  },
  L16: {
    title: "예시로 보면: 다른 M에게 넘길 최종 폴더와 목차를 만든다",
    situation: "L0부터 L15까지 산출물이 많아지면 M5/M6가 무엇을 믿고 읽어야 하는지 헷갈린다. L16은 catalog metadata, SQL context, vector template, artifact resolver를 한 패키지로 묶는다.",
    action: [
      "catalog_sync_contract_package에 dataset 상태와 gate 결과를 넣는다.",
      "sql_context_pack에 allowed table, allowed column, caveat를 넣는다.",
      "artifact_reference_manifest에 artifact_id와 실제 파일 URI/checksum을 연결한다."
    ],
    result: [
      "M5는 workflow와 catalog 저장에 필요한 정보를 읽을 수 있다.",
      "M6는 질문 답변에 쓸 수 있는 column과 metric만 사용할 수 있다.",
      "어떤 artifact_ref도 실제 파일과 연결되지 않은 채 떠돌지 않는다."
    ],
    userCheck: "사용자는 `M6가 읽을 수 있는 정보가 충분한지`, `민감 정보가 allowed context에 들어가지 않았는지`, `artifact_ref가 모두 resolve되는지`를 확인한다.",
  },
};
