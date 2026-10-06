import { useState } from 'react'
import { Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QueryState } from '@/components/common/QueryState'
import { Badge, Button, Pagination } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { formatDate, formatINR } from '@/lib/format'
import type { SpendEntry } from '@/types'
import { useAdHierarchy } from '../../hooks/use-ad-sets'
import { useDeleteSpend, useSpendEntries } from '../../hooks/use-spend'
import { Restricted } from '../MetricCells'
import { SpendEntryDialog } from './SpendEntryDialog'
import { SpendImportDialog } from './SpendImportDialog'

const PAGE_SIZE = 15

export function SpendTab({ campaignId }: { campaignId: string }) {
  const { can, feature } = usePermission()
  const allowed = feature('view-spend')
  const canEdit = allowed && can('campaigns', 'edit')
  const [page, setPage] = useState(1)
  const list = useSpendEntries({ campaignId, page, pageSize: PAGE_SIZE, sort: [{ field: 'date', direction: 'desc' }] }, allowed)
  const hierarchy = useAdHierarchy(campaignId)
  const remove = useDeleteSpend()
  const [editing, setEditing] = useState<SpendEntry | null>(null)
  const [dialog, setDialog] = useState(false)
  const [importing, setImporting] = useState(false)
  const [deleting, setDeleting] = useState<SpendEntry | null>(null)

  if (!allowed) return <Restricted />
  const adSet = (id?: string | null) => hierarchy.data?.adSets.find((s) => s.id === id)?.name
  const ad = (id?: string | null) => hierarchy.data?.ads.find((a) => a.id === id)?.name

  return (
    <div className="space-y-3">
      {canEdit ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => { setEditing(null); setDialog(true) }}>
            <Plus aria-hidden="true" /> Add entry
          </Button>
          <Button size="sm" variant="outline" onClick={() => setImporting(true)}>
            <Upload aria-hidden="true" /> Import CSV
          </Button>
        </div>
      ) : null}
      <QueryState
        isLoading={list.isLoading}
        isError={list.isError}
        onRetry={() => void list.refetch()}
        isEmpty={(list.data?.items.length ?? 0) === 0}
        emptyTitle="No spend recorded"
        emptyDescription="Add an entry or import a CSV to start tracking spend. Without spend, cost per lead and ROAS cannot be worked out."
        emptyAction={canEdit ? <Button onClick={() => { setEditing(null); setDialog(true) }}>Add the first entry</Button> : undefined}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Spend entries, newest first</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="px-3 py-2 font-medium">Date</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Amount</th>
                <th scope="col" className="px-3 py-2 font-medium">Ad set / ad</th>
                <th scope="col" className="px-3 py-2 font-medium">Source</th>
                <th scope="col" className="px-3 py-2 font-medium">Notes</th>
                {canEdit ? <th scope="col" className="px-3 py-2"><span className="sr-only">Actions</span></th> : null}
              </tr>
            </thead>
            <tbody>
              {(list.data?.items ?? []).map((entry) => (
                <tr key={entry.id} className="border-b border-border">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(entry.date)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatINR(entry.amount)}</td>
                  <td className="px-3 py-2">{[adSet(entry.adSetId), ad(entry.adId)].filter(Boolean).join(' / ') || 'Whole campaign'}</td>
                  <td className="px-3 py-2"><Badge size="sm" tone="neutral">{entry.source === 'synced' ? 'Synced' : 'Manual'}</Badge></td>
                  <td className="max-w-[14rem] truncate px-3 py-2 text-muted-foreground">{entry.notes || '—'}</td>
                  {canEdit ? (
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <Button size="icon-sm" variant="ghost" aria-label={`Edit entry for ${entry.date}`} onClick={() => { setEditing(entry); setDialog(true) }}><Pencil /></Button>
                      <Button size="icon-sm" variant="ghost" aria-label={`Delete entry for ${entry.date}`} onClick={() => setDeleting(entry)}><Trash2 /></Button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={list.data?.total ?? 0} onPageChange={setPage} onPageSizeChange={() => setPage(1)} />
      </QueryState>
      <SpendEntryDialog open={dialog} campaignId={campaignId} entry={editing} onOpenChange={setDialog} />
      <SpendImportDialog open={importing} campaignId={campaignId} onOpenChange={setImporting} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => { if (!open) setDeleting(null) }}
        title="Delete spend entry?"
        description={deleting ? `${formatINR(deleting.amount)} on ${formatDate(deleting.date)} will be removed from the totals.` : ''}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  )
}
