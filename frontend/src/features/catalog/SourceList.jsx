import { Database } from "lucide-react";

export function SourceList({ onSelectDataset, sources }) {
  return (
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
              onClick={() => onSelectDataset(source.dataset_id)}
            >
              <strong>{source.name}</strong>
              <span>{source.path}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
