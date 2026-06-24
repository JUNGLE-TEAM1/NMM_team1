export const DASHBOARD_STATE_STORAGE_KEY = "xflow_analysis_board_state_clean_demo_v2";

const ragChunkingStrategy = {
  title: "메타데이터 보존 의미 청킹",
  description:
    "문서를 단순 길이로 자르지 않고 상담 턴, 리뷰 문장, 정책 문단 단위로 나눈 뒤 월, 고객군, 상품, 이슈 타입 메타데이터를 유지합니다.",
  items: [
    {
      label: "Semantic chunking",
      value: "문의/리뷰에서 원인 문장이 끊기지 않도록 의미 단위로 chunk를 생성",
    },
    {
      label: "Table-linked metadata",
      value: "month, customer_segment, product_id, issue_type을 chunk에 붙여 SQL 집계와 연결",
    },
    {
      label: "Evidence rerank",
      value: "벡터 유사도, 매출 변화 구간, 이슈 타입 일치도를 함께 반영해 근거를 재정렬",
    },
  ],
};

const ragPipeline = [
  {
    title: "1. 정형 데이터 집계",
    body: "orders, customers 테이블에서 월별 매출/이탈 지표를 SQL로 계산",
  },
  {
    title: "2. 비정형 원문 수집",
    body: "support tickets, reviews, call notes, policy docs를 RAG 소스로 적재",
  },
  {
    title: "3. 청킹/임베딩",
    body: "메타데이터를 보존한 의미 chunk를 만들고 OpenSearch vector index에 저장",
  },
  {
    title: "4. SQL + RAG 결합",
    body: "차트의 월/고객군 구간과 관련 chunk를 매칭해 분석 답변에 반영",
  },
];

export const revenueInsight = {
  id: "ai-rag-premium-revenue-drop",
  title: "프리미엄 고객 매출 감소 원인 분석",
  description: "SQL 매출 추이와 RAG 고객 원문 근거를 함께 반영한 분석",
  userPrompt: "최근 프리미엄 고객군 매출 감소 원인과 근거 원문을 함께 분석해줘",
  llmAnswer:
    "SQL 집계상 프리미엄 고객군 매출은 1월 6,420만 원에서 6월 4,380만 원으로 31.8% 감소했습니다. 같은 기간 RAG로 검색된 배송 지연, 가격 인상, 재구매 보류 관련 원문 근거는 8건에서 38건으로 증가했습니다. 따라서 이번 감소는 단순 주문 감소보다 배송 SLA 이탈과 가격 민감도 상승이 함께 작용한 것으로 해석됩니다.",
  ragSummary:
    "RAG 검색은 4~6월 구간에서 배송 지연 불만과 가격 인상 언급이 집중된 chunk를 반환했고, 이 근거 수가 차트의 보조 지표로 반영되었습니다.",
  sql: `WITH monthly_orders AS (
  SELECT
    DATE_TRUNC('month', o.created_at)::date AS month,
    SUM(o.total_amount) AS premium_revenue,
    COUNT(*) AS order_count
  FROM lakehouse.commerce.orders o
  JOIN lakehouse.commerce.customers c
    ON o.customer_id = c.customer_id
  WHERE c.segment = 'premium'
    AND o.created_at >= DATE '2026-01-01'
    AND o.created_at < DATE '2026-07-01'
  GROUP BY 1
),
rag_chunks AS (
  SELECT
    DATE_TRUNC('month', event_at)::date AS month,
    chunk_id,
    source_name,
    issue_type,
    similarity_score
  FROM opensearch.customer_voice_chunks
  WHERE vector_search(
    embedding,
    embed('premium customer revenue decline delivery delay price increase')
  ) > 0.82
    AND customer_segment = 'premium'
),
monthly_rag AS (
  SELECT
    month,
    COUNT(*) AS rag_complaint_mentions
  FROM rag_chunks
  WHERE issue_type IN ('delivery_delay', 'price_increase', 'repurchase_hold')
  GROUP BY 1
)
SELECT
  o.month,
  o.premium_revenue,
  o.order_count,
  COALESCE(r.rag_complaint_mentions, 0) AS rag_complaint_mentions
FROM monthly_orders o
LEFT JOIN monthly_rag r ON o.month = r.month
ORDER BY o.month;`,
  source: "Trino / orders + OpenSearch customer_voice_chunks",
  sourceType: "Trino + OpenSearch",
  sourceTable: "orders",
  chartType: "rag_revenue_root_cause",
  metricKeys: {
    primary: "premium_revenue",
    secondary: "rag_complaint_mentions",
  },
  metricLabels: {
    primary: "프리미엄 매출",
    secondary: "RAG 불만 근거",
  },
  analysisImpact: {
    chartNote: "막대는 SQL 매출, 주황색 선은 같은 월에 검색된 RAG 불만 근거 수입니다.",
    whyBetter:
      "SQL만 보면 매출 감소만 보이지만, RAG를 함께 보면 배송 지연과 가격 인상 불만이 같은 시점에 증가한 원인 근거가 드러납니다.",
  },
  chunkingStrategy: ragChunkingStrategy,
  pipeline: ragPipeline,
  createdAt: "2026-06-23T15:30:00+09:00",
  chartData: [
    {
      month: "2026-01",
      premium_revenue: 64200000,
      order_count: 872,
      rag_complaint_mentions: 8,
      ragSignal: "low",
      evidenceSummary: "배송/가격 불만은 낮은 수준",
    },
    {
      month: "2026-02",
      premium_revenue: 62500000,
      order_count: 846,
      rag_complaint_mentions: 9,
      ragSignal: "low",
      evidenceSummary: "일부 배송 일정 문의 발생",
    },
    {
      month: "2026-03",
      premium_revenue: 58600000,
      order_count: 806,
      rag_complaint_mentions: 14,
      ragSignal: "medium",
      evidenceSummary: "가격 변경 문의 증가 시작",
    },
    {
      month: "2026-04",
      premium_revenue: 52200000,
      order_count: 741,
      rag_complaint_mentions: 23,
      ragSignal: "high",
      evidenceSummary: "배송 지연과 설치 일정 불만 집중",
    },
    {
      month: "2026-05",
      premium_revenue: 47600000,
      order_count: 690,
      rag_complaint_mentions: 31,
      ragSignal: "high",
      evidenceSummary: "가격 인상 후 대체 상품 언급 증가",
    },
    {
      month: "2026-06",
      premium_revenue: 43800000,
      order_count: 652,
      rag_complaint_mentions: 38,
      ragSignal: "high",
      evidenceSummary: "재구매 보류와 계약 갱신 지연 근거 다수",
    },
  ],
  ragEvidence: [
    {
      id: "support-20260429-delivery-delay",
      source: "support_tickets",
      title: "프리미엄 고객 배송 지연 문의",
      linkedMonth: "2026-04",
      similarity: 0.91,
      metadata: {
        customerSegment: "premium",
        product: "스마트홈 허브",
        issue: "배송 지연",
        region: "수도권",
      },
      chunkText:
        "프리미엄 멤버십인데도 2주째 설치 일정이 밀렸습니다. 다음 분기 장비 추가 주문은 일정이 안정될 때까지 보류하겠습니다.",
      chartImpact: "4월 이후 매출 하락 구간의 배송 SLA 이탈 근거",
    },
    {
      id: "review-20260518-price",
      source: "customer_reviews",
      title: "가격 인상 후 대체 상품 검토 리뷰",
      linkedMonth: "2026-05",
      similarity: 0.88,
      metadata: {
        customerSegment: "premium",
        product: "프로 분석 패키지",
        issue: "가격 인상",
        region: "영남",
      },
      chunkText:
        "이번 갱신 견적이 예상보다 높아졌습니다. 기능은 만족하지만 팀 내부에서는 같은 리포트 기능을 가진 대체 상품도 같이 비교 중입니다.",
      chartImpact: "5월 RAG 불만 근거 증가와 매출 감소의 가격 민감도 근거",
    },
    {
      id: "call-20260612-repurchase-hold",
      source: "cs_call_notes",
      title: "재구매 보류 상담 요약",
      linkedMonth: "2026-06",
      similarity: 0.93,
      metadata: {
        customerSegment: "premium",
        product: "엔터프라이즈 커넥터",
        issue: "재구매 보류",
        region: "수도권",
      },
      chunkText:
        "고객은 6월 추가 라이선스 구매를 보류했습니다. 최근 장애 공지와 배송 지연 건이 함께 언급되어 내부 승인 일정이 늦어졌습니다.",
      chartImpact: "6월 최저 매출 구간에서 재구매 지연을 설명하는 직접 근거",
    },
    {
      id: "policy-20260401-pricing",
      source: "pricing_policy_docs",
      title: "프리미엄 번들 가격 정책 변경",
      linkedMonth: "2026-04",
      similarity: 0.84,
      metadata: {
        customerSegment: "premium",
        product: "프리미엄 번들",
        issue: "정책 변경",
        region: "전체",
      },
      chunkText:
        "2026년 4월부터 프리미엄 번들 신규 견적에는 설치 옵션 비용이 별도 표기됩니다. 기존 고객 갱신 견적에는 30일 유예 기간을 적용합니다.",
      chartImpact: "가격 관련 문의가 4월부터 증가한 배경 정책 근거",
    },
  ],
};

export const churnInsight = {
  id: "ai-rag-customer-churn-root-cause",
  title: "고객 이탈 증가 구간 원인 분석",
  description: "이탈 이벤트와 RAG 이탈 징후 원문을 함께 반영한 분석",
  userPrompt: "최근 고객 이탈이 증가한 구간과 원문 근거를 분석해줘",
  llmAnswer:
    "SQL 집계상 고객 이탈은 3월 124명, 4월 117명으로 높게 나타났고, 같은 기간 RAG 이탈 징후 chunk도 29건과 34건으로 집중되었습니다. 검색된 원문은 온보딩 지연, 반복 장애 문의, 경쟁사 비교 발언이 많아 단순 계절 요인보다 초기 사용 실패와 신뢰 저하가 이탈을 키운 것으로 보입니다.",
  ragSummary:
    "RAG 검색은 이탈 직전 30일 안에 생성된 상담/리뷰 chunk를 월별 이탈 지표와 연결해 원인을 보강했습니다.",
  sql: `WITH monthly_churn AS (
  SELECT
    DATE_TRUNC('month', churned_at)::date AS month,
    COUNT(*) AS churned_customers,
    ROUND(COUNT(*)::numeric / NULLIF(MAX(active_customers), 0) * 100, 1) AS churn_rate
  FROM lakehouse.commerce.customer_churn_events
  WHERE churned_at >= DATE '2026-01-01'
    AND churned_at < DATE '2026-07-01'
  GROUP BY 1
),
rag_churn_signals AS (
  SELECT
    DATE_TRUNC('month', event_at)::date AS month,
    COUNT(*) AS rag_churn_mentions
  FROM opensearch.customer_voice_chunks
  WHERE vector_search(
    embedding,
    embed('customer churn cancellation onboarding delay competitor')
  ) > 0.8
    AND issue_type IN ('cancel_intent', 'onboarding_delay', 'competitor_compare')
  GROUP BY 1
)
SELECT
  c.month,
  c.churned_customers,
  c.churn_rate,
  COALESCE(r.rag_churn_mentions, 0) AS rag_churn_mentions
FROM monthly_churn c
LEFT JOIN rag_churn_signals r ON c.month = r.month
ORDER BY c.month;`,
  source: "Trino / customer_churn_events + OpenSearch customer_voice_chunks",
  sourceType: "Trino + OpenSearch",
  sourceTable: "customers",
  chartType: "rag_customer_churn",
  metricKeys: {
    primary: "churned_customers",
    secondary: "rag_churn_mentions",
  },
  metricLabels: {
    primary: "이탈 고객",
    secondary: "RAG 이탈 징후",
  },
  analysisImpact: {
    chartNote: "막대는 SQL 이탈 고객 수, 주황색 선은 이탈 관련 원문 chunk 수입니다.",
    whyBetter:
      "SQL만 보면 3~4월 이탈 증가가 보이지만, RAG 근거를 붙이면 온보딩 지연과 경쟁사 비교 발언이 같은 시점에 몰렸다는 원인까지 설명됩니다.",
  },
  chunkingStrategy: ragChunkingStrategy,
  pipeline: ragPipeline,
  createdAt: "2026-06-23T15:40:00+09:00",
  chartData: [
    { month: "2026-01", churned_customers: 72, churn_rate: 3.1, rag_churn_mentions: 11, ragSignal: "low", evidenceSummary: "일반 문의 중심" },
    { month: "2026-02", churned_customers: 88, churn_rate: 3.8, rag_churn_mentions: 16, ragSignal: "medium", evidenceSummary: "온보딩 지연 언급 증가" },
    { month: "2026-03", churned_customers: 124, churn_rate: 5.2, rag_churn_mentions: 29, ragSignal: "high", evidenceSummary: "취소 의향과 경쟁사 비교 집중" },
    { month: "2026-04", churned_customers: 117, churn_rate: 4.9, rag_churn_mentions: 34, ragSignal: "high", evidenceSummary: "반복 장애 문의와 갱신 보류" },
    { month: "2026-05", churned_customers: 103, churn_rate: 4.1, rag_churn_mentions: 22, ragSignal: "medium", evidenceSummary: "지원 응답 지연 언급 완화" },
    { month: "2026-06", churned_customers: 96, churn_rate: 3.8, rag_churn_mentions: 19, ragSignal: "medium", evidenceSummary: "이탈 징후는 감소 추세" },
  ],
  ragEvidence: [
    {
      id: "ticket-20260311-onboarding",
      source: "support_tickets",
      title: "온보딩 지연으로 사용 시작 실패",
      linkedMonth: "2026-03",
      similarity: 0.9,
      metadata: {
        customerSegment: "mid-market",
        product: "데이터 커넥터",
        issue: "온보딩 지연",
        region: "수도권",
      },
      chunkText:
        "초기 설정이 3주째 완료되지 않아 팀에서 실제 사용을 시작하지 못했습니다. 이번 달 안에 해결되지 않으면 계약 취소를 검토하겠습니다.",
      chartImpact: "3월 이탈 증가와 직접 연결되는 취소 의향 근거",
    },
    {
      id: "review-20260407-competitor",
      source: "customer_reviews",
      title: "경쟁사 비교 리뷰",
      linkedMonth: "2026-04",
      similarity: 0.87,
      metadata: {
        customerSegment: "startup",
        product: "AI Query",
        issue: "경쟁사 비교",
        region: "전체",
      },
      chunkText:
        "분석 기능은 좋지만 최근 오류가 잦아졌습니다. 팀에서는 더 안정적인 경쟁사 솔루션으로 옮기는 방안도 같이 검토하고 있습니다.",
      chartImpact: "4월 RAG 이탈 징후 최고점의 신뢰도 저하 근거",
    },
  ],
};

export const demoGeneratedInsight = revenueInsight;

export const recommendedPrompts = [
  revenueInsight.userPrompt,
  churnInsight.userPrompt,
];

export const demoAiQuerySteps = [
  "질문 분석 중",
  "SQL 집계 생성",
  "RAG 원문 검색",
  "청킹 근거 재랭킹",
  "차트에 근거 반영",
  "LLM 답변 생성",
];

export const demoAiQueryStepDurations = [
  1200,
  1800,
  2400,
  1800,
  1400,
  2200,
];

export function getDemoInsightForPrompt(prompt) {
  const normalizedPrompt = (prompt || "").toLowerCase();
  if (
    normalizedPrompt.includes("매출") ||
    normalizedPrompt.includes("revenue") ||
    normalizedPrompt.includes("프리미엄") ||
    normalizedPrompt.includes("premium")
  ) {
    return revenueInsight;
  }
  if (
    normalizedPrompt.includes("이탈") ||
    normalizedPrompt.includes("churn")
  ) {
    return churnInsight;
  }
  return revenueInsight;
}

export function formatMetricValue(key, value) {
  if (value === null || value === undefined) return "-";
  if (key?.includes("revenue") || key?.includes("amount")) return `${formatCurrencyKRW(value)}원`;
  if (key?.includes("rate")) return `${value}%`;
  if (typeof value === "number") return value.toLocaleString();
  return value;
}

export function getInsightMetricKeys(insight) {
  if (insight?.metricKeys?.primary && insight?.metricKeys?.secondary) {
    return insight.metricKeys;
  }
  if (insight.chartType === "customer_churn") {
    return { primary: "churned_customers", secondary: "churn_rate" };
  }
  return { primary: "revenue", secondary: "orders" };
}

export function getInsightMetricLabels(insight) {
  if (insight?.metricLabels?.primary && insight?.metricLabels?.secondary) {
    return insight.metricLabels;
  }
  if (insight?.chartType === "customer_churn") {
    return { primary: "이탈 고객", secondary: "이탈률" };
  }
  return { primary: "매출", secondary: "주문 수" };
}

export function formatCurrencyKRW(value) {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)}억`;
  return `${Math.round(value / 10000).toLocaleString()}만`;
}

export function formatDateLabel(value) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function buildDemoQueryResults(insight = revenueInsight) {
  const columns = Object.keys(insight.chartData[0] || {});
  return {
    data: insight.chartData,
    columns,
    row_count: insight.chartData.length,
    was_limited: false,
    applied_limit: null,
    query: insight.sql,
  };
}

function buildLineageNodesForInsight(insight) {
  const sourceLabel = insight.sourceTable === "customers" ? "customer_churn_events" : "orders";
  const sqlTitle = insight.chartType?.includes("churn") ? "Monthly churn SQL" : "Premium revenue SQL";
  const analysisTitle = insight.chartType?.includes("churn") ? "RAG 고객 이탈 AI 분석" : "RAG 매출 원인 AI 분석";

  return [
    {
      id: `${insight.id}-source`,
      type: "supabaseSource",
      position: { x: 80, y: 180 },
      data: {
        label: "Lakehouse Source",
        table: insight.sourceTable,
        title: sourceLabel,
        rowCount: insight.sourceTable === "customers" ? "32,480 rows" : "1,248 rows",
        status: "Connected",
        syncTime: "3분 전",
        mode: "Connected",
      },
    },
    {
      id: `${insight.id}-rag`,
      type: "sqlQuery",
      position: { x: 360, y: 330 },
      data: {
        label: "RAG Retrieval",
        title: "OpenSearch customer_voice_chunks",
        status: "근거 검색 완료",
        runtime: "0.42s",
        sql: "semantic chunks + metadata rerank",
        insightId: insight.id,
      },
    },
    {
      id: `${insight.id}-sql`,
      type: "sqlQuery",
      position: { x: 360, y: 180 },
      data: {
        label: "SQL Query",
        title: sqlTitle,
        status: "실행 성공",
        runtime: insight.sourceTable === "customers" ? "0.68s" : "0.84s",
        sql: insight.sql,
        insightId: insight.id,
      },
    },
    {
      id: `${insight.id}-analysis`,
      type: "aiAnalysis",
      position: { x: 660, y: 180 },
      data: {
        label: "AI Analysis",
        title: analysisTitle,
        prompt: insight.userPrompt,
        summary: insight.llmAnswer,
        status: "생성 완료",
        insightId: insight.id,
      },
    },
    {
      id: `${insight.id}-chart`,
      type: "chartInsight",
      position: { x: 960, y: 152 },
      width: 300,
      height: 250,
      data: {
        insight,
        insightId: insight.id,
      },
    },
  ];
}

function buildLineageEdgesForInsight(insight) {
  return [
    {
      id: `${insight.id}-edge-source-sql`,
      source: `${insight.id}-source`,
      target: `${insight.id}-sql`,
      type: "smoothstep",
      markerEnd: { type: "arrowclosed" },
    },
    {
      id: `${insight.id}-edge-sql-analysis`,
      source: `${insight.id}-sql`,
      target: `${insight.id}-analysis`,
      type: "smoothstep",
      markerEnd: { type: "arrowclosed" },
    },
    {
      id: `${insight.id}-edge-rag-analysis`,
      source: `${insight.id}-rag`,
      target: `${insight.id}-analysis`,
      type: "smoothstep",
      markerEnd: { type: "arrowclosed" },
    },
    {
      id: `${insight.id}-edge-analysis-chart`,
      source: `${insight.id}-analysis`,
      target: `${insight.id}-chart`,
      type: "smoothstep",
      markerEnd: { type: "arrowclosed" },
    },
  ];
}

export function createAnalysisBoard(insight) {
  const now = new Date().toISOString();
  return {
    id: insight.id,
    insightId: insight.id,
    title: insight.title,
    description: insight.description,
    userPrompt: insight.userPrompt,
    llmAnswer: insight.llmAnswer,
    sql: insight.sql,
    source: insight.source,
    sourceType: insight.sourceType,
    sourceTable: insight.sourceTable || (insight.source || "").split("/").pop()?.trim() || "orders",
    chartType: insight.chartType,
    metricKeys: insight.metricKeys,
    metricLabels: insight.metricLabels,
    chartData: insight.chartData,
    rawData: insight.chartData,
    ragSummary: insight.ragSummary,
    ragEvidence: insight.ragEvidence || [],
    analysisImpact: insight.analysisImpact,
    chunkingStrategy: insight.chunkingStrategy,
    pipeline: insight.pipeline,
    nodes: buildLineageNodesForInsight(insight),
    edges: buildLineageEdgesForInsight(insight),
    viewport: { x: 0, y: 0, zoom: 1 },
    createdAt: now,
    updatedAt: now,
  };
}

export function getDashboardState() {
  if (typeof window === "undefined") return { activeBoardId: null, boards: [] };

  try {
    const raw = window.localStorage.getItem(DASHBOARD_STATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || !Array.isArray(parsed.boards)) {
      return { activeBoardId: null, boards: [] };
    }
    return {
      activeBoardId: parsed.activeBoardId || parsed.boards[0]?.id || null,
      boards: parsed.boards,
    };
  } catch (error) {
    console.warn("Failed to read dashboard state", error);
    return { activeBoardId: null, boards: [] };
  }
}

export function saveDashboardState(state) {
  if (typeof window === "undefined") return state;
  const nextState = {
    activeBoardId: state.activeBoardId || null,
    boards: state.boards || [],
  };
  window.localStorage.setItem(
    DASHBOARD_STATE_STORAGE_KEY,
    JSON.stringify(nextState)
  );
  return nextState;
}

export function isInsightInDashboard(id) {
  return getDashboardState().boards.some((board) => board.insightId === id);
}

export function saveDashboardInsight(insight) {
  const state = getDashboardState();
  const existingBoard = state.boards.find((board) => board.insightId === insight.id);
  const nextBoard = existingBoard
    ? {
        ...existingBoard,
        title: insight.title,
        description: insight.description,
        userPrompt: insight.userPrompt,
        llmAnswer: insight.llmAnswer,
        sql: insight.sql,
        source: insight.source,
        sourceType: insight.sourceType,
        sourceTable: insight.sourceTable,
        chartType: insight.chartType,
        metricKeys: insight.metricKeys,
        metricLabels: insight.metricLabels,
        chartData: insight.chartData,
        rawData: insight.chartData,
        ragSummary: insight.ragSummary,
        ragEvidence: insight.ragEvidence || [],
        analysisImpact: insight.analysisImpact,
        chunkingStrategy: insight.chunkingStrategy,
        pipeline: insight.pipeline,
        nodes: buildLineageNodesForInsight(insight),
        edges: buildLineageEdgesForInsight(insight),
        updatedAt: new Date().toISOString(),
      }
    : createAnalysisBoard(insight);

  const nextBoards = existingBoard
    ? state.boards.map((board) => (board.id === existingBoard.id ? nextBoard : board))
    : [nextBoard, ...state.boards];

  return saveDashboardState({
    activeBoardId: nextBoard.id,
    boards: nextBoards,
  });
}

export function updateAnalysisBoard(boardId, updates) {
  const state = getDashboardState();
  const nextBoards = state.boards.map((board) =>
    board.id === boardId
      ? { ...board, ...updates, updatedAt: new Date().toISOString() }
      : board
  );
  return saveDashboardState({ ...state, boards: nextBoards });
}

export function renameDashboardInsight(id, title) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return getDashboardState();

  const state = getDashboardState();
  const nextBoards = state.boards.map((board) => {
    if (board.id !== id) return board;
    const nextNodes = (board.nodes || []).map((node) => {
      if (node.type !== "chartInsight") return node;
      return {
        ...node,
        data: {
          ...node.data,
          insight: { ...node.data.insight, title: trimmedTitle },
        },
      };
    });
    return {
      ...board,
      title: trimmedTitle,
      nodes: nextNodes,
      updatedAt: new Date().toISOString(),
    };
  });

  return saveDashboardState({ ...state, boards: nextBoards });
}

export function removeDashboardInsight(id) {
  const state = getDashboardState();
  const nextBoards = state.boards.filter((board) => board.id !== id);
  const nextActiveBoardId =
    state.activeBoardId === id
      ? nextBoards[0]?.id || null
      : state.activeBoardId;
  return saveDashboardState({
    activeBoardId: nextActiveBoardId,
    boards: nextBoards,
  });
}

export function getStoredDashboardInsights() {
  return getDashboardState().boards;
}

export function getStoredDashboardCanvas() {
  const state = getDashboardState();
  const board = state.boards.find((item) => item.id === state.activeBoardId);
  return { nodes: board?.nodes || [], edges: board?.edges || [] };
}

export function saveDashboardCanvas(canvasState) {
  const state = getDashboardState();
  if (!state.activeBoardId) return canvasState;
  updateAnalysisBoard(state.activeBoardId, canvasState);
  return canvasState;
}

export function rebuildDashboardCanvasFromInsights(boards) {
  const nextBoards = boards.map((board) => ({
    ...board,
    nodes: buildLineageNodesForInsight(board),
    edges: buildLineageEdgesForInsight(board),
    viewport: { x: 0, y: 0, zoom: 1 },
    updatedAt: new Date().toISOString(),
  }));
  const state = getDashboardState();
  return saveDashboardState({ ...state, boards: nextBoards });
}
