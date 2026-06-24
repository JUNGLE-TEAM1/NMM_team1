export function CatalogDetail({ dataset }) {
  const trustGate = dataset.trust_gate_result;

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

      <section className="trust-panel" aria-label="Dataset trust status">
        <div className="trust-heading">
          <div>
            <span>Trust</span>
            <strong>{dataset.trust_status}</strong>
          </div>
          <small>{dataset.owner}</small>
        </div>
        {trustGate ? (
          <div className="gate-grid">
            <div>
              <span>Passed</span>
              <strong>{trustGate.passed_gates.length}</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{trustGate.failed_gates.length}</strong>
            </div>
            <p>{trustGate.reasons.join(", ")}</p>
          </div>
        ) : null}
      </section>

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
