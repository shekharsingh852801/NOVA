export function StatCard({ label, value, change }) {
  return (
    <div className="admin-card metric-card">
      <div className="metric-card__header">
        <span>{label}</span>
        <span className="trend up">{change}</span>
      </div>
      <div className="metric-card__value">{value}</div>
    </div>
  );
}

export function TableCard({ title, columns, rows, emptyText }) {
  return (
    <div className="admin-card table-card">
      <div className="panel-header">
        <h3>{title}</h3>
        <button type="button" className="ghost-button">View all</button>
      </div>
      {rows.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id || row.name || row.order || row.sku}>
                  {columns.map((column) => (
                    <td key={`${row.id || row.name || row.order || row.sku}-${column}`}>
                      {row[column.toLowerCase().replace(/\s+/g, '_')] ?? row[column] ?? '-' }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">{emptyText}</div>
      )}
    </div>
  );
}
