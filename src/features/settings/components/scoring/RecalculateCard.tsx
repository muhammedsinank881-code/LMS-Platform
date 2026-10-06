import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button, ProgressBar } from '@/components/ui'
import { useRecalculation, useStartRecalculation } from '../../hooks/use-scoring'

const LABEL = { hot: 'Hot', warm: 'Warm', cold: 'Cold' } as const

/** Re-scores every lead as a background-style job with progress and a summary of category changes. */
export function RecalculateCard({ canEdit }: { canEdit: boolean }) {
  const start = useStartRecalculation()
  const [jobId, setJobId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const polled = useRecalculation(jobId)
  const job = polled.data ?? start.data
  const running = start.isPending || (job?.status === 'running')

  return (
    <section aria-label="Recalculate all leads" className="space-y-3 rounded-md border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Recalculate all leads</h3>
          <p className="text-sm text-muted-foreground">
            Rule, threshold and decay changes apply to new activity straight away. Run this to re-score every existing lead now.
          </p>
        </div>
        <Button disabled={!canEdit || running} loading={start.isPending} onClick={() => setConfirming(true)}>
          Recalculate all leads
        </Button>
      </div>
      {job ? (
        <div aria-live="polite" className="space-y-2">
          <ProgressBar value={job.total === 0 ? 100 : job.processed} max={job.total === 0 ? 100 : job.total} label={job.status === 'completed' ? 'Done' : 'Recalculating…'} showValue />
          <p className="text-sm text-muted-foreground">
            {job.processed} of {job.total} leads checked
          </p>
          {job.status === 'completed' ? (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="font-medium">
                {job.scoreChanges} {job.scoreChanges === 1 ? 'score' : 'scores'} changed, {job.categoryChanges} {job.categoryChanges === 1 ? 'lead' : 'leads'} changed category.
              </p>
              {job.moves.length > 0 ? (
                <ul className="mt-1 list-inside list-disc">
                  {job.moves.map((move) => (
                    <li key={`${move.from}-${move.to}`}>
                      {LABEL[move.from]} to {LABEL[move.to]}: {move.count}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No lead moved between hot, warm and cold.</p>
              )}
              <p className="mt-1 text-muted-foreground">A timeline entry was added for leads that changed category, and the run was written to the audit log.</p>
            </div>
          ) : null}
        </div>
      ) : null}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Recalculate every lead?"
        description="Scores are recomputed with the current rules. Leads that change category get a timeline entry."
        confirmLabel="Recalculate"
        onConfirm={() =>
          start.mutate(undefined, {
            onSuccess: (created) => {
              setJobId(created.id)
              setConfirming(false)
            },
          })
        }
      />
    </section>
  )
}
