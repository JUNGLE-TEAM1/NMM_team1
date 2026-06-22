export function CatalogDetail({ dataset }) {
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
