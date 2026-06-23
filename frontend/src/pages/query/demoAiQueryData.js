export const DASHBOARD_STATE_STORAGE_KEY = "xflow_analysis_board_state_clean_demo_v2";

export const revenueInsight = {
  id: "ai-revenue-orders-6m",
  title: "최근 6개월 매출 및 주문 추이",
  description: "월별 매출과 주문 수의 변화 분석",
  userPrompt: "최근 6개월 월별 매출과 주문 수 추이를 분석해줘",
  llmAnswer:
    "최근 6개월간 매출과 주문 수는 전체적으로 상승했습니다. 6월 매출은 6,400만 원으로 전월 대비 10.3% 증가했고, 주문 수는 1,120건으로 전월 대비 7.7% 증가했습니다.",
  sql: `SELECT
  DATE_TRUNC('month', created_at)::date AS month,
  SUM(total_amount) AS revenue,
  COUNT(*) AS order_count
FROM orders
WHERE created_at >= DATE '2026-01-01'
  AND created_at < DATE '2026-07-01'
GROUP BY 1
ORDER BY 1;`,
  source: "Supabase / orders",
  sourceType: "Supabase",
  sourceTable: "orders",
  chartType: "revenue_orders",
  metricLabels: {
    primary: "매출",
    secondary: "주문 수",
  },
  createdAt: "2026-06-23T15:30:00+09:00",
  chartData: [
    { month: "2026-01", revenue: 42000000, orders: 820 },
    { month: "2026-02", revenue: 47000000, orders: 890 },
    { month: "2026-03", revenue: 51000000, orders: 930 },
    { month: "2026-04", revenue: 49000000, orders: 910 },
    { month: "2026-05", revenue: 58000000, orders: 1040 },
    { month: "2026-06", revenue: 64000000, orders: 1120 },
  ],
};

export const churnInsight = {
  id: "ai-customer-churn-monthly",
  title: "월별 고객 이탈 분석",
  description: "최근 이탈 고객 규모와 이탈률 변화 분석",
  userPrompt: "월별 고객 이탈 추이를 분석해줘",
  llmAnswer:
    "최근 6개월 고객 이탈률은 3월에 5.2%까지 상승했지만 5월 이후 완만하게 안정화되었습니다. 6월 이탈 고객은 96명, 이탈률은 3.8%로 전월 대비 0.3%p 낮아졌습니다.",
  sql: `SELECT
  DATE_TRUNC('month', churned_at)::date AS month,
  COUNT(*) AS churned_customers,
  ROUND(COUNT(*)::numeric / NULLIF(MAX(active_customers), 0) * 100, 1) AS churn_rate
FROM customer_churn_events
WHERE churned_at >= DATE '2026-01-01'
  AND churned_at < DATE '2026-07-01'
GROUP BY 1
ORDER BY 1;`,
  source: "Supabase / customers",
  sourceType: "Supabase",
  sourceTable: "customers",
  chartType: "customer_churn",
  metricLabels: {
    primary: "이탈 고객",
    secondary: "이탈률",
  },
  createdAt: "2026-06-23T15:40:00+09:00",
  chartData: [
    { month: "2026-01", churned_customers: 72, churn_rate: 3.1 },
    { month: "2026-02", churned_customers: 88, churn_rate: 3.8 },
    { month: "2026-03", churned_customers: 124, churn_rate: 5.2 },
    { month: "2026-04", churned_customers: 117, churn_rate: 4.9 },
    { month: "2026-05", churned_customers: 103, churn_rate: 4.1 },
    { month: "2026-06", churned_customers: 96, churn_rate: 3.8 },
  ],
};

export const demoGeneratedInsight = revenueInsight;

export const recommendedPrompts = [
  revenueInsight.userPrompt,
  churnInsight.userPrompt,
];

export const demoAiQuerySteps = [
  "질문 분석 중",
  "SQL 생성 중",
  "데이터 조회 중",
  "차트 생성 완료",
  "LLM 답변 생성",
];

export const demoAiQueryStepDurations = [
  1500,
  2200,
  5000,
  1500,
  3500,
];

export function getDemoInsightForPrompt(prompt) {
  const normalizedPrompt = (prompt || "").toLowerCase();
  if (
    normalizedPrompt.includes("이탈") ||
    normalizedPrompt.includes("churn") ||
    normalizedPrompt.includes("고객")
  ) {
    return churnInsight;
  }
  return revenueInsight;
}

export function formatMetricValue(key, value) {
  if (key === "revenue") return `${formatCurrencyKRW(value)}원`;
  if (key === "churn_rate") return `${value}%`;
  if (typeof value === "number") return value.toLocaleString();
  return value;
}

export function getInsightMetricKeys(insight) {
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
  const sourceLabel = insight.sourceTable === "customers" ? "Supabase customers" : "Supabase orders";
  const sqlTitle = insight.chartType === "customer_churn" ? "Monthly churn SQL" : "Monthly sales SQL";
  const analysisTitle = insight.chartType === "customer_churn" ? "고객 이탈 AI 분석" : "최근 6개월 매출 AI 분석";

  return [
    {
      id: `${insight.id}-source`,
      type: "supabaseSource",
      position: { x: 80, y: 180 },
      data: {
        label: "Supabase Source",
        table: insight.sourceTable,
        title: sourceLabel,
        rowCount: insight.sourceTable === "customers" ? "32,480 rows" : "1,248 rows",
        status: "Connected",
        syncTime: "3분 전",
        mode: "Demo Data",
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
      position: { x: 640, y: 180 },
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
      position: { x: 920, y: 152 },
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
    metricLabels: insight.metricLabels,
    chartData: insight.chartData,
    rawData: insight.chartData,
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
        title: existingBoard.title || insight.title,
        userPrompt: insight.userPrompt,
        llmAnswer: insight.llmAnswer,
        sql: insight.sql,
        source: insight.source,
        sourceType: insight.sourceType,
        sourceTable: insight.sourceTable,
        chartType: insight.chartType,
        metricLabels: insight.metricLabels,
        chartData: insight.chartData,
        rawData: insight.chartData,
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
