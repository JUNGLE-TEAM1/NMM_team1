window.M3_LAYER_ANALYSIS = {
  L0: {
    choice: "원본 파일을 복제하거나 변형하는 방식 대신 source_unit_id, object_id, URI, checksum, size를 manifest로 고정하는 방식을 선택했다. M3는 원본 저장소의 소유자가 아니고, 이후 Bronze/Silver/Gold 처리에서 같은 원본을 다시 찾을 수 있는 재현성 계약을 만드는 역할이기 때문이다.",
    function: "Raw identity contract를 만든다. 파일 또는 object를 source unit으로 묶고, downstream이 원본 위치와 fingerprint를 기준으로 replay할 수 있게 한다.",
    effect: "L1은 이 manifest를 기준으로 Bronze sample을 만들고, L2는 profile의 기준 source를 잃지 않는다. M2가 Spark로 실제 materialization을 할 때도 raw payload가 아니라 source_unit_id와 object locator를 받아 처리할 수 있다.",
    advantages: [
      "대용량 원본을 M3 산출물에 복사하지 않아 저장 비용과 처리 시간을 크게 줄인다.",
      "checksum과 URI가 있어 같은 입력을 다시 처리했는지 검증할 수 있다.",
      "raw mutation을 금지하므로 정제 실패가 나도 원본을 다시 조회할 수 있다."
    ],
    tradeoffs: [
      "checksum을 prefix로 잡으면 전체 파일 무결성 보장은 약해진다.",
      "원본 파일이 외부에서 이동되면 URI만으로 replay가 실패할 수 있다.",
      "파일 단위 source unit은 간단하지만, 진짜 stream window나 partition semantics는 extension hook이 필요하다."
    ],
    limits: "L0는 데이터를 파싱하지 않는다. 컬럼 의미, 타입, 품질, Gold metric 가능성은 여기서 판단하지 않는다. 여기서 욕심내면 raw 보존 단계가 느려지고 M3 범위를 넘는다.",
    usage: "이 단계가 깨지면 모든 후속 layer의 lineage와 replay가 깨진다. object_id/source_unit_id/orphan 여부와 checksum mode를 먼저 확인해야 한다.",
    snippets: {
      "build_l0() signature and setup": {
        why: "함수 입력을 source, output, source_id, run_id, checksum 정책으로 제한했다. 이 정도만 받아야 L0가 parser나 executor로 변질되지 않고 raw inventory builder 역할에 머문다.",
        function: "출력 폴더를 만들고, source file 목록을 모은 뒤 objects/source_units 컨테이너를 초기화한다.",
        effect: "이 초기값이 이후 object loop와 manifest writer의 단일 기준이 된다. run_id가 바뀌면 같은 source라도 별도 검증 실행으로 분리된다.",
        limit: "여기서는 파일 내용의 의미를 보지 않는다. unknown CSV/JSON 여부도 L2 profile 단계에서 다뤄야 한다."
      },
      "object and source_unit construction": {
        why: "object와 source unit을 분리했다. object는 실제 파일/URI 단위이고, source unit은 downstream 처리 단위라서 둘을 같은 개념으로 두면 stream/window 확장 때 깨진다.",
        function: "각 파일에 object_id와 source_unit_id를 붙이고 fingerprint를 manifest entry로 만든다.",
        effect: "L1 record_locator, L10 preview scope, L16 lineage가 모두 같은 id 체계를 공유한다.",
        limit: "현재 core는 object_batch 중심이다. stream_window/hybrid_window는 schema 방향만 열어두고 runtime watermark는 넣지 않는다."
      },
      "manifest artifacts and replay pointer": {
        why: "raw copy 금지와 replay pointer를 artifact로 분리했다. catalog가 볼 수 있는 manifest와 raw restricted pointer의 노출 범위가 다르기 때문이다.",
        function: "object_stream_manifest, source_manifest, raw_replay_pointer를 만들고 raw_policy를 고정한다.",
        effect: "M5 catalog 저장, M2 replay 실행, M6 lineage 설명이 같은 artifact ref를 따라갈 수 있다.",
        limit: "원본 저장소의 실제 lifecycle 보장은 M3가 하지 않는다. URI가 사라지면 M3 manifest만으로 원본을 복구할 수 없다."
      }
    }
  },
  L1: {
    choice: "Bronze를 전체 생성하지 않고 bounded sample envelope와 rescue lane 계약으로 제한했다. 실시간/대용량 환경에서 M3가 전체 row를 읽거나 AI로 판단하면 현실성이 없기 때문이다.",
    function: "Bronze envelope sample, parse status, record locator, rescue lane 규칙을 만든다.",
    effect: "L2 profile이 작은 증거로 format/type/shape를 추정할 수 있고, M2는 같은 envelope spec으로 전체 Bronze 실행을 구현할 수 있다.",
    advantages: [
      "row/byte limit가 있어 unknown data에도 빠르게 control-plane 분석을 시작할 수 있다.",
      "parse 실패와 schema conflict를 rescue lane으로 남겨 데이터 손실을 줄인다.",
      "line/byte locator가 있어 샘플 판단을 원본 위치로 되돌릴 수 있다."
    ],
    tradeoffs: [
      "sample이 편향되면 드문 컬럼이나 늦게 나오는 schema drift를 놓칠 수 있다.",
      "line 기반 sampling은 multi-line JSON이나 binary/parquet에는 별도 reader가 필요하다.",
      "Bronze 전체 품질 수치는 M2 실행 결과가 돌아와야 확정된다."
    ],
    limits: "L1은 Bronze 전체 materialization이 아니다. M3는 sample lane과 spec을 만들고, 전체 Bronze 실행/저장은 M2/M5와 연결된다.",
    usage: "max_rows/max_bytes, parse_status enum, record_locator 규칙을 보고 L2 profile의 신뢰도를 해석해야 한다."
  },
  L2: {
    choice: "AI보다 먼저 deterministic profile과 schema snapshot을 만든다. unknown CSV/JSON에서 AI가 바로 의미를 추론하면 raw row 편향과 hallucination 위험이 커지기 때문이다.",
    function: "format detection, field summary, inferred type, null ratio, sample values, data shape contract를 만든다.",
    effect: "L3 AI 추천은 raw 전체가 아니라 L2 profile evidence만 본다. 이 구조가 실시간 빅데이터에서 AI를 control-plane으로 제한한다.",
    advantages: [
      "같은 sample에서 같은 profile이 나오므로 재현성이 높다.",
      "CSV/JSON/JSONL의 구조 차이를 먼저 정리해 L3 prompt/evidence를 작게 만든다.",
      "PII 후보, text 후보, measure 후보 같은 semantic hint의 입력 기반이 된다."
    ],
    tradeoffs: [
      "샘플 기반 type inference는 sparse column이나 mixed type에 약하다.",
      "컬럼 이름이 부실하면 의미 추정은 낮은 confidence로 남는다.",
      "nested JSON flatten 방향은 L4/L6 spec에서 owner decision이 필요할 수 있다."
    ],
    limits: "L2는 schema를 확정하지 않는다. 관측 snapshot과 후보 판단만 만든다. 최종 cleaning policy는 L6/L9 결정 이후에만 실행 spec이 된다.",
    usage: "field_count, inferred_type, null_ratio, semantic_hints, profile_confidence를 같이 봐야 한다. 하나만 보고 Silver/Gold를 확정하면 안 된다."
  },
  L3: {
    choice: "AI에 raw data-plane을 맡기지 않고 profile evidence를 줄인 recommendation input pack만 넘기는 방식을 선택했다. 이게 실시간/대용량에서 AI 비용과 지연을 통제하는 핵심 경계다.",
    function: "field evidence, unknown data recommendation pack, domain signal summary, AI-safe prompt context를 만든다.",
    effect: "AI는 모든 row가 아니라 profile/field summary만 보고 Silver cleaning 방향과 Gold 후보 가능성을 추천한다.",
    advantages: [
      "row-level AI 호출을 막아 비용 폭증을 피한다.",
      "raw payload가 AI에 직접 노출되지 않아 보안/PII 위험이 줄어든다.",
      "추천 근거가 field evidence로 남아 사용자가 수정하거나 반박할 수 있다."
    ],
    tradeoffs: [
      "profile에 없는 의미는 AI도 알 수 없다.",
      "도메인 signal은 후보일 뿐 확정 metric이 아니다.",
      "텍스트 의미나 embedding 품질은 extension/RAG 쪽 검증이 별도로 필요하다."
    ],
    limits: "L3는 추천 근거를 만든다. Silver/Gold 실행 spec을 확정하거나 product health metric을 실제 계산하지 않는다.",
    usage: "recommendation target마다 confidence와 blocked_claims를 같이 봐야 한다. observed signal이 없으면 Gold template은 deferred 또는 needs review로 가야 한다."
  },
  L4: {
    choice: "schema/profile/catalog metadata를 retrieval index 후보로 정리하되, vector DB 구축 자체는 core에서 빼는 방식을 선택했다. M3는 추천과 handoff 계약을 만들고, 실제 index storage는 확장 영역이어야 한다.",
    function: "metadata retrieval index plan과 Gold template candidate retrieval 근거를 만든다.",
    effect: "M6나 다른 AI가 catalog/schema를 찾아 Gold 후보를 고를 때 어떤 metadata를 vector/search index에 넣을지 알 수 있다.",
    advantages: [
      "AI가 매번 raw schema 전체를 다시 읽지 않고 catalog evidence를 검색할 수 있다.",
      "Gold 후보가 profile, field, semantic hint에 근거했는지 추적할 수 있다.",
      "vector DB 도입 여부와 관계없이 artifact contract는 유지된다."
    ],
    tradeoffs: [
      "검색 정확도는 embedding 모델, chunking, metadata 품질에 의존한다.",
      "vector DB를 core 필수로 만들면 로컬/발표/운영 환경 의존성이 커진다.",
      "후보 retrieval은 Gold 생성의 근거이지 승인 자체가 아니다."
    ],
    limits: "L4는 index를 실제로 build하지 않는다. 어떤 metadata를 넣어야 하는지와 어떤 Gold template을 후보로 띄울지 정의한다.",
    usage: "field aliases, semantic hints, metric template coverage를 보고 M6 query context와 연결 가능한지 확인한다."
  },
  L5: {
    choice: "추천 후보가 데이터 근거 없이 뜨지 않도록 grounding report와 product-health field classifier를 분리했다. 발표용 Gold라도 없는 컬럼을 있는 것처럼 만들면 M3 계약이 무너진다.",
    function: "candidate grounding, product/review/conversion/delivery signal mapping, missing evidence를 정리한다.",
    effect: "gold_product_health가 가능한 데이터와 불가능한 데이터를 구분하고, missing metric은 caveat나 deferred로 넘긴다.",
    advantages: [
      "product health template이 특정 Amazon 데이터에만 과적합되는 것을 줄인다.",
      "conversion_rate, late_delivery_rate처럼 없는 signal은 명시적으로 결측 처리할 수 있다.",
      "사용자가 Gold 추천을 수정할 때 어떤 field가 근거인지 바로 볼 수 있다."
    ],
    tradeoffs: [
      "field name 기반 signal matching은 도메인별 alias가 부족하면 놓칠 수 있다.",
      "semantic confidence가 낮은 field는 owner review가 필요하다.",
      "진짜 metric 품질은 M2 preview 실행과 L14 evidence가 있어야 판단 가능하다."
    ],
    limits: "L5는 product health를 계산하지 않는다. 어떤 field가 어떤 metric 후보인지 grounding만 한다.",
    usage: "field classifier 결과에서 required signal, optional signal, missing signal을 분리해서 L7 Gold draft의 상태를 결정해야 한다."
  },
  L6: {
    choice: "Silver 추천은 editable draft로 두고, allowed action set 안에서만 만들도록 했다. unknown data에서 AI 추천을 바로 실행하면 타입 변환/PII/flatten 실수가 대량 데이터에 퍼질 수 있기 때문이다.",
    function: "Silver cleaning policy draft, field rename/cast/null/PII/quarantine 후보를 만든다.",
    effect: "사용자는 추천을 수정할 수 있고, L10 compiler는 허용된 action만 deterministic Spark spec으로 바꿀 수 있다.",
    advantages: [
      "AI 추천과 실행 spec 사이에 사용자 승인 경계가 생긴다.",
      "허용 action이 고정되어 M2가 구현해야 할 Spark operation 범위가 명확하다.",
      "PII handling과 catalog exposure를 분리해 query context 오염을 막는다."
    ],
    tradeoffs: [
      "복잡한 business cleaning은 allowed action 밖이면 unsupported로 떨어진다.",
      "field-level 추천은 cross-column constraint를 충분히 표현하지 못할 수 있다.",
      "초기 draft 품질은 L2/L3 evidence 품질에 크게 의존한다."
    ],
    limits: "L6는 실제 Silver를 만들지 않는다. 사용자가 승인할 수 있는 cleaning policy draft를 만드는 단계다.",
    usage: "field별 action, confidence, pii_handling, quarantine rule을 확인하고 L9 approval 전에는 production write로 넘기면 안 된다."
  },
  L7: {
    choice: "Gold를 고정 계산식 하나로 박지 않고 model recommendation draft, product health template, risk score policy draft를 분리했다. 데이터마다 있는 signal이 다르기 때문에 risk_score도 추천/승인 대상이어야 한다.",
    function: "Gold model 후보, product health 최소 schema 후보, metric mapping, risk score policy draft를 만든다.",
    effect: "사용자는 Gold 생성을 요청/보류/거절할 수 있고, 승인된 경우에만 L11/L14/L16으로 Gold context가 이어진다.",
    advantages: [
      "gold_product_health 최소 컬럼은 고정하되, 각 metric의 source evidence와 결측 상태를 분리할 수 있다.",
      "risk_score weight와 zero denominator rule을 데이터 근거 기반으로 추천할 수 있다.",
      "Gold-to-Gold는 자동 생성하지 않고 사용자 요청 상태로 남긴다."
    ],
    tradeoffs: [
      "데이터에 view/purchase/delivery signal이 없으면 product health는 caveat가 많은 draft가 된다.",
      "risk score는 설명 가능성을 위해 단순 가중합을 우선하지만, 도메인별 최적성은 보장하지 않는다.",
      "Gold schema가 너무 넓으면 발표에는 좋지만 실제 catalog 품질은 낮아질 수 있다."
    ],
    limits: "L7는 Gold를 계산하지 않는다. Gold 생성 방법, 필요한 source metric, missing evidence, 승인 필요성을 정리한다.",
    usage: "product_id/product_name/category_l1 등 최소 컬럼과 review/conversion/delivery metric 근거를 확인하고, missing metric은 null/0/deferred 규칙으로 명확히 남겨야 한다."
  },
  L8: {
    choice: "vector/embedding은 core 실행이 아니라 handoff template으로 둔다. 비정형 텍스트 검색 정확도는 좋아질 수 있지만, embedding 생성과 vector DB 운영은 M3 core 범위를 넘기 때문이다.",
    function: "text field 후보, embedding 대상, vector index metadata, projection helper를 만든다.",
    effect: "M6나 extension이 catalog/schema/profile을 vector DB에 넣어 찾을 때 필요한 최소 계약을 받는다.",
    advantages: [
      "schema/profile/catalog 검색 정확도를 높일 수 있는 준비물이 생긴다.",
      "raw text 전체를 M3가 embedding하지 않아 비용과 보안 위험을 줄인다.",
      "검색/추천 확장은 가능하지만 core pipeline은 가볍게 유지된다."
    ],
    tradeoffs: [
      "embedding 품질은 모델과 chunking 전략에 따라 달라진다.",
      "core 테스트만으로 retrieval quality를 보장할 수 없다.",
      "텍스트가 거의 없는 데이터에서는 vector handoff 가치가 낮다."
    ],
    limits: "L8는 embedding file이나 vector DB index를 만들지 않는다. 어떤 field와 metadata를 넘길지 template만 만든다.",
    usage: "text_candidate field, PII exposure, catalog visibility를 같이 보고 vector 대상 여부를 결정해야 한다."
  },
  L9: {
    choice: "추천 결과를 바로 확정하지 않고 approval_state와 decision artifact로 잠근다. Silver, Gold, Gold-to-Gold는 사용자의 선택 상태가 다르기 때문이다.",
    function: "Silver/Gold policy decision, approval state, diff, review id, decision trace id를 만든다.",
    effect: "L10 compiler는 승인된 decision만 spec으로 바꾸고, rejected/deferred/not_requested는 명시 상태로 downstream에 전달한다.",
    advantages: [
      "사용자가 추천을 수정하거나 보류한 사실이 artifact로 남는다.",
      "Gold readiness가 Silver readiness를 오염시키지 않도록 상태를 분리할 수 있다.",
      "PR/발표/검증에서 어떤 결정이 자동이고 어떤 결정이 사용자 승인인지 설명 가능하다."
    ],
    tradeoffs: [
      "approval UX가 부실하면 사용자가 왜 block/deferred인지 이해하기 어렵다.",
      "decision artifact가 많아져 catalog sync가 복잡해진다.",
      "사용자가 잘못 승인하면 compiler는 계약상 맞아도 의미 품질은 낮을 수 있다."
    ],
    limits: "L9는 사람/AI tester decision을 기록하는 단계다. 데이터 변환을 실행하지 않는다.",
    usage: "decision_status, selected models, review_id, decision_trace_id, approval_state를 같이 확인해야 한다."
  },
  L10: {
    choice: "승인된 Silver decision을 곧바로 코드 실행하지 않고 deterministic transform spec으로 compile한다. 이렇게 해야 M2 Spark 실행과 M3 추천 책임이 분리된다.",
    function: "Silver transform spec, operation params, unsupported action validation을 만든다.",
    effect: "M2는 spec만 보고 Spark job을 만들 수 있고, M3는 spec이 계약 위반인지 preview 전에 확인할 수 있다.",
    advantages: [
      "AI 추천이 직접 코드 실행으로 이어지지 않아 안전하다.",
      "operation별 params schema가 있어 M2/M5/M6 연결이 명확하다.",
      "unsupported action은 실행 전 report로 막을 수 있다."
    ],
    tradeoffs: [
      "compiler가 지원하지 않는 정제 로직은 수동 확장 전까지 실행할 수 없다.",
      "복잡한 nested transform은 spec이 길어질 수 있다.",
      "Spark 최적화는 M2 책임이라 M3 compiler만으로 성능을 보장할 수 없다."
    ],
    limits: "L10은 production write를 만들지 않는다. preview/execution 가능한 spec 계약만 만든다.",
    usage: "operation, params, input_ref, output contract, unsupported_action_report를 확인해야 한다."
  },
  L11: {
    choice: "Gold도 Silver처럼 승인된 모델만 generation spec으로 바꾼다. Gold는 의미 layer라서 자동 추천만으로 생성하면 잘못된 business metric이 catalog에 들어갈 수 있다.",
    function: "Gold generation spec과 aggregate operation params를 만든다.",
    effect: "승인된 Gold model만 M2 preview 실행으로 넘어가고, not_requested/deferred 상태는 명시적으로 catalog caveat에 남는다.",
    advantages: [
      "Gold metric grain, dimensions, measures, time_window를 계약으로 고정한다.",
      "zero denominator와 missing evidence rule을 spec에 남길 수 있다.",
      "Gold-to-Gold 자동 생성을 막아 사용자가 선택한 흐름만 실행된다."
    ],
    tradeoffs: [
      "Gold 모델이 부족하면 발표용 metric이 제한적일 수 있다.",
      "aggregate params가 너무 일반적이면 downstream 구현 해석 차이가 생길 수 있다.",
      "데이터에 없는 conversion/delivery signal은 계산식으로 보완하면 안 된다."
    ],
    limits: "L11은 Gold 계산 결과가 아니라 계산 방법이다. 실제 row aggregation과 materialization은 M2 preview/run이 필요하다.",
    usage: "group_by, dimensions, measures, time_window, cardinality_guard, zero denominator rule을 확인한다."
  },
  L12: {
    choice: "compiler output을 그냥 넘기지 않고 validation result와 unsupported report를 따로 둔다. unknown data에서는 추천이 합리적이어도 실행 불가능한 action이 섞일 수 있기 때문이다.",
    function: "compiler validation result, unsupported action report, preview graph contract를 만든다.",
    effect: "M2에 넘기기 전에 block/warn/pass를 판단하고, preview_only 위반이나 params 누락을 막는다.",
    advantages: [
      "실행 전 실패를 빠르게 발견한다.",
      "지원하지 않는 transform을 사용자와 M2가 같은 언어로 볼 수 있다.",
      "preview scope가 source_unit_ids 중심으로 정렬되어 L0 lineage와 연결된다."
    ],
    tradeoffs: [
      "검증 rule이 과하면 실험적인 transform도 막힐 수 있다.",
      "검증 rule이 약하면 M2 실행 실패가 뒤늦게 난다.",
      "runtime 성능/cluster 상태는 이 validation만으로 알 수 없다."
    ],
    limits: "L12는 정적/계약 검증이다. Spark runtime failure, skew, executor memory 문제는 실제 실행 증거가 필요하다.",
    usage: "write_mode=preview_only, source_unit_ids, operation params schema, unsupported action 여부를 확인한다."
  },
  L13: {
    choice: "Silver preview evidence를 별도 layer로 분리했다. spec이 맞는 것과 실제 sample/preview에서 품질이 acceptable한 것은 다른 문제이기 때문이다.",
    function: "Silver preview summary, row counts, issue samples, quality metrics를 만든다.",
    effect: "L15 gate가 processing_quality axis를 계산할 수 있고, 사용자는 Silver 결과가 실제로 어떤 변화를 만들었는지 볼 수 있다.",
    advantages: [
      "정책 추천과 실제 변환 결과의 차이를 잡을 수 있다.",
      "quarantine이나 null/cast 변화가 수치로 드러난다.",
      "작은 preview에서도 큰 run 전에 위험을 줄인다."
    ],
    tradeoffs: [
      "preview sample이 전체 데이터 분포를 대표하지 못할 수 있다.",
      "실제 대용량 성능은 full M2 run이나 weighted window test가 필요하다.",
      "M3 자체 runner는 검증용이며 운영 executor가 아니다."
    ],
    limits: "L13은 Silver 품질 evidence다. final Silver table 소유권이나 production write는 M2/M5 범위다.",
    usage: "input/output row count, quarantine count, invalid cast, null 변화, sample caveat를 gate에 연결한다."
  },
  L14: {
    choice: "Gold preview evidence를 Silver preview와 분리했다. Gold readiness가 나빠도 Silver ready 상태를 오염시키면 안 되기 때문이다.",
    function: "Gold metric preview, product health metric availability, risk score caveat를 만든다.",
    effect: "L15에서 gold_readiness axis를 별도로 계산하고, L16 catalog에는 Gold context status가 따로 전달된다.",
    advantages: [
      "Gold metric의 의미 품질을 Silver processing 품질과 분리해 볼 수 있다.",
      "missing conversion/delivery signal이 수치와 caveat로 드러난다.",
      "risk_score 계산 근거와 denominator rule을 발표/검증에서 설명할 수 있다."
    ],
    tradeoffs: [
      "Gold preview는 데이터 의미가 부족하면 ready_with_caveat나 deferred가 많아질 수 있다.",
      "미리보기에서 괜찮아 보여도 전체 데이터 cardinality가 크면 비용이 커질 수 있다.",
      "domain owner가 metric 의미를 확인하지 않으면 Gold 품질은 최종 확정이 아니다."
    ],
    limits: "L14는 Gold preview evidence다. 사용자 승인 없는 Gold-to-Gold 생성이나 production publish를 하지 않는다.",
    usage: "review_count, negative_review_rate, conversion_rate, late_delivery_rate, risk_score source coverage를 각각 봐야 한다."
  },
  L15: {
    choice: "품질 판단을 processing_quality, catalog_safety, gold_readiness 3축으로 나눴다. 하나의 pass/warn/block으로 합치면 Silver와 Gold의 실패 원인이 섞인다.",
    function: "quality gate, drift/quarantine 판단, M6 context status를 만든다.",
    effect: "Silver가 ready여도 Gold는 not_ready일 수 있고, Gold가 deferred여도 M6는 Silver context만 안전하게 받을 수 있다.",
    advantages: [
      "Gold readiness가 Silver status를 오염시키지 않는다.",
      "PII/query exposure와 processing 품질을 분리해 catalog 안전성을 높인다.",
      "M6가 SQL context를 어디까지 써도 되는지 status로 받는다."
    ],
    tradeoffs: [
      "축이 늘어나서 보고서/UX가 복잡해질 수 있다.",
      "warn 기준이 느슨하면 위험한 data가 넘어가고, 엄격하면 사용성이 떨어진다.",
      "drift 판단은 기준 실행과 비교 데이터가 충분해야 신뢰할 수 있다."
    ],
    limits: "L15는 gate 판단이다. 실제 catalog sync나 query execution은 L16/M5/M6가 처리한다.",
    usage: "axis별 pass/warn/block reason을 보고, M6 context status와 catalog exposure가 일치하는지 확인한다."
  },
  L16: {
    choice: "최종 handoff를 catalog metadata, SQL context, lineage, artifact manifest, semantic vector template으로 나눴다. 다른 M이 필요한 정보가 서로 다르고 노출 등급도 다르기 때문이다.",
    function: "M5 catalog sync package와 M6 query/semantic context package를 만든다.",
    effect: "M5는 artifact를 저장/resolve하고, M6는 허용된 column/metric/context만 사용한다. artifact_reference_manifest가 *_ref를 실제 파일로 풀어준다.",
    advantages: [
      "catalog metadata와 query context가 분리되어 PII/query exposure를 통제할 수 있다.",
      "artifact_reference_manifest로 모든 ref를 추적할 수 있다.",
      "vector handoff template이 있어 schema/profile/catalog 검색 확장과 연결된다."
    ],
    tradeoffs: [
      "handoff package가 커지고 관리해야 할 artifact가 많아진다.",
      "M5/M6가 package schema를 정확히 따라야 실제 효과가 난다.",
      "Gold가 deferred면 catalog에는 caveat가 많고 query 가능한 metric이 제한된다."
    ],
    limits: "L16은 sync/handoff 계약이다. 실제 M5 DB write, M6 query answer, vector DB index 생성은 외부 M 또는 extension 책임이다.",
    usage: "m6_context_status, sql_context_pack, catalog_sync_contract_package, artifact_reference_manifest의 상태가 서로 일치하는지 확인한다."
  }
};
