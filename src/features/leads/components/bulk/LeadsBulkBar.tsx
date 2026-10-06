import { BulkActionBar } from '@/components/common/BulkActionBar'
import { Button } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import type { SelectionMode } from '@/components/common/data-table'

export interface LeadsBulkBarProps {
  count: number
  total: number
  selectionMode: SelectionMode
  busy?: boolean
  onClear: () => void
  onAssign: () => void
  onChangeStatus: () => void
  onAddTags: () => void
  onRemoveTags: () => void
  onExport: () => void
  onDelete: () => void
  onFollowUp: () => void
}

export function LeadsBulkBar({
  count,
  total,
  selectionMode,
  busy,
  onClear,
  onAssign,
  onChangeStatus,
  onAddTags,
  onRemoveTags,
  onExport,
  onDelete,
  onFollowUp,
}: LeadsBulkBarProps) {
  const { can } = usePermission()
  const label =
    selectionMode === 'all'
      ? `All ${total.toLocaleString()} results selected`
      : `${count} selected`
  return (
    <BulkActionBar count={count} label={label} onClear={onClear} busy={busy}>
      <Button size="sm" variant="outline" disabled={!can('leads', 'assign')} onClick={onAssign}>
        Assign
      </Button>
      <Button size="sm" variant="outline" disabled={!can('leads', 'edit')} onClick={onChangeStatus}>
        Status
      </Button>
      <Button size="sm" variant="outline" disabled={!can('leads', 'edit')} onClick={onAddTags}>
        Add tags
      </Button>
      <Button size="sm" variant="outline" disabled={!can('leads', 'edit')} onClick={onRemoveTags}>
        Remove tags
      </Button>
      <Button size="sm" variant="outline" disabled={!can('followups', 'create')} onClick={onFollowUp}>
        Follow-up
      </Button>
      <Button size="sm" variant="outline" disabled={!can('leads', 'export')} onClick={onExport}>
        Export
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={!can('leads', 'delete')}
        onClick={onDelete}
      >
        Delete
      </Button>
    </BulkActionBar>
  )
}
