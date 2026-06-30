window.M3_CODE_GLOSSARY = {
  L0: {
    "build_l0() signature and setup": [
      {
        term: "def build_l0(...):",
        meaning: "Python에서 L0 원본 식별 manifest를 만드는 함수 선언이다. 이 함수가 source 위치를 받아 object/source_unit 기준 산출물을 만든다.",
        note: "여기서 실제 원본을 복사하거나 변형하지 않는다. M3가 맡는 것은 원본을 다시 찾을 수 있는 계약과 식별자 고정이다.",
      },
      {
        term: "source: Path",
        meaning: "분석 대상 원본의 파일 또는 디렉터리 경로다. `Path`는 문자열보다 안전하게 파일/폴더 경로를 다루는 Python pathlib 타입이다.",
        note: "폴더면 내부 파일을 재귀적으로 찾고, 파일이면 그 파일 하나만 source object로 본다.",
      },
      {
        term: "out_dir: Path",
        meaning: "L0 산출물 JSON을 저장할 루트 출력 디렉터리다. 실제 raw 데이터 저장소가 아니라 M3 계약 산출물 위치다.",
        note: "코드는 이 아래에 `l0` 폴더를 만들고 manifest, replay pointer를 저장한다.",
      },
      {
        term: "source_id: str",
        meaning: "등록된 데이터 소스를 구분하는 사람이 읽을 수 있는 ID다. artifact_id, object_id, source_unit_id 생성의 기준 문자열로 쓰인다.",
        note: "같은 파일이라도 source_id가 다르면 다른 데이터 소스 계약으로 취급된다.",
      },
      {
        term: "run_id: str",
        meaning: "이번 분석 실행을 구분하는 ID다. 같은 source_id를 다시 분석해도 run_id가 다르면 별도 실행 결과로 추적된다.",
        note: "재현성 검증이나 비교 실행에서 어떤 산출물이 어느 실행에서 나왔는지 구분하는 축이다.",
      },
      {
        term: "checksum_mode: str = \"prefix\"",
        meaning: "파일 checksum을 계산하는 방식을 정한다. 기본값 `prefix`는 전체 파일이 아니라 앞부분만 읽어 빠르게 fingerprint를 만든다.",
        note: "대용량 데이터에서는 full checksum이 너무 비쌀 수 있어 기본을 prefix로 둔 것이다. 필요하면 `full`이나 `none` 정책으로 조정할 수 있다.",
      },
      {
        term: "checksum_bytes: int = 8 * 1024 * 1024",
        meaning: "prefix checksum일 때 파일 앞부분을 몇 byte까지 읽을지 정한다. 기본값은 8,388,608 byte, 즉 8 MiB다.",
        note: "`1024`는 컴퓨터 저장 단위의 이진 배수다. 1024 byte = 1 KiB, 1024 * 1024 byte = 1 MiB, 8 * 1024 * 1024 byte = 8 MiB다.",
      },
      {
        term: "-> dict[str, Any]",
        meaning: "함수가 문자열 key와 다양한 타입 value를 가진 dictionary를 반환한다는 뜻이다.",
        note: "반환값 안의 `files`, `objects`, `source_units`, `manifest`가 L1/L2 이후 단계 입력으로 이어진다.",
      },
      {
        term: "objects: list[dict[str, Any]] = []",
        meaning: "원본 파일/object 단위 metadata를 담을 빈 배열이다. 각 object에는 URI, checksum, 크기, 수정 시각이 들어간다.",
        note: "object는 실제 파일/저장 객체에 가깝고, downstream replay의 물리 기준이 된다.",
      },
      {
        term: "source_units: list[dict[str, Any]] = []",
        meaning: "처리 단위 source_unit metadata를 담을 빈 배열이다. 현재는 파일 하나를 object_batch source unit 하나로 잡는다.",
        note: "source_unit을 따로 둔 이유는 나중에 stream window, hybrid window처럼 object와 처리 단위가 1:1이 아닌 상황을 받기 위해서다.",
      },
    ],
    "object and source_unit construction": [
      {
        term: "for index, path in enumerate(files, start=1)",
        meaning: "탐색된 source file들을 1번부터 순서대로 돈다. index는 안정적인 object/source_unit 번호를 만들 때 쓴다.",
        note: "`start=1`이라 첫 파일은 00001이 된다. 사람이 읽는 manifest에서 0번보다 자연스럽고 누락 확인도 쉽다.",
      },
      {
        term: "object_id = f\"{source_id}_object_{index:05d}\"",
        meaning: "파일 하나를 가리키는 object id를 만든다. `:05d`는 숫자를 5자리로 0-padding한다는 뜻이다.",
        note: "예를 들어 index가 3이면 `00003`이 된다. 정렬했을 때 1, 10, 2처럼 섞이지 않게 하는 효과가 있다.",
      },
      {
        term: "source_unit_id = f\"{source_id}_unit_{index:05d}\"",
        meaning: "후속 L단계가 처리 범위를 잡는 source_unit id를 만든다. 현재 구현은 파일 하나와 source_unit 하나를 연결한다.",
        note: "L6 preview_scope, L10/L16 handoff가 이 source_unit_id를 사용해 어느 입력 범위를 다루는지 명시한다.",
      },
      {
        term: "fingerprint = file_fingerprint(path, checksum_mode, checksum_bytes)",
        meaning: "파일 path, URI, size, modified_at, checksum을 계산한다. checksum_mode와 checksum_bytes가 대용량 비용을 조절한다.",
        note: "이 값이 있어야 raw를 복제하지 않아도 나중에 같은 파일인지, 변경됐는지, 어디서 다시 읽을지 판단할 수 있다.",
      },
      {
        term: "\"checksum\": f\"sha256:{fingerprint['checksum']}\"",
        meaning: "해시 알고리즘 이름을 붙여 checksum 값을 저장한다. 값만 저장하면 어떤 알고리즘인지 헷갈릴 수 있어서 prefix를 붙인다.",
        note: "M5/M6나 검증 도구가 artifact를 비교할 때 `sha256:` prefix가 있으면 해석이 명확해진다.",
      },
      {
        term: "\"compression\": \"gzip\" if path.name.lower().endswith(\".gz\") else \"none\"",
        meaning: "파일명 확장자가 `.gz`면 gzip 압축으로 표시하고 아니면 압축 없음으로 둔다.",
        note: "실제 압축 해제는 M3가 하지 않는다. M2가 읽을 때 필요한 힌트를 계약에 남기는 것이다.",
      },
      {
        term: "\"source_unit_type\": \"object_batch\"",
        meaning: "이 source_unit이 object 기반 batch 입력이라는 뜻이다. stream이 아니므로 stream_window_ids는 빈 배열로 둔다.",
        note: "stream/hybrid는 schema 자리를 유지하되 현재 lightweight core에서는 object_batch만 직접 만든다.",
      },
    ],
    "manifest artifacts and replay pointer": [
      {
        term: "body = { ... }",
        meaning: "L0 object_stream_manifest의 실제 payload를 만든다. source root, source kind, object list, source_unit list, raw policy가 들어간다.",
        note: "이 body는 header와 합쳐져 JSON artifact가 되고, `manifest_hash`도 이 body 기준으로 계산된다.",
      },
      {
        term: "\"declared_format\": \"unknown\"",
        meaning: "L0에서는 파일 내용을 파싱하지 않으므로 format을 모른다고 둔다. format 판단은 L2에서 bounded sample 기준으로 한다.",
        note: "처음부터 csv/json으로 단정하지 않기 때문에 unknown data 입력에 견고하다.",
      },
      {
        term: "\"copy_raw_payload\": False",
        meaning: "M3가 raw payload를 복제하지 않는다는 정책이다. L0는 원본의 위치와 fingerprint만 기록한다.",
        note: "원본 저장과 대량 물리 복사는 M3 범위가 아니라 ingestion/M2/storage 책임으로 남긴다.",
      },
      {
        term: "body[\"manifest_hash\"] = stable_json_hash(body)",
        meaning: "manifest body를 정렬된 JSON으로 직렬화한 뒤 sha256 해시를 만든다. 같은 입력이면 같은 hash가 나와야 한다.",
        note: "재현성, drift 감지, report 비교에 쓰이는 값이다.",
      },
      {
        term: "with_header(... schema_version=\"m3.l0...v2_1_1\")",
        meaning: "산출물에 artifact_header를 붙인다. schema_version, access_class, artifact_id, logical_layer가 이때 결정된다.",
        note: "모든 `_ref`가 artifact_id 문자열로 통일되기 때문에 header가 있어야 L16 artifact_reference_manifest에서 resolve할 수 있다.",
      },
      {
        term: "raw_replay_pointer",
        meaning: "M2나 테스트 하네스가 raw를 다시 찾기 위한 제한 접근 산출물이다. object_uris와 source_unit_ids를 담는다.",
        note: "raw를 노출하는 문서가 아니라 replay 경로를 기록하는 계약이다. access_class도 `raw_restricted`로 둔다.",
      },
    ],
  },
  L1: {
    "build_l1() and Bronze manifests": [
      {
        term: "def build_l1(l0, out_dir, source_id, run_id, max_rows, max_bytes)",
        meaning: "L0 manifest를 받아 Bronze envelope sample과 rescue lane 계약을 만드는 함수다.",
        note: "`max_rows`, `max_bytes`로 bounded sample만 만들기 때문에 대용량 전체를 M3가 읽는 구조가 아니다.",
      },
      {
        term: "object_by_path = {item[\"path\"]: item for item in l0[\"objects\"]}",
        meaning: "파일 path로 L0 object metadata를 빠르게 찾기 위한 dictionary다.",
        note: "sample record를 만들 때 record_locator에 object_id와 source_unit_id를 정확히 붙이기 위해 필요하다.",
      },
      {
        term: "_sample_bronze_records(... max_rows, max_bytes)",
        meaning: "원본 파일에서 제한된 수의 record preview를 읽는다. row 수와 byte 수 둘 중 하나가 한계에 닿으면 중단된다.",
        note: "M3는 control-plane 샘플만 만든다. 전체 Bronze materialization은 M2가 맡아야 한다.",
      },
      {
        term: "\"sample_lane\": {\"row_limit\": max_rows, \"byte_limit\": max_bytes}",
        meaning: "이 Bronze sample이 어느 한계 안에서 만들어졌는지 manifest에 기록한다.",
        note: "나중에 누가 이 sample을 보고 '전체 데이터 결과'처럼 오해하지 않게 하는 안전장치다.",
      },
      {
        term: "\"jsonl_artifact\": \"bronze_envelope_samples.jsonl\"",
        meaning: "sample record들이 JSONL 파일로 저장된다는 계약이다.",
        note: "JSONL은 row 단위 append/read가 쉬워 unknown CSV/JSON/텍스트 sample lane에 적합하다.",
      },
    ],
    "rescue lane and envelope spec": [
      {
        term: "\"rescue_lane_required\": True",
        meaning: "파싱 실패나 schema conflict가 생겨도 데이터를 버리지 않고 구조화된 별도 lane으로 보존해야 한다는 선언이다.",
        note: "현재 sample rescue file은 비어 있어도, 계약상 rescue lane이 항상 존재한다는 점이 중요하다.",
      },
      {
        term: "\"parse_status_values\"",
        meaning: "Bronze record가 가질 수 있는 parse 상태 목록이다. parsed, parse_failed, encoding_failed, schema_exception, unsupported_format을 명시한다.",
        note: "실패를 무시하지 않고 status로 보존해야 Silver 품질 gate가 판단할 수 있다.",
      },
      {
        term: "\"required_columns\"",
        meaning: "Bronze envelope가 반드시 가져야 하는 column 목록이다. record_id, source refs, locator, parse_status, payload 등이 포함된다.",
        note: "이 목록이 raw->bronze 계약의 최소 schema다. M2가 Spark로 전체 실행할 때도 이 구조를 맞춰야 한다.",
      },
      {
        term: "\"record_locator\"",
        meaning: "원본 record를 다시 찾는 위치 정보 묶음이다. object_id와 line/byte/json_path/parquet_row_group 같은 locator가 들어간다.",
        note: "source_unit_id만 있으면 파일 단위까지는 알 수 있지만 row/record 위치를 재현하기 어렵다.",
      },
      {
        term: "\"optional_artifact_reference_fields\": [\"checkpoint_artifact_ref\"]",
        meaning: "실제로 artifact가 있을 때만 쓸 수 있는 선택 reference field다.",
        note: "v2.1.1 규칙상 artifact가 아닌 외부 handle은 `_ref`를 쓰면 안 되므로 여기서는 artifact reference로만 제한한다.",
      },
    ],
    "_sample_bronze_records() line reader": [
      {
        term: "with path.open(\"rb\") as handle",
        meaning: "파일을 binary mode로 연다. encoding 문제를 먼저 가정하지 않고 raw byte 기준 locator를 계산하기 위해서다.",
        note: "byte_start/byte_end가 정확해야 원본 replay가 가능하다.",
      },
      {
        term: "if len(rows) >= max_rows or consumed >= max_bytes: return rows",
        meaning: "샘플 row 수 또는 샘플 byte 한계를 넘으면 즉시 중단한다.",
        note: "실시간/대용량에서 M3가 전체 데이터 plane이 되지 않게 막는 핵심 조건문이다.",
      },
      {
        term: "text = raw.decode(\"utf-8\", errors=\"replace\")",
        meaning: "raw byte를 UTF-8로 decode하되 깨지는 문자는 replacement character로 대체한다.",
        note: "샘플 preview를 만들기 위한 처리이고, 원본 raw hash와 byte locator는 별도로 보존된다.",
      },
      {
        term: "\"payload\": text[:1000]",
        meaning: "Bronze sample payload를 앞 1000자까지만 inline으로 둔다.",
        note: "AI/profile 입력에 원본 전체를 싣지 않기 위한 크기 제한이며, raw replay는 locator와 hash로 해결한다.",
      },
      {
        term: "\"raw_sha256\": hashlib.sha256(raw).hexdigest()",
        meaning: "읽은 raw line byte의 sha256을 계산한다. sample record가 어떤 원본 조각에서 왔는지 검증하는 값이다.",
        note: "payload preview가 잘려도 raw_sha256과 byte locator는 원본 확인 근거로 남는다.",
      },
      {
        term: "\"stream_window_id\": None",
        meaning: "현재 샘플은 object-backed record라 stream window가 없다.",
        note: "stream 입력이면 stream_window_id와 offset/checkpoint anchor가 필요하지만, 이 lightweight path에서는 object locator를 사용한다.",
      },
    ],
  },
  L2: {
    "field summary helpers": [
      {
        term: "_field_summary(stats, sample_count)",
        meaning: "수집된 field별 통계를 profile field 배열로 바꾼다. type 분포, observed_count, null_ratio, 예시값, PII hint를 만든다.",
        note: "L3 AI-safe evidence의 직접 입력이 되므로 raw 값 전체가 아니라 요약 통계 중심으로 축약한다.",
      },
      {
        term: "type_counts = dict(item[\"types\"])",
        meaning: "Counter로 모은 타입 개수를 일반 dict로 바꿔 JSON 직렬화하기 쉽게 만든다.",
        note: "예: `{string: 120, null: 3}` 같은 분포가 downstream type 판단 근거가 된다.",
      },
      {
        term: "null_ratio = round(null_count / sample_count, 6)",
        meaning: "sample 중 null 비율을 소수 6자리로 계산한다.",
        note: "Silver 추천에서 `normalize_null`을 붙일지, nullable schema로 둘지 판단하는 근거다.",
      },
      {
        term: "example_values = item[\"examples\"][:5]",
        meaning: "field별 예시값을 최대 5개만 보존한다.",
        note: "AI와 사람이 schema 의미를 짐작할 수 있게 하되, 원본 payload 과다 노출은 막는다.",
      },
      {
        term: "pii_hint(name)",
        meaning: "field 이름에 email, phone, address, user, customer 같은 PII 가능 token이 있는지 판단한다.",
        note: "완벽한 PII 탐지가 아니라 초벌 safety hint다. L3/L7에서 mask/exposure 정책으로 이어진다.",
      },
    ],
    "JSON and CSV profilers": [
      {
        term: "_profile_jsonl(samples)",
        meaning: "sample row를 한 줄씩 JSON으로 파싱하고 flatten한 field를 통계화한다.",
        note: "JSONL은 line 단위 레코드가 많기 때문에 row별 parse 성공/실패를 셀 수 있다.",
      },
      {
        term: "_profile_json_document(samples)",
        meaning: "sample preview들을 합쳐 하나의 JSON 문서로 먼저 파싱해보고, 실패하면 JSONL profiler로 fallback한다.",
        note: "unknown JSON이 배열 문서인지 JSONL인지 모르는 상황을 흡수하기 위한 구조다.",
      },
      {
        term: "flatten_json(value)",
        meaning: "nested JSON을 `$.a.b`나 `$[].field` 같은 path 기반 field로 펼친다.",
        note: "Silver 후보 target_name을 만들고 nested 구조를 사람이 수정할 수 있게 만드는 기반이다.",
      },
      {
        term: "_profile_csv(samples)",
        meaning: "sample line에서 CSV dialect를 추정하고 header/row width/type 통계를 만든다.",
        note: "CSV는 delimiter/header 추정 실패 가능성이 있어 `dialect`, `width_conflicts`를 같이 남긴다.",
      },
      {
        term: "csv.reader(lines, delimiter=..., quotechar=...)",
        meaning: "추정된 구분자와 quote 문자로 CSV sample을 파싱한다.",
        note: "문자열 split보다 안전하지만, 깨진 CSV나 multiline CSV는 sample 수준 한계가 있을 수 있다.",
      },
    ],
    "data shape contract": [
      {
        term: "_data_shape_contract(...)",
        meaning: "탐지된 format과 parser 통계를 기반으로 이 데이터가 core에서 어느 정도 지원되는지 정의한다.",
        note: "L2의 목적은 단순 field list가 아니라 downstream 실행 책임과 한계를 명시하는 것이다.",
      },
      {
        term: "\"structure_class\"",
        meaning: "csv는 structured_table, json/jsonl은 semi_structured_records, text는 unstructured_text_sample, 기타는 extension_required로 분류한다.",
        note: "이 분류가 L3 추천 범위와 L16 handoff caveat에 영향을 준다.",
      },
      {
        term: "\"core_support_status\"",
        meaning: "M3 lightweight core가 직접 profile할 수 있는지 상태를 표시한다.",
        note: "Parquet처럼 core가 직접 파싱하지 않는 format은 M2 Spark/profile extension hook으로 넘기는 것이 맞다.",
      },
      {
        term: "\"bounded_evidence\"",
        meaning: "field_count, sampled_record_count, source_unit_ids, object_ids, full_data_scan_by_m3=false를 담는다.",
        note: "M3가 전체 data plane을 읽은 것처럼 주장하지 못하게 하는 증거 묶음이다.",
      },
      {
        term: "\"streaming_bigdata_contract\"",
        meaning: "stream runtime, watermark, per-event AI 금지, window identity 요구사항을 명시한다.",
        note: "실시간 빅데이터를 고려하되 core에는 runtime 실행을 억지로 넣지 않고 계약만 둔다.",
      },
    ],
    "build_l2() routing and artifact creation": [
      {
        term: "detection = detect_format(files, samples, format_hint)",
        meaning: "확장자와 sample 내용을 보고 csv/json/jsonl/text/parquet format을 추정한다.",
        note: "format_hint가 있으면 명시값을 우선하고, 없으면 extension과 sample parse evidence를 쓴다.",
      },
      {
        term: "if fmt == \"json\" / \"jsonl\" / \"csv\"",
        meaning: "탐지된 format별 profiler로 분기한다. 그 외는 raw text profile로 제한한다.",
        note: "unknown input을 억지로 하나의 parser에 태우지 않고 지원 범위를 분리하는 구조다.",
      },
      {
        term: "schema_basis = [{\"name\", \"types\", \"pii_hint\"} ...]",
        meaning: "schema fingerprint를 만들 최소 기준 정보만 뽑는다.",
        note: "예시값까지 hash 기준에 넣으면 샘플 순서나 값 변화에 과민해질 수 있어 구조 중심으로 잡는다.",
      },
      {
        term: "profile_artifacts",
        meaning: "format별 profile ref와 scope(source_unit_ids/object_ids/record_path)를 함께 기록한다.",
        note: "M5/M6가 profile_snapshot만 보지 않고 format-specific artifact를 resolve할 수 있게 한다.",
      },
      {
        term: "write_json(... format_detection/profile_snapshot/schema_fingerprint)",
        meaning: "format 판단, 전체 profile, format-specific profile, schema hash artifact를 각각 저장한다.",
        note: "나눠 저장하는 이유는 다른 M이 필요한 단위만 참조하고 비교할 수 있게 하기 위해서다.",
      },
    ],
  },
  L3: {
    "build_l3() field evidence reduction": [
      {
        term: "def build_l3(profile, out_dir, source_id, run_id)",
        meaning: "L2 profile을 AI-safe evidence pack으로 줄이는 함수다. 실행 가능한 추천은 아직 만들지 않는다.",
        note: "L3는 raw/profile을 AI에 넣기 전 안전하게 축약하고 가릴 것을 가리는 control-plane 단계다.",
      },
      {
        term: "for index, field in enumerate(profile[\"fields\"], start=1)",
        meaning: "L2 field를 하나씩 읽어 field_id와 AI에 줄 요약 정보를 만든다.",
        note: "field_id는 source_path가 바뀌거나 길어도 downstream에서 같은 field evidence를 참조하기 쉽게 한다.",
      },
      {
        term: "examples = [str(value)[:80] ...][:3]",
        meaning: "field 예시값을 최대 3개, 각 80자까지만 남긴다.",
        note: "AI가 의미를 추정할 최소 문맥은 주되 원본 payload 유출과 prompt 비용을 줄인다.",
      },
      {
        term: "if field[\"pii_hint\"]: examples = [\"[REDACTED_PII]\"]",
        meaning: "PII 가능 field의 예시값은 실제 값을 버리고 마스킹 토큰으로 대체한다.",
        note: "이 단계에서 원본 PII를 AI 입력으로 넘기지 않는 것이 핵심 안전 기준이다.",
      },
      {
        term: "\"profile_confidence\": 0.85 if confidence >= 0.7 else 0.55",
        meaning: "format detection confidence가 높으면 field evidence 신뢰도를 높게, 낮으면 낮게 잡는다.",
        note: "정밀 통계가 아니라 추천 우선순위와 caveat 판단에 쓰는 보수적 confidence다.",
      },
    ],
    "evidence reducer and policy context": [
      {
        term: "ai_recommendation_input_pack",
        meaning: "AI나 deterministic fallback이 볼 수 있는 축약 입력이다. field_evidence, data_shape_contract, source_processing_contract를 담는다.",
        note: "raw payload, full stream, unredacted rescue lane은 blocked_ai_inputs로 명시된다.",
      },
      {
        term: "\"row_level_ai_calls\": 0",
        meaning: "row마다 AI를 호출하지 않는다는 선언이다.",
        note: "실시간/대용량에서 모든 row를 AI로 처리한다고 말하면 거짓말이므로, 이 값이 architecture boundary를 고정한다.",
      },
      {
        term: "field_evidence_reducer",
        meaning: "L2 profile에서 L3 AI input pack으로 줄이는 규칙 자체를 artifact로 남긴다.",
        note: "drop full raw payload, cap examples, redact PII, preserve null/type evidence 같은 정책이 여기에 들어간다.",
      },
      {
        term: "redaction_map",
        meaning: "어떤 field가 어떤 이유로 redaction됐는지 기록한다.",
        note: "나중에 mask 정책이 왜 붙었는지, query context에서 왜 숨겼는지 추적할 수 있다.",
      },
      {
        term: "policy_context_pack",
        meaning: "Silver/Gold 목표와 M3 scope boundary를 AI-safe 형태로 제공한다.",
        note: "모델이 Spark 실행이나 production write까지 M3 책임처럼 추천하지 않도록 문맥을 제한한다.",
      },
    ],
    "unknown data recommendation pack and domain signals": [
      {
        term: "_unknown_data_recommendation_pack(...)",
        meaning: "모르는 구조의 데이터에 대해 어떤 추천 target을 만들 수 있는지 정리한다.",
        note: "Silver cleaning, generic Gold aggregate, product health template, vector handoff를 각각 별도 target으로 둔다.",
      },
      {
        term: "_domain_signals(fields)",
        meaning: "field 이름과 semantic_hints로 product, review, time, conversion, delivery 같은 domain signal을 찾는다.",
        note: "이건 확정 의미 분석이 아니라 후보 탐지다. 나중 L5/L7/L9에서 grounding과 승인 절차를 거친다.",
      },
      {
        term: "\"generic_recommendation_targets\"",
        meaning: "AI가 어떤 산출물을 추천해야 하는지 목표를 명시한다.",
        note: "모델 출력이 산만해지지 않고 L6/L7/L8 draft로 이어지도록 guide 역할을 한다.",
      },
      {
        term: "\"blocked_claims\"",
        meaning: "L3가 절대로 주장하면 안 되는 내용을 명시한다.",
        note: "예: product health 정확성 증명, row-level realtime AI, embedding build, conversion_rate inventing 금지.",
      },
      {
        term: "_vector_candidate_fields(fields)",
        meaning: "text/entity/metadata 후보 field를 분류해 vector handoff 후보로 넘긴다.",
        note: "M3 core는 embedding을 만들지 않고 어떤 field를 넘길 수 있는지만 추천한다.",
      },
    ],
  },
  L4: {
    "metadata retrieval index plan": [
      {
        term: "_metadata_retrieval_index_plan(profile, fields, source_id, run_id)",
        meaning: "schema/profile/catalog metadata를 vector search에 넣을 수 있는 document 형태로 설계한다.",
        note: "여기서 vector DB를 직접 만들지는 않고, M6 또는 vector extension이 실행할 수 있는 index plan을 만든다.",
      },
      {
        term: "\"document_type\": \"schema_profile\"",
        meaning: "전체 source profile을 설명하는 검색 document다.",
        note: "사용자 질문이나 Gold template 검색이 특정 dataset의 schema를 찾을 때 쓰인다.",
      },
      {
        term: "\"document_type\": \"gold_template\"",
        meaning: "gold_product_health_v1 같은 의미 template을 검색 대상으로 넣는다.",
        note: "데이터 schema와 Gold template을 같은 검색 공간에서 비교할 수 있게 하는 장점이 있다.",
      },
      {
        term: "\"document_type\": \"column_profile\"",
        meaning: "각 field를 별도 검색 document로 만든다. field name, source_path, type, role_hints, null_ratio가 payload에 들어간다.",
        note: "특정 metric이나 column 역할을 찾는 M6/M1 질의에서 field-level retrieval 정확도를 높인다.",
      },
      {
        term: "\"blocked_inputs\": [\"raw rows\", ...]",
        meaning: "vector index에 넣으면 안 되는 입력을 명시한다.",
        note: "schema/profile metadata는 넣을 수 있지만 raw rows나 unredacted PII를 넣으면 M3 safety boundary를 깨게 된다.",
      },
    ],
    "gold template candidate retrieval": [
      {
        term: "_gold_template_candidate_retrieval(fields, source_id, run_id)",
        meaning: "field evidence가 product health Gold template에 맞는지 deterministic score로 후보화한다.",
        note: "AI/vector 유사도만 믿지 않고 product/review/conversion/delivery 근거를 따로 점수화한다.",
      },
      {
        term: "product_fields / rating_fields / review_text_fields",
        meaning: "product key, rating, review text로 볼 수 있는 field 후보 묶음이다.",
        note: "product health에서 product key와 review/rating은 최소 grounding 조건이다.",
      },
      {
        term: "score += 0.25 / 0.2 / 0.15",
        meaning: "관찰된 signal 종류에 따라 후보 점수를 누적한다.",
        note: "고정된 정답 점수가 아니라 shortlist용 점수다. `candidate_score`가 높아도 실행 승인은 아니다.",
      },
      {
        term: "\"applicability_status\"",
        meaning: "product health template을 바로 후보로 볼 수 있는지, source evidence가 더 필요한지 표시한다.",
        note: "일반 id/order/customer field만으로 product health를 주장하지 못하게 막는다.",
      },
      {
        term: "\"missing_or_weak_evidence\"",
        meaning: "conversion numerator/denominator, delivery evidence처럼 부족한 근거를 명시한다.",
        note: "없는 metric을 0으로 채우거나 만들어내지 않고 이후 approval/preview에서 보이게 한다.",
      },
    ],
  },
  L5: {
    "candidate grounding report": [
      {
        term: "_candidate_grounding_report(fields, template_retrieval, source_id, run_id)",
        meaning: "Gold template 후보가 실제 source evidence에 얼마나 근거가 있는지 점검 report를 만든다.",
        note: "template retrieval과 실제 semantic execution 사이에 검증 단계를 하나 더 둬서 오버피팅을 줄인다.",
      },
      {
        term: "\"embedding_similarity\"",
        meaning: "vector/template similarity는 후보 shortlist 용도로만 사용한다는 check다.",
        note: "유사도가 높아도 metric 값이 맞다는 증거가 아니므로 status를 candidate로 제한한다.",
      },
      {
        term: "\"exact_name_type_compatibility\"",
        meaning: "product/asin/sku 같은 key와 rating/review evidence가 있는지 확인한다.",
        note: "generic order_id나 customer_id를 product key로 오해하면 Gold 의미가 틀어지므로 보수적으로 본다.",
      },
      {
        term: "\"denominator_rule\"",
        meaning: "conversion_rate나 late_delivery_rate에 필요한 분모 근거가 있는지 확인한다.",
        note: "view_count가 없으면 conversion_rate를 만들 수 없고, delivery_count가 없으면 late_delivery_rate를 확정할 수 없다.",
      },
      {
        term: "\"allowed_to_l10_l11_compile_without_l9\": False",
        meaning: "grounding report를 통과해도 사용자 승인 없이 deterministic spec compile로 넘어갈 수 없다는 뜻이다.",
        note: "Gold 의미와 risk weight는 L9 결정/승인이 있어야 고정된다.",
      },
    ],
    "product-health field classifiers": [
      {
        term: "_field_terms(field)",
        meaning: "source_path와 target_name 후보를 정규화해 token set을 만든다.",
        note: "문자열 포함만 보면 `customer_id` 안의 `id` 같은 과매칭이 생기므로 token 단위 비교를 쓴다.",
      },
      {
        term: "_product_key_fields(fields)",
        meaning: "product, asin, sku, item token이 있고 customer/order/user/review id는 제외한 field를 찾는다.",
        note: "product health grain이 잘못 잡히면 전체 Gold가 틀어지므로 제외 token이 중요하다.",
      },
      {
        term: "_rating_signal_fields(fields)",
        meaning: "integer/number 타입 중 rating, star, review_score 같은 이름을 가진 field를 찾는다.",
        note: "평점은 numeric이어야 average_rating이나 low_rating_score 계산 후보가 된다.",
      },
      {
        term: "_conversion_signal_fields(fields)",
        meaning: "conversion, purchase, order, session, click, impression, view, cart 같은 행동 signal 후보를 찾는다.",
        note: "분자와 분모가 함께 있어야 conversion_rate 후보가 된다.",
      },
      {
        term: "_delivery_signal_fields(fields)",
        meaning: "delivery, ship, late, arrival, eta 같은 배송 signal 후보를 찾는다.",
        note: "리뷰 텍스트에 shipping이라는 단어가 있다고 바로 배송 지연율을 확정하지 않는다. 실행 전 preview evidence가 필요하다.",
      },
    ],
  },
  L6: {
    "L4 build setup and Silver draft artifact": [
      {
        term: "ALLOWED_ACTIONS",
        meaning: "AI/model 추천이 사용할 수 있는 action vocabulary다. select, cast, mask, hash, quarantine, aggregate 등이 들어간다.",
        note: "허용 action을 제한해야 모델이 임의 코드를 만들거나 실행 불가능한 변환을 추천하지 못한다.",
      },
      {
        term: "silver_fields = [_silver_field_recommendation(...)]",
        meaning: "L3 field evidence마다 Silver column 처리 추천을 만든다.",
        note: "source_path, target_name, target_type, recommended_actions, exposure 정책이 여기서 초안으로 정해진다.",
      },
      {
        term: "risk_score_policy = _risk_score_policy_recommendation(...)",
        meaning: "source evidence에 맞는 risk_score 구성요소와 weight 정책을 추천한다.",
        note: "고정 formula가 아니라 available component를 보고 weight를 다시 정규화하는 정책 초안이다.",
      },
      {
        term: "derived_gold_options",
        meaning: "사용자가 선택할 수 있는 Gold option 목록이다. product health template과 gold-to-gold followup을 별도로 둔다.",
        note: "Gold를 무조건 만들지 않고 `deferred` 또는 `not_requested` 상태로 사용자 결정 가능하게 남긴다.",
      },
      {
        term: "silver_policy_recommendation_draft",
        meaning: "Silver cleaning/typing/exposure 정책 추천 초안 artifact다.",
        note: "draft_status가 `needs_user_decision`인 이유는 추천이지 최종 실행 계약이 아니기 때문이다.",
      },
    ],
    "_silver_field_recommendation()": [
      {
        term: "actions = [\"select\"]",
        meaning: "기본적으로 field를 Silver에 포함하는 select action부터 시작한다.",
        note: "drop은 별도 조건이 없으므로 현재 구현은 보수적으로 보존하고 후속 결정에서 제외할 수 있게 한다.",
      },
      {
        term: "if field[\"pii_candidate\"]: actions.append(\"mask\")",
        meaning: "PII 후보 field에는 mask action과 hidden/masked exposure 정책을 붙인다.",
        note: "PII 처리는 `pii_handling`만으로 숨기지 않고 catalog/query exposure를 별도로 명시한다.",
      },
      {
        term: "if inferred_type == \"timestamp\": parse_timestamp",
        meaning: "datetime_string으로 추론된 field에는 timestamp parsing action을 추천한다.",
        note: "시간 field가 제대로 타입화되어야 후속 Gold time_window나 freshness 판단이 가능하다.",
      },
      {
        term: "elif inferred_type in {\"integer\", \"number\", \"boolean\"}: cast",
        meaning: "문자열로 들어온 숫자/boolean 후보를 실제 타입으로 cast하도록 추천한다.",
        note: "CSV는 대부분 문자열로 들어오므로 Silver에서 타입 안정화가 필요하다.",
      },
      {
        term: "if field[\"nullable_ratio\"] > 0: normalize_null",
        meaning: "null이 관찰된 field에는 null 정규화 action을 추가한다.",
        note: "빈 문자열, null, missing을 어떻게 다룰지 명시해야 downstream SQL과 품질 gate가 일관된다.",
      },
    ],
  },
  L7: {
    "Gold model draft artifact": [
      {
        term: "gold_model_recommendation_draft",
        meaning: "사용자가 승인/보류/거절할 Gold model 후보 묶음이다.",
        note: "generic aggregate, product health template, risk policy, vector handoff reference를 한 곳에서 볼 수 있게 한다.",
      },
      {
        term: "\"template_refs\"",
        meaning: "product health template, risk_score policy, vector handoff template artifact_id를 연결한다.",
        note: "_ref는 artifact_id 문자열로 통일되어 L16 artifact_reference_manifest에서 resolve된다.",
      },
      {
        term: "\"draft_status\": \"needs_user_decision\"",
        meaning: "Gold 추천이 아직 실행 승인된 상태가 아니라는 표시다.",
        note: "Gold metric semantic은 도메인 owner 결정이 필요하므로 draft와 compile을 분리한다.",
      },
      {
        term: "\"gold_to_gold_followup\"",
        meaning: "Gold에서 다시 파생 Gold를 만드는 선택지다. 기본은 not_requested다.",
        note: "사용자가 명시적으로 요청하지 않으면 gold->gold를 추천만 하고 만들지 않는다.",
      },
    ],
    "generic Gold model recommendations": [
      {
        term: "dimensions = [field for ... identifier_or_dimension]",
        meaning: "group_by 후보가 될 dimension/id field를 찾는다.",
        note: "Gold aggregate의 grain을 잡는 기준이며, 의미가 애매하면 owner_review_required가 붙는다.",
      },
      {
        term: "measures = [field for ... measure_candidate]",
        meaning: "avg/sum/count 같은 measure 후보가 될 numeric field를 찾는다.",
        note: "숫자 field가 없으면 row_count summary처럼 더 단순한 Gold 후보로 내려간다.",
      },
      {
        term: "times = [field for ... time_candidate]",
        meaning: "time_window 후보가 될 timestamp/date field를 찾는다.",
        note: "시간 field가 있으면 window aggregate 가능성을 열어두지만 window 크기는 owner_selected로 남긴다.",
      },
      {
        term: "\"gold_dimension_metric_summary\"",
        meaning: "dimension과 measure가 모두 있을 때 만드는 일반 Gold aggregate 후보다.",
        note: "unknown data에서도 최소한 dimension별 count/avg 같은 요약은 제안할 수 있다.",
      },
      {
        term: "\"owner_review_required\": True",
        meaning: "Gold grain과 metric 의미는 사용자/owner 검토가 필요하다는 표시다.",
        note: "M3가 추천은 하지만 의미 확정과 실행 승인까지 자동으로 넘기지 않는다.",
      },
    ],
    "product health template and risk score policy": [
      {
        term: "_product_health_gold_template(...)",
        meaning: "발표용/업무용 product health Gold template 초안을 만든다.",
        note: "product_id, review_count, average_rating, negative_review_rate, conversion_rate, late_delivery_rate, risk_score 같은 metric 후보를 다룬다.",
      },
      {
        term: "\"formula_template\": \"negative_review_count / review_count\"",
        meaning: "negative_review_rate 계산식 템플릿이다.",
        note: "분모 review_count가 0이면 L7 risk policy의 zero denominator rule에 따라 null 처리해야 한다.",
      },
      {
        term: "\"status\": \"candidate\" if product_key ... else \"needs_source_evidence\"",
        meaning: "필수 source evidence가 있으면 candidate, 없으면 needs_source_evidence로 둔다.",
        note: "없는 conversion/delivery 값을 만들어내지 않기 위한 핵심 조건이다.",
      },
      {
        term: "\"compile_allowed_by_default\": False",
        meaning: "product health template은 기본적으로 compile되지 않는다.",
        note: "presentation template은 보일 수 있지만, L9 승인과 source evidence check 없이는 deterministic execution으로 넘기면 안 된다.",
      },
      {
        term: "\"blocked_runtime_claims\"",
        meaning: "M3가 claim하면 안 되는 runtime/semantic 주장을 명시한다.",
        note: "예: review-only data에서 conversion_rate나 late_delivery_rate를 발명하지 않는다.",
      },
    ],
    "risk score components and weights": [
      {
        term: "_risk_score_policy_recommendation(...)",
        meaning: "source evidence에 있는 component만 골라 risk_score 정책을 추천한다.",
        note: "사용자가 지적한 대로 risk_score를 고정식으로 박지 않고 데이터별 사용 가능 근거에 맞춰 추천한다.",
      },
      {
        term: "_risk_score_components(...)",
        meaning: "negative_review_rate, low_rating_score, low_conversion_score, late_delivery_rate component 후보를 만든다.",
        note: "각 component는 필요한 source_fields와 reason을 함께 가진다.",
      },
      {
        term: "_recommended_component_weights(components)",
        meaning: "기본 prior weight를 available component에 대해서만 다시 정규화한다.",
        note: "없는 component를 0점으로 넣지 않고 제외한다. 따라서 데이터마다 weight 합은 다시 1.0이 된다.",
      },
      {
        term: "\"max_single_component_weight\": 0.65",
        meaning: "한 component가 risk_score 대부분을 독점하지 못하게 하는 guardrail이다.",
        note: "source evidence가 적은 데이터에서 risk_score가 한 신호에 과도하게 의존하는 위험을 줄인다.",
      },
      {
        term: "\"zero_denominator_policy\"",
        meaning: "review/view/delivery count가 0일 때 각 rate와 risk_score를 어떻게 처리할지 명시한다.",
        note: "현재 정책은 conversion_rate는 view_count가 0이면 null, late_delivery_rate는 delivery_count가 0이면 null이다.",
      },
    ],
  },
  L8: {
    "vector handoff template": [
      {
        term: "_vector_embedding_handoff_template(fields, source_id, run_id)",
        meaning: "text/entity/metadata field 후보와 chunking/privacy 정책을 담은 vector handoff 초안을 만든다.",
        note: "M3가 embedding을 만들지는 않고 M6 또는 vector extension이 안전하게 실행할 수 있는 계약을 제공한다.",
      },
      {
        term: "text_candidates",
        meaning: "review/comment/description/title/text 같은 field 이름이나 text_candidate hint가 있는 비PII field 목록이다.",
        note: "검색 품질을 높이는 후보지만 PII 후보는 기본 제외된다.",
      },
      {
        term: "\"chunking_policy_template\"",
        meaning: "field_value_chunk, max_tokens 512, overlap_tokens 64, empty_text_action skip 같은 chunk 기준이다.",
        note: "실제 chunk 생성은 extension 책임이지만 M3가 권장 정책을 명시해 downstream 일관성을 높인다.",
      },
      {
        term: "\"embedding_job_allowed_by_default\": False",
        meaning: "embedding job을 기본 실행하지 않는다는 뜻이다.",
        note: "텍스트가 있다고 바로 vector index를 만들면 PII/비용/권한 문제가 생길 수 있어 승인 hook을 둔다.",
      },
      {
        term: "\"blocked_runtime_claims\"",
        meaning: "M3 core가 embedding build, vector index 운영, unapproved text exposure를 하지 않는다는 선언이다.",
        note: "vectorDB는 정확도 향상에 도움되지만 numeric Gold correctness를 증명하지는 않는다.",
      },
    ],
    "field matching and projection helpers": [
      {
        term: "_field_blob(field)",
        meaning: "source_path와 target_name 후보를 하나의 lowercase 문자열로 합친다.",
        note: "이 문자열을 token matching의 원재료로 사용한다.",
      },
      {
        term: "_field_terms(field)",
        meaning: "field blob에서 영숫자가 아닌 문자를 `_`로 바꾸고 token set을 만든다.",
        note: "camel/snake/dot path가 섞인 unknown data에서도 비교 가능한 형태로 만든다.",
      },
      {
        term: "_field_has_any_token(field, tokens)",
        meaning: "field token이나 normalized string이 특정 token을 포함하는지 검사한다.",
        note: "복합 token은 substring으로, 단일 token은 token set으로 비교해 과매칭을 줄인다.",
      },
      {
        term: "_field_has_any_hint(field, hints)",
        meaning: "L3 semantic_hints와 필요한 hint set이 겹치는지 확인한다.",
        note: "이름 token과 profile hint 두 경로를 같이 써서 field matching을 보강한다.",
      },
      {
        term: "_field_projection(field)",
        meaning: "field_id, source_path, target_name, inferred_type, semantic_hints, confidence만 추려 downstream에 넣는다.",
        note: "원본 예시값 대신 필요한 metadata만 전달하는 privacy/cost 절충이다.",
      },
    ],
  },
  L9: {
    "build_l5() decision artifacts": [
      {
        term: "VALID_GOLD_DECISIONS",
        meaning: "Gold 결정 상태로 허용되는 값 집합이다. not_requested, deferred, needs_owner_review, approved, rejected만 허용한다.",
        note: "상태 vocabulary를 고정해야 L9/L15 gate와 L16 catalog status가 모순 없이 이어진다.",
      },
      {
        term: "if gold_decision not in VALID_GOLD_DECISIONS: raise ValueError",
        meaning: "지원하지 않는 Gold decision이 들어오면 즉시 실패시킨다.",
        note: "잘못된 상태가 뒤 단계로 흘러가 catalog나 query context를 오염시키는 것을 막는다.",
      },
      {
        term: "silver_policy_decision",
        meaning: "Silver draft를 승인된 decision artifact로 고정한다.",
        note: "현재 preview path에서는 Silver를 기본 승인으로 두지만 review_id와 decision_trace_id를 남긴다.",
      },
      {
        term: "gold_models = ... if gold_decision == \"approved\" else []",
        meaning: "Gold가 approved일 때만 selected_gold_models를 실제 compile 대상으로 넘긴다.",
        note: "deferred/not_requested/rejected 상태에서는 draft는 남아도 실행 대상은 비워진다.",
      },
      {
        term: "gold_to_gold_policy_decision",
        meaning: "Gold에서 다시 파생 Gold를 만들지 여부를 별도 decision으로 둔다.",
        note: "사용자가 요청하지 않으면 기본 `not_requested`라서 gold->gold가 자동 실행되지 않는다.",
      },
    ],
    "approval state and diff": [
      {
        term: "approval_state",
        meaning: "Silver, Gold, Gold-to-Gold, product health template, risk policy, vector handoff의 승인 상태를 한 곳에 모은다.",
        note: "M5 workflow UI가 무엇을 실행/보류/검토해야 하는지 판단하는 중심 artifact다.",
      },
      {
        term: "\"compile_allowed\": gold_decision == \"approved\"",
        meaning: "Gold compile 가능 여부는 Gold decision이 approved인지로만 결정한다.",
        note: "추천이 존재한다는 사실과 실행 가능하다는 사실을 분리한다.",
      },
      {
        term: "\"product_health_gold_template\": {\"decision_status\": \"deferred\"}",
        meaning: "product health template은 보이지만 기본은 deferred다.",
        note: "발표용 template을 노출하되 실제 Gold execution은 사용자 승인 전까지 막는다.",
      },
      {
        term: "\"risk_score_policy\": {\"decision_status\": \"deferred\"}",
        meaning: "risk_score formula와 weight도 기본 보류 상태다.",
        note: "AI 추천 정책이므로 owner가 weight를 수정/승인해야 deterministic execution으로 갈 수 있다.",
      },
      {
        term: "recommendation_diff",
        meaning: "draft와 decision 사이의 변경 사항을 기록한다.",
        note: "승인하지 않은 Gold draft가 왜 compile에서 빠졌는지 trace하기 위한 문서다.",
      },
    ],
    "Gold decision reason helper": [
      {
        term: "_gold_decision_reason(decision)",
        meaning: "Gold decision status를 사람이 읽을 수 있는 reason 문자열로 바꾼다.",
        note: "UI/report/catalog에서 상태만 보여주면 왜 막혔는지 알기 어렵기 때문에 reason을 같이 둔다.",
      },
      {
        term: "decision == \"approved\"",
        meaning: "사용자가 Gold preview compile을 승인한 상태다.",
        note: "이 경우에만 L6 gold_generation_spec에 aggregate operations가 들어갈 수 있다.",
      },
      {
        term: "decision == \"not_requested\"",
        meaning: "사용자가 이 source에 대해 Gold layer를 요청하지 않은 상태다.",
        note: "Silver는 계속 ready일 수 있고, Gold만 not_requested로 남아야 한다.",
      },
      {
        term: "decision == \"deferred\"",
        meaning: "Gold 추천은 있지만 owner review나 product decision이 미뤄진 상태다.",
        note: "catalog에는 Gold template 후보를 보여줄 수 있지만 query-ready Gold로 노출하면 안 된다.",
      },
      {
        term: "return \"User rejected...\"",
        meaning: "approved/not_requested/deferred/needs_owner_review가 아닌 허용 상태는 rejected로 reason을 만든다.",
        note: "앞의 VALID_GOLD_DECISIONS 검증 때문에 실제로는 rejected에 해당하는 마지막 분기다.",
      },
    ],
  },
  L10: {
    "build_l6() Silver spec": [
      {
        term: "SUPPORTED_ACTIONS",
        meaning: "compiler가 deterministic preview spec으로 변환할 수 있는 action 목록이다.",
        note: "L6 추천 ALLOWED_ACTIONS와 비슷하지만 `needs_review`는 실행 action이 아니므로 빠져 있다.",
      },
      {
        term: "source_unit_ids = [unit[\"source_unit_id\"] for unit in l0[\"source_units\"]]",
        meaning: "L0 source_unit scope를 L10/L11 preview spec에 넘기기 위해 추출한다.",
        note: "preview_scope가 window_id 같은 legacy 값이 아니라 source_unit_ids 중심이 되게 한다.",
      },
      {
        term: "unsupported = _unsupported_actions(l5)",
        meaning: "L5 decision에 compiler가 실행할 수 없는 action이 남아 있는지 검사한다.",
        note: "지원하지 않는 action은 L12 validation에서 block 처리된다.",
      },
      {
        term: "\"write_mode\": \"preview_only\"",
        meaning: "Silver spec이 production write가 아니라 preview 실행만 허용한다는 뜻이다.",
        note: "M3는 실제 production write를 만들지 않고, M2가 preview/local/Spark 실행을 맡는다.",
      },
      {
        term: "\"blocked_runtime_features\"",
        meaning: "per_row_ai_call, generated_code_execution, unbounded_collect, production_write를 금지한다.",
        note: "이 목록은 빅데이터 안전성과 M3 scope boundary를 동시에 지키는 compiler guardrail이다.",
      },
    ],
    "Silver operation compiler": [
      {
        term: "_silver_operations(fields)",
        meaning: "Silver decision field 목록을 deterministic operation list로 변환한다.",
        note: "첫 operation은 select_silver_fields이고, 이후 field별 cast/mask/normalize action이 붙는다.",
      },
      {
        term: "\"columns\": [field[\"source_path\"] ...]",
        meaning: "drop이 아닌 source field만 선택 대상으로 넣는다.",
        note: "원본 source_path를 기준으로 select한 뒤 rename/cast 등 후속 변환을 적용하는 구조다.",
      },
      {
        term: "_operation_for_action(field, action)",
        meaning: "추천 action 하나를 compiler operation object로 바꾼다.",
        note: "action별 params schema가 달라서 rename, cast, mask/hash, json/flatten/null 처리로 분기한다.",
      },
      {
        term: "\"input_ref\": \"silver_working\"",
        meaning: "select 이후 작업 중인 Silver 중간 결과를 가리키는 내부 참조 이름이다.",
        note: "artifact_id `_ref`가 아니라 operation graph 내부 alias이므로 v2.1.1 `_ref` 규칙과 충돌하지 않는다.",
      },
      {
        term: "params = {\"pii_handling\", \"catalog_exposure\", \"query_context_exposure\"}",
        meaning: "mask/hash 작업에는 PII 처리와 catalog/query 노출 정책을 함께 넣는다.",
        note: "값을 가리는 것과 catalog에서 숨기는 것은 다른 문제라 둘 다 명시해야 한다.",
      },
    ],
  },
  L11: {
    "Gold generation spec": [
      {
        term: "gold_spec = with_header(... name=\"gold_generation_spec\")",
        meaning: "Gold preview를 만들 수 있는 deterministic generation spec artifact다.",
        note: "Gold가 승인되지 않은 경우에도 request_state와 빈 operations로 상태를 공식 기록한다.",
      },
      {
        term: "\"request_state\": l5[\"gold_decision\"][\"decision_status\"]",
        meaning: "Gold가 approved, deferred, not_requested 등 어떤 상태인지 spec에 직접 적는다.",
        note: "Gold not_requested/deferred 상태도 L9/L10/L16에서 공식적으로 이어져야 하므로 spec에 남긴다.",
      },
      {
        term: "\"input_ref\": artifact_ref(\"l7\", \"silver_preview\", ...)",
        meaning: "Gold는 Silver preview를 입력으로 삼는다는 계약이다.",
        note: "raw나 Bronze에서 바로 Gold로 뛰지 않고 Silver 품질/노출 정책을 통과한 결과 위에 Gold를 쌓는다.",
      },
      {
        term: "\"operations\": gold_operations",
        meaning: "Gold가 approved이면 aggregate operation 목록이 들어가고, 아니면 빈 배열이다.",
        note: "추천 draft가 있어도 승인 전에는 실행 operation이 만들어지지 않는다.",
      },
      {
        term: "\"write_mode\": \"preview_only\"",
        meaning: "Gold도 Silver와 마찬가지로 preview 실행만 허용한다.",
        note: "production write나 catalog publish는 M3가 직접 수행하지 않는다.",
      },
    ],
    "Gold aggregate operation compiler": [
      {
        term: "_gold_operations(models)",
        meaning: "승인된 Gold model을 aggregate operation list로 바꾼다.",
        note: "현재 compiler는 aggregate 중심이며 product health의 복잡한 metric은 승인/grounding 후 확장될 수 있다.",
      },
      {
        term: "\"operation_id\": f\"aggregate_{model['gold_model_id']}\"",
        meaning: "Gold model별 aggregate operation id를 만든다.",
        note: "operation_id가 있어야 preview graph와 report에서 어떤 Gold 작업이 실패했는지 추적할 수 있다.",
      },
      {
        term: "\"group_by\": model[\"grain\"]",
        meaning: "Gold table의 grain/dimension을 group_by로 넘긴다.",
        note: "grain이 틀리면 Gold 의미 전체가 틀어지므로 L9 owner approval이 필요하다.",
      },
      {
        term: "\"measures\": model[\"measures\"]",
        meaning: "count, avg 같은 aggregate measure 정의를 넘긴다.",
        note: "M2 Spark 실행은 이 선언형 measures를 실제 aggregation으로 바꿔야 한다.",
      },
      {
        term: "\"cardinality_guard\": {\"max_groups\": 100000, \"on_exceed\": \"block_preview\"}",
        meaning: "group 수가 너무 커지면 preview를 막는 안전장치다.",
        note: "unknown big data에서 group_by가 사실상 row-level key이면 비용과 결과 크기가 폭발할 수 있다.",
      },
    ],
  },
  L12: {
    "compiler validation artifacts": [
      {
        term: "layered_transform_graph",
        meaning: "논리 L0~L16 layer와 physical l0~l10 artifact folder를 연결해 보여주는 graph artifact다.",
        note: "문서상 L번호와 실제 폴더 번호가 달라도 downstream이 혼동하지 않게 한다.",
      },
      {
        term: "unsupported_action_report",
        meaning: "compiler가 실행할 수 없는 action 목록을 별도 artifact로 만든다.",
        note: "실패 원인을 validation_result 안에만 숨기지 않고 사용자가 수정할 수 있는 report로 분리한다.",
      },
      {
        term: "_compiler_validation(...)",
        meaning: "Silver/Gold spec이 안전한 preview contract인지 check list로 검증한다.",
        note: "AI 호출, generated code, unbounded collect, preview_only, unsupported action, legacy window_id를 검사한다.",
      },
      {
        term: "\"overall_status\": \"block\" if any(...)",
        meaning: "하나라도 block check가 있으면 전체 compiler validation을 block으로 만든다.",
        note: "warn과 block을 섞지 않고 block은 downstream preview를 막는 강한 신호로 둔다.",
      },
      {
        term: "\"compiler_validation_result\"",
        meaning: "M2/M5가 spec 실행 가능 여부를 판단할 핵심 artifact다.",
        note: "M3가 직접 Spark를 돌리지 않아도 spec이 안전한지 전달할 수 있다.",
      },
    ],
    "unsupported and validation helpers": [
      {
        term: "_unsupported_actions(l5)",
        meaning: "Silver decision에 `needs_review`나 SUPPORTED_ACTIONS 밖 action이 있는지 찾는다.",
        note: "지원하지 않는 action을 무시하지 않고 blocked_reason과 safe_alternative를 함께 제공한다.",
      },
      {
        term: "\"recommended_owner_action\": \"Resolve in L9 decision UI.\"",
        meaning: "사용자가 decision UI에서 action을 고치거나 승인 범위를 조정해야 한다는 안내다.",
        note: "compiler가 임의로 대체 실행하면 사용자 의사와 데이터 의미가 틀어질 수 있다.",
      },
      {
        term: "\"preview_only_write_mode\" check",
        meaning: "Silver와 Gold spec 모두 write_mode가 preview_only인지 확인한다.",
        note: "M3 계약에서 production write가 섞이는 순간 역할 경계가 깨지므로 block 대상이다.",
      },
      {
        term: "_contains_legacy_window_id(value)",
        meaning: "preview_scope 내부에 금지된 legacy `window_id` key가 남아 있는지 재귀적으로 검사한다.",
        note: "v2.1.1에서는 `source_unit_ids[]`와 `stream_window_ids[]` 조합만 core schema로 허용한다.",
      },
      {
        term: "\"unbounded_collect\" check",
        meaning: "Gold aggregate에 cardinality_guard가 있고 spec이 preview_only인지 근거로 pass를 준다.",
        note: "대용량에서 collect-all 패턴은 위험하므로 compiler validation에서 명시적으로 막는다.",
      },
    ],
  },
  L13: {
    "build_l7() Silver preview evidence": [
      {
        term: "def build_l7(l5, l6, out_dir, source_id, run_id)",
        meaning: "Silver preview 실행 결과를 M3가 직접 만들지 않고, preview validation 계약과 품질 축을 만든다.",
        note: "M2가 실제 Spark/local execution을 수행하고, M3는 spec과 imported metrics를 검증하는 역할이다.",
      },
      {
        term: "pii_fields = [field for field in fields if field[\"pii_handling\"] != \"none\"]",
        meaning: "PII 처리 대상 field를 모은다.",
        note: "catalog safety와 query exposure 판단에 필요한 숫자와 목록을 만든다.",
      },
      {
        term: "compiler_status = l6[\"compiler_validation\"][\"overall_status\"]",
        meaning: "L12 compiler validation 결과를 Silver preview 구조 품질 판단의 입력으로 쓴다.",
        note: "compiler가 block이면 preview validation도 block이다.",
      },
      {
        term: "silver_preview_ref",
        meaning: "Silver preview output이 M2 실행 대상이라는 참조 artifact다.",
        note: "`execution_status`가 `not_executed_by_m3`라서 M3가 실행 엔진이 아님을 명시한다.",
      },
      {
        term: "silver_quality_axis",
        meaning: "Silver 처리 품질을 L15 gate에서 쓰기 쉽게 axis artifact로 만든다.",
        note: "L15는 이 axis와 catalog_safety를 결합해 M6 silver_context_status를 결정한다.",
      },
      {
        term: "silver_quarantine_report",
        meaning: "quarantine 필요 여부와 lane 정보를 기록하는 artifact다.",
        note: "현재 M3 자체 실행에서는 full row quarantine count를 만들지 않고 M2 preview evidence가 들어오면 반영한다.",
      },
    ],
  },
  L14: {
    "build_l8() Gold readiness evidence": [
      {
        term: "gold_status = l5[\"gold_decision\"][\"decision_status\"]",
        meaning: "사용자의 Gold 결정 상태를 읽는다.",
        note: "Gold readiness는 Silver readiness와 분리되어야 하므로 이 값을 별도 축으로 다룬다.",
      },
      {
        term: "approved = gold_status == \"approved\"",
        meaning: "Gold가 실제 preview compile 대상으로 갈 수 있는지 판단하는 boolean이다.",
        note: "approved가 아니면 metric_definitions는 빈 배열이고 execution_status도 not_requested_or_deferred가 된다.",
      },
      {
        term: "metric_definitions = _metric_definitions(selected_models) if approved else []",
        meaning: "승인된 Gold model이 있을 때만 metric definition draft를 만든다.",
        note: "Gold draft가 존재한다는 이유만으로 M6 query metric을 노출하지 않는다.",
      },
      {
        term: "gold_readiness_input_report",
        meaning: "Gold requested 여부, metric definition ref, semantic candidate status, caveat를 한 곳에 모은다.",
        note: "L15 gold_readiness_axis의 직접 입력이다.",
      },
      {
        term: "gold_preview_validation_result",
        meaning: "Gold preview 상태를 pass/not_requested/deferred/warn으로 정리한다.",
        note: "Gold가 not_requested/deferred여도 artifact를 만들어 nullable ref 충돌을 없앤다.",
      },
    ],
    "Gold metric and caveat helpers": [
      {
        term: "_metric_definitions(models)",
        meaning: "승인된 Gold model의 measure를 metric_id, operation, field, grain, semantic_status로 펼친다.",
        note: "M6가 metric 이름과 operation을 이해하는 최소 구조다.",
      },
      {
        term: "\"semantic_status\": \"needs_owner_review\" if ...",
        meaning: "owner review가 필요한 Gold model이면 metric semantic도 needs_owner_review로 표시한다.",
        note: "숫자 계산이 가능해도 의미가 승인되지 않았으면 trusted query exposure는 caveat가 필요하다.",
      },
      {
        term: "_semantic_status_candidate(status, metrics)",
        meaning: "Gold decision과 metric 존재 여부로 readiness 후보 상태를 계산한다.",
        note: "not_requested, deferred, rejected, approved 상태가 L15로 자연스럽게 이어지게 한다.",
      },
      {
        term: "_gold_caveats(status, metrics)",
        meaning: "Gold 상태에 따라 query/catalog에 표시할 caveat 목록을 만든다.",
        note: "Silver-only 사용 가능성과 Gold 미준비 상태를 사용자에게 분리해서 보여준다.",
      },
      {
        term: "return [\"Gold layer deferred by owner decision.\"]",
        meaning: "deferred 상태의 공식 caveat다.",
        note: "Gold가 보류되어도 Silver context를 block하지 않는 v2.1.1 precedence와 연결된다.",
      },
    ],
  },
  L15: {
    "build_l9() three-axis gate": [
      {
        term: "processing_status = _processing_status(l7)",
        meaning: "Silver compiler/preview validation 기준의 처리 품질 상태를 계산한다.",
        note: "Silver readiness는 이 processing_quality와 catalog_safety로만 결정된다.",
      },
      {
        term: "catalog_status = _catalog_status(l7)",
        meaning: "PII/query exposure 기준의 catalog 안전 상태를 계산한다.",
        note: "PII field가 있으면 warn, forbidden exposure가 무처리로 남으면 block이 된다.",
      },
      {
        term: "gold_status = _gold_axis_status(l8)",
        meaning: "Gold readiness 상태를 별도 축으로 계산한다.",
        note: "Gold가 block/deferred라도 Silver status를 오염시키지 않는 것이 핵심 rule이다.",
      },
      {
        term: "_m6_context(processing_status, catalog_status, gold_status, ...)",
        meaning: "M6가 사용할 silver_context_status와 gold_context_status를 계산한다.",
        note: "Silver와 Gold context가 분리되어 Silver-only 질의 가능성을 보존한다.",
      },
      {
        term: "\"safe_to_run_silver\" / \"safe_to_run_gold\"",
        meaning: "각 context가 ready 또는 ready_with_caveat인지에 따라 실행/노출 가능 여부를 boolean으로 제공한다.",
        note: "M5/M6가 axis를 직접 해석하지 않아도 간단히 gate 결과를 볼 수 있다.",
      },
    ],
    "axis and M6 context helpers": [
      {
        term: "_processing_status(l7)",
        meaning: "L7 validation status가 block이면 block, 아니면 pass로 본다.",
        note: "현재 구현은 processing warn 세분화보다 compiler block 여부를 강하게 본다.",
      },
      {
        term: "_catalog_status(l7)",
        meaning: "PII field와 forbidden query field를 보고 pass/warn/block을 정한다.",
        note: "PII가 있으면 무조건 block이 아니라 mask/hidden 정책이 있으면 warn 수준으로 catalog caveat를 남긴다.",
      },
      {
        term: "_gold_axis_status(l8)",
        meaning: "L8 semantic_status_candidate를 allowed state로 정규화한다.",
        note: "알 수 없는 값은 warn으로 낮춰 downstream이 낙관적으로 해석하지 못하게 한다.",
      },
      {
        term: "if not gold_requested ... return silver, \"not_requested\"",
        meaning: "Gold가 요청되지 않았으면 Silver status는 그대로 두고 Gold context만 not_requested로 둔다.",
        note: "이 규칙이 Gold 미요청 상태가 Silver catalog/query를 막지 않게 만든다.",
      },
      {
        term: "_required_caveats(*axes)",
        meaning: "processing, catalog, gold axis caveat를 gate_summary에 모은다.",
        note: "M6 query context와 L16 catalog가 사용자에게 보여줄 caveat의 단일 출처가 된다.",
      },
    ],
  },
  L16: {
    "build_l10() handoff package": [
      {
        term: "def build_l10(... profile, l5, l6, l8, l9)",
        meaning: "이전 layer 산출물을 묶어 M5 Catalog와 M6 query context가 소비할 최종 handoff package를 만든다.",
        note: "M3의 최종 책임은 실행 결과 저장이 아니라 schema/spec/catalog/query context 계약을 정확히 넘기는 것이다.",
      },
      {
        term: "m6_context_status = l9[\"gate_summary\"][\"m6_context_status\"]",
        meaning: "L15 gate가 만든 silver/gold context 상태를 L16 최종 산출물 top-level로 가져온다.",
        note: "catalog_sync_contract_package와 sql_context_pack의 m6_context_status가 반드시 일치해야 한다.",
      },
      {
        term: "allowed_columns = _allowed_columns(l5)",
        meaning: "Silver decision 중 query exposure가 forbidden이 아닌 column만 뽑는다.",
        note: "M6가 SQL context에서 사용할 수 있는 column allowlist다.",
      },
      {
        term: "metrics = ... if gold_context_status in {\"ready\", \"ready_with_caveat\"} else []",
        meaning: "Gold context가 준비된 경우에만 metric definition을 query context로 보낸다.",
        note: "Gold가 deferred/not_requested면 Gold metric은 숨기고 Silver schema만 전달한다.",
      },
      {
        term: "exports/transform_spec.json, schema_definition.json, workflow_definition.json, catalog_metadata.json",
        meaning: "다른 M이 바로 가져가기 쉬운 export contract 묶음이다.",
        note: "내부 artifact와 외부 handoff contract를 분리해 M1/M5/M6 연결성을 높인다.",
      },
    ],
    "catalog metadata and SQL context": [
      {
        term: "_allowed_columns(l5)",
        meaning: "query_context_exposure가 forbidden인 field를 제외하고 SQL 허용 column을 만든다.",
        note: "catalog에 field가 있어도 M6 query context에서 쓰면 안 되는 field는 여기서 빠진다.",
      },
      {
        term: "_catalog_metadata(...)",
        meaning: "dataset id/name, source format, layer status, quality axis, semantic template ref, caveat를 묶는다.",
        note: "M5 catalog 저장과 M1/M6 화면 표시의 기초 metadata다.",
      },
      {
        term: "\"publish_decision\"",
        meaning: "silver_context_status가 ready 계열인지에 따라 catalog public allowed 여부를 정한다.",
        note: "Gold가 준비되지 않아도 Silver가 ready면 Silver catalog는 publish 가능할 수 있다.",
      },
      {
        term: "_sql_context(...)",
        meaning: "M6가 SQL/query routing에 사용할 allowed_tables, allowed_columns, metrics, caveats를 만든다.",
        note: "Gold metrics는 gold_context_status가 ready일 때만 들어간다.",
      },
      {
        term: "\"semantic_template_refs\"",
        meaning: "product health template과 vector handoff template artifact_id를 SQL context에 연결한다.",
        note: "M6가 자연어 질문에서 관련 template을 찾을 수 있지만, status/caveat를 함께 확인해야 한다.",
      },
    ],
    "semantic vector template and sync package": [
      {
        term: "_semantic_catalog_vector_index_template(...)",
        meaning: "dataset card, product health template, schema field, metric definition을 vector 검색 document로 바꿀 계획이다.",
        note: "이건 raw data embedding이 아니라 catalog/schema/metric metadata retrieval을 위한 template이다.",
      },
      {
        term: "\"recommended_search_policy\"",
        meaning: "먼저 dataset_id/access_class/query_context_exposure로 filter하고 그 다음 vector search를 하라는 정책이다.",
        note: "vector similarity보다 접근 제어와 context status가 먼저 적용되어야 한다.",
      },
      {
        term: "\"accuracy_boundary\"",
        meaning: "vector index가 좋아지는 부분과 좋아지지 않는 부분을 분리해서 적는다.",
        note: "검색 정확도는 좋아질 수 있지만 Gold numeric correctness는 deterministic transform과 validation이 필요하다.",
      },
      {
        term: "_catalog_sync_package(...)",
        meaning: "M5 catalog sync가 필요한 version set, refs, quality axis refs, m6_context_status를 묶는다.",
        note: "최종 전달 시 ref resolver와 status 일관성을 확인하는 중심 package다.",
      },
      {
        term: "\"refs\"",
        meaning: "L0부터 L16까지 주요 artifact_id를 한 객체에 모은다.",
        note: "다른 M은 파일 경로를 추측하지 않고 artifact_reference_manifest를 통해 이 ref들을 resolve해야 한다.",
      },
    ],
    "artifact manifest and exports": [
      {
        term: "_artifact_reference_manifest(out_dir, source_id, run_id)",
        meaning: "out_dir 아래 생성된 artifact 파일을 스캔해 artifact_id, logical path, physical URI, checksum, byte_size를 만든다.",
        note: "v2.1.1의 `_ref` 문자열 통일 규칙을 실제 파일 위치로 resolve하는 핵심 manifest다.",
      },
      {
        term: "path.read_text(encoding=\"utf-8\")",
        meaning: "JSON artifact를 UTF-8로 읽어 artifact_header를 추출한다.",
        note: "읽을 수 없는 binary/non-UTF 파일은 artifact로 등록하지 않는다.",
      },
      {
        term: "\"physical_uri\": path.resolve().as_uri()",
        meaning: "로컬 파일 경로를 file URI로 바꿔 저장한다.",
        note: "로컬 테스트 환경에서는 file URI가 resolve 가능한 물리 위치 역할을 한다. MinIO/S3에서는 M2/M5가 별도 URI를 채워야 한다.",
      },
      {
        term: "export_transform_spec(...)",
        meaning: "M5가 workflow/runner로 넘길 수 있는 TransformSpec 형태를 만든다.",
        note: "M3는 Spark session을 만들지 않는다는 ownership_constraints를 함께 넣는다.",
      },
      {
        term: "export_schema_definition(...)",
        meaning: "M1/M5/M6가 이해할 SchemaDefinition contract를 만든다.",
        note: "nullable, array, override, missing_ratio, transform_hints가 포함되어 unknown data schema를 UI와 query context에 전달한다.",
      },
      {
        term: "export_workflow_definition(...)",
        meaning: "Source -> Select/Filter -> Normalize -> optional Aggregate -> Load 흐름을 workflow graph로 만든다.",
        note: "실제 runner 선택과 실행은 M5/M2 책임으로 남기고 M3는 graph contract만 넘긴다.",
      },
      {
        term: "export_catalog_metadata(...)",
        meaning: "M1/M6가 사용할 외부 CatalogMetadata contract를 만든다.",
        note: "dataset layer, schema, metrics, lineage, query allowed_columns, m3_contract_refs를 포함한다.",
      },
    ],
  },
};
