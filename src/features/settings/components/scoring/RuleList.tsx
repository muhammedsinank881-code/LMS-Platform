import { useState } from 'react'
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { SortableList } from '@/components/common/LazySortableList'
import { Badge, Button, EmptyState, Switch, toast } from '@/components/ui'
import { describeScoringRule } from '@/lib/scoring'
import { useAutomationRefs } from '@/features/automations/hooks/use-automation-refs'
import type { ScoringRule } from '@/types'
import {
  useDeleteScoringRule,
  useReorderScoringRules,
  useScoringRules,
  useUpdateScoringRule,
} from '../../hooks/use-settings'
import { useScoringUsage } from '../../hooks/use-scoring'
import { RuleDrawer } from './RuleDrawer'

/** Rules in the order they are evaluated. Drag to reorder; each shows how many leads match it now. */
export function RuleList({ canEdit }: { canEdit: boolean }) {
  const rules = useScoringRules()
  const usage = useScoringUsage()
  const refs = useAutomationRefs()
  const update = useUpdateScoringRule()
  const reorder = useReorderScoringRules()
  const remove = useDeleteScoringRule()
  const [editing, setEditing] = useState<ScoringRule | null>(null)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<ScoringRule | null>(null)
  const rows = rules.data ?? []

  return (
    <section aria-label="Scoring rules" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Points add up to the lead score (0 to 100). Rules run top to bottom.</p>
        <Button size="sm" disabled={!canEdit} onClick={() => setAdding(true)}>
          <Plus />
          Add rule
        </Button>
      </div>
      {rules.isLoading ? (
        <div role="status" aria-label="Loading rules" className="h-24 animate-pulse rounded-md bg-muted" />
      ) : rules.isError ? (
        <EmptyState tone="destructive" title="Could not load rules" description="Check your connection and try again." action={<Button onClick={() => void rules.refetch()}>Retry</Button>} />
      ) : rows.length === 0 ? (
        <EmptyState icon={Sparkles} title="No scoring rules yet" description="Add a rule to start scoring leads." action={canEdit ? <Button onClick={() => setAdding(true)}>Add rule</Button> : undefined} />
      ) : (
        <SortableList
          label="Scoring rules"
          items={rows}
          disabled={!canEdit}
          onReorder={(ids) => reorder.mutateAsync(ids)}
          renderItem={(rule) => (
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{rule.name}</p>
                <p className="truncate text-sm text-muted-foreground">{describeScoringRule(rule, refs.lookups)}</p>
              </div>
              <Badge size="sm" tone={rule.points >= 0 ? 'success' : 'destructive'}>
                {rule.points > 0 ? `+${rule.points}` : rule.points} points
              </Badge>
              <span className="text-sm tabular-nums text-muted-foreground" aria-label={`${usage.data?.[rule.id] ?? 0} leads match this rule`}>
                {usage.data ? `${usage.data[rule.id] ?? 0} leads` : '…'}
              </span>
              <Switch
                size="sm"
                checked={rule.isActive}
                disabled={!canEdit}
                aria-label={`${rule.name} is ${rule.isActive ? 'on' : 'off'}`}
                onCheckedChange={(isActive) => update.mutate({ id: rule.id, patch: { isActive } })}
              />
              <Button size="icon-sm" variant="ghost" disabled={!canEdit} aria-label={`Edit ${rule.name}`} onClick={() => setEditing(rule)}>
                <Pencil />
              </Button>
              <Button size="icon-sm" variant="ghost" disabled={!canEdit} aria-label={`Delete ${rule.name}`} onClick={() => setDeleting(rule)}>
                <Trash2 />
              </Button>
            </div>
          )}
        />
      )}
      {adding ? <RuleDrawer key="new" rule={null} open onOpenChange={(open) => !open && setAdding(false)} /> : null}
      {editing ? <RuleDrawer key={editing.id} rule={editing} open onOpenChange={(open) => !open && setEditing(null)} /> : null}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete "${deleting?.name ?? ''}"?`}
        description="Existing scores keep their value until you recalculate."
        confirmLabel="Delete rule"
        destructive
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate({ id: deleting.id }, { onSuccess: () => { setDeleting(null); toast.success('Rule deleted') } })}
      />
    </section>
  )
}
