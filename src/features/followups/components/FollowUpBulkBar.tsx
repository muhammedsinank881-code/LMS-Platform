import { useState } from 'react'
import { BulkActionBar } from '@/components/common/BulkActionBar'
import { Button, Select } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'

export function FollowUpBulkBar({
  count,
  users,
  busy,
  onClear,
  onDone,
  onReschedule,
  onReassign,
}: {
  count: number
  users: Array<{ id: string; name: string }>
  busy?: boolean
  onClear: () => void
  onDone: () => void
  onReschedule: () => void
  onReassign: (userId: string) => void
}) {
  const { can } = usePermission()
  const [assignee, setAssignee] = useState(users[0]?.id ?? '')
  if (count === 0) return null
  return (
    <BulkActionBar count={count} label={`${count} selected`} onClear={onClear} busy={busy}>
      <Button size="sm" variant="outline" disabled={!can('followups', 'edit')} onClick={onDone}>
        Mark done
      </Button>
      <Button size="sm" variant="outline" disabled={!can('followups', 'edit')} onClick={onReschedule}>
        Reschedule
      </Button>
      {can('followups', 'assign') ? (
        <div className="flex items-center gap-2">
          <Select
            aria-label="Reassign to"
            value={assignee}
            onValueChange={setAssignee}
            options={users.map((user) => ({ value: user.id, label: user.name }))}
          />
          <Button size="sm" variant="outline" disabled={!assignee} onClick={() => onReassign(assignee)}>
            Reassign
          </Button>
        </div>
      ) : null}
    </BulkActionBar>
  )
}
