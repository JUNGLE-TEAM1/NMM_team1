import { useEffect, useMemo, useState } from "react";
import { Database, FilePlus2, RefreshCw, TableProperties } from "lucide-react";

import { createSource, listCatalogDatasets, listSources } from "../../api/asklakeClient";
import { PipelineRunPanel } from "../pipeline/PipelineRunPanel";
import { CatalogDetail } from "./CatalogDetail";

export function SourceCatalog() {
  const [sources, setSources] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [form, setForm] = useState(() => ({ name: makeDemoSourceName(), path: "samples/orders.csv" }));
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === selectedDatasetId) || datasets[0],
    [datasets, selectedDatasetId],
  );

  useEffect(() => {
    refreshCatalog();
  }, []);

  async function refreshCatalog(preferredDatasetId = selectedDatasetId) {
    try {
      const [nextSources, nextDatasets] = await Promise.all([listSources(), listCatalogDatasets()]);
      setSources(nextSources);
      setDatasets(nextDatasets);
      const hasPreferred = nextDatasets.some((dataset) => dataset.id === preferredDatasetId);
      if (hasPreferred) {
        setSelectedDatasetId(preferredDatasetId);
      } else if (nextDatasets.length > 0) {
        setSelectedDatasetId(nextDatasets[0].id);
      }
    } catch (error) {
      setNotice(error.message || "Catalog를 불러오지 못했습니다.");
    }
  }

  async function registerSource(event) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");

    try {
      const payload = await createSource(form);
      setSelectedDatasetId(payload.dataset.id);
      setNotice(`${payload.source.name} 등록 완료`);
      setForm({ ...form, name: makeDemoSourceName() });
      await refreshCatalog(payload.dataset.id);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="toolbar">
        <form className="source-form" onSubmit={registerSource}>
          <label>
            <span>Source 이름</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label>
            <span>CSV 경로</span>
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
            <h2>Catalog 상세</h2>
          </div>
          {selectedDataset ? (
            <CatalogDetail dataset={selectedDataset} />
          ) : (
            <p className="empty">Sample CSV를 등록하면 schema와 sample rows가 표시됩니다.</p>
          )}
        </div>
      </section>

      <PipelineRunPanel
        datasets={datasets}
        activeDatasetId={selectedDatasetId}
        onRunComplete={refreshCatalog}
      />
    </>
  );
}

function makeDemoSourceName() {
  return `sample_orders_${demoSuffix()}`;
}

function demoSuffix() {
  return Date.now().toString(36).slice(-6);
}
