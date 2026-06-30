import {
  AlertCircle,
  Archive,
  Clock3,
  Database,
  FileCheck2,
  HardDrive,
  Layers3,
  ListChecks,
  PlayCircle,
  Save,
  ServerCog,
  Table2,
  Trash2,
  Workflow,
  Wrench,
  X,
} from "lucide-react";

import {
  formatBytes,
  formatMetric,
} from "../../app/formatters";

export function JobScheduleEditorModal({ job, form, state, onFormChange, onSave, onClose }) {
  const isSaving = state.status === "saving";
  const editTargetLabel = job.type === "connection" ? "Connection 편집" : "Dataset 편집";
  const jobTypeLabel =
    job.type === "connection" ? "Connection Sync Job" : job.type === "silver" ? "Silver Transform Job" : "Gold Build Job";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal" role="dialog" aria-modal="true" aria-labelledby="job-schedule-title">
        <header>
          <div>
            <h2 id="job-schedule-title">Job schedule 수정</h2>
            <p>Schedule metadata만 수정합니다. 작업 정의는 {editTargetLabel}에서 관리합니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <section className="wizard-inline-panel">
            <div className="table-title-line">
              <Clock3 size={18} />
              <div>
                <strong>{job.name}</strong>
                <p>{jobTypeLabel}</p>
              </div>
            </div>
            <div className="schedule-choice-grid" aria-label="Job schedule mode">
              <label className={form.mode === "manual" ? "selected" : ""}>
                <input
                  type="radio"
                  name="job-schedule"
                  value="manual"
                  checked={form.mode === "manual"}
                  onChange={() => onFormChange({ ...form, mode: "manual" })}
                />
                <strong>Manual trigger</strong>
                <small>스케줄러 없이 사용자가 수동 실행할 때 사용합니다.</small>
              </label>
              <label className={form.mode === "placeholder" ? "selected" : ""}>
                <input
                  type="radio"
                  name="job-schedule"
                  value="placeholder"
                  checked={form.mode === "placeholder"}
                  onChange={() => onFormChange({ ...form, mode: "placeholder" })}
                />
                <strong>Schedule placeholder</strong>
                <small>스케줄 의도만 metadata로 저장합니다.</small>
              </label>
            </div>
            <label className="target-name-field">
              <span>스케줄 메모</span>
              <input
                type="text"
                value={form.note}
                onChange={(event) => onFormChange({ ...form, note: event.target.value })}
                placeholder="weekday 09:00 build window"
              />
            </label>
            <div className="wizard-placeholder compact">
              <Wrench size={22} />
              <strong>작업 정의 편집은 {editTargetLabel}에서 진행합니다</strong>
              <p>이 modal은 schedule metadata만 바꾸며 실제 scheduler 등록이나 DAG trigger는 수행하지 않습니다.</p>
            </div>
            {state.error ? (
              <div className="wizard-placeholder compact danger">
                <AlertCircle size={22} />
                <strong>{state.error}</strong>
              </div>
            ) : null}
          </section>
        </div>
        <footer>
          <button type="button" className="ghost-action" onClick={onClose}>
            닫기
          </button>
          <button type="button" className="primary-action" onClick={onSave} disabled={isSaving}>
            <Save size={16} />
            {isSaving ? "저장 중" : "Schedule 저장"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function ManageModeToolbar({ mode, onModeChange, allowDelete = true }) {
  return (
    <div className="source-manage-toolbar">
      <button type="button" className={mode === "detail" ? "selected" : ""} onClick={() => onModeChange("detail")}>
        상세
      </button>
      <button type="button" className={mode === "edit" ? "selected" : ""} onClick={() => onModeChange("edit")}>
        수정
      </button>
      {allowDelete ? (
        <button type="button" className={mode === "delete" ? "selected danger" : "danger"} onClick={() => onModeChange("delete")}>
          삭제
        </button>
      ) : null}
    </div>
  );
}

function ManageModalFooter({ mode, state, onClose, onSave, onDelete }) {
  const isBusy = state.status === "saving" || state.status === "deleting";

  return (
    <footer>
      <button type="button" className="ghost-action" onClick={onClose}>
        닫기
      </button>
      {mode === "edit" ? (
        <button type="button" className="primary-action" onClick={onSave} disabled={isBusy}>
          <Save size={16} />
          {state.status === "saving" ? "저장 중" : "수정 저장"}
        </button>
      ) : null}
      {mode === "delete" ? (
        <button type="button" className="primary-action danger-action" onClick={onDelete} disabled={isBusy}>
          <Trash2 size={16} />
          {state.status === "deleting" ? "삭제 중" : "삭제 확인"}
        </button>
      ) : null}
    </footer>
  );
}

function ManageError({ error }) {
  if (!error) return null;
  return (
    <div className="wizard-placeholder compact danger">
      <AlertCircle size={22} />
      <strong>{error}</strong>
    </div>
  );
}

export function fileEvidenceLabel(evidence) {
  if (!evidence) return "metadata-only";
  if (evidence.status === "file_backed") return "file-backed";
  if (evidence.status === "missing") return "missing file";
  return "metadata-only";
}

function DatasetFileEvidencePanel({ evidence }) {
  if (!evidence) {
    return (
      <div className="wizard-placeholder compact">
        <FileCheck2 size={22} />
        <strong>metadata-only</strong>
        <p>연결된 local file evidence가 없습니다.</p>
      </div>
    );
  }

  const isMissing = evidence.status === "missing";
  return (
    <section className={`wizard-placeholder compact ${isMissing ? "danger" : ""}`}>
      {isMissing ? <AlertCircle size={22} /> : <FileCheck2 size={22} />}
      <strong>{fileEvidenceLabel(evidence)}</strong>
      <p>{evidence.message}</p>
      <div className="source-manage-facts">
        <span>path</span>
        <strong>{evidence.path || "-"}</strong>
        <span>bytes</span>
        <strong>{formatMetric(formatBytes(evidence.bytes))}</strong>
        <span>rows</span>
        <strong>{formatMetric(evidence.row_count)}</strong>
        <span>row count</span>
        <strong>{evidence.row_count_status}</strong>
        <span>schema fields</span>
        <strong>{formatMetric(evidence.schema_fields)}</strong>
      </div>
    </section>
  );
}

export function safeRuntimeSummary(summary) {
  if (!summary) return "-";
  return Object.entries(summary)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join(" · ");
}

export function ConnectionManageModal({ connection, form, mode, state, onClose, onModeChange, onFormChange, onSave, onDelete }) {
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="connection-manage-title">
        <header>
          <div>
            <h2 id="connection-manage-title">External Connection 상세</h2>
            <p>{connection.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <ManageModeToolbar mode={mode} onModeChange={onModeChange} />
          <div className="source-manage-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>Connection metadata</strong>
                  <p>{connection.typeLabel}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>Silver Dataset 이름</span>
                <input type="text" value={form.name} onChange={(event) => onFormChange({ ...form, name: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>resource</span>
                <input type="text" value={form.resource} onChange={(event) => onFormChange({ ...form, resource: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>resource_label</span>
                <input type="text" value={form.resource_label} onChange={(event) => onFormChange({ ...form, resource_label: event.target.value })} readOnly={!isEditMode} />
              </label>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Clock3 size={18} />
                <div>
                  <strong>Sync metadata</strong>
                  <p>{connection.syncMode}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>sync_mode</span>
                <select value={form.sync_mode} onChange={(event) => onFormChange({ ...form, sync_mode: event.target.value })} disabled={!isEditMode}>
                  <option value="manual">manual</option>
                  <option value="scheduled">scheduled</option>
                  <option value="streaming">streaming</option>
                </select>
              </label>
              <label className="target-name-field">
                <span>sync_schedule</span>
                <input type="text" value={form.sync_schedule} onChange={(event) => onFormChange({ ...form, sync_schedule: event.target.value })} readOnly={!isEditMode} />
              </label>
              <div className="source-manage-facts">
                <span>status</span>
                <strong>{connection.status}</strong>
                <span>schema fields</span>
                <strong>{connection.schema?.length || 0}</strong>
              </div>
            </section>
          </div>
          {isDeleteMode ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{connection.name} metadata를 삭제합니다.</strong>
              <p>Source Dataset이 참조 중이면 삭제가 차단됩니다.</p>
            </div>
          ) : null}
          <ManageError error={state.error} />
        </div>
        <ManageModalFooter mode={mode} state={state} onClose={onClose} onSave={onSave} onDelete={onDelete} />
      </section>
    </div>
  );
}

export function SilverDatasetManageModal({
  dataset,
  form,
  mode,
  state,
  materializationState,
  onClose,
  onModeChange,
  onFormChange,
  onSave,
  onDelete,
  onRunMaterialization,
}) {
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";
  const isMaterializing = materializationState.status === "running";
  const latestMaterialization = materializationState.materializations[0] || null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="silver-manage-title">
        <header>
          <div>
            <h2 id="silver-manage-title">Silver Dataset 상세</h2>
            <p>{dataset.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <ManageModeToolbar mode={mode} onModeChange={onModeChange} />
          <div className="source-manage-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Layers3 size={18} />
                <div>
                  <strong>Silver metadata</strong>
                  <p>from {dataset.source_dataset_name}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>name</span>
                <input type="text" value={form.name} onChange={(event) => onFormChange({ ...form, name: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>생성 목적</span>
                <input type="text" value={form.purpose} onChange={(event) => onFormChange({ ...form, purpose: event.target.value })} readOnly={!isEditMode} />
              </label>
              <div className="source-manage-facts">
                <span>status</span>
                <strong>{dataset.status}</strong>
                <span>schedule</span>
                <strong>{dataset.schedule?.mode || "manual"}</strong>
              </div>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ListChecks size={18} />
                <div>
                  <strong>Rules</strong>
                  <p>한 줄에 하나씩 입력합니다.</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>표준화 규칙</span>
                <textarea value={form.standardize_rules} onChange={(event) => onFormChange({ ...form, standardize_rules: event.target.value })} readOnly={!isEditMode} rows={4} />
              </label>
              <label className="target-name-field">
                <span>검증 규칙</span>
                <textarea value={form.validation_rules} onChange={(event) => onFormChange({ ...form, validation_rules: event.target.value })} readOnly={!isEditMode} rows={4} />
              </label>
            </section>
          </div>
          <DatasetFileEvidencePanel evidence={dataset.file_evidence} />
          <section className="wizard-inline-panel snapshot-panel">
            <div className="snapshot-panel-header">
              <div className="table-title-line">
                <FileCheck2 size={18} />
                <div>
                  <strong>Silver materialization evidence</strong>
                  <p>Source Snapshot 또는 local Source에서 Silver parquet output을 생성합니다.</p>
                </div>
              </div>
              <button type="button" className="primary-action" onClick={onRunMaterialization} disabled={isMaterializing || isEditMode || isDeleteMode}>
                <PlayCircle size={16} />
                {isMaterializing ? "생성 중" : "Silver output 생성"}
              </button>
            </div>
            {materializationState.status === "loading" ? (
              <p className="muted-line">materialization evidence를 불러오는 중입니다.</p>
            ) : null}
            {latestMaterialization ? (
              <div className="snapshot-evidence-grid materialization-evidence-grid">
                <article>
                  <span>Status</span>
                  <strong>{latestMaterialization.status}</strong>
                  <p>{latestMaterialization.message}</p>
                </article>
                <article>
                  <span>Rows</span>
                  <strong>{latestMaterialization.row_count}</strong>
                  <p>{latestMaterialization.failed_row_count} failed · {latestMaterialization.duration_ms}ms</p>
                </article>
                <article className="snapshot-path-card">
                  <span>Output path</span>
                  <strong>{latestMaterialization.output_path}</strong>
                  <p>{formatBytes(latestMaterialization.output_bytes)} parquet</p>
                </article>
                <article className="snapshot-path-card">
                  <span>Input path</span>
                  <strong>{latestMaterialization.input_path}</strong>
                  <p>from {latestMaterialization.source_dataset_name}</p>
                </article>
              </div>
            ) : materializationState.status !== "loading" ? (
              <div className="wizard-placeholder compact">
                <FileCheck2 size={20} />
                <strong>아직 생성된 Silver output이 없습니다.</strong>
                <p>Source Snapshot이 있으면 그 결과를 우선 사용하고, 없으면 local source를 bounded read합니다.</p>
              </div>
            ) : null}
            {materializationState.error ? (
              <div className="wizard-placeholder compact danger">
                <AlertCircle size={20} />
                <strong>{materializationState.error}</strong>
              </div>
            ) : null}
          </section>
          {isDeleteMode ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{dataset.name} metadata를 삭제합니다.</strong>
              <p>Gold Dataset 설정이 참조 중이면 삭제가 차단됩니다.</p>
            </div>
          ) : null}
          <ManageError error={state.error} />
        </div>
        <ManageModalFooter mode={mode} state={state} onClose={onClose} onSave={onSave} onDelete={onDelete} />
      </section>
    </div>
  );
}

export function TargetDraftManageModal({ draft, form, mode, state, onClose, onModeChange, onFormChange, onSave, onDelete }) {
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="target-manage-title">
        <header>
          <div>
            <h2 id="target-manage-title">Gold Dataset 상세</h2>
            <p>{draft.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <ManageModeToolbar mode={mode} onModeChange={onModeChange} />
          <div className="source-manage-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Table2 size={18} />
                <div>
                  <strong>Gold Dataset metadata</strong>
                  <p>{draft.status}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>Gold Dataset 이름</span>
                <input type="text" value={form.target_dataset_name} onChange={(event) => onFormChange({ ...form, target_dataset_name: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>생성 목적</span>
                <input type="text" value={form.description} onChange={(event) => onFormChange({ ...form, description: event.target.value })} readOnly={!isEditMode} />
              </label>
              <label className="target-name-field">
                <span>데이터 기준 단위</span>
                <input type="text" value={form.target_grain} onChange={(event) => onFormChange({ ...form, target_grain: event.target.value })} readOnly={!isEditMode} />
              </label>
            </section>
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Workflow size={18} />
                <div>
                  <strong>Processing</strong>
                  <p>{draft.source_refs?.length || 0} silver inputs</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>실행 방식</span>
                <select value={form.executor_handoff} onChange={(event) => onFormChange({ ...form, executor_handoff: event.target.value })} disabled={!isEditMode}>
                  <option value="local_runner">local_runner</option>
                  <option value="airflow">airflow</option>
                  <option value="spark_runner">spark_runner</option>
                </select>
              </label>
              <label className="target-name-field">
                <span>Processing recipes</span>
                <textarea value={form.processing_recipes} onChange={(event) => onFormChange({ ...form, processing_recipes: event.target.value })} readOnly={!isEditMode} rows={5} />
              </label>
            </section>
          </div>
          <DatasetFileEvidencePanel evidence={draft.file_evidence} />
          {isDeleteMode ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{draft.target_dataset_name} metadata를 삭제합니다.</strong>
              <p>Job Run이 참조 중이면 삭제가 차단됩니다.</p>
            </div>
          ) : null}
          <ManageError error={state.error} />
        </div>
        <ManageModalFooter mode={mode} state={state} onClose={onClose} onSave={onSave} onDelete={onDelete} />
      </section>
    </div>
  );
}

function formatSnapshotCoverage(snapshot) {
  if (!snapshot) return "not created";
  if (snapshot.coverage_status === "input_exhausted_before_limit") return "source exhausted";
  if (snapshot.coverage_status === "bounded_sample_limit_reached") return "bounded sample";
  return snapshot.coverage_status || snapshot.snapshot_mode || "bounded sample";
}

export function SourceDatasetManageModal({
  dataset,
  form,
  mode,
  state,
  snapshotState,
  onClose,
  onModeChange,
  onFormChange,
  onSave,
  onDelete,
  onRunSnapshot,
}) {
  const isEditMode = mode === "edit";
  const isDeleteMode = mode === "delete";
  const isBusy = state.status === "saving" || state.status === "deleting";
  const isSnapshotRunning = snapshotState.status === "running";
  const latestSnapshot = snapshotState.snapshots[0] || null;

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="source-dataset-manage-title">
        <header>
          <div>
            <h2 id="source-dataset-manage-title">Source Dataset 상세</h2>
            <p>External Connection에서 만들어진 raw/source dataset metadata를 확인하고 관리합니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-manage-body">
          <div className="source-manage-toolbar">
            <button type="button" className={!isEditMode && !isDeleteMode ? "selected" : ""} onClick={() => onModeChange("detail")}>
              상세
            </button>
            <button type="button" className={isEditMode ? "selected" : ""} onClick={() => onModeChange("edit")}>
              수정
            </button>
            <button type="button" className={isDeleteMode ? "selected danger" : "danger"} onClick={() => onModeChange("delete")}>
              삭제
            </button>
          </div>

          <div className="source-manage-grid">
            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <Database size={18} />
                <div>
                  <strong>Dataset metadata</strong>
                  <p>{dataset.id}</p>
                </div>
              </div>
              <label className="target-name-field">
                <span>name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => onFormChange({ ...form, name: event.target.value })}
                  readOnly={!isEditMode}
                />
              </label>
              <label className="target-name-field">
                <span>raw_scope</span>
                <input
                  type="text"
                  value={form.raw_scope}
                  onChange={(event) => onFormChange({ ...form, raw_scope: event.target.value })}
                  readOnly={!isEditMode}
                />
              </label>
              <label className="target-name-field">
                <span>resource_label</span>
                <input
                  type="text"
                  value={form.resource_label}
                  onChange={(event) => onFormChange({ ...form, resource_label: event.target.value })}
                  readOnly={!isEditMode}
                />
              </label>
              <div className="source-manage-facts">
                <span>status</span>
                <strong>{dataset.status}</strong>
                <span>layer</span>
                <strong>{dataset.layer}</strong>
                <span>created_at</span>
                <strong>{dataset.created_at}</strong>
                <span>updated_at</span>
                <strong>{dataset.updated_at}</strong>
              </div>
            </section>

            <section className="wizard-inline-panel">
              <div className="table-title-line">
                <ServerCog size={18} />
                <div>
                  <strong>Connection</strong>
                  <p>{dataset.connection_id}</p>
                </div>
              </div>
              <div className="review-summary-grid source-manage-summary">
                <article>
                  <span>연결 이름</span>
                  <strong>{dataset.connection_name}</strong>
                  <p>{dataset.connection_type}</p>
                </article>
                <article>
                  <span>Schema fields</span>
                  <strong>{dataset.schema_preview?.length || 0}</strong>
                  <p>Source Dataset schema preview</p>
                </article>
              </div>
              <div className="schema-preview-table" aria-label="Managed source dataset schema preview">
                <div className="schema-preview-head">
                  <span>Field</span>
                  <span>Type</span>
                  <span>Mode</span>
                </div>
                {(dataset.schema_preview || []).map((field) => (
                  <div className="schema-preview-row" key={field.name}>
                    <strong>{field.name}</strong>
                    <span>{field.type}</span>
                    <code>read only</code>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <DatasetFileEvidencePanel evidence={dataset.file_evidence} />

          <section className="wizard-inline-panel snapshot-panel">
            <div className="snapshot-panel-header">
              <div className="table-title-line">
                <HardDrive size={18} />
                <div>
                  <strong>Raw snapshot evidence</strong>
                  <p>metadata 생성과 분리해서 실제 row/message snapshot을 저장합니다.</p>
                </div>
              </div>
              <button type="button" className="primary-action" onClick={onRunSnapshot} disabled={isSnapshotRunning || isEditMode || isDeleteMode}>
                <PlayCircle size={16} />
                {isSnapshotRunning ? "생성 중" : "Raw snapshot 생성"}
              </button>
            </div>
            {snapshotState.status === "loading" ? (
              <p className="muted-line">snapshot evidence를 불러오는 중입니다.</p>
            ) : null}
            {latestSnapshot ? (
              <div className="snapshot-evidence-grid">
                <article>
                  <span>Status</span>
                  <strong>{latestSnapshot.status}</strong>
                  <p>{latestSnapshot.message}</p>
                </article>
                <article>
                  <span>Rows</span>
                  <strong>{latestSnapshot.row_count}</strong>
                  <p>{latestSnapshot.duration_ms}ms · limit {formatMetric(latestSnapshot.row_limit || latestSnapshot.requested_sample_size)}</p>
                </article>
                <article>
                  <span>Coverage</span>
                  <strong>{formatSnapshotCoverage(latestSnapshot)}</strong>
                  <p>{formatBytes(latestSnapshot.input_bytes)} input · {latestSnapshot.input_bytes_semantics || "available_input_bytes"}</p>
                </article>
                <article className="snapshot-path-card">
                  <span>Output path</span>
                  <strong>{latestSnapshot.output_path}</strong>
                  <p>{formatBytes(latestSnapshot.output_bytes)} written</p>
                </article>
              </div>
            ) : snapshotState.status !== "loading" ? (
              <div className="wizard-placeholder compact">
                <Archive size={20} />
                <strong>아직 생성된 raw snapshot이 없습니다.</strong>
                <p>Source Dataset metadata 확인 뒤 수동 실행하면 bounded snapshot evidence가 남습니다.</p>
              </div>
            ) : null}
            {snapshotState.error ? (
              <div className="wizard-placeholder compact danger">
                <AlertCircle size={20} />
                <strong>{snapshotState.error}</strong>
              </div>
            ) : null}
          </section>

          {isDeleteMode ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{dataset.name} metadata를 삭제합니다.</strong>
              <p>이번 페이즈에서는 Source Dataset metadata만 삭제하며 downstream draft 정리는 수행하지 않습니다.</p>
            </div>
          ) : null}
          {state.error ? (
            <div className="wizard-placeholder compact danger">
              <AlertCircle size={22} />
              <strong>{state.error}</strong>
            </div>
          ) : null}
        </div>
        <footer>
          <button type="button" className="ghost-action" onClick={onClose}>
            닫기
          </button>
          {isEditMode ? (
            <button type="button" className="primary-action" onClick={onSave} disabled={isBusy}>
              <Save size={16} />
              {state.status === "saving" ? "저장 중" : "수정 저장"}
            </button>
          ) : null}
          {isDeleteMode ? (
            <button type="button" className="primary-action danger-action" onClick={onDelete} disabled={isBusy}>
              <Trash2 size={16} />
              {state.status === "deleting" ? "삭제 중" : "삭제 확인"}
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  );
}
