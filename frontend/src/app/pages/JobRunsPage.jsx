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
