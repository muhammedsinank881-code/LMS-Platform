import { useState } from 'react'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { NoAccess } from '@/components/common/NoAccess'
import { ReassignOnDeleteDialog } from '@/components/common/ReassignOnDeleteDialog'
import { SortableList } from '@/components/common/LazySortableList'
import { queryBlocked } from '@/components/common/query-blocked'
import { Badge, Button, Input, Switch, toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import type { SettingsSection } from '@/types'
import { SectionIntro } from '../components/SettingsLayout'
import {
  useCreateLostReason,
  useDeleteLostReason,
  useLostReasons,
  useReorderLostReasons,
  useUpdateLostReason,
} from '../hooks/use-settings'

export function LostReasonsSettingsPage() {
  return (
    <ReasonList
      section="lost_reasons"
      title="Lost reasons"
      description="Seeded reasons stay until nothing uses them. Disable a reason to hide it from pickers."
    />
  )
}

function ReasonList({ section, title, description }: { section: SettingsSection; title: string; description: string }) {
  const { canSection } = usePermission()
  const reasons = useLostReasons()
  const create = useCreateLostReason()
  const update = useUpdateLostReason()
  const remove = useDeleteLostReason()
  const reorder = useReorderLostReasons()
  const [name, setName] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  if (!canSection(section)) return <NoAccess />
  const blocked = queryBlocked(reasons)
  if (blocked) return blocked
  const rows = reasons.data ?? []
  const target = rows.find((row) => row.id === pending)
  return (
    <div>
      <SectionIntro title={title} description={description} />
      <ControlRow className="mb-4">
        <ControlField grow label="New reason">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Reason" />
        </ControlField>
        <Button className="shrink-0" onClick={() => name.trim() && create.mutate({ name: name.trim(), isActive: true }, { onSuccess: () => { setName(''); toast.success('Reason added') } })}>Add</Button>
      </ControlRow>
      <SortableList
        items={rows}
        onReorder={(ids) => reorder.mutateAsync(ids)}
        renderItem={(reason) => (
          <ControlRow>
            <ControlField grow label="Name">
              <Input defaultValue={reason.name} onBlur={(event) => event.target.value !== reason.name && update.mutate({ id: reason.id, patch: { name: event.target.value } })} />
            </ControlField>
            <Switch checked={reason.isActive} onCheckedChange={(isActive) => update.mutate({ id: reason.id, patch: { isActive } })} aria-label={`Enable ${reason.name}`} />
            <Badge>{reason.usageCount ?? 0} uses</Badge>
            <Button className="shrink-0" variant="outline" onClick={() => setPending(reason.id)}>Delete</Button>
          </ControlRow>
        )}
      />
      <ReassignOnDeleteDialog
        open={target !== undefined}
        onOpenChange={(open) => !open && setPending(null)}
        title="Delete lost reason"
        name={target?.name ?? ''}
        count={target?.usageCount ?? 0}
        options={[]}
        loading={remove.isPending}
        onConfirm={() => target && remove.mutate(target.id, { onSuccess: () => { setPending(null); toast.success('Reason deleted') } })}
      />
    </div>
  )
}
