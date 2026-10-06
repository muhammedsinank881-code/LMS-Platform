import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { QueryState } from '@/components/common/QueryState'
import { Badge } from '@/components/ui'
import { formatDateTime } from '@/lib/format/date'
import { useFormSubmissions } from '../hooks/use-lead-forms'

function UtmText({ utm }: { utm: Record<string, string | undefined> }) {
  const parts = Object.entries(utm).filter(([, value]) => value)
  return <span className="text-muted-foreground">{parts.length === 0 ? 'Direct' : parts.map(([key, value]) => `${key}: ${value}`).join(' · ')}</span>
}

/** Totals, a 14-day trend and the latest submissions with a link to the lead each one created. */
export function SubmissionsPanel({ formId }: { formId: string | null }) {
  const query = useFormSubmissions(formId)
  if (!formId) return <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">Submissions appear once the form is saved and published.</p>
  const summary = query.data
  const max = Math.max(1, ...(summary?.daily.map((day) => day.count) ?? [1]))
  return (
    <QueryState isLoading={query.isLoading} isError={query.isError} onRetry={() => void query.refetch()} isEmpty={summary?.total === 0} emptyIcon={Inbox} emptyTitle="No submissions yet" emptyDescription="Share the link or embed the form to start collecting leads." size="sm">
      {summary ? (
        <div className="space-y-5">
          <p className="text-sm"><span className="text-2xl font-semibold">{summary.total}</span> <span className="text-muted-foreground">submissions in total</span></p>
          <figure aria-label="Submissions per day, last 14 days" className="space-y-1">
            <div className="flex h-24 items-end gap-1" role="img" aria-label={`Submissions per day: ${summary.daily.map((day) => day.count).join(', ')}`}>
              {summary.daily.map((day) => (
                <div key={day.date} title={`${day.date}: ${day.count}`} className="flex-1 rounded-t bg-primary/70" style={{ height: `${Math.max(4, (day.count / max) * 100)}%` }} />
              ))}
            </div>
            <figcaption className="text-xs text-muted-foreground">Last 14 days</figcaption>
          </figure>
          <ul className="divide-y divide-border rounded-md border border-border">
            {summary.latest.map((submission) => (
              <li key={submission.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <div className="min-w-0 space-y-0.5">
                  <p>{formatDateTime(submission.at)}</p>
                  <p className="truncate text-xs"><UtmText utm={submission.utm} /></p>
                </div>
                <div className="flex items-center gap-2">
                  {submission.duplicate ? <Badge size="sm" tone="warning">Duplicate</Badge> : null}
                  {submission.leadId ? <Link className="text-primary underline-offset-4 hover:underline" to={`/leads/${submission.leadId}`}>{submission.leadId}</Link> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </QueryState>
  )
}
