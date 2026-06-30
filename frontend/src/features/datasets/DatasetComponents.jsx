import { useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Clock3,
  Database,
  FileCheck2,
  HardDrive,
  Layers3,
  ListChecks,
  Loader2,
  Play,
  PlayCircle,
  RefreshCw,
  Save,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  Workflow,
  Wrench,
  X,
} from "lucide-react";

import { EmptyState } from "../../design-system";
import { formatBytes, formatMetric } from "../../app/formatters";
import { sourceSortOptions, sourceTypeOptions } from "./datasetConfig";

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

export function DraftColumn({ title, count, records, empty }) {
  return (
    <article className="dataset-draft-column">
      <header>
        <div>
          <strong>{title}</strong>
          <p>{count} saved</p>
        </div>
        <span>{count}</span>
      </header>
      {records.length > 0 ? (
        <div className="dataset-draft-list">
          {records.map((record) => (
            <div className="dataset-draft-item" key={record.id}>
              <strong>{record.title}</strong>
              <p>{record.meta}</p>
              <small>{record.detail}</small>
            </div>
          ))}
        </div>
      ) : (
        <div className="dataset-draft-empty">
          <Database size={18} />
          <p>{empty}</p>
        </div>
      )}
    </article>
  );
}

export function OperationalList({ icon: Icon, title, body, records, empty, onRefresh, loading, layout = "grid" }) {
  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <Icon size={20} />
          <div>
            <strong>{title}</strong>
            <p>{body}</p>
          </div>
        </div>
        <div className="table-card-actions">
          <span className="badge slate">{loading ? "조회 중" : `${records.length} items`}</span>
          {onRefresh ? (
            <button type="button" className="ghost-action" onClick={onRefresh}>
              <RefreshCw size={16} />
              새로고침
            </button>
          ) : null}
        </div>
      </div>
      {records.length > 0 ? (
        <div className={`operational-list-grid ${layout === "list" ? "list-layout" : ""}`}>
          {records.map((record) => (
            <article
              className={`operational-list-item ${record.facts?.length ? "fact-card" : ""} ${record.variant || ""}`}
              key={record.id}
            >
              <strong>{record.title}</strong>
              <p>{record.meta}</p>
              {record.facts?.length ? (
                <div className="fact-card-grid">
                  {record.facts.map(([label, value]) => (
                    <div className={`fact-card-item ${isWideFact(label, value) ? "wide" : ""}`} key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <small>{record.detail}</small>
              )}
              {record.actions?.length ? (
                <div className="operational-list-actions">
                  {record.actions.map((action) => {
                    const ActionIcon = action.icon || Play;
                    return (
                      <button
                        type="button"
                        className={`ghost-action ${action.danger ? "danger-action" : ""}`}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        key={action.label}
                      >
                        {action.label}
                        <ActionIcon size={15} />
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {record.onAction ? (
                <button type="button" className="ghost-action" onClick={record.onAction} disabled={record.actionDisabled}>
                  {record.actionLabel}
                  <Play size={15} />
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="dataset-draft-empty operational-empty">
          <Icon size={20} />
          <p>{empty}</p>
        </div>
      )}
    </section>
  );
}

function isWideFact(label, value) {
  const normalizedLabel = String(label || "").toLowerCase();
  const text = String(value || "");
  const isPathValue = text.includes("/") || text.includes("s3://");
  if (["path", "raw scope", "run id"].includes(normalizedLabel)) return true;
  if (["input", "output"].includes(normalizedLabel)) return isPathValue;
  return isPathValue;
}

export function ProductHealthPresetPanel({ state, onRun }) {
  const result = state.result;
  const artifactCount = result?.artifacts?.filter((artifact) => artifact.status === "ready").length || 0;
  const seedArtifact = result?.artifacts?.find((artifact) => artifact.role === "seed_product_mapping");
  const isRunning = state.status === "running";

  return (
    <section className="wizard-inline-panel product-health-preset-panel">
      <div className="table-title-line">
        <Sparkles size={18} />
        <div>
          <strong>Product Health Demo preset</strong>
          <p>기존 합성 로직으로 seed mapping, Silver parquet, Gold parquet, catalog/evidence 준비 파일을 재생성합니다.</p>
        </div>
      </div>
      <div className="fact-card-grid preset-fact-grid">
        <div className="fact-card-item wide">
          <span>Gold output</span>
          <strong>{result?.gold_output?.path || "data/local_sources/product_health/gold/gold_product_health.parquet"}</strong>
        </div>
        <div className="fact-card-item">
          <span>Rows</span>
          <strong>{formatMetric(result?.gold_output?.row_count || "ready after run")}</strong>
        </div>
        <div className="fact-card-item">
          <span>Artifacts</span>
          <strong>{artifactCount ? `${artifactCount} ready` : "not run"}</strong>
        </div>
        <div className="fact-card-item wide">
          <span>Seed mapping</span>
          <strong>{seedArtifact?.path || "data/local_sources/product_health/silver/seed_product_mapping.parquet"}</strong>
        </div>
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {result ? (
        <p className="runtime-note">
          {result.run_id} · {result.mode} · SQL smoke {formatMetric(result.sql_smoke?.row_count)} rows
        </p>
      ) : null}
      <div className="operational-list-actions">
        <button type="button" className="primary-action" onClick={onRun} disabled={isRunning}>
          {isRunning ? <Loader2 size={16} className="spin" /> : <PlayCircle size={16} />}
          {isRunning ? "합성 실행 중" : "Product Health preset 실행"}
        </button>
      </div>
    </section>
  );
}


export function CredentialSecretPolicyPanel({ policy }) {
  const blockedUntil = policy?.blocked_until || [
    "secret storage backend is selected",
    "DB/S3 connector runtime is implemented",
    "error redaction tests are added",
  ];
  const forbiddenFields = policy?.forbidden_request_fields || ["password", "access_key", "secret_key", "token", "raw_credential"];
  const requiredReferences = policy?.required_references || {
    database: ["host_ref", "username_ref", "password_ref"],
    object_storage: ["endpoint_ref", "access_key_ref", "secret_key_ref"],
  };

  return (
    <section className="pipeline-table-card operational-list-card">
      <div className="table-card-header">
        <div className="table-title-line">
          <ShieldCheck size={20} />
          <div>
            <strong>Credential Secret Boundary</strong>
            <p>DB/S3 연결은 실제 credential 값을 저장하지 않고 secret_ref 계약으로만 후속 연결합니다.</p>
          </div>
        </div>
        <span className="badge slate">{policy?.status || "secret_ref_design_only"}</span>
      </div>

      <div className="review-summary-grid source-manage-summary">
        <article>
          <span>storage</span>
          <strong>{policy?.credential_storage || "secret_ref_only"}</strong>
          <p>local env name 또는 future secret store reference만 metadata로 남깁니다.</p>
        </article>
        <article>
          <span>raw values</span>
          <strong>{policy?.secret_value_storage || "forbidden"}</strong>
          <p>요청, 응답, 로그, metadata DB에 원문 값을 넣지 않습니다.</p>
        </article>
        <article>
          <span>inspect</span>
          <strong>{policy?.inspect_requires_secret_ref ? "secret_ref required" : "not configured"}</strong>
          <p>secret backend가 정해지기 전 DB/S3 schema discovery는 blocked입니다.</p>
        </article>
        <article>
          <span>connection test</span>
          <strong>{policy?.connection_test_enabled ? "enabled" : "disabled"}</strong>
          <p>실제 접속 테스트는 redaction test와 connector runtime 이후에 붙입니다.</p>
        </article>
      </div>

      <div className="source-manage-grid">
        <section className="wizard-inline-panel">
          <div className="table-title-line">
            <ListChecks size={18} />
            <div>
              <strong>Required references</strong>
              <p>값이 아니라 reference 이름만 다룹니다.</p>
            </div>
          </div>
          <div className="dataset-draft-list compact-list">
            {Object.entries(requiredReferences).map(([connector, refs]) => (
              <div className="dataset-draft-item" key={connector}>
                <strong>{connector}</strong>
                <p>{refs.join(", ")}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="wizard-inline-panel muted-panel">
          <div className="table-title-line">
            <AlertCircle size={18} />
            <div>
              <strong>Blocked until</strong>
              <p>{policy?.local_env_policy || "env var name은 허용하지만 env 값은 commit/log에 남기지 않습니다."}</p>
            </div>
          </div>
          <div className="dataset-draft-list compact-list">
            {blockedUntil.map((item) => (
              <div className="dataset-draft-item" key={item}>
                <strong>{item}</strong>
                <p>후속 구현 전 확인 필요</p>
              </div>
            ))}
            <div className="dataset-draft-item">
              <strong>Forbidden request fields</strong>
              <p>{forbiddenFields.join(", ")}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}


export function DatasetTypeChoiceModal({ onClose, onSelect }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal dataset-type-modal" role="dialog" aria-modal="true" aria-labelledby="dataset-type-title">
        <header>
          <div>
            <h2 id="dataset-type-title">무엇을 만들까요?</h2>
            <p>외부 연결, raw/source dataset, 가공 결과 dataset의 역할을 분리해서 준비합니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="dataset-type-options">
          <button type="button" onClick={() => onSelect("connection")}>
            <span className="dataset-type-icon">
              <ServerCog size={22} />
            </span>
            <strong>External Connection</strong>
            <p>Local File, Local Folder, Kafka Topic 연결 설정을 준비합니다.</p>
            <small>{"Connector Type -> Configure -> Review"}</small>
          </button>
          <button type="button" onClick={() => onSelect("source")}>
            <span className="dataset-type-icon">
              <Database size={22} />
            </span>
            <strong>Source Dataset</strong>
            <p>등록된 External Connection에서 raw/source dataset을 만듭니다.</p>
            <small>{"Connection 선택 -> Raw Dataset 설정 -> Review"}</small>
          </button>
          <button type="button" onClick={() => onSelect("silver")}>
            <span className="dataset-type-icon">
              <Layers3 size={22} />
            </span>
            <strong>Silver Dataset</strong>
            <p>Source Dataset을 표준화/검증한 중간 dataset metadata를 만듭니다.</p>
            <small>{"Source 선택 -> Rules 설정 -> Review"}</small>
          </button>
          <button type="button" onClick={() => onSelect("target")}>
            <span className="dataset-type-icon">
              <Table2 size={22} />
            </span>
            <strong>Gold Dataset</strong>
            <p>Silver Dataset을 조합해 Gold Dataset과 Build Job 설정을 준비합니다.</p>
            <small>{"Overview -> Silver 선택 -> Process -> 실행 준비 -> Scheduling -> Review"}</small>
          </button>
        </div>
      </section>
    </div>
  );
}

export function SourceStartModal({ sources, onClose, onSelect, onCreateNew }) {
  const [selectedType, setSelectedType] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const visibleSources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredSources = sources.filter((source) => {
      const matchesType = selectedType === "all" || source.sourceType === selectedType;
      const matchesQuery =
        !normalizedQuery ||
        [source.name, source.typeLabel, source.status, source.description, source.resource]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesType && matchesQuery;
    });

    return [...filteredSources].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }

      if (sortBy === "columns") {
        return b.columns.length - a.columns.length || a.name.localeCompare(b.name);
      }

      return b.updatedRank - a.updatedRank;
    });
  }, [query, selectedType, sortBy, sources]);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="source-modal source-modal-wide" role="dialog" aria-modal="true" aria-labelledby="source-modal-title">
        <header>
          <div>
            <h2 id="source-modal-title">등록된 Source Dataset 선택</h2>
            <p>Gold Dataset의 입력으로 사용할 등록된 Source Dataset을 고릅니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </header>
        <div className="source-picker-body">
          <div className="source-type-grid" aria-label="Source type filter">
            {sourceTypeOptions.map((type) => (
              <button
                key={type.id}
                type="button"
                className={selectedType === type.id ? "active" : ""}
                onClick={() => setSelectedType(type.id)}
              >
                <strong>{type.label}</strong>
                <small>{type.description}</small>
              </button>
            ))}
          </div>
          <div className="source-picker-toolbar">
            <label className="source-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="dataset 검색"
                aria-label="dataset 검색"
              />
            </label>
            <label>
              <span>종류</span>
              <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                {sourceTypeOptions.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>정렬</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                {sourceSortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {visibleSources.length > 0 ? (
            <div className="source-card-grid">
              {visibleSources.map((source) => (
                <button key={source.id} type="button" className="source-card" onClick={() => onSelect(source)}>
                  <div className="source-card-head">
                    <span className="source-card-icon">
                      <Database size={18} aria-hidden="true" />
                    </span>
                    <span className="source-card-badge">{source.typeLabel}</span>
                  </div>
                  <strong>{source.name}</strong>
                  <p>{source.description}</p>
                  <div className="source-card-meta">
                    <span>{source.status}</span>
                    <span>{source.columns.length} columns</span>
                  </div>
                  <small>{source.resource}</small>
                  <small>수정 {source.updatedLabel}</small>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Database}
              title="조건에 맞는 dataset이 없습니다"
              body="전체 보기로 바꾸거나 검색어를 줄여서 다시 확인합니다."
            />
          )}
        </div>
        <footer>
          <button type="button" className="ghost-action" onClick={onClose}>
            취소
          </button>
          <button type="button" className="primary-action" onClick={onCreateNew}>
            Source Dataset 생성
            <ArrowRight size={16} />
          </button>
        </footer>
      </section>
    </div>
  );
}
