import { ArrowRight, CircleDashed, Database, FileJson, Play, RefreshCw, ServerCog, Workflow } from "lucide-react";
import { useState } from "react";

import { getWeek2Catalog, runWeek2Workflow } from "../../api/week2Api";

const EXECUTOR_OPTIONS = [
  { value: "local_runner", label: "Local" },
  { value: "airflow", label: "Airflow" },
];

const WORKFLOW_NODES = [
  { id: "node_source_reviews", type: "Source", label: "원본 읽기", output: "artifact_reviews_raw" },
  { id: "node_filter_reviews", type: "Select/Filter", label: "컬럼 고르기", output: "artifact_reviews_selected" },
  { id: "node_normalize_reviews", type: "Cast/Normalize", label: "값 정리", output: "artifact_reviews_silver" },
  { id: "node_aggregate_reviews", type: "Aggregate", label: "상품별 집계", output: "artifact_reviews_gold" },
  { id: "node_load_reviews", type: "Load", label: "결과 저장", output: "dataset_reviews_gold" },
];

export function Week2M5Demo() {
  const [executor, setExecutor] = useState("local_runner");
  const [run, setRun] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [notice, setNotice] = useState("준비됨");
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    setNotice("실행 중");
    try {
      const nextRun = await runWeek2Workflow(executor);
      const nextCatalog = await getWeek2Catalog();
      setRun(nextRun);
      setCatalog(nextCatalog);
      setNotice(`${nextRun.run_id} 완료`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshCatalog() {
    setLoading(true);
    setNotice("catalog 조회 중");
    try {
      const nextCatalog = await getWeek2Catalog();
      setCatalog(nextCatalog);
      setNotice(`${nextCatalog.dataset_id} 조회 완료`);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel week2-demo">
      <div className="panel-title week2-title">
        <Workflow size={18} aria-hidden="true" />
        <div>
          <h2>Week 2 M5 Demo</h2>
          <span>{notice}</span>
        </div>
      </div>

      <div className="week2-controls">
        <label>
          <span>Executor</span>
          <select value={executor} onChange={(event) => setExecutor(event.target.value)}>
            {EXECUTOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={handleRun} disabled={loading}>
          <Play size={18} aria-hidden="true" />
          <span>{loading ? "처리 중" : "Run"}</span>
        </button>
        <button type="button" className="secondary-button" onClick={handleRefreshCatalog} disabled={loading}>
          <RefreshCw size={18} aria-hidden="true" />
          <span>Catalog</span>
        </button>
      </div>

      <NodeBoard run={run} />

      <div className="week2-grid">
        <MetricPanel
          icon={<FileJson size={18} aria-hidden="true" />}
          title="ExecutionResult"
          rows={[
            ["run_id", run?.run_id || "-"],
            ["status", run?.status || "-"],
            ["input rows", valueOrDash(run?.row_count)],
            ["input bytes", valueOrDash(run?.bytes)],
            ["duration", run?.duration_ms ? `${run.duration_ms} ms` : "-"],
          ]}
        />
        <MetricPanel
          icon={<Database size={18} aria-hidden="true" />}
          title="CatalogMetadata"
          rows={[
            ["dataset_id", catalog?.dataset_id || "-"],
            ["latest run", catalog?.lineage?.run_id || "-"],
            ["output rows", valueOrDash(catalog?.metrics?.row_count)],
            ["output bytes", valueOrDash(catalog?.metrics?.bytes)],
            ["quality", catalog?.metrics?.quality?.schema_match || "-"],
          ]}
        />
        <MetricPanel
          icon={<ServerCog size={18} aria-hidden="true" />}
          title="Storage"
          rows={[
            ["s3_uri", catalog?.s3_uri || run?.outputs?.[0]?.uri || "-"],
            ["local path", catalog?.storage?.local_fallback_path || "-"],
            ["logs", run?.logs?.at(-1)?.message || "-"],
          ]}
        />
      </div>
    </section>
  );
}

function NodeBoard({ run }) {
  const taskResults = new Map((run?.task_results || []).map((task) => [task.node_id, task]));
  const nodeOutputs = new Map((run?.node_outputs || []).map((output) => [output.node_id, output]));
  const nodes = WORKFLOW_NODES.map((node) => ({
    ...node,
    task: taskResults.get(node.id),
    outputPreview: nodeOutputs.get(node.id),
  }));

  return (
    <div className="node-board">
      <div className="node-board-title">
        <CircleDashed size={18} aria-hidden="true" />
        <h3>Node Board</h3>
      </div>
      <div className="node-flow" aria-label="Week 2 workflow nodes">
        {nodes.map((node, index) => (
          <div className="node-step" key={node.id}>
            <NodeCard index={index} node={node} />
            {index < nodes.length - 1 ? <ArrowRight className="node-arrow" size={22} aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function NodeCard({ index, node }) {
  const status = node.task?.status || "waiting";
  const previewRows = node.outputPreview?.preview_rows || [];
  return (
    <article className={`workflow-node ${status}`}>
      <div className="node-topline">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <strong>{status}</strong>
      </div>
      <div className="node-heading">
        <h4>{node.label}</h4>
        <span>{node.type}</span>
      </div>
      <dl className="node-stats">
        <div>
          <dt>rows</dt>
          <dd>{valueOrDash(node.task?.row_count ?? node.outputPreview?.row_count)}</dd>
        </div>
        <div>
          <dt>bytes</dt>
          <dd>{valueOrDash(node.task?.bytes ?? node.outputPreview?.bytes)}</dd>
        </div>
      </dl>
      <div className="node-output">
        <span>output</span>
        <strong>{node.outputPreview?.output || node.output}</strong>
      </div>
      <PreviewRows rows={previewRows} />
    </article>
  );
}

function PreviewRows({ rows }) {
  if (!rows.length) {
    return <div className="node-preview empty-preview">-</div>;
  }

  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];

  return (
    <div className="node-preview node-preview-table">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${Object.values(row).join("-")}`}>
              {columns.map((column) => (
                <td key={column}>{formatCellValue(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricPanel({ icon, title, rows }) {
  return (
    <div className="week2-card">
      <div className="week2-card-title">
        {icon}
        <h3>{title}</h3>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function valueOrDash(value) {
  return value === null || value === undefined ? "-" : value;
}

function formatCellValue(value) {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}
