export interface SummaryColumn {
  key: string
  label: string
}

export function ChartSummary({
  caption,
  columns,
  rows,
}: {
  caption: string
  columns: SummaryColumn[]
  rows: string[][]
}) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={`${row[0] ?? 'row'}-${index}`}>
            {row.map((cell, cellIndex) => (
              <td key={`${columns[cellIndex]?.key ?? cellIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
