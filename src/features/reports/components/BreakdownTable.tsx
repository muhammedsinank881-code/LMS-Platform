import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { BreakdownRow } from '@/types'

export function BreakdownTable({
  rows,
  onSelect,
}: {
  rows: BreakdownRow[]
  onSelect: (key: string) => void
}) {
  const total = rows.reduce((sum, row) => sum + row.count, 0)
  return (
    <Card size="sm" className="h-full w-full min-w-0">
      <CardHeader>
        <CardTitle>Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 sm:hidden">
          {rows.map((row) => {
            const share = total > 0 ? `${Math.round((row.count / total) * 100)}%` : '—'
            return (
              <li key={row.key}>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-border px-3 text-left"
                  onClick={() => onSelect(row.key)}
                >
                  <span className="font-medium">{row.label}</span>
                  <span className="text-sm text-muted-foreground">{row.count} · {share}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 font-medium" scope="col">Name</th>
                <th className="py-2 font-medium" scope="col">Count</th>
                <th className="py-2 font-medium" scope="col">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-0">
                  <td className="py-2">
                    <button type="button" className="hover:underline" onClick={() => onSelect(row.key)}>
                      {row.label}
                    </button>
                  </td>
                  <td className="py-2 tabular-nums">{row.count}</td>
                  <td className="py-2 tabular-nums">{total > 0 ? `${Math.round((row.count / total) * 100)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
