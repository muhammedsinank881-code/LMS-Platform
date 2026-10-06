import { useState } from 'react'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { IconPicker } from '@/components/common/IconPicker'
import { NoAccess } from '@/components/common/NoAccess'
import { ReassignOnDeleteDialog } from '@/components/common/ReassignOnDeleteDialog'
import { SourceIcon } from '@/components/common/SourceIcon'
import { queryBlocked } from '@/components/common/query-blocked'
import { Badge, Button, EmptyState, Input, Switch, toast } from '@/components/ui'
import { Inbox } from 'lucide-react'
import { usePermission } from '@/hooks/use-permission'
import type { LeadSource } from '@/types'
import { SectionIntro } from '../components/SettingsLayout'
import { useCreateSource, useDeleteSource, useSources, useUpdateSource } from '../hooks/use-lead-config'

export function SourcesSettingsPage() {
  const { canSection } = usePermission()
  const sources = useSources()
  const create = useCreateSource()
  const update = useUpdateSource()
  const remove = useDeleteSource()
  const [name, setName] = useState('')
  const [pending, setPending] = useState<LeadSource | null>(null)
  if (!canSection('sources')) return <NoAccess />
  const blocked = queryBlocked(sources)
  if (blocked) return blocked
  const rows = sources.data ?? []
  return (
    <div>
      <SectionIntro title="Lead sources" description="Built-in sources can be turned off, not deleted." />
      <ControlRow className="mb-4">
        <ControlField grow label="New source">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Source name" />
        </ControlField>
        <Button className="shrink-0"
          onClick={() => {
            const label = name.trim()
            if (!label) return
            create.mutate(
              { key: label.toLowerCase().replace(/\s+/g, '_'), name: label, icon: 'Globe', isActive: true },
              { onSuccess: () => { setName(''); toast.success('Source added') } },
            )
          }}
        >
          Add source
        </Button>
      </ControlRow>
      {rows.length === 0 ? <EmptyState icon={Inbox} title="No sources yet" description="Add a source so new leads can be tagged." /> : null}
      <ul className="space-y-2">
        {rows.map((source) => (
          <li key={source.id} className="rounded-md border border-border p-3">
            <ControlRow>
            <SourceIcon icon={source.icon} />
            <span className="min-w-0 flex-1 text-sm font-medium">{source.name}</span>
            <Badge>{source.usageCount ?? 0} leads</Badge>
            <Switch checked={source.isActive} onCheckedChange={(isActive) => update.mutate({ id: source.id, patch: { isActive } })} aria-label={`Enable ${source.name}`} />
            <IconPicker value={source.icon} onChange={(icon) => update.mutate({ id: source.id, patch: { icon } })} />
            <Button className="shrink-0" variant="outline" disabled={source.builtIn} onClick={() => setPending(source)}>Delete</Button>
            </ControlRow>
          </li>
        ))}
      </ul>
      <ReassignOnDeleteDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Delete source"
        name={pending?.name ?? ''}
        count={pending?.usageCount ?? 0}
        options={rows.filter((row) => row.id !== pending?.id).map((row) => ({ value: row.id, label: row.name }))}
        loading={remove.isPending}
        onConfirm={(replacementId) => pending && remove.mutate(replacementId ? { id: pending.id, replacementId } : pending.id, { onSuccess: () => { setPending(null); toast.success('Source deleted') } })}
      />
    </div>
  )
}
