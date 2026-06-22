import { useMemo, useState } from "react";
import { Play, Workflow } from "lucide-react";

import { createPipeline, runPipeline } from "../../api/asklakeClient";

export function PipelineRunPanel({ datasets, onRunComplete }) {
  const sourceDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.source_type !== "pipeline_result"),
    [datasets],
  );
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const selectedDataset =
    sourceDatasets.find((dataset) => dataset.id === selectedDatasetId) || sourceDatasets[0];
  const defaultFields = selectedDataset?.schema.slice(0, 2).map((column) => column.name).join(", ") || "";
  const [form, setForm] = useState({
    name: "orders_amounts",
    selectFields: "",
    targetName: "orders_amounts_result",
  });
  const [run, setRun] = useState(null);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitPipeline(event) {
    event.preventDefault();
    if (!selectedDataset) {
      setNotice("먼저 source dataset을 등록하세요.");
      return;
    }

    setSubmitting(true);
    setNotice("");
    setRun(null);

    try {
      const fields = (form.selectFields || defaultFields)
        .split(",")
        .map((field) => field.trim())
        .filter(Boolean);
      const pipeline = await createPipeline({
        name: form.name,
        sourceDatasetId: selectedDataset.id,
        selectFields: fields,
        targetName: form.targetName,
      });
      const nextRun = await runPipeline(pipeline.id);
      setRun(nextRun);
      setNotice(`${pipeline.name} 실행 ${nextRun.status}`);
      await onRunComplete?.();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel pipeline-panel">
      <div className="panel-title">
        <Workflow size={18} aria-hidden="true" />
        <h2>Pipeline Run</h2>
      </div>

      <form className="pipeline-form" onSubmit={submitPipeline}>
        <label>
          <span>Source dataset</span>
          <select
            value={selectedDataset?.id || ""}
            onChange={(event) => setSelectedDatasetId(event.target.value)}
          >
            {sourceDatasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Pipeline name</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          <span>Select fields</span>
          <input
            placeholder={defaultFields}
            value={form.selectFields}
            onChange={(event) => setForm({ ...form, selectFields: event.target.value })}
          />
        </label>
        <label>
          <span>Target dataset</span>
          <input
            value={form.targetName}
            onChange={(event) => setForm({ ...form, targetName: event.target.value })}
          />
        </label>
        <button type="submit" disabled={submitting || !selectedDataset}>
          <Play size={18} aria-hidden="true" />
          <span>{submitting ? "실행 중" : "실행"}</span>
        </button>
      </form>

      {notice ? <p className="notice compact">{notice}</p> : null}

      {run ? (
        <dl className="run-summary">
          <div>
            <dt>Status</dt>
            <dd className={run.status}>{run.status}</dd>
          </div>
          <div>
            <dt>Rows</dt>
            <dd>{run.row_count ?? "-"}</dd>
          </div>
          <div>
            <dt>Result</dt>
            <dd>{run.result_location || run.error_message || "-"}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
