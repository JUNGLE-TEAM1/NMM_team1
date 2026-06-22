import { Play, Workflow } from "lucide-react";

import { usePipelineRun } from "./usePipelineRun";

export function PipelineRunPanel({ datasets, activeDatasetId, onRunComplete }) {
  const pipelineRun = usePipelineRun({ activeDatasetId, datasets, onRunComplete });

  return (
    <section className="panel pipeline-panel">
      <div className="panel-title">
        <Workflow size={18} aria-hidden="true" />
        <h2>Pipeline Run</h2>
      </div>

      <form className="pipeline-form" onSubmit={pipelineRun.submitPipeline}>
        <label>
          <span>Source dataset</span>
          <select
            value={pipelineRun.selectedDataset?.id || ""}
            onChange={(event) => pipelineRun.setSelectedDatasetId(event.target.value)}
          >
            {pipelineRun.sourceDatasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Pipeline 이름</span>
          <input
            value={pipelineRun.form.name}
            onChange={(event) => pipelineRun.setForm({ ...pipelineRun.form, name: event.target.value })}
          />
        </label>
        <label>
          <span>선택 컬럼</span>
          <input
            placeholder={pipelineRun.defaultFields}
            value={pipelineRun.form.selectFields}
            onChange={(event) => pipelineRun.setForm({ ...pipelineRun.form, selectFields: event.target.value })}
          />
        </label>
        <label>
          <span>Target dataset</span>
          <input
            value={pipelineRun.form.targetName}
            onChange={(event) => pipelineRun.setForm({ ...pipelineRun.form, targetName: event.target.value })}
          />
        </label>
        <button type="submit" disabled={pipelineRun.submitting || !pipelineRun.selectedDataset}>
          <Play size={18} aria-hidden="true" />
          <span>{pipelineRun.submitting ? "실행 중" : "실행"}</span>
        </button>
      </form>

      {pipelineRun.notice ? <p className="notice compact">{pipelineRun.notice}</p> : null}

      {pipelineRun.run ? (
        <dl className="run-summary">
          <div>
            <dt>Status</dt>
            <dd className={pipelineRun.run.status}>{pipelineRun.run.status}</dd>
          </div>
          <div>
            <dt>Rows</dt>
            <dd>{pipelineRun.run.row_count ?? "-"}</dd>
          </div>
          <div>
            <dt>Result</dt>
            <dd>{pipelineRun.run.result_location || pipelineRun.run.error_message || "-"}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
