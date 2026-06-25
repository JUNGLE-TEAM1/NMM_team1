import { FilePlus2, RefreshCw } from "lucide-react";

export function SourceForm({ form, onChange, onRefresh, onSubmit, submitting }) {
  function updateType(type) {
    onChange({
      ...form,
      type,
      path: type === "json" ? "" : "samples/orders.csv",
    });
  }

  return (
    <section className="toolbar">
      <form className="source-form" onSubmit={onSubmit}>
        <label>
          <span>Source 이름</span>
          <input
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          <span>Type</span>
          <select value={form.type} onChange={(event) => updateType(event.target.value)}>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </label>
        <label>
          <span>File 경로</span>
          <input
            value={form.path}
            onChange={(event) => onChange({ ...form, path: event.target.value })}
          />
        </label>
        <button type="submit" disabled={submitting}>
          <FilePlus2 size={18} aria-hidden="true" />
          <span>{submitting ? "등록 중" : "등록"}</span>
        </button>
      </form>
      <button type="button" className="icon-button" onClick={() => onRefresh()} title="새로고침">
        <RefreshCw size={18} aria-hidden="true" />
      </button>
    </section>
  );
}
