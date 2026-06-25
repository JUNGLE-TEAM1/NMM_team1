import { Database, FileJson, Play, RefreshCw, ServerCog, Workflow } from "lucide-react";
import { useState } from "react";

import { getWeek2Catalog, runWeek2Workflow } from "../../api/week2Api";

const EXECUTOR_OPTIONS = [
  { value: "local_runner", label: "Local" },
  { value: "airflow", label: "Airflow" },
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

