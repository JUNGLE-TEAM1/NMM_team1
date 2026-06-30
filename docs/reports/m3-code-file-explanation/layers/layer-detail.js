(function () {
  const match = document.title.match(/^L(\d+)/);
  if (!match || !window.M3_LAYER_SOURCE_SNIPPETS) return;

  const layerId = `L${match[1]}`;
  const snippets = window.M3_LAYER_SOURCE_SNIPPETS[layerId] || [];
  const directPlain = improvedLayerPlainMap();
  const directEasyDetail = directLayerEasyDetailMap();
  const directExamples = improvedLayerExamplesMap();
  const plainSummary = directPlain[layerId] || window.M3_LAYER_PLAIN?.[layerId] || {};
  const layerAnalysis = normalizeLayerAnalysis(window.M3_LAYER_ANALYSIS?.[layerId] || {}, plainSummary);
  const easyDetail = directEasyDetail[layerId] || {};
  const layerExample = directExamples[layerId] || {};
  if (!snippets.length || document.getElementById("source-code-side-by-side")) return;

  const lineSection = Array.from(document.querySelectorAll("section")).find((section) =>
    Array.from(section.querySelectorAll("th")).some((th) => th.textContent.trim() === "Line")
  );
  if (!lineSection) return;

  const section = document.createElement("section");
  section.id = "source-code-side-by-side";

  const heading = document.createElement("h2");
  heading.textContent = "\uC6D0\uBB38 \uCF54\uB4DC + \uD310\uB2E8 \uADFC\uAC70";

  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent =
    "\uC774 \uD654\uBA74\uC740 \uC124\uBA85\uC744 \uC228\uAE30\uC9C0 \uC54A\uACE0, \uBA3C\uC800 \uC774 L\uB2E8\uACC4\uC758 \uC120\uD0DD \uC774\uC720\uC640 \uC7A5\uB2E8\uC810\uC744 \uC2A4\uCE94\uD55C \uB4A4 \uC544\uB798\uC5D0\uC11C \uC2E4\uC81C \uC6D0\uBB38 \uCF54\uB4DC\uB97C \uD655\uC778\uD558\uB294 \uAD6C\uC870\uB2E4.";

  const artifactSummary = readArtifactSummary();
  const plainBoard = buildPlainLanguageBoard(layerId, plainSummary, easyDetail, layerExample, artifactSummary);
  const summaryBoard = buildSummaryBoard(layerId, layerAnalysis, artifactSummary, snippets.length);
  const overview = buildLayerOverview(layerAnalysis);
  const grid = document.createElement("div");
  grid.className = "source-pair-grid";

  snippets.forEach((snippet) => {
    const pair = document.createElement("article");
    pair.className = "source-pair";

    const codePanel = document.createElement("div");
    codePanel.className = "source-code-panel";

    const codeTitle = document.createElement("b");
    codeTitle.textContent = snippet.title;

    const meta = document.createElement("div");
    meta.className = "source-code-meta";
    meta.textContent = `${snippet.path} - lines ${snippet.lines}`;

    const pre = document.createElement("pre");
    pre.className = "source-code";

    const code = document.createElement("code");
    code.textContent = snippet.code;
    pre.appendChild(code);
    codePanel.append(codeTitle, meta, pre);

    const explain = document.createElement("div");
    explain.className = "source-explain-panel";

    const explainTitle = document.createElement("b");
    explainTitle.textContent = "\uD575\uC2EC \uC124\uBA85";

    const improvedSnippet = getImprovedSnippetBrief(layerId, snippet.title);
    const paragraph = document.createElement("p");
    paragraph.textContent = improvedSnippet?.summary || snippet.explanation;
    explain.append(explainTitle, paragraph);

    const snippetPoints = improvedSnippet?.points || snippet.points;
    if (snippetPoints && snippetPoints.length) {
      const ul = document.createElement("ul");
      snippetPoints.forEach((point) => {
        const li = document.createElement("li");
        li.textContent = point;
        ul.appendChild(li);
      });
      explain.appendChild(ul);
    }

    const detail = { ...(layerAnalysis.snippets?.[snippet.title] || {}), ...(improvedSnippet?.evidence || {}) };
    const evidenceRows = [
      ["\uC120\uD0DD \uC774\uC720", detail.why],
      ["\uAE30\uB2A5", detail.function],
      ["\uD6A8\uACFC", detail.effect],
      ["\uC8FC\uC758\uC810", detail.limit],
    ].filter(([, value]) => value);
    if (evidenceRows.length) {
      const evidence = document.createElement("div");
      evidence.className = "snippet-evidence";
      evidenceRows.forEach(([label, value]) => appendEvidenceRow(evidence, label, value));
      explain.appendChild(evidence);
    }

    const glossaryRows = getCodeGlossary(layerId, snippet.title);
    let glossary = null;
    if (glossaryRows.length) {
      glossary = document.createElement("div");
      glossary.className = "term-glossary";
      const glossaryTitle = document.createElement("strong");
      glossaryTitle.textContent = "\uCF54\uB4DC \uAE30\uD638 / \uD30C\uB77C\uBBF8\uD130 / \uC120\uD0DD \uC774\uC720";
      glossary.appendChild(glossaryTitle);
      glossaryRows.forEach((row) => appendTermRow(glossary, row.term, row.meaning, row.note));
    }

    const lineWalkthrough = buildLineWalkthrough(layerId, snippet, plainSummary);
    const contractTerms = buildContractTermBoard(layerId, snippet.title);

    const codeColumn = document.createElement("div");
    codeColumn.className = "source-code-column";
    codeColumn.appendChild(codePanel);
    if (contractTerms) codeColumn.appendChild(contractTerms);
    codeColumn.appendChild(lineWalkthrough);

    const explainColumn = document.createElement("div");
    explainColumn.className = "source-explain-column";
    explainColumn.appendChild(explain);
    if (glossary) explainColumn.appendChild(glossary);

    pair.append(codeColumn, explainColumn);
    grid.appendChild(pair);
  });

  section.append(heading, lead);
  if (plainBoard) section.appendChild(plainBoard);
  section.appendChild(grid);
  if (summaryBoard) section.appendChild(summaryBoard);
  if (overview) section.appendChild(overview);
  lineSection.insertAdjacentElement("beforebegin", section);
  enhanceLayerStepLinks(layerId);
  injectLineExplanationShortcut(section);
  if (window.location.hash === "#source-code-side-by-side") {
    requestAnimationFrame(() => {
      window.scrollTo({ top: Math.max(section.offsetTop - 76, 0), behavior: "auto" });
    });
  }

  function readArtifactSummary() {
    const table = document.querySelector(".content-grid section:nth-child(2) table");
    if (!table) return {};
    const summary = {};
    Array.from(table.querySelectorAll("tr")).forEach((row) => {
      const cells = Array.from(row.children).map((cell) => cell.textContent.trim().replace(/\s+/g, " "));
      if (cells.length < 2) return;
      if (cells[0].includes("\uCF54\uB4DC")) summary.code = cells[1];
      if (cells[0].includes("\uC8FC\uC694")) summary.outputs = cells[1];
      if (cells[0].includes("\uB2E4\uC74C")) summary.next = cells[1];
    });
    return summary;
  }

  function improvedLayerPlainMap() {
    return {
      L0: {
        simpleTitle: "원본을 건드리지 않고 다시 찾을 수 있게 만든다",
        oneLine:
          "L0는 CSV인지 JSON인지 맞히는 단계가 아니다. 원본 파일이 어디에 있고, 어떤 실행에서 관찰됐고, 나중에 같은 원본을 다시 가리키려면 어떤 식별자가 필요한지를 고정하는 시작점이다.",
        easyMeaning:
          "실제 상황으로 보면 사용자가 `F:\\ai\\nyc-taxi-data-20gb` 같은 폴더나 MinIO 경로를 등록한다. M3는 그 파일을 복사하거나 고치지 않고, 파일마다 `object_id`라는 물리 원본 이름을 부여하고, 처리 범위마다 `source_unit_id`라는 작업 단위 이름을 부여한다. `path`는 지금 이 컴퓨터에서 파일을 여는 길이고, `uri`는 로컬 파일인지 MinIO/S3 객체인지까지 드러내는 주소다. 그래서 노트북, Docker Spark, MinIO가 섞이면 `path`만으로는 부족하고 `uri`, `checksum`, `etag`, `byte_size`가 함께 있어야 같은 원본을 다시 확인할 수 있다.",
        why:
          "M3는 원본 저장소의 주인이 아니고, raw payload를 마음대로 복제하는 실행 엔진도 아니다. 대신 뒤 단계에서 오류가 났을 때 '어느 파일의 어느 범위를 보고 만든 결과인지' 되돌아갈 수 있는 신분증을 만든다. 여기서 `source_unit_id`와 `object_id`가 흔들리면 L1 샘플, L2 profile, Silver/Gold spec, M6 catalog 설명이 서로 다른 원본을 말하게 된다. L0가 단단해야 대용량에서도 일부만 샘플링하고 전체 실행은 M2에 맡기는 구조가 성립한다.",
        inputs: ["사용자가 등록한 파일/폴더/객체 경로", "source_id", "run_id", "checksum_mode와 checksum_bytes"],
        outputs: ["object_stream_manifest.json", "source_manifest.json", "raw_replay_pointer.json"],
        next:
          "L1은 이 manifest를 보고 제한된 Bronze 샘플을 만든다. M2는 나중에 같은 `source_unit_id + object_id + locator` 조합으로 실제 대용량 구간을 다시 읽는다.",
        watch:
          "`8 * 1024 * 1024`는 기본적으로 앞쪽 8MiB만 checksum 계산에 쓰겠다는 뜻이다. 1024 byte가 1KiB이고, 1024KiB가 1MiB라서 8MiB가 된다. 전체 파일 checksum은 더 정확하지만 100GB급 파일에서 느릴 수 있으므로 prefix checksum은 속도와 추적성 사이의 절충안이다.",
        steps: [
          ["원본 목록 확정", "폴더 안 파일을 안정된 순서로 읽어 같은 실행 조건이면 같은 object 순서가 나오게 한다."],
          ["두 종류의 이름 부여", "`object_id`는 물리 파일, `source_unit_id`는 처리 범위를 뜻한다. 지금은 대개 1:1이지만 stream이나 hybrid window에서는 달라질 수 있다."],
          ["다시 찾을 증거 작성", "`uri`, `path`, `checksum`, `etag`, `byte_size`, 수정 시각을 manifest에 남겨 L1 이후 단계가 원본 위치를 추측하지 않게 한다."],
        ],
      },
      L1: {
        simpleTitle: "원본 일부를 Bronze 봉투로 관찰한다",
        oneLine:
          "L1은 대용량 전체를 처리하지 않는다. 원본에서 정해진 row/byte 한도 안의 일부를 읽고, 그 일부가 원본의 어느 위치에서 왔는지까지 함께 남긴다.",
        easyMeaning:
          "사용자가 알 수 없는 CSV/JSON/JSONL을 등록하면 처음부터 전체 100GB를 AI나 Python이 훑으면 안 된다. L1은 `max_rows`, `max_bytes` 한도 안에서 줄 단위로 일부만 읽고, 읽은 줄마다 `record_locator`를 만든다. 이 locator에는 `object_id`, `line_number`, `byte_start`, `byte_end`처럼 원본으로 돌아가기 위한 좌표가 들어간다. 줄을 읽지 못하거나 형식이 깨진 경우도 조용히 사라지지 않고 rescue lane으로 분리된다.",
        why:
          "Bronze envelope의 핵심은 payload 자체보다 lineage다. 나중에 Silver에서 어떤 값이 이상하다고 나오면, 사람이 그 row가 원본 어느 파일의 어느 byte 근처였는지 확인할 수 있어야 한다. 또한 L1 샘플은 profile과 추천을 위한 control-plane 자료일 뿐 전체 데이터 실행 결과라고 말하면 안 된다. 전체 Bronze materialization은 M2가 Spark로 맡아야 한다.",
        inputs: ["L0 object/source manifest", "max_rows", "max_bytes", "source_id와 run_id"],
        outputs: ["bronze_envelope_samples.jsonl", "rescue_lane.jsonl", "bronze_envelope_spec.json"],
        next:
          "L2는 Bronze 샘플을 보고 형식과 필드 모양을 계산한다. M2는 같은 locator 규칙을 이용해 더 큰 구간 또는 전체 구간을 Spark에서 처리할 수 있다.",
        watch:
          "샘플이 작으면 빠르지만 희귀 컬럼이나 뒤쪽 drift를 못 볼 수 있다. 샘플이 너무 크면 M3가 실행 엔진처럼 변한다. 그래서 L1은 제한된 샘플, 위치 추적, 실패 보존이라는 세 가지를 동시에 지켜야 한다.",
        steps: [
          ["한도 안에서 읽기", "row 수와 byte 수가 기준을 넘으면 바로 멈춰서 M3가 raw 전체를 끌고 오지 않게 한다."],
          ["원본 좌표 기록", "각 record에 line/byte 좌표를 남겨 preview 결과와 원본을 연결한다."],
          ["깨진 줄 보존", "parse 실패나 이상 record는 삭제하지 않고 rescue lane으로 보내 원인 분석 근거로 남긴다."],
        ],
      },
      L2: {
        simpleTitle: "낯선 파일의 모양을 숫자로 읽는다",
        oneLine:
          "L2는 데이터를 이해했다고 주장하지 않는다. CSV인지 JSONL인지, 어떤 필드가 있고, null이 얼마나 많고, 타입이 어떻게 보이는지 profile snapshot으로 정리한다.",
        easyMeaning:
          "예를 들어 Amazon review와 taxi CSV가 섞여 들어오면 사람이 먼저 스키마를 모를 수 있다. L2는 샘플을 기준으로 delimiter, header, JSON path, field name, type 분포, null 비율, 예시값, PII 의심 여부를 계산한다. 이 결과는 정답 스키마가 아니라 'AI와 사람이 판단할 때 볼 근거 자료'다. 여기서 `schema_fingerprint`를 만들면 다음 실행에서 구조가 바뀌었는지도 비교할 수 있다.",
        why:
          "unknown data에서 바로 Silver/Gold를 추천하면 환각이 생긴다. profile이 있어야 'rating처럼 보이는 값이 실제로 숫자인지', 'review text 후보가 문자열인지', 'delivery 관련 컬럼이 있는지'를 근거로 말할 수 있다. 대용량에서는 모든 row를 AI에게 보낼 수 없으므로 L2 같은 deterministic profile이 AI 앞단의 필터 역할을 한다.",
        inputs: ["L1 Bronze sample", "L0 source scope", "format_hint"],
        outputs: ["format_detection.json", "profile_snapshot.json", "{format}_profile.json", "schema_fingerprint.json"],
        next:
          "L3은 L2 profile에서 AI가 봐도 되는 축약 evidence만 골라낸다. L4~L7 추천은 이 profile의 수치와 field evidence를 근거로 삼는다.",
        watch:
          "샘플 기반 profile은 희귀한 뒤쪽 컬럼을 놓칠 수 있다. 그래서 `parser_stats`, `confidence`, `schema_fingerprint`, `source_unit_ids`를 같이 남겨 이후 Spark 검증이나 drift 감지에서 보완한다.",
        steps: [
          ["형식 후보 계산", "CSV/JSON/JSONL/기타 텍스트 중 어떤 해석이 가장 그럴듯한지 evidence와 confidence로 표현한다."],
          ["필드 통계 작성", "각 field의 타입 후보, null 비율, 예시값, PII 힌트를 계산한다."],
          ["구조 지문 생성", "field 이름과 타입 요약을 hash로 고정해 다음 run과 비교할 수 있게 한다."],
        ],
      },
      L3: {
        simpleTitle: "AI가 봐도 되는 판단 근거만 남긴다",
        oneLine:
          "L3는 raw row를 AI에게 던지는 단계가 아니다. L2 profile을 줄이고 가려서 AI 추천용 evidence pack으로 바꾸는 안전 장치다.",
        easyMeaning:
          "실시간 또는 대용량 데이터에서 모든 row를 AI 모델에 보낸다고 말하면 설계가 틀어진다. L3는 컬럼명, 타입 추정, null 비율, 짧은 예시, semantic hint처럼 추천에 필요한 근거만 남긴다. 이메일, 전화번호, 이름처럼 민감해 보이는 값은 `[REDACTED_PII]`로 바꾸거나 redaction map에 이유를 남긴다. 동시에 `row_level_ai_calls: 0`과 `blocked_ai_inputs`를 기록해 AI가 data-plane에 끼지 않는다는 경계를 문서화한다.",
        why:
          "AI는 Silver/Gold 추천을 돕는 control-plane이어야 한다. raw stream을 계속 모델에 보내면 비용, 지연, 개인정보, 재현성 문제가 동시에 터진다. L3 evidence pack은 모델이 판단할 수 있을 만큼 충분하지만 원본을 재구성하기에는 제한된 형태여야 한다.",
        inputs: ["L2 profile_snapshot", "field summaries", "data_shape_contract"],
        outputs: ["ai_recommendation_input_pack.json", "field_evidence_reducer.json", "redaction_map.json", "unknown_data_recommendation_pack.json"],
        next:
          "L4와 L5는 이 evidence를 근거로 template 후보와 grounding 여부를 본다. L6/L7은 같은 evidence를 이용해 Silver/Gold draft를 만든다.",
        watch:
          "값 예시를 너무 많이 남기면 privacy와 비용 문제가 생기고, 너무 적게 남기면 추천 품질이 떨어진다. field별 예시 수, 총 문자 수, PII 처리 방식이 명확해야 한다.",
        steps: [
          ["추천 근거 축약", "필드마다 타입, null 비율, 짧은 예시, semantic hint만 남겨 모델 입력을 작게 만든다."],
          ["민감값 보호", "PII 후보는 예시값을 숨기고 숨긴 이유를 redaction map으로 설명한다."],
          ["AI 금지선 기록", "raw 전체, row별 realtime 호출, unredacted rescue lane은 모델 입력에서 제외한다고 명시한다."],
        ],
      },
      L4: {
        simpleTitle: "profile과 catalog 설명으로 쓸 만한 template 후보를 찾는다",
        oneLine:
          "L4는 '이 데이터로 무엇을 만들 수 있을지' 후보를 찾는 단계다. 정답을 확정하지 않고 metadata/profile 기반 검색과 template 후보만 만든다.",
        easyMeaning:
          "낯선 데이터가 들어오면 처음부터 product health Gold만 고집하면 안 된다. L4는 field evidence와 catalog metadata 설명을 검색 가능한 문서처럼 정리하고, review/product/conversion/delivery/vector handoff 같은 후보 template을 찾아낸다. 여기서 vectorDB를 쓴다면 raw text가 아니라 schema, profile, catalog 설명을 색인하는 쪽이 맞다. 그래야 비슷한 데이터 구조를 찾되 원본 개인정보나 대용량 row를 인덱스에 밀어 넣지 않는다.",
        why:
          "unknown data 일반 추천과 발표용 product health 추천을 동시에 만족하려면 후보 탐색과 확정 단계를 나눠야 한다. L4는 후보를 넓게 찾고, L5 이후에서 실제 필드 근거가 있는지 좁힌다. 이 분리가 있어야 AI가 '없는 metric을 있는 것처럼' 말하는 일을 줄일 수 있다.",
        inputs: ["L3 AI-safe evidence", "L2 profile 요약", "template 후보 정의"],
        outputs: ["metadata_retrieval_index_plan.json", "gold_template_candidate_retrieval.json"],
        next:
          "L5는 L4가 찾은 후보가 실제 field evidence와 맞는지 확인한다. 근거가 약한 후보는 missing evidence나 deferred로 내려간다.",
        watch:
          "검색 점수는 근거가 아니라 후보 신호다. product_id 비슷한 컬럼이 있다는 것만으로 conversion_rate나 late_delivery_rate를 만들 수 있다고 단정하면 안 된다.",
        steps: [
          ["검색 문서 구성", "field/profile/catalog 설명을 template 검색에 적합한 작은 문서 단위로 정리한다."],
          ["후보 template 탐색", "product health, generic aggregate, vector handoff 같은 후보를 찾아 이유를 남긴다."],
          ["부족한 근거 표시", "필수 field가 보이지 않는 후보는 다음 단계에서 검증해야 할 missing evidence로 넘긴다."],
        ],
      },
      L5: {
        simpleTitle: "후보가 실제 데이터 근거를 갖는지 확인한다",
        oneLine:
          "L5는 L4 후보를 검문한다. product_id, rating, review text, view, purchase, delivery 같은 근거가 실제 profile에 있는지 확인한다.",
        easyMeaning:
          "product health Gold를 만들려면 최소한 product 단위로 묶을 key와 지표 근거가 있어야 한다. L5는 field 이름과 semantic hint를 대조해 product 후보, review 후보, rating 후보, conversion 후보, delivery 후보를 분리한다. Amazon review에는 rating과 review text는 있을 수 있지만 view_count나 delivery_count는 없을 수 있다. 이런 경우 L5는 억지 계산을 만들지 않고 '이 metric은 근거 부족'이라고 표시한다.",
        why:
          "발표용 Gold가 그럴듯해 보여도 근거 없는 컬럼을 만들면 M6와 M1이 잘못된 의미를 믿게 된다. L5는 AI 추천과 deterministic spec 사이의 현실성 검사다. 특히 risk_score는 component 근거가 있어야 하며, 없는 component는 가중치에서 제외하거나 보류해야 한다.",
        inputs: ["L4 template candidates", "L3 field evidence", "L2 type/null profile"],
        outputs: ["candidate_grounding_report.json", "product_health_grounding.json"],
        next:
          "L6은 검증된 field evidence를 사용해 Silver 추천서를 작성한다. L7은 Gold metric과 risk_score 후보를 만들 때 L5의 available/missing evidence를 따른다.",
        watch:
          "비슷한 이름만으로 확정하면 위험하다. `score`가 rating인지 risk_score인지, `count`가 review_count인지 view_count인지 구분해야 한다.",
        steps: [
          ["entity key 확인", "product_id, asin, sku처럼 group_by의 기준이 될 수 있는 field를 찾는다."],
          ["metric 근거 확인", "rating, review text, view, purchase, delivery 관련 field가 실제로 있는지 분류한다."],
          ["없는 값 차단", "근거 없는 지표는 missing_evidence로 남겨 L7이 계산식에 끌고 가지 못하게 한다."],
        ],
      },
      L6: {
        simpleTitle: "Bronze를 Silver로 정제하는 추천서를 만든다",
        oneLine:
          "L6는 원본을 직접 변환하지 않는다. 어떤 컬럼을 살리고, 어떤 이름과 타입으로 바꾸고, 어떤 값은 감추거나 격리할지 추천서로 작성한다.",
        easyMeaning:
          "Silver는 질의와 Gold 계산의 바닥이다. L6는 field마다 target name, target type, nullable 비율, recommended action, PII 처리, catalog 노출 여부, query context 노출 여부를 정리한다. 예를 들어 `reviewText`는 `review_text`로 표준화하고, 숫자처럼 보이는 rating은 numeric cast 후보가 된다. 이메일처럼 보이는 field는 query에서 금지하거나 catalog에서 숨기는 정책을 제안한다.",
        why:
          "M3가 Spark 실행을 직접 책임지지는 않지만, M2가 실행할 수 있는 수준의 규칙은 줘야 한다. L6 추천서가 구체적이어야 사용자가 수정할 수 있고, 승인 후 L10에서 deterministic spec으로 변환할 수 있다. 반대로 L6가 흐리면 Silver 품질이 흔들리고 Gold metric도 전부 불안정해진다.",
        inputs: ["L3 evidence pack", "L5 grounding result", "L2 profile"],
        outputs: ["silver_recommendation_draft.json", "cleaning_policy_recommendation.json"],
        next:
          "L9에서 사용자가 승인하거나 수정한다. 승인된 Silver draft만 L10에서 Spark용 transform spec으로 바뀐다.",
        watch:
          "`pii_handling`은 값 자체 처리이고, `catalog_exposure`와 `query_context_exposure`는 보여줄지 여부다. 이 둘을 섞으면 M6 질의 안전성이 깨진다.",
        steps: [
          ["살릴 field 선택", "profile과 grounding 결과를 보고 Silver에 필요한 field와 버릴 field를 구분한다."],
          ["이름과 타입 표준화", "source path를 읽기 쉬운 target name으로 바꾸고 cast/parse/normalize 후보를 붙인다."],
          ["노출 정책 결정", "PII 후보와 query 금지 후보를 catalog/query exposure로 분리해 표시한다."],
        ],
      },
      L7: {
        simpleTitle: "Silver 위에서 가능한 Gold와 risk 계산 방식을 추천한다",
        oneLine:
          "L7는 Gold를 무조건 만들지 않는다. 만들 수 있는 Gold 모델, 필요한 metric, risk_score component와 weight 후보를 근거와 함께 제안한다.",
        easyMeaning:
          "product health Gold가 가능하면 L7는 `product_id`, `product_name`, `category_l1`, `review_count`, `average_rating`, `negative_review_rate`, `view_count`, `purchase_count`, `conversion_rate`, `delivery_count`, `late_delivery_rate`, `risk_score` 같은 최소 schema 후보를 제시한다. 다만 모든 데이터에 이 컬럼이 있는 것은 아니다. conversion 근거가 없으면 conversion_rate를 계산하지 않거나 caveat를 남기고, delivery 근거가 없으면 late_delivery_rate를 보류한다. `risk_score`도 고정식이 아니라 실제로 관찰된 component만 사용하고, 빠진 component가 있을 때 weight를 재정규화할지 정책으로 밝힌다.",
        why:
          "Gold는 발표와 M6 질의에서 가장 눈에 띄는 결과지만, 가장 쉽게 과장될 수 있는 부분이다. L7가 metric 정의, zero denominator 규칙, missing evidence, caveat를 명시해야 '그럴듯한 가짜 Gold'를 피할 수 있다. 사용자는 여기서 Gold를 만들지, 나중에 할지, 일부 metric만 쓸지 선택할 수 있어야 한다.",
        inputs: ["L5 grounding result", "L6 Silver draft", "Gold template 후보"],
        outputs: ["gold_model_recommendation_draft.json", "product_health_gold_template_draft.json", "risk_score_policy_recommendation_draft.json"],
        next:
          "L9에서 사용자가 Gold 생성 여부와 수정 내용을 승인한다. 승인된 Gold만 L11에서 aggregate/project/risk_score spec으로 바뀐다.",
        watch:
          "denominator가 0일 때 conversion_rate를 0으로 둘지 null로 둘지 명확해야 한다. 이 규칙이 없으면 같은 Gold라도 팀마다 다르게 계산한다.",
        steps: [
          ["Gold grain 결정", "product 단위, category 단위, time window 단위 중 어떤 묶음이 의미 있는지 추천한다."],
          ["metric 정의", "각 metric의 분자, 분모, source field, null/zero 규칙, caveat를 문서화한다."],
          ["risk 정책 추천", "부정 리뷰율, 낮은 평점, 낮은 전환율, 배송 지연율 중 실제 근거가 있는 component만 조합한다."],
        ],
      },
      L8: {
        simpleTitle: "의미 검색과 vector handoff에 필요한 후보를 정리한다",
        oneLine:
          "L8는 embedding을 직접 만들지 않는다. 어떤 텍스트와 metadata가 나중에 vectorDB나 semantic search에 적합한지 handoff template으로 정리한다.",
        easyMeaning:
          "review text, product title, description처럼 긴 텍스트 field는 나중에 의미 검색에 쓸 수 있다. L8는 text 후보, entity key, category/rating/date 같은 filter metadata, redaction 필요 여부를 분리한다. raw 전체를 vectorDB에 밀어 넣는 대신, 어떤 field를 어떤 단위로 chunk하거나 연결할지 template만 제공한다. 이렇게 해야 M6나 extension 쪽 AI가 catalog/schema를 보고 관련 Gold나 query context를 더 정확히 찾을 수 있다.",
        why:
          "schema/profile/catalog metadata를 vectorDB에 넣는 것은 추천 정확도를 높일 수 있지만, M3 core가 embedding 생성기나 retrieval runtime이 되면 범위가 커진다. L8은 core와 extension의 경계를 지킨다. M3는 '무엇을 넘길지'를 계약으로 정하고, 실제 embedding/index 생성은 후속 책임으로 둔다.",
        inputs: ["L3 field evidence", "L4 retrieval 후보", "L7 Gold 후보"],
        outputs: ["vector_embedding_handoff_template.json", "semantic_projection_candidates.json"],
        next:
          "L16은 L8 template을 semantic catalog/vector index package에 포함한다. M6나 extension은 이 package를 보고 검색 context를 구성한다.",
        watch:
          "entity key 없이 텍스트만 넘기면 검색 결과를 product나 Gold metric과 연결하기 어렵다. 반대로 민감 텍스트를 그대로 넘기면 보안 문제가 생긴다.",
        steps: [
          ["텍스트 후보 선정", "review, title, description처럼 embedding 후보가 될 수 있는 field를 고른다."],
          ["연결 key 확인", "product_id나 entity_id처럼 검색 결과를 dataset row와 연결할 key를 확인한다."],
          ["filter metadata 분리", "category, rating, time 같은 검색 필터 후보를 별도로 정리한다."],
        ],
      },
      L9: {
        simpleTitle: "추천을 사용자가 승인 가능한 상태로 고정한다",
        oneLine:
          "L9는 M3가 마음대로 실행 결정을 내리지 못하게 하는 단계다. Silver와 Gold 추천을 사용자가 승인, 수정, 보류, 거절한 상태로 분명히 남긴다.",
        easyMeaning:
          "L6와 L7은 draft다. draft가 바로 Spark 작업이 되면 사용자가 모르는 정제나 Gold가 생긴다. L9는 `approval_state.json`에 Silver decision과 Gold decision을 분리해 기록한다. Silver는 승인됐지만 Gold는 `not_requested`일 수 있고, Gold-to-Gold는 사용자가 만들겠다고 선택한 경우에만 다음 단계로 넘어간다.",
        why:
          "M3의 역할은 추천과 계약 생성이지, 사용자의 domain 판단을 대체하는 것이 아니다. 특히 product health나 risk_score는 발표에서 중요한 의미를 갖기 때문에 승인 trace가 필요하다. L9가 있으면 M2/M5는 '이 spec이 사용자 승인을 받은 것인지'를 명확히 확인할 수 있다.",
        inputs: ["L6 Silver draft", "L7 Gold draft", "사용자 또는 테스트 AI의 선택"],
        outputs: ["approval_state.json", "silver_policy_decision.json", "gold_policy_decision.json"],
        next:
          "L10은 승인된 Silver만 compiler로 넘긴다. L11은 승인된 Gold만 generation spec으로 넘긴다.",
        watch:
          "`not_requested`, `deferred`, `needs_owner_review`, `approved`, `rejected`를 실패와 섞으면 안 된다. 보류는 실패가 아니라 아직 실행하지 않는 공식 상태다.",
        steps: [
          ["Silver 결정 기록", "정제 추천을 그대로 승인했는지, 수정했는지, 거절했는지 남긴다."],
          ["Gold 결정 기록", "Gold 생성 여부와 보류 이유를 Silver와 독립적으로 남긴다."],
          ["trace 보존", "나중에 metric/risk 정책을 설명할 수 있도록 선택 이유와 변경 사항을 남긴다."],
        ],
      },
      L10: {
        simpleTitle: "승인된 Silver 추천을 실행 가능한 작업 목록으로 번역한다",
        oneLine:
          "L10은 사람이 승인한 Silver 정제 정책을 M2가 실행할 수 있는 deterministic transform spec으로 바꾼다.",
        easyMeaning:
          "L6 추천서에는 사람이 읽는 설명과 후보가 많다. L10은 그중 승인된 내용만 골라 `select`, `cast`, `normalize`, `parse_timestamp`, `mask/hash`, `quarantine` 같은 operation으로 정리한다. 각 operation은 `input_ref`, `output_ref`, params schema를 가져야 하고, 어떤 source_unit 범위에 적용되는지도 명확해야 한다. 이렇게 만들어야 5GB preview든 100GB 검증이든 같은 규칙을 M2 Spark가 반복 실행할 수 있다.",
        why:
          "추천서와 실행 spec은 다르다. 추천서는 사람이 고치는 문서이고, spec은 runner가 읽는 계약이다. L10이 구체적이지 않으면 M2가 임의 해석을 하게 되고, M5 workflow 저장도 흐려진다.",
        inputs: ["L9 approval_state", "L6 Silver recommendation", "L0 source scope"],
        outputs: ["silver_transform_spec.json", "silver_operations.json"],
        next:
          "L12가 이 spec의 문법과 지원 범위를 검증한다. 통과한 spec만 preview evidence와 handoff package로 이어진다.",
        watch:
          "M3 core에서 production write를 허용하면 안 된다. preview spec은 `write_mode=preview_only`가 원칙이고, 실제 운영 write는 M2/M5 실행 계약에서 다뤄야 한다.",
        steps: [
          ["승인 범위 확인", "Silver decision이 실행 가능한 상태인지 먼저 확인한다."],
          ["operation 작성", "선택, 타입 변환, 정규화, 마스킹, 격리 같은 작업을 순서 있는 목록으로 만든다."],
          ["참조 연결", "각 작업의 입력과 출력을 artifact id 기준으로 연결해 DAG가 끊기지 않게 한다."],
        ],
      },
      L11: {
        simpleTitle: "승인된 Gold 추천을 집계와 metric 생성 규칙으로 번역한다",
        oneLine:
          "L11은 Gold를 직접 계산하지 않는다. M2가 Silver에서 Gold를 만들 때 따라야 할 group_by, measures, time_window, risk_score 규칙을 spec으로 만든다.",
        easyMeaning:
          "product health Gold를 승인했다면 L11은 product 단위로 묶을 key, 표시할 dimensions, 계산할 measures, zero denominator 규칙, cardinality guard를 정리한다. 예를 들어 `review_count`는 count, `average_rating`은 avg, `negative_review_rate`는 negative review count / review_count 같은 식으로 표현될 수 있다. conversion이나 delivery 근거가 없으면 그 metric은 제외하거나 caveat가 붙는다. risk_score는 L7에서 승인된 component와 weight 정책을 참조한다.",
        why:
          "Gold는 누가 만들어야 하느냐는 질문의 답이 여기서 정리된다. 실제 Spark 실행은 M2지만, 어떤 Gold를 어떻게 만들지는 M3 계약이 제공해야 한다. L11이 없으면 Gold 생성 책임이 M2, M5, M6 사이에서 떠다닌다.",
        inputs: ["L9 Gold decision", "L7 Gold draft", "L10 Silver output contract"],
        outputs: ["gold_generation_spec.json", "gold_operations.json"],
        next:
          "L12가 Gold spec 지원 여부를 검증하고, L14가 metric 근거와 readiness를 판단한다.",
        watch:
          "group_by가 너무 촘촘하면 Gold가 raw와 비슷한 크기가 되어 의미 요약이 약해진다. 반대로 너무 거칠면 product별 건강도 같은 목적을 잃는다.",
        steps: [
          ["Gold 승인 확인", "approved 상태인 Gold 모델만 spec으로 전환한다."],
          ["집계 구조 작성", "group_by, dimensions, measures, time_window, cardinality guard를 명시한다."],
          ["metric 안전 규칙 연결", "zero denominator, missing evidence, risk component 정책을 spec에 반영한다."],
        ],
      },
      L12: {
        simpleTitle: "Silver/Gold spec이 실제로 넘길 수 있는 계약인지 검사한다",
        oneLine:
          "L12는 compiler validation 단계다. 지원하지 않는 operation, 잘못된 artifact 참조, 금지된 write mode 같은 문제를 pass/warn/block으로 분리한다.",
        easyMeaning:
          "L10/L11에서 spec이 만들어졌다고 바로 M2에 넘기면 안 된다. L12는 operation type이 allowlist에 있는지, params schema가 맞는지, `*_ref`가 실제 artifact id 규칙을 따르는지 확인한다. stream runtime, watermark, production write, unstructured retrieval처럼 core 범위를 벗어나는 내용은 extension hook으로만 남긴다. 검증 결과는 `compiler_validation_result`와 `unsupported_action_report`로 분리된다.",
        why:
          "M3가 만든 계약이 M2에서 실패하면 전체 pipeline 신뢰도가 떨어진다. L12는 실행 전 마지막 문법 검사이자 범위 검사다. 특히 preview_only 원칙을 지키지 못하면 로컬 테스트와 운영 책임이 섞인다.",
        inputs: ["L10 silver spec", "L11 gold spec", "operation allowlist와 params schema"],
        outputs: ["compiler_validation_result.json", "unsupported_action_report.json", "layered_transform_graph.json"],
        next:
          "L13과 L14는 validation 결과를 근거로 preview 품질과 Gold readiness를 판단한다.",
        watch:
          "`warn`은 설명 가능한 caveat이고, `block`은 downstream으로 넘기면 안 되는 상태다. 둘을 섞으면 품질 gate가 의미를 잃는다.",
        steps: [
          ["operation 검증", "지원되는 작업명과 params 구조인지 확인한다."],
          ["artifact 참조 검증", "`*_ref`가 경로가 아니라 artifact_id 문자열인지 확인한다."],
          ["결과 등급화", "문제가 없으면 pass, 주의가 필요하면 warn, 실행하면 안 되면 block으로 남긴다."],
        ],
      },
      L13: {
        simpleTitle: "Silver가 질의와 catalog에 안전한지 확인한다",
        oneLine:
          "L13은 Silver context의 안전성을 본다. PII 노출, query 금지 컬럼, compiler 상태, schema 상태를 근거로 quality axis를 만든다.",
        easyMeaning:
          "Silver는 M6가 질의할 수 있는 바탕이 될 수 있다. 그래서 L13은 target column 중 민감정보 후보가 query에 열려 있지 않은지, catalog에는 보여도 되는지, compiler validation이 block인지 warn인지 확인한다. catalog에 보이는 것과 query에서 읽을 수 있는 것은 다르다. 예를 들어 컬럼 이름은 catalog에 보이되 실제 값 질의는 금지할 수 있다.",
        why:
          "Gold가 없어도 Silver가 안전하면 M6는 기본 질의를 할 수 있어야 한다. 반대로 Silver 노출 정책이 약하면 Gold가 좋아도 query context를 열면 안 된다. L13은 Silver readiness를 Gold readiness와 분리하는 첫 번째 근거다.",
        inputs: ["L10 Silver spec", "L12 validation result", "L6 exposure policy"],
        outputs: ["silver_preview_evidence.json", "pii_exposure_report.json", "quality_axis.json"],
        next:
          "L15는 L13의 processing_quality와 catalog_safety를 Silver context 판단에 사용한다.",
        watch:
          "`catalog_exposure=hidden`과 `query_context_exposure=forbidden`을 구분해야 한다. 숨김과 질의 금지는 같은 말이 아니다.",
        steps: [
          ["민감정보 확인", "PII 후보와 secret 후보가 노출 정책에 맞게 막혔는지 본다."],
          ["query 허용 범위 계산", "M6가 읽어도 되는 table/column 후보와 caveat를 정리한다."],
          ["Silver 축 작성", "processing quality와 catalog safety 판단 근거를 axis로 만든다."],
        ],
      },
      L14: {
        simpleTitle: "Gold가 요청된 상태와 metric 근거를 따로 확인한다",
        oneLine:
          "L14는 Gold readiness를 판단한다. Gold가 요청되지 않았는지, 보류됐는지, 승인됐는지, metric 근거가 충분한지 분리해서 기록한다.",
        easyMeaning:
          "사용자가 Gold를 아직 원하지 않을 수 있다. 이 경우 `not_requested`는 실패가 아니다. Gold를 승인했더라도 metric별 required evidence가 부족하면 `ready_with_caveat`, `warn`, `block` 같은 상태가 필요하다. 예를 들어 delivery field가 없으면 late_delivery_rate는 만들 수 없고, view_count가 0이면 conversion_rate의 denominator 규칙을 따라야 한다.",
        why:
          "Gold 문제로 Silver를 오염시키면 안 된다. Silver는 준비됐지만 Gold는 보류일 수 있고, Gold는 준비됐지만 일부 metric에 caveat가 붙을 수 있다. L14는 이 상태를 분리해 L15의 3축 gate가 정확히 판단하게 만든다.",
        inputs: ["L11 Gold spec", "L9 Gold decision", "L7 metric/risk draft"],
        outputs: ["gold_preview_evidence.json", "gold_readiness_axis.json", "metric_caveats.json"],
        next:
          "L15는 Gold readiness를 Silver readiness와 별도 축으로 합친다. L16은 Gold 상태를 catalog layer status와 M6 context status에 반영한다.",
        watch:
          "metric 근거가 없는데 0으로 채우는 것은 보통 잘못이다. zero denominator와 missing evidence는 다른 문제다.",
        steps: [
          ["Gold 요청 상태 확인", "not_requested, deferred, approved, rejected 상태를 명확히 분리한다."],
          ["metric 근거 검토", "각 metric의 source field와 계산 가능성을 확인한다."],
          ["caveat 작성", "부족한 지표, denominator 규칙, 해석 주의사항을 남긴다."],
        ],
      },
      L15: {
        simpleTitle: "Silver 안전성, catalog 안전성, Gold 준비도를 따로 판정한다",
        oneLine:
          "L15는 한 줄짜리 합격표가 아니다. processing quality, catalog safety, gold readiness라는 세 축을 따로 보고 최종 gate summary를 만든다.",
        easyMeaning:
          "실제 발표나 M6 질의에서는 '전체 성공/실패'보다 어떤 부분이 준비됐는지가 중요하다. L15는 Silver 처리가 괜찮은지, catalog/query 노출이 안전한지, Gold가 준비됐는지를 독립적으로 계산한다. Gold가 block이어도 Silver가 pass면 Silver context는 ready일 수 있다. 이 precedence rule 덕분에 product health Gold가 보류돼도 기본 Silver catalog는 사용할 수 있다.",
        why:
          "Gold readiness가 Silver status를 더럽히면 팀 전체가 막힌 것처럼 보인다. 반대로 Silver가 위험한데 Gold만 보고 통과시키면 M6 질의가 위험해진다. L15는 각 축의 책임을 분리해 M1/M5/M6가 필요한 부분만 정확히 소비하게 한다.",
        inputs: ["L13 Silver evidence", "L14 Gold evidence", "L9 approval_state"],
        outputs: ["gate_summary.json", "processing_quality_axis.json", "catalog_safety_axis.json", "gold_readiness_axis.json"],
        next:
          "L16은 gate summary의 `m6_context_status`를 최종 handoff package에 그대로 반영한다.",
        watch:
          "L15와 L16의 `m6_context_status`가 다르면 block이어야 한다. gate와 package가 다른 말을 하면 downstream은 무엇을 믿어야 할지 모른다.",
        steps: [
          ["Silver 축 계산", "processing_quality와 catalog_safety로 Silver context ready 여부를 정한다."],
          ["Gold 축 계산", "Gold 요청/승인/metric 근거를 별도 readiness로 정리한다."],
          ["M6 상태 요약", "Silver와 Gold context를 M6가 어떻게 사용할 수 있는지 한 구조로 요약한다."],
        ],
      },
      L16: {
        simpleTitle: "다른 M이 읽을 최종 계약 묶음을 만든다",
        oneLine:
          "L16은 M3 결과를 마무리하는 handoff 단계다. catalog package, SQL context, vector template, transform spec export, artifact reference manifest를 한 묶음으로 정리한다.",
        easyMeaning:
          "여기서 M3는 실제 catalog DB에 쓰거나 SQL 서버를 띄우지 않는다. 대신 M5가 저장할 catalog sync package, M6가 질의 context로 읽을 SQL context pack, vectorDB extension이 참고할 semantic template, M2가 실행할 transform spec export를 정리한다. `*_ref`는 물리 경로가 아니라 artifact id 문자열이고, 실제 파일 위치와 checksum은 `artifact_reference_manifest`가 해결한다. 그래서 폴더 위치가 바뀌어도 artifact id 기준으로 다시 찾을 수 있다.",
        why:
          "좋은 추천서와 spec도 다른 M이 읽지 못하면 팀 전체 흐름에서는 실패다. L16은 M3의 경계를 지키면서도 M1/M2/M5/M6가 각자 필요한 파일을 찾게 만든다. 이 단계에서 source lineage, catalog status, M6 context status, semantic handoff가 서로 모순되면 최종 산출물이 신뢰를 잃는다.",
        inputs: ["L15 gate_summary", "L10/L11 specs", "L13/L14 evidence", "L8 vector template"],
        outputs: ["catalog_sync_contract_package.json", "sql_context_pack.json", "semantic_catalog_vector_index_template.json", "artifact_reference_manifest.json", "exports/*"],
        next:
          "M5는 package를 저장/동기화하고, M6는 SQL/vector context를 질의에 사용하고, M2는 transform spec을 실제 Spark 작업으로 실행한다.",
        watch:
          "M3 산출물 안에 운영 실행 결과나 production storage ownership을 섞으면 안 된다. 로컬 Spark/MinIO 검증은 M3 계약이 현실적인지 확인하기 위한 테스트 환경이다.",
        steps: [
          ["최종 상태 정렬", "L15 gate summary와 package의 M6 context status가 같은지 확인한다."],
          ["소비자별 묶음 작성", "M2, M5, M6, M1이 각자 읽을 계약 파일을 분리해 정리한다."],
          ["artifact 위치표 작성", "artifact_id를 physical_uri, checksum, byte_size와 연결해 참조를 추적 가능하게 만든다."],
        ],
      },
    };
  }

  function improvedLayerExamplesMap() {
    return {
      L0: {
        title: "예시로 보면",
        situation: "택시 CSV 폴더와 Amazon review JSONL이 같은 run에 등록돼도, L0는 내용 분석보다 먼저 원본 식별과 재현성을 잡는다.",
        action: ["파일마다 object_id를 안정적으로 만든다.", "로컬 path와 실행 환경 독립적인 uri를 같이 남긴다.", "checksum/etag/byte_size로 원본 버전을 확인할 근거를 만든다."],
        result: ["나중에 Spark가 다른 환경에서 실행돼도 같은 원본을 다시 찾을 수 있다.", "raw를 복제하지 않아도 lineage가 유지된다."],
        userCheck: ["source_id/run_id가 원하는 데이터 묶음을 가리키는지 본다.", "path만 있고 uri가 비어 있거나 checksum 정책이 너무 약하지 않은지 본다."],
      },
      L1: {
        title: "예시로 보면",
        situation: "100GB 전체를 읽지 않고 앞부분 샘플만 보더라도, 각 샘플 row가 어느 파일의 어느 위치였는지는 남아야 한다.",
        action: ["row/byte 한도 안에서 일부 record만 읽는다.", "record_locator로 line과 byte 범위를 기록한다.", "깨진 줄은 rescue lane에 남긴다."],
        result: ["L2 profile을 만들 만큼의 관찰 자료가 생긴다.", "오류 row를 원본에서 다시 찾을 수 있다."],
        userCheck: ["샘플 한도가 너무 작아 중요한 컬럼을 놓치지 않는지 본다.", "rescue lane이 비어 있는지, 아니면 parse 문제가 있는지 확인한다."],
      },
      L2: {
        title: "예시로 보면",
        situation: "Amazon review는 JSONL처럼 보이고 taxi는 CSV처럼 보일 수 있다. L2는 이 차이를 감으로 말하지 않고 수치와 evidence로 남긴다.",
        action: ["format detection과 confidence를 계산한다.", "field별 타입, null 비율, 예시값, PII 힌트를 만든다.", "schema_fingerprint로 구조 지문을 만든다."],
        result: ["AI 추천 전 단계에서 볼 수 있는 객관적 profile이 생긴다.", "다음 실행에서 schema drift 여부를 비교할 수 있다."],
        userCheck: ["detected_format과 실제 파일 감각이 맞는지 본다.", "field_count와 주요 field 후보가 누락되지 않았는지 본다."],
      },
      L3: {
        title: "예시로 보면",
        situation: "review text가 길고 이메일 같은 값이 섞여 있어도, AI에게 원문 전체를 넘기지 않는다.",
        action: ["field evidence만 축약한다.", "PII 후보 예시는 redaction 처리한다.", "AI 금지 입력 목록을 명시한다."],
        result: ["추천 모델이 볼 수 있는 안전한 입력 pack이 생긴다.", "row별 AI 호출 없이도 Silver/Gold 추천 근거를 확보한다."],
        userCheck: ["raw payload가 과도하게 남지 않았는지 본다.", "PII 후보가 제대로 가려졌는지 본다."],
      },
      L4: {
        title: "예시로 보면",
        situation: "데이터가 review인지, taxi trip인지, product health에 맞는지 처음부터 확정하기 어렵다.",
        action: ["profile/catalog 설명을 검색 문서처럼 정리한다.", "Gold template과 vector handoff 후보를 찾는다.", "근거가 약한 후보는 missing evidence로 표시한다."],
        result: ["넓은 후보군이 생기지만 아직 실행 확정은 아니다.", "비슷한 schema를 vectorDB에서 찾을 준비가 된다."],
        userCheck: ["검색 후보가 실제 데이터 도메인과 맞는지 본다.", "후보 점수만 보고 Gold를 확정하지 않았는지 확인한다."],
      },
      L5: {
        title: "예시로 보면",
        situation: "review_count는 만들 수 있어도 conversion_rate는 view/purchase 근거가 없으면 만들 수 없다.",
        action: ["product, review, rating, conversion, delivery field 후보를 검문한다.", "필수 근거가 없는 metric을 missing_evidence로 표시한다."],
        result: ["Gold 추천이 실제 필드 근거와 연결된다.", "없는 컬럼을 상상해서 metric으로 만들 가능성이 줄어든다."],
        userCheck: ["product_id 후보가 진짜 entity key인지 본다.", "rating과 risk_score처럼 이름이 비슷한 field가 섞이지 않았는지 본다."],
      },
      L6: {
        title: "예시로 보면",
        situation: "`reviewText`, `overall`, `asin` 같은 원천 이름은 그대로 쓰기보다 query하기 쉬운 Silver 이름으로 바꾸는 편이 낫다.",
        action: ["target_name과 target_type을 추천한다.", "cast/normalize/drop/quarantine 후보를 만든다.", "PII와 query 노출 정책을 분리한다."],
        result: ["사용자가 수정 가능한 Silver 정제 추천서가 생긴다.", "승인 후 M2가 실행할 spec으로 변환할 준비가 된다."],
        userCheck: ["버리면 안 되는 field가 drop 후보로 잡히지 않았는지 본다.", "query 금지 field가 허용으로 열리지 않았는지 본다."],
      },
      L7: {
        title: "예시로 보면",
        situation: "Amazon review만 있으면 review_count와 average_rating은 가능하지만 view_count나 late_delivery_rate는 없을 수 있다.",
        action: ["Gold 최소 schema 후보를 만든다.", "metric별 source evidence와 zero denominator 규칙을 작성한다.", "risk_score component와 weight를 데이터 근거에 맞게 추천한다."],
        result: ["Gold를 만들 수 있는 부분과 보류해야 할 부분이 분리된다.", "risk_score가 블랙박스 고정식이 아니라 설명 가능한 정책이 된다."],
        userCheck: ["없는 metric이 0으로 조용히 채워지지 않았는지 본다.", "risk_score weight가 어떤 근거로 추천됐는지 확인한다."],
      },
      L8: {
        title: "예시로 보면",
        situation: "review text는 의미 검색에 유용하지만 product_id 없이 embedding만 만들면 Gold와 연결하기 어렵다.",
        action: ["embedding 후보 text field를 고른다.", "entity key와 filter metadata 후보를 분리한다.", "vectorDB extension으로 넘길 template을 작성한다."],
        result: ["M6나 semantic search가 쓸 수 있는 handoff 초안이 생긴다.", "M3 core가 embedding 실행까지 떠안지 않는다."],
        userCheck: ["텍스트 후보와 entity key가 함께 있는지 본다.", "민감 텍스트가 그대로 노출되지 않는지 본다."],
      },
      L9: {
        title: "예시로 보면",
        situation: "사용자는 Silver는 바로 승인하고 Gold는 발표용 product health만 일부 수정해서 승인할 수 있다.",
        action: ["Silver와 Gold 결정을 분리해 기록한다.", "보류/거절/수정 이유를 trace로 남긴다.", "승인된 것만 compiler 단계로 넘긴다."],
        result: ["M3 추천과 사용자 결정이 섞이지 않는다.", "M2/M5가 실행 가능한 spec과 draft를 구분할 수 있다."],
        userCheck: ["Gold가 자동 승인되지 않았는지 본다.", "Gold-to-Gold가 사용자의 명시적 선택 없이 열리지 않았는지 본다."],
      },
      L10: {
        title: "예시로 보면",
        situation: "사용자가 Silver 정제를 승인하면 이제 사람이 읽는 추천서를 Spark가 읽는 작업 목록으로 바꿔야 한다.",
        action: ["select/cast/normalize 같은 operation을 순서대로 만든다.", "각 operation의 input/output artifact를 연결한다.", "preview_only 실행 원칙을 유지한다."],
        result: ["M2가 같은 규칙을 작은 데이터와 큰 데이터에 반복 적용할 수 있다.", "workflow DAG의 Silver 구간이 명확해진다."],
        userCheck: ["operation 순서가 말이 되는지 본다.", "지원하지 않는 action이 섞이지 않았는지 본다."],
      },
      L11: {
        title: "예시로 보면",
        situation: "Gold product health를 승인했다면 product 단위로 묶고 review/rating/risk 지표를 계산하는 spec이 필요하다.",
        action: ["group_by와 measures를 정한다.", "risk_score와 zero denominator 규칙을 연결한다.", "cardinality guard로 과도한 폭발을 막는다."],
        result: ["M2가 Silver에서 Gold를 생성할 실행 계약을 얻는다.", "M1/M6가 해석할 metric 이름이 고정된다."],
        userCheck: ["Gold 크기가 raw와 비슷해질 정도로 group_by가 과하지 않은지 본다.", "없는 지표가 metric에 포함되지 않았는지 본다."],
      },
      L12: {
        title: "예시로 보면",
        situation: "spec이 있어도 params 구조가 틀리거나 production write가 섞이면 그대로 실행하면 안 된다.",
        action: ["operation allowlist와 params schema를 검사한다.", "artifact ref 규칙을 확인한다.", "unsupported action을 별도 report로 분리한다."],
        result: ["M2에 넘겨도 되는 계약인지 pass/warn/block으로 확인된다.", "core 범위를 넘는 요구는 extension hook으로만 남는다."],
        userCheck: ["block이 있는데 다음 단계가 ready로 표시되지 않는지 본다.", "warn의 caveat가 충분히 설명됐는지 본다."],
      },
      L13: {
        title: "예시로 보면",
        situation: "Silver table은 만들어도 특정 컬럼은 catalog에는 숨기거나 query에서 금지해야 할 수 있다.",
        action: ["PII 노출 가능성을 확인한다.", "M6가 읽을 수 있는 column과 금지 column을 나눈다.", "quality_axis를 만든다."],
        result: ["Silver context를 안전하게 열 수 있는지 판단 근거가 생긴다.", "Gold가 없어도 Silver 질의 가능 여부를 말할 수 있다."],
        userCheck: ["PII 후보가 query allowed에 남아 있지 않은지 본다.", "catalog와 query 노출 정책이 같은 의미로 오해되지 않았는지 본다."],
      },
      L14: {
        title: "예시로 보면",
        situation: "Gold가 승인돼도 delivery 관련 근거가 없으면 late_delivery_rate는 준비되지 않은 metric이다.",
        action: ["Gold 요청 상태를 확인한다.", "metric별 source evidence를 확인한다.", "부족한 근거와 denominator caveat를 남긴다."],
        result: ["Gold readiness가 Silver readiness와 독립적으로 표현된다.", "metric별 설명 책임이 생긴다."],
        userCheck: ["not_requested가 실패처럼 보이지 않는지 본다.", "missing evidence와 zero denominator가 구분됐는지 본다."],
      },
      L15: {
        title: "예시로 보면",
        situation: "Gold가 보류돼도 Silver가 안전하면 M6는 Silver context를 사용할 수 있어야 한다.",
        action: ["processing_quality, catalog_safety, gold_readiness를 따로 계산한다.", "세 축을 gate_summary로 묶는다.", "M6 context status를 결정한다."],
        result: ["전체 pipeline이 어디까지 준비됐는지 한눈에 보인다.", "Gold 문제 때문에 Silver까지 막히는 일이 줄어든다."],
        userCheck: ["Gold block이 Silver ready를 덮어쓰지 않는지 본다.", "L16 package 상태와 gate 상태가 같은지 본다."],
      },
      L16: {
        title: "예시로 보면",
        situation: "M3 결과를 M5/M6/M2가 각각 읽으려면 파일 묶음과 참조 규칙이 마지막에 정리돼야 한다.",
        action: ["catalog sync package와 SQL context pack을 만든다.", "semantic vector template과 export spec을 정리한다.", "artifact_reference_manifest로 실제 파일 위치를 연결한다."],
        result: ["M3 산출물이 다른 M으로 넘어갈 수 있는 최종 형태가 된다.", "경로가 바뀌어도 artifact id로 resolve할 수 있다."],
        userCheck: ["M3가 실제 catalog write까지 했다고 오해하게 쓰이지 않았는지 본다.", "필수 refs가 artifact_reference_manifest에서 resolve되는지 본다."],
      },
    };
  }

  function getImprovedSnippetBrief(layerId, title) {
    return improvedSnippetBriefMap()[`${layerId}::${title}`] || null;
  }

  function improvedSnippetBriefMap() {
    const b = (summary, points, evidence = {}) => ({ summary, points, evidence });
    return {
      "L0::build_l0() signature and setup": b(
        "이 블록은 L0 함수가 어떤 재료를 받아 원본 inventory를 시작하는지 보여준다. `source`는 실제 원본 위치, `out_dir`은 산출물 폴더, `source_id/run_id`는 이 실행을 구분하는 이름이고, `checksum_mode/checksum_bytes`는 대용량 파일을 얼마나 깊게 확인할지 정하는 비용 정책이다.",
        [
          "`source`와 `out_dir`은 서로 다르다. 하나는 읽는 곳이고 하나는 M3 계약 파일을 기록하는 곳이다.",
          "`checksum_bytes=8*1024*1024`는 기본 8MiB prefix checksum이라서 대용량 원본 전체 hash보다 빠르다.",
          "`objects`와 `source_units` 빈 목록은 이후 loop에서 채워질 원본 목록과 처리 범위 목록의 시작점이다.",
        ],
        {
          why: "L0가 parser나 Spark job이 되지 않으려면 입력을 원본 위치와 식별 정책으로 제한해야 한다.",
          function: "출력 폴더를 준비하고, source file 목록을 찾고, object/source_unit 목록을 채울 준비를 한다.",
          effect: "이 준비가 있어야 다음 블록에서 각 파일에 안정적인 id를 부여할 수 있다.",
          limit: "이 블록은 아직 파일 내용이나 CSV/JSON 구조를 해석하지 않는다.",
        }
      ),
      "L0::object and source_unit construction": b(
        "이 블록은 파일 하나를 물리 원본 object와 처리 단위 source unit으로 나눠 기록한다. `object_id`는 저장소의 파일 조각을 가리키고, `source_unit_id`는 M3가 이후 단계에서 같은 처리 범위를 말할 때 쓰는 이름이다.",
        [
          "`object_id`와 `source_unit_id`를 분리해 stream window나 hybrid source 확장에 대비한다.",
          "`uri`, `path`, `checksum`, `etag`, `byte_size`를 함께 남겨 원본을 다시 확인할 수 있게 한다.",
          "현재 core는 batch object 중심이므로 `stream_window_ids`는 빈 배열로 남긴다.",
        ],
        {
          why: "path 하나만으로는 Docker, 노트북, MinIO/S3 실행 환경을 모두 설명할 수 없다.",
          function: "각 파일의 fingerprint를 계산하고 object/source_unit entry를 만든다.",
          effect: "L1 record locator부터 L16 catalog lineage까지 같은 id 체계를 공유한다.",
          limit: "stream watermark나 partition runtime은 여기서 구현하지 않고 extension hook으로 남긴다.",
        }
      ),
      "L0::manifest artifacts and replay pointer": b(
        "이 블록은 원본 inventory를 실제 artifact로 확정한다. `object_stream_manifest`는 원본 목록, `source_manifest`는 source 단위 요약, `raw_replay_pointer`는 M2가 원본을 다시 찾을 때 볼 좌표표다.",
        [
          "`copy_raw_payload=false`와 `mutate_raw_payload=false`가 M3 책임 경계를 박아 둔다.",
          "`manifest_hash`는 manifest 자체가 바뀌었는지 비교하는 지문이다.",
          "`artifact_ref`는 실제 파일 경로가 아니라 나중에 resolve할 artifact id다.",
        ],
        {
          why: "raw 보존 정책과 replay pointer가 없으면 Silver/Gold 오류를 원본으로 되돌려 확인할 수 없다.",
          function: "세 종류의 L0 artifact를 만들고 공통 header로 감싼다.",
          effect: "L1은 이 manifest를 읽고 Bronze sample을 만들고, M2는 replay pointer로 실제 materialization 위치를 찾는다.",
          limit: "원본 저장소의 lifecycle 보장은 M3가 아니라 외부 storage/M2 운영 범위다.",
        }
      ),
      "L1::build_l1() and Bronze manifests": b(
        "이 블록은 L0 manifest를 바탕으로 Bronze sample lane을 만든다. 전체 Bronze를 생성하는 것이 아니라, profile과 추천에 필요한 제한된 관찰 자료와 그 관찰 정책을 artifact로 남긴다.",
        [
          "`object_by_path`는 읽은 줄을 L0 object metadata와 연결하는 lookup이다.",
          "`sample_record_count`는 관찰한 샘플 수이지 전체 row count가 아니다.",
          "`sample_lane`은 row/byte 한도와 M3가 full Bronze를 실행하지 않는다는 원칙을 기록한다.",
        ],
        {
          why: "대용량에서 M3가 전체 raw를 처리하면 M2와 역할이 겹친다.",
          function: "bounded sample manifest와 Bronze envelope metadata를 만든다.",
          effect: "L2가 profile을 계산할 수 있고, M2는 같은 envelope 규칙으로 전체 처리를 구현할 수 있다.",
          limit: "샘플 수치만으로 전체 데이터 품질을 확정하면 안 된다.",
        }
      ),
      "L1::rescue lane and envelope spec": b(
        "이 블록은 정상 sample과 별도로 실패 record를 어떻게 남길지 정한다. 깨진 JSON, 이상한 encoding, parse 실패가 생겨도 삭제하지 않고 rescue lane 계약으로 보존한다.",
        [
          "`rescue_lane`은 실패를 숨기지 않고 다음 품질 판단으로 넘기는 통로다.",
          "`bronze_envelope_spec`은 M2가 전체 Bronze를 만들 때 지켜야 할 record 모양을 설명한다.",
          "정상/실패를 둘 다 artifact로 남겨야 row 손실 여부를 추적할 수 있다.",
        ],
        {
          why: "unknown data에서는 parse 실패가 데이터 품질 정보일 수 있다.",
          function: "실패 보존 정책과 Bronze envelope schema를 문서화한다.",
          effect: "L5/L12/L13에서 quarantine이나 quality warning 근거로 재사용할 수 있다.",
          limit: "실패 row를 자동 복구하지는 않는다. 복구 방식은 별도 정책이나 M2 실행에서 정해야 한다.",
        }
      ),
      "L1::_sample_bronze_records() line reader": b(
        "이 블록은 실제로 파일을 줄 단위로 읽는 부분이다. 중요한 것은 텍스트를 조금 읽는 행위보다, 각 줄이 어느 원본 object의 어느 line/byte 범위였는지를 기록하는 점이다.",
        [
          "`byte_start`와 `byte_end`는 원본에서 다시 찾을 좌표다.",
          "`raw_sha256`은 preview 문자열이 잘려도 같은 raw 조각인지 확인할 지문이다.",
          "`payload`와 `raw_preview`는 짧게 제한되어야 하고 원본 전체를 대체하지 않는다.",
        ],
        {
          why: "profile 기반 추천이 잘못됐을 때 원본 줄로 되돌아갈 수 있어야 한다.",
          function: "row/byte 한도 안에서 sample record를 만들고 locator를 붙인다.",
          effect: "L2는 이 sample을 형식 감지와 field profile 계산에 사용한다.",
          limit: "line 기반 reader는 multi-line JSON이나 Parquet에는 별도 reader가 필요하다.",
        }
      ),
      "L2::field summary helpers": b(
        "이 블록은 field 하나를 어떻게 요약할지 정하는 보조 함수들이다. 타입 후보, null 비율, 예시값, PII 힌트처럼 Silver/Gold 추천의 근거가 될 숫자를 만든다.",
        [
          "`value_type`은 문자열/숫자/bool/null처럼 관찰 타입을 분류한다.",
          "`pii_hint`는 이름이나 값 형태로 민감정보 후보를 표시한다.",
          "예시값은 너무 많이 보관하지 않고 추천에 필요한 정도만 남긴다.",
        ],
        {
          why: "AI 추천 전에는 raw가 아니라 profile 수치가 필요하다.",
          function: "field별 관찰 통계를 만들기 위한 작은 판단 도구를 제공한다.",
          effect: "L3 evidence와 L6 target type 추천이 같은 통계 기반으로 움직인다.",
          limit: "이름 기반 PII 판단은 완전하지 않으므로 이후 exposure gate가 다시 확인해야 한다.",
        }
      ),
      "L2::JSON and CSV profilers": b(
        "이 블록은 JSON/JSONL/CSV 샘플을 각각의 규칙으로 읽어 field profile을 만든다. CSV를 단순 split하지 않고 reader로 읽고, JSON은 path와 중첩 구조를 보며 field 후보를 뽑는다.",
        [
          "CSV header가 있으면 column name 후보로 쓰고, 없으면 위치 기반 field를 만든다.",
          "JSON 계열은 key/path 기준으로 field를 모은다.",
          "parse error 수는 profile 신뢰도와 rescue 판단에 영향을 준다.",
        ],
        {
          why: "형식별 parsing 규칙이 다르기 때문에 같은 방식으로 읽으면 profile이 망가진다.",
          function: "format별 샘플 parser와 field collector를 제공한다.",
          effect: "L2 build 단계가 detected format에 맞는 profiler를 선택할 수 있다.",
          limit: "복잡한 nested array나 binary format은 core profile만으로 충분하지 않을 수 있다.",
        }
      ),
      "L2::data shape contract": b(
        "이 블록은 profile 결과를 '데이터 모양 계약'으로 요약한다. 단순히 field 목록만 남기는 것이 아니라, record path, source scope, object scope, parsing confidence까지 함께 묶는다.",
        [
          "`source_unit_ids`와 `object_ids`로 profile이 어떤 원본 범위에서 나왔는지 고정한다.",
          "`record_path`는 JSONL인지 단일 JSON인지 같은 구조 차이를 설명한다.",
          "`parser_stats`는 parse 성공/실패 규모를 보여준다.",
        ],
        {
          why: "profile이 어떤 원본 범위를 본 결과인지 모르면 drift 비교와 replay가 불가능하다.",
          function: "format, scope, parser stats, field summary를 한 계약으로 만든다.",
          effect: "L3 AI input pack과 L16 catalog metadata가 같은 data shape를 설명한다.",
          limit: "샘플 기반 shape라서 전체 데이터의 모든 변형을 보장하지는 않는다.",
        }
      ),
      "L2::build_l2() routing and artifact creation": b(
        "이 블록은 L2의 본체다. format detection 결과에 따라 JSON/JSONL/CSV/기타 profiler를 고르고, profile snapshot과 schema fingerprint artifact를 기록한다.",
        [
          "`detect_format` 결과가 profiler 선택을 결정한다.",
          "`schema_fingerprint`는 field 이름과 타입 요약을 hash로 고정한다.",
          "format profile, profile snapshot, fingerprint를 분리해 후속 단계가 필요한 단위만 참조하게 한다.",
        ],
        {
          why: "unknown data에서 하나의 parser로 밀어붙이면 구조 판단이 쉽게 틀린다.",
          function: "format별 profile을 만들고 L2 artifact 묶음을 저장한다.",
          effect: "L3는 이 산출물을 AI-safe evidence로 줄이고, L6/L7은 추천 근거로 사용한다.",
          limit: "format confidence가 낮으면 이후 추천은 caveat를 가져야 한다.",
        }
      ),
      "L3::build_l3() field evidence reduction": b(
        "이 블록은 L2 field profile을 AI가 볼 수 있는 evidence로 줄인다. field_id, source_path, target_name 후보, inferred_type, null 비율, redacted examples를 만든다.",
        [
          "`field_id`는 AI와 사용자가 같은 field를 다시 가리키게 하는 번호다.",
          "`example_values_redacted`는 raw 예시를 제한해 privacy 위험을 줄인다.",
          "`semantic_hints`는 review, time, measure, identifier 같은 의미 후보를 제공한다.",
        ],
        {
          why: "AI가 raw 전체를 보지 않아도 추천할 수 있게 하려면 field 단위 evidence가 필요하다.",
          function: "profile field를 AI-safe field evidence로 변환한다.",
          effect: "L6 Silver 추천과 L7 Gold 추천이 같은 field_id 기반으로 설명된다.",
          limit: "이 단계는 추천 입력을 만들 뿐 최종 Silver/Gold를 확정하지 않는다.",
        }
      ),
      "L3::evidence reducer and policy context": b(
        "이 블록은 AI에게 어떤 정보를 보여주고 어떤 입력을 막을지 정책으로 정한다. evidence budget, redaction policy, forbidden raw payload 같은 경계가 여기서 문서화된다.",
        [
          "`evidence_budget`은 field 수, 예시 수, 전체 문자 수 한도를 기록한다.",
          "`forbidden_raw_payload`는 raw 전체를 모델 입력에서 배제한다는 선언이다.",
          "`blocked_ai_inputs`는 realtime per-row AI 같은 금지 패턴을 명시한다.",
        ],
        {
          why: "대용량 실시간 데이터에서 모든 row를 AI로 판단한다는 설계를 막아야 한다.",
          function: "AI control-plane 경계와 redaction 기준을 artifact에 남긴다.",
          effect: "AI 추천이 비용/보안/재현성 기준 안에서 돌아간다.",
          limit: "AI가 실제 모델 호출로 판단한 결과 자체는 별도 실행/검증 evidence가 필요하다.",
        }
      ),
      "L3::unknown data recommendation pack and domain signals": b(
        "이 블록은 낯선 데이터에 대해 어떤 추천 목표를 검토할지 정리한다. Silver cleaning, generic Gold aggregate, product health template, vector handoff를 후보로 열되, 없는 metric을 증명했다고 말하지 않는다.",
        [
          "`domain_signal_summary`는 product/review/measure/time 같은 신호를 요약한다.",
          "`generic_recommendation_targets`는 추천할 수 있는 작업 종류를 나열한다.",
          "`blocked_claims`는 L3가 아직 증명하지 못한 내용을 명시한다.",
        ],
        {
          why: "unknown data에서는 추천 후보와 확정 결과를 분리해야 과장을 줄일 수 있다.",
          function: "domain signal과 추천 목표를 AI-safe artifact로 정리한다.",
          effect: "L4/L5가 후보 검색과 grounding 검증을 이어서 수행할 수 있다.",
          limit: "L3만으로 product health 정확도나 metric 계산 가능성을 확정하지 않는다.",
        }
      ),
      "L4::metadata retrieval index plan": b(
        "이 블록은 schema/profile/catalog 설명을 검색 가능한 단위로 정리하는 계획이다. vectorDB를 쓰더라도 raw row가 아니라 metadata 문서를 대상으로 해야 한다는 기준을 만든다.",
        [
          "검색 대상은 field 설명, profile summary, catalog 후보 같은 control-plane 정보다.",
          "embedding/index 생성은 core 실행이 아니라 extension으로 넘길 수 있게 분리한다.",
          "검색 문서마다 source scope와 artifact ref를 유지한다.",
        ],
        {
          why: "비슷한 schema를 찾으면 추천 품질이 올라가지만 raw를 색인하면 privacy와 비용 문제가 커진다.",
          function: "metadata retrieval을 위한 문서 단위와 참조 방식을 정의한다.",
          effect: "Gold template 후보 탐색과 M6 semantic context 확장에 쓸 수 있다.",
          limit: "여기서 실제 vector index를 만들지는 않는다.",
        }
      ),
      "L4::gold template candidate retrieval": b(
        "이 블록은 profile evidence와 template 후보를 맞춰 Gold 후보를 찾는다. product health가 가능해 보이는지, generic aggregate가 맞는지, vector handoff가 유리한지 후보 단위로 남긴다.",
        [
          "후보마다 왜 선택됐는지 retrieval reason을 남긴다.",
          "필수 field가 부족하면 바로 확정하지 않고 L5 grounding으로 넘긴다.",
          "후보 점수는 가능성이지 실행 허가가 아니다.",
        ],
        {
          why: "Gold template을 사람이 매번 처음부터 고르기 어렵기 때문에 후보 검색이 필요하다.",
          function: "metadata 기반 Gold/template 후보 목록을 만든다.",
          effect: "L5가 후보별 field 근거를 확인할 수 있다.",
          limit: "검색 결과만으로 metric 계산식이나 readiness를 확정하지 않는다.",
        }
      ),
      "L5::candidate grounding report": b(
        "이 블록은 L4 후보가 실제 field evidence와 연결되는지 확인한다. product_id, rating, review text, view, purchase, delivery 근거가 있는지 따로 본다.",
        [
          "available evidence와 missing evidence를 나눠 기록한다.",
          "review 기반 metric과 conversion/delivery metric을 같은 수준으로 취급하지 않는다.",
          "근거 없는 metric은 보류되거나 caveat를 가진다.",
        ],
        {
          why: "그럴듯한 Gold 후보가 실제 데이터에 없는 지표를 만들면 발표와 M6 질의가 틀어진다.",
          function: "candidate별 source evidence를 검문하고 grounding 상태를 남긴다.",
          effect: "L7 risk_score와 metric 추천이 실제 가능한 component만 사용하게 된다.",
          limit: "field 이름 기반 추론이므로 domain owner 검토가 필요할 수 있다.",
        }
      ),
      "L5::product-health field classifiers": b(
        "이 블록은 product health에 필요한 field 후보를 분류한다. product key, product name, category, rating, review, view, purchase, delivery를 따로 보며 없으면 없는 상태로 남긴다.",
        [
          "`asin`, `sku`, `product_id` 같은 후보를 entity key로 본다.",
          "`overall`, `rating`, `score`는 의미 충돌이 있으므로 조심해서 본다.",
          "conversion과 delivery는 근거 field가 없으면 계산 대상에서 빠진다.",
        ],
        {
          why: "product health 최소 schema는 고정하되 모든 데이터가 모든 컬럼을 제공하지는 않는다.",
          function: "field 이름과 semantic hint로 product health component 후보를 분류한다.",
          effect: "L7이 metric별 available/missing 상태를 설명할 수 있다.",
          limit: "이름이 애매한 field는 자동 확정보다 owner review가 안전하다.",
        }
      ),
      "L6::L4 build setup and Silver draft artifact": b(
        "이 블록은 logical L6 Silver 추천서를 만들기 위한 준비와 artifact 작성 구간이다. profile/evidence를 읽고 field별 정제 후보를 모아 사용자가 볼 draft로 만든다.",
        [
          "Silver draft는 실행 spec이 아니라 사용자가 수정할 추천서다.",
          "각 field의 target name, target type, action, exposure 정책을 모은다.",
          "artifact header가 붙어 L9 approval과 L10 compiler가 같은 draft를 참조한다.",
        ],
        {
          why: "Bronze에서 바로 Gold로 가면 타입, 이름, PII 정책이 불안정하다.",
          function: "field별 Silver recommendation draft를 구성하고 저장한다.",
          effect: "사용자가 정제 정책을 검토하고 승인할 수 있는 화면/계약 기반이 된다.",
          limit: "실제 Spark 변환은 아직 수행하지 않는다.",
        }
      ),
      "L6::_silver_field_recommendation()": b(
        "이 블록은 field 하나를 Silver에서 어떻게 다룰지 판단한다. 이름 표준화, 타입 추천, cast/parse/drop/quarantine 후보, PII와 query 노출 정책이 여기서 결정된다.",
        [
          "`target_name`은 M6와 M1이 읽기 쉬운 표준 이름 후보다.",
          "`recommended_actions`는 변환 후보이며 승인 전에는 실행 명령이 아니다.",
          "`catalog_exposure`와 `query_context_exposure`는 민감정보 노출을 분리한다.",
        ],
        {
          why: "field별 판단이 없으면 Silver spec이 통째로 모호해진다.",
          function: "profile field를 Silver column recommendation으로 변환한다.",
          effect: "L10이 승인된 action만 deterministic operation으로 바꿀 수 있다.",
          limit: "자동 추천이므로 domain owner가 target name과 drop 여부를 확인해야 한다.",
        }
      ),
      "L7::Gold model draft artifact": b(
        "이 블록은 Gold 추천 전체를 artifact로 감싸는 부분이다. generic aggregate, product health, risk score 정책이 같은 Gold draft 묶음 안에서 참조된다.",
        [
          "Gold draft는 자동 실행 결과가 아니라 승인 전 추천서다.",
          "Gold model마다 grain, measures, evidence 상태를 가져야 한다.",
          "사용자가 Gold를 원하지 않으면 not_requested/deferred 상태로 남을 수 있다.",
        ],
        {
          why: "Gold 생성 방식까지 M3가 전달해야 하지만 실행 여부는 사용자가 결정해야 한다.",
          function: "Gold model recommendation draft를 공통 artifact 형식으로 만든다.",
          effect: "L9에서 Gold 승인/보류/수정 결정을 받을 수 있다.",
          limit: "이 artifact만으로 실제 Gold 데이터가 생성되지는 않는다.",
        }
      ),
      "L7::generic Gold model recommendations": b(
        "이 블록은 product health에 한정하지 않고 identifier, measure, time hint가 있을 때 generic aggregate Gold 후보를 만든다. 모르는 데이터가 와도 최소한 의미 있는 요약 후보를 제안하기 위한 장치다.",
        [
          "identifier 후보는 group_by 가능성을 의미한다.",
          "measure 후보는 sum/avg/count 같은 metric 가능성을 의미한다.",
          "time 후보가 있으면 window aggregate 가능성을 검토한다.",
        ],
        {
          why: "모든 dataset이 Amazon review나 product health 형태는 아니다.",
          function: "일반 데이터에서도 쓸 수 있는 Gold aggregate 후보를 만든다.",
          effect: "unknown CSV/JSON에서도 owner-reviewed Gold 옵션을 제시할 수 있다.",
          limit: "의미가 확실하지 않은 aggregate는 owner review가 필요하다.",
        }
      ),
      "L7::product health template and risk score policy": b(
        "이 블록은 발표용 product health 최소 schema와 risk_score 정책 초안을 만든다. 고정 컬럼 이름은 제시하지만, 실제 계산 가능 여부는 field evidence에 따라 달라진다.",
        [
          "review_count, average_rating, negative_review_rate는 review/rating 근거가 있어야 한다.",
          "conversion_rate는 view/purchase 근거와 zero denominator 규칙이 필요하다.",
          "late_delivery_rate는 delivery 근거가 없으면 missing evidence가 된다.",
        ],
        {
          why: "M1/M6가 해석할 Gold 컬럼명은 고정돼야 하지만, 없는 데이터를 꾸며내면 안 된다.",
          function: "product health metric template과 risk policy 후보를 만든다.",
          effect: "L11이 승인된 metric만 Gold generation spec으로 옮길 수 있다.",
          limit: "데이터셋에 없는 component는 계산식에서 제외하거나 보류해야 한다.",
        }
      ),
      "L7::risk score components and weights": b(
        "이 블록은 risk_score를 하나의 마법 숫자가 아니라 여러 component 조합으로 설명한다. 부정 리뷰율, 낮은 평점, 낮은 전환율, 배송 지연율 중 실제 근거가 있는 것만 사용한다.",
        [
          "`component_id`는 risk_score의 원인을 설명하는 단위다.",
          "`weight`는 component 중요도를 나타내며 missing component가 있으면 재조정 정책이 필요하다.",
          "`renormalize_missing`은 빠진 component를 0처럼 취급하지 않기 위한 안전 규칙이다.",
        ],
        {
          why: "risk_score가 고정식이면 데이터 도메인이 바뀔 때 틀린 점수가 된다.",
          function: "사용 가능한 위험 component와 weight 추천을 만든다.",
          effect: "M6가 risk_score뿐 아니라 왜 위험한지도 설명할 수 있다.",
          limit: "weight는 추천값이므로 실제 서비스 도메인에서는 검증과 조정이 필요하다.",
        }
      ),
      "L8::vector handoff template": b(
        "이 블록은 vectorDB나 semantic search extension에 넘길 후보를 정리한다. embedding을 직접 만들지 않고, 어떤 text field와 metadata field를 쓸지 template으로만 남긴다.",
        [
          "review text, title, description 같은 텍스트 후보를 분리한다.",
          "product_id/category/rating/time 같은 filter metadata 후보를 분리한다.",
          "redaction과 allowed exposure를 함께 기록한다.",
        ],
        {
          why: "schema/profile/catalog metadata 검색은 추천 정확도를 높일 수 있지만 raw 전체 색인은 위험하다.",
          function: "semantic/vector handoff 후보를 계약으로 작성한다.",
          effect: "M6나 extension이 검색 context를 만들 때 필요한 field를 찾을 수 있다.",
          limit: "embedding 생성, vector index build, retrieval runtime은 M3 core가 아니다.",
        }
      ),
      "L8::field matching and projection helpers": b(
        "이 블록은 어떤 field가 text 후보인지, entity key인지, filter metadata인지 고르는 보조 판단이다. vector handoff가 Gold나 catalog와 연결되려면 텍스트만 있어서는 부족하다.",
        [
          "text 후보는 embedding 대상이 될 수 있다.",
          "entity key 후보는 검색 결과를 원래 row나 Gold entity에 연결한다.",
          "filter 후보는 category/rating/time 조건 검색에 쓰인다.",
        ],
        {
          why: "검색 결과가 어떤 product나 metric과 연결되는지 알아야 M6 답변이 의미를 가진다.",
          function: "field evidence에서 semantic projection 후보를 고른다.",
          effect: "L16 semantic template이 더 구체적인 검색 계약을 가질 수 있다.",
          limit: "field 이름만으로 의미를 확정하기 어려운 경우 owner review가 필요하다.",
        }
      ),
      "L9::build_l5() decision artifacts": b(
        "이 블록은 physical code 기준 build_l5지만 logical L9 사용자 결정 단계다. Silver/Gold 추천을 승인 상태 파일로 바꾸고, 무엇이 실행 가능한지 분리한다.",
        [
          "Silver decision과 Gold decision을 한 파일 안에서 구분한다.",
          "승인되지 않은 draft는 compiler로 넘기지 않는다.",
          "decision trace는 나중에 왜 그런 선택을 했는지 설명한다.",
        ],
        {
          why: "M3가 추천했다고 바로 실행하면 사용자 통제와 domain 판단이 사라진다.",
          function: "approval_state와 decision artifact를 만든다.",
          effect: "L10/L11 compiler가 승인된 범위만 처리한다.",
          limit: "현재 테스트에서는 AI/스크립트가 사용자를 대리할 수 있지만 실제 제품에서는 UI 선택이 필요하다.",
        }
      ),
      "L9::approval state and diff": b(
        "이 블록은 추천 draft와 승인된 decision 사이 차이를 기록한다. 사용자가 수정한 target type, drop 여부, Gold 보류 이유가 있으면 trace로 남아야 한다.",
        [
          "`approval_state`는 공식 상태이고 `decision_trace`는 이유 기록이다.",
          "Silver와 Gold 상태를 따로 둬 Gold 보류가 Silver를 막지 않게 한다.",
          "diff가 있으면 후속 spec은 수정된 값을 기준으로 만들어야 한다.",
        ],
        {
          why: "추천과 승인 결과가 다를 수 있기 때문에 둘을 구분해야 재현성과 설명이 생긴다.",
          function: "상태, 이유, 변경 내용을 decision artifact로 정리한다.",
          effect: "PR 리뷰나 발표에서 누가 어떤 정책을 선택했는지 설명할 수 있다.",
          limit: "승인 UI가 없으면 테스트 결정과 실제 사용자 결정을 혼동하지 않게 표시해야 한다.",
        }
      ),
      "L9::Gold decision reason helper": b(
        "이 블록은 Gold가 승인, 보류, 미요청, 거절된 이유를 일관된 문구로 만든다. Gold 상태는 Silver readiness와 독립적이어야 한다.",
        [
          "`not_requested`는 실패가 아니라 사용자가 아직 요청하지 않은 상태다.",
          "`deferred`는 보류이며 이후 재검토 가능성을 남긴다.",
          "`approved`일 때만 L11 Gold spec으로 이어진다.",
        ],
        {
          why: "Gold 상태를 모호하게 쓰면 M6 catalog가 Silver까지 막힌 것으로 오해할 수 있다.",
          function: "Gold decision status에 맞는 reason을 생성한다.",
          effect: "L14/L15/L16에서 Gold readiness를 같은 의미로 해석한다.",
          limit: "reason helper는 설명을 만들 뿐 metric 근거를 새로 검증하지 않는다.",
        }
      ),
      "L10::build_l6() Silver spec": b(
        "이 블록은 승인된 Silver decision을 deterministic transform spec으로 바꾼다. 사람이 읽는 추천서가 아니라 M2 runner가 읽을 작업 계약을 만드는 단계다.",
        [
          "승인된 field만 selected column 후보가 된다.",
          "operation은 순서와 input/output artifact를 가진다.",
          "preview_only 원칙을 유지해 M3가 production write를 수행하지 않게 한다.",
        ],
        {
          why: "M2가 임의 해석 없이 같은 방식으로 변환하려면 spec이 구체적이어야 한다.",
          function: "Silver transform spec artifact를 만든다.",
          effect: "5GB 검증과 100GB 검증에 같은 변환 규칙을 적용할 수 있다.",
          limit: "실제 Spark session 생성과 저장은 M3 책임이 아니다.",
        }
      ),
      "L10::Silver operation compiler": b(
        "이 블록은 field 추천을 실제 operation 목록으로 번역한다. select, cast, normalize 같은 작업을 DAG처럼 연결하고 params를 명시한다.",
        [
          "`input_ref`와 `output_ref`로 작업 사이 연결을 고정한다.",
          "각 operation type은 allowlist와 params schema 검증 대상이다.",
          "unsupported action은 L12에서 block이나 report로 분리돼야 한다.",
        ],
        {
          why: "추천 action 이름만으로는 Spark job을 안정적으로 만들 수 없다.",
          function: "Silver field decision을 실행 가능한 operation 구조로 바꾼다.",
          effect: "L12 compiler validation이 operation 단위로 문제를 찾을 수 있다.",
          limit: "모든 변환 action을 core에서 지원하지 않으므로 allowlist 밖은 extension이나 block이다.",
        }
      ),
      "L11::Gold generation spec": b(
        "이 블록은 승인된 Gold 추천을 generation spec으로 바꾼다. product health라면 product grain, dimensions, measures, risk_score 정책이 여기서 실행 계약이 된다.",
        [
          "`group_by`는 Gold row의 단위를 정한다.",
          "`measures`는 계산할 metric과 source evidence를 정한다.",
          "`time_window`와 `cardinality_guard`는 대용량 집계 폭발을 막는 안전 장치다.",
        ],
        {
          why: "Gold 생성 방식까지 전달하지 않으면 M2가 무엇을 만들어야 하는지 알 수 없다.",
          function: "Gold generation artifact를 만든다.",
          effect: "M2가 Silver에서 Gold를 만들 수 있는 계약을 얻는다.",
          limit: "승인되지 않은 Gold나 evidence 부족 metric은 spec에 포함하면 안 된다.",
        }
      ),
      "L11::Gold aggregate operation compiler": b(
        "이 블록은 Gold spec을 aggregate/project/risk_score operation으로 번역한다. metric별 계산식, 분자/분모, zero denominator 규칙이 실행 가능한 모양으로 정리된다.",
        [
          "count, sum, avg, count_distinct 같은 operation을 measure로 표현한다.",
          "conversion_rate처럼 분모가 있는 지표는 zero denominator 정책이 필요하다.",
          "risk_score는 component와 weight 기반으로 계산된다.",
        ],
        {
          why: "Gold metric 정의가 코드와 문서에서 다르면 발표와 질의 결과가 달라진다.",
          function: "Gold metric draft를 operation graph로 바꾼다.",
          effect: "L12가 Gold operation 지원 여부를 검증할 수 있다.",
          limit: "metric 의미가 애매하면 owner review 또는 caveat를 유지해야 한다.",
        }
      ),
      "L12::compiler validation artifacts": b(
        "이 블록은 Silver/Gold spec의 검증 결과 artifact를 만든다. pass/warn/block, unsupported action, layered transform graph가 이 단계에서 정리된다.",
        [
          "`compiler_validation_result`는 전체 실행 가능성을 요약한다.",
          "`unsupported_action_report`는 core가 처리하지 못하는 작업을 분리한다.",
          "`layered_transform_graph`는 raw/bronze/silver/gold 흐름을 시각적으로 따라갈 근거다.",
        ],
        {
          why: "검증 없이 M2에 넘기면 실패 원인이 M3 계약인지 M2 실행인지 구분하기 어렵다.",
          function: "compiler validation 산출물을 만든다.",
          effect: "L13/L14/L15 quality gate가 검증 결과를 근거로 판단한다.",
          limit: "validation은 preview 계약 검증이지 production runtime 보장이 아니다.",
        }
      ),
      "L12::unsupported and validation helpers": b(
        "이 블록은 operation이 지원되는지, ref가 맞는지, params가 schema를 따르는지 검사하는 보조 로직이다. core 범위를 넘는 작업은 실패를 숨기지 않고 report로 분리한다.",
        [
          "operation type과 params 구조를 allowlist로 확인한다.",
          "`*_ref`가 artifact_id 규칙을 따르는지 본다.",
          "production write, stream runtime 같은 core 밖 기능은 extension hook으로 남긴다.",
        ],
        {
          why: "M3가 지원하지 않는 동작을 지원하는 것처럼 넘기면 downstream 장애가 된다.",
          function: "spec 내부의 위험 요소를 찾아 warn/block으로 분류한다.",
          effect: "사용자는 어떤 정책을 수정해야 하는지 더 정확히 볼 수 있다.",
          limit: "지원 여부 검사는 실제 Spark 성능 검증을 대체하지 않는다.",
        }
      ),
      "L13::build_l7() Silver preview evidence": b(
        "이 블록은 Silver context를 M6에 열어도 되는지 판단할 evidence를 만든다. compiler 상태, PII 노출, query 금지 컬럼, catalog safety를 함께 본다.",
        [
          "Silver가 ready인지 ready_with_caveat인지 block인지 근거를 남긴다.",
          "catalog 노출과 query 노출을 분리한다.",
          "Gold 상태와 관계없이 Silver 자체 품질을 본다.",
        ],
        {
          why: "Gold가 없어도 Silver가 안전하면 M6가 기본 질의를 할 수 있어야 한다.",
          function: "Silver preview evidence와 quality axis를 만든다.",
          effect: "L15가 Silver readiness를 Gold readiness와 독립적으로 계산한다.",
          limit: "실제 row count나 output size는 M2 실행 evidence가 필요하다.",
        }
      ),
      "L14::build_l8() Gold readiness evidence": b(
        "이 블록은 Gold가 어떤 상태인지 판단한다. requested/approved/deferred 여부와 metric evidence, caveat를 분리해 Gold readiness axis를 만든다.",
        [
          "`not_requested`와 `deferred`는 실패가 아니라 공식 상태다.",
          "metric별 missing evidence와 caveat를 남긴다.",
          "Gold block이 Silver context를 덮어쓰지 않게 별도 axis로 유지한다.",
        ],
        {
          why: "Gold는 선택적이고 의미가 강한 산출물이므로 상태와 근거가 분리돼야 한다.",
          function: "Gold readiness evidence와 axis를 만든다.",
          effect: "L15가 Gold 준비도만 따로 판단할 수 있다.",
          limit: "Gold 데이터 자체를 계산하지 않고 readiness만 판단한다.",
        }
      ),
      "L14::Gold metric and caveat helpers": b(
        "이 블록은 Gold metric의 해석 주의사항을 만든다. denominator가 0인 경우, field evidence가 없는 경우, owner review가 필요한 경우를 metric별로 설명한다.",
        [
          "zero denominator와 missing evidence를 구분한다.",
          "available field가 부족하면 metric caveat를 붙인다.",
          "risk_score component가 빠진 경우 weight 재정규화 여부를 설명한다.",
        ],
        {
          why: "같은 metric 이름이라도 계산 규칙이 다르면 결과 의미가 달라진다.",
          function: "metric별 caveat와 readiness reason을 생성한다.",
          effect: "M1/M6가 Gold 숫자를 해석할 때 주의사항을 함께 볼 수 있다.",
          limit: "caveat는 문제를 설명하지만 부족한 데이터를 새로 만들지는 않는다.",
        }
      ),
      "L15::build_l9() three-axis gate": b(
        "이 블록은 processing_quality, catalog_safety, gold_readiness 세 축을 합쳐 gate summary를 만든다. 핵심은 Gold 상태가 Silver context를 오염시키지 않는 precedence rule이다.",
        [
          "Silver readiness는 processing_quality와 catalog_safety로 계산한다.",
          "Gold readiness는 Silver 위에 별도 축으로 적용한다.",
          "`m6_context_status`는 M6가 어떤 context를 사용할 수 있는지 요약한다.",
        ],
        {
          why: "Gold가 보류됐다는 이유로 Silver까지 사용할 수 없다고 판단하면 시스템 흐름이 불필요하게 막힌다.",
          function: "세 축 gate와 M6 context status를 만든다.",
          effect: "L16 package가 downstream에 정확한 사용 가능 상태를 전달한다.",
          limit: "gate는 M3 계약 기준이며 실제 runtime SLA는 포함하지 않는다.",
        }
      ),
      "L15::axis and M6 context helpers": b(
        "이 블록은 각 축의 상태와 M6 context 문구를 일관되게 만드는 보조 로직이다. pass/warn/block, ready/ready_with_caveat/not_ready 같은 상태가 같은 뜻으로 반복되게 한다.",
        [
          "axis별 status와 reason을 정한다.",
          "Silver와 Gold context status를 분리한다.",
          "L16 package와 비교할 top-level m6_context_status를 만든다.",
        ],
        {
          why: "상태 문구가 단계마다 달라지면 M6와 catalog가 서로 다른 해석을 하게 된다.",
          function: "gate status와 M6 handoff status를 계산한다.",
          effect: "L16에서 상태 불일치를 block 조건으로 검증할 수 있다.",
          limit: "상태 계산은 입력 evidence 품질에 의존한다.",
        }
      ),
      "L16::build_l10() handoff package": b(
        "이 블록은 logical L16의 최종 묶음을 만든다. catalog, SQL context, semantic vector template, artifact refs, exports가 다른 M으로 넘어갈 수 있게 한 package로 정리된다.",
        [
          "M5는 catalog sync package를 저장/동기화한다.",
          "M6는 SQL context와 semantic template을 질의에 사용한다.",
          "M2는 export된 transform spec을 실제 Spark 실행에 연결한다.",
        ],
        {
          why: "M3가 만든 계약이 다른 M에게 읽히지 않으면 실제 pipeline이 닫히지 않는다.",
          function: "최종 handoff package를 조립한다.",
          effect: "M1/M2/M5/M6가 필요한 산출물을 같은 기준으로 찾는다.",
          limit: "실제 catalog DB write, SQL serving, vector index build는 M3 core 책임이 아니다.",
        }
      ),
      "L16::catalog metadata and SQL context": b(
        "이 블록은 catalog metadata draft와 M6 SQL context pack을 만든다. 어떤 table과 column을 보여줄지, 어떤 caveat와 freshness 상태를 함께 줄지 정리한다.",
        [
          "query forbidden field는 allowed column에서 제외한다.",
          "Gold table은 Gold context가 준비된 경우에만 추가한다.",
          "freshness와 quality는 M6 답변의 주의사항으로 이어진다.",
        ],
        {
          why: "M6가 아무 컬럼이나 질의하면 privacy와 의미 오류가 생긴다.",
          function: "catalog/query 사용 가능 범위를 계약 파일로 정리한다.",
          effect: "M6가 안전한 SQL context만 읽게 된다.",
          limit: "실제 SQL endpoint나 권한 시스템은 이 파일만으로 생기지 않는다.",
        }
      ),
      "L16::semantic vector template and sync package": b(
        "이 블록은 vector/semantic handoff와 catalog sync package를 만든다. schema field docs, product health docs, filter key, retrieval policy 같은 설명이 package에 포함된다.",
        [
          "semantic template은 vectorDB extension이 볼 후보 문서다.",
          "sync package는 M5/M6가 필요한 ref와 상태를 한 번에 보게 한다.",
          "`m6_context_status`는 L15 gate와 일치해야 한다.",
        ],
        {
          why: "schema/profile/catalog metadata 검색은 Gold 추천과 M6 질의 정확도를 높일 수 있다.",
          function: "semantic handoff와 catalog sync 계약을 만든다.",
          effect: "M6가 SQL뿐 아니라 semantic context 후보까지 이해할 수 있다.",
          limit: "실제 embedding 생성과 retrieval runtime은 extension 영역이다.",
        }
      ),
      "L16::artifact manifest and exports": b(
        "이 블록은 최종 산출물 위치표와 외부 소비용 export 파일을 만든다. `artifact_reference_manifest`가 artifact_id를 physical_uri, checksum, byte_size와 연결한다.",
        [
          "출력 폴더 아래 JSON/JSONL artifact를 읽어 header 정보를 모은다.",
          "artifact_id가 없는 파일은 manifest 대상에서 제외한다.",
          "TransformSpec, SchemaDefinition, WorkflowDefinition, CatalogMetadata export를 만든다.",
        ],
        {
          why: "`*_ref`가 경로가 아니라 id라면 마지막에 resolve 표가 반드시 필요하다.",
          function: "artifact 위치표와 M2/M5/M6 소비용 export를 만든다.",
          effect: "폴더 위치가 바뀌어도 artifact_id 기준으로 실제 파일을 찾을 수 있다.",
          limit: "export는 계약 파일이지 실제 runner 실행 결과가 아니다.",
        }
      ),
    };
  }

  function directLayerPlainMap() {
    return {
      L0: {
        simpleTitle: "원본에 번호표와 주소를 붙이는 단계",
        oneLine: "L0는 원본 데이터를 읽어서 바꾸는 단계가 아니라, 원본을 나중에 다시 찾을 수 있게 이름표와 위치표를 만드는 단계다.",
        easyMeaning:
          "쉽게 말하면 창고에 들어온 박스를 뜯지 않고 박스마다 번호표를 붙이는 일이다. 파일 하나에는 object_id를 붙이고, 처리 범위에는 source_unit_id를 붙인다. path는 이 컴퓨터에서 보이는 길이고, uri는 MinIO/S3/로컬 같은 저장소까지 포함한 주소다. 그래서 path만 있으면 다른 컴퓨터나 Spark 컨테이너가 원본을 못 찾을 수 있고, uri와 checksum/etag가 같이 있어야 같은 원본인지 확인할 수 있다.",
        why:
          "M3는 raw를 복사하거나 수정하지 않는 역할이다. 그러면 이후 L1~L16에서 문제가 생겼을 때 원본으로 돌아갈 수 있는 replay pointer가 반드시 필요하다. L0가 정확하지 않으면 Bronze, Silver, Gold가 어느 원본에서 왔는지 전부 흔들린다.",
        inputs: ["사용자가 등록한 파일 또는 폴더", "source_id", "run_id", "checksum 정책"],
        outputs: ["object_stream_manifest.json", "source_manifest.json", "raw_replay_pointer.json"],
        next: "L1은 L0가 만든 object_id, source_unit_id, uri, path, checksum을 보고 제한된 Bronze 샘플을 만든다.",
        watch:
          "여기서는 CSV인지 JSON인지 깊게 판단하지 않는다. 원본을 설명하고 다시 찾는 정보만 만든다. path와 uri를 혼동하면 로컬에서는 되는데 Spark/MinIO에서는 안 되는 문제가 생긴다.",
        steps: [
          ["원본 찾기", "source 아래 파일 목록을 안정적인 순서로 찾는다."],
          ["번호표 붙이기", "각 object와 처리 단위에 object_id와 source_unit_id를 붙인다."],
          ["다시 찾는 지도 만들기", "uri, path, checksum, etag, byte size 같은 replay 정보를 manifest로 남긴다."],
        ],
      },
      L1: {
        simpleTitle: "원본 일부를 Bronze 봉투에 담는 단계",
        oneLine: "L1은 전체 데이터를 다 처리하지 않고, 제한된 샘플을 공통 Bronze 형식으로 감싼다.",
        easyMeaning:
          "쉽게 말하면 원본 파일 전체를 옮기는 게 아니라 몇 줄만 꺼내서 투명 봉투에 담는 일이다. 봉투에는 payload만 넣지 않고, 이 줄이 어느 object_id에서 왔는지, 몇 번째 줄인지, byte 위치가 어디인지도 같이 넣는다. parse가 실패한 줄도 버리지 않고 rescue lane으로 남긴다.",
        why:
          "unknown CSV/JSON은 처음부터 다 믿고 처리하면 안 된다. 먼저 작게 보고 구조를 파악해야 한다. 하지만 작게 보더라도 나중에 원본을 다시 찾을 수 있어야 하므로 locator가 꼭 필요하다.",
        inputs: ["L0 manifest", "max_rows", "max_bytes"],
        outputs: ["bronze_envelope_samples.jsonl", "rescue_lane.jsonl", "bronze_envelope_spec.json"],
        next: "L2는 Bronze 샘플을 보고 포맷, 컬럼, 타입, null 비율, 구조를 판단한다.",
        watch:
          "샘플은 전체 데이터의 완전한 통계가 아니다. L1은 실행 엔진이 아니므로 max_rows와 max_bytes를 넘어서는 대량 처리는 M2가 맡아야 한다.",
        steps: [
          ["조금만 읽기", "row 수와 byte 수 제한 안에서만 원본을 읽는다."],
          ["위치 붙이기", "record마다 object_id, line_number, byte_start, byte_end를 붙인다."],
          ["실패 보존", "parse 실패나 깨진 row를 삭제하지 않고 rescue lane에 남긴다."],
        ],
      },
      L2: {
        simpleTitle: "데이터 모양을 조사하는 단계",
        oneLine: "L2는 샘플을 보고 CSV인지 JSON인지, 어떤 필드가 있고 타입과 null이 어떤지 요약한다.",
        easyMeaning:
          "쉽게 말하면 낯선 파일을 열어 표처럼 생겼는지, 중첩 JSON인지, 컬럼 이름이 있는지, 숫자처럼 보이는지, 비어 있는 값이 많은지 체크하는 단계다. 여기서 만드는 profile은 확정된 정답이 아니라 다음 추천을 위한 근거다.",
        why:
          "AI가 raw 전체를 보면 비용과 보안이 터진다. 먼저 deterministic profile을 만들어야 AI는 작은 근거만 보고 추천할 수 있다. L2가 약하면 L3 이후 추천이 감으로 바뀐다.",
        inputs: ["L1 Bronze sample", "L0 source scope", "format_hint"],
        outputs: ["format_detection.json", "profile_snapshot.json", "schema_fingerprint.json"],
        next: "L3는 L2 profile을 AI가 볼 수 있는 안전한 evidence pack으로 줄인다.",
        watch:
          "sample 기반이므로 희귀 컬럼이나 뒤쪽 파일의 drift를 놓칠 수 있다. 그래서 schema_fingerprint와 parser_stats를 남겨 다음 실행과 비교해야 한다.",
        steps: [
          ["포맷 추정", "CSV, JSON, JSONL, text, extension 필요 여부를 본다."],
          ["필드 요약", "field별 타입 분포, null 비율, 예시, PII 후보를 만든다."],
          ["모양 계약", "core로 처리 가능한지 extension hook이 필요한지 표시한다."],
        ],
      },
      L3: {
        simpleTitle: "AI가 봐도 되는 근거만 줄이는 단계",
        oneLine: "L3는 raw를 AI에게 보내지 않고, profile에서 필요한 요약 증거만 골라 AI 입력으로 만든다.",
        easyMeaning:
          "쉽게 말하면 파일 원문을 통째로 보여주는 대신 컬럼 이름, 타입, null 비율, 짧은 예시, 의미 후보만 정리한 메모를 AI에게 주는 단계다. 민감해 보이는 값은 redaction_map으로 가리고, AI가 하면 안 되는 일도 policy_context에 적는다.",
        why:
          "실시간 빅데이터에서 모든 row를 AI가 보는 설계는 거짓말에 가깝다. AI는 data-plane이 아니라 추천 control-plane에만 들어가야 한다. L3는 그 경계를 실제 산출물로 만든다.",
        inputs: ["L2 profile_snapshot", "field summaries", "data_shape_contract"],
        outputs: ["ai_recommendation_input_pack.json", "field_evidence_reducer.json", "redaction_map.json"],
        next: "L4~L7은 이 안전한 evidence를 보고 Silver/Gold 후보를 만든다.",
        watch:
          "L3는 추천 입력을 만드는 단계이지 Silver/Gold를 확정하는 단계가 아니다. 없는 metric을 있다고 만들면 안 되고, raw sample을 과하게 넣어도 안 된다.",
        steps: [
          ["줄이기", "field evidence만 남기고 raw payload는 줄인다."],
          ["가리기", "PII 의심 값은 mask/hash 정책으로 분리한다."],
          ["정책 넣기", "AI가 지켜야 하는 금지 규칙과 추천 범위를 함께 넘긴다."],
        ],
      },
      L4: {
        simpleTitle: "쓸 만한 템플릿을 찾는 단계",
        oneLine: "L4는 schema/profile/catalog metadata로 어떤 Gold나 semantic template이 맞을지 후보를 찾는다.",
        easyMeaning:
          "쉽게 말하면 데이터의 프로필을 보고 '이건 리뷰 데이터에 가깝다', '상품 건강도 Gold가 가능할 수도 있다', 'vector 검색 문서로 만들 수 있다' 같은 후보를 찾는 단계다. 이때 vectorDB에 넣는 것도 raw가 아니라 schema/profile/catalog 설명이다.",
        why:
          "unknown data마다 사람이 Gold 모델을 처음부터 만들 수 없다. 하지만 AI가 마음대로 고르면 위험하므로, metadata 검색과 template 후보를 근거로 좁혀야 한다.",
        inputs: ["L3 AI-safe evidence", "L2 profile summary", "Gold/template 후보 정의"],
        outputs: ["metadata_retrieval_index_plan.json", "gold_template_candidate_retrieval.json"],
        next: "L5는 L4 후보가 실제 field 근거를 갖는지 검증한다.",
        watch:
          "검색 점수는 정답 보장이 아니다. L4는 후보를 찾는 단계이고, 실제 계산 가능 여부는 L5~L7에서 다시 본다.",
        steps: [
          ["검색 문서 만들기", "field/profile/catalog 설명을 검색 가능한 단위로 정리한다."],
          ["후보 찾기", "product, review, conversion, delivery 같은 신호가 있는지 본다."],
          ["근거 부족 표시", "없는 근거는 missing evidence로 남긴다."],
        ],
      },
      L5: {
        simpleTitle: "후보가 진짜 근거 있는지 확인하는 단계",
        oneLine: "L5는 L4가 찾은 후보가 실제 데이터 필드와 맞는지 검사한다.",
        easyMeaning:
          "쉽게 말하면 'product health를 만들 수 있을 것 같다'는 말을 바로 믿지 않고, product_id 후보가 있는지, rating 후보가 있는지, 리뷰 텍스트가 있는지, 조회/구매/배송 근거가 있는지 하나씩 대조하는 단계다.",
        why:
          "Gold는 발표에서 가장 잘 보이지만, 없는 데이터를 있는 것처럼 만들면 바로 깨진다. L5는 AI 추천이 field evidence에 묶여 있는지 확인하는 안전문이다.",
        inputs: ["L4 template 후보", "L3 field evidence", "L2 type/null profile"],
        outputs: ["candidate_grounding_report.json", "product_health_grounding.json"],
        next: "L6은 검증된 근거를 바탕으로 Silver 추천 초안을 만든다. L7은 Gold 추천 초안을 만든다.",
        watch:
          "후보가 약하면 warn이나 missing_evidence로 남겨야 한다. 억지로 pass시키면 risk_score와 metric이 가짜가 된다.",
        steps: [
          ["키 확인", "product_id나 entity key 후보가 있는지 본다."],
          ["지표 근거 확인", "rating, review, conversion, delivery 후보를 나눠 본다."],
          ["부족한 것 표시", "없는 근거는 계산하지 않고 사용자 검토 대상으로 남긴다."],
        ],
      },
      L6: {
        simpleTitle: "Silver 정제 추천서를 만드는 단계",
        oneLine: "L6은 Bronze를 Silver로 만들 때 어떤 컬럼을 남기고 어떻게 정제할지 추천한다.",
        easyMeaning:
          "쉽게 말하면 raw에 가까운 Bronze에서 query하기 좋은 Silver 표를 만들기 위한 설계도를 쓰는 단계다. 컬럼 이름을 정리하고, 타입을 추천하고, 날짜 파싱이나 trim, cast, drop 같은 action을 붙인다. PII는 어떻게 처리하고 catalog/query에 노출할지도 따로 적는다.",
        why:
          "Silver가 안정적이어야 Gold도 의미가 있다. L6는 실제 Spark 실행이 아니라 실행 가능한 추천 초안이다. 사용자가 수정하고 승인할 수 있어야 한다.",
        inputs: ["L3/L5 evidence", "L2 profile", "AI 추천 슬롯"],
        outputs: ["silver_recommendation_draft.json", "cleaning_policy_recommendation.json"],
        next: "L9에서 사용자가 승인하거나 수정하고, L10에서 deterministic Silver spec으로 컴파일된다.",
        watch:
          "recommended_actions는 허용된 action 이름이어야 한다. catalog_exposure와 query_context_exposure를 PII 처리와 섞으면 안 된다.",
        steps: [
          ["컬럼 고르기", "남길 field와 버릴 field를 제안한다."],
          ["타입 정하기", "target_name과 target_type을 추천한다."],
          ["노출 정책 붙이기", "PII, catalog, query context 정책을 분리해 적는다."],
        ],
      },
      L7: {
        simpleTitle: "Gold 생성 추천서를 만드는 단계",
        oneLine: "L7은 Silver 위에서 만들 수 있는 Gold 모델과 product health/risk_score 후보를 제안한다.",
        easyMeaning:
          "쉽게 말하면 Silver를 어떤 기준으로 묶으면 의미 있는 요약 데이터가 되는지 제안하는 단계다. product_health가 가능하면 최소 컬럼 후보를 만들고, risk_score는 고정식이 아니라 데이터에 실제로 있는 부정 리뷰, 낮은 평점, 낮은 전환율, 배송 지연 근거로 component와 weight를 추천한다.",
        why:
          "Gold는 M1/M6가 가장 이해하기 쉬운 결과물이지만, 데이터마다 가능한 지표가 다르다. 그래서 L7은 '무조건 생성'이 아니라 사용자가 선택할 수 있는 추천서와 계산 정책을 만든다.",
        inputs: ["Silver field evidence", "L5 grounding result", "Gold template 후보"],
        outputs: ["gold_model_recommendation_draft.json", "product_health_gold_template_draft.json", "risk_score_policy_recommendation_draft.json"],
        next: "L9에서 사용자가 Gold 생성 여부를 결정하고, L11에서 승인된 Gold만 deterministic spec으로 바뀐다.",
        watch:
          "데이터에 없는 metric은 missing_evidence로 남긴다. conversion_rate는 denominator가 0일 때 null 또는 0 정책을 반드시 가져야 한다.",
        steps: [
          ["Gold 후보 만들기", "dimension과 measure 조합을 찾는다."],
          ["product health 점검", "product_id, rating, review, conversion, delivery 근거를 본다."],
          ["risk 정책 추천", "가능한 component만 쓰고 없는 component는 재정규화한다."],
        ],
      },
      L8: {
        simpleTitle: "vector와 의미 검색 인수인계안을 만드는 단계",
        oneLine: "L8은 어떤 텍스트와 metadata를 vectorDB나 semantic search에 넘길 수 있을지 정리한다.",
        easyMeaning:
          "쉽게 말하면 리뷰 본문, 상품명, 설명문 같은 텍스트 후보와 product_id/category/date/rating 같은 필터 후보를 골라 '나중에 의미 검색에 쓰려면 이렇게 넘겨라'라고 적는 단계다. 여기서도 raw 전체를 밀어 넣지 않고, 안전한 텍스트 후보와 metadata 후보를 분리한다.",
        why:
          "schema/profile/catalog metadata를 vectorDB에 넣으면 Gold template 찾기와 M6 질의 정확도가 좋아질 수 있다. 하지만 raw 덤프가 되면 보안과 비용 문제가 생기므로 template이 필요하다.",
        inputs: ["L3 field evidence", "L4 retrieval 후보", "L7 Gold 후보"],
        outputs: ["vector_embedding_handoff_template.json", "semantic_projection_candidates.json"],
        next: "L16에서 catalog/query/vector handoff package에 포함된다.",
        watch:
          "텍스트 후보가 없으면 vector handoff는 deferred가 맞다. entity key 없이 embedding만 만들면 검색 결과를 Gold나 catalog와 연결하기 어렵다.",
        steps: [
          ["텍스트 후보 찾기", "review_text, title, description 같은 field를 찾는다."],
          ["연결 키 찾기", "product_id나 entity_id 후보를 붙인다."],
          ["필터 후보 정리", "category, rating, time 같은 metadata 후보를 정리한다."],
        ],
      },
      L9: {
        simpleTitle: "사용자 승인 상태를 공식화하는 단계",
        oneLine: "L9는 Silver와 Gold 추천을 사용자가 승인, 수정, 보류, 거절한 상태로 기록한다.",
        easyMeaning:
          "쉽게 말하면 추천서를 실행 가능한 계약으로 넘기기 전에 사람이 '이대로 가자', '수정하자', 'Gold는 나중에 하자', '거절하자'를 고르는 단계다. Gold-to-Gold도 자동 생성이 아니라 사용자가 만들겠다고 선택해야 한다.",
        why:
          "M3의 추천은 곧바로 실행 명령이 아니다. 승인 상태가 있어야 M2/M5가 어떤 spec을 만들고 저장해야 하는지 안전하게 알 수 있다.",
        inputs: ["L6 Silver draft", "L7 Gold draft", "사용자 결정"],
        outputs: ["approval_state.json", "silver_decision.json", "gold_decision.json"],
        next: "L10/L11 compiler는 승인 상태를 보고 Silver/Gold spec을 만든다.",
        watch:
          "not_requested와 failed를 섞으면 안 된다. Gold가 보류돼도 Silver가 통과할 수 있으면 Silver는 계속 진행해야 한다.",
        steps: [
          ["결정 받기", "Silver와 Gold 각각의 승인 상태를 받는다."],
          ["이유 남기기", "왜 승인/보류/거절했는지 trace를 남긴다."],
          ["실행 범위 제한", "승인된 것만 compiler로 넘긴다."],
        ],
      },
      L10: {
        simpleTitle: "Silver 실행 설계도로 바꾸는 단계",
        oneLine: "L10은 승인된 Silver 추천을 M2가 실행할 수 있는 deterministic transform spec으로 바꾼다.",
        easyMeaning:
          "쉽게 말하면 사람이 승인한 정제 추천서를 Spark가 이해할 수 있는 작업 목록으로 번역하는 단계다. select, cast, normalize 같은 operation을 순서대로 만들고, input_ref와 output_ref로 작업 사이 연결을 명확히 한다.",
        why:
          "M3는 실제 대량 Spark 실행을 맡지 않지만, 변환 방법은 정확히 넘겨야 한다. L10이 있어야 M2가 같은 방식으로 5GB든 100GB든 실행할 수 있다.",
        inputs: ["L9 approval_state", "L6 Silver draft", "L0 source_unit_ids"],
        outputs: ["silver_transform_spec.json", "silver_operations.json"],
        next: "L12가 spec을 검증하고, L13이 Silver preview evidence를 만든다.",
        watch:
          "지원하지 않는 action은 spec에 넣지 말고 unsupported로 보내야 한다. M3 core의 write_mode는 preview_only여야 한다.",
        steps: [
          ["승인 확인", "Silver decision이 실행 가능한 상태인지 본다."],
          ["operation 생성", "select, cast, normalize 같은 작업을 만든다."],
          ["참조 연결", "input_ref와 output_ref로 DAG 연결을 고정한다."],
        ],
      },
      L11: {
        simpleTitle: "Gold 생성 설계도로 바꾸는 단계",
        oneLine: "L11은 승인된 Gold 추천을 M2가 실행할 수 있는 aggregate/project/risk_score spec으로 바꾼다.",
        easyMeaning:
          "쉽게 말하면 product_health 같은 Gold 추천서를 실제 집계 설계도로 바꾸는 단계다. 어떤 컬럼으로 group_by할지, 어떤 measures를 계산할지, time_window와 cardinality_guard가 필요한지 적는다.",
        why:
          "Gold 데이터는 M2가 만들지만 Gold를 어떻게 만들지는 M3가 알려줘야 한다. L11이 없으면 Gold 생성 책임이 공백이 된다.",
        inputs: ["L9 Gold decision", "L7 Gold draft", "L10 Silver output"],
        outputs: ["gold_generation_spec.json", "gold_operations.json"],
        next: "L12가 Gold spec을 검증하고, L14가 Gold readiness를 판단한다.",
        watch:
          "승인되지 않은 Gold는 spec으로 만들면 안 된다. group_by가 너무 커지면 Gold가 raw만큼 커질 수 있으므로 cardinality guard가 필요하다.",
        steps: [
          ["Gold 승인 확인", "approved 상태인 모델만 처리한다."],
          ["집계 설계", "group_by, dimensions, measures를 만든다."],
          ["안전장치 추가", "time_window, zero denominator, cardinality guard를 적는다."],
        ],
      },
      L12: {
        simpleTitle: "Silver/Gold 설계도가 실행 가능한지 검사하는 단계",
        oneLine: "L12는 compiler가 만든 spec이 지원 범위 안에 있는지 검증하고, 안 되는 작업은 보고서로 분리한다.",
        easyMeaning:
          "쉽게 말하면 실행 설계도를 M2에 넘기기 전에 문법 검사와 안전 검사를 하는 단계다. 지원하지 않는 action, 잘못된 ref, production write 같은 위험한 항목을 찾아 pass/warn/block으로 남긴다.",
        why:
          "실행은 M2가 하지만 깨진 spec을 넘기면 결국 M2에서 실패한다. M3는 자신이 만든 계약이 실행 가능한 형태인지 확인해야 한다.",
        inputs: ["L10 silver_spec", "L11 gold_spec", "지원 action 목록"],
        outputs: ["compiler_validation_result.json", "unsupported_action_report.json", "layered_transform_graph.json"],
        next: "L13/L14 preview evidence gate가 validation 결과를 사용한다.",
        watch:
          "stream runtime, watermark, production execution, unstructured retrieval은 core에 억지로 넣지 않고 extension hook으로만 남겨야 한다.",
        steps: [
          ["지원 여부 검사", "operation type이 지원 목록에 있는지 본다."],
          ["참조 검사", "input_ref/output_ref가 artifact_id 규칙을 지키는지 본다."],
          ["결과 판정", "pass, warn, block과 unsupported report를 만든다."],
        ],
      },
      L13: {
        simpleTitle: "Silver preview가 안전한지 보는 단계",
        oneLine: "L13은 Silver spec과 PII/query 노출 상태를 보고 M6에 Silver를 넘겨도 되는지 판단한다.",
        easyMeaning:
          "쉽게 말하면 Silver가 query에 쓸 수 있을 만큼 안전한지 보는 단계다. PII 의심 컬럼, query 금지 컬럼, compiler 상태, 구조 상태를 확인하고 quality_axis를 만든다.",
        why:
          "Silver는 M6 질의의 기본 재료가 될 수 있다. 그래서 Gold가 없어도 Silver 자체가 안전한지 독립적으로 판단해야 한다.",
        inputs: ["L10 silver_spec", "L12 validation", "L6 exposure policy"],
        outputs: ["silver_preview_evidence.json", "pii_exposure_report.json", "quality_axis.json"],
        next: "L15 three-axis gate에서 processing_quality와 catalog_safety 판단에 사용한다.",
        watch:
          "catalog에 보이는 것과 query에서 허용되는 것은 다르다. query_context_exposure가 forbidden이면 M6에 넘기면 안 된다.",
        steps: [
          ["PII 확인", "민감 field와 금지 field를 모은다."],
          ["구조 확인", "compiler와 schema 상태를 본다."],
          ["품질 축 생성", "Silver context ready 여부의 근거를 만든다."],
        ],
      },
      L14: {
        simpleTitle: "Gold preview가 준비됐는지 보는 단계",
        oneLine: "L14는 Gold metric과 사용자의 Gold 결정 상태를 보고 Gold를 쓸 수 있는지 판단한다.",
        easyMeaning:
          "쉽게 말하면 Gold가 요청됐는지, 승인됐는지, metric 계산 근거가 충분한지, caveat가 필요한지 보는 단계다. Gold가 not_requested나 deferred여도 실패가 아니라 공식 상태로 남긴다.",
        why:
          "Gold는 Silver 위에 얹히는 선택 결과다. Gold가 준비 안 됐다고 Silver까지 실패 처리하면 안 되므로 별도 readiness evidence가 필요하다.",
        inputs: ["L11 gold_spec", "L9 gold_decision", "L7 metric draft"],
        outputs: ["gold_preview_evidence.json", "gold_readiness_axis.json", "metric_caveats.json"],
        next: "L15가 Gold axis로 받아 Silver readiness와 분리해 판단한다.",
        watch:
          "metric evidence가 약하면 warn이나 block이어야 한다. 없는 delivery 근거로 late_delivery_rate를 계산하면 안 된다.",
        steps: [
          ["요청 상태 확인", "not_requested, deferred, approved를 구분한다."],
          ["metric 근거 확인", "required_source_evidence와 available_fields를 비교한다."],
          ["주의사항 남기기", "zero denominator, missing evidence 같은 caveat를 적는다."],
        ],
      },
      L15: {
        simpleTitle: "세 축으로 최종 준비 상태를 판단하는 단계",
        oneLine: "L15는 Silver 품질, catalog/query 안전성, Gold 준비 상태를 분리해서 최종 gate를 만든다.",
        easyMeaning:
          "쉽게 말하면 한 줄짜리 합격/불합격이 아니라 세 개의 신호등을 따로 보는 단계다. Silver 처리 품질이 통과했는지, M6 query에 안전한지, Gold가 준비됐는지를 따로 본다. Gold가 막혀도 Silver가 준비됐으면 Silver context는 ready일 수 있다.",
        why:
          "Gold readiness가 Silver context를 오염시키면 M6가 쓸 수 있는 Silver까지 막힌다. 그래서 세 축 precedence rule이 필요하다.",
        inputs: ["L13 Silver evidence", "L14 Gold evidence", "L9 approval_state"],
        outputs: ["gate_summary.json", "processing_quality_axis.json", "catalog_safety_axis.json", "gold_readiness_axis.json"],
        next: "L16은 m6_context_status를 그대로 받아 catalog/query/vector handoff package를 만든다.",
        watch:
          "L15와 L16의 m6_context_status가 다르면 block이어야 한다. Gold not_requested/deferred는 실패가 아니라 상태다.",
        steps: [
          ["Silver 축 판단", "processing_quality와 catalog_safety를 본다."],
          ["Gold 축 판단", "gold_readiness를 별도로 적용한다."],
          ["M6 상태 요약", "Silver/Gold context를 M6가 써도 되는지 만든다."],
        ],
      },
      L16: {
        simpleTitle: "다른 M에게 넘길 최종 패키지를 만드는 단계",
        oneLine: "L16은 catalog, SQL context, vector handoff, export spec을 한 묶음으로 만들어 M5/M6/M1에 넘긴다.",
        easyMeaning:
          "쉽게 말하면 지금까지 만든 계약서를 최종 폴더에 정리하는 단계다. M5가 저장할 catalog sync package, M6가 질의할 SQL context, vectorDB에 넣을 semantic template, M2가 실행할 transform spec export를 묶는다. 실제 catalog DB write나 SQL serving은 M3 책임이 아니다.",
        why:
          "M3가 아무리 좋은 추천과 spec을 만들어도 다른 M이 읽을 수 있는 최종 패키지가 없으면 프로젝트 흐름이 닫히지 않는다. L16은 M3 산출물을 다른 모듈이 소비할 수 있는 형태로 잠근다.",
        inputs: ["L15 gate_summary", "L10/L11 spec", "L13/L14 evidence", "L8 vector template"],
        outputs: ["catalog_sync_contract_package.json", "sql_context_pack.json", "semantic_catalog_vector_index_template.json", "exports/*"],
        next: "M5는 저장/workflow/catalog API에 연결하고, M6는 SQL/AI query context로 사용하고, M2는 transform spec을 실행한다.",
        watch:
          "*_ref는 실제 경로가 아니라 artifact_id 문자열이다. 실제 위치는 artifact_reference_manifest에서 resolve한다. M3가 운영 저장소를 직접 소유한다고 말하면 안 된다.",
        steps: [
          ["상태 묶기", "m6_context_status와 gate 결과를 최종 package에 넣는다."],
          ["질의 문맥 만들기", "allowed_tables, allowed_columns, caveats를 정리한다."],
          ["참조표 만들기", "artifact_id를 physical_uri, checksum, byte_size와 연결한다."],
        ],
      },
    };
  }

  function directLayerEasyDetailMap() {
    return {};
  }

  function directLayerExamplesMap() {
    return {};
  }

  function buildPlainLanguageBoard(layerId, plain, detail, example, artifact) {
    const paragraphs = detail.paragraphs || [];
    if (!plain.simpleTitle && !detail.title && !paragraphs.length) return null;

    const board = document.createElement("div");
    board.className = "plain-language-board";

    const header = document.createElement("div");
    header.className = "plain-header";
    const titleGroup = document.createElement("div");
    const kicker = document.createElement("span");
    kicker.className = "plain-kicker";
    kicker.textContent = "쉬운 말 종합 설명";
    const title = document.createElement("h3");
    title.textContent = detail.title || `쉽게 말하면: ${plain.simpleTitle}`;
    titleGroup.append(kicker, title);
    const meta = document.createElement("div");
    meta.className = "plain-meta";
    appendPlainChip(meta, layerId);
    appendPlainChip(meta, "입력 -> 판단 -> 산출물 -> 전달");
    appendPlainChip(meta, "코드 근거 아래 연결");
    header.append(titleGroup, meta);
    board.appendChild(header);

    const layout = document.createElement("div");
    layout.className = "plain-layout";

    const prose = document.createElement("div");
    prose.className = "plain-prose";
    if (plain.oneLine) {
      const oneLine = document.createElement("p");
      oneLine.className = "plain-one-line";
      oneLine.textContent = plain.oneLine;
      prose.appendChild(oneLine);
    }
    const operationParagraphs = paragraphs.length
      ? paragraphs
      : [plain.easyMeaning, plain.why, buildOperationFallback(plain), plain.watch].filter(Boolean);
    operationParagraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      prose.appendChild(paragraph);
    });
    layout.appendChild(prose);

    const facts = document.createElement("aside");
    facts.className = "plain-facts";
    appendPlainFact(facts, "받는 것", plain.inputs);
    appendPlainFact(facts, "만드는 것", plain.outputs || artifact.outputs);
    appendPlainFact(facts, "다음으로 넘김", plain.next || artifact.next);
    appendPlainFact(facts, "주의할 점", plain.watch);
    if (detail.checkpoints?.length) appendPlainFact(facts, "읽을 때 확인할 기준", detail.checkpoints);
    layout.appendChild(facts);

    board.appendChild(layout);

    const exampleBoard = buildExampleBoard(example);
    if (exampleBoard) board.appendChild(exampleBoard);

    if (plain.steps?.length) {
      const operation = document.createElement("div");
      operation.className = "plain-operation";
      const operationTitle = document.createElement("strong");
      operationTitle.textContent = "코드가 실제로 굴러가는 순서";
      operation.appendChild(operationTitle);
      const track = document.createElement("div");
      track.className = "plain-operation-track";
      plain.steps.forEach(([label, text], index) => {
        const item = document.createElement("div");
        item.className = "plain-operation-item";
        const badge = document.createElement("span");
        badge.textContent = `${index + 1}`;
        const body = document.createElement("div");
        const itemTitle = document.createElement("b");
        itemTitle.textContent = label;
        const itemText = document.createElement("p");
        itemText.textContent = text;
        body.append(itemTitle, itemText);
        item.append(badge, body);
        track.appendChild(item);
      });
      operation.appendChild(track);
      board.appendChild(operation);
    }

    return board;
  }

  function buildExampleBoard(example) {
    if (!example.title && !example.situation) return null;
    const wrapper = document.createElement("div");
    wrapper.className = "plain-example";

    const header = document.createElement("div");
    header.className = "plain-example-header";
    const title = document.createElement("strong");
    title.textContent = example.title || "예시로 보면";
    header.appendChild(title);
    wrapper.appendChild(header);

    if (example.situation) {
      const situation = document.createElement("p");
      situation.className = "plain-example-situation";
      situation.textContent = example.situation;
      wrapper.appendChild(situation);
    }

    const grid = document.createElement("div");
    grid.className = "plain-example-grid";
    appendExampleColumn(grid, "M3가 하는 행동", example.action);
    appendExampleColumn(grid, "그래서 생기는 결과", example.result);
    appendExampleColumn(grid, "사용자가 보면 되는 것", example.userCheck);
    if (grid.children.length) wrapper.appendChild(grid);
    return wrapper;
  }

  function appendExampleColumn(container, label, value) {
    if (!value || (Array.isArray(value) && !value.length)) return;
    const column = document.createElement("div");
    column.className = "plain-example-column";
    const title = document.createElement("b");
    title.textContent = label;
    column.appendChild(title);
    if (Array.isArray(value)) {
      const list = document.createElement("ul");
      value.forEach((item) => {
        if (!item) return;
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      column.appendChild(list);
    } else {
      const text = document.createElement("p");
      text.textContent = value;
      column.appendChild(text);
    }
    container.appendChild(column);
  }

  function buildOperationFallback(plain) {
    if (!plain.steps?.length) return "";
    const stepText = plain.steps.map(([label, text]) => `${label}: ${text}`).join(" ");
    return `실제로는 ${stepText} 이 흐름으로 움직이고, 결과는 ${Array.isArray(plain.outputs) ? plain.outputs.join(", ") : plain.outputs || "다음 산출물"}에 기록된다.`;
  }

  function appendPlainChip(container, text) {
    if (!text) return;
    const chip = document.createElement("span");
    chip.className = "plain-chip";
    chip.textContent = text;
    container.appendChild(chip);
  }

  function appendPlainFact(container, label, value) {
    if (!value || (Array.isArray(value) && !value.length)) return;
    const block = document.createElement("div");
    block.className = "plain-fact";
    const title = document.createElement("strong");
    title.textContent = label;
    block.appendChild(title);
    if (Array.isArray(value)) {
      const list = document.createElement("ul");
      value.forEach((item) => {
        if (!item) return;
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      block.appendChild(list);
    } else {
      const text = document.createElement("p");
      text.textContent = value;
      block.appendChild(text);
    }
    container.appendChild(block);
  }

  function buildSummaryBoard(layerId, analysis, artifact, snippetCount) {
    const board = document.createElement("div");
    board.className = "layer-summary-board";

    const header = document.createElement("div");
    header.className = "summary-header";
    const title = document.createElement("h3");
    title.textContent = "\uD55C\uB208 \uC694\uC57D";
    const meta = document.createElement("div");
    meta.className = "summary-meta";
    appendChip(meta, layerId);
    appendChip(meta, `code snippets ${snippetCount}`);
    extractMReferences(analysis).forEach((ref) => appendChip(meta, ref));
    header.append(title, meta);
    board.appendChild(header);

    const cards = document.createElement("div");
    cards.className = "summary-card-grid";
    appendSummaryCard(cards, "\uC774 \uB2E8\uACC4\uC758 \uC5ED\uD560", analysis.function);
    appendSummaryCard(cards, "\uC8FC\uC694 \uC0B0\uCD9C\uBB3C", artifact.outputs);
    appendSummaryCard(cards, "\uB2E4\uC74C\uC73C\uB85C \uB118\uAE30\uB294 \uAC83", artifact.next || analysis.effect);
    appendSummaryCard(cards, "\uAC80\uC99D \uAE30\uC900", analysis.usage);
    board.appendChild(cards);

    const flow = document.createElement("div");
    flow.className = "summary-flow";
    buildFlowItems(layerId).forEach((item) => {
      const node = document.createElement(item.href ? "a" : "div");
      node.className = `flow-node ${item.active ? "active" : ""}`;
      if (item.href) {
        node.href = item.href;
        node.setAttribute("aria-label", `${item.title} 화면으로 이동`);
        node.dataset.linkLabel = item.active ? "현재" : "열기";
      }
      const nodeTitle = document.createElement("strong");
      nodeTitle.textContent = item.title;
      const nodeText = document.createElement("span");
      nodeText.textContent = item.text;
      node.append(nodeTitle, nodeText);
      flow.appendChild(node);
    });
    board.appendChild(flow);

    const boundary = document.createElement("div");
    boundary.className = "boundary-note";
    appendKicker(boundary, "\uBC94\uC704 \uBC16 / \uC624\uD574\uD558\uBA74 \uC548 \uB418\uB294 \uAC83");
    appendParagraph(boundary, analysis.limits);
    board.appendChild(boundary);

    return board;
  }

  function appendChip(container, text) {
    if (!text) return;
    const chip = document.createElement("span");
    chip.className = "summary-chip";
    chip.textContent = text;
    container.appendChild(chip);
  }

  function appendSummaryCard(container, label, value) {
    if (!value) return;
    const card = document.createElement("div");
    card.className = "summary-card";
    const title = document.createElement("strong");
    title.textContent = label;
    const text = document.createElement("p");
    text.textContent = value;
    card.append(title, text);
    container.appendChild(card);
  }

  function extractMReferences(analysis) {
    const text = [analysis.choice, analysis.function, analysis.effect, analysis.limits, analysis.usage]
      .filter(Boolean)
      .join(" ");
    const refs = ["M1", "M2", "M3", "M4", "M5", "M6"].filter((item) => text.includes(item));
    return refs.length ? refs : ["M3"];
  }

  function buildFlowItems(layerId) {
    const current = Number(layerId.slice(1));
    const items = [];
    if (current > 0) {
      items.push({ title: `L${current - 1}`, text: "\uC774\uC804 evidence / decision", active: false, href: `l${current - 1}.html` });
    } else {
      items.push({ title: "\uC785\uB825", text: "raw source", active: false, href: "../index.html#flow" });
    }
    items.push({ title: layerId, text: "M3 contract output", active: true, href: "#source-code-side-by-side" });
    if (current < 16) {
      items.push({ title: `L${current + 1}`, text: "\uB2E4\uC74C layer handoff", active: false, href: `l${current + 1}.html` });
    } else {
      items.push({ title: "\uC804\uB2EC", text: "M5/M6 handoff", active: false, href: "../index.html#matrix" });
    }
    return items;
  }

  function enhanceLayerStepLinks(currentLayerId) {
    const currentNumber = Number(currentLayerId.slice(1));
    document.querySelectorAll(".visual .step").forEach((step) => {
      if (step.tagName === "A" || step.closest("a")) return;
      const label = step.querySelector("b")?.textContent.trim();
      const singleLayerMatch = label?.match(/^L(\d+)$/);
      const layerRangeMatch = label?.match(/^L(\d+)-L(\d+)$/);
      const externalMatch = label?.match(/^(M\d+|Vector)$/);
      if (!singleLayerMatch && !layerRangeMatch && !externalMatch) return;
      const targetNumber = Number(singleLayerMatch?.[1] || layerRangeMatch?.[1] || currentNumber);
      const link = document.createElement("a");
      link.className = step.className;
      link.href = externalMatch ? "../index.html#matrix" : targetNumber === currentNumber ? "#source-code-side-by-side" : `l${targetNumber}.html`;
      link.setAttribute("aria-label", `${label} 상세 화면으로 이동`);
      link.dataset.linkLabel = externalMatch ? "책임표" : layerRangeMatch ? "시작" : targetNumber === currentNumber ? "현재" : "열기";
      while (step.firstChild) link.appendChild(step.firstChild);
      step.replaceWith(link);
    });
  }

  function injectLineExplanationShortcut(section) {
    const actions = document.querySelector(".top-actions");
    if (!actions || actions.querySelector('[href="#source-code-side-by-side"]')) return;
    const link = document.createElement("a");
    link.href = "#source-code-side-by-side";
    link.textContent = "줄별 코드";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.replaceState(null, "", "#source-code-side-by-side");
      window.scrollTo({ top: Math.max(section.offsetTop - 76, 0), behavior: "smooth" });
    });
    actions.appendChild(link);
  }

  function buildLayerOverview(analysis) {
    if (!analysis.choice && !analysis.function && !analysis.effect) return null;
    const wrapper = document.createElement("div");
    wrapper.className = "decision-overview";

    const layout = document.createElement("div");
    layout.className = "decision-layout";

    const hero = document.createElement("div");
    hero.className = "decision-hero";
    appendKicker(hero, "\uC120\uD0DD \uC774\uC720");
    appendParagraph(hero, analysis.choice);
    layout.appendChild(hero);

    const strip = document.createElement("div");
    strip.className = "decision-strip";
    appendMiniBlock(strip, "\uD575\uC2EC \uAE30\uB2A5", analysis.function);
    appendMiniBlock(strip, "\uD6A8\uACFC", analysis.effect);
    appendMiniBlock(strip, "\uD55C\uACC4", analysis.limits);
    layout.appendChild(strip);

    wrapper.appendChild(layout);

    const columns = document.createElement("div");
    columns.className = "analysis-columns";
    appendAnalysisPanel(columns, "\uC7A5\uC810", analysis.advantages, "good");
    appendAnalysisPanel(columns, "\uB2E8\uC810 / \uD2B8\uB808\uC774\uB4DC\uC624\uD504", analysis.tradeoffs, "risk");
    appendAnalysisPanel(columns, "\uC6B4\uC601 \uAE30\uC900", analysis.usage, "ops");
    wrapper.appendChild(columns);
    return wrapper;
  }

  function appendKicker(container, label) {
    const kicker = document.createElement("span");
    kicker.className = "decision-kicker";
    kicker.textContent = label;
    container.appendChild(kicker);
  }

  function appendParagraph(container, value) {
    if (!value) return;
    const text = document.createElement("p");
    text.textContent = value;
    container.appendChild(text);
  }

  function appendMiniBlock(container, label, value) {
    if (!value) return;
    const block = document.createElement("div");
    block.className = "decision-mini";
    const title = document.createElement("strong");
    title.textContent = label;
    const text = document.createElement("p");
    text.textContent = value;
    block.append(title, text);
    container.appendChild(block);
  }

  function appendAnalysisPanel(container, label, value, tone) {
    if (!value || (Array.isArray(value) && !value.length)) return;
    const panel = document.createElement("div");
    panel.className = `analysis-panel ${tone}`;
    const title = document.createElement("strong");
    title.textContent = label;
    panel.appendChild(title);
    if (Array.isArray(value)) {
      const list = document.createElement("ul");
      value.forEach((item) => {
        if (!item) return;
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      panel.appendChild(list);
    } else {
      appendParagraph(panel, value);
    }
    container.appendChild(panel);
  }

  function appendEvidenceRow(container, label, value) {
    const row = document.createElement("div");
    row.className = "evidence-row";
    const title = document.createElement("span");
    title.textContent = label;
    const text = document.createElement("p");
    text.textContent = value;
    row.append(title, text);
    container.appendChild(row);
  }

  function appendTermRow(container, term, meaning, note) {
    const row = document.createElement("div");
    row.className = "term-row";
    const code = document.createElement("code");
    code.textContent = term;
    const body = document.createElement("div");
    const meaningText = document.createElement("p");
    meaningText.textContent = meaning;
    body.appendChild(meaningText);
    if (note) {
      const noteText = document.createElement("span");
      noteText.textContent = note;
      body.appendChild(noteText);
    }
    row.append(code, body);
    container.appendChild(row);
  }

  function getCodeGlossary(currentLayerId, title) {
    const rows = window.M3_CODE_GLOSSARY?.[currentLayerId]?.[title] || [];
    return rows.filter((row) => !looksBrokenText(`${row.term || ""} ${row.meaning || ""} ${row.note || ""}`));
  }

  function buildContractTermBoard(currentLayerId, title) {
    const rows = getBlockContractTerms(currentLayerId, title);
    if (!rows.length) return null;

    const board = document.createElement("div");
    board.className = "contract-term-board";

    const header = document.createElement("div");
    header.className = "contract-term-header";
    const heading = document.createElement("strong");
    heading.textContent = "이 블럭의 계약 단어";
    const lead = document.createElement("p");
    lead.textContent =
      "코드를 읽을 때 헷갈리는 식별자와 필드를 쉬운 말로 푼 것이다. 뜻만 보지 말고 왜 필요한지와 없으면 어떤 연결이 깨지는지를 같이 봐야 한다.";
    header.append(heading, lead);
    board.appendChild(header);

    const list = document.createElement("div");
    list.className = "contract-term-list";
    rows.forEach((row) => appendContractTermRow(list, row));
    board.appendChild(list);
    return board;
  }

  function appendContractTermRow(container, row) {
    const item = document.createElement("article");
    item.className = "contract-term-row";

    const term = document.createElement("code");
    term.className = "contract-term-name";
    term.textContent = row.term;

    const detail = document.createElement("div");
    detail.className = "contract-term-detail";
    detail.append(
      buildContractTermCell("뜻", row.meaning),
      buildContractTermCell("왜 필요한가", row.why),
      buildContractTermCell("없으면 깨지는 것", row.breaks),
      buildContractTermCell("이 블럭에서는", row.here, row.example)
    );

    item.append(term, detail);
    container.appendChild(item);
  }

  function buildContractTermCell(label, text, extra) {
    const cell = document.createElement("div");
    cell.className = "contract-term-cell";
    const title = document.createElement("b");
    title.textContent = label;
    const body = document.createElement("p");
    body.textContent = text || "이 블럭에서 값이 만들어지거나 다음 단계로 전달된다.";
    cell.append(title, body);
    if (extra) {
      const note = document.createElement("span");
      note.textContent = extra;
      cell.appendChild(note);
    }
    return cell;
  }

  function getBlockContractTerms(currentLayerId, title) {
    const blockMap = blockContractTermMap();
    const dictionary = contractTermDictionary();
    const items = blockMap[currentLayerId]?.[title] || [];
    return items.map(([term, here, example]) => {
      const base = dictionary[term] || {
        meaning: `${term}은 이 블럭에서 쓰는 계약 필드다. 단순 변수명이 아니라 다음 L단계나 다른 M이 같은 뜻으로 읽어야 하는 이름이다.`,
        why: "이름과 의미가 고정되어야 M2, M5, M6가 추측하지 않고 같은 값을 사용할 수 있다.",
        breaks: "정의가 없으면 downstream이 이 값이 식별자인지, 상태인지, 계산 결과인지 다시 추측해야 한다.",
      };
      return { term, meaning: base.meaning, why: base.why, breaks: base.breaks, here, example };
    });
  }

  function blockContractTermMap() {
    return {
      L0: {
        "build_l0() signature and setup": [
          ["source", "사용자가 넘긴 원본 파일 또는 폴더 위치다. L0는 여기서부터 원본을 찾지만, 원본 내용을 복사하거나 바꾸지는 않는다.", "예: F:/ai/raw/reviews 또는 F:/ai/nyc-taxi-data-20gb"],
          ["out_dir", "M3가 manifest와 replay pointer 같은 계약 산출물을 저장할 위치다. raw 저장소가 아니라 M3 설명서 저장소라고 보면 된다.", "raw는 그대로 두고 out_dir 아래에 l0/object_stream_manifest.json 같은 파일만 생긴다."],
          ["source_id", "데이터 소스를 부르는 안정적인 이름이다. 파일명이 바뀌어도 같은 업무 소스라면 source_id로 묶어 추적한다.", "예: amazon_reviews, nyc_taxi"],
          ["run_id", "같은 source_id를 여러 번 분석했을 때 실행 회차를 구분한다. 재실행, 비교, rollback을 위해 필요하다.", "예: run_20260630_001"],
          ["checksum_bytes", "prefix checksum 모드에서 앞부분을 몇 byte 읽을지 정한다. 8 * 1024 * 1024는 8 MiB라서 대용량에서 비용을 줄이는 기본값이다.", "1024는 컴퓨터 저장 단위 기준이다. 1024 byte = 1 KiB, 1024 * 1024 byte = 1 MiB다."],
        ],
        "object and source_unit construction": [
          ["object_id", "원본 저장소에 있는 물리 파일 또는 object 하나를 부르는 이름이다. 파일의 실제 덩어리에 붙는 번호표다.", "path가 바뀌어도 object_id로 같은 원본 조각을 계속 가리킬 수 있다."],
          ["source_unit_id", "처리 단위를 부르는 이름이다. 지금은 파일 하나가 unit 하나지만, 나중에는 여러 파일 묶음이나 stream window 하나가 unit이 될 수 있다.", "object_id는 물리 덩어리, source_unit_id는 처리 범위다. 둘은 항상 1:1이라고 가정하면 안 된다."],
          ["path", "이 컴퓨터 파일 시스템에서 보이는 경로다. 사람이 로컬에서 열어보기 쉽지만, 다른 서버나 MinIO/S3에서는 그대로 통하지 않을 수 있다.", "D:/data/a.json은 내 컴퓨터에서는 열려도 M2 Spark 컨테이너에서는 존재하지 않을 수 있다."],
          ["uri", "저장소 종류까지 포함해서 원본 위치를 표현하는 주소다. file://, s3://, minio://처럼 다른 실행 환경에서도 같은 대상을 찾게 해준다.", "path만으로는 로컬 전용이다. uri가 있어야 M2/M5가 로컬, MinIO, S3 중 어디를 봐야 하는지 안다."],
          ["etag", "object store가 주는 객체 버전 또는 내용 식별자다. 로컬 파일에는 없을 수 있지만 MinIO/S3에서는 같은 path라도 내용 변경을 잡는 근거가 된다.", "같은 s3://bucket/a.json이라도 etag가 달라지면 다른 내용으로 봐야 한다."],
          ["checksum", "원본 내용의 지문이다. path나 uri가 같아도 내용이 바뀌었는지 확인하는 마지막 안전장치다.", "etag가 없는 로컬 파일에서도 checksum이 있으면 재현성과 변경 감지가 가능하다."],
        ],
        "manifest artifacts and replay pointer": [
          ["source_units", "L0가 만든 처리 단위 목록이다. L1~L16은 이 목록의 source_unit_id를 따라가며 같은 범위를 말한다.", "orphan source_unit이 있으면 Bronze/Silver/Gold lineage가 끊긴다."],
          ["objects", "원본 파일/object들의 물리 metadata 목록이다. uri, path, checksum, size 같은 원본 찾기 정보가 여기에 모인다.", "source_unit이 object_id를 가리키는데 objects에 없으면 replay가 불가능하다."],
          ["raw_replay_pointer", "나중에 같은 원본 조각을 다시 읽기 위한 지도다. M3는 raw를 복사하지 않으므로 replay pointer가 원본 재접근 계약이 된다.", "문제 발생 시 M2/M5가 이 pointer로 원본 record를 다시 찾는다."],
          ["copy_raw_payload", "M3 산출물 안에 raw payload를 복사하지 않는다는 정책 표시다. 대용량과 민감정보 때문에 필요하다.", "true가 되면 M3가 raw 저장소 역할까지 떠안게 되어 범위가 깨진다."],
          ["mutate_raw_payload", "M3가 원본 값을 바꾸지 않는다는 정책 표시다. L0는 보존과 식별만 한다.", "원본을 바꾸면 이후 checksum/replay/감사 기준이 전부 흔들린다."],
        ],
      },
      L1: {
        "build_l1() and Bronze manifests": [
          ["max_rows", "샘플로 읽을 record 개수 상한이다. 전체 데이터를 다 읽지 않고도 구조를 볼 수 있게 막는 안전장치다.", "실시간/대용량이면 모든 row를 L1에서 다 보는 순간 M3가 실행 엔진이 된다."],
          ["max_bytes", "샘플로 읽을 byte 상한이다. row 수가 작아도 한 row가 너무 크면 비용이 커지므로 byte로도 막는다.", "JSON 한 줄이 수십 MB일 수도 있어 row limit만으로는 부족하다."],
          ["object_by_path", "L0 object metadata를 path로 빠르게 찾는 lookup이다. sample record가 어떤 object에서 왔는지 붙이기 위해 쓴다.", "path lookup이 없으면 line을 읽어도 object_id와 연결하지 못한다."],
          ["envelope_manifest", "Bronze sample이 어떤 공통 껍데기 형식을 가져야 하는지 적은 문서다. parse 성공/실패와 locator를 같은 모양으로 담는다.", "M2가 전체 Bronze를 만들 때 이 형식을 따라 실행한다."],
          ["body", "artifact_header 아래 실제 업무 내용이 들어가는 영역이다. header는 공통 식별자, body는 이 L단계 고유 내용이다.", "body가 흐리면 downstream은 header만 보고 실제 규칙을 알 수 없다."],
        ],
        "rescue lane and envelope spec": [
          ["rescue_manifest", "parse 실패나 타입 충돌을 버리지 않고 따로 보관하는 차선 규칙이다. 나쁜 row도 증거로 남겨야 한다.", "실패 row를 삭제하면 품질 수치가 좋아 보이는 거짓 결과가 된다."],
          ["envelope_spec", "Bronze record가 가져야 할 필수 컬럼과 locator 규칙을 선언한 spec이다.", "M2가 Spark로 전체 Bronze를 만들 때 이 spec을 실행 기준으로 삼는다."],
          ["json_path", "JSON 내부에서 값이 어디에 있었는지 표시하는 경로다. 중첩 JSON을 다시 찾아가기 위해 필요하다.", "line_number만으로는 JSON 객체 안의 어떤 필드가 문제인지 알기 어렵다."],
          ["record_locator", "원본 record를 다시 찾는 위치 정보 묶음이다. object_id, line_number, byte range, json_path 같은 값이 들어간다.", "locator가 없으면 Silver 오류가 나도 원본으로 돌아갈 수 없다."],
          ["parse_status", "record가 정상 parse인지, 실패인지, rescue 대상인지 나타내는 상태값이다.", "상태가 없으면 실패 row를 정상 row처럼 처리할 위험이 있다."],
        ],
        "_sample_bronze_records() line reader": [
          ["source_object", "현재 읽는 원본 object metadata다. sample record에 object_id와 uri를 붙이기 위해 필요하다.", "record만 따로 떼면 어느 파일에서 왔는지 잃어버린다."],
          ["path", "로컬에서 실제 줄을 읽기 위해 여는 파일 경로다. 실행 중 파일 read에는 path가 편하다.", "단, 계약 전달에는 uri도 같이 필요하다. path는 이 머신 기준이기 때문이다."],
          ["byte_start", "record가 원본 파일 안에서 시작한 byte 위치다. 줄 번호가 애매한 포맷에서도 위치를 잡는 기준이다.", "멀티바이트 문자나 줄바꿈 차이가 있어도 byte offset은 replay에 강하다."],
          ["line_number", "텍스트 파일에서 사람이 확인하기 쉬운 줄 번호다. 디버깅과 샘플 검토에 좋다.", "line_number만으로는 압축/멀티라인/바이너리 포맷 replay가 약하다."],
          ["payload", "샘플로 잘라온 record 내용이다. 구조 분석을 위해 제한적으로만 들고 온다.", "payload를 무제한으로 담으면 M3 산출물이 raw 복제본이 된다."],
        ],
      },
      L2: {
        "field summary helpers": [
          ["sample_count", "profile을 만들 때 실제로 본 sample record 수다. 통계의 신뢰 범위를 판단하는 기준이다.", "sample_count가 작으면 type/null 판단은 확정이 아니라 힌트로만 봐야 한다."],
          ["fields", "발견된 column 또는 JSON path 목록이다. Silver 추천과 catalog 초안의 기본 재료다.", "fields가 없으면 AI가 무엇을 정제할지 판단할 근거가 없다."],
          ["type_counts", "같은 field에서 관측된 타입 분포다. 문자열/숫자/null이 섞이는지 보는 데 쓴다.", "type conflict를 모르면 Silver cast 정책이 위험해진다."],
          ["null_count", "field가 비어 있거나 없는 횟수다. nullable, drop, fill 추천의 근거가 된다.", "null 비율을 모르면 필수 컬럼인지 선택 컬럼인지 판단하기 어렵다."],
        ],
        "JSON and CSV profilers": [
          ["parse_errors", "JSON/CSV 파싱 중 발생한 오류 수와 예시다. rescue lane과 품질 경고의 근거다.", "오류를 숨기면 unknown data가 정상처럼 보인다."],
          ["has_header", "CSV 첫 줄이 컬럼명인지 데이터인지 판단한 결과다. header가 틀리면 모든 컬럼명이 밀린다.", "header 오판은 Silver schema 전체를 망가뜨린다."],
          ["width_conflicts", "CSV row마다 컬럼 개수가 달라지는 문제다. delimiter, quote, 깨진 row를 의심해야 한다.", "폭 충돌을 무시하면 row 값이 잘못된 컬럼으로 들어간다."],
          ["record_count", "profile에서 본 record 수다. JSON/CSV profiler 결과가 어느 정도 표본에서 나온 것인지 보여준다.", "count 없이 비율만 있으면 판단 근거가 약해진다."],
        ],
        "data shape contract": [
          ["data_shape_contract", "이 데이터가 core에서 처리 가능한 모양인지, extension이 필요한지 적은 계약이다.", "M2/M5가 실행 전에 위험한 포맷을 알 수 있다."],
          ["source_unit_ids", "profile이 어떤 L0 처리 단위에서 나온 것인지 묶는 목록이다.", "profile이 원본 범위와 연결되지 않으면 drift 비교와 replay가 불가능하다."],
          ["object_ids", "profile이 실제 어떤 원본 object들을 보고 만든 것인지 나타낸다.", "source_unit이 여러 object를 포함할 수 있으므로 object_ids를 따로 둔다."],
          ["structure_class", "flat table, nested JSON, semi-structured 같은 구조 분류다.", "구조를 알아야 Silver가 flatten할지, json으로 보존할지 추천할 수 있다."],
          ["core_status", "M3 core 계약으로 충분한지, extension hook이 필요한지 나타낸다.", "stream runtime, watermark, unstructured retrieval 같은 것은 core에 억지로 넣지 않기 위해 필요하다."],
        ],
        "build_l2() routing and artifact creation": [
          ["format_hint", "사용자가 알려준 포맷 힌트다. 자동 감지와 충돌하면 경고 근거가 된다.", "힌트가 틀릴 수 있으므로 그대로 믿지 않고 sample과 비교한다."],
          ["schema_basis", "schema 판단이 어떤 표본과 규칙에 기반했는지 적는다.", "나중에 왜 이 타입을 추천했는지 설명할 수 있어야 한다."],
          ["format_detection", "CSV/JSON/JSONL 등 포맷 감지 결과 artifact다.", "format이 정해져야 parser와 Silver 추천 방식이 정해진다."],
          ["schema_fingerprint", "현재 schema/profile 모양의 지문이다. 다음 실행과 비교해 drift를 찾는다.", "field가 늘거나 타입이 바뀌었는지 빠르게 비교할 수 있다."],
          ["profile_body", "field 통계, parser 통계, shape contract를 묶은 실제 profile 내용이다.", "L3 AI 입력은 raw가 아니라 이 profile_body를 줄여 만든다."],
        ],
      },
      L3: {
        "build_l3() field evidence reduction": [
          ["field_evidence", "AI에게 넘겨도 되는 field별 요약 증거다. raw 전체가 아니라 이름, 타입, null 비율, 예시 일부만 담는다.", "AI가 판단하려면 근거가 필요하지만 대용량 raw를 직접 보면 안 된다."],
          ["redaction_map", "PII 의심 예시를 어떤 방식으로 가렸는지 남기는 지도다.", "값을 가리기만 하고 기록을 안 남기면 추천 근거를 검증할 수 없다."],
          ["pii_handling", "none, mask, hash 중 어떤 PII 처리를 추천하는지 나타낸다.", "PII 처리와 catalog/query 노출 여부를 섞지 않기 위해 분리한다."],
          ["input_pack", "AI 추천 단계에 들어가는 안전한 입력 묶음이다.", "L3의 핵심은 AI가 볼 수 있는 작은 control-plane 입력을 만드는 것이다."],
          ["source_processing_contract", "이 소스가 batch/object 기반인지, stream/extension이 필요한지 전달하는 처리 계약이다.", "실시간 data-plane을 AI가 전부 보겠다는 거짓 설계를 막는다."],
        ],
        "evidence reducer and policy context": [
          ["policy_context", "AI 추천이 지켜야 할 금지/허용 규칙이다. raw 전체 금지, PII 노출 금지 같은 원칙이 들어간다.", "AI가 좋은 아이디어를 내도 계약을 어기면 downstream에서 쓸 수 없다."],
          ["source_processing_contract", "M3가 추천만 하고 실제 대량 실행은 M2가 한다는 경계를 적는다.", "경계가 없으면 M3가 Spark 실행 책임까지 가진 것처럼 보인다."],
          ["access_class", "artifact를 누가 볼 수 있는지 등급을 표시한다.", "AI 입력과 catalog 입력은 보안 등급이 다를 수 있다."],
        ],
        "unknown data recommendation pack and domain signals": [
          ["unknown_data_recommendation_pack", "모르는 구조의 CSV/JSON이 와도 공통적으로 추천할 수 있게 만든 입력 묶음이다.", "특정 Amazon/Taxi 데이터에 오버피팅하지 않기 위해 필요하다."],
          ["domain_signals", "product, review, conversion, delivery처럼 의미 있는 신호 후보를 적은 목록이다.", "Gold 추천은 컬럼명만이 아니라 어떤 업무 신호가 있는지 봐야 한다."],
          ["vector_candidates", "schema/profile/catalog metadata를 vectorDB에 넣어 검색할 수 있는 후보 문서다.", "Gold template을 찾을 때 raw가 아니라 metadata를 검색하게 만든다."],
          ["signal_defs", "각 domain signal이 어떤 hint를 요구하는지 적는다.", "없는 signal을 있다고 우기지 않기 위해 required evidence를 둔다."],
          ["required_hints", "그 signal을 인정하려면 필요한 field hint 목록이다.", "예를 들어 conversion에는 view와 purchase 계열 근거가 필요하다."],
        ],
      },
      L4: {
        "metadata retrieval index plan": [
          ["metadata_retrieval_index_plan", "schema/profile/catalog metadata를 검색 가능한 문서로 만들 계획이다.", "AI가 Gold template을 고를 때 기억이 아니라 근거 문서를 찾게 한다."],
          ["gold_template", "만들 수 있을 법한 Gold 결과물의 후보 양식이다.", "Gold는 무조건 하나로 고정하지 않고 데이터 증거에 맞는 후보로 다룬다."],
          ["metrics", "Gold에서 계산할 수 있는 지표 후보 목록이다.", "metric은 데이터에 증거가 있을 때만 실행 spec으로 내려가야 한다."],
          ["fields", "검색 문서와 template 후보를 만들 때 참조하는 source field 목록이다.", "field evidence 없이 template만 고르면 데이터와 맞지 않는 Gold가 나온다."],
        ],
        "gold template candidate retrieval": [
          ["gold_template_candidate_retrieval", "검색 결과로 얻은 Gold template 후보와 그 근거다.", "candidate를 남겨야 사용자가 승인/수정/거절할 수 있다."],
          ["product_fields", "상품 또는 entity key로 쓸 수 있는 field 후보다.", "product health Gold는 집계 기준이 되는 product_id 없이는 의미가 약하다."],
          ["rating_fields", "평점 계열 field 후보다.", "average_rating이나 low_rating_component 계산 근거가 된다."],
          ["conversion_fields", "조회/구매/전환 계열 field 후보다.", "view_count, purchase_count, conversion_rate는 이 근거가 있을 때만 추천한다."],
          ["delivery_fields", "배송/지연 계열 field 후보다.", "late_delivery_rate는 배송 근거가 없으면 missing evidence로 남겨야 한다."],
        ],
      },
      L5: {
        "candidate grounding report": [
          ["checks", "Gold/Silver 후보가 실제 field 근거를 갖는지 확인한 항목들이다.", "check가 없으면 추천이 설명 불가능한 AI 의견이 된다."],
          ["product_key", "entity를 묶을 기준 field다. product_id, item_id, vendor_id 같은 값이 될 수 있다.", "group key 없이 product health Gold를 만들면 무엇별 건강도인지 알 수 없다."],
          ["review_text", "리뷰 텍스트로 볼 수 있는 field 후보다.", "negative_review_rate 또는 sentiment 기반 지표의 근거가 된다."],
          ["available_fields", "추천 metric을 만들 때 실제로 존재하는 field 목록이다.", "있는 근거만 써야 unknown data에서도 오버피팅이 줄어든다."],
          ["missing_evidence", "필요하지만 데이터에서 찾지 못한 근거다.", "없는데 있는 척하지 않고 사용자 검토 대상으로 넘긴다."],
        ],
        "product-health field classifiers": [
          ["product_tokens", "상품/entity key로 볼 만한 이름 조각이다.", "product_id, asin, sku 같은 이름을 찾는 휴리스틱이다."],
          ["excluded_tokens", "상품 key처럼 보여도 제외해야 할 이름 조각이다.", "profile_id, user_id를 product_id로 착각하는 일을 줄인다."],
          ["numeric_types", "숫자 계산이 가능한 타입 목록이다.", "rate, count, score는 숫자 field에서만 안전하게 계산할 수 있다."],
          ["scoped_score_tokens", "rating과 score를 구분하기 위한 이름 조각이다.", "risk_score와 rating_score를 같은 의미로 착각하지 않게 한다."],
          ["delivery_fields", "배송/지연 계열로 분류된 field 후보들이다.", "delivery evidence가 있어야 late_delivery_rate를 Gold 후보로 올린다."],
        ],
      },
      L6: {
        "L4 build setup and Silver draft artifact": [
          ["ALLOWED_ACTIONS", "Silver 추천에서 허용되는 정제 작업 목록이다.", "허용 목록 밖 작업은 M2가 실행할 수 없으므로 compiler에서 막아야 한다."],
          ["ai_model_slot", "테스트에서 어떤 AI 판단 슬롯을 썼는지 남기는 값이다.", "AI를 썼다면 어떤 추천 경로였는지 trace가 있어야 한다."],
          ["silver_fields", "Silver로 남길 field와 정제 추천 목록이다.", "Bronze 전체를 그대로 넘기지 않고 query 가능한 최소 정제 구조를 만든다."],
          ["gold_models", "Silver 위에서 만들 수 있는 Gold 후보 목록이다.", "Gold를 여기서 실행하지 않고 후보로만 넘긴다."],
          ["derived_gold_options", "Silver field 조합으로 파생 가능한 Gold 옵션이다.", "사용자가 승인할 수 있도록 선택지를 분리한다."],
        ],
        "_silver_field_recommendation()": [
          ["target_name", "Silver에 노출될 표준 컬럼명이다.", "M1/M6가 해석할 수 있게 raw field명을 정리한다."],
          ["target_type", "Silver에서 권장하는 타입이다.", "M2 Spark cast와 catalog schema가 같은 타입을 보게 한다."],
          ["recommended_actions", "cast, trim, parse_timestamp, drop 같은 정제 추천 작업이다.", "작업명이 고정돼야 L10 compiler가 deterministic spec으로 바꿀 수 있다."],
          ["catalog_exposure", "catalog에 보일지 숨길지 정한다.", "PII 처리와 catalog 노출은 별도 판단이어야 한다."],
          ["query_context_exposure", "M6 query context에 들어갈 수 있는지 정한다.", "민감하거나 불안정한 field는 catalog에는 있어도 query에서는 금지될 수 있다."],
        ],
      },
      L7: {
        "Gold model draft artifact": [
          ["gold_models", "사용자가 승인/보류/거절할 Gold 모델 후보 목록이다.", "M3는 Gold를 무조건 만들지 않고 만들 수 있는 방법을 제안한다."],
          ["derived_gold_options", "Silver를 어떤 기준으로 집계하거나 파생할지 적은 옵션이다.", "Gold->Gold 추가 생성도 사용자가 선택할 수 있게 후보로 남긴다."],
          ["ai_model_slot", "추천에 참여한 AI 판단 슬롯이다.", "발표/검증에서 AI가 어디에 들어갔는지 분리해서 설명할 수 있다."],
          ["draft_status", "아직 실행 확정이 아니라 사용자 결정이 필요한 초안 상태다.", "draft와 approved spec을 섞으면 M2가 실행해도 되는지 모호해진다."],
        ],
        "generic Gold model recommendations": [
          ["dimensions", "Gold 결과에서 묶거나 분류할 기준 컬럼이다.", "category, product, region 같은 차원이 있어야 집계 결과를 해석할 수 있다."],
          ["measures", "count, sum, avg처럼 계산할 값이다.", "Gold는 원본 row가 아니라 의미 있는 지표를 담아야 한다."],
          ["record_count", "최소 fallback metric이다. 도메인 신호가 없어도 row 수 집계는 가능하다.", "아무 metric도 없으면 Gold 후보를 만들 근거가 없다."],
        ],
        "product health template and risk score policy": [
          ["metric_templates", "product health를 구성하는 지표 template 목록이다.", "review_count, average_rating, conversion_rate 같은 출력 컬럼 후보가 여기에 정리된다."],
          ["metric_id", "각 metric을 안정적으로 부르는 ID다.", "컬럼명이 바뀌어도 metric 의미를 trace할 수 있다."],
          ["formula_template", "metric 계산식을 실행 전 문장/수식 형태로 적은 것이다.", "M2가 Spark logic으로 바꿀 때 이 식을 기준으로 삼는다."],
          ["required_source_evidence", "metric을 만들려면 반드시 필요한 원천 field 근거다.", "없는 field로 risk_score를 꾸며내지 않게 막는다."],
          ["risk_score_policy", "위험 점수를 어떤 component와 weight로 만들지 추천한 정책이다.", "고정식이 아니라 데이터가 가진 근거에 맞춰 component와 weight를 추천한다."],
        ],
        "risk score components and weights": [
          ["component_id", "risk_score를 이루는 부품 이름이다. 예를 들어 negative_review_component, low_rating_component가 될 수 있다.", "component를 쪼개야 어떤 위험 때문에 점수가 높아졌는지 설명할 수 있다."],
          ["renormalize_missing", "없는 component가 있을 때 남은 component weight를 다시 정규화할지 여부다.", "배송 데이터가 없는데 배송 지연을 0점으로 넣으면 점수가 왜곡된다."],
          ["average_rating", "평점 평균 metric이다.", "낮은 평점 component의 직접 근거가 된다."],
          ["conversion_rate", "view 대비 purchase 비율이다.", "view denominator가 0일 때 null 또는 0 정책을 반드시 명시해야 한다."],
          ["category_or_global_baseline", "카테고리 기준선이 있으면 카테고리별, 없으면 전체 기준선으로 비교한다는 뜻이다.", "데이터 규모가 다르면 절대값보다 기준선 대비 위험이 더 안정적이다."],
        ],
      },
      L8: {
        "vector handoff template": [
          ["text_candidates", "embedding 대상으로 쓸 수 있는 텍스트 field 후보다.", "review_text, description 같은 field가 있어야 vector 검색이 의미가 있다."],
          ["entity_candidates", "vector 결과를 어떤 entity와 연결할지 나타내는 key 후보다.", "embedding만 있고 product_id가 없으면 Gold/catalog와 연결하기 어렵다."],
          ["metadata_candidates", "vectorDB에 같이 넣을 filter용 metadata 후보다.", "category, date, rating 같은 filter가 있어야 검색 품질이 올라간다."],
          ["semantic_vector_template", "vectorDB에 무엇을 넣고 어떻게 찾을지에 대한 handoff template이다.", "M3가 직접 vectorDB를 운영하지 않고 M6/M5가 쓸 계약을 넘긴다."],
        ],
        "field matching and projection helpers": [
          ["normalized_token", "field 이름을 비교하기 쉽게 소문자/토큰화한 값이다.", "productId, product_id, product-id를 비슷하게 비교할 수 있다."],
          ["has_numerator", "비율 metric의 분자 후보가 있는지 보는 값이다.", "purchase_count 없이 conversion_rate를 만들면 안 된다."],
          ["has_denominator", "비율 metric의 분모 후보가 있는지 보는 값이다.", "view_count가 없거나 0이면 zero denominator 정책이 필요하다."],
          ["semantic_type", "field나 metric이 어떤 의미인지 붙인 라벨이다.", "M6가 컬럼명을 사람 질문과 연결할 때 필요하다."],
          ["metric_id", "vector handoff와 Gold metric을 연결하는 안정적인 metric 이름이다.", "검색 결과가 어떤 Gold 지표와 연결되는지 추적한다."],
        ],
      },
      L9: {
        "build_l5() decision artifacts": [
          ["VALID_GOLD_DECISIONS", "Gold 후보에 대해 허용되는 사용자 결정값 목록이다.", "approved, deferred, rejected 같은 상태만 허용해 실행 모호성을 줄인다."],
          ["gold_decision", "사용자가 Gold 생성을 승인/보류/거절했는지 나타낸다.", "Gold는 추천만으로 실행되지 않고 사용자의 결정이 있어야 다음 spec으로 간다."],
          ["silver_decision", "Silver 정제 추천에 대한 결정이다.", "Silver가 막히면 Gold readiness가 좋아도 실행 흐름은 멈춰야 한다."],
          ["gold_to_gold_decision", "이미 만든 Gold에서 추가 Gold를 만들지에 대한 결정이다.", "무조건 추천/무조건 생성이 아니라 사용자가 선택할 수 있어야 한다."],
          ["approval_state", "Silver/Gold 결정 상태를 한 파일에 묶은 승인 계약이다.", "M5 workflow 저장과 M2 실행 전 확인에 쓰인다."],
        ],
        "approval state and diff": [
          ["approval_state", "현재 추천이 승인됐는지, 검토 중인지, 거절됐는지 나타내는 공식 상태다.", "상태가 없으면 draft와 executable spec을 구분하지 못한다."],
          ["decision_trace", "누가 어떤 이유로 선택했는지 남기는 추적 정보다.", "나중에 risk_score weight나 Gold 보류 이유를 설명할 수 있다."],
          ["gold_decision_artifact", "Gold 결정만 따로 담은 artifact다.", "Gold가 not_requested/deferred여도 그 상태 자체가 downstream 계약이다."],
        ],
        "Gold decision reason helper": [
          ["gold_decision", "Gold 관련 상태를 사람이 읽을 이유 문장으로 바꾼다.", "상태값만 있으면 발표나 UI에서 왜 그런지 설명하기 어렵다."],
        ],
      },
      L10: {
        "build_l6() Silver spec": [
          ["SUPPORTED_ACTIONS", "compiler가 실행 spec으로 바꿀 수 있는 작업 목록이다.", "지원하지 않는 action은 unsupported report로 보내야 한다."],
          ["source_unit_ids", "Silver spec이 어떤 원본 처리 단위에 적용되는지 나타낸다.", "scope가 없으면 M2가 어느 데이터에 spec을 적용할지 모른다."],
          ["silver_operations", "M2가 실행할 수 있게 바꾼 Silver 작업 목록이다.", "M3 추천을 deterministic transform spec으로 고정하는 핵심이다."],
          ["silver_spec", "Silver 생성 방법 전체를 담은 공식 spec artifact다.", "M3가 실제 Spark 실행을 하지 않아도 M2가 같은 방식으로 실행할 수 있다."],
          ["write_mode", "preview_only인지 production write인지 구분한다.", "M3 core에서는 preview_only만 허용해 실제 운영 write 책임을 M2/M5로 넘긴다."],
        ],
        "Silver operation compiler": [
          ["operations", "select, cast, normalize 같은 실행 가능한 작업 배열이다.", "이 배열이 Spark job logic의 뼈대가 된다."],
          ["input_ref", "작업이 읽을 upstream artifact id다.", "_ref는 artifact_id 문자열이어야 하고 manifest에서 resolve된다."],
          ["output_ref", "작업이 만들 downstream artifact id다.", "다음 operation이 추측하지 않고 이 이름을 입력으로 받는다."],
          ["recommended_actions", "L6 draft의 추천 작업을 compiler가 읽는 입력이다.", "draft action 이름이 지원 목록과 맞아야 spec으로 바뀐다."],
          ["target_type", "cast/normalize가 목표로 하는 타입이다.", "Silver schema와 Spark cast가 같은 방향을 보게 한다."],
        ],
      },
      L11: {
        "Gold generation spec": [
          ["gold_spec", "Gold를 어떻게 만들지 담은 deterministic spec이다.", "M3는 Gold 데이터를 직접 만들기보다 생성 방법을 M2가 실행 가능하게 넘긴다."],
          ["source_unit_ids", "Gold spec이 어떤 원본 범위에서 파생되는지 나타낸다.", "Gold lineage가 Silver와 같은 source scope를 유지해야 한다."],
          ["gold_operations", "Gold 생성을 위한 aggregate/project/risk_score 작업 목록이다.", "사용자가 approved한 Gold만 operation으로 들어가야 한다."],
          ["write_mode", "Gold preview도 core에서는 preview_only여야 한다.", "발표/테스트와 운영 write를 섞지 않는다."],
        ],
        "Gold aggregate operation compiler": [
          ["group_by", "Gold 집계에서 묶을 key 목록이다.", "product_id나 category가 없으면 product health가 무엇별 결과인지 모호하다."],
          ["dimensions", "Gold 결과에 남길 차원 컬럼이다.", "M6가 질문을 category/product 단위로 해석할 수 있게 한다."],
          ["measures", "계산할 metric 정의 목록이다.", "review_count, average_rating, risk_score 같은 값이 여기에 들어간다."],
          ["time_window", "시간 단위 집계가 필요한 경우 window를 표현한다.", "실시간/증분 데이터에서는 기간 기준이 없으면 수치가 흔들린다."],
          ["cardinality_guard", "group 수가 너무 커지는 것을 막는 안전장치다.", "고유값이 너무 많은 field로 group_by하면 Gold가 비대해진다."],
        ],
      },
      L12: {
        "compiler validation artifacts": [
          ["LOGICAL_LAYER_VERSION", "L0~L16 논리 계층 계약 버전이다.", "물리 폴더명이 L0~L10이어도 논리 설계 버전을 구분한다."],
          ["LOGICAL_LAYERS", "각 논리 L단계의 이름과 연결 정보를 담은 목록이다.", "보고서와 artifact가 같은 흐름을 말하게 한다."],
          ["compiler_validation_result", "Silver/Gold spec이 실행 가능한지 검사한 결과다.", "지원하지 않는 작업, 잘못된 ref, preview rule 위반을 여기서 막는다."],
          ["unsupported_report", "지원하지 않는 action이나 core 밖 요구를 모은 보고서다.", "M3 core가 감당하지 않는 stream runtime 같은 항목은 extension hook으로 넘긴다."],
        ],
        "unsupported and validation helpers": [
          ["SUPPORTED_ACTIONS", "compiler가 허용하는 action 목록이다.", "없는 action은 자동 실행하지 않고 unsupported로 보고한다."],
          ["unsupported_actions", "허용 목록 밖 작업들이다.", "이 목록이 비어야 M2에 넘길 실행 spec 신뢰도가 올라간다."],
          ["checks", "validation 세부 검사 결과다.", "pass/warn/block을 세부 이유와 같이 남긴다."],
          ["write_mode", "preview_only 규칙을 검사하는 대상이다.", "M3 core가 production write를 만들면 책임 경계가 깨진다."],
        ],
      },
      L13: {
        "build_l7() Silver preview evidence": [
          ["pii_fields", "PII 의심으로 잡힌 Silver field 목록이다.", "M6 query context에 그대로 노출되면 안 되는 값을 막는다."],
          ["forbidden_query_fields", "query에서 금지해야 하는 field 목록이다.", "catalog에는 있어도 질문 응답에서는 막아야 하는 값이 있다."],
          ["compiler_status", "Silver spec compiler 검증 결과 상태다.", "compiler가 block이면 preview evidence도 ready가 될 수 없다."],
          ["structural_status", "field, type, scope 같은 구조 검증 상태다.", "구조가 불안정하면 품질 경고 또는 block으로 이어진다."],
          ["quality_axis", "Silver 품질 축 판단 결과다.", "L15 three-axis gate에서 processing_quality 축으로 이어진다."],
          ["silver_preview_ref", "Silver preview evidence artifact id다.", "다음 gate와 handoff가 같은 evidence를 참조하게 한다."],
        ],
      },
      L14: {
        "build_l8() Gold readiness evidence": [
          ["gold_status", "Gold가 ready, warn, block, not_requested, deferred 중 어디인지 나타낸다.", "Gold 상태가 Silver 상태를 오염시키면 안 되므로 별도 축으로 둔다."],
          ["gold_requested", "사용자가 Gold 생성을 요청했는지 여부다.", "요청하지 않은 Gold는 실패가 아니라 not_requested 상태다."],
          ["selected_models", "승인 또는 검토 대상으로 남은 Gold 모델 목록이다.", "여기 있는 모델만 Gold spec으로 내려갈 수 있다."],
          ["metric_definitions", "Gold metric의 이름, 식, 근거, caveat 정의다.", "risk_score와 핵심 지표를 M1/M6가 같은 의미로 읽게 한다."],
          ["input_report", "Gold readiness가 어떤 Silver/decision 입력을 보고 판단했는지 적는다.", "Gold가 막힌 이유를 source evidence까지 따라갈 수 있다."],
        ],
        "Gold metric and caveat helpers": [
          ["metric_draft", "아직 확정 전인 Gold metric 후보다.", "사용자 승인 전에는 실행 spec이 아니라 draft로 남아야 한다."],
          ["status", "metric 또는 Gold 축의 pass/warn/block 상태다.", "개별 metric 문제와 전체 Gold 문제를 분리해서 본다."],
          ["caveats", "결과를 해석할 때 주의할 조건이다.", "zero denominator, missing delivery evidence 같은 내용을 사용자와 M6에 전달한다."],
        ],
      },
      L15: {
        "build_l9() three-axis gate": [
          ["processing_axis", "Silver 처리 품질 축이다. parse, schema, compiler 품질을 본다.", "Gold가 block이어도 Silver가 통과하면 Silver context는 ready일 수 있다."],
          ["catalog_axis", "catalog/query 노출 안전 축이다. PII와 forbidden query field를 본다.", "품질이 좋아도 query 노출이 위험하면 M6에 넘기면 안 된다."],
          ["gold_axis", "Gold readiness만 따로 보는 축이다.", "Gold 상태가 Silver readiness를 오염시키지 않게 분리한다."],
          ["silver_context", "M6가 Silver를 질의해도 되는지 정리한 context 상태다.", "M6는 이 값을 보고 Silver table 노출 여부를 판단한다."],
          ["m6_context_status", "Silver와 Gold context를 M6가 사용할 수 있는지 최종 요약한 상태 묶음이다.", "L16 package top-level에도 같은 값이 들어가야 한다."],
        ],
        "axis and M6 context helpers": [
          ["status", "pass, warn, block, not_requested, deferred 같은 gate 결론이다.", "상태 단어가 고정돼야 UI와 workflow가 같은 판단을 한다."],
          ["gold_l5_status", "L9 사용자 결정 단계에서 내려온 Gold 승인 상태다.", "승인되지 않은 Gold는 ready로 올리면 안 된다."],
          ["gold_requested", "Gold 요청 여부다.", "not_requested와 failed를 구분하는 핵심 값이다."],
          ["pii_fields", "query/catalog 노출을 막아야 할 민감 field 근거다.", "catalog_safety 축의 판단 근거로 쓰인다."],
        ],
      },
      L16: {
        "build_l10() handoff package": [
          ["m6_context_status", "M6가 Silver/Gold context를 써도 되는지 나타내는 최종 상태다.", "L15 gate summary와 L16 package가 불일치하면 block이어야 한다."],
          ["allowed_columns", "M6 query에서 사용할 수 있는 컬럼 목록이다.", "PII나 금지 컬럼이 들어가면 질의 안전성이 깨진다."],
          ["sql_context", "M6가 SQL을 만들 때 필요한 table, column, limit, freshness 정보다.", "catalog만 있고 query context가 없으면 M6는 안전한 SQL을 만들기 어렵다."],
          ["contract_package", "M3가 M5/M6/M1에 넘기는 최종 handoff 묶음이다.", "각 artifact를 따로 찾지 않게 최종 package로 모은다."],
          ["artifact_manifest", "artifact_id를 실제 파일/URI로 resolve하는 목록이다.", "*_ref는 문자열 artifact_id로만 두고 여기서 실제 위치를 찾는다."],
        ],
        "catalog metadata and SQL context": [
          ["dataset_id", "catalog에서 dataset을 부르는 안정적인 ID다.", "table name이나 파일명과 별개로 dataset lineage를 고정한다."],
          ["allowed_tables", "M6가 query할 수 있는 table 목록이다.", "임의 table 접근을 막고 승인된 context만 쓰게 한다."],
          ["allowed_columns", "질문/SQL에 노출 가능한 column 목록이다.", "M6가 user_id 같은 금지 field를 실수로 쓰지 않게 한다."],
          ["caveats", "query 결과를 해석할 때 같이 보여야 하는 주의사항이다.", "Gold가 deferred이거나 metric evidence가 약하면 답변에 caveat가 필요하다."],
          ["gold_layer_status", "catalog에서 Gold layer가 available인지 deferred인지 나타낸다.", "Gold가 없어도 Silver catalog는 독립적으로 전달될 수 있다."],
        ],
        "semantic vector template and sync package": [
          ["semantic_vector_template", "schema/profile/catalog metadata를 vectorDB에 넣을 때의 문서 구조다.", "Gold 추천과 M6 의미 검색 정확도를 높이되 raw를 넣지 않게 한다."],
          ["gold_product_health", "발표용 최소 Gold template 이름이다. product 단위 건강도 지표 묶음이다.", "product_id, review_count, average_rating, risk_score 같은 고정 컬럼을 설명한다."],
          ["risk_score", "여러 위험 component를 weight로 합친 점수다.", "고정식이 아니라 데이터에 있는 evidence에 맞게 component와 weight를 추천해야 한다."],
          ["negative_review_rate", "부정 리뷰 비율 metric이다.", "review text 또는 rating 근거가 있을 때만 만들 수 있다."],
          ["conversion_rate", "view 대비 purchase 비율이다.", "view_count가 0일 때 null 또는 0 정책을 반드시 함께 넘긴다."],
          ["late_delivery_rate", "배송 지연 비율 metric이다.", "delivery evidence가 없으면 missing evidence로 남기고 계산하지 않는다."],
        ],
        "artifact manifest and exports": [
          ["artifact_reference_manifest", "artifact_id를 physical_uri, checksum, byte_size와 연결하는 최종 목록이다.", "_ref가 경로가 아니라 id여도 여기서 실제 파일을 찾는다."],
          ["transform_spec", "M2가 실행할 수 있는 transform 계약이다.", "M3는 Spark를 직접 운영하지 않고 실행 방법을 이 spec으로 넘긴다."],
          ["schema_definition", "M1/M5/M6가 같은 컬럼명과 타입을 이해하게 하는 schema 계약이다.", "schema가 없으면 자연어 질의와 catalog가 같은 데이터를 다르게 해석한다."],
          ["workflow_definition", "M5가 저장/실행 흐름을 만들 수 있게 node와 edge로 표현한 workflow 계약이다.", "DAG를 만들려면 어떤 artifact가 어떤 artifact로 이어지는지 필요하다."],
          ["catalog_export", "M5/M6가 catalog에 반영할 metadata 최종본이다.", "query_table, output_columns, lineage, quality 정보가 여기에 모인다."],
          ["target_dataset", "최종 저장될 dataset 이름이다.", "Silver인지 Gold인지, 어떤 source에서 온 결과인지 구분한다."],
        ],
      },
    };
  }

  function contractTermDictionary() {
    const d = {
      source: {
        meaning: "분석을 시작할 원본 파일 또는 폴더다. 사람이 등록한 데이터의 입구라고 보면 된다.",
        why: "원본 위치가 있어야 L0가 object와 source unit을 만들 수 있다.",
        breaks: "source가 불명확하면 이후 모든 lineage와 replay가 시작점을 잃는다.",
      },
      out_dir: {
        meaning: "M3가 만든 계약 파일을 저장하는 출력 폴더다. raw 데이터 저장소가 아니다.",
        why: "raw와 M3 artifact를 분리해야 원본 보존 원칙이 지켜진다.",
        breaks: "out_dir이 섞이면 raw 파일과 계약 파일을 구분하기 어렵다.",
      },
      source_id: {
        meaning: "데이터 소스의 안정적인 이름이다. 파일 경로가 아니라 업무상 데이터 묶음의 ID다.",
        why: "artifact_id, dataset_id, lineage가 같은 source_id로 묶인다.",
        breaks: "source_id가 흔들리면 같은 데이터의 재실행 결과를 비교할 수 없다.",
      },
      run_id: {
        meaning: "이번 분석 실행을 구분하는 ID다. 같은 source_id라도 run_id가 다르면 다른 실행 결과다.",
        why: "재실행, 비교, rollback, 검증 증거를 분리하기 위해 필요하다.",
        breaks: "run_id가 없으면 어떤 artifact가 어느 실행에서 나온 것인지 모른다.",
      },
      layer_dir: {
        meaning: "해당 L단계 artifact를 저장하는 하위 폴더다.",
        why: "단계별 산출물을 나눠야 검증과 handoff가 쉽다.",
        breaks: "단계 폴더가 없으면 artifact가 뒤섞여 추적이 어려워진다.",
      },
      checksum_bytes: {
        meaning: "prefix checksum에서 원본 앞부분을 몇 byte 읽을지 정하는 값이다.",
        why: "대용량 파일에서 full checksum 비용을 줄이면서 변경 감지 근거를 남긴다.",
        breaks: "기준이 없으면 실행마다 checksum 비용과 결과가 달라질 수 있다.",
      },
      checksum_mode: {
        meaning: "checksum을 none, prefix, full 중 어떤 방식으로 계산할지 정한다.",
        why: "정확도와 비용 사이의 선택을 계약으로 남긴다.",
        breaks: "mode가 없으면 checksum의 신뢰도와 비용을 해석할 수 없다.",
      },
      object_id: {
        meaning: "원본 저장소의 물리 파일/object 하나를 부르는 ID다.",
        why: "path가 바뀌거나 같은 source에 여러 파일이 있어도 원본 덩어리를 안정적으로 가리킨다.",
        breaks: "object_id가 없으면 record가 어느 원본 파일에서 왔는지 잃는다.",
      },
      source_unit_id: {
        meaning: "처리 범위를 부르는 ID다. 파일 하나, 파일 묶음, stream window가 모두 unit이 될 수 있다.",
        why: "실행 scope를 object와 분리해야 batch, stream, hybrid를 같은 계약으로 다룰 수 있다.",
        breaks: "source_unit_id가 없으면 preview와 transform spec이 어느 범위에 적용되는지 모른다.",
      },
      source_unit_ids: {
        meaning: "여러 처리 단위를 가리키는 ID 목록이다.",
        why: "profile, spec, preview가 어떤 L0 범위에서 나왔는지 묶는다.",
        breaks: "scope 목록이 없으면 일부 데이터만 보고 만든 결과인지 전체인지 구분하지 못한다.",
      },
      source_unit_type: {
        meaning: "source unit이 object_batch인지 stream_window인지 hybrid_window인지 나타낸다.",
        why: "batch와 stream은 replay locator와 실행 방식이 다르다.",
        breaks: "type이 없으면 object_ids와 stream_window_ids 조합을 검증할 수 없다.",
      },
      object_ids: {
        meaning: "source unit 또는 profile이 참조하는 object_id 목록이다.",
        why: "처리 단위와 실제 원본 object를 양방향으로 검증한다.",
        breaks: "object_ids가 틀리면 orphan object나 잘못된 lineage가 생긴다.",
      },
      stream_window_ids: {
        meaning: "stream 입력에서 처리 window를 가리키는 ID 목록이다.",
        why: "stream은 파일 경로만으로 replay할 수 없고 window/offset 기준이 필요하다.",
        breaks: "stream window가 없으면 실시간 데이터 범위를 재현할 수 없다.",
      },
      path: {
        meaning: "현재 컴퓨터 파일 시스템에서 보이는 로컬 경로다.",
        why: "로컬에서 파일을 열고 sample을 읽을 때 필요하다.",
        breaks: "path만 있으면 컨테이너, 노트북, MinIO, S3 같은 다른 환경에서 같은 원본을 찾지 못할 수 있다.",
      },
      uri: {
        meaning: "저장소 종류까지 포함한 원본 주소다. file://, s3://, minio:// 같은 형태를 포함한다.",
        why: "M2/M5/M6가 다른 실행 환경에서도 같은 object를 resolve할 수 있게 한다.",
        breaks: "uri가 없으면 path가 로컬 전용 문자열인지 object store 주소인지 알 수 없다.",
      },
      etag: {
        meaning: "MinIO/S3 같은 object store가 주는 객체 버전 또는 내용 식별자다.",
        why: "같은 uri라도 내용이 바뀌었는지 확인하는 근거가 된다.",
        breaks: "etag/checksum이 없으면 같은 이름의 다른 내용을 같은 원본으로 착각할 수 있다.",
      },
      checksum: {
        meaning: "파일 내용에서 계산한 지문이다.",
        why: "원본이 바뀌었는지, 같은 원본인지 확인하는 재현성 기준이다.",
        breaks: "checksum이 없으면 replay 결과가 이전과 같은 원본인지 검증하기 어렵다.",
      },
      byte_size: {
        meaning: "파일 또는 artifact의 byte 크기다.",
        why: "대용량 처리 비용과 누락 여부를 빠르게 판단한다.",
        breaks: "크기가 없으면 빈 파일이나 예상보다 작은 산출물을 놓칠 수 있다.",
      },
      modified_at: {
        meaning: "원본 파일/object가 마지막으로 수정된 시각이다.",
        why: "checksum과 함께 변경 여부를 판단하는 보조 근거다.",
        breaks: "수정 시각이 없으면 같은 path의 이전/이후 버전을 구분하기 어렵다.",
      },
      source_units: {
        meaning: "L0가 만든 처리 단위들의 목록이다.",
        why: "모든 downstream 단계가 같은 처리 범위를 따라가게 한다.",
        breaks: "목록이 빠지면 L1 이후 단계가 원본 scope를 추측해야 한다.",
      },
      objects: {
        meaning: "원본 파일/object metadata 목록이다.",
        why: "uri, path, checksum, size 같은 replay 정보를 한곳에 모은다.",
        breaks: "objects가 없으면 source_unit_id가 실제 원본으로 연결되지 않는다.",
      },
      raw_replay_pointer: {
        meaning: "원본을 다시 읽기 위한 위치와 규칙을 담은 artifact다.",
        why: "M3가 raw를 복사하지 않으므로 재현은 pointer로 해야 한다.",
        breaks: "pointer가 없으면 오류 분석 시 원본 record로 돌아갈 수 없다.",
      },
      copy_raw_payload: {
        meaning: "raw payload를 M3 artifact에 복사할지 여부다.",
        why: "대용량과 민감정보 때문에 기본은 false여야 한다.",
        breaks: "무심코 true가 되면 M3 artifact가 raw 복제본이 된다.",
      },
      mutate_raw_payload: {
        meaning: "M3가 원본 값을 바꿀지 여부다.",
        why: "L0는 원본 보존 단계라 false가 원칙이다.",
        breaks: "원본을 바꾸면 checksum과 audit 기준이 무너진다.",
      },
      body: {
        meaning: "artifact_header 아래 실제 업무 payload 영역이다.",
        why: "공통 header와 단계별 내용을 분리한다.",
        breaks: "body 구조가 흐리면 downstream이 필요한 값을 찾지 못한다.",
      },
      artifact_id: {
        meaning: "M3 artifact 하나를 부르는 고유 ID다.",
        why: "*_ref 필드가 경로 대신 artifact_id를 참조하게 하기 위해 필요하다.",
        breaks: "artifact_id가 없으면 manifest에서 실제 파일을 resolve할 수 없다.",
      },
      artifact_ref: {
        meaning: "다른 artifact를 가리키는 artifact_id 문자열이다.",
        why: "경로를 직접 넣지 않고 reference manifest에서 resolve하게 만든다.",
        breaks: "ref가 경로나 객체로 섞이면 M5/M6가 해석을 다르게 한다.",
      },
      schema_version: {
        meaning: "artifact가 따르는 schema 버전이다.",
        why: "계약이 바뀌어도 reader가 버전에 맞게 해석할 수 있다.",
        breaks: "버전이 없으면 v2.1과 v2.1.1 차이를 구분하지 못한다.",
      },
      access_class: {
        meaning: "artifact를 누가 볼 수 있는지 나타내는 접근 등급이다.",
        why: "AI 입력, catalog, query context의 노출 범위를 나눈다.",
        breaks: "등급이 없으면 민감 artifact가 잘못 노출될 수 있다.",
      },
      max_rows: {
        meaning: "sample로 읽을 row 개수 상한이다.",
        why: "대용량에서 M3가 전체 data-plane을 읽지 않게 막는다.",
        breaks: "상한이 없으면 sample 단계가 실행 엔진처럼 느려진다.",
      },
      max_bytes: {
        meaning: "sample로 읽을 byte 상한이다.",
        why: "row 수만으로 막기 어려운 큰 record를 제한한다.",
        breaks: "byte 제한이 없으면 한 줄짜리 거대 JSON에서 멈출 수 있다.",
      },
      object_by_path: {
        meaning: "path로 L0 object metadata를 찾는 lookup이다.",
        why: "line reader가 읽은 record에 object_id와 uri를 붙인다.",
        breaks: "lookup이 없으면 sample record와 원본 object 연결이 끊긴다.",
      },
      envelope_manifest: {
        meaning: "Bronze sample envelope artifact다.",
        why: "parse 상태와 locator를 같은 구조로 담는다.",
        breaks: "envelope가 없으면 성공/실패 record를 같은 방식으로 다루지 못한다.",
      },
      rescue_manifest: {
        meaning: "parse 실패나 충돌 record를 보존하는 rescue lane artifact다.",
        why: "나쁜 데이터도 품질 판단의 근거이므로 버리면 안 된다.",
        breaks: "rescue가 없으면 오류 row가 사라져 품질이 과장된다.",
      },
      envelope_spec: {
        meaning: "Bronze record가 가져야 할 필수 구조 규칙이다.",
        why: "M2가 전체 Bronze를 만들 때 같은 형태를 실행할 수 있다.",
        breaks: "spec이 없으면 sample과 전체 실행 결과가 달라진다.",
      },
      json_path: {
        meaning: "JSON 내부 위치를 나타내는 경로다.",
        why: "중첩 JSON에서 문제 field를 다시 찾기 위해 필요하다.",
        breaks: "json_path가 없으면 같은 record 안의 어떤 값인지 모른다.",
      },
      record_locator: {
        meaning: "원본 record를 다시 찾는 위치 정보 묶음이다.",
        why: "line, byte, json path, object id를 합쳐 replay를 가능하게 한다.",
        breaks: "locator가 없으면 Silver/Gold 오류를 원본까지 추적하지 못한다.",
      },
      parse_status: {
        meaning: "record parse 결과 상태다.",
        why: "정상 record와 rescue record를 구분한다.",
        breaks: "상태가 없으면 실패 record가 정상처럼 흘러갈 수 있다.",
      },
      source_object: {
        meaning: "현재 sample record가 나온 원본 object metadata다.",
        why: "record에 object_id, uri, checksum 근거를 붙인다.",
        breaks: "source_object가 없으면 sample row가 원본과 분리된다.",
      },
      byte_start: {
        meaning: "record가 원본에서 시작한 byte 위치다.",
        why: "정확한 replay와 디버깅에 필요하다.",
        breaks: "줄 번호만으로 replay가 어려운 포맷에서 위치를 잃는다.",
      },
      byte_end: {
        meaning: "record가 원본에서 끝난 byte 위치다.",
        why: "record 범위를 정확히 잘라낼 수 있게 한다.",
        breaks: "끝 위치가 없으면 다음 record와 경계가 모호해진다.",
      },
      line_number: {
        meaning: "텍스트 원본에서 record가 있는 줄 번호다.",
        why: "사람이 원본을 열어 빠르게 확인할 수 있다.",
        breaks: "line_number만으로 충분하지는 않지만 없으면 디버깅이 불편하다.",
      },
      payload: {
        meaning: "sample로 가져온 record 내용이다.",
        why: "profile과 AI evidence를 만들 최소 재료가 된다.",
        breaks: "무제한 payload는 raw 복제가 되므로 반드시 제한이 필요하다.",
      },
      sample_count: {
        meaning: "profile이 실제로 본 sample 수다.",
        why: "통계 판단의 신뢰도를 해석하게 해준다.",
        breaks: "sample 수가 없으면 비율이 얼마나 믿을 만한지 모른다.",
      },
      fields: {
        meaning: "발견된 column 또는 JSON field 목록이다.",
        why: "Silver 추천, Gold 추천, catalog schema의 기본 재료다.",
        breaks: "fields가 없으면 이후 추천은 근거 없는 추측이 된다.",
      },
      type_counts: {
        meaning: "field에서 관측된 타입별 개수다.",
        why: "type conflict와 cast 필요성을 판단한다.",
        breaks: "타입 분포가 없으면 잘못된 cast를 추천할 수 있다.",
      },
      null_count: {
        meaning: "field가 비어 있던 횟수다.",
        why: "nullable, fill, drop 판단의 근거다.",
        breaks: "null 분포가 없으면 필수/선택 컬럼을 구분하기 어렵다.",
      },
      parse_errors: {
        meaning: "parser가 실패한 오류 목록 또는 개수다.",
        why: "데이터 품질과 rescue 필요성을 보여준다.",
        breaks: "오류가 숨겨지면 품질이 실제보다 좋아 보인다.",
      },
      has_header: {
        meaning: "CSV 첫 줄이 header인지 판단한 값이다.",
        why: "컬럼명을 제대로 잡기 위해 필요하다.",
        breaks: "header 판단이 틀리면 모든 field 이름이 밀린다.",
      },
      width_conflicts: {
        meaning: "CSV row별 column 개수가 달라진 문제다.",
        why: "delimiter/quote/깨진 row 문제를 드러낸다.",
        breaks: "무시하면 값이 잘못된 컬럼에 들어간다.",
      },
      record_count: {
        meaning: "분석 또는 집계에서 본 record 수다.",
        why: "결과 규모와 신뢰도를 확인한다.",
        breaks: "count가 없으면 비율과 metric을 해석하기 어렵다.",
      },
      data_shape_contract: {
        meaning: "데이터 모양과 core/extension 처리 가능성을 적은 계약이다.",
        why: "unknown 구조를 무리하게 core에 넣지 않게 한다.",
        breaks: "shape 계약이 없으면 stream/unstructured 같은 범위가 섞인다.",
      },
      structure_class: {
        meaning: "flat, nested, semi-structured 같은 구조 분류다.",
        why: "flatten, preserve_json, extension hook 판단에 쓴다.",
        breaks: "구조를 모르면 Silver 정제 방식이 불안정하다.",
      },
      core_status: {
        meaning: "M3 core로 가능한지, extension이 필요한지 나타낸다.",
        why: "실시간 runtime이나 RAG를 core에 억지로 넣지 않게 한다.",
        breaks: "core/extension 경계가 없으면 M3 책임이 과해진다.",
      },
      format_hint: {
        meaning: "사용자 또는 파일명에서 온 포맷 힌트다.",
        why: "자동 감지 결과와 비교하는 참고값이다.",
        breaks: "힌트를 무조건 믿으면 잘못된 parser를 고를 수 있다.",
      },
      schema_basis: {
        meaning: "schema 판단이 어떤 sample과 규칙에 기반했는지 적은 근거다.",
        why: "AI/Silver 추천이 왜 나왔는지 설명할 수 있다.",
        breaks: "근거가 없으면 추천을 검증할 수 없다.",
      },
      format_detection: {
        meaning: "CSV/JSON/JSONL 등 포맷 감지 결과다.",
        why: "parser와 profile 방식을 고르는 기준이다.",
        breaks: "format이 불명확하면 downstream 처리가 흔들린다.",
      },
      schema_fingerprint: {
        meaning: "schema/profile 모양을 비교하기 위한 지문이다.",
        why: "다음 실행에서 drift를 빠르게 찾는다.",
        breaks: "fingerprint가 없으면 변경 여부 비교가 느리고 부정확하다.",
      },
      profile_body: {
        meaning: "field 통계와 parser 통계를 담은 profile 본문이다.",
        why: "L3 AI-safe evidence의 원천이다.",
        breaks: "profile이 없으면 AI에게 줄 근거가 없다.",
      },
      field_evidence: {
        meaning: "AI가 볼 수 있게 줄인 field별 증거다.",
        why: "raw를 직접 보내지 않고 추천 근거만 제공한다.",
        breaks: "evidence가 없으면 AI 추천이 데이터와 연결되지 않는다.",
      },
      redaction_map: {
        meaning: "민감 예시를 어떻게 가렸는지 기록한 지도다.",
        why: "보안과 검증 가능성을 동시에 지키기 위해 필요하다.",
        breaks: "가림 기록이 없으면 어떤 값이 왜 가려졌는지 모른다.",
      },
      pii_handling: {
        meaning: "PII 후보를 none, mask, hash 중 어떻게 다룰지 정한다.",
        why: "값 처리 방식과 노출 정책을 분리한다.",
        breaks: "PII 처리 없이 query context로 나가면 보안 문제가 생긴다.",
      },
      catalog_exposure: {
        meaning: "catalog에 보일지 숨길지 정하는 값이다.",
        why: "데이터는 존재해도 catalog에서 숨겨야 하는 field가 있다.",
        breaks: "노출 정책이 없으면 민감 field가 catalog에 나타날 수 있다.",
      },
      query_context_exposure: {
        meaning: "M6 query context에 넣어도 되는지 정한다.",
        why: "catalog 노출과 질의 허용은 별도 문제다.",
        breaks: "금지 field가 query에 들어가면 민감정보가 답변에 섞인다.",
      },
      input_pack: {
        meaning: "AI 추천에 들어가는 안전한 입력 묶음이다.",
        why: "AI는 data-plane 전체가 아니라 control-plane evidence만 본다.",
        breaks: "입력 경계가 없으면 비용과 보안 위험이 커진다.",
      },
      source_processing_contract: {
        meaning: "이 소스를 batch/stream/extension 중 어떻게 다룰지 적은 계약이다.",
        why: "M3와 M2의 책임 경계를 분리한다.",
        breaks: "처리 계약이 없으면 M3가 실행 runtime까지 책임지는 것처럼 보인다.",
      },
      policy_context: {
        meaning: "AI 추천이 지켜야 할 금지/허용 규칙이다.",
        why: "추천 품질보다 먼저 보안과 실행 가능성을 지킨다.",
        breaks: "정책이 없으면 AI가 raw 전체 읽기 같은 불가능한 제안을 할 수 있다.",
      },
      unknown_data_recommendation_pack: {
        meaning: "모르는 구조의 데이터에도 적용할 수 있는 추천 입력 묶음이다.",
        why: "특정 데이터셋에만 맞는 추천을 피한다.",
        breaks: "이 pack이 없으면 Amazon/Taxi 같은 테스트 데이터에 오버피팅되기 쉽다.",
      },
      domain_signals: {
        meaning: "review, product, conversion, delivery 같은 업무 신호 후보다.",
        why: "Gold 추천은 컬럼명이 아니라 의미 신호를 보고 정해야 한다.",
        breaks: "signal 없이 Gold를 만들면 의미 없는 집계가 된다.",
      },
      vector_candidates: {
        meaning: "vectorDB 검색 문서로 만들 수 있는 metadata 후보다.",
        why: "schema/profile/catalog 기반 검색 정확도를 높인다.",
        breaks: "검색 후보가 없으면 Gold template 선택이 기억/추측에 의존한다.",
      },
      signal_defs: {
        meaning: "각 domain signal이 요구하는 hint 정의다.",
        why: "어떤 근거가 있어야 signal로 인정할지 명확히 한다.",
        breaks: "정의가 없으면 없는 신호도 있다고 판단할 수 있다.",
      },
      required_hints: {
        meaning: "signal이나 metric을 인정하기 위한 필수 hint다.",
        why: "부족한 근거를 missing_evidence로 남긴다.",
        breaks: "필수 근거가 없으면 Gold metric이 과장된다.",
      },
      metadata_retrieval_index_plan: {
        meaning: "metadata를 검색 가능한 문서로 만들 계획이다.",
        why: "AI가 template을 찾을 때 근거 문서를 검색하게 한다.",
        breaks: "검색 계획이 없으면 vectorDB를 어디에 어떻게 쓰는지 모호하다.",
      },
      gold_template: {
        meaning: "Gold 결과물의 후보 양식이다.",
        why: "데이터 증거에 맞는 Gold 후보를 사용자에게 보여준다.",
        breaks: "template 없이 Gold를 말하면 출력 schema가 흔들린다.",
      },
      metrics: {
        meaning: "계산할 지표 후보 또는 확정 목록이다.",
        why: "Gold는 metric 중심 산출물이므로 이름과 식이 필요하다.",
        breaks: "metric 정의가 없으면 M1/M6가 수치를 해석하지 못한다.",
      },
      gold_template_candidate_retrieval: {
        meaning: "검색으로 찾은 Gold template 후보와 근거다.",
        why: "AI 추천이 어떤 후보에서 왔는지 설명한다.",
        breaks: "retrieval 결과가 없으면 사용자가 후보를 비교할 수 없다.",
      },
      product_fields: {
        meaning: "상품/entity key 후보 field다.",
        why: "product health는 무엇별 건강도인지 key가 필요하다.",
        breaks: "product key가 없으면 집계 단위가 무너진다.",
      },
      rating_fields: {
        meaning: "평점 계열 field 후보다.",
        why: "average_rating과 low_rating risk component의 근거다.",
        breaks: "rating 근거 없이 평점 metric을 만들 수 없다.",
      },
      review_text_fields: {
        meaning: "리뷰 텍스트 계열 field 후보다.",
        why: "negative review나 embedding 후보를 판단한다.",
        breaks: "텍스트 근거가 없으면 sentiment 계열 지표를 만들 수 없다.",
      },
      conversion_fields: {
        meaning: "view, purchase, conversion 계열 field 후보다.",
        why: "conversion_rate를 만들 수 있는지 판단한다.",
        breaks: "분자/분모 근거 없이 전환율을 계산하면 안 된다.",
      },
      delivery_fields: {
        meaning: "배송, 도착, 지연 계열 field 후보다.",
        why: "late_delivery_rate 가능 여부를 판단한다.",
        breaks: "배송 근거가 없으면 지연율 metric은 missing evidence로 남아야 한다.",
      },
      checks: {
        meaning: "검증 항목별 결과 목록이다.",
        why: "추천이 어떤 기준을 통과/실패했는지 보여준다.",
        breaks: "checks가 없으면 pass/warn/block 이유를 설명할 수 없다.",
      },
      product_key: {
        meaning: "product 단위로 묶을 기준 field다.",
        why: "Gold 집계의 grain을 고정한다.",
        breaks: "key가 없으면 product health가 전체 평균이 되어버린다.",
      },
      review_text: {
        meaning: "리뷰 본문으로 볼 수 있는 field다.",
        why: "negative review 판단과 vector embedding의 원천이 된다.",
        breaks: "review_text 없이 텍스트 기반 지표를 만들 수 없다.",
      },
      available_fields: {
        meaning: "해당 metric이나 template에 실제로 쓸 수 있는 field다.",
        why: "있는 근거만 사용하게 만든다.",
        breaks: "available 근거 없이 metric을 만들면 오버피팅이다.",
      },
      missing_evidence: {
        meaning: "필요하지만 데이터에서 찾지 못한 근거다.",
        why: "없는 것을 없는 상태로 사용자에게 보여준다.",
        breaks: "missing을 숨기면 Gold가 실제보다 완성된 것처럼 보인다.",
      },
      product_tokens: {
        meaning: "product key를 찾을 때 보는 이름 조각이다.",
        why: "unknown field명에서도 후보를 찾기 위한 휴리스틱이다.",
        breaks: "token 기준이 없으면 field matching이 불안정하다.",
      },
      excluded_tokens: {
        meaning: "헷갈리지만 제외해야 하는 이름 조각이다.",
        why: "user_id를 product_id로 착각하는 일을 줄인다.",
        breaks: "제외 규칙이 없으면 잘못된 key를 고를 수 있다.",
      },
      numeric_types: {
        meaning: "숫자 계산이 가능한 타입 목록이다.",
        why: "rate, count, average는 숫자 field에서만 안전하다.",
        breaks: "타입 확인 없이 metric을 만들면 계산 오류가 난다.",
      },
      scoped_score_tokens: {
        meaning: "score/rating 이름을 구분하기 위한 token이다.",
        why: "risk_score와 rating_score를 같은 뜻으로 착각하지 않게 한다.",
        breaks: "구분이 없으면 score field 분류가 흔들린다.",
      },
      ALLOWED_ACTIONS: {
        meaning: "Silver 추천에서 허용되는 action 목록이다.",
        why: "추천을 deterministic spec으로 바꾸려면 action vocabulary가 고정돼야 한다.",
        breaks: "허용되지 않은 action은 M2가 실행할 수 없다.",
      },
      ai_model_slot: {
        meaning: "AI 판단을 넣은 슬롯 또는 모델 경로 표시다.",
        why: "AI가 어느 단계에 개입했는지 trace한다.",
        breaks: "AI trace가 없으면 추천 재현성과 책임 범위가 흐려진다.",
      },
      silver_fields: {
        meaning: "Silver로 정제할 field별 추천 목록이다.",
        why: "Bronze raw envelope에서 query 가능한 schema로 가는 기준이다.",
        breaks: "silver_fields가 없으면 Silver spec을 만들 수 없다.",
      },
      gold_models: {
        meaning: "생성 가능한 Gold 모델 후보 목록이다.",
        why: "Gold는 사용자 선택 대상이므로 후보와 근거를 남긴다.",
        breaks: "후보가 없으면 사용자가 승인/수정/거절할 수 없다.",
      },
      derived_gold_options: {
        meaning: "Silver 위에서 파생 가능한 Gold 옵션이다.",
        why: "Gold 또는 Gold-to-Gold를 선택 가능한 계획으로 보여준다.",
        breaks: "옵션 없이 자동 생성하면 사용자 통제권이 사라진다.",
      },
      target_name: {
        meaning: "Silver에서 쓸 표준 컬럼명이다.",
        why: "M1/M6가 안정적인 이름으로 해석하게 한다.",
        breaks: "raw field명이 그대로 흔들리면 query와 catalog가 불안정해진다.",
      },
      target_type: {
        meaning: "Silver에서 권장하는 데이터 타입이다.",
        why: "Spark cast와 catalog schema를 맞춘다.",
        breaks: "타입이 없으면 문자열 숫자, 날짜 파싱이 계속 흔들린다.",
      },
      recommended_actions: {
        meaning: "field에 적용할 정제 action 목록이다.",
        why: "AI 추천을 실행 가능한 operation으로 바꾸는 연결점이다.",
        breaks: "action 이름이 불명확하면 compiler가 spec을 만들 수 없다.",
      },
      draft_status: {
        meaning: "아직 승인 전인 초안 상태다.",
        why: "추천과 실행 확정을 구분한다.",
        breaks: "draft가 approved처럼 흐르면 원치 않는 Gold 실행이 생긴다.",
      },
      dimensions: {
        meaning: "Gold 결과를 설명하는 차원 컬럼이다.",
        why: "metric이 어떤 기준으로 나뉘었는지 보여준다.",
        breaks: "dimension이 없으면 수치의 단위가 모호하다.",
      },
      measures: {
        meaning: "Gold에서 계산할 값이다.",
        why: "count, average, rate 같은 핵심 지표를 표현한다.",
        breaks: "measure가 없으면 Gold는 의미 있는 요약이 아니다.",
      },
      metric_templates: {
        meaning: "Gold metric 후보의 표준 template 목록이다.",
        why: "product health 최소 schema와 데이터별 확장을 동시에 다룬다.",
        breaks: "template이 없으면 Gold 컬럼이 매번 달라진다.",
      },
      metric_id: {
        meaning: "metric을 안정적으로 부르는 ID다.",
        why: "컬럼명, 설명, 식, lineage를 연결한다.",
        breaks: "ID가 없으면 같은 metric을 여러 이름으로 착각한다.",
      },
      formula_template: {
        meaning: "metric 계산식을 실행 전 형태로 적은 template이다.",
        why: "M2가 Spark logic으로 바꿀 수 있게 한다.",
        breaks: "식이 없으면 metric 이름만 있고 계산 방법이 없다.",
      },
      required_source_evidence: {
        meaning: "metric을 만들려면 필요한 원천 field 근거다.",
        why: "없는 데이터로 Gold를 만들지 않게 막는다.",
        breaks: "근거 없이 metric이 ready가 되면 발표/운영 모두 위험하다.",
      },
      risk_score_policy: {
        meaning: "risk_score를 구성할 component와 weight 추천 정책이다.",
        why: "데이터마다 가능한 위험 신호가 다르므로 고정식 대신 정책을 추천한다.",
        breaks: "고정식만 두면 없는 배송/전환 데이터를 억지로 계산하게 된다.",
      },
      component_id: {
        meaning: "risk_score를 이루는 개별 위험 부품 ID다.",
        why: "점수가 왜 높아졌는지 설명한다.",
        breaks: "component가 없으면 risk_score가 블랙박스가 된다.",
      },
      renormalize_missing: {
        meaning: "없는 component weight를 남은 component로 재분배할지 여부다.",
        why: "없는 데이터를 0점처럼 처리해 점수를 왜곡하지 않게 한다.",
        breaks: "정규화 규칙이 없으면 데이터셋마다 risk_score 의미가 달라진다.",
      },
      average_rating: {
        meaning: "평점 평균 지표다.",
        why: "product health의 기본 품질 신호다.",
        breaks: "rating evidence가 없으면 이 metric은 만들면 안 된다.",
      },
      conversion_rate: {
        meaning: "조회 대비 구매 또는 전환 비율이다.",
        why: "관심 대비 실제 전환을 보여준다.",
        breaks: "분모가 0일 때 null/0 정책이 없으면 값이 깨진다.",
      },
      category_or_global_baseline: {
        meaning: "카테고리 기준선이 있으면 카테고리별, 없으면 전체 기준선을 쓰는 비교 방식이다.",
        why: "데이터 규모와 카테고리 차이를 반영해 위험도를 해석한다.",
        breaks: "baseline이 없으면 절대값만 보고 위험을 과장할 수 있다.",
      },
      text_candidates: {
        meaning: "embedding 대상으로 쓸 수 있는 텍스트 field 후보다.",
        why: "semantic search와 vector handoff의 입력이 된다.",
        breaks: "텍스트 후보가 없으면 vectorDB에 넣을 내용이 없다.",
      },
      entity_candidates: {
        meaning: "embedding 결과를 연결할 entity key 후보다.",
        why: "vector 검색 결과를 product/catalog/Gold와 묶는다.",
        breaks: "entity key가 없으면 검색 결과가 업무 객체와 연결되지 않는다.",
      },
      metadata_candidates: {
        meaning: "vector 검색 filter로 쓸 metadata 후보다.",
        why: "category, date, rating 같은 조건 검색 품질을 높인다.",
        breaks: "metadata가 없으면 vector 검색이 의미만 있고 필터가 약하다.",
      },
      semantic_vector_template: {
        meaning: "vectorDB에 넣을 문서 구조와 연결 규칙이다.",
        why: "M3가 raw 대신 schema/profile/catalog metadata를 넘기게 한다.",
        breaks: "template이 없으면 vectorDB가 원본 덤프가 될 수 있다.",
      },
      normalized_token: {
        meaning: "field명을 비교하기 쉽게 정규화한 token이다.",
        why: "productId, product_id, product-id를 비슷하게 비교한다.",
        breaks: "정규화가 없으면 field matching이 이름 표기에 너무 민감하다.",
      },
      has_numerator: {
        meaning: "비율 metric의 분자 후보가 있는지 나타낸다.",
        why: "purchase_count 같은 분자 없이 rate를 만들지 않게 한다.",
        breaks: "분자 없이 rate가 ready가 되면 계산식이 가짜가 된다.",
      },
      has_denominator: {
        meaning: "비율 metric의 분모 후보가 있는지 나타낸다.",
        why: "view_count 같은 denominator와 zero rule을 확인한다.",
        breaks: "분모 없이 rate를 만들면 divide by zero 또는 무의미한 값이 된다.",
      },
      semantic_type: {
        meaning: "field나 metric의 의미 라벨이다.",
        why: "M6가 자연어 질문과 컬럼을 연결하는 데 쓴다.",
        breaks: "의미 라벨이 없으면 컬럼명이 애매할 때 질의 품질이 떨어진다.",
      },
      VALID_GOLD_DECISIONS: {
        meaning: "Gold에 대해 허용되는 결정 상태 목록이다.",
        why: "승인/보류/거절 상태를 고정한다.",
        breaks: "임의 문자열이 들어오면 workflow가 해석하지 못한다.",
      },
      gold_decision: {
        meaning: "사용자가 Gold 추천을 어떻게 처리했는지 나타낸다.",
        why: "Gold는 추천만으로 실행되지 않고 사용자 결정이 필요하다.",
        breaks: "결정이 없으면 M2가 실행해도 되는지 알 수 없다.",
      },
      silver_decision: {
        meaning: "사용자가 Silver 추천을 어떻게 처리했는지 나타낸다.",
        why: "Silver 승인 상태가 transform spec 생성의 기준이다.",
        breaks: "Silver가 미승인인데 Gold만 ready가 되면 흐름이 깨진다.",
      },
      gold_to_gold_decision: {
        meaning: "Gold 결과에서 추가 Gold를 만들지에 대한 결정이다.",
        why: "Gold-to-Gold는 자동 생성이 아니라 사용자 선택이어야 한다.",
        breaks: "결정이 없으면 추가 파생이 과하게 생길 수 있다.",
      },
      approval_state: {
        meaning: "Silver/Gold 결정 상태를 묶은 승인 artifact다.",
        why: "M5 저장과 M2 실행 전 gate가 같은 상태를 읽는다.",
        breaks: "승인 상태가 없으면 draft와 executable이 섞인다.",
      },
      decision_trace: {
        meaning: "결정 이유와 변경 이력을 남기는 추적 정보다.",
        why: "나중에 왜 이 Gold를 보류했는지 설명한다.",
        breaks: "trace가 없으면 사용자의 수정 이유가 사라진다.",
      },
      gold_decision_artifact: {
        meaning: "Gold 결정만 따로 담은 artifact다.",
        why: "not_requested/deferred도 공식 상태로 downstream에 전달한다.",
        breaks: "Gold 상태가 없으면 catalog와 M6가 Gold 유무를 착각한다.",
      },
      SUPPORTED_ACTIONS: {
        meaning: "compiler가 실제 spec으로 바꿀 수 있는 action 목록이다.",
        why: "지원 밖 action은 안전하게 block/report해야 한다.",
        breaks: "지원 범위가 없으면 실행 불가능한 spec이 만들어진다.",
      },
      silver_operations: {
        meaning: "Silver를 만들기 위한 deterministic operation 목록이다.",
        why: "M2 Spark가 같은 순서로 실행할 수 있게 한다.",
        breaks: "operation이 없으면 추천서일 뿐 실행 계약이 아니다.",
      },
      gold_operations: {
        meaning: "Gold를 만들기 위한 deterministic operation 목록이다.",
        why: "승인된 Gold만 실행 가능한 형태로 바꾼다.",
        breaks: "operation이 없으면 Gold 생성 방법을 넘긴 것이 아니다.",
      },
      silver_spec: {
        meaning: "Silver 생성 방법을 담은 공식 spec artifact다.",
        why: "M3가 T 로직을 정의하고 M2가 실행할 수 있게 한다.",
        breaks: "spec이 없으면 M2가 무엇을 실행할지 모른다.",
      },
      gold_spec: {
        meaning: "Gold 생성 방법을 담은 공식 spec artifact다.",
        why: "Gold 데이터 생성 책임은 M2지만 생성법은 M3가 넘긴다.",
        breaks: "gold_spec이 없으면 누가 Gold를 어떻게 만들지 비어 있다.",
      },
      operations: {
        meaning: "실행 가능한 작업 목록이다.",
        why: "select, cast, aggregate 같은 단계를 순서대로 전달한다.",
        breaks: "operation 배열이 없으면 DAG와 Spark job을 만들 수 없다.",
      },
      input_ref: {
        meaning: "작업이 읽을 upstream artifact_id다.",
        why: "경로 대신 artifact reference manifest로 resolve하게 한다.",
        breaks: "입력 참조가 모호하면 operation 연결이 끊긴다.",
      },
      output_ref: {
        meaning: "작업이 만들 downstream artifact_id다.",
        why: "다음 operation이 같은 이름을 입력으로 사용할 수 있다.",
        breaks: "출력 참조가 없으면 DAG edge를 만들 수 없다.",
      },
      write_mode: {
        meaning: "결과를 preview로만 만들지, 운영 write까지 할지 나타낸다.",
        why: "M3 core는 preview_only만 허용해 책임 경계를 지킨다.",
        breaks: "write_mode가 없으면 테스트와 운영 실행이 섞인다.",
      },
      group_by: {
        meaning: "집계에서 묶을 key 목록이다.",
        why: "product/category/time 등 Gold grain을 고정한다.",
        breaks: "group_by가 없으면 Gold metric의 단위가 불명확하다.",
      },
      time_window: {
        meaning: "시간 단위 집계 window다.",
        why: "실시간/증분 데이터에서 기간 기준을 명확히 한다.",
        breaks: "시간 기준이 없으면 최신성이나 누적 범위가 흔들린다.",
      },
      cardinality_guard: {
        meaning: "group 수가 너무 커지는 것을 막는 제한이다.",
        why: "고유값 폭발로 Gold가 raw만큼 커지는 것을 막는다.",
        breaks: "guard가 없으면 비용과 결과 크기가 폭증할 수 있다.",
      },
      LOGICAL_LAYER_VERSION: {
        meaning: "논리 L단계 계약 버전이다.",
        why: "문서 L0~L16과 물리 artifact 폴더를 구분한다.",
        breaks: "버전이 없으면 옛 L0~L10 설계와 새 L0~L16 설계가 섞인다.",
      },
      LOGICAL_LAYERS: {
        meaning: "논리 단계 목록과 연결 정보다.",
        why: "보고서, UI, artifact graph가 같은 흐름을 보게 한다.",
        breaks: "단계 맵이 없으면 L 번호 의미가 다시 흔들린다.",
      },
      compiler_validation_result: {
        meaning: "compiler가 만든 spec의 검증 결과다.",
        why: "M2에 넘기기 전 실행 불가능한 계약을 잡는다.",
        breaks: "검증 결과 없이 spec을 넘기면 실패가 뒤늦게 난다.",
      },
      unsupported_report: {
        meaning: "지원하지 않는 action이나 core 밖 요구를 모은 보고서다.",
        why: "무시하지 않고 extension hook 또는 block으로 분리한다.",
        breaks: "unsupported가 숨겨지면 실행 중 알 수 없는 실패가 난다.",
      },
      unsupported_actions: {
        meaning: "compiler가 지원하지 않는 작업 목록이다.",
        why: "지원 밖 작업을 실행 가능한 것처럼 넘기지 않는다.",
        breaks: "이 목록이 없으면 M2가 실패할 때까지 모른다.",
      },
      pii_fields: {
        meaning: "PII 의심 field 목록이다.",
        why: "catalog/query 노출과 masking 판단 근거다.",
        breaks: "PII 목록이 없으면 민감정보가 M6에 노출될 수 있다.",
      },
      forbidden_query_fields: {
        meaning: "M6 query context에서 금지할 field 목록이다.",
        why: "catalog에 있더라도 질문에 쓰면 안 되는 컬럼을 막는다.",
        breaks: "금지 목록이 없으면 민감/위험 field가 SQL에 들어간다.",
      },
      compiler_status: {
        meaning: "compiler 검증 상태다.",
        why: "preview gate가 spec 품질을 반영하게 한다.",
        breaks: "compiler가 block인데 preview가 ready가 될 수 있다.",
      },
      structural_status: {
        meaning: "schema, scope, locator 같은 구조 검증 상태다.",
        why: "구조가 흔들리면 품질 축에서 warn/block을 내야 한다.",
        breaks: "구조 상태가 없으면 깨진 schema도 통과할 수 있다.",
      },
      quality_axis: {
        meaning: "Silver 품질 판단 축이다.",
        why: "L15 processing axis로 이어지는 근거다.",
        breaks: "품질 축이 없으면 M6 ready 판단이 단순해진다.",
      },
      silver_preview_ref: {
        meaning: "Silver preview evidence artifact를 가리키는 ref다.",
        why: "gate와 handoff가 같은 preview 증거를 참조한다.",
        breaks: "ref가 없으면 어떤 preview를 기준으로 판단했는지 모른다.",
      },
      gold_status: {
        meaning: "Gold readiness 상태다.",
        why: "Gold 상태를 Silver 상태와 분리한다.",
        breaks: "Gold block이 Silver ready를 오염시킬 수 있다.",
      },
      gold_requested: {
        meaning: "Gold 생성을 요청했는지 여부다.",
        why: "not_requested와 failed를 구분한다.",
        breaks: "요청 여부가 없으면 Gold 없음이 실패처럼 보인다.",
      },
      selected_models: {
        meaning: "사용자가 선택했거나 검토 중인 Gold 모델 목록이다.",
        why: "승인된 후보만 spec으로 내려가야 한다.",
        breaks: "선택 모델이 없으면 모든 후보가 실행 대상처럼 보인다.",
      },
      metric_definitions: {
        meaning: "Gold metric의 이름, 식, 근거, 주의사항 정의다.",
        why: "M1/M6가 metric을 같은 의미로 해석한다.",
        breaks: "정의가 없으면 risk_score 같은 값이 블랙박스가 된다.",
      },
      input_report: {
        meaning: "readiness 판단에 사용한 입력 요약이다.",
        why: "왜 ready/warn/block이 나왔는지 추적한다.",
        breaks: "입력 근거가 없으면 gate 결과를 검증할 수 없다.",
      },
      metric_draft: {
        meaning: "확정 전 Gold metric 후보다.",
        why: "사용자 승인 전 실행 spec과 구분한다.",
        breaks: "draft가 바로 실행되면 사용자 통제권이 없다.",
      },
      status: {
        meaning: "pass, warn, block 같은 판단 결과다.",
        why: "UI, workflow, downstream이 같은 상태 단어를 읽는다.",
        breaks: "상태가 자유 문자열이면 자동 gate가 어렵다.",
      },
      caveats: {
        meaning: "결과 해석 시 주의할 조건이다.",
        why: "missing evidence, zero denominator 같은 한계를 전달한다.",
        breaks: "주의사항이 없으면 사용자가 결과를 과신할 수 있다.",
      },
      processing_axis: {
        meaning: "Silver 처리 품질 축이다.",
        why: "parse/schema/compiler 품질을 Gold와 분리해 판단한다.",
        breaks: "Gold 문제 때문에 Silver가 불필요하게 막힐 수 있다.",
      },
      catalog_axis: {
        meaning: "catalog/query 노출 안전 축이다.",
        why: "PII와 forbidden field를 기준으로 M6 노출을 제어한다.",
        breaks: "안전 축이 없으면 품질이 좋아도 위험한 데이터가 노출된다.",
      },
      gold_axis: {
        meaning: "Gold readiness 전용 축이다.",
        why: "Gold 요청/승인/metric evidence를 별도로 본다.",
        breaks: "Gold 판단이 Silver readiness와 섞인다.",
      },
      silver_context: {
        meaning: "M6가 Silver를 사용할 수 있는지 정리한 context다.",
        why: "Silver query 가능 여부를 독립적으로 전달한다.",
        breaks: "context가 없으면 M6가 catalog만 보고 추측한다.",
      },
      gold_context: {
        meaning: "M6가 Gold를 사용할 수 있는지 정리한 context다.",
        why: "Gold가 deferred/not_requested여도 공식 상태를 전달한다.",
        breaks: "Gold context가 없으면 Gold 없음과 실패가 섞인다.",
      },
      m6_context_status: {
        meaning: "M6가 Silver/Gold context를 사용해도 되는지 최종 요약한 상태 묶음이다.",
        why: "L15와 L16이 같은 값을 가져야 query handoff가 안전하다.",
        breaks: "불일치하면 M6가 잘못된 context를 사용할 수 있어 block해야 한다.",
      },
      gold_l5_status: {
        meaning: "사용자 결정 단계에서 넘어온 Gold 승인 상태다.",
        why: "승인되지 않은 Gold는 ready로 만들면 안 된다.",
        breaks: "L5 상태가 빠지면 사용자 보류를 무시할 수 있다.",
      },
      allowed_columns: {
        meaning: "M6 query에서 사용할 수 있는 컬럼 목록이다.",
        why: "허용된 컬럼만 SQL 생성에 노출한다.",
        breaks: "허용 목록이 없으면 민감 field가 질의에 들어갈 수 있다.",
      },
      allowed_tables: {
        meaning: "M6가 읽을 수 있는 table 목록이다.",
        why: "임의 table 접근을 막고 승인된 dataset만 사용한다.",
        breaks: "table 제한이 없으면 잘못된 dataset을 질의할 수 있다.",
      },
      sql_context: {
        meaning: "M6 SQL 생성을 위한 table, column, limit, freshness 정보다.",
        why: "자연어 질문을 안전한 SQL로 바꾸는 데 필요하다.",
        breaks: "SQL context가 없으면 M6는 catalog를 추측해서 써야 한다.",
      },
      contract_package: {
        meaning: "M3 최종 handoff artifact 묶음이다.",
        why: "M5/M6/M1이 필요한 계약을 한 번에 받을 수 있다.",
        breaks: "package가 없으면 각 artifact를 수동으로 찾아야 한다.",
      },
      artifact_manifest: {
        meaning: "artifact_id와 실제 위치/크기/checksum을 연결하는 목록이다.",
        why: "*_ref를 string id로 통일하려면 resolve 표가 필요하다.",
        breaks: "manifest가 없으면 ref가 어느 파일인지 모른다.",
      },
      dataset_id: {
        meaning: "catalog에서 dataset을 부르는 안정적인 ID다.",
        why: "table name이 바뀌어도 lineage를 유지한다.",
        breaks: "dataset_id가 없으면 catalog sync와 query context가 엇갈린다.",
      },
      gold_layer_status: {
        meaning: "catalog에서 Gold layer가 available/deferred/blocked인지 나타낸다.",
        why: "Gold 상태를 Silver catalog와 분리한다.",
        breaks: "Gold 없음이 Silver catalog 실패처럼 보일 수 있다.",
      },
      gold_product_health: {
        meaning: "상품 단위 건강도 Gold template이다.",
        why: "발표용 핵심 Gold로 product_id, rating, review, conversion, delivery, risk를 묶는다.",
        breaks: "template이 없으면 각 M이 Gold 의미를 다르게 해석한다.",
      },
      risk_score: {
        meaning: "위험 component들을 weight로 합친 점수다.",
        why: "부정 리뷰, 낮은 평점, 낮은 전환율, 배송 지연 같은 신호를 한 값으로 요약한다.",
        breaks: "정책 없이 고정하면 데이터에 없는 신호까지 억지로 계산한다.",
      },
      negative_review_rate: {
        meaning: "부정 리뷰 비율이다.",
        why: "상품 위험도를 설명하는 핵심 review signal이다.",
        breaks: "리뷰/평점 근거 없이 만들면 의미가 없다.",
      },
      late_delivery_rate: {
        meaning: "배송 지연 비율이다.",
        why: "배송 문제가 product health에 미치는 영향을 보여준다.",
        breaks: "배송 근거가 없으면 계산하지 않고 missing evidence로 남겨야 한다.",
      },
      artifact_reference_manifest: {
        meaning: "artifact_id를 physical_uri, checksum, byte_size와 연결하는 최종 manifest다.",
        why: "ref를 경로가 아니라 id로 통일해도 실제 파일을 찾게 한다.",
        breaks: "resolve manifest가 없으면 ref가 죽은 문자열이 된다.",
      },
      transform_spec: {
        meaning: "M2가 실행할 transform 계약이다.",
        why: "M3가 T 로직을 정의하고 실행 엔진은 M2가 맡게 한다.",
        breaks: "spec이 없으면 M3가 추천만 하고 변환 방법을 넘기지 않은 것이다.",
      },
      schema_definition: {
        meaning: "컬럼명, 타입, nullable 같은 schema 계약이다.",
        why: "M1/M5/M6가 같은 데이터 구조를 이해하게 한다.",
        breaks: "schema가 없으면 catalog와 query가 같은 컬럼을 다르게 본다.",
      },
      workflow_definition: {
        meaning: "M5가 DAG로 저장할 node/edge 흐름이다.",
        why: "Source -> Select -> Normalize -> Aggregate -> Load 연결을 표현한다.",
        breaks: "workflow가 없으면 실행 순서와 의존성을 잃는다.",
      },
      catalog_export: {
        meaning: "catalog에 반영할 metadata 최종본이다.",
        why: "dataset, schema, query, lineage, quality를 M5/M6에 넘긴다.",
        breaks: "catalog export가 없으면 결과를 질의/검색 가능한 자산으로 등록하기 어렵다.",
      },
      target_dataset: {
        meaning: "최종 결과 dataset 이름이다.",
        why: "Silver/Gold 결과를 저장하고 catalog에 연결한다.",
        breaks: "target이 없으면 load operation과 catalog가 도착지를 모른다.",
      },
      query_table: {
        meaning: "M6가 질의할 table 이름이다.",
        why: "natural language query를 실제 table로 연결한다.",
        breaks: "query_table이 없으면 SQL을 만들 수 없다.",
      },
      output_columns: {
        meaning: "결과 dataset에 남는 컬럼 목록이다.",
        why: "M1/M6가 어떤 컬럼을 사용할 수 있는지 안다.",
        breaks: "출력 컬럼이 없으면 catalog schema와 실제 결과가 맞는지 확인하기 어렵다.",
      },
    };
    d.source_uri = { ...d.uri, meaning: "원본 source의 URI다. source_path보다 실행 환경 독립적인 위치 표현이다." };
    d.source_path = { ...d.path, meaning: "원본 source의 로컬 path다. 사람이 로컬에서 확인하기 위한 값이다." };
    d.raw_sha256 = { ...d.checksum, meaning: "sample raw 조각의 sha256 지문이다." };
    d.raw_preview = { ...d.payload, meaning: "사람이 확인할 수 있게 제한한 raw 미리보기다." };
    d.policy_status = { ...d.status, meaning: "risk_score_policy 같은 정책 추천의 상태다." };
    d.metric_draft = d.metric_draft;
    d.metric_definitions = d.metric_definitions;
    return d;
  }

  function normalizeLayerAnalysis(analysis, plain) {
    const text = [
      analysis.choice,
      analysis.function,
      analysis.effect,
      analysis.limits,
      analysis.usage,
      ...(analysis.advantages || []),
      ...(analysis.tradeoffs || []),
    ]
      .filter(Boolean)
      .join(" ");
    if (text && !looksBrokenText(text)) return analysis;
    return {
      choice: plain.why || plain.easyMeaning || plain.oneLine,
      function: plain.oneLine || plain.simpleTitle,
      effect: plain.next || "",
      limits: plain.watch || "",
      usage: plain.watch || "입력, 판단 기준, 산출물, 다음 전달 대상이 서로 맞는지 확인한다.",
      advantages: [
        plain.why || "이 단계의 판단 근거를 산출물로 남겨 다음 단계가 추측하지 않게 한다.",
        plain.next || "다음 L 단계와 다른 M이 같은 계약 필드를 읽을 수 있게 한다.",
      ].filter(Boolean),
      tradeoffs: [plain.watch || "sample/profile 기반 판단은 확정 실행 결과가 아니므로 이후 승인과 preview 검증이 필요하다."],
      snippets: {},
    };
  }

  function looksBrokenText(text) {
    if (!text) return false;
    const questionMarks = (text.match(/\?/g) || []).length;
    const cjkChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const replacementChars = (text.match(/\uFFFD/g) || []).length;
    return replacementChars > 0 || cjkChars > 3 || questionMarks > Math.max(8, text.length * 0.08);
  }

  function buildLineWalkthrough(currentLayerId, snippet, plain) {
    const wrapper = document.createElement("div");
    wrapper.className = "source-line-walkthrough";

    const header = document.createElement("div");
    header.className = "line-walkthrough-header";
    const title = document.createElement("strong");
    title.textContent = "코드 줄별 해설";
    const hint = document.createElement("p");
    hint.textContent =
      "아래는 표가 아니라 코드 리더 형태다. 각 줄마다 먼저 실제 코드를 크게 보여주고, 바로 밑에서 쉬운 설명과 M3 계약상 필요한 이유를 나눠 적었다.";
    header.append(title, hint);
    wrapper.appendChild(header);

    const rows = parseSnippetLines(snippet.code);
    const list = document.createElement("div");
    list.className = "line-walkthrough-list";
    rows.forEach((row, index) => {
      const explanation = explainSourceLine(currentLayerId, snippet, plain, row, index, rows);
      const card = document.createElement("article");
      card.className = trimmedLineKind(row.code);

      const codeRow = document.createElement("div");
      codeRow.className = "line-card-code";

      const lineBadge = document.createElement("span");
      lineBadge.className = "line-number-cell";
      lineBadge.textContent = row.line || "-";

      const pre = document.createElement("pre");
      pre.className = "line-code-cell";
      const code = document.createElement("code");
      code.textContent = row.code || "(빈 줄)";
      pre.appendChild(code);
      codeRow.append(lineBadge, pre);

      const explainGrid = document.createElement("div");
      explainGrid.className = "line-card-explain";
      explainGrid.append(
        buildLineExplainBlock("쉬운 설명", explanation.meaning),
        buildLineExplainBlock("왜 필요한가", explanation.reason)
      );

      card.append(codeRow, explainGrid);
      list.appendChild(card);
    });
    wrapper.appendChild(list);
    return wrapper;
  }

  function buildLineExplainBlock(label, text) {
    const block = document.createElement("div");
    block.className = "line-explain-block";
    const title = document.createElement("b");
    title.textContent = label;
    const body = document.createElement("p");
    body.textContent = text;
    block.append(title, body);
    return block;
  }

  function trimmedLineKind(code) {
    const trimmed = (code || "").trim();
    const classes = ["line-card"];
    if (!trimmed) classes.push("blank");
    if (trimmed.startsWith("def ")) classes.push("function-line");
    if (trimmed.startsWith("return")) classes.push("return-line");
    if (trimmed.startsWith("if ") || trimmed.startsWith("elif ") || trimmed.startsWith("else:")) classes.push("branch-line");
    if (trimmed.startsWith("for ")) classes.push("loop-line");
    if (/^["']?[a-zA-Z0-9_]+["']?\s*:/.test(trimmed)) classes.push("json-field-line");
    return classes.join(" ");
  }

  function parseSnippetLines(codeText) {
    return codeText.split("\n").map((line) => {
      const match = line.match(/^\s*(\d+)\s\|\s?(.*)$/);
      if (!match) return { line: "", code: line };
      return { line: match[1], code: match[2] };
    });
  }

  function explainSourceLinePlainV2(currentLayerId, snippet, plain, row, index, rows) {
    const code = row.code || "";
    const trimmed = code.trim();
    const layerName = `${currentLayerId} ${plain.simpleTitle || ""}`.trim();
    const blockTitle = snippet.title || "code block";

    if (!trimmed) {
      return {
        meaning: "빈 줄이다. 실행되는 코드는 아니지만, 함수 입력부와 실제 처리부, 또는 큰 JSON 구조 사이를 눈으로 구분하게 해 준다.",
        reason: "이 문서는 코드 원문과 설명을 같이 읽는 용도다. 빈 줄이 있으면 '여기부터 준비가 끝나고 본문이 시작된다' 같은 경계가 보인다.",
      };
    }

    const parameter = explainPlainParameter(trimmed, layerName, currentLayerId, blockTitle);
    if (parameter) return parameter;

    const jsonField = explainPlainJsonField(trimmed, layerName, currentLayerId, blockTitle);
    if (jsonField) return jsonField;

    const keywordArgument = explainPlainKeywordArgument(trimmed, layerName, currentLayerId, blockTitle);
    if (keywordArgument) return keywordArgument;

    if (trimmed.startsWith("def ")) {
      const name = trimmed.match(/^def\s+([a-zA-Z0-9_]+)/)?.[1] || "함수";
      return {
        meaning: `이 줄은 ${name}라는 작업 단위를 시작한다. 화면에서 보고 있는 ${blockTitle}의 코드가 이 함수 안에서 실행된다.`,
        reason: `${layerName}가 만드는 산출물은 이 함수의 입력값과 반환값으로 경계가 정해진다. 함수 이름은 단순한 코드 이름이 아니라 이 L단계가 어떤 계약 파일을 만들지 알려주는 표지다.`,
      };
    }

    if (trimmed.startsWith(") ->")) {
      return {
        meaning: "함수 입력 목록이 끝났고, 결과를 Python dictionary 형태로 돌려준다는 표시다.",
        reason: "M3 산출물은 대부분 JSON으로 저장된다. 코드 내부에서는 dictionary로 만들고, 마지막에 artifact 파일로 기록하기 때문에 반환 모양이 중요하다.",
      };
    }

    if (trimmed.startsWith('"""') || trimmed.endsWith('"""')) {
      return {
        meaning: "함수의 책임을 짧게 적은 설명문이다. 실행 결과를 바꾸지는 않지만, 이 단계가 하지 말아야 할 일까지 암시한다.",
        reason: "예를 들어 L0 설명문에 raw를 복사하거나 변형하지 않는다고 적혀 있으면, 이 함수가 원본 실행 엔진이 아니라 manifest 생성기라는 경계가 분명해진다.",
      };
    }

    if (/^for\s+/.test(trimmed)) {
      return explainPlainLoop(trimmed, layerName);
    }

    if (/^if\s+/.test(trimmed)) {
      return explainPlainCondition(trimmed, layerName);
    }

    if (/^elif\s+/.test(trimmed) || /^else:/.test(trimmed)) {
      return {
        meaning: "앞 조건이 맞지 않을 때 다른 처리 길을 선택하는 분기다.",
        reason: "unknown data에서는 형식, 승인 상태, metric 근거가 항상 같지 않다. 분기 처리가 있어야 CSV/JSON, pass/warn/block, approved/deferred 같은 상태가 섞여도 한쪽으로 억지 해석하지 않는다.",
      };
    }

    if (/^try:/.test(trimmed)) {
      return {
        meaning: "실패할 수 있는 작업을 조심스럽게 시도하는 시작점이다.",
        reason: "낯선 파일, 깨진 JSON, 읽기 어려운 artifact가 있어도 전체 설명 페이지가 바로 멈추면 안 된다. 실패 가능 구간을 분리해야 rescue lane이나 unsupported report처럼 증거를 남길 수 있다.",
      };
    }

    if (/^except\b/.test(trimmed)) {
      return {
        meaning: "try 구간에서 오류가 났을 때 들어오는 처리 경로다.",
        reason: "오류를 조용히 무시하면 데이터 품질 문제가 숨는다. 이 경로는 실패를 기록 가능한 상태로 바꿔 다음 단계가 판단하게 만든다.",
      };
    }

    if (/^with\s+/.test(trimmed)) {
      return {
        meaning: "파일이나 자원을 열고, 블록이 끝나면 자동으로 정리되게 하는 Python 문법이다.",
        reason: "대용량 파일을 다룰 때 파일 handle을 열어 둔 채 방치하면 다음 읽기나 병렬 작업이 불안정해진다. 이 줄은 안전하게 열고 닫는 경계를 만든다.",
      };
    }

    if (/^return\b/.test(trimmed)) {
      return explainPlainReturn(trimmed, layerName);
    }

    const assignment = explainPlainAssignment(trimmed, layerName, currentLayerId, blockTitle);
    if (assignment) return assignment;

    if (trimmed.includes("with_header(")) {
      return {
        meaning: "일반 dictionary를 M3 artifact 형식으로 감싸기 시작한다.",
        reason: "artifact header에는 layer, name, source_id, run_id, schema_version, access_class 같은 공통 정보가 붙는다. 다른 M은 이 header를 보고 파일의 정체와 접근 범위를 판단한다.",
      };
    }

    if (trimmed.includes("artifact_ref(")) {
      return {
        meaning: "다른 산출물을 파일 경로가 아니라 artifact_id 문자열로 가리키는 코드다.",
        reason: "`*_ref`를 실제 경로로 쓰면 폴더 이동, MinIO 이동, 노트북/도커 실행 환경 차이에 약하다. artifact_id로 통일하고 L16의 `artifact_reference_manifest`에서 실제 위치를 찾는 구조가 더 안전하다.",
      };
    }

    if (trimmed.includes("write_json") || trimmed.includes("write_jsonl")) {
      return {
        meaning: "지금까지 만든 계약 내용을 실제 artifact 파일로 기록하는 줄이다.",
        reason: "M2, M5, M6는 브라우저 메모리 안의 값을 읽지 않는다. 파일로 남겨야 검증, 재실행, PR 리뷰, catalog handoff가 가능하다.",
      };
    }

    if (trimmed.includes("ensure_dir(")) {
      return {
        meaning: "이번 L단계의 산출물 폴더가 없으면 미리 준비하는 줄이다.",
        reason: "L0~L16 산출물이 같은 위치 규칙을 따라야 사람이 찾기 쉽고, artifact manifest도 안정적으로 만들 수 있다.",
      };
    }

    if (trimmed.includes("iter_source_files(")) {
      return {
        meaning: "사용자가 준 source가 파일이면 그 파일 하나를, 폴더면 안의 파일들을 안정된 순서로 모으는 줄이다.",
        reason: "파일 순서가 실행마다 달라지면 `object_id`와 `source_unit_id`가 바뀐다. 그러면 이전 run과 비교하거나 원본을 replay하기 어렵다.",
      };
    }

    if (trimmed.includes("file_fingerprint(")) {
      return {
        meaning: "파일의 위치, 크기, 수정 시각, checksum 같은 원본 식별 정보를 계산하는 줄이다.",
        reason: "`path`는 위치만 말하고 내용 변경은 보장하지 못한다. fingerprint가 있어야 같은 이름의 다른 파일을 구분할 수 있다.",
      };
    }

    if (trimmed.includes("stable_json_hash(")) {
      return {
        meaning: "JSON 내용을 안정된 순서로 정리한 뒤 hash를 계산하는 줄이다.",
        reason: "같은 구조라면 같은 hash가 나와야 schema drift나 manifest 변경을 비교할 수 있다. key 순서 때문에 hash가 흔들리면 비교 근거가 약해진다.",
      };
    }

    if (trimmed.includes("json.loads(")) {
      return {
        meaning: "문자열로 읽은 JSON을 Python 객체로 해석하는 줄이다.",
        reason: "artifact header나 profile 내용을 검사하려면 단순 문자열이 아니라 key/value 구조로 읽어야 한다.",
      };
    }

    if (trimmed.includes("csv.reader(")) {
      return {
        meaning: "CSV 한 줄을 쉼표와 따옴표 규칙에 맞춰 컬럼 배열로 읽는 줄이다.",
        reason: "단순 문자열 split은 따옴표 안의 쉼표를 잘못 자를 수 있다. 표준 reader를 써야 profile 통계가 덜 흔들린다.",
      };
    }

    if (trimmed.includes("hashlib.sha256(")) {
      return {
        meaning: "원본 조각이나 artifact 내용의 SHA-256 지문을 계산하는 줄이다.",
        reason: "지문이 있으면 preview에 일부 내용만 남겨도 같은 원본 조각인지 나중에 다시 확인할 수 있다.",
      };
    }

    if (trimmed.includes(".append(")) {
      return {
        meaning: "앞에서 준비한 목록에 새 항목을 하나 더 연결하는 줄이다.",
        reason: "objects, fields, metrics, checks처럼 여러 항목이 모여 하나의 artifact body가 된다. 반복 중 누적되는 항목을 빠뜨리면 산출물 범위가 줄어든다.",
      };
    }

    if (/^[\}\]\)],?$/.test(trimmed)) {
      return {
        meaning: "앞에서 열린 dictionary, list, 함수 호출 블록을 닫는 줄이다.",
        reason: "M3 artifact는 중첩 JSON 구조가 많다. 닫힘 경계가 맞아야 body, refs, operations, metrics 같은 묶음이 올바르게 구분된다.",
      };
    }

    if (/^[\{\[]$/.test(trimmed) || trimmed === "{" || trimmed === "[") {
      return {
        meaning: "새 dictionary 또는 list 구조를 시작하는 줄이다.",
        reason: "계약 파일은 단일 값보다 묶음 구조가 중요하다. 이 줄 이후의 field들이 하나의 artifact body나 operation 목록으로 묶인다.",
      };
    }

    return {
      meaning: `이 줄은 ${layerName}에서 위아래 코드와 함께 계약 묶음을 완성하는 흐름 유지 줄이다. 실제 코드 내용은 \`${trimmed}\`이다.`,
      reason: "특정 field나 operation으로 바로 분류되지 않더라도, 이 줄은 주변 줄과 함께 artifact body, 검증 결과, 또는 다음 단계 handoff를 완성한다.",
    };
  }

  function explainPlainParameter(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*([^=,]+)(?:=\s*([^,]+))?,?$/);
    if (!match) return null;
    const [, name, type, defaultValue] = match;
    const term = plainTermStoryV2(name, { layerName, currentLayerId, blockTitle, value: defaultValue || "" }) || plainTermStory(name);
    const defaultText = defaultValue ? ` 기본값은 \`${defaultValue.trim()}\`이다.` : "";
    return {
      meaning: term
        ? `${name} 파라미터다. ${term.meaning}${defaultText}`
        : `${name}이라는 입력값을 받는다. 타입 표시는 \`${type.trim()}\`이고, 이 값은 ${layerName} 실행 범위를 정하는 데 쓰인다.${defaultText}`,
      reason: term
        ? term.why
        : "입력값이 분명해야 같은 코드가 작은 샘플, 5GB 검증, 100GB 검증에서도 같은 기준으로 움직인다.",
    };
  }

  function explainPlainJsonField(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const match = trimmed.match(/^["']([^"']+)["']:\s*(.*),?$/);
    if (!match) return null;
    const [, key, valueRaw] = match;
    const value = valueRaw.replace(/,$/, "").trim();
    const term = plainTermStoryV2(key, { layerName, currentLayerId, blockTitle, value }) || plainTermStory(key);
    const fallback = fieldStoryFallback(key, { layerName, currentLayerId, blockTitle, value });
    return {
      meaning: term
        ? `${key} 필드다. ${term.meaning} 이 코드에서는 값 후보가 \`${value || "하위 블록"}\`로 표현된다.`
        : fallback.meaning,
      reason: term
        ? term.why
        : fallback.why,
    };
  }

  function explainPlainAssignment(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_\[\]\"'.]*)\s*(?::[^=]+)?=\s*(.+)$/);
    if (!match) return null;
    const left = match[1].replace(/\[.*$/, "").replace(/\..*$/, "");
    const right = match[2].replace(/,$/, "").trim();
    const term = plainTermStoryV2(left, { layerName, currentLayerId, blockTitle, value: right }) || plainTermStory(left);
    if (term) {
      return {
        meaning: `${left} 값을 계산하거나 준비하는 줄이다. ${term.meaning}`,
        reason: term.why,
      };
    }
    if (right.includes("f\"") || right.includes("f'")) {
      return {
        meaning: `${left}라는 이름을 source_id, run_id, index 같은 실행 정보를 조합해 만든다.`,
        reason: "실행마다 이름 규칙이 안정적이어야 artifact, object, dataset을 다시 찾고 이전 실행과 비교할 수 있다.",
      };
    }
    if (right.includes("len(")) {
      return {
        meaning: `${left}는 목록이나 샘플의 개수를 세어 만든 값이다.`,
        reason: "row 수, field 수, object 수 같은 숫자는 품질 판단과 보고서 해석의 기본 근거가 된다.",
      };
    }
    if (right.includes("sum(")) {
      return {
        meaning: `${left}는 여러 항목의 숫자를 합쳐 만든 값이다.`,
        reason: "전체 byte size나 metric 합계처럼 규모를 보여주는 값은 대용량 현실성 판단에 필요하다.",
      };
    }
    if (right.includes("[") && right.includes("for ")) {
      return {
        meaning: `${left}는 여러 항목에서 필요한 값만 뽑아 만든 목록이다.`,
        reason: "source_unit_ids, object_ids, fields, metrics처럼 반복해서 쓰는 목록은 명확한 배열로 정리돼야 downstream이 같은 범위를 읽는다.",
      };
    }
    return {
      meaning: `${left}는 오른쪽 계산 결과에 이름을 붙여 아래 코드가 다시 사용할 수 있게 하는 값이다.`,
      reason: "중간값에 이름을 붙이면 artifact body를 만들 때 같은 기준을 여러 번 재사용할 수 있고, 단계별 의미도 추적하기 쉬워진다.",
    };
  }

  function explainPlainLoop(trimmed, layerName) {
    if (trimmed.includes("enumerate(files")) {
      return {
        meaning: "원본 파일 목록을 하나씩 보면서 순번과 path를 함께 받는 반복문이다.",
        reason: "순번은 안정적인 `object_id`와 `source_unit_id`를 만드는 재료가 된다. 파일 순서가 흔들리면 lineage가 흔들린다.",
      };
    }
    if (trimmed.includes("for line_number")) {
      return {
        meaning: "파일을 줄 단위로 읽으면서 line_number와 raw byte를 함께 받는 반복문이다.",
        reason: "line_number와 byte 범위가 있어야 Bronze sample이 원본의 어느 위치였는지 되돌아갈 수 있다.",
      };
    }
    if (trimmed.includes("fields")) {
      return {
        meaning: "profile에 있는 field들을 하나씩 보면서 추천 근거와 정책을 만드는 반복문이다.",
        reason: "unknown data에서는 column마다 타입, null, PII, semantic hint가 다르다. field별 판단을 해야 Silver/Gold 추천이 구체적이 된다.",
      };
    }
    if (trimmed.includes("metrics")) {
      return {
        meaning: "Gold metric 후보를 하나씩 보면서 계산 규칙과 caveat를 정리하는 반복문이다.",
        reason: "review_count, average_rating, risk_score 같은 값은 필요한 근거와 계산식이 다르다. metric별로 보지 않으면 Gold 설명이 뭉개진다.",
      };
    }
    if (trimmed.includes("path in sorted")) {
      return {
        meaning: "산출물 폴더 아래 파일을 정해진 순서로 읽어 artifact 목록을 만드는 반복문이다.",
        reason: "L16의 artifact_reference_manifest는 모든 산출물을 빠짐없이, 흔들리지 않는 순서로 resolve해야 한다.",
      };
    }
    return {
      meaning: "반복 대상에서 값을 차례로 꺼내 같은 판단 기준을 적용하는 반복문이다.",
      reason: `${layerName}에서는 파일, field, metric, artifact처럼 여러 항목을 다룬다. 반복문이 있어야 항목마다 같은 계약 규칙을 적용할 수 있다.`,
    };
  }

  function explainPlainCondition(trimmed, layerName) {
    if (trimmed.includes("max_rows") || trimmed.includes("max_bytes")) {
      return {
        meaning: "샘플 row 수나 byte 수가 정해진 한도를 넘었는지 확인한다.",
        reason: "M3가 전체 대용량 실행을 맡지 않도록 막는 안전선이다. 한도를 넘으면 M2 Spark가 처리할 영역으로 남겨야 한다.",
      };
    }
    if (trimmed.includes("approved")) {
      return {
        meaning: "사용자가 승인한 상태인지 확인한다.",
        reason: "draft 추천이 곧바로 실행 spec이 되면 안 된다. 승인된 Silver/Gold만 다음 compiler 단계로 가야 한다.",
      };
    }
    if (trimmed.toLowerCase().includes("pii")) {
      return {
        meaning: "민감정보 후보인지 확인한다.",
        reason: "PII 후보를 query나 catalog에 그대로 열면 M6 질의 안전성이 깨진다. 조건문으로 노출 정책을 갈라야 한다.",
      };
    }
    if (trimmed.includes("not_requested") || trimmed.includes("deferred")) {
      return {
        meaning: "Gold가 요청되지 않았거나 보류된 상태인지 확인한다.",
        reason: "이 상태는 실패가 아니다. Silver를 계속 사용할 수 있는지와 Gold를 아직 만들지 않는지를 분리해야 한다.",
      };
    }
    if (trimmed.includes("block")) {
      return {
        meaning: "검증 결과가 block인지 확인한다.",
        reason: "block은 downstream으로 넘기면 안 되는 상태다. warn처럼 주의만 붙이고 진행할 수 있는 상태와 다르게 다뤄야 한다.",
      };
    }
    if (trimmed.includes("path.is_file")) {
      return {
        meaning: "현재 항목이 실제 파일인지 확인한다.",
        reason: "artifact manifest에는 폴더가 아니라 읽을 수 있는 파일만 올라가야 한다.",
      };
    }
    return {
      meaning: `조건 \`${trimmed.replace(/^if\s+/, "").replace(/:$/, "")}\`을 확인해 처리 경로를 나눈다.`,
      reason: `${layerName}는 unknown data를 다루기 때문에 입력 형식, 승인 상태, 품질 상태가 매번 다를 수 있다. 조건문은 가능한 경우와 막아야 할 경우를 분리한다.`,
    };
  }

  function explainPlainReturn(trimmed, layerName) {
    if (trimmed === "return rows") {
      return {
        meaning: "지금까지 모은 Bronze sample record 목록을 호출한 쪽으로 돌려준다.",
        reason: "L2 profile은 이 sample 목록을 입력으로 삼는다. record 위치 정보가 함께 있어야 profile 결과도 원본 lineage를 잃지 않는다.",
      };
    }
    if (trimmed === "return fields") {
      return {
        meaning: "field profile 목록을 호출한 쪽으로 돌려준다.",
        reason: "이 목록이 L3 evidence, L6 Silver 추천, L7 Gold 추천의 기본 재료가 된다.",
      };
    }
    if (trimmed.includes("{")) {
      return {
        meaning: `${layerName}에서 만든 여러 산출물을 하나의 dictionary 묶음으로 돌려주기 시작한다.`,
        reason: "다음 L단계가 필요한 artifact를 이름으로 꺼내 쓸 수 있어야 한다. 반환 묶음이 흐리면 단계 간 연결이 깨진다.",
      };
    }
    return {
      meaning: "함수의 최종 결과를 호출한 쪽으로 돌려주는 줄이다.",
      reason: "M3의 각 L단계는 결과를 다음 단계가 다시 사용한다. return 값은 그 연결 지점이다.",
    };
  }

  function plainTermStoryV2(name, ctx = {}) {
    const stories = {
      objects: {
        meaning: "L0가 발견한 원본 파일 또는 object들의 목록이다. 각 항목에는 object_id, source_unit_id, uri, path, checksum, byte_size 같은 원본 재접근 정보가 들어간다.",
        why: "`objects`가 없으면 L1이 sample row를 읽어도 그 row가 어느 물리 원본에서 왔는지 붙일 수 없다. 이후 M2 Spark가 같은 원본을 다시 읽거나 M6 catalog가 lineage를 설명할 때도 이 목록이 기준이 된다.",
      },
      stream_windows: {
        meaning: "stream 입력을 window 단위로 다룰 때 쓸 자리다. 현재 batch 파일 중심 테스트에서는 빈 배열이지만, schema 안에 자리를 남겨 object_batch와 stream_window가 같은 manifest 구조를 공유하게 한다.",
        why: "이 필드가 없으면 나중에 실시간 window를 추가할 때 L0 manifest 모양 자체가 바뀐다. 빈 배열이라도 명시해 두면 batch와 stream의 차이를 값으로 표현할 수 있고, core가 stream runtime을 직접 구현하지 않는다는 경계도 보인다.",
      },
      raw_policy: {
        meaning: "M3가 원본 payload에 대해 지켜야 할 금지와 허용 정책 묶음이다. 여기에는 raw를 복사하지 않는지, 수정하지 않는지, checksum 기본 정책이 무엇인지가 들어간다.",
        why: "M3는 ETL의 변환 계약을 만드는 쪽이지 원본 저장소를 새로 소유하는 쪽이 아니다. `raw_policy`가 있어야 raw copy나 raw mutation을 M3 책임으로 착각하지 않고, 원본 보존 책임을 명확히 분리할 수 있다.",
      },
      copy_raw_payload: {
        meaning: "M3가 원본 row나 파일 내용을 자기 산출물 폴더로 통째로 복사해도 되는지를 나타낸다. L0에서는 `False`라서 원본은 제자리에 두고 manifest와 replay 정보만 만든다는 뜻이다.",
        why: "100GB급 데이터에서 raw를 복사하면 저장 공간과 시간이 급격히 늘고, 개인정보 복제 위험도 커진다. 이 값이 `False`여야 M3가 가벼운 control-plane이라는 설계가 유지된다.",
      },
      mutate_raw_payload: {
        meaning: "M3가 원본 파일 내용을 직접 수정해도 되는지를 나타낸다. L0에서는 `False`라서 정제나 변환은 원본 위에 덮어쓰는 방식이 아니라 별도 Silver/Gold spec으로만 제안한다.",
        why: "원본을 바꾸면 재현성과 감사가 깨진다. 정제가 틀렸을 때 raw로 돌아갈 수 있어야 하므로 M3는 raw mutation을 금지해야 한다.",
      },
      source_units: {
        meaning: "M3가 이후 단계에서 같은 범위를 말할 때 쓰는 처리 단위 목록이다. 하나의 unit은 object 하나일 수도 있고, 여러 object 묶음이나 stream window일 수도 있다.",
        why: "Silver preview, Gold spec, catalog lineage가 모두 같은 `source_unit_id`를 따라가야 한다. 이 목록이 없으면 어떤 범위에 추천과 spec을 적용했는지 알 수 없다.",
      },
      object_count: {
        meaning: "L0가 발견한 물리 object의 개수다. 폴더 안 파일이 몇 개였는지, 또는 object store에서 몇 개의 원본 조각을 잡았는지 보여준다.",
        why: "object 수는 샘플링 범위와 lineage 검증의 첫 번째 sanity check다. 10개 파일을 등록했는데 1개만 잡히면 뒤 단계 profile이 전체를 대표한다고 말할 수 없다.",
      },
      total_size_bytes: {
        meaning: "L0가 발견한 원본 object들의 byte 크기 합계다.",
        why: "M3가 다루는 데이터 규모를 숫자로 확인하기 위해 필요하다. 100GB 검증인지 작은 샘플인지 이 값으로 빠르게 구분할 수 있다.",
      },
      source_root: {
        meaning: "사용자가 등록한 원본의 시작 경로다. 파일 하나일 수도 있고 폴더나 object prefix일 수도 있다.",
        why: "나중에 source_id만 보고는 실제 등록 위치를 알 수 없다. source_root가 있어야 사람이 이 run이 어떤 입력에서 시작됐는지 확인할 수 있다.",
      },
      source_kind: {
        meaning: "원본이 batch object인지 stream인지 같은 큰 종류를 나타낸다.",
        why: "object 기반 record와 stream 기반 record는 replay locator가 다르다. source_kind가 있어야 L1 이후가 line/byte locator를 쓸지 stream offset을 쓸지 판단할 수 있다.",
      },
      declared_format: {
        meaning: "사용자가 미리 선언했거나 L0에서 아직 모른다고 표시한 원본 format 값이다. L0에서는 보통 `unknown`이다.",
        why: "L0는 format을 확정하지 않는다. 여기서 unknown으로 남겨야 L2 format detection이 실제 sample profile 근거로 판단하게 된다.",
      },
      default_checksum_mode: {
        meaning: "이 manifest가 기본으로 사용한 checksum 정책이다. `prefix`면 파일 앞부분만, `full`이면 전체 파일을 읽어 지문을 만든다.",
        why: "checksum 강도와 비용을 나중에 해석하려면 어떤 방식으로 계산했는지 함께 남아야 한다. hash 값만 있고 mode가 없으면 신뢰 수준을 판단할 수 없다.",
      },
      replay_contract: {
        meaning: "M2나 검증 도구가 원본을 다시 읽을 때 어떤 식별자 조합을 써야 하는지 적은 규칙 문장이다.",
        why: "M3는 raw를 복사하지 않기 때문에 replay 방법이 계약으로 남아야 한다. source_unit_id, object_id, locator를 같이 써야 같은 원본 조각으로 돌아갈 수 있다.",
      },
      object_uris: {
        meaning: "L0가 발견한 원본 object들의 URI 목록이다.",
        why: "raw_replay_pointer를 읽는 쪽이 실제 원본 후보 위치를 빠르게 확인할 수 있게 한다. path가 아닌 uri 중심으로 남겨야 저장소 종류까지 보존된다.",
      },
      sample_lane: {
        meaning: "L1이 전체 데이터가 아니라 제한된 sample만 읽는다는 정책 묶음이다. row_limit, byte_limit, policy가 여기 들어간다.",
        why: "이 값이 있어야 L1 결과를 전체 데이터 통계로 오해하지 않는다. M3는 control-plane sample만 만들고, 전체 materialization은 M2 책임이라는 경계가 드러난다.",
      },
      row_limit: {
        meaning: "L1이 sample로 읽을 최대 row 수다.",
        why: "row_limit이 없으면 unknown data에서 샘플링이 끝없이 커질 수 있다. 대용량에서는 반드시 상한이 있어야 한다.",
      },
      byte_limit: {
        meaning: "L1이 sample로 읽을 최대 byte 수다.",
        why: "row 수가 적어도 한 row가 매우 클 수 있다. byte_limit은 큰 JSON line이나 긴 text 때문에 M3가 과도하게 느려지는 것을 막는다.",
      },
      rescue_lane_required: {
        meaning: "깨진 record나 parse 실패를 버리지 않고 별도 lane에 남겨야 하는지 나타낸다.",
        why: "실패 record는 데이터 품질 정보다. 삭제하면 row 손실이 감춰지고, 나중에 Silver 정책을 고칠 근거가 사라진다.",
      },
      parse_status: {
        meaning: "record나 sample이 정상적으로 해석됐는지, 실패했는지, 보류됐는지 나타내는 상태다.",
        why: "모든 row가 정상이라고 가정하면 unknown data에서 품질 문제가 숨는다. parse_status가 있어야 quarantine이나 quality gate로 이어진다.",
      },
      record_id: {
        meaning: "L1 sample record 하나를 부르는 고유 id다.",
        why: "line_number만으로는 파일이 여러 개일 때 record를 전역적으로 구분하기 어렵다. record_id가 있어야 보고서와 rescue lane에서 같은 record를 다시 가리킬 수 있다.",
      },
      byte_start: {
        meaning: "sample record가 원본 파일 안에서 시작되는 byte 위치다.",
        why: "line 단위가 깨지거나 encoding 문제가 있을 때 byte 위치가 있어야 정확한 원본 조각을 다시 찾을 수 있다.",
      },
      byte_end: {
        meaning: "sample record가 원본 파일 안에서 끝나는 byte 위치다.",
        why: "byte_start와 함께 원본 조각의 범위를 만든다. 이 범위가 있어야 replay와 디버깅이 가능하다.",
      },
      line_number: {
        meaning: "sample record가 원본 텍스트 파일의 몇 번째 줄에서 왔는지 나타낸다.",
        why: "사람이 원본을 열어 확인할 때 가장 직관적인 좌표다. byte 범위와 함께 남기면 replay 정확도가 올라간다.",
      },
      payload: {
        meaning: "sample record에서 추천과 profile에 필요한 만큼만 남긴 짧은 내용이다.",
        why: "payload는 원본 전체 복사가 아니다. 길이를 제한해야 M3 산출물이 raw 저장소가 되지 않고 privacy 위험도 줄어든다.",
      },
      raw_preview: {
        meaning: "사람이나 profile 단계가 볼 수 있는 짧은 원본 미리보기다.",
        why: "미리보기는 디버깅에는 필요하지만 전체 raw를 대체하면 안 된다. 그래서 길이 제한과 raw_snippet_status가 함께 필요하다.",
      },
      raw_sha256: {
        meaning: "sample로 읽은 raw byte 조각의 SHA-256 지문이다.",
        why: "preview가 잘려 있어도 이 지문으로 같은 raw 조각인지 다시 확인할 수 있다.",
      },
      raw_snippet_status: {
        meaning: "raw preview가 어떤 제한 상태로 들어갔는지 설명하는 상태값이다.",
        why: "preview가 전체 원문인지, 잘린 미리보기인지, redaction된 값인지 알아야 privacy와 재현성 수준을 판단할 수 있다.",
      },
      raw_size_bytes: {
        meaning: "sample record의 원본 byte 크기다.",
        why: "payload가 잘려 있어도 원래 record가 얼마나 컸는지 알 수 있어야 대용량 row나 이상 record를 감지할 수 있다.",
      },
      source_uri: {
        meaning: "해당 sample record가 나온 원본 object의 URI다.",
        why: "record 단위에서도 uri가 있으면 파일 경로가 바뀌거나 실행 환경이 달라져도 원본 위치를 추적할 수 있다.",
      },
      source_path: {
        meaning: "해당 field나 record가 원본 구조 안에서 어디에 있었는지 나타내는 경로다.",
        why: "Silver에서 target_name으로 바뀌더라도 원래 이름과 위치를 잃으면 lineage와 디버깅이 어렵다.",
      },
      row_number_hint: {
        meaning: "record가 몇 번째 row였는지 사람이 볼 수 있게 남기는 힌트다.",
        why: "정확한 replay는 locator가 담당하지만, row_number_hint는 보고서와 수동 검증에서 빠르게 위치를 찾게 해 준다.",
      },
      event_time_candidate: {
        meaning: "record 안에서 event time으로 쓸 수 있을지 모르는 후보값이다.",
        why: "stream이나 time-window Gold를 만들려면 event time이 필요할 수 있다. 없으면 None으로 남겨 억지 추론을 막는다.",
      },
      format_detection: {
        meaning: "L2가 sample을 보고 추정한 파일 형식과 그 근거다.",
        why: "CSV/JSON/JSONL을 감으로 정하면 parser가 틀릴 수 있다. detection 결과와 confidence가 있어야 추천의 신뢰도를 해석할 수 있다.",
      },
      detected_format: {
        meaning: "L2가 가장 그럴듯하다고 본 format 이름이다.",
        why: "이 값에 따라 JSON profiler, CSV profiler, fallback text profiler 중 무엇을 쓸지 결정된다.",
      },
      confidence: {
        meaning: "현재 판단이 얼마나 강한지 나타내는 신뢰도 값이다.",
        why: "confidence가 낮으면 후속 추천은 확정이 아니라 caveat를 가져야 한다.",
      },
      data_shape_contract: {
        meaning: "format, scope, parser stats, field 구조를 묶어 데이터 모양을 설명하는 계약이다.",
        why: "profile이 어떤 원본 범위를 어떤 방식으로 본 결과인지 알아야 AI 추천과 catalog 설명이 같은 구조를 공유한다.",
      },
      schema_fingerprint: {
        meaning: "field 이름과 타입 요약을 안정적으로 hash한 구조 지문이다.",
        why: "다음 run에서 구조가 바뀌었는지 비교하려면 사람이 모든 field를 눈으로 비교하지 않아도 되는 지문이 필요하다.",
      },
      parser_stats: {
        meaning: "파서가 몇 row를 성공적으로 읽었고 몇 개가 실패했는지 같은 통계다.",
        why: "parse error가 많으면 profile과 추천의 신뢰도가 떨어진다. 품질 gate에서 이 숫자를 근거로 warn/block을 줄 수 있다.",
      },
      field_evidence: {
        meaning: "AI와 추천 로직이 볼 수 있게 축약한 field별 근거 목록이다.",
        why: "raw 전체가 아니라 field name, type, null ratio, redacted examples만 보고 추천하게 만들어 비용과 privacy 위험을 줄인다.",
      },
      redaction_map_ref: {
        meaning: "어떤 field 예시가 왜 가려졌는지 기록한 redaction map artifact를 가리키는 id다.",
        why: "값이 가려졌다는 사실과 이유가 남아야 AI 입력이 안전했는지 검증할 수 있다.",
      },
      forbidden_raw_payload: {
        meaning: "AI 입력 pack에 raw 전체 payload를 넣지 않는다는 선언이다.",
        why: "대용량 실시간 데이터에서 raw 전체를 AI에 보내는 설계를 막기 위한 핵심 안전장치다.",
      },
      row_level_ai_calls: {
        meaning: "row마다 AI 모델을 호출하는지 나타내는 숫자다. M3 core에서는 0이어야 한다.",
        why: "row-level AI는 비용과 지연이 폭발하고 개인정보 위험도 커진다. AI는 추천 control-plane에만 있어야 한다.",
      },
      blocked_ai_inputs: {
        meaning: "AI에게 넘기면 안 되는 입력 종류 목록이다.",
        why: "full raw stream, unredacted rescue lane 같은 금지 입력을 명시해야 팀원이 실수로 모델 입력에 넣지 않는다.",
      },
      gold_models: {
        meaning: "생성 가능성이 있는 Gold 모델 후보 목록이다.",
        why: "Gold는 자동 생성이 아니라 후보 제안과 사용자 승인을 거쳐야 하므로 후보 목록과 상태가 분리돼야 한다.",
      },
      metric_templates: {
        meaning: "Gold에서 만들 수 있는 metric 후보와 계산 규칙 템플릿 목록이다.",
        why: "review_count, conversion_rate, risk_score 같은 metric은 이름뿐 아니라 분자, 분모, 근거 field, caveat가 함께 있어야 한다.",
      },
      candidate_components: {
        meaning: "risk_score를 구성할 수 있는 위험 부품 후보 목록이다.",
        why: "데이터에 실제 근거가 있는 component만 조합해야 risk_score가 과장되지 않는다.",
      },
      recommended_weights: {
        meaning: "risk_score component별 추천 가중치다.",
        why: "component가 여러 개일 때 어떤 위험을 더 크게 볼지 설명해야 한다. 가중치는 고정 진리가 아니라 추천 정책이다.",
      },
      zero_denominator_policy: {
        meaning: "분모가 0일 때 rate metric을 어떻게 처리할지 정한 규칙이다.",
        why: "conversion_rate나 late_delivery_rate에서 분모가 0인 경우를 정하지 않으면 팀마다 0, null, error를 다르게 써서 Gold 의미가 깨진다.",
      },
      missing_component_handling: {
        meaning: "risk_score component 근거가 없을 때 제외할지, 보류할지, weight를 재정규화할지 정한 정책이다.",
        why: "없는 component를 0점처럼 넣으면 데이터가 없는 것과 위험이 낮은 것을 혼동한다.",
      },
      approval: {
        meaning: "이 추천이 사용자 승인 절차를 필요로 하는지 나타내는 묶음이다.",
        why: "Gold와 risk_score는 domain 의미가 강하므로 M3가 자동 확정하지 않고 owner approval을 받아야 한다.",
      },
      approval_state_ref: {
        meaning: "사용자 승인 상태를 담은 artifact를 가리키는 id다.",
        why: "compiler는 draft가 아니라 승인 상태를 확인하고 실행 가능한 spec으로 넘어가야 한다.",
      },
      silver_decision_ref: {
        meaning: "Silver 정제 추천에 대한 사용자 결정 artifact를 가리키는 id다.",
        why: "M2가 실행할 Silver spec은 사용자가 승인하거나 수정한 decision 기준으로 만들어져야 한다.",
      },
      gold_decision_ref: {
        meaning: "Gold 추천에 대한 사용자 결정 artifact를 가리키는 id다.",
        why: "Gold는 not_requested, deferred, approved, rejected를 구분해야 Silver 흐름을 불필요하게 막지 않는다.",
      },
      silver_spec_ref: {
        meaning: "승인된 Silver 정제 정책을 deterministic transform spec으로 바꾼 artifact id다.",
        why: "M2가 어떤 Silver 작업을 실행해야 하는지 찾는 핵심 참조다.",
      },
      gold_spec_ref: {
        meaning: "승인된 Gold 생성 정책을 aggregate/project/risk_score spec으로 바꾼 artifact id다.",
        why: "Gold를 누가 어떻게 만들지 떠다니지 않게 M3가 생성 방식을 계약으로 넘긴다.",
      },
      compiler_validation_ref: {
        meaning: "Silver/Gold spec이 지원 가능한 operation과 params를 쓰는지 검사한 결과 artifact id다.",
        why: "검증 결과 없이 M2에 넘기면 spec 오류와 runtime 오류를 구분하기 어렵다.",
      },
      processing_quality: {
        meaning: "Silver 처리 품질 축의 상태다. parse, schema, compiler 관점에서 Silver가 쓸 만한지 본다.",
        why: "Gold readiness와 별개로 Silver 자체가 안전하게 준비됐는지 판단해야 한다.",
      },
      catalog_safety: {
        meaning: "catalog와 query context에 노출해도 안전한지 보는 축이다.",
        why: "PII나 query forbidden field가 열려 있으면 데이터 품질이 좋아도 M6에 넘기면 안 된다.",
      },
      gold_readiness: {
        meaning: "Gold가 요청됐고, 승인됐고, metric 근거가 충분한지 나타내는 별도 축이다.",
        why: "Gold가 block이어도 Silver가 ready일 수 있으므로 Silver 상태를 오염시키지 않게 분리한다.",
      },
      allowed_tables: {
        meaning: "M6가 질의 context에서 사용할 수 있는 table 목록이다.",
        why: "모든 산출물을 자동으로 SQL에 열면 privacy와 의미 오류가 생긴다. 허용 table을 명시해야 한다.",
      },
      allowed_columns: {
        meaning: "M6가 질의해도 되는 column 목록이다.",
        why: "PII 후보나 query forbidden column을 제외해야 안전한 질의 context가 된다.",
      },
      forbidden_fields: {
        meaning: "M6 query context나 catalog 공개에서 제외해야 하는 field 목록이다.",
        why: "금지 field가 따로 있어야 allowed list와 비교해 노출 실수를 찾을 수 있다.",
      },
      catalog_exposure: {
        meaning: "catalog에 컬럼 이름이나 설명을 보여줄 수 있는지 나타낸다.",
        why: "catalog 노출과 실제 query 허용은 다르다. 이름은 보여도 값 질의는 금지할 수 있다.",
      },
      query_context_exposure: {
        meaning: "M6 질의 context에서 실제로 사용할 수 있는지 나타낸다.",
        why: "PII나 위험 field는 catalog에 숨기거나 query에서 금지해야 한다.",
      },
      semantic_catalog_vector_index_template_ref: {
        meaning: "semantic/vector 검색 extension이 참고할 template artifact id다.",
        why: "M3가 embedding을 직접 만들지 않아도 어떤 schema/profile/catalog 설명을 검색 쪽으로 넘길지 계약으로 전달할 수 있다.",
      },
      m6_context_status: {
        meaning: "M6가 Silver와 Gold context를 각각 사용할 수 있는지 요약한 최종 상태다.",
        why: "L15 gate와 L16 package가 같은 m6_context_status를 가져야 downstream이 어떤 context를 열지 안전하게 결정한다.",
      },
      version_set: {
        meaning: "artifact, schema, profile, policy, compiler, gate 같은 계약 버전 묶음이다.",
        why: "여러 파일이 같은 규칙 버전으로 만들어졌는지 확인해야 리뷰와 재실행에서 drift를 줄일 수 있다.",
      },
      refs: {
        meaning: "최종 package가 참조하는 주요 artifact id 묶음이다.",
        why: "M5/M6/M2가 필요한 파일을 흩어진 경로에서 추측하지 않고 이 ref 목록을 따라가게 만든다.",
      },
      physical_uri: {
        meaning: "artifact 파일이 실제로 저장된 위치 URI다.",
        why: "artifact_id는 논리 이름이고 physical_uri는 실제 파일 위치다. 둘이 연결돼야 ref를 resolve할 수 있다.",
      },
      logical_path: {
        meaning: "출력 폴더 기준으로 본 artifact의 상대 경로다.",
        why: "사람이 보고서에서 파일을 찾거나 package 구조를 이해할 때 절대 경로보다 읽기 쉽다.",
      },
      content_type: {
        meaning: "artifact 파일의 형식이다. JSON, JSONL, text 같은 구분이 들어간다.",
        why: "소비자가 파일을 어떻게 읽어야 하는지 결정하는 힌트다.",
      },
    };
    const direct = stories[name];
    if (direct) return direct;
    if (name.endsWith("_ref")) {
      return {
        meaning: `${name}는 다른 artifact를 직접 경로가 아니라 artifact id로 가리키는 참조값이다.`,
        why: "경로를 직접 박아 두면 폴더나 저장소가 바뀔 때 깨진다. artifact id로 참조하고 L16 artifact_reference_manifest에서 실제 위치를 resolve해야 한다.",
      };
    }
    if (name.endsWith("_id")) {
      return {
        meaning: `${name}는 특정 source, artifact, field, metric, policy, run 같은 대상을 다시 가리키기 위한 식별자다.`,
        why: "이름이 흔들리면 승인, 검증, catalog, workflow가 같은 대상을 말하지 못한다. id는 사람이 읽는 설명보다 재현성과 연결성에 더 중요하다.",
      };
    }
    if (name.endsWith("_status") || name === "status" || name === "overall_status" || name === "axis_status") {
      return {
        meaning: `${name}는 pass, warn, block, ready, deferred 같은 상태 결론을 담는 값이다.`,
        why: "상태값이 있어야 downstream이 진행해도 되는지, caveat를 붙여야 하는지, 멈춰야 하는지 자동으로 판단할 수 있다.",
      };
    }
    if (name.endsWith("_count") || name === "count" || name === "row_count" || name === "field_count") {
      return {
        meaning: `${name}는 개수 기반 통계다. row, field, object, metric 같은 항목이 몇 개인지 알려준다.`,
        why: "개수는 대용량 현실성, profile 신뢰도, Gold 집계 규모를 판단하는 기본 숫자다.",
      };
    }
    if (name.endsWith("_rate") || name.endsWith("_ratio")) {
      return {
        meaning: `${name}는 비율 값이다. 보통 분자와 분모가 필요하고, 분모가 0일 때의 규칙도 함께 정해야 한다.`,
        why: "rate/ratio는 해석이 강한 metric이다. denominator 규칙이나 missing evidence 없이 만들면 Gold 의미가 틀어진다.",
      };
    }
    if (name.includes("pii")) {
      return {
        meaning: `${name}는 개인정보 또는 민감정보 가능성과 처리 정책을 나타내는 값이다.`,
        why: "M6 query context와 catalog 노출에서 PII를 잘못 열면 안전성 문제가 생긴다. PII 관련 값은 별도 정책으로 추적해야 한다.",
      };
    }
    if (name.includes("gold")) {
      return {
        meaning: `${name}는 Gold 추천, Gold 생성 spec, Gold readiness, 또는 Gold context와 관련된 값이다.`,
        why: "Gold는 선택적이고 domain 의미가 강하다. Silver와 분리해 상태와 근거를 남겨야 과장과 오염을 막는다.",
      };
    }
    if (name.includes("silver")) {
      return {
        meaning: `${name}는 Silver 정제 추천, Silver transform spec, 또는 Silver context와 관련된 값이다.`,
        why: "Silver는 Gold와 query의 바닥이다. 이 값들이 명확해야 M2 실행과 M6 질의가 같은 정제 기준을 따른다.",
      };
    }
    if (name.includes("metric") || name.includes("measure")) {
      return {
        meaning: `${name}는 Gold나 catalog에서 계산/노출할 지표 정의와 관련된 값이다.`,
        why: "metric은 이름만 같아도 계산식이 다르면 의미가 달라진다. 근거 field, 계산식, caveat를 함께 추적해야 한다.",
      };
    }
    return null;
  }

  function fieldStoryFallback(key, ctx = {}) {
    const value = ctx.value || "";
    if (value === "[]" || value === "{}") {
      return {
        meaning: `${key}는 지금 실행에서 값이 없더라도 구조상 자리를 명시해 둔 빈 ${value === "[]" ? "목록" : "객체"}이다.`,
        why: "빈 값을 생략하면 downstream은 '지원하지 않는 필드'인지 '이번 데이터에만 값이 없는 필드'인지 구분하기 어렵다. 빈 배열/객체를 명시하면 schema 모양이 안정된다.",
      };
    }
    if (value === "None" || value === "null") {
      return {
        meaning: `${key}는 이번 record나 dataset에서는 아직 알 수 없거나 적용되지 않는 값이다.`,
        why: "값을 억지로 만들면 lineage나 metric 의미가 틀어진다. 모르는 값은 null로 남겨 다음 검증이나 owner review가 판단하게 해야 한다.",
      };
    }
    if (value === "True" || value === "False") {
      return {
        meaning: `${key}는 해당 정책이나 기능이 켜져 있는지 꺼져 있는지 나타내는 boolean 값이다. 현재 코드는 \`${value}\`로 명시한다.`,
        why: "boolean 정책은 기본값을 추측하게 두면 위험하다. 특히 raw copy, query 허용, compile 허용처럼 책임 경계와 연결된 값은 명시해야 한다.",
      };
    }
    if (key.includes("policy")) {
      return {
        meaning: `${key}는 이 단계에서 지켜야 할 처리 정책이나 추천 정책을 담는 묶음이다.`,
        why: "정책이 별도 field로 있어야 실행 로직, 사용자 승인, downstream handoff가 같은 규칙을 공유한다.",
      };
    }
    if (key.includes("scope")) {
      return {
        meaning: `${key}는 이 artifact나 operation이 적용되는 원본 범위를 설명한다.`,
        why: "scope가 없으면 작은 preview에 적용한 규칙인지 전체 source_unit에 적용할 규칙인지 알 수 없다.",
      };
    }
    if (key.includes("evidence")) {
      return {
        meaning: `${key}는 추천이나 검증 판단의 근거를 담는 값이다.`,
        why: "M3가 결론만 내면 사용자가 수정하거나 반박할 수 없다. evidence가 있어야 AI 추천과 deterministic gate를 검토할 수 있다.",
      };
    }
    if (key.includes("caveat") || key.includes("warning")) {
      return {
        meaning: `${key}는 결과를 사용할 때 조심해야 할 조건이나 한계를 적는 값이다.`,
        why: "warn 상태나 missing evidence가 있을 때 caveat를 남겨야 M1/M6가 숫자를 과신하지 않는다.",
      };
    }
    return {
      meaning: `${key}는 ${ctx.blockTitle || ctx.layerName || "이 코드 블록"} 안에서 산출물의 한 부분을 구성하는 값이다. 현재 값 후보는 \`${value || "하위 블록"}\`이다.`,
      why: "이 key는 주변 묶음 안에서 맡는 역할이 있다. 값과 인접한 key를 함께 봐야 downstream이 같은 artifact 구조를 안정적으로 읽을 수 있다.",
    };
  }

  function explainSourceLinePlainV2(currentLayerId, snippet, plain, row, index, rows) {
    const code = row.code || "";
    const trimmed = code.trim();
    const layerName = `${currentLayerId} ${plain.simpleTitle || ""}`.trim();
    const blockTitle = snippet.title || "code block";

    if (!trimmed) {
      return {
        meaning: "빈 줄이다. 실행되는 명령은 없고, 함수 입력부와 실제 처리부, 또는 큰 JSON 모양의 묶음을 눈으로 구분하기 쉽게 만든다.",
        reason: "이 문서는 코드를 읽는 문서라서 빈 줄도 의미가 있다. 사람이 빠르게 읽을 때 '여기서 준비가 끝나고 다음 묶음이 시작된다'는 경계를 보여 준다.",
      };
    }

    const parameter = explainPlainParameter(trimmed, layerName, currentLayerId, blockTitle);
    if (parameter) return parameter;

    const jsonField = explainPlainJsonField(trimmed, layerName, currentLayerId, blockTitle);
    if (jsonField) return jsonField;

    const keywordArgument = explainPlainKeywordArgument(trimmed, layerName, currentLayerId, blockTitle);
    if (keywordArgument) return keywordArgument;

    if (trimmed.startsWith("def ")) {
      const name = trimmed.match(/^def\s+([a-zA-Z0-9_]+)/)?.[1] || "function";
      return {
        meaning: `${name} 함수의 시작 줄이다. 이 함수 안의 줄들이 모여 ${layerName}에서 필요한 산출물 한 묶음을 만든다.`,
        reason: "M3 L단계는 파일 하나를 바로 고치는 코드가 아니라, 입력을 읽고 계약 산출물을 만드는 작은 함수들로 나뉜다. 함수 이름은 어떤 L단계 책임을 수행하는지 알려 주는 첫 신호다.",
      };
    }

    if (trimmed.startsWith(") ->")) {
      return {
        meaning: "함수 입력 목록이 끝났고, 결과를 Python dictionary 형태로 돌려준다는 표시다.",
        reason: "M3의 산출물은 대부분 JSON으로 저장된다. 코드 내부에서는 먼저 dictionary로 만들고, 마지막에 JSON 파일로 쓰기 때문에 반환 형태가 중요하다.",
      };
    }

    if (trimmed.startsWith('"""') || trimmed.endsWith('"""')) {
      return {
        meaning: "함수의 책임을 짧게 적은 설명문이다. 실제 데이터를 바꾸지는 않지만, 이 함수가 어디까지 맡는지 경계를 잡아 준다.",
        reason: "M3는 원본 실행 엔진이 아니라 분석과 계약 생성 역할이다. 설명문에 raw를 복사하지 않는다거나 추천 draft만 만든다는 말이 있으면, 그 줄은 팀 간 책임선을 확인하는 근거가 된다.",
      };
    }

    if (/^for\s+/.test(trimmed)) return explainPlainLoop(trimmed, layerName, currentLayerId, blockTitle);
    if (/^if\s+/.test(trimmed)) return explainPlainCondition(trimmed, layerName);

    if (/^elif\s+/.test(trimmed) || /^else:/.test(trimmed)) {
      return {
        meaning: "앞 조건이 맞지 않았을 때 다른 처리 길을 고르는 분기다. unknown CSV/JSON에서는 format, 승인 상태, metric 근거가 매번 다를 수 있어 이런 갈림길이 필요하다.",
        reason: "모든 데이터가 같은 모양이라고 가정하면 M3 계약이 쉽게 깨진다. 분기문은 pass/warn/block, approved/deferred, CSV/JSON 같은 경우를 섞지 않고 따로 처리하게 해 준다.",
      };
    }

    if (/^try:/.test(trimmed)) {
      return {
        meaning: "실패할 수 있는 읽기나 파싱을 조심스럽게 시도하는 시작점이다.",
        reason: "모르는 구조의 큰 데이터에서는 깨진 줄, 깨진 JSON, 읽기 실패가 정상적으로 생긴다. try 블록이 있어야 실패를 숨기지 않고 rescue lane이나 unsupported report로 돌릴 수 있다.",
      };
    }

    if (/^except\b/.test(trimmed)) {
      return {
        meaning: "try 안에서 문제가 생겼을 때 들어오는 처리 경로다.",
        reason: "오류를 조용히 버리면 품질 숫자가 좋아 보이지만 실제로는 데이터 손실이다. except 경로는 실패를 기록 가능한 상태로 바꿔 다음 L단계가 판단하게 만든다.",
      };
    }

    if (/^with\s+/.test(trimmed)) {
      return {
        meaning: "파일이나 외부 자원을 열고, 블록이 끝나면 자동으로 닫히게 하는 Python 문법이다.",
        reason: "대용량 파일을 다룰 때 열린 파일 handle이 쌓이면 다음 병렬 작업이나 Spark 테스트가 불안정해진다. with는 읽기 범위를 작게 묶어 안전하게 닫아 준다.",
      };
    }

    if (/^return\b/.test(trimmed)) return explainPlainReturn(trimmed, layerName);

    if (trimmed.includes("with_header(")) {
      return {
        meaning: "일반 dictionary에 M3 공통 header를 붙여 artifact 모양으로 감싸는 호출이다.",
        reason: "header에는 layer, name, source_id, run_id, schema_version, access_class 같은 공통 정보가 들어간다. 다른 M은 이 header를 먼저 보고 산출물의 정체와 접근 범위를 판단한다.",
      };
    }

    if (trimmed.includes("artifact_ref(")) {
      return {
        meaning: "다른 산출물을 실제 파일 경로가 아니라 artifact_id 문자열로 가리키는 호출이다.",
        reason: "경로를 직접 넣으면 폴더가 옮겨지거나 MinIO 위치가 바뀔 때 계약이 깨진다. M3 v2.1.1에서는 ref를 artifact_id로 통일하고, L16의 artifact_reference_manifest가 실제 위치를 풀어 준다.",
      };
    }

    if (trimmed.includes("write_json") || trimmed.includes("write_jsonl")) {
      return {
        meaning: "지금까지 만든 계약 내용을 실제 JSON 또는 JSONL artifact 파일로 쓰는 줄이다.",
        reason: "메모리 안의 값은 M2, M5, M6가 읽을 수 없다. 파일로 남겨야 재실행 비교, PR 검증, catalog handoff가 가능하다.",
      };
    }

    if (trimmed.includes("ensure_dir(")) {
      return {
        meaning: "이번 L단계 산출물을 둘 폴더가 없으면 먼저 만든다.",
        reason: "L0~L16이 같은 폴더 규칙을 쓰면 사람이 보고서를 찾기 쉽고, artifact manifest도 안정적으로 산출물 위치를 기록할 수 있다.",
      };
    }

    if (trimmed.includes("iter_source_files(")) {
      return {
        meaning: "사용자가 넘긴 source가 파일이면 그 파일 하나를, 폴더이면 그 안의 파일들을 정해진 순서로 모으는 호출이다.",
        reason: "파일 순서가 실행마다 바뀌면 object_id와 source_unit_id도 흔들린다. M3는 재현성이 중요하므로 원본 목록부터 안정적인 순서로 잡아야 한다.",
      };
    }

    if (trimmed.includes("file_fingerprint(")) {
      return {
        meaning: "현재 파일의 위치, 크기, 수정 시각, checksum 같은 원본 식별 정보를 계산하는 호출이다.",
        reason: "path만 있으면 같은 이름의 다른 파일을 구분하지 못한다. fingerprint가 있어야 같은 파일인지, 같은 이름인데 내용이 바뀐 파일인지 확인할 수 있다.",
      };
    }

    if (trimmed.includes("stable_json_hash(")) {
      return {
        meaning: "JSON 내용을 안정된 순서로 정리한 뒤 hash를 만드는 호출이다.",
        reason: "JSON key 순서가 달라졌다는 이유만으로 다른 산출물처럼 보이면 안 된다. 안정 hash는 진짜 의미 변화와 단순 순서 차이를 구분하는 근거가 된다.",
      };
    }

    if (trimmed.includes("json.loads(")) {
      return {
        meaning: "문자열로 읽은 JSON을 Python이 다룰 수 있는 object로 바꾸는 호출이다.",
        reason: "M3가 schema, profile, catalog를 만들려면 단순 텍스트가 아니라 key와 value 구조를 이해해야 한다. 이 줄이 그 구조 해석의 시작점이다.",
      };
    }

    if (trimmed.includes("csv.reader(")) {
      return {
        meaning: "CSV 한 줄을 쉼표와 따옴표 규칙에 맞춰 column 배열로 읽는 호출이다.",
        reason: "단순 split(',')는 따옴표 안의 쉼표를 잘못 나눌 수 있다. 표준 reader를 써야 profile 통계와 Silver 추천이 흔들리지 않는다.",
      };
    }

    if (trimmed.includes("hashlib.sha256(")) {
      return {
        meaning: "원본 조각이나 artifact 내용의 SHA-256 지문을 계산하는 호출이다.",
        reason: "지문이 있으면 preview가 원본의 어느 조각에서 왔는지, 산출물이 이후에 바뀌었는지 다시 확인할 수 있다.",
      };
    }

    if (trimmed.includes(".append(")) {
      return {
        meaning: "앞에서 만든 목록에 새 항목 하나를 추가하는 줄이다.",
        reason: "objects, fields, metrics, checks처럼 여러 항목이 모여 하나의 artifact body가 된다. append 줄은 반복 중 발견한 사실을 누락하지 않고 결과 목록에 쌓는 역할을 한다.",
      };
    }

    const mutation = explainPlainMutation(trimmed, layerName, currentLayerId, blockTitle);
    if (mutation) return mutation;

    const bareListItem = explainPlainBareListItem(trimmed, layerName, currentLayerId, blockTitle);
    if (bareListItem) return bareListItem;

    const inlineObject = explainPlainInlineObject(trimmed, layerName, currentLayerId, blockTitle);
    if (inlineObject) return inlineObject;

    const assignment = explainPlainAssignment(trimmed, layerName, currentLayerId, blockTitle);
    if (assignment) return assignment;

    if (/^[\}\]\)],?$/.test(trimmed)) {
      return {
        meaning: "앞에서 열어 둔 dictionary, list, 함수 호출 블록을 닫는 줄이다.",
        reason: "M3 artifact는 중첩 구조가 많다. 닫는 위치가 맞아야 body, refs, operations, metrics 같은 묶음이 서로 섞이지 않는다.",
      };
    }

    if (/^[\{\[]$/.test(trimmed) || trimmed === "{" || trimmed === "[") {
      return {
        meaning: "새 dictionary 또는 list 묶음을 시작하는 줄이다.",
        reason: "계약 파일은 단일 값보다 묶음 구조가 중요하다. 이 줄 아래의 항목들이 하나의 artifact body, operation 목록, metric 목록으로 묶인다.",
      };
    }

    return {
      meaning: `이 줄은 ${blockTitle}에서 Python 문법 흐름을 이어 주는 줄이다. 실제 줄은 \`${trimmed}\`이고, 바로 위아래 줄과 함께 읽어야 정확한 역할이 보인다.`,
      reason: `${layerName} 계약은 여러 줄이 합쳐져 artifact를 만든다. 특정 변수나 key로 바로 분류되지 않는 줄은 함수 호출, list, dictionary의 흐름을 유지하는 역할로 검토했다.`,
    };
  }

  function explainPlainParameter(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.+?)(?:,\s*)?$/);
    if (!match) return null;
    const [, name, rawTypeAndDefault] = match;
    const typeAndDefault = rawTypeAndDefault.trim().replace(/,$/, "");
    const eqIndex = typeAndDefault.indexOf("=");
    if (eqIndex >= 0 && !trimmed.endsWith(",")) return null;
    const type = eqIndex >= 0 ? typeAndDefault.slice(0, eqIndex).trim() : typeAndDefault;
    const defaultValue = eqIndex >= 0 ? typeAndDefault.slice(eqIndex + 1).trim() : "";
    const term = plainTermStoryV2(name, { layerName, currentLayerId, blockTitle, value: defaultValue || type }) || plainTermStory(name);
    const fallback = explainUnknownParameter(name, type, defaultValue, layerName, blockTitle);
    const defaultText = defaultValue
      ? ` 기본값은 \`${defaultValue}\`이다. 호출자가 값을 주지 않으면 이 기준으로 실행된다.`
      : "";
    return {
      meaning: term
        ? `${name} 파라미터는 ${term.meaning} 타입 표기는 \`${type}\`이다.${defaultText}`
        : fallback.meaning,
      reason: term ? term.why : fallback.reason,
    };
  }

  function explainPlainJsonField(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const match = trimmed.match(/^["']([^"']+)["']:\s*(.*),?$/);
    if (!match) return null;
    const [, key, valueRaw] = match;
    const value = valueRaw.replace(/,$/, "").trim();
    const term = plainTermStoryV2(key, { layerName, currentLayerId, blockTitle, value }) || plainTermStory(key);
    const fallback = fieldStoryFallback(key, { layerName, currentLayerId, blockTitle, value });
    return {
      meaning: term
        ? `\`${key}\` key는 ${term.meaning} 이 코드에서 값 후보는 \`${value || "아래 하위 묶음"}\`이다.`
        : fallback.meaning,
      reason: term ? term.why : fallback.why,
    };
  }

  function explainPlainKeywordArgument(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.+),?$/);
    if (!match) return null;
    const key = match[1];
    const value = match[2].replace(/,$/, "").trim();
    const stories = {
      layer: {
        meaning: "`with_header()`에 넘기는 `layer` 값이다. 이 artifact가 L0~L16 중 어느 단계 산출물인지 header에 박아 넣는다.",
        why: "파일 경로만 보고 단계를 추측하면 실수하기 쉽다. header 안의 layer가 있어야 M2/M5/M6가 같은 파일을 같은 단계 산출물로 읽는다.",
      },
      name: {
        meaning: "`with_header()`에 넘기는 artifact 이름이다. 같은 L단계 안에서도 source manifest, spec, gate result처럼 파일 역할을 구분한다.",
        why: "layer만 있으면 같은 단계의 여러 산출물을 구분하지 못한다. name은 사람이 읽는 이름이면서 artifact_reference_manifest의 식별 근거가 된다.",
      },
      source_id: {
        meaning: "이 artifact가 어느 데이터 source에서 나왔는지 header에 복사하는 값이다.",
        why: "여러 dataset을 같은 run에서 처리하면 source_id가 없을 때 결과가 섞인다. source_id는 lineage와 catalog 연결의 출발점이다.",
      },
      run_id: {
        meaning: "이번 분석 실행을 구분하는 run 이름을 header에 복사하는 값이다.",
        why: "같은 source도 여러 번 분석할 수 있다. run_id가 있어야 이전 실행과 현재 실행의 profile, spec, gate 결과를 비교할 수 있다.",
      },
      schema_version: {
        meaning: "이 artifact가 따르는 계약 schema 버전을 header에 넣는 값이다.",
        why: "M3 계약은 계속 개선된다. schema_version이 없으면 오래된 파일과 최신 파일을 같은 규칙으로 읽다가 잘못 해석할 수 있다.",
      },
      access_class: {
        meaning: "이 artifact를 어느 범위까지 노출해도 되는지 표시하는 접근 등급이다.",
        why: "profile이나 catalog에는 민감 정보 힌트가 섞일 수 있다. access_class가 있어야 M5/M6가 보여 줘도 되는 산출물과 내부용 산출물을 구분한다.",
      },
      body: {
        meaning: "header 아래에 붙일 실제 계약 내용이다. 공통 header가 포장지라면 body는 이 L단계가 만든 핵심 결과다.",
        why: "M3 artifact는 공통 header와 단계별 body를 분리한다. 그래야 공통 검증은 header로 하고, 실제 판단은 body를 읽어 진행할 수 있다.",
      },
      path: {
        meaning: "파일을 읽거나 쓸 실제 경로를 함수에 넘기는 값이다.",
        why: "artifact_id는 논리 이름이고 path는 현재 컴퓨터에서 접근할 수 있는 위치다. 두 개를 분리해야 저장 위치가 바뀌어도 계약 의미가 유지된다.",
      },
      records: {
        meaning: "JSONL로 쓸 record 목록을 넘기는 값이다.",
        why: "Bronze sample이나 rescue lane처럼 줄 단위로 읽어야 하는 산출물은 records 배열이 실제 파일 내용이 된다.",
      },
      indent: {
        meaning: "JSON 파일을 사람이 읽기 좋게 몇 칸 들여쓸지 정하는 값이다.",
        why: "보고서와 검토용 artifact는 사람이 직접 읽는다. indent가 있으면 diff와 코드 설명 문서에서 구조를 확인하기 쉽다.",
      },
      ensure_ascii: {
        meaning: "JSON 저장 때 한글 같은 비ASCII 문자를 그대로 둘지 escape할지 정하는 값이다.",
        why: "한국어 설명과 catalog label을 사람이 읽어야 하므로, 필요할 때 escape하지 않고 저장해야 문서 검토가 편하다.",
      },
      sort_keys: {
        meaning: "JSON key를 정렬해서 쓸지 정하는 값이다.",
        why: "key 순서가 실행마다 바뀌면 diff가 시끄러워진다. 정렬하면 의미 있는 변화만 비교하기 쉽다.",
      },
    };
    const story = stories[key];
    if (!story) return null;
    return {
      meaning: `${story.meaning} 현재 전달 값은 \`${value}\`이다.`,
      reason: story.why,
    };
  }

  function explainPlainAssignment(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_\[\]\"'.]*)\s*(?::[^=]+)?=\s*(.+)$/);
    if (!match) return null;
    const left = match[1].replace(/\[.*$/, "").replace(/\..*$/, "");
    const right = match[2].replace(/,$/, "").trim();
    const term = plainTermStoryV2(left, { layerName, currentLayerId, blockTitle, value: right }) || plainTermStory(left);
    if (term) {
      return {
        meaning: `\`${left}\` 값을 이 줄에서 만든다. ${term.meaning} 오른쪽의 \`${right}\`가 실제 계산식 또는 초기값이다.`,
        reason: term.why,
      };
    }
    const variable = plainVariableStory(left, right, { layerName, currentLayerId, blockTitle });
    if (variable) return variable;
    if (right.includes("f\"") || right.includes("f'")) {
      return {
        meaning: `\`${left}\`는 source_id, run_id, index 같은 실행 정보를 섞어 만든 이름이다.`,
        reason: "실행마다 이름 규칙이 안정적이어야 artifact, object, dataset을 다시 찾고 이전 실행과 비교할 수 있다.",
      };
    }
    if (right.includes("len(")) {
      return {
        meaning: `\`${left}\`는 목록이나 sample의 개수를 세어 만든 값이다. 계산식은 \`${right}\`이다.`,
        reason: "row 수, field 수, object 수 같은 숫자는 품질 판단과 보고서 해석의 기본 근거다.",
      };
    }
    if (right.includes("sum(")) {
      return {
        meaning: `\`${left}\`는 여러 항목의 숫자를 합쳐 만든 값이다. 계산식은 \`${right}\`이다.`,
        reason: "전체 byte size나 metric 합계처럼 규모를 보여 주는 값은 대용량 현실성 판단에 필요하다.",
      };
    }
    if (right.includes("[") && right.includes("for ")) {
      return {
        meaning: `\`${left}\`는 반복 대상에서 필요한 값만 뽑아 새 목록으로 만든다. 계산식은 \`${right}\`이다.`,
        reason: "source_unit_ids, object_ids, fields, metrics처럼 downstream이 읽을 목록은 명확한 배열로 정리해야 같은 범위를 공유할 수 있다.",
      };
    }
    return {
      meaning: `\`${left}\`는 ${blockTitle}에서 \`${right}\` 결과를 담는 이름이다. 아래쪽 코드가 이 이름을 다시 사용해 artifact body, 검증 결과, handoff package 중 하나를 만든다.`,
      reason: `${layerName} 코드는 같은 계산 결과를 여러 위치에 붙이는 경우가 많다. 이름을 붙이면 계산 기준을 한 곳에서 만들고, 이후 어느 산출물에 들어갔는지 따라가기 쉽다.`,
    };
  }

  function explainPlainLoop(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    if (trimmed.includes("enumerate(files")) {
      return {
        meaning: "원본 파일 목록을 하나씩 보면서 순번과 path를 같이 받는 반복문이다.",
        reason: "순번은 안정적인 object_id와 source_unit_id를 만드는 재료다. 파일 순서가 흔들리면 lineage도 흔들린다.",
      };
    }
    if (trimmed.includes("for line_number")) {
      return {
        meaning: "파일을 줄 단위로 읽으면서 line_number와 raw byte를 같이 받는 반복문이다.",
        reason: "line_number와 byte 범위가 있어야 Bronze sample이 원본의 어느 위치에서 왔는지 되돌아갈 수 있다.",
      };
    }
    if (trimmed.includes("stats.items")) {
      return {
        meaning: "L2 profile에서 모은 field별 통계를 하나씩 꺼내 field 설명 목록으로 바꾸는 반복문이다.",
        reason: "unknown data에서는 column마다 타입, null 비율, 예시 값이 다르다. field별로 풀어야 L3/L4 추천이 근거를 잃지 않는다.",
      };
    }
    if (trimmed.includes("fields")) {
      return {
        meaning: "profile 안의 field들을 하나씩 보며 정제 추천, PII 판단, catalog 후보를 만드는 반복문이다.",
        reason: "Silver와 Gold 추천은 dataset 전체보다 field별 의미와 품질에 더 많이 의존한다. 이 반복문이 field 단위 판단을 만든다.",
      };
    }
    if (trimmed.includes("metrics")) {
      return {
        meaning: "Gold metric 후보를 하나씩 보며 계산식, 근거 column, caveat를 정리하는 반복문이다.",
        reason: "review_count, conversion_rate, risk_score 같은 값은 이름만 같아도 계산 근거가 다를 수 있다. metric별 설명과 검증 조건이 따로 필요하다.",
      };
    }
    if (trimmed.includes("path in sorted")) {
      return {
        meaning: "산출물 폴더 아래 파일들을 정해진 순서로 읽어 artifact 목록을 만드는 반복문이다.",
        reason: "L16 artifact_reference_manifest는 모든 산출물을 빠짐없이, 흔들리지 않는 순서로 resolve해야 한다.",
      };
    }
    const parsed = trimmed.match(/^for\s+(.+?)\s+in\s+(.+?):$/);
    const target = parsed?.[1] || "현재 값";
    const source = parsed?.[2] || "앞에서 만든 데이터 묶음";
    return {
      meaning: `반복문이다. \`${source}\`에서 값을 차례로 꺼내고 이번 차례의 값을 \`${target}\`라고 부른다.`,
      reason: `${layerName}에서는 원본 object, sample row, field, metric, artifact처럼 여러 개가 반복되는 대상이 많다. 반복문을 쓰면 모든 대상에 같은 기준을 적용하고 누락을 줄일 수 있다.`,
    };
  }

  function explainPlainMutation(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const plusMatch = trimmed.match(/^(.+?)\s*\+=\s*(.+)$/);
    if (plusMatch) {
      const left = plusMatch[1].trim();
      const right = plusMatch[2].replace(/,$/, "").trim();
      if (left.includes('["types"]')) {
        return {
          meaning: "현재 field에서 관찰한 값의 타입을 하나 더 센다. `value_type(value)`로 string, number, boolean 같은 타입 이름을 구하고 그 타입 카운터를 1 올린다.",
          reason: "unknown CSV/JSON에서는 같은 column 안에 여러 타입이 섞일 수 있다. 이 카운터가 있어야 L2 profile이 dominant type과 type conflict를 판단한다.",
        };
      }
      if (left.includes('["observed"]')) {
        return {
          meaning: "현재 field에서 비어 있지 않은 값을 하나 더 봤다는 뜻으로 observed 카운터를 1 올린다.",
          reason: "observed 수와 전체 row 수를 비교해야 null 비율과 sparse field 여부를 판단할 수 있다. Silver 추천에서 drop/keep/cast 근거가 된다.",
        };
      }
      if (left.includes('["nulls"]')) {
        return {
          meaning: "현재 field에서 null 또는 비어 있는 값을 하나 더 발견했다는 뜻으로 null 카운터를 1 올린다.",
          reason: "null 비율은 품질 gate와 Silver 정제 정책의 핵심 지표다. 빈 값을 감으로 처리하지 않고 숫자로 남긴다.",
        };
      }
      return {
        meaning: `\`${left}\`에 \`${right}\`를 더해 누적값을 갱신한다.`,
        reason: "profile과 gate는 한 번의 값보다 누적 통계가 중요하다. 이 줄은 반복 중 관찰한 값을 숫자로 쌓아 나중에 비율과 상태를 계산하게 한다.",
      };
    }
    if (trimmed === "continue") {
      return {
        meaning: "이번 반복 대상은 더 처리하지 않고 다음 대상으로 넘어간다.",
        reason: "빈 row, 해석할 수 없는 값, 이미 rescue lane으로 돌린 값은 같은 로직을 계속 태우면 잘못된 통계가 생길 수 있다. continue는 그런 경우를 명확히 건너뛴다.",
      };
    }
    return null;
  }

  function explainPlainBareListItem(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    const match = trimmed.match(/^["']([^"']+)["'],?$/);
    if (!match) return null;
    const item = match[1];
    const term = plainTermStoryV2(item, { layerName, currentLayerId, blockTitle, value: item }) || plainTermStory(item);
    if (term) {
      return {
        meaning: `\`${item}\`라는 목록 항목이다. ${term.meaning}`,
        reason: term.why,
      };
    }
    if (item.endsWith("_ref")) {
      return {
        meaning: `\`${item}\`는 이 목록에서 반드시 갖춰야 하는 artifact 참조 column 이름이다.`,
        reason: "참조 column이 빠지면 다음 단계가 어떤 artifact를 따라가야 하는지 알 수 없다. `_ref`는 파일 경로가 아니라 artifact_id를 가리키는 계약 이름이다.",
      };
    }
    if (item.endsWith("_id")) {
      return {
        meaning: `\`${item}\`는 이 목록에서 반드시 갖춰야 하는 식별자 column 이름이다.`,
        reason: "식별자가 있어야 source, record, field, metric, artifact가 서로 섞이지 않는다. 특히 replay와 catalog lineage에서 기준점이 된다.",
      };
    }
    return {
      meaning: `\`${item}\`는 ${blockTitle}의 목록에 들어가는 column 또는 check 이름이다.`,
      reason: "이름을 목록으로 고정해 두면 downstream이 문자열을 추측하지 않고 같은 이름으로 record 구조를 검증할 수 있다.",
    };
  }

  function explainPlainInlineObject(trimmed, layerName, currentLayerId = "", blockTitle = "") {
    if (!/^\{.*\},?$/.test(trimmed)) return null;
    const nameMatch = trimmed.match(/["']name["']:\s*["']([^"']+)["']/);
    const statusMatch = trimmed.match(/["']status["']:\s*["']([^"']+)["']/);
    if (nameMatch || statusMatch) {
      const checkName = nameMatch?.[1] || "unnamed_check";
      const status = statusMatch?.[1] || "status";
      return {
        meaning: `\`${checkName}\` 검증 항목을 한 줄짜리 object로 넣는다. 현재 status 값은 \`${status}\`이다.`,
        reason: "gate와 validation report는 여러 check를 같은 모양의 object 목록으로 모은다. check 이름과 status가 같이 있어야 어떤 조건이 통과했는지 바로 볼 수 있다.",
      };
    }
    return {
      meaning: "한 줄짜리 dictionary 항목이다. 보통 checks, metrics, refs 같은 목록 안에서 작은 record 하나를 표현한다.",
      reason: "여러 줄로 풀지 않아도 되는 짧은 항목은 inline object로 두면 목록의 반복 구조가 잘 보인다.",
    };
  }

  function explainUnknownParameter(name, type, defaultValue, layerName, blockTitle) {
    const lower = name.toLowerCase();
    if (/^l\d+$/.test(lower)) {
      return {
        meaning: `\`${name}\`는 앞 L단계가 만든 산출물 묶음을 받는 입력이다. 타입 표기는 \`${type}\`이고, 이 함수는 그 안에서 필요한 artifact를 꺼내 다음 판단을 만든다.`,
        reason: "L단계는 독립 파일처럼 보이지만 실제로는 앞 단계 산출물을 이어 받아 만든다. 이전 L결과를 명시적으로 받으면 데이터 흐름이 숨지 않는다.",
      };
    }
    const stories = {
      profile: "L2에서 만든 schema/profile 요약을 받는 입력이다. field별 타입, null 비율, 예시, parser 통계가 들어 있어 L3 이후 추천의 근거가 된다.",
      samples: "L1 Bronze envelope에서 뽑은 sample record 목록이다. 전체 데이터를 AI로 보지 않고 작은 근거 묶음만 보는 control-plane 입력이다.",
      rows: "현재 단계에서 처리할 record 목록이다. row 자체를 모두 materialize한다는 뜻이 아니라, 이 함수가 이미 받은 범위 안에서 반복할 값을 뜻한다.",
      fields: "profile에서 추출한 field 목록이다. 각 field의 타입과 예시를 기준으로 정제, PII, catalog, Gold metric 후보를 판단한다.",
      metrics: "Gold 또는 catalog에 올릴 metric 후보 목록이다. 이름, 계산식, 근거 column, caveat를 따로 점검해야 한다.",
      catalog: "L16에서 만들 catalog metadata 초안이다. M6가 질의 context로 쓸 수 있는 이름, 설명, 노출 정책이 들어간다.",
      sql_context: "M6가 SQL 질의 후보를 만들 때 참고할 안전한 table/column context다. forbidden field는 이 context에 들어가면 안 된다.",
      has_gold: "이번 source에서 Gold까지 요청했거나 승인됐는지 알려 주는 flag다. Silver ready 상태와 Gold readiness를 섞지 않기 위해 필요하다.",
      format_hint: "사용자나 앞 단계가 알고 있는 입력 format 힌트다. 확정값이 아니라 L2 format detection이 참고하는 시작점이다.",
      max_rows: "sample로 읽을 최대 row 수다. unknown 대용량 데이터에서 M3가 전체 row를 직접 보지 않게 막는 안전장치다.",
      max_bytes: "sample로 읽을 최대 byte 수다. 한 row가 너무 큰 JSON/CSV에서도 M3 control-plane이 과도하게 커지지 않게 제한한다.",
      files: "L0/L1/L2가 실제로 읽을 원본 file path 목록이다. source가 폴더일 때 어떤 파일들을 같은 run에 포함할지 이미 확정된 상태로 들어온다.",
      object_by_path: "file path 문자열을 L0 object metadata로 되찾기 위한 lookup table이다. sample row를 읽은 뒤 그 row가 어느 object_id/source_unit_id에서 왔는지 붙일 때 쓴다.",
      fmt: "L2가 판단한 입력 format 이름이다. csv, json, jsonl 같은 값이 들어오며 data shape contract가 어떤 parser 결과를 기준으로 만들어졌는지 보여 준다.",
      detection: "format detection 결과 묶음이다. detected_format, confidence, evidence가 들어가서 L2가 왜 그 format으로 봤는지 설명한다.",
      template_retrieval: "L5에서 AI 추천 후보를 만들 때 참고한 template 검색 결과 묶음이다. schema/profile/catalog 후보를 vector나 rule 기반으로 찾은 근거를 담는다.",
      product_fields: "product_id, product_name, category처럼 상품 축으로 볼 수 있는 field 후보 목록이다. product-health Gold template의 group key를 고를 때 쓴다.",
      rating_fields: "rating, score, stars처럼 평점 의미를 가질 수 있는 field 후보 목록이다. average_rating과 낮은 평점 risk component 근거가 된다.",
      review_text_fields: "review_body, comment, text처럼 리뷰 문장 의미를 가질 수 있는 field 후보 목록이다. negative_review_rate 후보를 만들 때 쓰는 텍스트 근거다.",
      conversion_fields: "view_count, purchase_count, order_count처럼 전환율 계산에 필요한 field 후보 목록이다. conversion_rate를 만들 수 있는지 판단한다.",
      delivery_fields: "delivery_count, late_delivery_count, delivery_date처럼 배송 지연율 계산에 필요한 field 후보 목록이다. late_delivery_rate component가 가능한지 본다.",
      ai_model_slot: "L3/L4/L7 추천을 만들 때 호출하거나 기록할 AI 모델 슬롯 이름이다. 현재 구현에서는 테스트용 Codex CLI/모델 호출 위치를 나타내는 계약 값이다.",
      product_key: "Gold를 product 단위로 묶을 수 있게 해 주는 대표 상품 key 후보이다. 없으면 product_health Gold를 확정하지 않고 missing evidence로 남겨야 한다.",
      rating_field: "평점 계산에 쓸 단일 field 후보이다. average_rating이나 low_rating risk component를 만들 수 있는지 판단하는 핵심 근거다.",
      review_text_field: "부정 리뷰율을 추정하거나 리뷰 텍스트 근거를 만들 때 쓸 단일 field 후보이다. 텍스트가 없으면 negative_review_rate는 defer하거나 대체 근거가 필요하다.",
      hints: "field matching에 추가로 넣는 semantic hint 집합이다. 이름만으로 부족할 때 product, rating, delivery 같은 의미 후보를 보강한다.",
      tokens: "field 이름이나 설명을 쪼개 얻은 검색 token 집합이다. vector/template 후보와 실제 field를 맞출 때 사용한다.",
      semantic_type: "찾으려는 의미 유형 이름이다. product_key, rating, conversion, delivery처럼 Gold template이 요구하는 의미 축을 나타낸다.",
      formula_template: "Gold metric을 계산할 때 사용할 공식 template 문자열이다. 실제 field가 매칭되면 이 template에 들어가 계산식 후보가 된다.",
      required_source_evidence: "metric이나 template이 요구하는 원천 evidence 이름 목록이다. 어떤 근거가 있어야 해당 Gold 후보를 승인할 수 있는지 나타낸다.",
      available_fields: "현재 데이터에서 사용할 수 있다고 판단한 field 후보 목록이다. required evidence와 비교해 missing evidence를 계산한다.",
      missing_evidence: "Gold metric이나 semantic handoff를 만들기 위해 필요하지만 현재 source에서 찾지 못한 근거 목록이다.",
      owner_review_required: "사용자 확인이 필요한지 알려 주는 flag다. risk_score처럼 도메인 판단이 강한 값은 자동 확정하지 않고 review 요구를 남긴다.",
      caveat: "결과를 사용할 때 붙여야 하는 한계 설명이다. missing evidence, 낮은 confidence, 대체 계산식 같은 조건을 사람이 볼 수 있게 한다.",
      unsupported: "compiler나 validator가 지원하지 않는 operation/params 목록이다. M2로 넘기기 전에 block하거나 수정해야 하는 항목이다.",
      processing: "processing_quality axis에 들어갈 현재 처리 품질 상태 값이다. pass/warn/block 중 어느 상태인지 M6 context 계산에 사용한다.",
    };
    const parameterReasons = {
      files: "원본 파일 목록이 여기서 고정되어야 sample, profile, manifest가 같은 입력 범위를 공유한다. 파일 목록을 함수 안에서 다시 찾으면 L단계마다 범위가 달라질 수 있다.",
      object_by_path: "Bronze sample은 line만 읽으면 원본 object identity를 잃는다. path로 L0 metadata를 되찾아 object_id/source_unit_id를 붙여야 replay가 가능하다.",
      fmt: "format 이름이 있어야 CSV/JSON/JSONL별 parser 결과를 같은 data_shape_contract 안에서 다르게 해석할 수 있다.",
      detection: "format 판단 근거가 함께 넘어와야 confidence가 낮을 때 warn을 걸거나 사용자에게 format 수정을 요구할 수 있다.",
      template_retrieval: "AI 추천이 즉흥 문장이 아니라 기존 template과 profile 근거에 닿아 있는지 확인하기 위한 입력이다.",
      product_fields: "Gold product_health는 product 단위 집계가 핵심이다. 상품 key 후보가 약하면 review_count나 risk_score가 엉뚱한 단위로 묶인다.",
      rating_fields: "평점 field가 있어야 average_rating과 낮은 평점 risk component를 계산할 수 있다. 없으면 해당 component를 missing evidence로 처리해야 한다.",
      review_text_fields: "부정 리뷰율은 텍스트나 감성 근거 없이는 과장될 수 있다. 텍스트 후보를 분리해야 negative_review_rate를 만들지 보류할지 판단한다.",
      conversion_fields: "전환율은 view와 purchase 계열 근거가 모두 있어야 한다. 후보 목록이 있어야 zero denominator 정책까지 함께 만들 수 있다.",
      delivery_fields: "배송 지연율은 배송 관련 분모와 지연 분자 근거가 있어야 한다. 후보가 없으면 late_delivery_rate component를 자동 생성하면 안 된다.",
      ai_model_slot: "AI는 data-plane이 아니라 추천 control-plane에만 들어가야 한다. 모델 슬롯을 기록하면 어떤 단계에서 어떤 AI 판단을 썼는지 추적된다.",
      product_key: "product_key가 없으면 product_health Gold의 grain이 사라진다. 이 입력이 None이면 Gold를 확정하지 않고 사용자 선택 상태로 남기는 게 맞다.",
      rating_field: "rating field 하나를 명확히 골라야 average_rating 계산식과 risk_score component가 흔들리지 않는다.",
      review_text_field: "리뷰 텍스트 후보가 있어야 negative signal을 계산하거나, 텍스트 근거가 없다는 caveat를 남길 수 있다.",
      hints: "hint는 field 이름이 애매할 때 의미 매칭을 보정한다. 예를 들어 `asin` 같은 이름은 hint 없이는 product_id로 보기 어렵다.",
      tokens: "token은 field matching을 기계적으로 비교하기 위한 재료다. 사람이 붙인 hint와 원본 이름 token을 같이 봐야 오탐을 줄인다.",
      semantic_type: "semantic_type은 지금 찾는 목표가 상품 key인지 평점인지 배송인지 알려 준다. 목표가 달라지면 같은 field라도 선택 기준이 달라진다.",
      formula_template: "공식 template이 있어야 AI가 추천한 metric을 M2가 실행 가능한 계산식 후보로 바꿀 수 있다.",
      required_source_evidence: "필수 근거 목록을 알아야 Gold 후보가 충분한지, 아니면 missing evidence 때문에 deferred되어야 하는지 판단할 수 있다.",
      available_fields: "실제 데이터에서 찾은 field 후보와 필요한 근거를 비교해야 과장된 Gold 추천을 막을 수 있다.",
      missing_evidence: "없는 근거를 명시해야 risk_score나 conversion_rate를 억지로 만들지 않고 사용자에게 부족한 부분을 보여 줄 수 있다.",
      owner_review_required: "사용자 승인이 필요한 추천을 자동 실행으로 오해하지 않게 막는다. 특히 risk_score weight와 Gold grain은 사람이 확인해야 한다.",
      caveat: "caveat는 숫자나 추천을 사용할 때의 조건이다. 이 설명이 없으면 M1/M6가 불완전한 Gold를 완성된 지표처럼 말할 수 있다.",
      unsupported: "지원하지 않는 operation이 여기 모여야 M2로 넘기기 전에 막을 수 있다. runtime 실패를 계약 검증 단계에서 줄인다.",
      processing: "processing 상태는 catalog와 gold 상태와 분리되어야 한다. 그래야 Gold가 block이어도 Silver ready 판단을 오염시키지 않는다.",
    };
    if (stories[lower]) {
      return {
        meaning: `\`${name}\` 파라미터는 ${stories[lower]} 타입 표기는 \`${type}\`이다.${defaultValue ? ` 기본값은 \`${defaultValue}\`이다.` : ""}`,
        reason: parameterReasons[lower] || "이 입력이 분리되어 있어야 작은 샘플 검증, 5GB run, 100GB run에서도 같은 함수가 같은 기준으로 산출물을 만들 수 있다.",
      };
    }
    return {
      meaning: `\`${name}\` 파라미터는 ${blockTitle}가 호출될 때 전달되는 실행 재료다. 타입 표기는 \`${type}\`${defaultValue ? `이고 기본값은 \`${defaultValue}\`` : ""}이다.`,
      reason: `${layerName} 함수가 자기 안에서 모든 것을 추측하지 않고 입력으로 받으면, 테스트 데이터와 실제 데이터에서 같은 기준을 재사용할 수 있다.`,
    };
  }

  function plainVariableStory(left, right, ctx = {}) {
    const { layerName = "", blockTitle = "" } = ctx;
    const exact = {
      layer_dir: {
        meaning: "`layer_dir`는 이번 L단계 산출물을 모아 둘 폴더 경로다. 보통 `out_dir / \"lN\"` 형태라서 L번호별 결과가 섞이지 않는다.",
        reason: "폴더가 단계별로 나뉘어야 L0 원본 manifest, L4 spec, L16 catalog package를 사람이 빠르게 찾고 artifact manifest도 안정적으로 만들 수 있다.",
      },
      files: {
        meaning: "`files`는 source 아래에서 실제로 발견한 원본 파일 path 목록이다.",
        reason: "M3는 source 문자열만 믿지 않고 실제 파일 목록을 먼저 확정한다. 그래야 이후 object_id와 source_unit_id를 같은 순서로 만들 수 있다.",
      },
      fingerprint: {
        meaning: "`fingerprint`는 현재 파일의 크기, 수정 시각, checksum, URI 같은 식별 정보를 담은 묶음이다.",
        reason: "path만으로는 같은 이름의 다른 파일을 구분할 수 없다. fingerprint가 있어야 replay와 drift 검증에서 같은 원본인지 확인할 수 있다.",
      },
      body: {
        meaning: "`body`는 artifact header 아래에 들어갈 실제 내용 묶음이다.",
        reason: "M3 artifact는 공통 header와 단계별 body를 분리한다. body에 무엇이 들어가는지가 그 L단계의 실질적인 계약이다.",
      },
      manifest: {
        meaning: "`manifest`는 이번 단계가 만든 산출물의 목록, 범위, 식별 정보를 담는 대표 계약 파일이다.",
        reason: "manifest가 있어야 downstream이 파일 이름을 추측하지 않고 어떤 artifact가 어디에 있는지 확인할 수 있다.",
      },
      source_manifest: {
        meaning: "`source_manifest`는 L0가 원본 source를 어떻게 발견했고 어떤 object/source_unit으로 나눴는지 기록한 결과다.",
        reason: "L1 이후 모든 replay와 lineage는 source_manifest를 출발점으로 삼는다.",
      },
      replay: {
        meaning: "`replay`는 sample이나 변환 결과가 원본의 어느 object, line, byte 범위에서 왔는지 되돌아가기 위한 위치 정보다.",
        reason: "raw를 복사하지 않는 구조에서는 replay 정보가 원본 확인의 유일한 길이다. 이 값이 빠지면 검증과 감사가 약해진다.",
      },
      samples: {
        meaning: "`samples`는 전체 데이터가 아니라 L1에서 제한적으로 읽은 preview record 목록이다.",
        reason: "M3는 대용량 data-plane을 직접 처리하지 않는다. sample은 AI 추천과 profile 판단에 필요한 작은 근거 묶음이다.",
      },
      envelope_manifest: {
        meaning: "`envelope_manifest`는 L1 Bronze envelope가 어떤 sample, rescue lane, replay pointer를 만들었는지 정리한 manifest다.",
        reason: "Bronze는 raw를 Silver로 바로 바꾸기 전의 안전 포장 단계다. 이 manifest가 있어야 실패 row와 정상 sample을 따로 추적한다.",
      },
      rescue_manifest: {
        meaning: "`rescue_manifest`는 읽기 실패나 parse 실패를 버리지 않고 따로 남기는 rescue lane의 manifest다.",
        reason: "실패 데이터를 숨기면 품질이 좋아 보일 뿐 실제 손실이 생긴다. rescue manifest는 손실 방지 증거다.",
      },
      spec: {
        meaning: "`spec`는 추천이나 승인을 실행 가능한 deterministic transform 규칙으로 바꾼 결과다.",
        reason: "AI 문장만으로는 M2가 Spark job을 만들 수 없다. spec은 operation과 params로 쪼개진 실행 계약이다.",
      },
      operations: {
        meaning: "`operations`는 Silver 또는 Gold를 만들 때 적용할 변환 단계 목록이다.",
        reason: "filter, cast, normalize, aggregate 같은 작업이 순서대로 있어야 같은 입력에서 같은 결과를 만들 수 있다.",
      },
      validation: {
        meaning: "`validation`은 spec이나 catalog package가 계약 규칙을 지키는지 검사한 결과다.",
        reason: "검증 없이 M2/M6로 넘기면 잘못된 params나 금지 field가 뒤에서 터진다. L단계 안에서 먼저 잡아야 한다.",
      },
      catalog: {
        meaning: "`catalog`는 M6와 사용자가 이해할 수 있는 dataset/table/column 설명 초안이다.",
        reason: "Silver/Gold 파일만 있어서는 질의 AI가 의미를 모른다. catalog가 있어야 어떤 column을 어떻게 질문에 써도 되는지 알 수 있다.",
      },
      sql_context: {
        meaning: "`sql_context`는 M6가 질의 생성에 사용할 수 있는 table과 column만 모은 안전한 문맥이다.",
        reason: "catalog에 보이는 정보와 실제 질의에 허용되는 정보는 다를 수 있다. query context를 따로 둬야 PII나 금지 column을 막을 수 있다.",
      },
      lineage: {
        meaning: "`lineage`는 최종 column이나 metric이 어떤 source field와 어떤 L단계를 거쳐 만들어졌는지 보여 주는 연결표다.",
        reason: "Gold metric이 맞는지 따지려면 계산 결과뿐 아니라 어디서 온 값인지 보여 줘야 한다.",
      },
      contract_package: {
        meaning: "`contract_package`는 L0~L16에서 만든 핵심 artifact 참조와 M6 handoff 상태를 하나로 묶은 최종 전달물이다.",
        reason: "다른 M이 여러 파일을 흩어져서 찾지 않도록 마지막에 package로 묶어 주는 것이 L16의 역할이다.",
      },
    };
    if (exact[left]) return exact[left];
    if (left.endsWith("_manifest")) {
      return {
        meaning: `\`${left}\`는 ${blockTitle}에서 만든 manifest 변수다. 어떤 artifact가 만들어졌고 어떤 입력 범위와 연결되는지 정리한다.`,
        reason: "manifest는 downstream이 파일을 추측하지 않게 하는 안내판이다. L단계 사이에서 산출물 위치와 범위를 이어 준다.",
      };
    }
    if (left.endsWith("_spec")) {
      return {
        meaning: `\`${left}\`는 실행 가능한 spec 변수다. 추천 문장을 operation과 params로 바꿔 M2가 해석할 수 있게 만든다.`,
        reason: "spec은 사람 설명이 아니라 실행 계약이다. 같은 입력에서 같은 Silver/Gold를 만들려면 이 구조가 필요하다.",
      };
    }
    if (left.endsWith("_draft")) {
      return {
        meaning: `\`${left}\`는 아직 확정되지 않은 추천 draft다. 사용자가 보고 고치거나 승인할 수 있는 후보 상태다.`,
        reason: "M3는 AI 추천을 바로 실행으로 확정하지 않는다. draft와 승인된 spec을 나눠야 사용자가 수정할 수 있다.",
      };
    }
    if (left.endsWith("_profile")) {
      return {
        meaning: `\`${left}\`는 데이터 구조와 값 분포를 요약한 profile 변수다.`,
        reason: "unknown data에서는 profile이 Silver/Gold 추천의 근거가 된다. 타입, null, 예시, parse 결과가 없으면 추천이 감으로 흐른다.",
      };
    }
    if (left.endsWith("_axis")) {
      return {
        meaning: `\`${left}\`는 L9 gate에서 한 축의 pass/warn/block 상태를 담는 변수다.`,
        reason: "processing quality, catalog safety, gold readiness를 분리해야 Gold 문제가 Silver ready 상태를 오염시키지 않는다.",
      };
    }
    if (left.endsWith("_report")) {
      return {
        meaning: `\`${left}\`는 검증이나 실패 내용을 사람이 읽을 수 있게 정리한 report 변수다.`,
        reason: "block이나 warn이 났을 때 이유를 남겨야 사용자가 정책을 수정할 수 있다.",
      };
    }
    if (left.endsWith("_path") || left === "path") {
      return {
        meaning: `\`${left}\`는 현재 컴퓨터에서 접근할 수 있는 파일 경로 값이다. 계산식은 \`${right}\`이다.`,
        reason: "URI나 artifact_id와 달리 path는 로컬 실행에서 파일을 실제로 열 때 필요하다. 둘을 섞지 않아야 저장 위치 변경에 강해진다.",
      };
    }
    if (left.endsWith("_dir") || left === "out_dir") {
      return {
        meaning: `\`${left}\`는 파일을 모아 둘 폴더 경로다. 계산식은 \`${right}\`이다.`,
        reason: "산출물 폴더가 명확해야 L단계별 결과를 지우거나 재실행하거나 보고서에 연결하기 쉽다.",
      };
    }
    return null;
  }

  function fieldStoryFallback(key, ctx = {}) {
    const value = ctx.value || "";
    const contextName = ctx.blockTitle || ctx.layerName || "이 코드 블록";
    const lower = key.toLowerCase();
    const common = {
      layer: ["이 artifact가 속한 L단계 이름이다.", "폴더 위치와 별개로 header/body 안에서도 단계가 보여야 다른 M이 산출물을 안전하게 분류한다."],
      artifact_type: ["이 JSON 묶음이 manifest인지, spec인지, profile인지 같은 산출물 역할을 알려 주는 값이다.", "파일명만으로 역할을 추측하지 않고 artifact_type을 읽으면 자동 검증과 catalog 연결이 안정적이다."],
      name: ["사람과 코드가 함께 읽는 산출물 또는 항목 이름이다.", "같은 L단계 안에도 여러 결과가 있으므로 name이 있어야 어떤 파일이 어떤 책임인지 구분된다."],
      schema_version: ["이 산출물이 따르는 schema 계약 버전이다.", "계약이 바뀌었을 때 오래된 artifact를 최신 규칙으로 잘못 읽지 않게 막는다."],
      access_class: ["이 산출물을 어디까지 보여 줘도 되는지 나타내는 접근 등급이다.", "profile, catalog, AI input pack에는 민감 정보 힌트가 있을 수 있어 노출 범위를 명시해야 한다."],
      byte_size: ["원본 object나 artifact의 크기를 byte 단위로 기록한 값이다.", "대용량 현실성, replay 검증, 저장 비용 판단은 byte 크기에서 시작한다."],
      size_bytes: ["원본 object나 artifact의 크기를 byte 단위로 기록한 값이다.", "row 수만 보면 큰 JSON 한 줄 같은 데이터를 과소평가할 수 있어 byte 기준도 필요하다."],
      compression: ["파일이 gzip 같은 압축 상태인지, 압축이 없는지 나타내는 값이다.", "압축 여부에 따라 읽기 방식과 byte locator 해석이 달라진다."],
      modified_at: ["원본 파일의 마지막 수정 시각이다.", "같은 path라도 수정 시각이 바뀌면 다른 내용일 수 있으므로 replay와 drift 판단에 필요하다."],
      source_unit_type: ["이 source_unit이 object 묶음인지 stream window인지 hybrid인지 나타내는 값이다.", "object와 stream은 replay locator가 다르므로 처리 단위를 명확히 나눠야 한다."],
      ingest_time_range: ["이 source_unit이 포함한다고 보는 수집 시간 범위다.", "시간 기준 window나 drift 검증을 할 때 어떤 기간의 데이터인지 확인하는 단서다."],
      jsonl_artifact: ["줄 단위 record가 저장된 JSONL artifact를 가리키는 값이다.", "Bronze sample이나 rescue lane은 한 줄씩 읽어야 하므로 JSON 배열보다 JSONL 위치가 더 실용적이다."],
      types: ["해당 field에서 실제로 관찰된 값 타입들의 목록이다.", "CSV/JSON unknown data에서는 같은 column 안에 string과 number가 섞일 수 있어 타입 후보를 모두 봐야 한다."],
      example_values: ["해당 field에서 관찰한 예시 값 목록이다. 민감한 값은 redaction을 거친 상태여야 한다.", "AI와 사용자가 column 의미를 판단하려면 이름만으로 부족하다. 예시는 의미 추론의 핵심 근거다."],
      note: ["사람이 읽는 짧은 설명 문장이다. artifact가 왜 이런 정책이나 범위를 갖는지 한 줄로 남긴다.", "숫자와 id만 있으면 설계 의도를 놓치기 쉽다. note는 M3가 raw를 소유하지 않는다거나 preview만 한다는 경계를 빠르게 확인하게 해 준다."],
      rules: ["조건과 조치가 들어가는 규칙 목록이다.", "rescue lane, validation, gate는 여러 상황을 나눠 처리한다. rules가 있어야 어떤 경우에 어떤 조치를 취하는지 문서와 코드가 같은 구조로 공유한다."],
      when: ["규칙이 적용되는 상황을 적는 조건 설명이다.", "조건을 적어 두면 parse 실패, type conflict, PII 노출처럼 서로 다른 문제를 같은 방식으로 뭉개지 않는다."],
      action: ["해당 조건이 발생했을 때 취해야 하는 처리 방식이다.", "조건만 있고 action이 없으면 downstream이 멈춰야 하는지, 보존해야 하는지, query context에서 숨겨야 하는지 판단할 수 없다."],
      required_columns: ["이 artifact나 lane이 반드시 가져야 하는 column 이름 목록이다.", "필수 column을 목록으로 고정해야 M2/M5/M6가 record 구조를 검증하고 빠진 항목을 block할 수 있다."],
      target_name_candidate: ["원본 field 이름을 Silver에서 쓸 후보 이름으로 바꾼 값이다.", "원본 이름이 중첩 path이거나 특수문자를 포함하면 그대로 query/catalog에 쓰기 어렵다. 후보 이름을 따로 만들어 사용자가 승인하거나 수정하게 한다."],
      inferred_type: ["profile 근거로 추정한 프로젝트 표준 타입이다.", "raw type을 그대로 쓰면 CSV string 숫자나 JSON 혼합 타입을 안정적으로 처리하기 어렵다. Silver cast 후보를 만들려면 표준 타입 후보가 필요하다."],
      dominant_raw_type: ["sample에서 가장 많이 관찰된 원본 타입이다.", "여러 타입이 섞인 column에서 무엇을 기준 타입으로 볼지 판단하는 근거다. type conflict를 숨기지 않고 dominant와 나머지를 비교하게 한다."],
      example_values_redacted: ["AI와 사용자가 볼 수 있도록 민감 값을 가린 예시 목록이다.", "예시는 의미 추론에 필요하지만 raw PII를 그대로 넘기면 안 된다. redacted 예시가 control-plane AI 입력의 안전한 근거가 된다."],
      semantic_hints: ["field 이름과 예시에서 추정한 의미 힌트 목록이다.", "product_id, rating, delivery_date 같은 의미를 알면 Silver 정제와 Gold metric 후보를 더 잘 추천할 수 있다."],
      profile_confidence: ["현재 profile 근거를 얼마나 믿을 수 있는지 나타내는 신뢰도 값이다.", "sample이 작거나 format confidence가 낮으면 추천을 강하게 확정하면 안 된다. confidence가 낮으면 owner review나 warn 근거가 된다."],
      redaction_applied: ["이 항목의 예시나 입력에 redaction이 적용됐는지 나타내는 값이다.", "민감 정보가 가려졌는지 기록해야 AI input pack과 catalog exposure가 안전한지 검증할 수 있다."],
      reason: ["상태나 정책이 그렇게 정해진 이유를 적는 값이다.", "pass/warn/block이나 redaction 여부는 결론만 있으면 납득하기 어렵다. reason이 있어야 사용자가 수정할 위치를 찾는다."],
      source_processing_contract: ["source를 sample/profile/spec로 넘길 때 지켜야 하는 처리 계약 묶음이다.", "M3가 raw 전체를 직접 처리하지 않고 bounded sample과 replay pointer를 만든다는 범위를 downstream에 전달한다."],
      max_fields: ["AI input pack이나 profile 요약에 넣을 field 수 상한이다.", "field가 수천 개면 prompt와 화면이 무너진다. 상한을 두고 근거 요약을 제한해야 대용량에서도 control-plane이 유지된다."],
      execution_owner: ["실제 실행 책임을 맡는 M 번호나 시스템을 나타낸다.", "M3는 spec을 만들고 M2가 Spark 실행을 맡는 구조이므로, owner를 명시해야 책임 경계가 흐려지지 않는다."],
      preview_write_mode: ["preview 단계에서 허용되는 write mode를 나타낸다.", "M3 preview는 실제 production write가 아니어야 한다. `preview_only`를 명시해야 테스트 실행과 운영 실행을 섞지 않는다."],
      owner_review_required: ["사용자 또는 담당자 승인이 필요한지 나타내는 값이다.", "Gold metric과 risk_score는 도메인 의미가 강하므로 AI 추천만으로 확정하면 안 된다. review 필요 여부를 따로 남긴다."],
      semantic_status_candidate: ["Gold나 catalog가 M6 의미 질의에 충분한지 후보 상태를 계산한 값이다.", "Gold가 없거나 metric 근거가 약하면 M6가 의미 기반 답변을 과신하면 안 된다. semantic status가 그 경계다."],
      checks: ["검증 항목 object들이 들어가는 목록이다.", "각 check를 name/status로 나눠 담아야 어떤 조건이 통과했고 어떤 조건이 막혔는지 한눈에 볼 수 있다."],
      axis_name: ["L9 gate에서 어느 판단 축인지 나타내는 이름이다.", "processing_quality, catalog_safety, gold_readiness를 분리해야 Silver와 Gold 상태가 서로 오염되지 않는다."],
      blocking_reasons: ["block 상태가 나온 이유 목록이다.", "block은 그냥 실패가 아니라 다음 단계로 넘기면 안 되는 이유다. 이유가 있어야 정책 수정이나 데이터 수정이 가능하다."],
      gate_version: ["gate 판단 규칙의 버전 이름이다.", "precedence rule이 바뀌면 같은 데이터도 다른 결과가 날 수 있다. version을 남겨야 재검증과 비교가 가능하다."],
      catalog_sync_package: ["M6/M5가 catalog와 query context를 동기화할 때 참고할 최종 package다.", "여러 artifact를 각각 찾게 하면 누락이 생긴다. sync package가 최종 handoff의 기준 묶음이 된다."],
      semantic_vector_template: ["schema/profile/catalog 설명을 vector index로 넘길 때 사용할 template 참조다.", "M3 core가 embedding을 직접 만들지는 않지만, 검색 기반 추천을 붙일 수 있도록 어떤 문서를 index할지 계약으로 남긴다."],
      artifact_manifest: ["이번 run에서 만들어진 artifact 목록과 위치를 모은 manifest다.", "artifact_id를 실제 physical_uri로 풀려면 전체 목록이 필요하다. 다른 M은 이 manifest를 통해 참조를 해결한다."],
      handoff: ["다른 M으로 넘길 때 필요한 요약 상태와 참조 묶음이다.", "M3 결과를 사람이 읽는 보고서로만 끝내지 않고 M2/M5/M6가 바로 이어 받을 수 있게 한다."],
      exports: ["외부에서 바로 찾아야 하는 대표 산출물 참조 묶음이다.", "모든 파일을 뒤지지 않고 transform spec, schema definition, catalog package 같은 핵심 출구를 빠르게 찾게 한다."],
      transform_spec: ["Silver 또는 Gold를 실제로 만드는 변환 spec 참조다.", "M2가 Spark job으로 옮길 때 가장 먼저 필요한 실행 계약이다."],
      schema_definition: ["출력 dataset의 column 이름과 타입 정의 참조다.", "M6/M1이 column 이름을 해석하고 M2가 write schema를 맞추려면 schema definition이 필요하다."],
    };
    if (common[lower]) {
      return {
        meaning: `\`${key}\` key는 ${common[lower][0]} 현재 값 후보는 \`${value || "아래 하위 묶음"}\`이다.`,
        why: common[lower][1],
      };
    }
    if (value === "[]" || value === "{}") {
      return {
        meaning: `\`${key}\` key는 이번 실행에서 값이 없더라도 구조 자리를 남기는 ${value === "[]" ? "빈 목록" : "빈 객체"}이다.`,
        why: "자리를 생략하면 downstream은 '지원하지 않는 항목'인지 '이번 데이터에만 없는 항목'인지 구분하기 어렵다. 빈 값으로 남기면 schema 모양이 안정된다.",
      };
    }
    if (value === "None" || value === "null") {
      return {
        meaning: `\`${key}\` key는 이번 record나 dataset에서는 아직 알 수 없거나 적용되지 않는 값을 null로 남긴다.`,
        why: "모르는 값을 빈 문자열이나 0으로 바꾸면 실제 의미가 왜곡된다. null은 이후 gate나 owner review가 판단할 수 있는 정직한 상태다.",
      };
    }
    if (value === "True" || value === "False") {
      return {
        meaning: `\`${key}\` key는 정책이나 기능이 켜져 있는지 꺼져 있는지를 나타내는 boolean 값이다. 현재 값은 \`${value}\`이다.`,
        why: "boolean 정책은 기본값을 추측하게 두면 위험하다. raw copy, query 허용, compile 허용 같은 경계는 True/False를 명시해야 한다.",
      };
    }
    if (lower.includes("policy")) {
      return {
        meaning: `\`${key}\` key는 이 단계에서 지킬 처리 정책 또는 추천 정책을 담는 묶음이다.`,
        why: "정책이 별도 key로 있어야 실행 로직, 사용자 승인, downstream handoff가 같은 규칙을 공유한다.",
      };
    }
    if (lower.includes("scope")) {
      return {
        meaning: `\`${key}\` key는 이 artifact나 operation이 적용되는 source 범위를 설명한다.`,
        why: "scope가 없으면 작은 preview 규칙인지 전체 source_unit 규칙인지 알 수 없다.",
      };
    }
    if (lower.includes("evidence")) {
      return {
        meaning: `\`${key}\` key는 추천이나 검증 판단에 사용한 근거를 담는다.`,
        why: "M3가 결론만 내면 사용자가 수정하거나 반박할 수 없다. evidence가 있어야 AI 추천과 deterministic gate를 검토할 수 있다.",
      };
    }
    if (lower.includes("caveat") || lower.includes("warning")) {
      return {
        meaning: `\`${key}\` key는 결과를 사용할 때 조심해야 할 조건이나 한계를 적는다.`,
        why: "warn 상태나 missing evidence가 있을 때 caveat를 남겨야 M1/M6가 숫자를 과신하지 않는다.",
      };
    }
    if (lower.endsWith("_bytes")) {
      return {
        meaning: `\`${key}\` key는 byte 단위 크기나 위치를 나타낸다. 현재 값 후보는 \`${value || "아래 하위 묶음"}\`이다.`,
        why: "대용량 파일에서는 row 번호만으로 부족하다. byte 기준이 있어야 replay, 비용 추정, window 분할을 정확하게 할 수 있다.",
      };
    }
    return {
      meaning: `\`${key}\` key는 ${contextName} 안에서 \`${value || "아래 하위 묶음"}\` 값을 맡는 계약 항목이다. 같은 묶음의 다른 key와 함께 읽으면 이 값이 어느 출력이나 검증 조건에 붙는지 확인할 수 있다.`,
      why: "M3 계약은 key 이름과 값 의미가 같이 맞아야 한다. 이 항목이 빠지거나 다른 이름으로 흔들리면 downstream은 같은 artifact를 같은 구조로 읽기 어렵다.",
    };
  }

  function plainTermStory(name) {
    const stories = {
      source: {
        meaning: "사용자가 등록한 원본 파일이나 폴더 경로다.",
        why: "M3는 이 값을 기준으로 어떤 raw 범위를 관찰할지 시작한다. 단, source 자체를 변형하거나 복제하지 않는다는 경계가 중요하다.",
      },
      out_dir: {
        meaning: "L0~L16 artifact 파일을 기록할 출력 폴더다.",
        why: "산출물이 한 위치 규칙 아래 모여야 HTML 보고서, artifact manifest, handoff package가 같은 파일을 가리킬 수 있다.",
      },
      source_id: {
        meaning: "데이터 소스를 부르는 논리 이름이다.",
        why: "여러 dataset이 섞여도 어떤 source에서 나온 manifest/spec인지 구분한다. dataset 이름, artifact id, pipeline id의 기본 재료가 된다.",
      },
      run_id: {
        meaning: "이번 분석 실행을 구분하는 이름이다.",
        why: "같은 source라도 여러 번 실행할 수 있다. run_id가 있어야 이전 run과 현재 run의 profile, spec, gate 결과를 비교할 수 있다.",
      },
      checksum_mode: {
        meaning: "원본 지문을 전체 파일로 계산할지, 앞부분 prefix로 계산할지 정하는 정책이다.",
        why: "전체 checksum은 강하지만 느리고, prefix checksum은 빠르지만 약하다. 대용량 검증에서는 이 절충을 명시해야 한다.",
      },
      checksum_bytes: {
        meaning: "prefix checksum을 계산할 때 앞에서 몇 byte를 볼지 정하는 숫자다.",
        why: "`8 * 1024 * 1024`는 8MiB를 뜻한다. 1024 byte가 1KiB, 1024KiB가 1MiB라서 대용량 파일을 전부 읽지 않고도 원본 변경을 어느 정도 감지한다.",
      },
      object_id: {
        meaning: "원본 저장소의 물리 파일 또는 object 하나를 부르는 id다.",
        why: "path가 바뀌거나 다른 실행 환경에서 읽어도 같은 원본 덩어리를 가리키려면 path와 별도의 id가 필요하다.",
      },
      source_unit_id: {
        meaning: "M3가 처리한다고 말하는 논리 범위 id다.",
        why: "지금은 파일 하나와 거의 같아 보여도 stream window나 여러 object 묶음에서는 물리 object와 처리 단위가 달라진다.",
      },
      source_unit_ids: {
        meaning: "현재 artifact가 어느 처리 범위들에서 파생됐는지 나타내는 목록이다.",
        why: "이 목록이 있어야 preview, transform spec, catalog metadata가 같은 원본 범위를 말한다.",
      },
      object_ids: {
        meaning: "참조하는 물리 원본 object id 목록이다.",
        why: "source_unit이 실제 어떤 object와 연결되는지 확인해 orphan lineage를 막는다.",
      },
      path: {
        meaning: "현재 컴퓨터에서 파일을 열 때 쓰는 로컬 경로다.",
        why: "코드가 파일을 읽을 때는 path가 편하지만, Docker/노트북/MinIO 환경까지 설명하기에는 부족하다. 그래서 uri가 함께 필요하다.",
      },
      uri: {
        meaning: "저장소 종류까지 포함한 원본 주소다. file://, s3://, minio:// 같은 형태가 될 수 있다.",
        why: "path만 있으면 로컬 전용 문자열인지 object store 주소인지 알 수 없다. M2/M5가 다른 실행 환경에서 원본을 찾으려면 uri가 필요하다.",
      },
      etag: {
        meaning: "MinIO/S3 같은 object store가 주는 객체 버전 또는 내용 식별자다.",
        why: "같은 uri라도 내용이 바뀔 수 있다. etag나 checksum이 있어야 같은 이름의 다른 내용을 구분한다.",
      },
      checksum: {
        meaning: "원본이나 artifact 내용의 hash 지문이다.",
        why: "경로와 이름만으로는 내용 동일성을 보장하지 못한다. checksum은 재현성과 변경 감지의 마지막 근거다.",
      },
      record_locator: {
        meaning: "sample record가 원본 어디에서 왔는지 나타내는 좌표 묶음이다.",
        why: "object_id, line_number, byte range가 없으면 Silver 오류가 났을 때 원본으로 돌아갈 수 없다.",
      },
      profile: {
        meaning: "L2가 만든 형식/필드/타입/null 통계 묶음이다.",
        why: "AI 추천과 Silver/Gold draft는 profile 수치를 근거로 해야 한다. raw 전체를 대신 보는 요약판이다.",
      },
      fields: {
        meaning: "profile에서 관찰된 field 목록이다.",
        why: "field별 타입, null, semantic hint가 Silver 컬럼 추천과 Gold metric 가능성을 결정한다.",
      },
      artifact_id: {
        meaning: "M3 산출물을 부르는 논리 id다.",
        why: "실제 파일 경로 대신 artifact_id로 참조해야 폴더 이동이나 저장소 변경에도 계약이 버틴다.",
      },
      artifact_reference_manifest: {
        meaning: "artifact_id를 실제 physical_uri, checksum, byte_size와 연결하는 최종 위치표다.",
        why: "`*_ref`가 경로가 아니라 id여도 이 manifest가 있으면 실제 파일을 찾을 수 있다.",
      },
      approval_state: {
        meaning: "Silver/Gold 추천이 승인, 수정, 보류, 거절 중 어디에 있는지 나타내는 상태 계약이다.",
        why: "draft와 실행 가능한 spec을 구분하고, 사용자가 고른 내용만 M2/M5 흐름으로 넘어가게 한다.",
      },
      risk_score_policy: {
        meaning: "risk_score를 어떤 component와 weight로 계산할지 설명하는 정책이다.",
        why: "데이터마다 가능한 위험 근거가 다르다. 고정식보다 component 근거와 weight 추천을 남겨야 과장을 줄인다.",
      },
      component_id: {
        meaning: "risk_score를 이루는 개별 위험 부품 이름이다.",
        why: "component가 있어야 risk_score가 왜 높아졌는지 negative review, 낮은 평점, 낮은 전환율, 배송 지연 같은 원인으로 설명된다.",
      },
      group_by: {
        meaning: "Gold를 어떤 단위로 묶을지 정하는 key 목록이다.",
        why: "product health라면 product_id가 대표적인 grain이다. grain이 과하면 Gold가 raw처럼 커지고, 부족하면 의미가 뭉개진다.",
      },
      measures: {
        meaning: "Gold에서 계산할 metric 목록이다.",
        why: "review_count, average_rating, conversion_rate, risk_score처럼 M1/M6가 해석할 숫자는 여기서 정의돼야 한다.",
      },
      m6_context_status: {
        meaning: "M6가 Silver/Gold context를 질의에 사용할 수 있는지 요약한 상태다.",
        why: "L15 gate와 L16 package가 같은 상태를 말해야 downstream이 안전하게 질의 context를 열 수 있다.",
      },
    };
    return stories[name] || null;
  }

  function explainSourceLineDirect(currentLayerId, snippet, plain, row, index, rows) {
    const clearer = explainSourceLinePlainV2(currentLayerId, snippet, plain, row, index, rows);
    if (clearer) return clearer;
    const code = row.code || "";
    const trimmed = code.trim();
    const context = directLineContext(currentLayerId, snippet, plain);
    if (!trimmed) {
      return {
        meaning: "빈 줄이다. 실행되는 코드는 아니고, 함수 입력부와 실제 처리부, 또는 JSON 블럭 사이를 눈으로 구분하기 위해 둔 줄이다.",
        reason: "코드가 길어질수록 어디서 입력이 끝나고 어디서 artifact 본문이 시작되는지 보여주는 구분선 역할을 한다.",
      };
    }

    const parameter = explainParameterDirect(trimmed, context);
    if (parameter) return parameter;

    const dictionaryField = explainDictionaryFieldDirect(trimmed, context);
    if (dictionaryField) return dictionaryField;

    if (trimmed.startsWith("def ")) {
      const name = trimmed.match(/^def\s+([a-zA-Z0-9_]+)/)?.[1] || "함수";
      return {
        meaning: `${name} 함수를 새로 정의하는 줄이다. 이 함수 하나가 ${context.layerName}에서 필요한 산출물을 만드는 입구다.`,
        reason: "다른 코드나 CLI는 이 함수 이름을 기준으로 해당 L단계를 실행한다. 그래서 함수 이름과 입력값이 곧 이 단계의 계약 시작점이다.",
      };
    }

    if (trimmed.startsWith(") ->")) {
      return {
        meaning: "함수 입력 목록이 끝났고, 결과를 dictionary 형태로 돌려준다는 뜻이다.",
        reason: "M3의 각 L단계는 다음 단계가 읽을 JSON 산출물을 만든다. dictionary로 반환해야 artifact writer가 같은 구조로 저장할 수 있다.",
      };
    }

    if (trimmed.startsWith('"""') || trimmed.endsWith('"""')) {
      return {
        meaning: "함수 설명문이다. 실제 실행 로직은 아니지만, 이 함수가 무엇을 하고 무엇을 하지 않는지 코드 옆에 적어 둔 문장이다.",
        reason: "특히 M3는 실행 엔진이 아니라 계약 생성기이므로, raw를 복사하지 않는다거나 preview만 만든다는 책임 경계를 코드 안에 남겨야 한다.",
      };
    }

    if (/^for\s+/.test(trimmed)) {
      return {
        meaning: directLoopMeaning(trimmed),
        reason: "파일, field, metric, artifact처럼 여러 개가 생기는 대상을 같은 규칙으로 처리하기 위해 반복문을 쓴다. 반복 기준이 곧 이 단계의 처리 단위다.",
      };
    }

    if (/^if\s+/.test(trimmed)) {
      return {
        meaning: directConditionMeaning(trimmed),
        reason: "unknown data에서는 항상 같은 입력이 오지 않는다. 조건문은 가능한 경우, 부족한 경우, 막아야 하는 경우를 나눠 downstream이 잘못 실행되지 않게 한다.",
      };
    }

    if (/^elif\s+/.test(trimmed) || /^else:/.test(trimmed)) {
      return {
        meaning: "앞 조건이 맞지 않을 때 다른 길로 보내는 분기다.",
        reason: "승인/보류/거절, CSV/JSON, pass/warn/block처럼 상태가 갈리는 경우를 빠짐없이 처리해야 계약이 모호해지지 않는다.",
      };
    }

    if (/^try:/.test(trimmed)) {
      return {
        meaning: "실패할 수 있는 작업을 안전하게 시도하는 시작점이다.",
        reason: "unknown 파일, 깨진 JSON, 읽을 수 없는 artifact가 있어도 전체 보고서가 바로 죽지 않고 실패 증거를 남기게 한다.",
      };
    }

    if (/^except\b/.test(trimmed)) {
      return {
        meaning: "try 안에서 오류가 났을 때 들어오는 처리 구간이다.",
        reason: "오류를 조용히 숨기지 않고, rescue lane이나 unsupported report처럼 다음 단계가 볼 수 있는 증거로 남기기 위해 필요하다.",
      };
    }

    if (/^with\s+/.test(trimmed)) {
      return {
        meaning: "파일이나 리소스를 열고, 블럭이 끝나면 자동으로 닫게 하는 Python 문법이다.",
        reason: "큰 파일을 다루다 보면 파일 handle을 열어 둔 채로 방치하면 문제가 생긴다. 안전하게 열고 닫기 위해 쓴다.",
      };
    }

    if (/^return\b/.test(trimmed)) {
      return {
        meaning: directReturnMeaning(trimmed, context),
        reason: "이 반환값이 다음 L단계의 입력 또는 검증 증거가 된다. 반환 구조가 빠지면 downstream이 artifact를 찾거나 해석할 수 없다.",
      };
    }

    if (trimmed.includes("with_header(")) {
      return {
        meaning: "일반 dictionary를 M3 artifact 형식으로 감싸기 시작하는 줄이다.",
        reason: "header 안에는 artifact_id, schema_version, access_class 같은 공통 정보가 붙는다. 다른 M은 이 header를 보고 산출물을 안전하게 해석한다.",
      };
    }

    if (trimmed.includes("artifact_ref(")) {
      return {
        meaning: "다른 artifact를 실제 파일 경로가 아니라 artifact_id 문자열로 참조하는 줄이다.",
        reason: "v2.1.1 규칙에서 *_ref는 artifact_id로 통일한다. 실제 위치는 L16 artifact_reference_manifest에서 resolve해야 경로 변경에 강하다.",
      };
    }

    if (trimmed.includes("write_json") || trimmed.includes("write_jsonl")) {
      return {
        meaning: "지금까지 만든 계약 산출물을 실제 파일로 저장하는 줄이다.",
        reason: "M2, M5, M6는 메모리 안의 값을 읽을 수 없다. 파일 artifact로 남겨야 검증, handoff, catalog sync가 가능하다.",
      };
    }

    if (trimmed.includes("ensure_dir(")) {
      return {
        meaning: "산출물을 저장할 폴더가 없으면 만드는 줄이다.",
        reason: "각 L단계 산출물이 정해진 위치에 있어야 artifact manifest와 HTML 보고서가 같은 파일을 가리킬 수 있다.",
      };
    }

    if (trimmed.includes("iter_source_files(")) {
      return {
        meaning: "사용자가 준 source가 파일이면 그 파일을, 폴더면 폴더 아래 파일들을 안정적인 순서로 모으는 줄이다.",
        reason: "L0에서 파일 순서가 흔들리면 object_id와 source_unit_id가 바뀐다. 그러면 replay와 이전 실행 비교가 어려워진다.",
      };
    }

    if (trimmed.includes("file_fingerprint(")) {
      return {
        meaning: "파일의 uri, path, 크기, 수정 시각, checksum 같은 식별 정보를 계산하는 줄이다.",
        reason: "M3가 raw를 복사하지 않기 때문에 같은 원본인지 확인할 지문이 필요하다. path만으로는 내용 변경을 잡을 수 없다.",
      };
    }

    if (trimmed.includes("stable_json_hash(")) {
      return {
        meaning: "JSON 내용을 안정적인 순서로 정리한 뒤 hash를 계산하는 줄이다.",
        reason: "같은 구조라면 같은 hash가 나와야 schema drift나 profile 변경을 비교할 수 있다.",
      };
    }

    if (trimmed.includes("json.loads(")) {
      return {
        meaning: "문자열로 들어온 JSON을 Python dictionary나 list로 바꾸는 줄이다.",
        reason: "field, artifact_header, schema 같은 구조를 읽으려면 단순 문자열이 아니라 구조화된 값으로 바꿔야 한다.",
      };
    }

    if (trimmed.includes("csv.reader(")) {
      return {
        meaning: "CSV 줄을 쉼표와 따옴표 규칙에 맞춰 컬럼 배열로 읽는 줄이다.",
        reason: "문자열 split만 쓰면 따옴표 안의 쉼표 같은 CSV 규칙이 깨진다. 표준 reader를 써야 profile이 덜 틀린다.",
      };
    }

    if (trimmed.includes("Counter(")) {
      return {
        meaning: "값이나 타입이 몇 번 나왔는지 세기 위한 Counter를 만드는 줄이다.",
        reason: "타입 분포, null 비율, parser 통계처럼 추천 근거가 되는 숫자를 만들기 위해 필요하다.",
      };
    }

    if (trimmed.includes("hashlib.sha256(")) {
      return {
        meaning: "원본 조각이나 artifact 내용의 sha256 지문을 계산하는 줄이다.",
        reason: "preview 내용은 제한될 수 있지만 hash가 있으면 같은 원본 조각인지 다시 확인할 수 있다.",
      };
    }

    if (trimmed.includes(".append(")) {
      return {
        meaning: "앞에서 만든 목록에 새 항목을 하나 추가하는 줄이다.",
        reason: "objects, fields, metrics, checks처럼 여러 항목을 모아 하나의 artifact body로 저장해야 다음 단계가 한 번에 읽을 수 있다.",
      };
    }

    if (trimmed.includes(" = ")) {
      return explainAssignmentDirect(trimmed, context);
    }

    if (/^[\}\]\)],?$/.test(trimmed)) {
      return {
        meaning: "앞에서 시작한 dictionary, list, 함수 호출, 괄호 블럭을 닫는 줄이다.",
        reason: "JSON 형태의 artifact는 괄호 구조가 정확해야 한다. 이 닫힘 줄이 있어야 body나 operations 배열이 완성된다.",
      };
    }

    if (/^[\{\[]$/.test(trimmed) || trimmed === "{" || trimmed === "[") {
      return {
        meaning: "새 dictionary나 list 블럭을 여는 줄이다.",
        reason: "M3 artifact는 대부분 JSON 구조이므로 관련 값을 묶어 저장할 그릇을 여는 역할을 한다.",
      };
    }

    return {
      meaning: `이 줄은 ${context.layerName} 산출물을 만들기 위한 작은 처리 조각이다. 코드가 하는 직접 동작은 '${trimmed}'이다.`,
      reason: `${context.next} 단계가 이 결과를 추측하지 않고 읽을 수 있게 이름, 상태, 참조, 제한값 중 하나를 고정하는 역할을 한다.`,
    };
  }

  function directLineContext(currentLayerId, snippet, plain) {
    return {
      layerId: currentLayerId,
      blockTitle: snippet.title,
      layerName: plain.simpleTitle || currentLayerId,
      next: plain.next || "다음 L단계",
      outputs: Array.isArray(plain.outputs) ? plain.outputs.join(", ") : plain.outputs || "이 단계 산출물",
    };
  }

  function explainParameterDirect(trimmed, context) {
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*([^=,]+)(?:=\s*([^,]+))?,?$/);
    if (!match) return null;
    const [, name, type, defaultValue] = match;
    const base = contractTermDictionary()[name];
    const typeText = type.trim();
    const defaultText = defaultValue ? ` 기본값은 ${defaultValue.trim()}이다.` : "";
    return {
      meaning: base?.meaning || `${name}이라는 입력값을 받는 줄이다. 타입 표시는 ${typeText}이다.`,
      reason: `${base?.why || `${context.layerName} 함수가 무엇을 기준으로 산출물을 만들지 정하는 입력이다.`}${defaultText}`,
    };
  }

  function explainDictionaryFieldDirect(trimmed, context) {
    const match = trimmed.match(/^["']([^"']+)["']:\s*(.*),?$/);
    if (!match) return null;
    const [, key, value] = match;
    const base = contractTermDictionary()[key];
    const valueText = value.replace(/,$/, "").trim();
    return {
      meaning: base?.meaning || `${key}라는 JSON 필드를 넣는 줄이다. 값은 ${valueText || "아래 블럭"}에서 채워진다.`,
      reason: base?.why || `${key}라는 이름이 고정되어야 ${context.next}가 같은 의미로 읽을 수 있다. 필드명이 흔들리면 lineage, validation, catalog handoff 중 하나가 깨진다.`,
    };
  }

  function explainAssignmentDirect(trimmed, context) {
    const [leftRaw, rightRaw] = trimmed.split(/\s=\s(.+)/);
    const left = (leftRaw || "").replace(/:.*$/, "").trim();
    const right = (rightRaw || "").replace(/,$/, "").trim();
    const base = contractTermDictionary()[left];
    if (base) {
      return {
        meaning: `${left} 값을 만드는 줄이다. ${base.meaning}`,
        reason: base.why,
      };
    }
    if (right.includes("f\"")) {
      return {
        meaning: `${left} 값을 f-string으로 만드는 줄이다. source_id, run_id, index 같은 값을 끼워 넣어 안정적인 이름을 만든다.`,
        reason: "이름이 안정적이어야 artifact, object, dataset을 실행마다 비교하고 downstream에서 다시 찾을 수 있다.",
      };
    }
    if (right.includes("len(")) {
      return {
        meaning: `${left}에 개수를 계산한 값을 담는 줄이다.`,
        reason: "row 수, field 수, object 수 같은 숫자는 품질 판단과 보고서 요약의 기본 근거가 된다.",
      };
    }
    if (right.includes("sum(")) {
      return {
        meaning: `${left}에 여러 값을 합산한 결과를 담는 줄이다.`,
        reason: "전체 byte size, 총 row 수처럼 여러 조각을 합친 수치가 있어야 대용량 규모를 판단할 수 있다.",
      };
    }
    if (right.includes("[") && right.includes("for ")) {
      return {
        meaning: `${left}에 list comprehension 결과를 담는 줄이다. 여러 항목에서 필요한 값만 뽑아 새 목록을 만든다.`,
        reason: "필드, metric, artifact 목록을 정리된 배열로 만들어야 spec과 catalog가 반복해서 읽을 수 있다.",
      };
    }
    return {
      meaning: `${left}라는 이름에 오른쪽 계산 결과를 저장하는 줄이다.`,
      reason: `중간값에 이름을 붙여 두면 이후 줄에서 같은 기준으로 다시 사용할 수 있고, ${context.outputs}를 만들 때 의미가 분명해진다.`,
    };
  }

  function directLoopMeaning(trimmed) {
    if (trimmed.includes("enumerate(files")) return "source 파일 목록을 하나씩 꺼내면서 순번과 path를 함께 받는 반복문이다.";
    if (trimmed.includes("fields")) return "field 목록을 하나씩 보면서 타입, PII, 추천 action, metric 후보를 판단하는 반복문이다.";
    if (trimmed.includes("models")) return "선택되거나 추천된 Gold model 목록을 하나씩 실행 가능한 operation이나 metric 정의로 바꾸는 반복문이다.";
    if (trimmed.includes("path in sorted")) return "산출물 폴더 아래 파일을 정해진 순서로 읽어 artifact 목록을 만드는 반복문이다.";
    if (trimmed.includes("metrics")) return "Gold metric 후보를 하나씩 보면서 계산식과 근거를 정리하는 반복문이다.";
    return "반복 대상에서 값을 차례로 꺼내 같은 판단 기준을 적용하는 반복문이다.";
  }

  function directConditionMeaning(trimmed) {
    if (trimmed.includes("max_rows") || trimmed.includes("max_bytes")) return "샘플 row 수나 byte 수가 제한을 넘었는지 확인하는 조건이다.";
    if (trimmed.includes("approved")) return "사용자가 승인한 상태인지 확인하는 조건이다. 승인되지 않은 추천은 실행 spec으로 내려가면 안 된다.";
    if (trimmed.includes("pii")) return "PII 의심 field인지 확인하는 조건이다. 민감정보 노출을 막기 위해 필요하다.";
    if (trimmed.includes("not_requested") || trimmed.includes("deferred")) return "Gold가 요청되지 않았거나 보류된 상태인지 확인하는 조건이다.";
    if (trimmed.includes("block")) return "검증 결과가 block인지 확인하는 조건이다. block이면 downstream 실행을 멈춰야 한다.";
    if (trimmed.includes("path.is_file")) return "폴더 안 항목 중 실제 파일만 artifact 후보로 쓰기 위한 조건이다.";
    if (trimmed.includes("gold_context_status")) return "Gold context가 M6에 노출 가능한 상태인지 확인하는 조건이다.";
    return `조건 '${trimmed.replace(/^if\s+/, "").replace(/:$/, "")}'이 맞는지 확인하는 줄이다.`;
  }

  function directReturnMeaning(trimmed, context) {
    if (trimmed === "return rows") return "지금까지 모은 sample row 목록을 돌려주는 줄이다.";
    if (trimmed === "return fields") return "field profile 목록을 돌려주는 줄이다.";
    if (trimmed.includes("{")) return `${context.layerName} 함수가 만든 여러 산출물 묶음을 dictionary로 돌려주기 시작하는 줄이다.`;
    return "함수의 최종 결과를 호출한 쪽으로 돌려주는 줄이다.";
  }

  function explainSourceLine(currentLayerId, snippet, plain, row, index, rows) {
    const code = row.code || "";
    const trimmed = code.trim();
    const context = layerContext(currentLayerId, plain);
    const previousMeaning = index > 0 ? rows[index - 1].code.trim() : "";
    const directExplanation = explainSourceLineDirect(currentLayerId, snippet, plain, row, index, rows);
    if (directExplanation) return directExplanation;

    if (!trimmed) {
      return {
        meaning: "빈 줄이다. Python 실행에는 영향이 없고, 함수의 입력부와 실제 처리부, 또는 큰 JSON 블록 사이를 눈으로 구분하기 위해 둔다.",
        reason: "코드가 길어질수록 빈 줄은 읽는 사람이 경계를 찾게 해 준다. 이 문서에서는 논리 단위가 바뀌는 지점으로 보면 된다.",
      };
    }

    const parameter = explainParameterLine(trimmed, context);
    if (parameter) return parameter;

    const dictField = explainDictionaryFieldLine(trimmed, context);
    if (dictField) return dictField;

    if (trimmed.startsWith("def ")) {
      const name = trimmed.match(/^def\s+([a-zA-Z0-9_]+)/)?.[1] || "함수";
      return {
        meaning: `${name} 함수를 새로 정의하는 줄이다. 이 함수가 ${context.role}에 필요한 산출물을 만드는 진입점이 된다.`,
        reason: "다른 코드나 CLI는 이 함수 하나를 호출해서 해당 L 단계 산출물을 만든다. 그래서 함수 이름과 입력값이 계약의 시작점이다.",
      };
    }

    if (trimmed.startsWith(") ->")) {
      return {
        meaning: "함수 입력 목록이 끝났고, 이 함수가 dictionary 형태의 결과를 돌려준다는 뜻이다.",
        reason: "M3 단계들은 JSON 산출물과 다음 단계 입력을 dictionary로 주고받는다. 반환 모양이 일정해야 뒤 단계가 같은 키를 읽을 수 있다.",
      };
    }

    if (trimmed.startsWith('"""') || trimmed.endsWith('"""')) {
      return {
        meaning: "함수 설명문이다. 실행 로직은 아니지만, 이 함수가 무엇을 만들고 무엇을 하지 않는지 짧게 적어 둔다.",
        reason: "L 단계의 책임 경계를 코드 바로 옆에 남긴다. 특히 M3가 실행 엔진이 아니라 계약 산출물을 만든다는 점을 확인하는 단서다.",
      };
    }

    if (/^for\s+/.test(trimmed)) {
      return {
        meaning: explainLoop(trimmed, context),
        reason: "여러 파일, field, metric, artifact를 같은 규칙으로 처리하려면 반복문이 필요하다. 반복 기준이 곧 이 단계가 다루는 단위다.",
      };
    }

    if (/^if\s+/.test(trimmed)) {
      return {
        meaning: explainIf(trimmed),
        reason: "unknown data에서는 모든 입력이 같은 모양이 아니다. 조건문은 가능한 경우, 보류할 경우, 막아야 할 경우를 나누는 안전장치다.",
      };
    }

    if (/^elif\s+/.test(trimmed) || /^else:/.test(trimmed)) {
      return {
        meaning: "앞의 조건이 맞지 않을 때 다른 분기나 기본 분기로 넘어가는 줄이다.",
        reason: "CSV, JSON, 승인/보류, pass/block처럼 상태가 갈라질 때 누락되는 경우를 줄인다.",
      };
    }

    if (/^try:/.test(trimmed)) {
      return {
        meaning: "실패할 수 있는 작업을 안전하게 시도하겠다는 시작 줄이다.",
        reason: "unknown file, JSON parse, artifact 읽기처럼 실패 가능성이 있는 작업을 전체 pipeline 실패로 바로 터뜨리지 않고 기록 가능한 형태로 다룬다.",
      };
    }

    if (/^except\b/.test(trimmed)) {
      return {
        meaning: "위 try 블록에서 오류가 났을 때 들어오는 처리 줄이다.",
        reason: "깨진 파일이나 읽을 수 없는 artifact가 나와도 원인을 기록하거나 건너뛰어 다음 검증 단계가 판단할 수 있게 한다.",
      };
    }

    if (/^with\s+/.test(trimmed)) {
      return {
        meaning: "파일이나 자원을 열고, 블록이 끝나면 자동으로 닫히게 하는 Python 문법이다.",
        reason: "대용량 파일을 다룰 때 handle을 열어 둔 채 방치하면 자원 누수가 난다. 안전한 파일 읽기 경계를 만든다.",
      };
    }

    if (/^return\b/.test(trimmed)) {
      return {
        meaning: explainReturn(trimmed, context),
        reason: "이 반환값이 다음 L 단계의 입력이 된다. 반환 키가 빠지면 뒤 단계는 artifact나 decision을 찾지 못한다.",
      };
    }

    if (trimmed.includes("with_header(")) {
      return {
        meaning: "일반 dictionary를 M3 artifact 형식으로 감싸기 시작한다. header에는 artifact_id, schema_version, access_class 같은 공통 정보가 붙는다.",
        reason: "다른 M은 파일 이름을 추측하지 않고 artifact_id와 header를 기준으로 산출물을 찾는다. 모든 계약 산출물의 공통 포장지다.",
      };
    }

    if (trimmed.includes("artifact_ref(")) {
      return {
        meaning: "다른 artifact를 직접 파일 경로가 아니라 artifact id 문자열로 참조한다.",
        reason: "v2.1.1 규칙에서 *_ref는 artifact_id로 통일했다. 실제 경로는 L16 artifact_reference_manifest가 resolve한다.",
      };
    }

    if (trimmed.includes("write_json") || trimmed.includes("write_jsonl")) {
      return {
        meaning: "지금까지 만든 산출물을 실제 파일로 저장하는 줄이다.",
        reason: "M5/M6/M2가 이 파일을 읽어 다음 작업을 한다. 메모리 안에만 있으면 검증과 handoff 증거가 남지 않는다.",
      };
    }

    if (trimmed.includes("ensure_dir(")) {
      return {
        meaning: "산출물을 저장할 폴더가 없으면 만든다.",
        reason: "각 L 단계 산출물은 정해진 폴더에 있어야 artifact reference와 보고서 링크가 안정적으로 이어진다.",
      };
    }

    if (trimmed.includes("iter_source_files(")) {
      return {
        meaning: "사용자가 넘긴 source가 파일이면 그 파일을, 폴더면 그 아래 파일들을 안정적인 순서로 모은다.",
        reason: "L0에서 파일 목록 순서가 흔들리면 object_id/source_unit_id가 바뀌고, 이후 replay와 비교가 어려워진다.",
      };
    }

    if (trimmed.includes("file_fingerprint(")) {
      return {
        meaning: "파일 위치, 크기, 수정 시간, checksum 같은 신분증 정보를 계산한다.",
        reason: "원본을 복사하지 않아도 같은 파일인지 확인하려면 fingerprint가 필요하다.",
      };
    }

    if (trimmed.includes("stable_json_hash(")) {
      return {
        meaning: "JSON 내용을 안정적인 순서로 정렬해서 hash를 계산한다.",
        reason: "같은 manifest라면 같은 hash가 나와야 재현성과 drift 확인이 가능하다.",
      };
    }

    if (trimmed.includes("json.loads(")) {
      return {
        meaning: "문자열로 된 JSON을 Python dictionary/list로 파싱한다.",
        reason: "JSON 구조를 실제 field나 artifact header로 읽으려면 문자열이 아니라 구조화된 값으로 바꿔야 한다.",
      };
    }

    if (trimmed.includes("csv.reader(")) {
      return {
        meaning: "CSV 줄을 delimiter와 quote 규칙에 맞춰 column 배열로 읽는다.",
        reason: "쉼표로 단순 split하면 따옴표 안 쉼표 같은 CSV 규칙을 깨뜨릴 수 있다. 표준 reader를 쓰는 이유다.",
      };
    }

    if (trimmed.includes("Counter(")) {
      return {
        meaning: "값이나 타입이 몇 번 나왔는지 세기 위한 Counter를 만든다.",
        reason: "타입 추정, null 비율, dominant type 같은 profile 근거를 숫자로 남기기 위해 필요하다.",
      };
    }

    if (trimmed.includes("hashlib.sha256(")) {
      return {
        meaning: "읽은 원본 조각의 sha256 hash를 계산한다.",
        reason: "payload preview는 잘릴 수 있지만 hash는 같은 원본 조각인지 검증하는 지문으로 남는다.",
      };
    }

    if (trimmed.includes(".append(")) {
      return {
        meaning: "앞에서 만든 목록에 새 항목을 하나 추가한다.",
        reason: "object, source_unit, field, metric, validation item처럼 여러 개가 생기는 산출물을 배열로 모아 다음 단계가 한꺼번에 읽게 한다.",
      };
    }

    if (trimmed.includes(" = ")) {
      return explainAssignment(trimmed, context, previousMeaning);
    }

    if (/^[\}\]\)],?$/.test(trimmed)) {
      return {
        meaning: "앞에서 시작한 dictionary, list, 함수 호출, 또는 괄호 블록을 닫는 줄이다.",
        reason: "JSON 산출물과 함수 호출 구조를 정확히 닫아야 Python 문법도 맞고 artifact 구조도 깨지지 않는다.",
      };
    }

    if (/^[\{\[]$/.test(trimmed) || trimmed === "{" || trimmed === "[") {
      return {
        meaning: "새 dictionary나 list 블록을 여는 줄이다.",
        reason: "M3 artifact는 대부분 중첩된 JSON 구조라서, 관련 값들을 묶어 저장해야 한다.",
      };
    }

    return {
      meaning: `이 줄은 ${context.role} 처리에 필요한 세부 값을 구성하는 코드다. 원문 그대로 보면 "${trimmed}" 동작을 수행한다.`,
      reason: `${context.next}가 이 단계의 결과를 읽을 때 필요한 작은 조각이다. 이름, 상태, 참조, 제한값 중 하나가 빠지면 downstream이 추측해야 한다.`,
    };
  }

  function layerContext(currentLayerId, plain) {
    return {
      role: plain.simpleTitle || currentLayerId,
      next: plain.next || "다음 L 단계",
      outputs: Array.isArray(plain.outputs) ? plain.outputs.join(", ") : plain.outputs || "이 단계 산출물",
      watch: plain.watch || "M3 범위를 넘는 실행은 하지 않는다.",
    };
  }

  function explainParameterLine(trimmed, context) {
    const match = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*([^=,]+)(?:=\s*([^,]+))?,?$/);
    if (!match) return null;
    const [, name, type, defaultValue] = match;
    const parameterMeanings = {
      source: "사용자가 등록한 원본 파일이나 폴더 경로다. 여기서부터 L0가 원본 위치표를 만든다.",
      out_dir: "M3 산출물을 저장할 루트 폴더다. raw 저장소가 아니라 계약 JSON들이 쌓이는 위치다.",
      source_id: "데이터 소스를 구분하는 안정적인 이름이다. artifact_id와 dataset id의 재료가 된다.",
      run_id: "이번 분석 실행을 구분하는 이름이다. 같은 source를 다시 분석해도 결과를 분리할 수 있다.",
      checksum_mode: "파일 지문을 어느 정도로 계산할지 정하는 정책이다. prefix는 앞부분만 읽어 빠르게 확인하는 방식이다.",
      checksum_bytes: "prefix checksum일 때 파일 앞부분을 몇 byte 읽을지 정한다. 8 * 1024 * 1024는 8 MiB다.",
      max_rows: "sample로 읽을 최대 row 수다. M3가 전체 대용량을 다 읽지 않게 막는다.",
      max_bytes: "sample로 읽을 최대 byte 수다. row 수와 별도로 큰 줄이나 큰 파일을 제한한다.",
      fields: "L2/L3에서 추린 field evidence 목록이다. Silver/Gold 추천은 이 목록을 보고 판단한다.",
      l0: "직전 L0 산출물 묶음이다. source_unit_id, object_id, file 목록 같은 원본 identity를 담고 있다.",
      l1: "직전 L1 Bronze sample 산출물이다. profile과 다음 추천의 입력이 된다.",
      l2: "L2 profile snapshot 산출물이다. AI-safe evidence와 추천의 근거가 된다.",
      l3: "L3 AI-safe evidence 산출물이다. L4/L5/L6/L7이 raw 대신 이 요약 근거를 쓴다.",
      l4: "L4 추천 draft 산출물이다. 사용자 결정 단계에서 승인/보류/거절할 대상이다.",
      l5: "L9 사용자 decision 산출물이다. compiler는 여기서 승인된 것만 spec으로 바꾼다.",
      l6: "compiler 산출물이다. preview-only spec과 validation 결과를 포함한다.",
      l7: "Silver preview evidence 산출물이다. L15 processing/catalog 판단에 쓰인다.",
      l8: "Gold readiness evidence 산출물이다. Gold status와 metric caveat를 담는다.",
      l9: "3축 gate 산출물이다. M6 context status와 safe_to_run 판단을 담는다.",
    };
    const typeText = type.trim();
    const defaultText = defaultValue ? ` 기본값은 ${defaultValue.trim()}이다.` : "";
    return {
      meaning: parameterMeanings[name] || `${name}라는 입력값을 받는다. 타입 표시는 ${typeText}이고, 함수 안에서 ${context.role} 산출물을 만들 때 사용된다.`,
      reason: `${name}이 명확해야 이 함수가 무엇을 기준으로 ${context.outputs}을 만드는지 추적할 수 있다.${defaultText}`,
    };
  }

  function explainDictionaryFieldLine(trimmed, context) {
    const match = trimmed.match(/^["']([^"']+)["']:\s*(.*),?$/);
    if (!match) return null;
    const [, key, value] = match;
    const dictionaryMeanings = {
      layer: "이 산출물이 논리상 어느 L 단계의 결과인지 적는 필드다.",
      artifact_type: "파일이 어떤 종류의 artifact인지 적는 필드다.",
      source_id: "어느 데이터 소스에서 나온 결과인지 적는 필드다.",
      run_id: "어느 실행에서 나온 결과인지 적는 필드다.",
      source_root: "원본 source의 시작 경로를 기록한다.",
      source_kind: "원본이 object/file 기반인지 stream 기반인지 같은 큰 종류를 적는다.",
      declared_format: "아직 format을 확정하지 않았으면 unknown으로 둔다.",
      source_units: "뒤 단계가 처리 단위로 따라갈 source_unit 목록이다.",
      source_unit_id: "이 record나 object가 속한 처리 단위 id다.",
      source_unit_type: "처리 단위가 object batch인지 stream window인지 나타낸다.",
      object_id: "원본 파일/object 하나를 가리키는 id다.",
      object_ids: "이 source unit에 포함된 object id 목록이다.",
      stream_window_ids: "stream 입력이면 연결될 window id 목록이다. object batch면 비어 있을 수 있다.",
      object_count: "manifest에 들어간 object 개수다.",
      total_size_bytes: "원본 object들의 총 byte 크기다.",
      objects: "원본 object별 metadata 목록이다.",
      stream_windows: "stream window metadata 자리다. core object batch에서는 빈 배열일 수 있다.",
      raw_policy: "M3가 raw를 복사하거나 바꾸지 않는다는 정책 묶음이다.",
      copy_raw_payload: "raw payload를 M3 산출물에 복사하지 않는다는 boolean이다.",
      mutate_raw_payload: "원본 값을 M3가 수정하지 않는다는 boolean이다.",
      default_checksum_mode: "기본 checksum 계산 방식을 기록한다.",
      note: "사람과 다른 M이 읽을 수 있는 보충 설명이다.",
      schema_version: "이 artifact가 따르는 schema 버전이다.",
      access_class: "이 artifact를 누가 어느 수준으로 볼 수 있는지 나타내는 등급이다.",
      body: "artifact header 아래 실제 업무 payload가 들어가는 영역이다.",
      required_columns: "Bronze/Silver 같은 표준 구조에서 반드시 있어야 하는 column 목록이다.",
      parse_status_values: "parse 결과 상태로 허용되는 값 목록이다.",
      locator_rule: "원본 record를 다시 찾기 위해 어떤 위치 정보가 필요한지 정하는 규칙이다.",
      sample_record_count: "bounded sample에 들어간 record 수다.",
      sample_lane: "sample을 어느 한도로 읽었는지 적는 묶음이다.",
      row_limit: "sample row 수 제한이다.",
      byte_limit: "sample byte 제한이다.",
      policy: "이 산출물을 어떻게 해석해야 하는지 적는 정책 문장이다.",
      jsonl_artifact: "실제 JSONL sample 파일 이름이다.",
      rules: "이 산출물에 적용되는 판단 규칙 목록이다.",
      when: "어떤 상황에서 해당 규칙을 적용하는지 적는다.",
      action: "그 상황에서 어떤 처리를 해야 하는지 적는다.",
      record_id: "sample record 하나의 id다.",
      record_locator: "원본 안에서 이 record 위치를 다시 찾는 정보 묶음이다.",
      line_number: "원본 파일에서 몇 번째 줄인지 적는다.",
      byte_start: "원본 파일에서 이 record가 시작되는 byte 위치다.",
      byte_end: "원본 파일에서 이 record가 끝나는 byte 위치다.",
      payload: "sample로 들고 온 record 내용이다. 보통 제한된 preview다.",
      raw_preview: "사람이 확인할 수 있는 raw preview다.",
      raw_sha256: "원본 record 조각의 sha256 지문이다.",
      raw_snippet_status: "raw preview가 어떤 제한 상태로 들어갔는지 나타낸다.",
      source_uri: "원본 파일의 URI다.",
      source_path: "원본 파일의 local path다.",
      ingest_time: "sample을 읽은 시각이다.",
      fields: "field profile이나 decision field 목록이다.",
      target_name: "Silver에서 쓸 추천 column 이름이다.",
      target_type: "Silver에서 쓸 추천 타입이다.",
      recommended_actions: "이 field에 적용할 추천 작업 목록이다.",
      pii_handling: "PII 후보를 none/mask/hash 중 어떻게 처리할지 정한다.",
      catalog_exposure: "catalog에 보이게 할지 숨길지 정한다.",
      query_context_exposure: "M6 query context에 노출할지 금지할지 정한다.",
      write_mode: "실행 결과를 어떻게 쓸지 정한다. M3 계약에서는 preview_only여야 한다.",
      input_ref: "이 작업이 읽을 upstream artifact id다.",
      output_ref: "이 작업이 만들 downstream artifact id다.",
      operations: "M2가 실행할 수 있는 선언형 작업 목록이다.",
      group_by: "Gold 집계에서 묶을 기준 column 목록이다.",
      dimensions: "Gold 결과의 차원 column 목록이다.",
      measures: "Gold에서 계산할 metric 목록이다.",
      time_window: "시간 window 집계를 쓸 때의 기준이다.",
      cardinality_guard: "group 수가 너무 커지는 것을 막는 안전장치다.",
      overall_status: "검증 전체 상태다. pass/warn/block 같은 결론이다.",
      checks: "개별 검증 항목 목록이다.",
      m6_context_status: "M6가 Silver/Gold context를 사용해도 되는지 나타내는 최종 상태 묶음이다.",
      allowed_columns: "M6 SQL/query에서 사용할 수 있는 column 목록이다.",
      allowed_tables: "M6 query context에 노출할 수 있는 table 목록이다.",
      caveats: "사용자가 결과를 볼 때 같이 알아야 하는 주의 문구다.",
      refs: "다른 artifact id들을 모아 둔 참조 묶음이다.",
    };
    const valueText = value.replace(/,$/, "").trim();
    const meaning = dictionaryMeanings[key] || `JSON 산출물 안에 ${key}라는 고정 필드를 넣는 줄이다. 값은 ${valueText || "아래 블록"}에서 채워진다.`;
    return {
      meaning,
      reason: `${key} 필드명이 고정되어야 ${context.next}가 값을 추측하지 않고 읽을 수 있다. 값이 비어 있거나 틀리면 lineage, validation, catalog handoff 중 하나가 흔들린다.`,
    };
  }

  function explainLoop(trimmed) {
    if (trimmed.includes("enumerate(files")) {
      return "source 파일 목록을 하나씩 돌면서 순번과 path를 같이 받는다. start=1이면 첫 파일 번호가 1부터 시작한다.";
    }
    if (trimmed.includes("fields")) return "field 목록을 하나씩 보면서 타입, PII, 추천 action, metric 후보 같은 판단을 적용한다.";
    if (trimmed.includes("models")) return "승인되었거나 추천된 Gold model 목록을 하나씩 보면서 operation이나 metric 정의로 바꾼다.";
    if (trimmed.includes("path in sorted")) return "산출물 폴더 아래 파일을 정렬된 순서로 훑으면서 artifact 목록을 만든다.";
    return "목록 안의 항목을 하나씩 처리하는 반복문이다.";
  }

  function explainIf(trimmed) {
    if (trimmed.includes("max_rows") || trimmed.includes("max_bytes")) return "sample row 수나 byte 수가 한도에 도달했는지 확인한다.";
    if (trimmed.includes("approved")) return "사용자가 승인한 Gold/Silver인지 확인한다. 승인되지 않으면 실행 operation을 만들면 안 된다.";
    if (trimmed.includes("pii")) return "PII 후보인지 확인해서 노출/마스킹 정책을 다르게 적용한다.";
    if (trimmed.includes("not_requested") || trimmed.includes("deferred")) return "Gold가 요청되지 않았거나 보류된 상태인지 확인한다.";
    if (trimmed.includes("block")) return "검증 결과가 block인지 확인해서 downstream 실행을 막을지 결정한다.";
    if (trimmed.includes("path.is_file")) return "폴더 안 항목 중 실제 파일만 artifact 후보로 다룬다.";
    return `조건 ${trimmed.replace(/^if\s+/, "").replace(/:$/, "")}이 맞는지 확인하는 줄이다.`;
  }

  function explainReturn(trimmed, context) {
    if (trimmed === "return rows") return "지금까지 모은 sample row 목록을 돌려준다.";
    if (trimmed === "return fields") return "field profile 목록을 돌려준다.";
    if (trimmed.includes("{")) return `이 함수가 만든 ${context.outputs} 정보를 dictionary로 돌려주기 시작한다.`;
    return "함수의 최종 결과를 호출한 쪽으로 돌려준다.";
  }

  function explainAssignment(trimmed, context, previousMeaning) {
    const [leftRaw, rightRaw] = trimmed.split(/\s=\s(.+)/);
    const left = (leftRaw || "").replace(/:.*$/, "").trim();
    const right = (rightRaw || "").replace(/,$/, "").trim();
    const variableMeanings = {
      layer_dir: "이 L 단계 산출물을 저장할 하위 폴더 경로를 만든다.",
      files: "처리 대상 source file 목록을 변수에 담는다.",
      objects: "원본 object metadata를 담을 빈 목록을 만든다.",
      source_units: "처리 단위 metadata를 담을 빈 목록을 만든다.",
      object_id: "현재 파일을 가리키는 object id 문자열을 만든다.",
      source_unit_id: "현재 파일 묶음을 가리키는 source unit id 문자열을 만든다.",
      fingerprint: "현재 파일의 URI, 크기, checksum 같은 지문 정보를 담는다.",
      body: "artifact header 아래 들어갈 실제 JSON payload를 만들기 시작한다.",
      manifest: "object/source manifest artifact를 변수에 담는다.",
      source_manifest: "source unit 목록 중심의 manifest artifact를 변수에 담는다.",
      replay: "원본을 다시 찾는 데 필요한 replay pointer artifact를 변수에 담는다.",
      object_by_path: "path로 L0 object metadata를 빠르게 찾기 위한 lookup table을 만든다.",
      samples: "bounded Bronze sample record 목록을 만든다.",
      envelope_manifest: "Bronze sample manifest artifact를 만든다.",
      rescue_manifest: "parse 실패나 schema conflict를 보존할 rescue lane manifest를 만든다.",
      envelope_spec: "Bronze envelope이 가져야 할 필수 column과 locator 규칙을 만든다.",
      rows: "sample record나 table row를 담을 빈 목록을 만든다.",
      consumed: "지금까지 sample로 읽은 byte 수를 센다.",
      byte_start: "현재 줄이 파일 안에서 시작되는 byte 위치를 기록한다.",
      byte_end: "현재 줄이 파일 안에서 끝나는 byte 위치를 계산한다.",
      text: "raw byte를 사람이 읽을 수 있는 문자열로 바꾼다.",
      fields: "field profile이나 추천 field 목록을 담을 배열을 만든다.",
      type_counts: "field에 관측된 타입별 개수를 dictionary로 바꾼다.",
      null_count: "해당 field에서 null로 관측된 개수를 꺼낸다.",
      preview: "긴 값 전체가 아니라 짧은 예시 문자열을 만든다.",
      detection: "format detection 결과를 담는다.",
      profile: "profile snapshot 내용을 담는다.",
      schema_fingerprint: "schema/profile 비교용 fingerprint를 담는다.",
      input_pack: "AI가 볼 수 있는 축약 evidence pack을 만든다.",
      redaction_map: "PII 후보와 가린 값을 추적하는 map을 만든다.",
      silver_draft: "Silver 정제 추천 초안을 만든다.",
      gold_draft: "Gold 생성 추천 초안을 만든다.",
      risk_score_policy: "risk_score 계산 정책 추천 초안을 만든다.",
      operations: "M2가 실행할 수 있는 operation 목록을 만든다.",
      validation: "compiler나 preview 검증 결과를 담는다.",
      catalog: "catalog handoff에 들어갈 metadata를 담는다.",
      sql_context: "M6가 SQL 질의에 쓸 context를 담는다.",
      allowed_columns: "query에 노출 가능한 column만 뽑은 목록이다.",
      metrics: "Gold metric 정의 목록이다.",
    };
    let meaning = variableMeanings[left];
    if (!meaning) {
      if (right.includes("f\"")) meaning = `${left} 값을 f-string으로 만든다. source_id, run_id, index 같은 값을 끼워 넣어 안정적인 이름을 만든다.`;
      else if (right.includes("len(")) meaning = `${left}에 개수를 계산한 값을 담는다.`;
      else if (right.includes("sum(")) meaning = `${left}에 여러 항목을 합산한 값을 담는다.`;
      else if (right.includes("[") && right.includes("for ")) meaning = `${left}에 list comprehension 결과를 담는다. 여러 항목에서 필요한 값만 뽑아 새 목록을 만든다.`;
      else meaning = `${left}라는 이름에 오른쪽 계산 결과를 저장한다. 이 뒤 줄에서 같은 값을 다시 쓰기 위한 준비다.`;
    }
    const reason = assignmentReason(left, right, context, previousMeaning);
    return { meaning, reason };
  }

  function assignmentReason(left, right, context) {
    if (left.includes("object_id") || left.includes("source_unit_id")) {
      return "이 id가 L1 replay locator, L10/L11 preview_scope, L16 lineage까지 이어진다. 처음 이름을 안정적으로 붙이는 것이 중요하다.";
    }
    if (left.includes("checksum") || right.includes("checksum")) {
      return "원본을 복사하지 않는 대신 같은 파일인지 확인할 지문이 필요하다. 대용량에서는 checksum 비용도 정책으로 관리해야 한다.";
    }
    if (left.includes("allowed") || left.includes("exposure")) {
      return "M6 query와 catalog에 무엇을 보여줄지 제한해야 PII나 보류된 Gold metric이 잘못 노출되지 않는다.";
    }
    if (left.includes("operations")) {
      return "M3는 코드를 실행하지 않고 선언형 operation 목록을 만든다. 이 목록이 M2 실행 계약의 핵심이다.";
    }
    if (left.includes("metrics")) {
      return "Gold는 metric 이름과 계산 근거가 고정되어야 M1/M6가 같은 의미로 해석할 수 있다.";
    }
    if (left.includes("validation") || left.includes("status")) {
      return "pass/warn/block 같은 상태를 값으로 남겨야 다음 단계가 감으로 판단하지 않는다.";
    }
    return `${context.outputs}을 만들기 위한 중간값이다. 이 값을 이름 붙여 두면 뒤 줄에서 같은 기준을 반복해서 쓸 수 있다.`;
  }
})();
