import { useState } from 'react'
import { ColorPicker } from '@/components/common/ColorPicker'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { NoAccess } from '@/components/common/NoAccess'
import { ReassignOnDeleteDialog } from '@/components/common/ReassignOnDeleteDialog'
import { queryBlocked } from '@/components/common/query-blocked'
import { Badge, Button, EmptyState, Input, Select, toast } from '@/components/ui'
import { Inbox } from 'lucide-react'
import { COLOR_PRESETS } from '@/lib/settings/palette'
import { usePermission } from '@/hooks/use-permission'
import type { Tag } from '@/types'
import { SectionIntro } from '../components/SettingsLayout'
import { useBulkDeleteTags, useCreateTag, useDeleteTag, useMergeTags, useTags, useUpdateTag } from '../hooks/use-settings'

export function TagsSettingsPage() {
  const { canSection } = usePermission()
  const tags = useTags()
  const create = useCreateTag()
  const update = useUpdateTag()
  const remove = useDeleteTag()
  const merge = useMergeTags()
  const bulk = useBulkDeleteTags()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [pending, setPending] = useState<Tag | null>(null)
  const [mergeTarget, setMergeTarget] = useState('')
  if (!canSection('tags')) return <NoAccess />
  const blocked = queryBlocked(tags)
  if (blocked) return blocked
  const rows = tags.data ?? []
  const sourceId = selected[0]
  return (
    <div className="space-y-4">
      <SectionIntro title="Tags" description="Merge two tags to combine their leads, or delete unused ones in bulk." />
      <ControlRow>
        <ControlField grow label="New tag">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tag name" />
        </ControlField>
        <Button className="shrink-0" onClick={() => name.trim() && create.mutate({ name: name.trim(), color: COLOR_PRESETS[0] }, { onSuccess: () => { setName(''); toast.success('Tag added') } })}>Add tag</Button>
        <Button className="shrink-0" variant="outline" disabled={selected.length === 0} onClick={() => bulk.mutate(selected, { onSuccess: () => { setSelected([]); toast.success('Tags deleted') } })}>Delete selected</Button>
      </ControlRow>
      {sourceId ? (
        <ControlRow>
          <ControlField label="Merge into">
            <Select value={mergeTarget || undefined} onValueChange={setMergeTarget} options={rows.filter((tag) => tag.id !== sourceId).map((tag) => ({ value: tag.id, label: tag.name }))} placeholder="Choose a tag" />
          </ControlField>
          <Button className="shrink-0" disabled={!mergeTarget} onClick={() => merge.mutate({ sourceId, targetId: mergeTarget }, { onSuccess: () => { setSelected([]); toast.success('Tags merged') } })}>Merge</Button>
        </ControlRow>
      ) : null}
      {rows.length === 0 ? <EmptyState icon={Inbox} title="No tags yet" description="Add a tag to group similar leads." /> : null}
      <ul className="space-y-2">
        {rows.map((tag) => (
          <li key={tag.id} className="rounded-md border border-border p-3">
            <ControlRow>
              <input type="checkbox" className="shrink-0" aria-label={`Select ${tag.name}`} checked={selected.includes(tag.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, tag.id] : current.filter((id) => id !== tag.id))} />
              <ControlField grow label="Name">
                <Input defaultValue={tag.name} onBlur={(event) => event.target.value !== tag.name && update.mutate({ id: tag.id, patch: { name: event.target.value } })} />
              </ControlField>
              <Badge>{tag.usageCount ?? 0} leads</Badge>
              <ColorPicker value={tag.color} onChange={(color) => update.mutate({ id: tag.id, patch: { color } })} />
              <Button className="shrink-0" variant="outline" onClick={() => setPending(tag)}>Delete</Button>
            </ControlRow>
          </li>
        ))}
      </ul>
      <ReassignOnDeleteDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Delete tag"
        name={pending?.name ?? ''}
        count={pending?.usageCount ?? 0}
        options={rows.filter((tag) => tag.id !== pending?.id).map((tag) => ({ value: tag.id, label: tag.name }))}
        loading={remove.isPending}
        onConfirm={(replacementId) => pending && remove.mutate(replacementId ? { id: pending.id, replacementId } : pending.id, { onSuccess: () => { setPending(null); toast.success('Tag deleted') } })}
      />
    </div>
  )
}
