import { useState } from 'react'
import { ColorPicker } from '@/components/common/ColorPicker'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { NoAccess } from '@/components/common/NoAccess'
import { ReassignOnDeleteDialog } from '@/components/common/ReassignOnDeleteDialog'
import { queryBlocked } from '@/components/common/query-blocked'
import { SortableList } from '@/components/common/LazySortableList'
import { Badge, Button, EmptyState, Input, Select, toast } from '@/components/ui'
import { Inbox } from 'lucide-react'
import { COLOR_PRESETS } from '@/lib/settings/palette'
import { usePermission } from '@/hooks/use-permission'
import { LEAD_STATUS_TYPES, type LeadStatus } from '@/types'
import { SectionIntro } from '../components/SettingsLayout'
import { useUpdateWorkspaceSettings, useWorkspaceSettings } from '../hooks/use-settings'
import {
  useCreateStatus,
  useDeleteStatus,
  useReorderStatuses,
  useStatuses,
  useUpdateStatus,
} from '../hooks/use-lead-config'

const TYPES = LEAD_STATUS_TYPES.map((value) => ({ value, label: value }))

export function StatusesSettingsPage() {
  const { canSection } = usePermission()
  const statuses = useStatuses()
  const reorder = useReorderStatuses()
  const create = useCreateStatus()
  const update = useUpdateStatus()
  const remove = useDeleteStatus()
  const workspace = useWorkspaceSettings()
  const saveWorkspace = useUpdateWorkspaceSettings()
  const [name, setName] = useState('')
  const [pending, setPending] = useState<LeadStatus | null>(null)
  if (!canSection('statuses')) return <NoAccess />
  const blocked = queryBlocked(statuses)
  if (blocked) return blocked
  const rows = statuses.data ?? []
  return (
    <div>
      <SectionIntro title="Lead statuses" description="At least one won and one lost status must remain. The default is used for new leads." />
      <ControlRow className="mb-4">
        <ControlField grow label="New status">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Status name" />
        </ControlField>
        <Button
          className="shrink-0"
          onClick={() => {
            const label = name.trim()
            if (!label) return
            create.mutate(
              { name: label, color: COLOR_PRESETS[0], type: 'open' },
              { onSuccess: () => { setName(''); toast.success('Status added') } },
            )
          }}
        >
          Add status
        </Button>
        <ControlField label="Default status">
          <Select
            value={workspace.data?.defaultStatusId ?? rows[0]?.id ?? ''}
            options={rows.map((row) => ({ value: row.id, label: row.name }))}
            onValueChange={(defaultStatusId) => saveWorkspace.mutate({ defaultStatusId }, { onSuccess: () => toast.success('Default status saved') })}
          />
        </ControlField>
      </ControlRow>
      {rows.length === 0 ? <EmptyState icon={Inbox} title="No statuses yet" description="Add a status to track where a lead stands." /> : null}
      <SortableList
        items={rows}
        label="Lead statuses"
        onReorder={(orderedIds) => reorder.mutateAsync(orderedIds)}
        renderItem={(status) => (
          <ControlRow>
            <ControlField grow label="Name">
              <Input defaultValue={status.name} onBlur={(event) => event.target.value !== status.name && update.mutate({ id: status.id, patch: { name: event.target.value } })} />
            </ControlField>
            <ControlField label="Type">
              <Select value={status.type} options={TYPES} onValueChange={(type) => update.mutate({ id: status.id, patch: { type: type as LeadStatus['type'] } })} />
            </ControlField>
            <Badge>{status.usageCount ?? 0} leads</Badge>
            <ColorPicker value={status.color} onChange={(color) => update.mutate({ id: status.id, patch: { color } })} />
            <Button className="shrink-0" variant="outline" onClick={() => setPending(status)}>Delete</Button>
          </ControlRow>
        )}
      />
      <ReassignOnDeleteDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Delete status"
        name={pending?.name ?? ''}
        count={pending?.usageCount ?? 0}
        options={rows.filter((row) => row.id !== pending?.id).map((row) => ({ value: row.id, label: row.name }))}
        loading={remove.isPending}
        onConfirm={(replacementId) => {
          if (!pending) return
          remove.mutate(replacementId ? { id: pending.id, replacementId } : pending.id, {
            onSuccess: () => { setPending(null); toast.success('Status deleted') },
          })
        }}
      />
    </div>
  )
}
