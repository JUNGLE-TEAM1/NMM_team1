import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Loader2,
  MessageSquareText,
  Send,
  User,
} from "lucide-react";

import { formatMetric } from "../formatters";

const AI_QUERY_SESSION_STORAGE_KEY = "asklake.ai_query.chat_session.v1";
const DASHBOARD_STORAGE_KEY = "asklake.ai_query.dashboard_cards.v1";

const recommendedPrompts = [
  "가장 많이 팔린 물건",
  "리뷰가 가장 많은 상품 알려줘",
  "위험 점수가 높은 문제 상품군을 찾아줘",
  "구매 전환율이 가장 낮은 상품을 찾아줘",
];

export function AiQueryPage({ setNotice }) {
  const [messages, setMessages] = useState(() => readStoredMessages());
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [openEvidenceMessageId, setOpenEvidenceMessageId] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    writeStoredMessages(messages);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function submitPrompt(nextPrompt = prompt) {
    const question = nextPrompt.trim();
    if (!question || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };
    setMessages((current) => [...current, userMessage]);
    setPrompt("");
    setLoading(true);

    window.setTimeout(() => {
      const result = buildMockAiQueryResult(question);
      const assistantMessage = buildAssistantMessage(result);
      setMessages((current) => [...current, assistantMessage]);
      setLoading(false);
    }, 420);
  }

  function handlePromptKeyDown(event) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    submitPrompt();
  }

  function addToDashboard(message) {
    const cards = readDashboardCards();
    const nextCard = {
      id: message.id,
      title: message.insightTitle || "AI Query 분석 결과",
      question: message.question,
      summary: message.content,
      rows: message.rows || [],
      columns: message.columns || [],
      evidence: message.evidence || [],
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify([nextCard, ...cards]));
    setNotice?.("대시보드에 추가했습니다.");
  }

  return (
    <section className="ai-chat-page">
      <header className="ai-chat-header">
        <h2>AI Query</h2>
      </header>

      <div className="ai-chat-scroll">
        <div className={`ai-chat-thread ${messages.length === 0 ? "empty" : ""}`}>
          {messages.length === 0 ? (
            <div className="ai-chat-empty">
              <span>
                <MessageSquareText size={28} />
              </span>
              <h3>데이터에 대해 질문하세요</h3>
            </div>
          ) : null}

          {messages.map((message) => (
            <article
              key={message.id}
              className={`ai-chat-message ${message.role === "user" ? "user" : "assistant"} ${message.error ? "error" : ""}`}
            >
              {message.role === "assistant" ? (
                <span className="ai-chat-avatar assistant">
                  <MessageSquareText size={16} />
                </span>
              ) : null}

              <div className="ai-chat-bubble">
                <p>{message.content}</p>

                {message.rows?.length ? (
                  <ResultTable columns={message.columns} rows={message.rows} />
                ) : null}

                {message.evidence?.length || message.trace?.length ? (
                  <details
                    className="ai-chat-evidence"
                    open={openEvidenceMessageId === message.id}
                    onToggle={(event) => {
                      setOpenEvidenceMessageId(event.currentTarget.open ? message.id : "");
                    }}
                  >
                    <summary>근거 보기</summary>
                    <EvidenceList evidence={message.evidence} trace={message.trace} sql={message.sql} />
                  </details>
                ) : null}

                {message.rows?.length ? (
                  <button type="button" className="ai-chat-dashboard-button" onClick={() => addToDashboard(message)}>
                    <BarChart3 size={14} />
                    대시보드에 추가
                  </button>
                ) : null}
              </div>

              {message.role === "user" ? (
                <span className="ai-chat-avatar user">
                  <User size={16} />
                </span>
              ) : null}
            </article>
          ))}

          {loading ? (
            <article className="ai-chat-message assistant">
              <span className="ai-chat-avatar assistant">
                <MessageSquareText size={16} />
              </span>
              <div className="ai-chat-bubble loading">
                <Loader2 size={16} className="spin" />
                <span>데이터를 조회하고 답변을 생성하는 중입니다</span>
              </div>
            </article>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="ai-chat-composer-shell">
        <div className="ai-chat-recommendations">
          {recommendedPrompts.map((item) => (
            <button key={item} type="button" onClick={() => setPrompt(item)} disabled={loading}>
              {item}
            </button>
          ))}
        </div>
        <div className="ai-chat-composer">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handlePromptKeyDown}
            placeholder="데이터에 대해 질문하세요"
            rows={2}
            disabled={loading}
          />
          <button type="button" onClick={() => submitPrompt()} disabled={loading || !prompt.trim()} aria-label="AI Query 전송">
            {loading ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
      </footer>
    </section>
  );
}

function buildMockAiQueryResult(question) {
  const intent = classifyMockIntent(question);
  const rows = sortMockRows(intent).slice(0, 10);
  const columns = [
    { name: "product_id" },
    { name: "review_count" },
    { name: "average_rating" },
    { name: "risk_score" },
    { name: "conversion_rate" },
  ];
  const top = rows[0];
  const titleByIntent = {
    review_count: `${top.product_id} 상품의 리뷰 ${top.review_count.toLocaleString()}개가 가장 많습니다.`,
    purchase_count: `${top.product_id} 상품의 구매 수 ${top.purchase_count.toLocaleString()}건이 가장 많습니다.`,
    conversion_rate: `${top.product_id} 상품의 구매 전환율 ${(top.conversion_rate * 100).toFixed(1)}%로 가장 낮습니다.`,
    risk_score: `${top.product_id} 상품은 위험 점수 ${top.risk_score.toFixed(2)}로 부정 리뷰, 낮은 전환율, 배송 지연이 함께 감지됩니다.`,
  };

  return {
    question,
    status: "succeeded",
    route: "mock",
    summary:
      `${titleByIntent[intent]} 근거: dataset=dataset_product_health_gold; ` +
      "run_id=run_product_health_5gb_001; row_count=1000; " +
      "schema=product_id, synthetic_product_id, product_name, review_count, average_rating, negative_review_rate, view_count, purchase_count, conversion_rate, delivery_count, late_delivery_rate, risk_score.",
    query_result: {
      engine: "mock_product_health",
      row_count: rows.length,
      rows,
      columns,
      sql: mockSqlForIntent(intent),
      duration_ms: 38,
      executed_at: "demo",
    },
    evidence: [
      {
        dataset_id: "dataset_product_health_gold",
        run_id: "run_product_health_5gb_001",
        table_name: "gold_product_health",
        metrics: {
          row_count: 1000,
          processed_input_total_bytes: 5368709120,
        },
        lineage: {
          raw_sources: "commerce_behavior_events, product_reviews, product_catalog, delivery_trip_logs",
          silver_datasets: "silver_user_events, silver_product_reviews, silver_product_catalog, silver_delivery_trip_logs",
          gold_dataset: "gold_product_health",
        },
      },
    ],
    retrieval_trace: [
      {
        source_type: "mock_gold_dataset",
        source_id: "dataset_product_health_gold",
        score: 1,
        matched_terms: ["product_health", intent],
      },
    ],
  };
}

function classifyMockIntent(question) {
  const normalized = question.toLowerCase();
  if (normalized.includes("많이 팔") || normalized.includes("구매") || normalized.includes("purchase")) return "purchase_count";
  if (normalized.includes("전환")) return "conversion_rate";
  if (normalized.includes("위험") || normalized.includes("리스크") || normalized.includes("risk")) return "risk_score";
  return "review_count";
}

function sortMockRows(intent) {
  const rows = [...mockProductHealthRows];
  if (intent === "purchase_count") return rows.sort((left, right) => right.purchase_count - left.purchase_count);
  if (intent === "conversion_rate") return rows.sort((left, right) => left.conversion_rate - right.conversion_rate);
  if (intent === "risk_score") return rows.sort((left, right) => right.risk_score - left.risk_score);
  return rows.sort((left, right) => right.review_count - left.review_count);
}

function mockSqlForIntent(intent) {
  const orderBy = {
    purchase_count: "purchase_count DESC",
    conversion_rate: "conversion_rate ASC",
    risk_score: "risk_score DESC",
    review_count: "review_count DESC",
  }[intent];
  return `SELECT product_id, review_count, average_rating, risk_score, conversion_rate
FROM gold_product_health
ORDER BY ${orderBy}
LIMIT 10;`;
}

function buildAssistantMessage(result) {
  const queryResult = result?.query_result || {};
  const rows = queryResult.rows || result?.rows || [];
  const columns = queryResult.columns?.length
    ? queryResult.columns.map((column) => column.name)
    : Object.keys(rows[0] || {});
  const evidence = result?.evidence || [];
  const firstRow = rows[0] || {};
  const productLabel =
    firstRow.product_id || firstRow.internal_product_id || firstRow.synthetic_product_id || firstRow.product_name || "결과";
  const rowCount = queryResult.row_count ?? rows.length;
  const summary = normalizeSummary(result?.summary, productLabel, rowCount);

  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    question: result?.question || "",
    content: summary,
    insightTitle: `${productLabel} 분석 결과`,
    rows: rows.slice(0, 10),
    columns,
    evidence,
    trace: result?.retrieval_trace || [],
    sql: queryResult.sql || result?.sql || "",
  };
}

const mockProductHealthRows = [
  {
    product_id: "aph_prod_000032",
    synthetic_product_id: "syn_aph_000032",
    product_name: "AeroPulse Handheld Cleaner",
    review_count: 728,
    average_rating: 4.5054945054945055,
    negative_review_rate: 0.18,
    view_count: 18420,
    purchase_count: 1384,
    conversion_rate: 0.0751,
    delivery_count: 1290,
    late_delivery_rate: 0.091,
    risk_score: 0.62,
  },
  {
    product_id: "aph_prod_000788",
    synthetic_product_id: "syn_aph_000788",
    product_name: "Northline Smart Scale",
    review_count: 379,
    average_rating: 4.316622691292876,
    negative_review_rate: 0.21,
    view_count: 11320,
    purchase_count: 1048,
    conversion_rate: 0.0926,
    delivery_count: 982,
    late_delivery_rate: 0.084,
    risk_score: 0.66,
  },
  {
    product_id: "aph_prod_000863",
    synthetic_product_id: "syn_aph_000863",
    product_name: "LumaDesk Charging Hub",
    review_count: 337,
    average_rating: 3.9762611275964392,
    negative_review_rate: 0.34,
    view_count: 15180,
    purchase_count: 621,
    conversion_rate: 0.0409,
    delivery_count: 590,
    late_delivery_rate: 0.142,
    risk_score: 0.91,
  },
  {
    product_id: "aph_prod_000569",
    synthetic_product_id: "syn_aph_000569",
    product_name: "EverBrew Compact Maker",
    review_count: 336,
    average_rating: 3.9523809523809526,
    negative_review_rate: 0.29,
    view_count: 12960,
    purchase_count: 768,
    conversion_rate: 0.0593,
    delivery_count: 736,
    late_delivery_rate: 0.127,
    risk_score: 0.83,
  },
  {
    product_id: "aph_prod_000841",
    synthetic_product_id: "syn_aph_000841",
    product_name: "PureMist Air Care Kit",
    review_count: 300,
    average_rating: 4.653333333333333,
    negative_review_rate: 0.11,
    view_count: 20140,
    purchase_count: 2206,
    conversion_rate: 0.1095,
    delivery_count: 2118,
    late_delivery_rate: 0.052,
    risk_score: 0.38,
  },
  {
    product_id: "aph_prod_000194",
    synthetic_product_id: "syn_aph_000194",
    product_name: "MetroFit Resistance Set",
    review_count: 232,
    average_rating: 2.8448275862068964,
    negative_review_rate: 0.48,
    view_count: 16490,
    purchase_count: 514,
    conversion_rate: 0.0312,
    delivery_count: 489,
    late_delivery_rate: 0.188,
    risk_score: 0.97,
  },
  {
    product_id: "aph_prod_000729",
    synthetic_product_id: "syn_aph_000729",
    product_name: "UrbanNest Cable Organizer",
    review_count: 187,
    average_rating: 4.294117647058823,
    negative_review_rate: 0.16,
    view_count: 8860,
    purchase_count: 884,
    conversion_rate: 0.0998,
    delivery_count: 858,
    late_delivery_rate: 0.066,
    risk_score: 0.44,
  },
  {
    product_id: "aph_prod_000328",
    synthetic_product_id: "syn_aph_000328",
    product_name: "BrightCook Ceramic Pan",
    review_count: 184,
    average_rating: 4.021739130434782,
    negative_review_rate: 0.25,
    view_count: 14320,
    purchase_count: 742,
    conversion_rate: 0.0518,
    delivery_count: 700,
    late_delivery_rate: 0.121,
    risk_score: 0.78,
  },
  {
    product_id: "aph_prod_000415",
    synthetic_product_id: "syn_aph_000415",
    product_name: "SoundLeaf Mini Speaker",
    review_count: 152,
    average_rating: 4.105263157894737,
    negative_review_rate: 0.19,
    view_count: 9730,
    purchase_count: 932,
    conversion_rate: 0.0958,
    delivery_count: 898,
    late_delivery_rate: 0.074,
    risk_score: 0.52,
  },
  {
    product_id: "aph_prod_000364",
    synthetic_product_id: "syn_aph_000364",
    product_name: "CalmRest Neck Pillow",
    review_count: 140,
    average_rating: 3.6714285714285713,
    negative_review_rate: 0.37,
    view_count: 10640,
    purchase_count: 392,
    conversion_rate: 0.0368,
    delivery_count: 371,
    late_delivery_rate: 0.166,
    risk_score: 0.93,
  },
];

function normalizeSummary(summary, productLabel, rowCount) {
  const text = String(summary || "").trim();
  if (text) return text;
  if (rowCount > 0) return `${productLabel} 기준으로 ${formatMetric(rowCount)}개 결과를 찾았습니다.`;
  return "조건에 맞는 결과가 없습니다.";
}

function ResultTable({ columns, rows }) {
  const visibleColumns = columns.length ? columns.slice(0, 5) : Object.keys(rows[0] || {}).slice(0, 5);

  return (
    <div className="ai-chat-table-wrap">
      <table className="ai-chat-table">
        <thead>
          <tr>
            {visibleColumns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${visibleColumns.join("-")}`}>
              {visibleColumns.map((column) => (
                <td key={column}>{formatCell(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EvidenceList({ evidence, trace, sql }) {
  return (
    <div className="ai-chat-evidence-body">
      {sql ? (
        <div>
          <strong>SQL</strong>
          <code>{sql}</code>
        </div>
      ) : null}
      {evidence?.map((item, index) => (
        <div key={`${item.dataset_id || "evidence"}-${index}`}>
          <strong>{item.dataset_id || `evidence ${index + 1}`}</strong>
          <span>
            run={formatMetric(item.run_id)} · table={formatMetric(item.table_name)} · rows=
            {formatMetric(item.metrics?.row_count)}
          </span>
        </div>
      ))}
      {trace?.length ? (
        <div>
          <strong>Retrieval trace</strong>
          <span>{trace.map((item) => item.source_id || item.source_type).filter(Boolean).join(" → ") || "-"}</span>
        </div>
      ) : null}
    </div>
  );
}

function formatCell(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : String(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function readStoredMessages() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(AI_QUERY_SESSION_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredMessages(messages) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(AI_QUERY_SESSION_STORAGE_KEY, JSON.stringify(messages.slice(-12)));
}

function readDashboardCards() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DASHBOARD_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
