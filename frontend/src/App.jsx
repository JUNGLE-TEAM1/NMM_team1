import { useEffect, useMemo, useState } from "react";
import { Activity, Database, FilePlus2, RefreshCw, TableProperties } from "lucide-react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function App() {
  const [health, setHealth] = useState({ state: "loading", message: "확인 중" });
  const [sources, setSources] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [form, setForm] = useState({ name: "sample_orders", path: "samples/orders.csv" });
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === selectedDatasetId) || datasets[0],
    [datasets, selectedDatasetId],
  );

  useEffect(() => {
    refreshHealth();
    refreshCatalog();
  }, []);

  async function refreshHealth() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      setHealth({ state: "ok", message: `${payload.service} ${payload.status}` });
    } catch (error) {
      setHealth({ state: "error", message: error.message });
    }
  }

  async function refreshCatalog() {
    const [sourceResponse, datasetResponse] = await Promise.all([
      fetch(`${apiBaseUrl}/api/sources`),
      fetch(`${apiBaseUrl}/api/catalog/datasets`),
    ]);

    if (!sourceResponse.ok || !datasetResponse.ok) {
      setNotice("Catalog를 불러오지 못했습니다.");
      return;
    }

    const nextSources = await sourceResponse.json();
    const nextDatasets = await datasetResponse.json();
    setSources(nextSources);
    setDatasets(nextDatasets);
    if (!selectedDatasetId && nextDatasets.length > 0) {
      setSelectedDatasetId(nextDatasets[0].id);
    }
  }

  async function registerSource(event) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, type: "csv", path: form.path }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || `HTTP ${response.status}`);
      }
      setSelectedDatasetId(payload.dataset.id);
      setNotice(`${payload.source.name} 등록 완료`);
      await refreshCatalog();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusLabel = health.state === "ok" ? "정상" : health.state === "error" ? "확인 필요" : "확인 중";

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="title-row">
          <div>
            <p className="eyebrow">AskLake M3</p>
            <h1>Source Catalog</h1>
          </div>
          <div className={`status-pill ${health.state}`} title={health.message}>
            <Activity size={18} aria-hidden="true" />
            <span>{statusLabel}</span>
          </div>
        </div>

        <section className="toolbar">
          <form className="source-form" onSubmit={registerSource}>
            <label>
              <span>Source name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </label>
            <label>
              <span>CSV path</span>
              <input
                value={form.path}
                onChange={(event) => setForm({ ...form, path: event.target.value })}
              />
            </label>
            <button type="submit" disabled={submitting}>
              <FilePlus2 size={18} aria-hidden="true" />
              <span>{submitting ? "등록 중" : "등록"}</span>
            </button>
          </form>
          <button type="button" className="icon-button" onClick={refreshCatalog} title="새로고침">
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </section>

        {notice ? <p className="notice">{notice}</p> : null}

        <section className="catalog-grid">
          <div className="panel">
            <div className="panel-title">
              <Database size={18} aria-hidden="true" />
              <h2>Sources</h2>
            </div>
            <div className="source-list">
              {sources.length === 0 ? (
                <p className="empty">등록된 source가 없습니다.</p>
              ) : (
                sources.map((source) => (
                  <button
                    key={source.id}
                    type="button"
                    className="source-row"
                    onClick={() => setSelectedDatasetId(source.dataset_id)}
                  >
                    <strong>{source.name}</strong>
                    <span>{source.path}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="panel detail-panel">
            <div className="panel-title">
              <TableProperties size={18} aria-hidden="true" />
              <h2>Catalog Detail</h2>
            </div>
            {selectedDataset ? (
              <CatalogDetail dataset={selectedDataset} />
            ) : (
              <p className="empty">Sample CSV를 등록하면 schema와 sample rows가 표시됩니다.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function CatalogDetail({ dataset }) {
  return (
    <div className="dataset-detail">
      <div className="dataset-header">
        <div>
          <strong>{dataset.name}</strong>
          <span>{dataset.path}</span>
        </div>
        <span className={`dataset-status ${dataset.status}`}>{dataset.status}</span>
      </div>

      <dl className="metrics">
        <div>
          <dt>Rows</dt>
          <dd>{dataset.row_count}</dd>
        </div>
        <div>
          <dt>Columns</dt>
          <dd>{dataset.schema.length}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{dataset.source_type}</dd>
        </div>
      </dl>

      <div className="schema-list">
        {dataset.schema.map((column) => (
          <span key={column.name}>
            {column.name}
            <small>{column.type}</small>
          </span>
        ))}
      </div>

      <div className="sample-table">
        <table>
          <thead>
            <tr>
              {dataset.schema.map((column) => (
                <th key={column.name}>{column.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.sample.map((row, index) => (
              <tr key={`${dataset.id}-${index}`}>
                {dataset.schema.map((column) => (
                  <td key={column.name}>{String(row[column.name] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
