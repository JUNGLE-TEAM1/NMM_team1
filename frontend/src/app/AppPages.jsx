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
} from "../api/asklakeClient";
import { getCatalogDatasetManagementPolicy, listCatalogDatasets } from "../api/catalogApi";
import { getKafkaReplayHealth, getKafkaReplayRun, listKafkaReplayRuns } from "../api/kafkaReplayApi";
import {
  executeTargetDatasetJobRun,
  listTargetDatasetJobRuns,
  publishTargetDatasetJobRunToCatalog,
} from "../api/targetDatasetDraftApi";
import { DataTable, EmptyState, InfoCard, PageHeader } from "../design-system";
import { formatBytes, formatMetric } from "./formatters";
import {
  m1AiQueryPlaceholder,
  m1CatalogPlaceholder,
  m1IntegrationRows,
  m1WorkflowPlaceholder,
} from "./m1StaticShellData";
import { WEEK2_DEFAULT_CATALOG_DETAIL_URL } from "./routes";

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


function PageIntro({ icon: Icon, title, body, status }) {
  return (
    <div className="page-intro">
      <div className="intro-icon">
        <Icon size={24} />
      </div>
      <div>
        <p className="eyebrow">{status}</p>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

export function JobRunsPage({ setNotice }) {
  const [runState, setRunState] = useState({ loading: true, records: [], error: "" });
  const [executeState, setExecuteState] = useState({ status: "idle", runId: "", error: "" });
  const [publishState, setPublishState] = useState({ status: "idle", runId: "", error: "" });
  const [runFilter, setRunFilter] = useState("all");

  async function refreshRuns() {
    setRunState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const records = await listTargetDatasetJobRuns();
      setRunState({ loading: false, records, error: "" });
    } catch (error) {
      setRunState({ loading: false, records: [], error: error.message });
      setNotice(`Job Runs 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshRuns();
  }, []);

  async function executeRun(runId) {
    setExecuteState({ status: "executing", runId, error: "" });
    try {
      const executed = await executeTargetDatasetJobRun(runId);
      setRunState((current) => ({
        ...current,
        records: current.records.map((record) => (record.id === executed.id ? executed : record)),
      }));
      setExecuteState({ status: "executed", runId, error: "" });
      setNotice(`${executed.gold_output} ${runOutputModeLabel(executed)} ${executed.status === "succeeded" ? "완료됐습니다." : "준비 상태로 기록됐습니다."}`);
    } catch (error) {
      setExecuteState({ status: "error", runId, error: error.message });
      setNotice(`Local 실행 실패: ${error.message}`);
    }
  }

  async function publishRun(runId) {
    setPublishState({ status: "publishing", runId, error: "" });
    try {
      const dataset = await publishTargetDatasetJobRunToCatalog(runId);
      setPublishState({ status: "published", runId, error: "" });
      setNotice(`${dataset.name} CatalogMetadata 등록이 완료됐습니다. 데이터셋 > Gold Datasets에서 확인할 수 있습니다.`);
    } catch (error) {
      setPublishState({ status: "error", runId, error: error.message });
      setNotice(`Catalog 등록 실패: ${error.message}`);
    }
  }

  const runHistoryItems = runState.records.map((run) => {
    const isExecuting = executeState.status === "executing" && executeState.runId === run.id;
    const isPublishing = publishState.status === "publishing" && publishState.runId === run.id;
    return {
      runType: "gold",
      status: run.status,
      record: {
        id: run.id,
        title: run.gold_output,
        meta: `Gold Build · ${runStatusLabel(run.status)} · ${shortRunId(run.id)} · ${formatRunTimestamp(run.updated_at || run.created_at)}`,
        detail: run.run_note || "Gold Build 실행 기록",
        variant: "run-record",
        facts: [
          ["Type", "Gold Build"],
          ["Status", runStatusLabel(run.status)],
          ["Executor", executorLabel(run.executor_handoff)],
          ["Mode", runOutputModeLabel(run)],
          ["Run Role", run.runtime_evidence?.run_record_role || "definition handoff"],
          ["Output", outputFileName(run.output_path)],
          ["Rows", formatMetric(run.row_count)],
          ["Bytes", formatBytes(run.output_bytes)],
          ["Artifact", run.runtime_evidence?.result_artifact_status || run.runtime_evidence?.object_storage?.status || run.runtime_evidence?.output_format || "-"],
        ],
        actions: [
          {
            label: isExecuting ? "확인 중" : run.executor_handoff === "local_runner" ? "실행" : "준비 확인",
            icon: Play,
            disabled: isExecuting || isPublishing || run.status !== "queued",
            onClick: () => executeRun(run.id),
          },
          {
            label: isPublishing ? "등록 중" : "Catalog 등록",
            icon: Table2,
            disabled: isExecuting || isPublishing || run.status !== "succeeded",
            onClick: () => publishRun(run.id),
          },
        ].filter((action) => !action.disabled || action.label === "실행 중" || action.label === "확인 중" || action.label === "등록 중"),
      },
    };
  });
  const runFilters = [
    ["all", "전체", runHistoryItems.length],
    ["connection", "Connection", runHistoryItems.filter((item) => item.runType === "connection").length],
    ["silver", "Silver", runHistoryItems.filter((item) => item.runType === "silver").length],
    ["gold", "Gold", runHistoryItems.filter((item) => item.runType === "gold").length],
    ["failed", "실패", runHistoryItems.filter((item) => item.status === "failed").length],
  ];
  const filteredRunHistoryItems = runHistoryItems.filter((item) => {
    if (runFilter === "all") return true;
    if (runFilter === "failed") return item.status === "failed";
    return item.runType === runFilter;
  });
  const filteredRunRecords = filteredRunHistoryItems.map((item) => item.record);

  return (
    <div className="page-stack">
      <PageHeader
        title="실행 기록"
        body="Connection Sync, Silver Transform, Gold Build 같은 작업 실행 로그를 타입별로 확인합니다."
      />
      <div className="filter-row">
        {runFilters.map(([id, label, count]) => (
          <button
            key={id}
            type="button"
            className={runFilter === id ? "selected" : ""}
            onClick={() => setRunFilter(id)}
          >
            {label}
            <span>{count}</span>
          </button>
        ))}
      </div>
      <OperationalList
        icon={Play}
        title="작업 실행 로그"
        body="모든 작업은 run log로 남기고, 현재는 Gold Build run이 실제 저장되어 있습니다."
        layout="list"
        records={filteredRunRecords}
        empty={runHistoryEmptyMessage(runFilter, runState.error)}
        onRefresh={refreshRuns}
        loading={runState.loading}
      />
    </div>
  );
}

function runHistoryEmptyMessage(filter, error) {
  if (error) return error;
  if (filter === "connection") return "아직 저장된 Connection Sync 실행 로그가 없습니다. Connection runner persistence가 붙으면 여기에 표시됩니다.";
  if (filter === "silver") return "아직 저장된 Silver Transform 실행 로그가 없습니다. Silver runner persistence가 붙으면 여기에 표시됩니다.";
  if (filter === "failed") return "실패한 실행 로그가 없습니다.";
  if (filter === "gold") return "아직 Gold Build 실행 로그가 없습니다. 작업 > Gold Build Jobs에서 수동 실행을 누르면 생성됩니다.";
  return "아직 저장된 실행 로그가 없습니다. 작업 화면에서 수동 실행을 누르면 run log가 생성됩니다.";
}

function runStatusLabel(status) {
  if (status === "queued") return "실행 대기";
  if (status === "ready_to_run") return "준비됨";
  if (status === "running") return "실행 중";
  if (status === "succeeded") return "성공";
  if (status === "failed") return "실패";
  return status || "상태 없음";
}

function executorLabel(executor) {
  if (executor === "local_runner") return "local_runner";
  if (executor === "airflow") return "Airflow";
  if (executor === "spark_runner") return "Spark";
  return executor || "-";
}

function shortRunId(runId) {
  return runId ? `run ${String(runId).slice(0, 8)}` : "run id 없음";
}

function outputFileName(path) {
  if (!path) return "실행 전";
  return String(path).split("/").filter(Boolean).pop() || path;
}

function formatRunTimestamp(value) {
  if (!value) return "시간 없음";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AirflowReadinessPanel({ setNotice }) {
  const [state, setState] = useState({ loading: true, readiness: null, error: "" });

  async function refreshAirflowReadiness() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const readiness = await getWeek2AirflowReadiness();
      setState({ loading: false, readiness, error: "" });
    } catch (error) {
      setState({ loading: false, readiness: null, error: error.message });
      setNotice(`Airflow readiness 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshAirflowReadiness();
  }, []);

  const readiness = state.readiness;
  const status = readiness?.status || (state.loading ? "checking" : "unknown");
  const isConfigured = readiness?.status === "configured";

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <Network size={20} />
          <div>
            <strong>Airflow Trigger Readiness</strong>
            <p>env 설정 가능 상태를 확인합니다. 이 패널은 DAG trigger를 실행하지 않습니다.</p>
          </div>
        </div>
        <button type="button" className="icon-link" onClick={refreshAirflowReadiness} disabled={state.loading} aria-label="Airflow readiness 새로고침">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>status</span>
          <strong>{status}</strong>
          <p>{readiness?.message || state.error || "Airflow readiness를 확인합니다."}</p>
        </article>
        <article>
          <span>DAG</span>
          <strong>{readiness?.dag_id || "asklake_week2_reviews"}</strong>
          <p>{readiness?.base_url || "base url 없음"}</p>
        </article>
        <article>
          <span>trigger</span>
          <strong>{readiness?.trigger_available ? "available" : "not available"}</strong>
          <p>fallback {readiness?.fallback_available ? "available" : "blocked"}</p>
        </article>
        <article>
          <span>result root</span>
          <strong>{readiness?.result_root_exists ? "exists" : "missing"}</strong>
          <p>{readiness?.result_root || "data/week2/_airflow_results"}</p>
        </article>
      </div>

      <div className="source-manage-grid">
        <section className={`wizard-inline-panel ${isConfigured ? "" : "muted-panel"}`}>
          <div className="table-title-line">
            {isConfigured ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <div>
              <strong>{isConfigured ? "Airflow env configured" : "Airflow env not configured"}</strong>
              <p>{isConfigured ? "DAG trigger metadata는 준비됐지만 여기서 실행하지 않습니다." : "airflow executor는 현재 local runner fallback으로 설명해야 합니다."}</p>
            </div>
          </div>
          <div className="source-manage-facts">
            <span>username</span>
            <strong>{readiness?.username_configured ? "configured" : "not set"}</strong>
            <span>password</span>
            <strong>{readiness?.password_configured ? "configured" : "not set"}</strong>
            <span>credential values</span>
            <strong>{readiness?.credential_values_exposed ? "exposed" : "not exposed"}</strong>
            <span>timeout</span>
            <strong>{formatMetric(readiness?.timeout_seconds)}s</strong>
          </div>
        </section>
        <section className="wizard-inline-panel">
          <div className="table-title-line">
            <ListChecks size={18} />
            <div>
              <strong>Required env</strong>
              <p>값 자체가 아니라 필요 항목만 표시합니다.</p>
            </div>
          </div>
          <div className="dataset-draft-list compact-list">
            {(readiness?.required_env || ["ASKLAKE_WEEK2_AIRFLOW_BASE_URL", "ASKLAKE_WEEK2_AIRFLOW_DAG_ID", "ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT"]).map((item) => (
              <div className="dataset-draft-item" key={item}>
                <strong>{item}</strong>
                <p>required for real Airflow trigger readiness</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {state.error ? (
        <div className="wizard-placeholder compact danger">
          <AlertCircle size={22} />
          <strong>{state.error}</strong>
        </div>
      ) : null}
    </section>
  );
}

function CatalogDatasetManagementPolicyPanel({ policy, publishedCount }) {
  const allowedActions = policy?.allowed_actions || ["detail", "ai_query_context"];
  const disabledActions = policy?.disabled_actions || ["metadata_update", "metadata_delete", "file_delete", "cascade_delete"];
  const referenceBlocking = policy?.reference_blocking || [
    "AI Query context와 lineage audit을 깨뜨리지 않기 위해 삭제 정책은 후속 Phase에서 분리합니다.",
  ];

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <ShieldCheck size={20} />
          <div>
            <strong>CatalogDataset Management Boundary</strong>
            <p>registered Gold Dataset은 현재 read-only evidence입니다. metadata 삭제와 실제 파일 삭제는 분리합니다.</p>
          </div>
        </div>
        <span className="badge slate">{publishedCount} registered</span>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>policy</span>
          <strong>{policy?.status || "read_only_boundary"}</strong>
          <p>상세 확인과 AI Query context 소비만 허용합니다.</p>
        </article>
        <article>
          <span>allowed</span>
          <strong>{allowedActions.join(", ")}</strong>
          <p>published CatalogDataset은 lineage/evidence anchor로 유지합니다.</p>
        </article>
        <article>
          <span>disabled</span>
          <strong>{disabledActions.join(", ")}</strong>
          <p>metadata-only 삭제, file delete, cascade delete는 같은 버튼으로 묶지 않습니다.</p>
        </article>
        <article>
          <span>file delete</span>
          <strong>{policy?.file_delete_policy || "never_without_explicit_human_confirmation"}</strong>
          <p>output parquet/jsonl evidence는 사람 확인 없이 삭제하지 않습니다.</p>
        </article>
      </div>

      <div className="dataset-draft-list compact-list">
        {referenceBlocking.map((item) => (
          <div className="dataset-draft-item" key={item}>
            <strong>Blocked rule</strong>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SparkReadinessPanel({ setNotice }) {
  const [state, setState] = useState({ loading: true, readiness: null, error: "" });

  async function refreshSparkReadiness() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const readiness = await getWeek2SparkReadiness();
      setState({ loading: false, readiness, error: "" });
    } catch (error) {
      setState({ loading: false, readiness: null, error: error.message });
      setNotice(`Spark readiness 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshSparkReadiness();
  }, []);

  const readiness = state.readiness;
  const status = readiness?.status || (state.loading ? "checking" : "unknown");
  const localReady = readiness?.local_smoke_available;
  const clusterReady = readiness?.distributed_cluster_available;
  const supportedSourceTypes = readiness?.supported_source_types || ["local_file"];
  const unsupportedSourceTypes = readiness?.unsupported_source_types || ["s3", "postgres", "mongodb", "kafka"];

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <Sparkles size={20} />
          <div>
            <strong>Spark Runner Readiness</strong>
            <p>local smoke와 distributed Spark cluster 실행 경계를 확인합니다. 이 패널은 Spark job을 시작하지 않습니다.</p>
          </div>
        </div>
        <button type="button" className="icon-link" onClick={refreshSparkReadiness} disabled={state.loading} aria-label="Spark readiness 새로고침">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>status</span>
          <strong>{status}</strong>
          <p>{readiness?.message || state.error || "Spark runner readiness를 확인합니다."}</p>
        </article>
        <article>
          <span>implementation</span>
          <strong>{readiness?.runner_implementation || "local_pyarrow_smoke"}</strong>
          <p>{readiness?.runner || "spark_runner"}</p>
        </article>
        <article>
          <span>local smoke</span>
          <strong>{localReady ? "available" : "blocked"}</strong>
          <p>pyarrow {readiness?.pyarrow_available ? "available" : "missing"}</p>
        </article>
        <article>
          <span>distributed cluster</span>
          <strong>{clusterReady ? "available" : "not available"}</strong>
          <p>{readiness?.spark_master || "master 미설정"}</p>
        </article>
      </div>

      <div className="source-manage-grid">
        <section className={localReady ? "wizard-inline-panel" : "wizard-inline-panel muted-panel"}>
          <div className="table-title-line">
            {localReady ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <div>
              <strong>{localReady ? "Local smoke ready" : "Local smoke blocked"}</strong>
              <p>{readiness?.boundary || "Spark runner는 현재 local_file smoke 중심이며 대용량 ETL 재실행은 하지 않습니다."}</p>
            </div>
          </div>
          <div className="source-manage-facts">
            <span>pyspark</span>
            <strong>{readiness?.pyspark_available ? "available" : "not detected"}</strong>
            <span>java</span>
            <strong>{readiness?.java_available ? "available" : "not detected"}</strong>
            <span>cluster env</span>
            <strong>{readiness?.cluster_configured ? "configured" : "not set"}</strong>
            <span>output</span>
            <strong>{readiness?.output_format || "parquet"}</strong>
          </div>
        </section>
        <section className="wizard-inline-panel">
          <div className="table-title-line">
            <ListChecks size={18} />
            <div>
              <strong>Source type boundary</strong>
              <p>현재 smoke에서 실제 처리 가능한 source와 후속 source를 분리합니다.</p>
            </div>
          </div>
          <div className="dataset-draft-list compact-list">
            <div className="dataset-draft-item">
              <strong>Supported: {supportedSourceTypes.join(", ")}</strong>
              <p>formats {(readiness?.supported_input_formats || ["json", "jsonl", "parquet"]).join(", ")}</p>
            </div>
            <div className="dataset-draft-item">
              <strong>Deferred: {unsupportedSourceTypes.join(", ")}</strong>
              <p>S3/DB/Kafka Spark read는 별도 connector/credential/cluster Phase가 필요합니다.</p>
            </div>
            <div className="dataset-draft-item">
              <strong>L6 preview operations</strong>
              <p>{(readiness?.l6_preview_supported_operations || []).slice(0, 8).join(", ") || "contract 확인 중"}</p>
            </div>
          </div>
        </section>
      </div>

      {state.error ? (
        <div className="wizard-placeholder compact danger">
          <AlertCircle size={22} />
          <strong>{state.error}</strong>
        </div>
      ) : null}
    </section>
  );
}

function KafkaReplayEvidencePanel({ setNotice }) {
  const [state, setState] = useState({
    loading: true,
    health: null,
    runs: [],
    selectedRun: null,
    error: "",
  });

  async function refreshKafkaReplay() {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const [health, runPayload] = await Promise.all([getKafkaReplayHealth(), listKafkaReplayRuns()]);
      const runs = runPayload?.runs || [];
      setState({
        loading: false,
        health,
        runs,
        selectedRun: runs[0] || null,
        error: "",
      });
    } catch (error) {
      setState({ loading: false, health: null, runs: [], selectedRun: null, error: error.message });
      setNotice(`Kafka replay evidence 조회 실패: ${error.message}`);
    }
  }

  useEffect(() => {
    refreshKafkaReplay();
  }, []);

  async function openReplayRun(runId) {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const run = await getKafkaReplayRun(runId);
      setState((current) => ({ ...current, loading: false, selectedRun: run, error: "" }));
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error: error.message }));
      setNotice(`Kafka replay run 조회 실패: ${error.message}`);
    }
  }

  const health = state.health;
  const selectedRun = state.selectedRun;
  const metrics = selectedRun?.metrics || {};
  const lineage = selectedRun?.lineage || {};
  const isMissingEvidence = health?.status === "missing_evidence" || (!state.loading && state.runs.length === 0);

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <Network size={20} />
          <div>
            <strong>Kafka Replay Evidence</strong>
            <p>M4 replay receipt 조회 전용입니다. 실제 Kafka consume/produce trigger는 실행하지 않습니다.</p>
          </div>
        </div>
        <button type="button" className="icon-link" onClick={refreshKafkaReplay} disabled={state.loading} aria-label="Kafka replay evidence 새로고침">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>health</span>
          <strong>{health?.status || (state.loading ? "checking" : "unknown")}</strong>
          <p>{health?.message || state.error || "Kafka replay evidence 상태를 확인합니다."}</p>
        </article>
        <article>
          <span>topic</span>
          <strong>{health?.topic || "-"}</strong>
          <p>{health?.latest_run_id || "latest run 없음"}</p>
        </article>
        <article>
          <span>sent rows</span>
          <strong>{formatMetric(health?.sent_rows)}</strong>
          <p>errors {formatMetric(health?.error_count)}</p>
        </article>
        <article>
          <span>throughput</span>
          <strong>{formatMetric(health?.throughput_per_second)}</strong>
          <p>progress {formatMetric(health?.progress_percent)}%</p>
        </article>
      </div>

      {isMissingEvidence ? (
        <div className="wizard-placeholder compact">
          <AlertCircle size={22} />
          <strong>Kafka replay evidence 없음</strong>
          <p>{health?.evidence_dir || "data/results/week2/_metadata/kafka_replay"} 아래에 replay receipt가 아직 없습니다.</p>
        </div>
      ) : null}

      {selectedRun ? (
        <div className="source-manage-grid">
          <section className="wizard-inline-panel">
            <div className="table-title-line">
              <FileJson size={18} />
              <div>
                <strong>{selectedRun.run_id}</strong>
                <p>{selectedRun.status} · {selectedRun.topic}</p>
              </div>
            </div>
            <div className="source-manage-facts">
              <span>source</span>
              <strong>{selectedRun.source_file || "-"}</strong>
              <span>target</span>
              <strong>{lineage.target_ref || lineage.kafka_topic || "-"}</strong>
              <span>started</span>
              <strong>{selectedRun.started_at || "-"}</strong>
              <span>finished</span>
              <strong>{selectedRun.finished_at || "-"}</strong>
            </div>
          </section>
          <section className="wizard-inline-panel">
            <div className="table-title-line">
              <BarChart3 size={18} />
              <div>
                <strong>Replay metrics</strong>
                <p>durable receipt 기준, broker live lag가 아닙니다.</p>
              </div>
            </div>
            <div className="source-manage-facts">
              <span>sent_rows</span>
              <strong>{formatMetric(metrics.sent_rows)}</strong>
              <span>failed_rows</span>
              <strong>{formatMetric(metrics.failed_rows)}</strong>
              <span>processed_bytes</span>
              <strong>{formatMetric(formatBytes(metrics.processed_bytes))}</strong>
              <span>duration</span>
              <strong>{formatMetric(metrics.duration_ms)}ms</strong>
            </div>
          </section>
        </div>
      ) : null}

      {state.runs.length > 0 ? (
        <div className="operational-record-list">
          {state.runs.map((run) => (
            <article className="operational-record" key={run.run_id}>
              <div>
                <div className="table-title-line">
                  <Route size={17} />
                  <div>
                    <strong>{run.run_id}</strong>
                    <p>{run.status || "unknown"} · {run.topic || "topic 없음"}</p>
                  </div>
                </div>
                <small>
                  sent {formatMetric(run.metrics?.sent_rows)} · errors {formatMetric(run.metrics?.error_count)} · {run.updated_at || run.finished_at || "-"}
                </small>
              </div>
              <button type="button" className="ghost-action" onClick={() => openReplayRun(run.run_id)} disabled={state.loading}>
                Evidence 보기
                <FileCheck2 size={15} />
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {state.error ? (
        <div className="wizard-placeholder compact danger">
          <AlertCircle size={22} />
          <strong>{state.error}</strong>
        </div>
      ) : null}
    </section>
  );
}

function runOutputModeLabel(run) {
  if (run?.runtime_evidence?.executor_status === "readiness_only") {
    return `${executorLabel(run.executor_handoff)} readiness`;
  }
  if (run?.runtime_evidence?.materialization_mode === "prepared_gold_reference") {
    return "prepared parquet reference";
  }
  if (run?.runtime_evidence?.materialization_mode === "silver_parquet_to_gold") {
    return "Silver parquet to Gold";
  }
  if (run?.runtime_evidence?.materialization_mode === "local_demo_jsonl") {
    return "local demo JSONL";
  }
  return "local materialization";
}

export function VisualEditorPage({ navigate, setNotice }) {
  const [selectedNode, setSelectedNode] = useState("Source");
  const canvasNodes = [
    ["Source", "Amazon Reviews JSON", "left"],
    ["Select", "필드 선택", "center"],
    ["Cast", "rating, review_time", "center"],
    ["Aggregate", "product_id별 metric", "center"],
    ["Load", "dataset_reviews_gold", "right"],
  ];

  return (
    <div className="visual-editor-shell">
      <header className="visual-toolbar">
        <button type="button" className="ghost-action" onClick={() => navigate("/sources")}>
          <ArrowLeft size={16} />
          데이터셋
        </button>
        <div>
          <h2>파이프라인 시각 편집</h2>
          <p>기준 데모의 canvas flow를 M1 static shell로 보존합니다.</p>
        </div>
        <div className="toolbar-actions">
          <button type="button" className="ghost-action" onClick={() => setNotice("M1에서는 저장 API를 호출하지 않습니다.")}>
            <Save size={16} />
            저장 대기
          </button>
          <button type="button" className="primary-action" onClick={() => setNotice("M5 ExecutionResult 연결 전에는 실행하지 않습니다.")}>
            <Play size={16} />
            실행 대기
          </button>
        </div>
      </header>
      <section className="visual-body">
        <aside className="node-palette">
          <strong>노드 팔레트</strong>
          {["Source", "Select Fields", "Filter", "Cast", "Aggregate", "Load"].map((item) => (
            <button key={item} type="button" onClick={() => setSelectedNode(item)}>
              <Plus size={14} />
              {item}
            </button>
          ))}
        </aside>
        <div className="canvas-board">
          {canvasNodes.map(([type, label, lane], index) => (
            <button
              type="button"
              className={`canvas-node ${selectedNode === type ? "active" : ""} ${lane}`}
              key={type}
              onClick={() => setSelectedNode(type)}
            >
              <span>{index + 1}</span>
              <strong>{type}</strong>
              <small>{label}</small>
            </button>
          ))}
          <div className="canvas-line one" />
          <div className="canvas-line two" />
          <div className="canvas-line three" />
        </div>
        <aside className="properties-panel">
          <strong>Properties</strong>
          <p>{selectedNode} 설정은 후속 모듈 연결 후 실제 form으로 교체됩니다.</p>
          <InfoCard title="Contract" value="WorkflowDefinition" detail="M5 owner" />
        </aside>
      </section>
    </div>
  );
}

const m5ExecutorOptions = [
  {
    id: "local_runner",
    title: "Local runner",
    detail: "backend 내부 runner가 sample JSONL을 읽고 gold output과 Catalog를 만든다.",
    badge: "가장 안정적인 학습 경로",
  },
  {
    id: "airflow",
    title: "Airflow",
    detail: "Airflow DAG를 트리거하고 shared result artifact를 backend가 다시 읽는다.",
    badge: "Docker/Airflow 필요",
  },
];

const m5CoreFlow = [
  {
    icon: Workflow,
    eyebrow: "1. 실행 계약",
    title: "WorkflowDefinition",
    plain: "무슨 pipeline을 어떤 순서로 실행할지 정한 약속입니다.",
    focus: "pipeline_id, node 순서",
  },
  {
    icon: ServerCog,
    eyebrow: "2. 실행",
    title: "Runner",
    plain: "local_runner 또는 Airflow가 실제 실행을 담당합니다.",
    focus: "executor, status, logs",
  },
  {
    icon: FileCheck2,
    eyebrow: "3. 결과 파일",
    title: "Output Artifact",
    plain: "실행 결과로 gold dataset 파일과 위치가 생깁니다.",
    focus: "dataset_id, output URI",
  },
  {
    icon: FolderOpen,
    eyebrow: "4. 카탈로그",
    title: "CatalogMetadata",
    plain: "M6/Query가 읽을 metadata로 output 증거가 등록됩니다.",
    focus: "lineage.run_id, row_count",
  },
];

const m5MustKnowItems = [
  {
    title: "M5의 핵심 기능",
    body: "workflow를 실행하고, 실행 증거와 catalog metadata를 남긴다.",
  },
  {
    title: "검증 기준",
    body: "같은 run_id가 ExecutionResult, output, CatalogMetadata에 이어져야 한다.",
  },
  {
    title: "주의할 상태",
    body: "`fallback_succeeded`는 성공처럼 보여도 어떤 executor에서 왜 fallback됐는지 로그로 확인해야 한다.",
  },
  {
    title: "학습 목표",
    body: "화면을 보고 M5가 통합 전에 어디까지 동작하는지 세 문장으로 설명한다.",
  },
];

const m5WorkflowLearningSteps = [
  {
    id: "node_source_reviews",
    type: "Source",
    label: "Amazon Reviews JSON",
    lesson: "입력 JSONL을 읽습니다.",
  },
  {
    id: "node_filter_reviews",
    type: "Select/Filter",
    label: "필드 선택",
    lesson: "분석에 필요한 column만 남깁니다.",
  },
  {
    id: "node_normalize_reviews",
    type: "Cast/Normalize",
    label: "타입 정리",
    lesson: "Catalog schema로 이어질 타입을 맞춥니다.",
  },
  {
    id: "node_aggregate_reviews",
    type: "Aggregate",
    label: "product별 집계",
    lesson: "review_count와 average_rating을 만듭니다.",
  },
  {
    id: "node_load_reviews",
    type: "Load",
    label: WEEK2_DEFAULT_DATASET_ID,
    lesson: "gold output과 CatalogMetadata를 남깁니다.",
  },
];


function runBadgeClass(status) {
  if (status === "succeeded") return "green";
  if (status === "fallback_succeeded") return "orange";
  if (status === "failed" || status === "fallback_failed") return "orange";
  return "blue";
}

function isFallbackRun(run) {
  const status = run?.status || "";
  const logs = run?.logs || [];
  return status.startsWith("fallback") || logs.some((log) => String(log.message || "").toLowerCase().includes("falling back"));
}

function isSuccessfulRun(run) {
  return run?.status === "succeeded" || run?.status === "fallback_succeeded";
}

function statusMeaning(run) {
  if (!run) return "아직 실행 전입니다.";
  if (run.executor === "local_runner" && run.status === "fallback_succeeded") {
    return "local runner가 local fallback output 경로로 정상 산출물을 만들었다는 뜻입니다.";
  }
  if (run.executor === "airflow" && run.status === "fallback_succeeded") {
    return "Airflow 실행은 실패했고 local runner fallback이 대신 성공했다는 뜻입니다.";
  }
  if (run.executor === "airflow" && run.status === "succeeded" && !isFallbackRun(run)) {
    return "Airflow DAG 실행이 fallback 없이 성공했다는 뜻입니다.";
  }
  if (run.status === "succeeded") return "선택한 runner가 성공 결과를 반환했다는 뜻입니다.";
  return "성공으로 해석하지 말고 task_results와 logs를 먼저 봐야 합니다.";
}

function checkStateLabel(state) {
  if (state === "pass") return "확인됨";
  if (state === "warn") return "주의";
  return "대기";
}

function buildM5LearningChecks(run, catalog) {
  const output = run?.outputs?.[0];
  const catalogRunId = catalog?.lineage?.run_id;
  const catalogMatchesRun = Boolean(run?.run_id && catalogRunId === run.run_id);
  const hasOutput = Boolean(output?.dataset_id && output?.uri);
  const successful = isSuccessfulRun(run);

  return [
    {
      id: "run",
      state: run?.run_id ? "pass" : "wait",
      title: "Run ID가 생겼나",
      value: run?.run_id || "실행 전",
      detail: "run_id는 이 실험에서 모든 evidence를 묶는 기준키입니다.",
    },
    {
      id: "status",
      state: !run ? "wait" : successful ? "pass" : "warn",
      title: "status를 제대로 해석했나",
      value: run?.status || "not_run",
      detail: statusMeaning(run),
    },
    {
      id: "output",
      state: !run ? "wait" : hasOutput ? "pass" : "warn",
      title: "output dataset이 생겼나",
      value: output?.dataset_id || "아직 없음",
      detail: output?.uri || "ExecutionResult.outputs에서 dataset과 path를 확인합니다.",
    },
    {
      id: "catalog",
      state: !run ? "wait" : catalogMatchesRun ? "pass" : "warn",
      title: "Catalog가 같은 run을 가리키나",
      value: catalogRunId || "아직 없음",
      detail: catalogMatchesRun
        ? "CatalogMetadata.lineage.run_id가 현재 run_id와 같습니다."
        : "Catalog가 비었거나 이전 성공 run을 가리킬 수 있습니다.",
    },
  ];
}

function buildM5Narrative(run, catalog) {
  if (!run) {
    return [
      `M5는 ${WEEK2_DEFAULT_PIPELINE_ID} workflow를 실행하는 모듈입니다.`,
      "실행 전에는 run_id, output, catalog evidence가 아직 없습니다.",
      "`local_runner 실행`을 누른 뒤 같은 run_id가 어디까지 이어지는지 확인합니다.",
    ];
  }

  const output = run.outputs?.[0];
  const catalogRunId = catalog?.lineage?.run_id;
  const catalogSentence = catalogRunId === run.run_id
    ? `CatalogMetadata도 같은 run_id(${catalogRunId})를 가리킵니다.`
    : `CatalogMetadata는 아직 현재 run_id(${run.run_id})와 완전히 연결됐다고 볼 수 없습니다.`;

  return [
    `M5는 ${WEEK2_DEFAULT_PIPELINE_ID}를 ${run.executor}로 실행했고 run_id는 ${run.run_id}입니다.`,
    `status는 ${run.status}입니다. ${statusMeaning(run)}`,
    `output은 ${output?.dataset_id || "아직 없음"}이고, ${catalogSentence}`,
  ];
}

function runInterpretation(run, catalog) {
  if (!run) {
    return {
      title: "아직 실행 전입니다",
      body: "지금 볼 핵심은 4개입니다. run_id가 생기는지, status를 어떻게 해석해야 하는지, output이 생기는지, Catalog가 같은 run_id를 가리키는지 확인합니다.",
      tone: "neutral",
    };
  }

  const catalogRunId = catalog?.lineage?.run_id;
  const catalogLineage = catalogRunId === run.run_id ? "Catalog lineage도 이번 run을 가리킵니다." : "Catalog는 아직 이번 run을 가리키지 않거나 이전 성공 run을 보여줄 수 있습니다.";

  if (run.status === "succeeded" && run.executor === "airflow" && !isFallbackRun(run)) {
    return {
      title: "Airflow 경로가 실제로 성공했습니다",
      body: `DAG 실행 결과를 backend adapter가 읽었고, fallback 없이 succeeded가 되었습니다. ${catalogLineage}`,
      tone: "success",
    };
  }

  if (run.executor === "local_runner" && isSuccessfulRun(run)) {
    return {
      title: "Local runner가 output과 Catalog evidence를 만들었습니다",
      body: `이 경로의 핵심은 Airflow가 아니라 local runner가 demo output을 만들었는지입니다. ${statusMeaning(run)} ${catalogLineage}`,
      tone: "success",
    };
  }

  if (run.executor === "airflow" && run.status === "fallback_succeeded") {
    return {
      title: "Airflow는 실패했고 local fallback이 성공했습니다",
      body: "데모 API는 사용성을 위해 fallback을 허용하지만, Airflow 자체 성공으로 해석하면 안 됩니다. log에서 falling back 메시지를 확인하세요.",
      tone: "warning",
    };
  }

  if (run.status === "succeeded") {
    return {
      title: "Runner 경로가 성공했습니다",
      body: `선택한 executor가 output과 실행 증거를 반환했습니다. ${catalogLineage}`,
      tone: "success",
    };
  }

  return {
    title: "실행이 실패했거나 아직 끝나지 않았습니다",
    body: "이 상태는 성공처럼 보여주지 않습니다. task_results와 logs에서 실패 위치를 먼저 확인해야 합니다.",
    tone: "warning",
  };
}

function findTaskForStep(tasks, stepId) {
  return tasks.find((task) => task.node_id === stepId) || null;
}

function compactJson(value) {
  if (!value) return "{}";
  return JSON.stringify(value, null, 2);
}

function useWeek2CatalogState(datasetId = WEEK2_DEFAULT_DATASET_ID) {
  const [catalogState, setCatalogState] = useState({
    catalog: null,
    error: "",
    loading: true,
  });

  async function refreshCatalog() {
    setCatalogState((previous) => ({ ...previous, error: "", loading: true }));
    try {
      const catalog = await getWeek2Catalog(datasetId);
      setCatalogState({ catalog, error: "", loading: false });
    } catch (error) {
      setCatalogState((previous) => ({
        catalog: previous.catalog,
        error: error.message,
        loading: false,
      }));
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const catalog = await getWeek2Catalog(datasetId);
        if (isMounted) setCatalogState({ catalog, error: "", loading: false });
      } catch (error) {
        if (isMounted) setCatalogState({ catalog: null, error: error.message, loading: false });
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [datasetId]);

  return { catalogState, refreshCatalog };
}

function useLiveCatalogDatasetState(preferredDatasetId) {
  const [catalogState, setCatalogState] = useState({
    catalog: null,
    count: 0,
    error: "",
    loading: true,
  });

  async function refreshCatalog() {
    setCatalogState((previous) => ({ ...previous, error: "", loading: true }));
    try {
      const datasets = await listCatalogDatasets();
      const publishedGoldDatasets = datasets.filter(
        (dataset) => dataset.source_type === "target_dataset_job_run" && dataset.status === "ready",
      );
      const selectedCatalog =
        publishedGoldDatasets.find((dataset) => dataset.id === preferredDatasetId) || publishedGoldDatasets[0] || null;
      setCatalogState({
        catalog: selectedCatalog,
        count: publishedGoldDatasets.length,
        error: "",
        loading: false,
      });
    } catch (error) {
      setCatalogState((previous) => ({
        ...previous,
        error: error.message,
        loading: false,
      }));
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCatalogDatasets() {
      try {
        const datasets = await listCatalogDatasets();
        if (!isMounted) return;
        const publishedGoldDatasets = datasets.filter(
          (dataset) => dataset.source_type === "target_dataset_job_run" && dataset.status === "ready",
        );
        const selectedCatalog =
          publishedGoldDatasets.find((dataset) => dataset.id === preferredDatasetId) || publishedGoldDatasets[0] || null;
        setCatalogState({
          catalog: selectedCatalog,
          count: publishedGoldDatasets.length,
          error: "",
          loading: false,
        });
      } catch (error) {
        if (isMounted) {
          setCatalogState((previous) => ({
            ...previous,
            error: error.message,
            loading: false,
          }));
        }
      }
    }

    loadCatalogDatasets();
    return () => {
      isMounted = false;
    };
  }, [preferredDatasetId]);

  return { catalogState, refreshCatalog };
}

function productHealthReadiness(catalog, error, loading) {
  const hasCatalog = Boolean(catalog);
  const hasLocalPath = Boolean(catalog?.storage?.local_fallback_path);
  const hasAllowedColumns = Boolean(catalog?.query?.allowed_columns?.length);
  const allowsReadonlySql = Boolean(catalog?.query?.allow_readonly_sql);
  const hasLineage = Boolean(catalog?.lineage?.run_id);
  const ready = hasCatalog && hasLocalPath && hasAllowedColumns && allowsReadonlySql && hasLineage;

  if (loading) {
    return {
      status: "checking",
      title: "Product Health Gold 확인 중",
      body: `${PRODUCT_HEALTH_DATASET_ID} CatalogMetadata를 조회하고 있습니다.`,
      checks: [
        ["CatalogMetadata", "checking", "M5 Catalog 조회 중"],
        ["Gold local path", "checking", "storage.local_fallback_path 확인 중"],
        ["Query contract", "checking", "allowlist 확인 중"],
        ["Lineage", "checking", "run_id 확인 중"],
      ],
    };
  }

  if (!hasCatalog) {
    const missingBody = `${PRODUCT_HEALTH_DATASET_ID} CatalogMetadata가 없습니다. M2/M3/M5가 gold_product_health output과 Catalog lineage를 먼저 닫아야 합니다.`;
    return {
      status: "missing",
      title: "Product Health Gold가 아직 준비되지 않았습니다",
      body: error ? `${missingBody} (${error})` : missingBody,
      checks: [
        ["CatalogMetadata", "missing", "M5 Catalog 등록 필요"],
        ["Gold output", "missing", "M3 TransformSpec과 M2 runtime output 필요"],
        ["Query evidence", "missing", "M6가 읽을 local fallback path 없음"],
        ["Next owner", "missing", "M2/M3/M5 통합 후 M1 재확인"],
      ],
    };
  }

  return {
    status: ready ? "ready" : "partial",
    title: ready ? "Product Health Gold query 준비됨" : "Product Health Gold evidence가 일부 부족합니다",
    body: ready
      ? "CatalogMetadata, lineage, local fallback path, readonly SQL allowlist가 모두 보입니다."
      : "Catalog는 보이지만 local path, allowed columns, lineage 중 일부가 빠져 있어 성공으로 표시하지 않습니다.",
    checks: [
      ["CatalogMetadata", "ready", catalog.dataset_id],
      ["Gold local path", hasLocalPath ? "ready" : "missing", catalog.storage?.local_fallback_path || "storage.local_fallback_path 필요"],
      ["Query contract", hasAllowedColumns && allowsReadonlySql ? "ready" : "missing", catalog.query?.table_name || "allowed_columns 또는 allow_readonly_sql 필요"],
      ["Lineage", hasLineage ? "ready" : "missing", catalog.lineage?.run_id || "M5 lineage.run_id 필요"],
    ],
  };
}

function liveCatalogDatasetReadiness(catalog, error, loading, count, preferredDatasetId) {
  const hasCatalog = Boolean(catalog);
  const schemaFields = catalog?.schema || [];
  const hasLocalPath = Boolean(catalog?.storage?.local_path || catalog?.path);
  const hasAllowedColumns = schemaFields.length > 0;
  const hasLineage = Boolean(catalog?.lineage?.run_id);
  const ready = hasCatalog && hasLocalPath && hasAllowedColumns && hasLineage;

  if (loading) {
    return {
      status: "checking",
      eyebrow: "Live catalog readiness",
      title: "Published Gold Dataset 확인 중",
      body: "CatalogDataset 목록에서 AI Query가 사용할 Gold output을 찾고 있습니다.",
      checks: [
        ["CatalogDataset", "checking", "published catalog 조회 중"],
        ["Gold local path", "checking", "storage.local_path 확인 중"],
        ["Query columns", "checking", "schema columns 확인 중"],
        ["Lineage", "checking", "run_id 확인 중"],
      ],
    };
  }

  if (!hasCatalog) {
    const targetLabel = preferredDatasetId ? ` (${preferredDatasetId})` : "";
    return {
      status: "missing",
      eyebrow: "Live catalog readiness",
      title: "Published Gold Dataset이 아직 없습니다",
      body: error
        ? `CatalogDataset 조회 실패: ${error}`
        : `Catalog 등록된 Target Dataset${targetLabel}을 찾지 못했습니다. 실행 기록에서 succeeded run을 Catalog 등록하면 여기에 표시됩니다.`,
      checks: [
        ["CatalogDataset", "missing", count ? `${count} published items, 선택 dataset 없음` : "published target dataset 없음"],
        ["Gold local path", "missing", "storage.local_path 필요"],
        ["Query columns", "missing", "schema columns 필요"],
        ["Lineage", "missing", "run_id 필요"],
      ],
    };
  }

  return {
    status: ready ? "ready" : "partial",
    eyebrow: "Live catalog readiness",
    title: ready ? `${catalog.name} query 준비됨` : `${catalog.name} evidence가 일부 부족합니다`,
    body: ready
      ? "Published CatalogDataset의 local path, schema columns, lineage가 AI Query context와 연결되어 있습니다."
      : "CatalogDataset은 보이지만 local path, schema columns, lineage 중 일부가 부족합니다.",
    checks: [
      ["CatalogDataset", "ready", catalog.id],
      ["Gold local path", hasLocalPath ? "ready" : "missing", catalog.storage?.local_path || catalog.path || "storage.local_path 필요"],
      ["Query columns", hasAllowedColumns ? "ready" : "missing", schemaFields.map((field) => field.name).join(", ") || "schema columns 필요"],
      ["Lineage", hasLineage ? "ready" : "missing", catalog.lineage?.run_id || "run_id 필요"],
    ],
  };
}

function demoReadinessItems(readiness) {
  const checkState = Object.fromEntries(readiness.checks.map(([label, state, detail]) => [label, { state, detail }]));
  const catalogReady = checkState.CatalogMetadata?.state === "ready";
  const goldOutputReady = checkState["Gold output"]?.state === "ready" || checkState["Gold local path"]?.state === "ready";
  const lineageReady = checkState.Lineage?.state === "ready";
  const queryReady = readiness.status === "ready";

  return [
    {
      module: "M2",
      label: "Runtime evidence",
      state: goldOutputReady ? "ready" : readiness.status === "checking" ? "unknown" : "not-ready",
      detail: goldOutputReady ? "Gold output local path 확인됨" : "source별 runtime output evidence 대기",
    },
    {
      module: "M3",
      label: "Gold semantics",
      state: goldOutputReady ? "unknown" : "not-ready",
      detail: goldOutputReady ? "metric 의미 최종 확인 필요" : "gold_product_health TransformSpec/output 대기",
    },
    {
      module: "M5",
      label: "Catalog lineage",
      state: catalogReady && lineageReady ? "ready" : readiness.status === "checking" ? "unknown" : "not-ready",
      detail: catalogReady && lineageReady ? "CatalogMetadata와 run_id 확인됨" : "dataset_product_health_gold Catalog lineage 대기",
    },
    {
      module: "M6",
      label: "SQL evidence",
      state: queryReady ? "ready" : readiness.status === "checking" ? "unknown" : "blocked",
      detail: queryReady ? "readonly SQL + local fallback 실행 가능" : "Product Health SQL success smoke 대기",
    },
    {
      module: "M1",
      label: "Browser smoke",
      state: "ready",
      detail: "CTA/readiness UI smoke 가능, 실제 SQL success는 upstream 준비 후 재확인",
    },
  ];
}

function catalogQualityRows(catalog) {
  return Object.entries(catalog?.metrics?.quality || {}).map(([key, value]) => [
    key,
    formatMetric(value),
  ]);
}

function catalogSchemaRows(catalog) {
  return (catalog?.schema?.fields || []).map((field) => [
    field.name,
    field.type,
    formatMetric(field.nullable),
  ]);
}

function catalogLineageNodes(catalog) {
  const lineage = catalog?.lineage || {};
  return [
    ["Source", (lineage.source_ids || []).join(", ") || "-"],
    ["Upstream", (lineage.upstream_datasets || []).join(", ") || "-"],
    ["Pipeline", lineage.pipeline_id || "-"],
    ["Run", lineage.run_id || "-"],
    ["Dataset", catalog?.dataset_id || "-"],
  ];
}

function RunStatusPage({ navigate }) {
  const [executor, setExecutor] = useState("local_runner");
  const [runState, setRunState] = useState({
    error: "",
    loading: false,
    run: null,
  });
  const [catalogState, setCatalogState] = useState({
    catalog: null,
    error: "",
    loading: false,
  });

  const currentRun = runState.run;
  const currentCatalog = catalogState.catalog;
  const currentTaskResults = currentRun?.task_results || [];
  const currentOutputs = currentRun?.outputs || [];
  const interpretation = runInterpretation(currentRun, currentCatalog);
  const catalogMatchesRun = Boolean(currentRun?.run_id && currentCatalog?.lineage?.run_id === currentRun.run_id);
  const fallback = isFallbackRun(currentRun);
  const learningChecks = buildM5LearningChecks(currentRun, currentCatalog);
  const narrative = buildM5Narrative(currentRun, currentCatalog);

  async function loadWeek2Catalog() {
    setCatalogState((current) => ({ ...current, error: "", loading: true }));
    try {
      const catalog = await getWeek2Catalog(WEEK2_DEFAULT_DATASET_ID);
      setCatalogState({ catalog, error: "", loading: false });
      return catalog;
    } catch (error) {
      setCatalogState((current) => ({
        catalog: current.catalog,
        error: error.message,
        loading: false,
      }));
      return null;
    }
  }

  async function executeWeek2Run() {
    setRunState({ error: "", loading: true, run: currentRun });
    try {
      const run = await triggerWeek2Run(WEEK2_DEFAULT_PIPELINE_ID, {
        executor,
        triggeredBy: executor === "airflow" ? "m5_airflow_demo" : "m5_local_demo",
      });
      setRunState({ error: "", loading: false, run });
      await loadWeek2Catalog();
    } catch (error) {
      setRunState({ error: error.message, loading: false, run: currentRun });
    }
  }

  async function refreshWeek2Evidence() {
    setRunState({ error: "", loading: true, run: currentRun });
    try {
      const run = currentRun?.run_id ? await getWeek2Run(currentRun.run_id) : currentRun;
      setRunState({ error: "", loading: false, run });
      await loadWeek2Catalog();
    } catch (error) {
      setRunState({ error: error.message, loading: false, run: currentRun });
      await loadWeek2Catalog();
    }
  }

  return (
    <div className="page-stack m5-demo-page">
      <PageHeader
        title="M5 데모: 실행 결과가 Catalog가 되는 과정"
        body="M5의 핵심은 workflow를 실행하고, 그 결과가 output과 Catalog metadata로 이어졌는지 증명하는 것입니다."
        actionLabel="Catalog 화면"
        onAction={() => navigate("/catalog")}
      />

      <section className="m5-focus-hero">
        <div className="m5-focus-copy">
          <p className="eyebrow">M5 핵심 기능</p>
          <h3>workflow를 실행해서 `ExecutionResult`를 만들고, 그 output을 `CatalogMetadata`로 등록합니다.</h3>
          <p>
            이 데모에서 외워야 할 것은 많지 않습니다. 같은 `run_id`가 실행 결과, output,
            catalog lineage까지 이어지면 M5 독립 기능은 성공적으로 설명할 수 있습니다.
          </p>
        </div>
        <M5EssentialList />
      </section>

      <M5CoreFlowMap run={currentRun} catalog={currentCatalog} />

      <section className="m5-control-panel m5-run-console">
        <div className="m5-section-heading">
          <div>
            <p className="eyebrow">실험 1</p>
            <h3>executor를 고르고 run_id를 만듭니다</h3>
          </div>
          <span className={`badge ${runBadgeClass(currentRun?.status)}`}>{currentRun?.status || "not_run"}</span>
        </div>
        <div className="m5-executor-grid" role="radiogroup" aria-label="M5 executor 선택">
          {m5ExecutorOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              className={`m5-executor-option ${executor === option.id ? "active" : ""}`}
              onClick={() => setExecutor(option.id)}
              aria-pressed={executor === option.id}
            >
              <span className="m5-option-icon">
                {option.id === "airflow" ? <Network size={18} /> : <ServerCog size={18} />}
              </span>
              <strong>{option.title}</strong>
              <small>{option.detail}</small>
              <em>{option.badge}</em>
            </button>
          ))}
        </div>
        <div className="m5-action-row">
          <button type="button" className="primary-action" onClick={executeWeek2Run} disabled={runState.loading}>
            {runState.loading ? <Loader2 size={16} /> : <Play size={16} />}
            {runState.loading ? "실행 중" : `${executor} 실행`}
          </button>
          <button type="button" className="ghost-action" onClick={refreshWeek2Evidence} disabled={runState.loading || catalogState.loading}>
            <RefreshCw size={16} />
            evidence 새로고침
          </button>
        </div>
      </section>

      {runState.error ? (
        <EmptyState
          icon={AlertCircle}
          title="M5 실행 결과를 불러오지 못했습니다"
          body={runState.error}
        />
      ) : null}

      <section className={`m5-interpretation ${interpretation.tone}`}>
        <div className="m5-interpretation-icon">
          {interpretation.tone === "success" ? <CheckCircle2 size={22} /> : interpretation.tone === "warning" ? <AlertCircle size={22} /> : <BookOpen size={22} />}
        </div>
        <div>
          <p className="eyebrow">Result interpretation</p>
          <h3>{interpretation.title}</h3>
          <p>{interpretation.body}</p>
        </div>
      </section>

      {currentRun ? (
        <section className="demo-handoff-panel">
          <div>
            <p className="eyebrow">Next demo step</p>
            <h3>CatalogMetadata 확인으로 이동</h3>
            <p>{currentRun.run_id} 실행 결과가 만든 dataset metadata를 확인한 뒤 AI Query로 이어갑니다.</p>
          </div>
          <div className="handoff-actions">
            <button type="button" className="primary-action" onClick={() => navigate(WEEK2_DEFAULT_CATALOG_DETAIL_URL)}>
              Catalog detail
              <ArrowRight size={16} />
            </button>
            <button type="button" className="ghost-action" onClick={() => navigate("/ask")}>
              AI Query
              <MessageSquareText size={16} />
            </button>
          </div>
        </section>
      ) : null}

      <M5VerdictPanel checks={learningChecks} />
      <M5NarrativePanel sentences={narrative} />

      <section className="m5-evidence-section m5-compact-workflow">
        <div className="m5-section-heading">
          <div>
            <p className="eyebrow">실험 2</p>
            <h3>처리 흐름은 5단계로만 읽습니다</h3>
          </div>
          <span className={`badge ${fallback ? "orange" : "blue"}`}>{fallback ? "fallback visible" : "runner evidence"}</span>
        </div>
        <M5WorkflowTimeline taskResults={currentTaskResults} />
      </section>

      <section className="m5-two-column m5-evidence-layout">
        <M5EvidenceBoard
          run={currentRun}
          catalog={currentCatalog}
          taskResults={currentTaskResults}
          outputs={currentOutputs}
          catalogMatchesRun={catalogMatchesRun}
        />

        <CatalogEvidencePanel
          catalog={currentCatalog}
          loading={catalogState.loading}
          error={catalogState.error}
          currentRunId={currentRun?.run_id}
          onRefresh={loadWeek2Catalog}
        />
      </section>

      {currentRun?.logs?.length ? (
        <section className="m5-evidence-section">
          <div className="m5-section-heading">
            <div>
              <p className="eyebrow">Step 4</p>
              <h3>로그로 성공과 fallback을 구분합니다</h3>
            </div>
            <HelpCircle size={18} />
          </div>
          <div className="run-log-list m5-run-log-list">
            {currentRun.logs.map((log, index) => (
              <p key={`${log.level}-${index}`}>
                <strong>{formatMetric(log.level, "info")}</strong>
                <span>{formatMetric(log.message)}</span>
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="m5-detail-drawer">
        <div className="m5-section-heading">
          <div>
            <p className="eyebrow">필요할 때만</p>
            <h3>원본 JSON으로 화면 값을 검산합니다</h3>
          </div>
          <button type="button" className="ghost-action" onClick={() => navigate("/etl-visual")}>
            <Route size={16} />
            workflow canvas
          </button>
        </div>
        <div className="m5-raw-section">
          <RawJsonBlock title="ExecutionResult raw JSON" value={currentRun} />
          <RawJsonBlock title="CatalogMetadata raw JSON" value={currentCatalog} />
        </div>
      </section>
    </div>
  );
}

function M5EssentialList() {
  return (
    <div className="m5-essential-list" aria-label="M5 필수 학습 항목">
      {m5MustKnowItems.map((item) => (
        <article key={item.title}>
          <CheckCircle2 size={16} />
          <div>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function M5CoreFlowMap({ run, catalog }) {
  const output = run?.outputs?.[0];
  const catalogRunId = catalog?.lineage?.run_id;
  const values = {
    "WorkflowDefinition": WEEK2_DEFAULT_PIPELINE_ID,
    "Runner": run ? `${run.executor} / ${run.status}` : "실행 전",
    "Output Artifact": output?.dataset_id || "실행 후 확인",
    "CatalogMetadata": catalogRunId ? `lineage: ${catalogRunId}` : "Catalog 대기",
  };

  return (
    <section className="m5-core-flow">
      <div className="m5-section-heading">
        <div>
          <p className="eyebrow">먼저 이 그림만 이해하세요</p>
          <h3>M5는 4칸짜리 흐름입니다</h3>
        </div>
      </div>
      <div className="m5-core-flow-grid">
        {m5CoreFlow.map((step, index) => {
          const Icon = step.icon;
          return (
            <article className="m5-core-flow-card" key={step.title}>
              <span className="m5-core-index">{index + 1}</span>
              <span className="m5-core-icon"><Icon size={18} /></span>
              <p className="eyebrow">{step.eyebrow}</p>
              <h4>{step.title}</h4>
              <p>{step.plain}</p>
              <strong>{values[step.title]}</strong>
              <small>봐야 할 값: {step.focus}</small>
              {index < m5CoreFlow.length - 1 ? <ArrowRight className="m5-core-arrow" size={18} /> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function M5VerdictPanel({ checks }) {
  return (
    <section className="m5-verdict-panel">
      <div className="m5-section-heading">
        <div>
          <p className="eyebrow">실험 결과 판정</p>
          <h3>이 4개만 확인하면 됩니다</h3>
        </div>
      </div>
      <div className="m5-verdict-grid">
        {checks.map((check) => (
          <M5CheckCard key={check.id} check={check} />
        ))}
      </div>
    </section>
  );
}

function M5CheckCard({ check }) {
  const Icon = check.state === "pass" ? CheckCircle2 : check.state === "warn" ? AlertCircle : CircleDot;
  return (
    <article className={`m5-check-card ${check.state}`}>
      <div>
        <Icon size={18} />
        <span>{checkStateLabel(check.state)}</span>
      </div>
      <h4>{check.title}</h4>
      <strong>{check.value}</strong>
      <p>{check.detail}</p>
    </article>
  );
}

function M5NarrativePanel({ sentences }) {
  return (
    <section className="m5-narrative-panel">
      <div>
        <p className="eyebrow">학습 목표</p>
        <h3>이 세 문장을 말할 수 있으면 데모를 이해한 것입니다</h3>
      </div>
      <ol>
        {sentences.map((sentence) => (
          <li key={sentence}>{sentence}</li>
        ))}
      </ol>
    </section>
  );
}

function M5EvidenceBoard({ run, catalog, taskResults, outputs, catalogMatchesRun }) {
  const output = outputs[0];
  const fallbackSignal = run ? (isFallbackRun(run) ? "fallback signal 있음" : "fallback signal 없음") : "실행 전";
  const evidenceRows = [
    ["run_id", formatMetric(run?.run_id), "모든 evidence를 묶는 기준"],
    ["status", formatMetric(run?.status, "not_run"), statusMeaning(run)],
    ["input rows", formatMetric(run?.row_count), "ExecutionResult.row_count"],
    ["output", formatMetric(output?.dataset_id), formatMetric(output?.uri, "output URI 대기")],
    ["catalog lineage", catalogMatchesRun ? "current run" : formatMetric(catalog?.lineage?.run_id, "not current"), "CatalogMetadata.lineage.run_id"],
    ["fallback/log", fallbackSignal, "logs에서 falling back 여부 확인"],
  ];

  return (
    <section className="m5-evidence-section">
      <div className="m5-section-heading">
        <div>
          <p className="eyebrow">핵심 증거</p>
          <h3>숫자보다 먼저 evidence 출처를 봅니다</h3>
        </div>
        <Terminal size={18} />
      </div>
      <DataTable columns={["항목", "현재 값", "의미"]} rows={evidenceRows} />
      {run ? (
        <details className="m5-task-detail">
          <summary>task_results 세부 보기</summary>
          <DataTable
            columns={["node", "status", "attempt", "rows", "bytes", "error"]}
            rows={(taskResults.length ? taskResults : [{ node_id: "-", status: "-", attempt: "-", row_count: "-", bytes: "-", error: "-" }]).map((task) => [
              formatMetric(task.node_id),
              formatMetric(task.status),
              formatMetric(task.attempt),
              formatMetric(task.row_count),
              formatMetric(task.bytes),
              formatMetric(task.error),
            ])}
          />
        </details>
      ) : (
        <EmptyState
          icon={MonitorCheck}
          title="아직 실행 증거가 없습니다"
          body="먼저 local_runner를 실행해서 run_id와 output을 만듭니다."
        />
      )}
    </section>
  );
}

function LearningCard({ icon: Icon, title, body }) {
  return (
    <article className="m5-learning-card">
      <span><Icon size={18} /></span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function EvidenceMetric({ title, value, lesson }) {
  return (
    <article className="m5-metric-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{lesson}</span>
    </article>
  );
}

function M5WorkflowTimeline({ taskResults }) {
  return (
    <div className="m5-workflow-timeline">
      {m5WorkflowLearningSteps.map((step, index) => {
        const task = findTaskForStep(taskResults, step.id);
        const status = task?.status || (taskResults.length ? "not_reported" : "waiting");
        return (
          <article className={`m5-timeline-step ${status}`} key={step.id}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.type}</strong>
              <p>{step.label}</p>
              <small>{step.lesson}</small>
              <em>{status}</em>
            </div>
            {index < m5WorkflowLearningSteps.length - 1 ? <ChevronRight size={18} /> : null}
          </article>
        );
      })}
    </div>
  );
}

function CatalogEvidencePanel({ catalog, loading, error, currentRunId, onRefresh }) {
  const matchesRun = Boolean(currentRunId && catalog?.lineage?.run_id === currentRunId);
  const schemaRows = catalog?.schema?.fields?.map((field) => [
    field.name,
    field.type,
    String(field.nullable),
  ]) || [];

  return (
    <section className="m5-evidence-section">
      <div className="m5-section-heading">
        <div>
          <p className="eyebrow">Step 3-b</p>
          <h3>CatalogMetadata가 최신 run을 가리키는지 확인합니다</h3>
        </div>
        <button type="button" className="icon-link" onClick={onRefresh} disabled={loading} aria-label="Catalog evidence 새로고침">
          {loading ? <Loader2 size={16} /> : <RefreshCw size={16} />}
        </button>
      </div>
      {error ? (
        <EmptyState
          icon={AlertCircle}
          title="CatalogMetadata를 아직 읽지 못했습니다"
          body={error}
        />
      ) : null}
      {catalog ? (
        <>
          <div className={`m5-catalog-lineage ${matchesRun ? "matched" : "stale"}`}>
            <Layers3 size={18} />
            <div>
              <strong>{matchesRun ? "이번 run과 Catalog가 연결됐습니다" : "Catalog가 현재 run과 다를 수 있습니다"}</strong>
              <p>Catalog lineage run_id: {formatMetric(catalog.lineage?.run_id)}</p>
            </div>
          </div>
          <div className="m5-catalog-facts">
            <span>dataset: {formatMetric(catalog.dataset_id)}</span>
            <span>layer: {formatMetric(catalog.layer)}</span>
            <span>rows: {formatMetric(catalog.metrics?.row_count)}</span>
            <span>bytes: {formatMetric(catalog.metrics?.bytes)}</span>
          </div>
          <code>{formatMetric(catalog.s3_uri)}</code>
          <p className="m5-path-note">local fallback path: {formatMetric(catalog.storage?.local_fallback_path)}</p>
          {schemaRows.length ? (
            <DataTable columns={["field", "type", "nullable"]} rows={schemaRows} />
          ) : null}
        </>
      ) : !error ? (
        <EmptyState
          icon={Database}
          title="Catalog evidence 대기 중"
          body="성공한 run이 있으면 M5 CatalogStore가 dataset_reviews_gold metadata를 저장합니다."
        />
      ) : null}
    </section>
  );
}

function RawJsonBlock({ title, value }) {
  return (
    <details className="m5-raw-json">
      <summary>
        <FileJson size={16} />
        {title}
      </summary>
      <pre>{compactJson(value)}</pre>
    </details>
  );
}

export function CatalogPage({ navigate, focusedCatalogDatasetId = "" }) {
  const [selectedTag, setSelectedTag] = useState("전체");
  const [catalogDatasets, setCatalogDatasets] = useState([]);
  const [catalogDatasetPolicyState, setCatalogDatasetPolicyState] = useState(null);
  const [selectedCatalogDatasetId, setSelectedCatalogDatasetId] = useState("");
  const [catalogListState, setCatalogListState] = useState({ loading: true, error: "" });
  const tags = ["전체", "gold", "silver", "source"];
  const filteredCatalogDatasets = catalogDatasets.filter((dataset) => selectedTag === "전체" || catalogDatasetLayer(dataset) === selectedTag);
  const selectedCatalogDataset =
    catalogDatasets.find((dataset) => dataset.id === selectedCatalogDatasetId) || filteredCatalogDatasets[0] || catalogDatasets[0] || null;

  useEffect(() => {
    let isMounted = true;
    async function loadCatalogManagementBoundary() {
      setCatalogListState({ loading: true, error: "" });
      try {
        const datasets = await listCatalogDatasets();
        const policy = await getCatalogDatasetManagementPolicy().catch(() => null);
        if (!isMounted) return;
        setCatalogDatasets(datasets);
        setCatalogDatasetPolicyState(policy);
        setSelectedCatalogDatasetId((current) => {
          if (focusedCatalogDatasetId && datasets.some((dataset) => dataset.id === focusedCatalogDatasetId)) {
            return focusedCatalogDatasetId;
          }
          return current || datasets[0]?.id || "";
        });
        setCatalogListState({ loading: false, error: "" });
      } catch (error) {
        if (!isMounted) return;
        setCatalogDatasets([]);
        setCatalogDatasetPolicyState(null);
        setCatalogListState({ loading: false, error: error.message });
      }
    }
    loadCatalogManagementBoundary();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <PageHeader
        title="데이터 카탈로그"
        body="등록된 분석용 데이터셋을 찾고, 스키마/경로/lineage를 확인한 뒤 AI Query에 넘기는 읽기 전용 목록입니다."
        actionLabel={catalogListState.loading ? "조회 중" : "새로고침"}
        onAction={async () => {
          setCatalogListState({ loading: true, error: "" });
          try {
            const datasets = await listCatalogDatasets();
            const policy = await getCatalogDatasetManagementPolicy().catch(() => null);
            setCatalogDatasets(datasets);
            setCatalogDatasetPolicyState(policy);
            setSelectedCatalogDatasetId((current) => {
              if (focusedCatalogDatasetId && datasets.some((dataset) => dataset.id === focusedCatalogDatasetId)) {
                return focusedCatalogDatasetId;
              }
              return current || datasets[0]?.id || "";
            });
            setCatalogListState({ loading: false, error: "" });
          } catch (error) {
            setCatalogListState({ loading: false, error: error.message });
          }
        }}
      />
      <section className="catalog-purpose-panel">
        <article>
          <Database size={18} />
          <div>
            <strong>무엇을 보여주나</strong>
            <p>Gold Dataset의 이름, row count, 파일 경로, 스키마를 확인합니다.</p>
          </div>
        </article>
        <article>
          <GitBranch size={18} />
          <div>
            <strong>왜 필요한가</strong>
            <p>이 데이터가 어떤 job/run에서 만들어졌는지 lineage 근거를 남깁니다.</p>
          </div>
        </article>
        <article>
          <MessageSquareText size={18} />
          <div>
            <strong>다음에 뭘 하나</strong>
            <p>선택한 카탈로그 데이터셋을 AI Query의 read-only context로 사용합니다.</p>
          </div>
        </article>
      </section>
      <div className="filter-row">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={selectedTag === tag ? "selected" : ""}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {catalogListState.error ? (
        <EmptyState
          icon={AlertCircle}
          title="CatalogDataset 목록을 불러오지 못했습니다"
          body={catalogListState.error}
        />
      ) : null}
      {focusedCatalogDatasetId && !catalogListState.loading && !catalogListState.error && !catalogDatasets.some((dataset) => dataset.id === focusedCatalogDatasetId) ? (
        <p className="runtime-warning">
          AI Query evidence가 가리킨 CatalogDataset `{focusedCatalogDatasetId}`을 현재 카탈로그 목록에서 찾지 못했습니다.
        </p>
      ) : null}
      {catalogListState.loading ? (
        <EmptyState icon={Loader2} title="CatalogDataset 조회 중" body="publish된 데이터셋 metadata를 확인하고 있습니다." />
      ) : null}
      {!catalogListState.loading && !catalogListState.error && filteredCatalogDatasets.length === 0 ? (
        <EmptyState
          icon={Database}
          title={`${selectedTag} 카탈로그 데이터셋이 없습니다`}
          body="실행 기록에서 성공한 Gold Build 결과를 Catalog에 등록하면 이 목록에 표시됩니다."
        />
      ) : null}
      {filteredCatalogDatasets.length ? (
        <section className="catalog-dataset-list" aria-label="registered catalog datasets">
          {filteredCatalogDatasets.map((dataset) => {
            const isSelected = selectedCatalogDataset?.id === dataset.id;
            return (
              <article key={dataset.id} className={`catalog-dataset-card ${isSelected ? "selected" : ""}`}>
                <header>
                  <div className="table-title-line">
                    <Table2 size={20} />
                    <div>
                      <strong>{dataset.name}</strong>
                      <p>{dataset.id}</p>
                    </div>
                  </div>
                  <span className="badge green">{catalogDatasetLayer(dataset)}</span>
                </header>
                <div className="catalog-card-facts">
                  <span>rows {formatMetric(dataset.row_count)}</span>
                  <span>schema {dataset.schema?.length || 0} fields</span>
                  <span>{dataset.source_type || "catalog dataset"}</span>
                </div>
                <code>{dataset.path}</code>
                <div className="catalog-card-actions">
                  <button type="button" className="ghost-action" onClick={() => setSelectedCatalogDatasetId(dataset.id)}>
                    상세 보기
                    <Search size={15} />
                  </button>
                  <button type="button" className="primary-action" onClick={() => navigate("/ask")}>
                    AI Query
                    <MessageSquareText size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
      {selectedCatalogDataset ? (
        <>
          <section className="catalog-selected-panel">
            <div>
              <p className="eyebrow">Selected CatalogDataset</p>
              <h3>{selectedCatalogDataset.name}</h3>
              <p>{selectedCatalogDataset.path}</p>
            </div>
            <span className="badge green">read-only</span>
          </section>
          <div className="grid three">
            <InfoCard title="Layer" value={catalogDatasetLayer(selectedCatalogDataset)} detail={selectedCatalogDataset.source_type} />
            <InfoCard title="Rows" value={formatMetric(selectedCatalogDataset.row_count)} detail="registered evidence" />
            <InfoCard title="Schema" value={`${selectedCatalogDataset.schema?.length || 0} fields`} detail="AI Query column context" />
          </div>
          <section className="contract-panel">
            <div>
              <p className="eyebrow">Schema preview</p>
              <h3>질문 가능한 컬럼</h3>
              <p>AI Query는 이 컬럼 목록을 근거로 read-only SQL을 구성합니다.</p>
            </div>
            <div className="catalog-schema-chips">
              {(selectedCatalogDataset.schema || []).slice(0, 12).map((field) => (
                <span key={field.name}>
                  {field.name}
                  <small>{field.type}</small>
                </span>
              ))}
            </div>
          </section>
          <DataTable columns={["field", "type"]} rows={catalogDatasetSchemaRows(selectedCatalogDataset)} />
          <DataTable columns={["sample key", "value"]} rows={catalogDatasetSampleRows(selectedCatalogDataset)} />
        </>
      ) : null}
      <details className="catalog-policy-details">
        <summary>관리 정책 보기</summary>
        <CatalogDatasetManagementPolicyPanel policy={catalogDatasetPolicyState} publishedCount={catalogDatasets.length} />
      </details>
    </div>
  );
}

function catalogDatasetLayer(dataset) {
  const text = `${dataset?.name || ""} ${dataset?.path || ""} ${dataset?.source_type || ""}`.toLowerCase();
  if (text.includes("gold") || text.includes("target_dataset")) return "gold";
  if (text.includes("silver")) return "silver";
  return "source";
}

function catalogDatasetSchemaRows(dataset) {
  return (dataset?.schema || []).map((field) => [field.name, field.type]);
}

function catalogDatasetSampleRows(dataset) {
  const firstSample = dataset?.sample?.[0] || {};
  return Object.entries(firstSample)
    .slice(0, 10)
    .map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : formatMetric(value)]);
}

export function CatalogDetailShell({ navigate }) {
  const [tab, setTab] = useState("lineage");
  const { catalogState, refreshCatalog } = useWeek2CatalogState();
  const catalog = catalogState.catalog;
  const tabs = [
    ["lineage", "리니지(데이터 계보)", GitBranch],
    ["quality", "품질 검사 리포트", ShieldCheck],
    ["governance", "거버넌스 설정", Wrench],
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title={catalog?.name || m1CatalogPlaceholder.name}
        body={catalog ? `${catalog.dataset_id} CatalogMetadata detail입니다.` : "Catalog detail과 lineage/quality/governance tab shell입니다."}
        actionLabel={catalogState.loading ? "조회 중" : "목록으로"}
        onAction={() => (catalogState.loading ? refreshCatalog() : navigate("/catalog"))}
      />
      {catalogState.error ? (
        <EmptyState
          icon={AlertCircle}
          title="CatalogMetadata를 불러오지 못했습니다"
          body="아직 successful Week2 run이 없을 수 있습니다. /etl에서 로컬 runner 실행 후 다시 확인하세요."
        />
      ) : null}
      {catalogState.loading ? (
        <EmptyState icon={Loader2} title="Catalog detail 조회 중" body={WEEK2_DEFAULT_DATASET_ID} />
      ) : null}
      {catalog ? (
        <div className="grid three">
          <InfoCard title="Dataset" value={catalog.dataset_id} detail={catalog.layer} />
          <InfoCard title="Storage" value={catalog.storage?.profile} detail={catalog.storage?.prefix} />
          <InfoCard title="Updated" value={catalog.updated_at} detail={catalog.version} />
        </div>
      ) : null}
      {catalog ? (
        <section className="demo-handoff-panel">
          <div>
            <p className="eyebrow">Next demo step</p>
            <h3>M6 AI Query로 근거 확인</h3>
            <p>{catalog.dataset_id}의 schema, metrics, lineage를 evidence로 사용해 질문 결과를 확인합니다.</p>
          </div>
          <div className="handoff-actions">
            <button type="button" className="primary-action" onClick={() => navigate("/ask")}>
              AI Query 실행
              <ArrowRight size={16} />
            </button>
            <button type="button" className="ghost-action" onClick={() => navigate("/runs")}>
              Run으로 돌아가기
              <ListChecks size={16} />
            </button>
          </div>
        </section>
      ) : null}
      <section className="detail-tabs">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} type="button" className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </section>
      {tab === "lineage" ? <LineageShell catalog={catalog} /> : null}
      {tab === "quality" && catalog ? (
        <>
          <div className="grid three">
            <InfoCard title="schema status" value={catalog.metrics?.quality?.schema_match} detail="M5 quality fact" />
            <InfoCard title="row count checked" value={formatMetric(catalog.metrics?.quality?.row_count_checked)} detail="M5 quality fact" />
            <InfoCard title="query allowed" value={formatMetric(catalog.query?.allow_readonly_sql)} detail={catalog.query?.table_name} />
          </div>
          <DataTable columns={["quality fact", "value"]} rows={catalogQualityRows(catalog)} />
        </>
      ) : null}
      {tab === "quality" && !catalog && !catalogState.loading ? (
        <div className="grid three">
          <InfoCard title="schema status" value="연결 대기" detail="M5 quality output 필요" />
          <InfoCard title="row count checked" value="연결 대기" detail="ExecutionResult quality metric" />
          <InfoCard title="query allowed" value="연결 대기" detail="CatalogMetadata 필요" />
        </div>
      ) : null}
      {tab === "governance" ? (
        <DataTable
          columns={["policy", "state", "owner"]}
          rows={[
            ["mask customer identifiers", "연결 대기", "M6/RBAC"],
            ["monthly aggregate only", "연결 대기", "M5/M6"],
            ["allow readonly SQL", formatMetric(catalog?.query?.allow_readonly_sql, "disabled"), "M6"],
          ]}
        />
      ) : null}
      {catalog ? (
        <section className="contract-panel">
          <div>
            <p className="eyebrow">Local fallback path</p>
            <code>{catalog.storage?.local_fallback_path}</code>
          </div>
          <p>{catalog.s3_uri}</p>
        </section>
      ) : null}
    </div>
  );
}

function LineageShell({ catalog }) {
  const lineageRows = catalog
    ? catalogLineageNodes(catalog)
    : [
        ["Source", "M5 연결 대기"],
        ["Raw placeholder", "M5 연결 대기"],
        ["Prepared placeholder", "M5 연결 대기"],
        ["Quality Gate", "M5 연결 대기"],
        ["Output placeholder", m1CatalogPlaceholder.dataset_id],
      ];

  return (
    <section className="lineage-shell">
      {lineageRows.map(([label, detail], index) => (
        <article key={label}>
          <span>{index + 1}</span>
          <strong>{label}</strong>
          <p>{detail}</p>
        </article>
      ))}
    </section>
  );
}

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

export function DashboardPlaceholder() {
  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        body="M6 chart와 insight detail이 붙을 자리입니다."
        actionLabel="연결 대기"
      />
      <EmptyState
        icon={Sparkles}
        title="Dashboard placeholder surface"
        body="현재 M1에서는 navigation shell만 보존하고 실제 dashboard query는 M6에서 연결합니다."
      />
    </div>
  );
}

export function AdminPlaceholder() {
  return (
    <div className="page-stack">
      <PageHeader
        title="사용자/권한"
        body="기준 데모의 admin navigation 자리를 보존하되, 실제 권한 관리는 M1 범위 밖입니다."
        actionLabel="RBAC 연결 대기"
      />
      <EmptyState
        icon={ShieldCheck}
        title="권한 관리 기능은 연결 전입니다"
        body="fake admin 생성이나 mock login 없이 shell route만 유지합니다."
      />
    </div>
  );
}
