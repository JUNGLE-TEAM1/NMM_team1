import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  ChevronRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Database,
  FileCheck2,
  FileJson,
  FolderOpen,
  GitBranch,
  GitMerge,
  HardDrive,
  HelpCircle,
  Layers3,
  ListChecks,
  Loader2,
  MessageSquareText,
  MonitorCheck,
  Network,
  Play,
  PlayCircle,
  Plus,
  RefreshCw,
  Route,
  Save,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Table2,
  Terminal,
  Trash2,
  Workflow,
  Wrench,
  X,
} from "lucide-react";

import {
  WEEK2_DEFAULT_DATASET_ID,
  WEEK2_DEFAULT_PIPELINE_ID,
  askWeek2AiQuery,
  getWeek2AirflowReadiness,
  getWeek2Catalog,
  getWeek2Run,
  getWeek2SparkReadiness,
  triggerWeek2Run,
} from "../../api/asklakeClient";
import { getCatalogDatasetManagementPolicy, listCatalogDatasets } from "../../api/catalogApi";
import { getKafkaReplayHealth, getKafkaReplayRun, listKafkaReplayRuns } from "../../api/kafkaReplayApi";
import {
  executeTargetDatasetJobRun,
  listTargetDatasetJobRuns,
  publishTargetDatasetJobRunToCatalog,
} from "../../api/targetDatasetDraftApi";
import { DataTable, EmptyState, InfoCard, PageHeader } from "../../design-system";
import { OperationalList } from "../../features/datasets/DatasetComponents";
import { formatBytes, formatMetric } from "../formatters";
import {
  m1AiQueryPlaceholder,
  m1CatalogPlaceholder,
  m1IntegrationRows,
  m1WorkflowPlaceholder,
} from "../m1StaticShellData";
import { WEEK2_DEFAULT_CATALOG_DETAIL_URL } from "../routes";

const AI_QUERY_SESSION_STORAGE_KEY = "asklake.ai_query.latest_result.v1";

const PRODUCT_HEALTH_DATASET_ID = "dataset_product_health_gold";

const demoQuestionGroups = [
  {
    title: "Product Health SQL intents",
    tone: "primary",
    questions: [
      ["top_risk", "위험 점수가 높고 부정 리뷰, 낮은 구매 전환, 배송 지연이 겹친 문제 상품군을 찾아줘."],
      ["top_negative_review", "부정 리뷰율이 가장 높은 상품을 보여줘."],
      ["low_conversion", "구매 전환율이 가장 낮은 상품을 찾아줘."],
      ["top_late_delivery", "배송 지연율이 가장 높은 상품을 알려줘."],
    ],
  },
  {
    title: "Unsupported guardrail",
    tone: "warning",
    questions: [["unsupported", "다음 분기 매출을 예측하고 광고 문구까지 생성해줘."]],
  },
  {
    title: "Legacy reviews path",
    tone: "secondary",
    questions: [
      ["legacy_rating", "Amazon reviews에서 평점 높은 상품 알려줘"],
      ["legacy_count", "리뷰가 가장 많은 상품 알려줘"],
      ["legacy_table", "Amazon reviews의 product_id별 review_count를 보여줘"],
    ],
  },
];

export function AiQueryPage({ navigate, setNotice }) {
  const [restoredQuerySession] = useState(() => readStoredAiQuerySession());
  const [queryText, setQueryText] = useState(
    restoredQuerySession.question || "리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군을 찾아줘",
  );
  const [queryState, setQueryState] = useState({
    result: restoredQuerySession.result || null,
    error: "",
    loading: false,
  });
  const [viewMode, setViewMode] = useState(restoredQuerySession.viewMode || "table");
  const queryResult = queryState.result?.query_result;
  const rows = queryResult?.rows || queryState.result?.rows || [];
  const columns = queryResult?.columns?.length
    ? queryResult.columns.map((column) => column.name)
    : Object.keys(rows[0] || {});
  const evidence = queryState.result?.evidence || [];
  const route = queryState.result?.route;
  const retrievalTrace = Array.isArray(queryState.result?.retrieval_trace)
    ? queryState.result.retrieval_trace
    : [];
  const routeIsExecutableSql = route === "sql" && queryState.result?.status === "succeeded";
  const productHealthAnswer = productHealthAnswerSummary(queryState.result);
  const selectedCatalogDatasetId = querySelectedCatalogDatasetId(queryState.result);
  const displaySql = queryState.result
    ? queryDisplaySql(queryResult?.sql ?? queryState.result.sql)
    : m1AiQueryPlaceholder.sql;
  const answerSummary = splitQueryAnswerSummary(queryState.result?.summary || queryState.result?.status);

  async function submitQuery(nextQuestion = queryText) {
    const question = nextQuestion.trim();
    if (!question) {
      setQueryState((previous) => ({ ...previous, error: "질문을 입력해야 합니다." }));
      setNotice("질문을 입력한 뒤 실행할 수 있습니다.");
      return;
    }

    setQueryText(question);
    setQueryState((previous) => ({ ...previous, error: "", loading: true }));
    try {
      const result = await askWeek2AiQuery(question);
      setQueryState({ result, error: "", loading: false });
      writeStoredAiQuerySession({ question, result, viewMode });
    } catch (error) {
      setQueryState((previous) => ({
        result: previous.result,
        error: error.message,
        loading: false,
      }));
    }
  }

  function changeViewMode(nextViewMode) {
    setViewMode(nextViewMode);
    if (queryState.result) {
      writeStoredAiQuerySession({ question: queryText, result: queryState.result, viewMode: nextViewMode });
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="AI Query"
        body="M6 AIQueryResult를 받아 SQL 실행 결과와 근거를 표시합니다."
        actionLabel={queryState.loading ? "실행 중" : "샘플 질문 실행"}
        onAction={() => submitQuery()}
      />
      <section className="ask-layout">
        <div className="question-box query-editor">
          <Search size={18} />
          <textarea
            value={queryText}
            onChange={(event) => setQueryText(event.target.value)}
            placeholder={m1AiQueryPlaceholder.question}
          />
          <button
            type="button"
            className="primary-action"
            onClick={() => submitQuery()}
            disabled={queryState.loading}
          >
            {queryState.loading ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            {queryState.loading ? "실행 중" : "질문 실행"}
          </button>
          {queryState.error ? <p className="form-error">{queryState.error}</p> : null}
          <div className="demo-question-groups" aria-label="Product Health demo question candidates">
            {demoQuestionGroups.map((group) => (
              <section key={group.title} className={`demo-question-group ${group.tone}`}>
                <div className="demo-question-heading">
                  <span>{group.title}</span>
                  <small>{group.tone === "warning" ? "blocked route" : group.tone === "primary" ? "SQL route" : "supporting path"}</small>
                </div>
                <div className="demo-question-list">
                  {group.questions.map(([intent, question]) => (
                    <button
                      key={intent}
                      type="button"
                      className={`ghost-action ${group.tone === "warning" ? "warning" : ""}`}
                      onClick={() => submitQuery(question)}
                      disabled={queryState.loading}
                    >
                      <Sparkles size={14} />
                      <span>{question}</span>
                      <small>{intent}</small>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className="contract-panel query-summary-panel">
          <p className="eyebrow">AI Query answer</p>
          {!queryState.result ? (
            <div className="query-empty-state">
              <MessageSquareText size={22} />
              <h3>질문을 실행하면 답변이 표시됩니다</h3>
              <p>왼쪽에서 Product Health 질문을 선택하거나 직접 입력하면 SQL 결과, 요약, 근거가 이곳에 정리됩니다.</p>
            </div>
          ) : (
            <>
              <div className="query-status-row">
                <h3>{answerSummary.headline}</h3>
                {queryState.result.guardrail ? (
                  <span className={`badge ${queryStatusBadgeClass(queryState.result)}`}>
                    {queryState.result.guardrail.validation_status}
                  </span>
                ) : null}
              </div>
              {queryState.result.guardrail?.failure_message ? (
                <p className="form-error">{queryState.result.guardrail.failure_message}</p>
              ) : null}
              {productHealthAnswer ? <ProductHealthAnswerPanel summary={productHealthAnswer} compact /> : null}
              {answerSummary.evidenceFacts.length ? (
                <div className="query-evidence-summary" aria-label="AI Query evidence summary">
                  <span>근거 요약</span>
                  <div>
                    {answerSummary.evidenceFacts.map(([label, value]) => (
                      <p key={label}>
                        <strong>{label}</strong>
                        {value}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
              {route && !routeIsExecutableSql ? (
                <p className="runtime-warning">
                  Query route가 `{route}`로 분기되어 SQL 성공 결과처럼 처리하지 않습니다.
                </p>
              ) : null}
              {isMissingLocalPathError(queryState.error) ? (
                <p className="runtime-warning">
                  Catalog output file이 아직 없어서 SQL 실행이 차단됐습니다. 먼저 실행/모니터링에서 Week2 workflow를 성공시킨 뒤 다시 질문하세요.
                </p>
              ) : null}
              <details className="query-debug-details">
                <summary>SQL / 실행 정보</summary>
                <code>{displaySql}</code>
                <div className="runtime-check-list compact">
                  <RuntimeCheck label="DuckDB runtime" ready={isDuckDbEngine(queryResult?.engine)} />
                  <RuntimeCheck label={`route=${route || "pending"}`} ready={routeIsExecutableSql} />
                  <RuntimeCheck label="SQL rows" ready={rows.length > 0} />
                  <RuntimeCheck label="evidence" ready={evidence.length > 0} />
                </div>
                <p>Chart spec: {formatChartSpec(queryState.result?.chart_spec)}</p>
              </details>
              <div className="segmented-control">
                {["table", "chart"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={viewMode === mode ? "active" : ""}
                    onClick={() => changeViewMode(mode)}
                  >
                    {mode === "table" ? <Table2 size={14} /> : <BarChart3 size={14} />}
                    {mode}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      {queryState.result ? (
        <section className="ask-result-stack">
          <div className="grid three">
            <InfoCard
              title="Dataset"
              value={queryState.result.selected_datasets?.[0]?.dataset_id}
              detail={queryState.result.selected_datasets?.[0]?.reason}
            />
            <InfoCard title="Engine" value={queryRuntimeLabel(queryResult)} detail={queryRuntimeDetail(queryResult)} />
            <InfoCard
              title="Route"
              value={route || "pending"}
              detail={routeDetail(queryState.result)}
            />
            <InfoCard
              title="Rows"
              value={formatMetric(queryResult?.row_count ?? rows.length)}
              detail={`${formatMetric(queryResult?.duration_ms)} ms / ${formatMetric(queryResult?.executed_at)}`}
            />
          </div>
          <section className="demo-handoff-panel">
            <div>
              <p className="eyebrow">Review loop</p>
              <h3>근거에서 run과 catalog로 돌아가기</h3>
              <p>AI Query 결과를 확인한 뒤 같은 세션에서 실행 결과와 CatalogMetadata를 다시 볼 수 있습니다.</p>
            </div>
            <div className="handoff-actions">
              <button type="button" className="ghost-action" onClick={() => navigate("/runs")}>
                Run Status
                <ListChecks size={16} />
              </button>
              <button
                type="button"
                className="primary-action"
                onClick={() => navigate("/catalog", { focusCatalogDatasetId: selectedCatalogDatasetId })}
                disabled={!selectedCatalogDatasetId}
              >
                Catalog detail
                <ArrowRight size={16} />
              </button>
            </div>
          </section>

          {viewMode === "table" ? (
            <DataTable
              columns={columns.length ? columns : ["result"]}
              rows={rows.length ? queryRows(rows, columns) : [["반환된 row가 없습니다."]]}
            />
          ) : (
            <section className="chart-spec-panel">
              <BarChart3 size={22} />
              <div>
                <strong>{queryState.result.chart_spec?.title || "Chart spec"}</strong>
                <p>
                  {formatMetric(queryState.result.chart_spec?.type)} / x:{" "}
                  {formatMetric(queryState.result.chart_spec?.x)} / y:{" "}
                  {formatMetric(queryState.result.chart_spec?.y)}
                </p>
              </div>
            </section>
          )}

          <RetrievalTracePanel trace={retrievalTrace} route={route} />

          <section className="evidence-grid">
            {evidence.map((item) => (
              <EvidenceCard key={`${item.dataset_id}:${item.run_id || item.s3_uri || item.table_name}`} evidence={item} />
            ))}
          </section>
        </section>
      ) : null}
    </div>
  );
}

function queryStatusBadgeClass(result) {
  if (result.status === "succeeded" && result.guardrail?.validation_status === "passed") return "green";
  if (result.status === "blocked" || result.guardrail?.validation_status === "blocked") return "orange";
  if (result.status === "failed" || result.guardrail?.validation_status === "failed") return "red";
  return "blue";
}

function querySelectedCatalogDatasetId(result) {
  return result?.selected_datasets?.[0]?.dataset_id || result?.evidence?.[0]?.dataset_id || "";
}

function readStoredAiQuerySession() {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.sessionStorage.getItem(AI_QUERY_SESSION_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return {};
    return {
      question: typeof parsed.question === "string" ? parsed.question : "",
      result: parsed.result && typeof parsed.result === "object" ? parsed.result : null,
      viewMode: parsed.viewMode === "chart" ? "chart" : "table",
    };
  } catch {
    return {};
  }
}

function writeStoredAiQuerySession({ question, result, viewMode }) {
  if (typeof window === "undefined" || !result) return;
  try {
    window.sessionStorage.setItem(
      AI_QUERY_SESSION_STORAGE_KEY,
      JSON.stringify({
        question,
        result,
        viewMode: viewMode === "chart" ? "chart" : "table",
      }),
    );
  } catch {
    // Session storage is a UX convenience only; query execution should never fail because of it.
  }
}

function queryRouteBadgeClass(route) {
  if (route === "sql") return "green";
  if (route === "unsupported") return "orange";
  if (route === "rag" || route === "hybrid") return "blue";
  return "gray";
}

function routeDetail(result) {
  if (!result?.route) return "M6 route 대기";
  if (result.route === "sql" && result.status === "succeeded") return "SQL runtime으로 실행됨";
  if (result.route === "unsupported") return "지원하지 않는 질문으로 SQL 실행 차단";
  return `${formatMetric(result.status)} 상태로 처리`;
}

function queryDisplaySql(sql) {
  if (typeof sql === "string" && sql.trim()) return sql;
  return "SQL not generated: blocked or unsupported route";
}

function isDuckDbEngine(engine) {
  return String(engine || "").toLowerCase() === "duckdb";
}

function queryRuntimeLabel(queryResult) {
  if (!queryResult?.engine) return "대기";
  return queryResult.engine;
}

function queryRuntimeDetail(queryResult) {
  if (!queryResult?.engine) return "질문 실행 후 runtime 표시";
  if (isDuckDbEngine(queryResult.engine)) return "M6 DuckDB 실제 SQL runtime";
  return "fallback 또는 test SqlEngineAdapter";
}

function isMissingLocalPathError(message) {
  return String(message || "").includes("local_path_missing");
}

function RuntimeCheck({ label, ready }) {
  return (
    <span className={`runtime-check ${ready ? "ready" : "pending"}`}>
      {ready ? <ShieldCheck size={13} /> : <AlertCircle size={13} />}
      {label}
    </span>
  );
}

function formatChartSpec(chartSpec) {
  if (!chartSpec) return m1AiQueryPlaceholder.chart_spec;
  return `${formatMetric(chartSpec.type)} / ${formatMetric(chartSpec.x)} -> ${formatMetric(chartSpec.y)}`;
}

function queryRows(rows, columns) {
  return rows.map((row) => columns.map((column) => formatMetric(row[column])));
}

function splitQueryAnswerSummary(summary) {
  const text = formatMetric(summary, "질문 결과");
  const [headline, evidenceText] = text.split(/\s*근거:\s*/);
  return {
    headline: headline.trim() || text,
    evidenceFacts: compactEvidenceFacts(evidenceText),
  };
}

function compactEvidenceFacts(evidenceText) {
  if (!evidenceText) return [];
  const preferredOrder = ["dataset", "run_id", "row_count", "schema"];
  const factsByKey = evidenceText.split(";").reduce((accumulator, part) => {
    const [rawKey, ...rawValue] = part.split("=");
    const key = rawKey?.trim();
    const value = rawValue.join("=").trim();
    if (!key || !value) return accumulator;
    accumulator[key] = key === "schema" ? `${value.split(",").filter(Boolean).length} fields` : value;
    return accumulator;
  }, {});

  return preferredOrder
    .filter((key) => factsByKey[key])
    .map((key) => [key, factsByKey[key]]);
}

function productHealthAnswerSummary(result) {
  if (!result || result.status !== "succeeded") return null;
  const datasetId = result.selected_datasets?.[0]?.dataset_id;
  if (datasetId !== PRODUCT_HEALTH_DATASET_ID) return null;
  const firstRow = result.rows?.[0] || result.query_result?.rows?.[0];
  if (!firstRow) return null;
  const evidence = result.evidence?.[0] || {};
  return {
    productId: firstRow.internal_product_id || firstRow.product_id || "-",
    title: firstRow.product_title || "-",
    scenario: firstRow.scenario_bucket || firstRow.demo_category_label || "-",
    riskDriver: firstRow.risk_driver || "-",
    riskScore: firstRow.risk_score,
    negativeReviewRate: firstRow.negative_review_rate,
    conversionRate: firstRow.conversion_rate,
    lateDeliveryRate: firstRow.late_delivery_rate,
    processedInputBytes: evidence.metrics?.processed_input_total_bytes,
    goldRows: evidence.metrics?.row_count,
    runId: evidence.run_id,
    tableName: evidence.table_name,
  };
}

function ProductHealthAnswerPanel({ summary, compact = false }) {
  const metrics = [
    ["위험 점수", summary.riskScore],
    ["부정 리뷰율", formatRate(summary.negativeReviewRate)],
    ["구매 전환율", formatRate(summary.conversionRate)],
    ["배송 지연율", formatRate(summary.lateDeliveryRate)],
    ["처리 입력", formatBytes(summary.processedInputBytes)],
    ["Gold rows", formatMetric(summary.goldRows)],
  ];

  return (
    <section className={`product-health-answer-panel ${compact ? "compact" : ""}`}>
      <header>
        <div>
          <p className="eyebrow">Answer summary</p>
          <h3>{summary.productId}</h3>
          <p>{summary.title}</p>
        </div>
        <span className="badge green">SQL grounded</span>
      </header>
      <div className="product-health-answer-meta">
        <span>{summary.scenario}</span>
        <span>{summary.riskDriver}</span>
        <span>run: {formatMetric(summary.runId)}</span>
        <span>table: {formatMetric(summary.tableName)}</span>
      </div>
      <div className="product-health-answer-metrics">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{formatMetric(value)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatRate(value) {
  if (typeof value !== "number") return value;
  return `${(value * 100).toFixed(1)}%`;
}


function formatSnapshotCoverage(snapshot) {
  if (!snapshot) return "not created";
  if (snapshot.coverage_status === "input_exhausted_before_limit") return "source exhausted";
  if (snapshot.coverage_status === "bounded_sample_limit_reached") return "bounded sample";
  return snapshot.coverage_status || snapshot.snapshot_mode || "bounded sample";
}

function RetrievalTracePanel({ trace, route }) {
  return (
    <section className="retrieval-trace-panel">
      <header>
        <div>
          <p className="eyebrow">Retrieval trace</p>
          <h3>M6가 선택한 evidence 경로</h3>
        </div>
        <span className={`badge ${queryRouteBadgeClass(route)}`}>route={route || "pending"}</span>
      </header>
      {trace.length ? (
        <div className="retrieval-trace-list">
          {trace.map((item, index) => (
            <article key={`${item.source_type || "source"}:${item.source_id || index}:${item.evidence_index ?? index}`}>
              <div className="trace-node-icon">
                <Route size={16} />
              </div>
              <div>
                <div className="trace-title-row">
                  <strong>{formatMetric(item.source_id, `trace ${index + 1}`)}</strong>
                  <span className="badge slate">{formatMetric(item.source_type, "source")}</span>
                </div>
                <p>
                  score {formatMetric(item.score)} / evidence index {formatMetric(item.evidence_index)}
                </p>
                <small>matched terms: {formatTraceTerms(item.matched_terms)}</small>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="trace-empty">retrieval_trace가 비어 있습니다. M1은 빈 trace를 성공 근거로 꾸미지 않습니다.</p>
      )}
    </section>
  );
}

function ProductHealthReadinessPanel({ readiness, onRefresh, loading, compact }) {
  return (
    <section className={`product-health-readiness ${readiness.status} ${compact ? "compact" : ""}`}>
      <header>
        <div>
          <p className="eyebrow">{readiness.eyebrow || "Dataset readiness"}</p>
          <h3>{readiness.title}</h3>
          <p>{readiness.body}</p>
        </div>
        <div className="product-health-actions">
          <span className={`badge ${productHealthBadgeClass(readiness.status)}`}>{readiness.status}</span>
          <button type="button" className="icon-link" onClick={onRefresh} disabled={loading} aria-label="Dataset readiness 새로고침">
            {loading ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
          </button>
        </div>
      </header>
      <div className="product-health-checks">
        {readiness.checks.map(([label, state, detail]) => (
          <article key={label}>
            <RuntimeCheck label={label} ready={state === "ready"} />
            <span>{detail}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function DemoReadinessPanel({ items }) {
  return (
    <section className="demo-readiness-panel" aria-label="M1 demo readiness by module">
      <header>
        <div>
          <p className="eyebrow">Demo readiness</p>
          <h3>M2/M3/M5/M6/M1 발표 준비 상태</h3>
          <p>확인되지 않은 항목은 성공으로 표시하지 않고 다음 책임 영역을 그대로 보여줍니다.</p>
        </div>
      </header>
      <div className="demo-readiness-grid">
        {items.map((item) => (
          <article key={item.module} className={`demo-readiness-item ${item.state}`}>
            <div className="demo-readiness-title">
              <strong>{item.module}</strong>
              <span className={`badge ${demoReadinessBadgeClass(item.state)}`}>{item.state}</span>
            </div>
            <span>{item.label}</span>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function productHealthBadgeClass(status) {
  if (status === "ready") return "green";
  if (status === "partial" || status === "checking") return "orange";
  return "red";
}

function demoReadinessBadgeClass(state) {
  if (state === "ready") return "green";
  if (state === "blocked" || state === "not-ready") return "red";
  return "orange";
}

function formatTraceTerms(terms) {
  if (!Array.isArray(terms) || terms.length === 0) return "-";
  return terms.map((term) => formatMetric(term)).join(", ");
}

function EvidenceCard({ evidence }) {
  const schemaRows = (evidence.schema_fields || []).map((field) => [
    field.name,
    field.type,
    formatMetric(field.nullable),
  ]);
  const metricRows = Object.entries(evidence.metrics || {}).map(([key, value]) => [
    key,
    formatEvidenceValue(value),
  ]);
  const lineageRows = Object.entries(evidence.lineage || {}).map(([key, value]) => [
    key,
    formatEvidenceValue(value),
  ]);
  const evidenceStoragePath = evidence.storage?.local_fallback_path || evidence.storage?.local_path || "";

  return (
    <article className="evidence-card">
      <header>
        <div>
          <p className="eyebrow">Evidence</p>
          <h3>{evidence.dataset_id}</h3>
        </div>
        {evidence.table_name ? <span className="badge blue">{evidence.table_name}</span> : null}
      </header>
      <div className="evidence-facts">
        <span>run: {formatMetric(evidence.run_id)}</span>
        <span>freshness: {formatMetric(evidence.freshness)}</span>
        <span>terms: {(evidence.retrieval_terms || []).join(", ") || "-"}</span>
      </div>
      {evidenceStoragePath ? <code>{evidenceStoragePath}</code> : null}
      {evidence.s3_uri ? <code>{evidence.s3_uri}</code> : null}
      {schemaRows.length ? <DataTable columns={["field", "type", "nullable"]} rows={schemaRows} /> : null}
      {metricRows.length || lineageRows.length ? (
        <div className="grid two evidence-tables">
          {metricRows.length ? <DataTable columns={["metric", "value"]} rows={metricRows} /> : null}
          {lineageRows.length ? <DataTable columns={["lineage", "value"]} rows={lineageRows} /> : null}
        </div>
      ) : null}
    </article>
  );
}

function formatEvidenceValue(value) {
  if (Array.isArray(value)) return value.join(", ") || "-";
  if (value && typeof value === "object") return JSON.stringify(value);
  return formatMetric(value);
}
