import { useState } from 'react'
import { ColorPicker } from '@/components/common/ColorPicker'
import { ControlField, ControlRow } from '@/components/common/ControlRow'
import { NoAccess } from '@/components/common/NoAccess'
import { ReassignOnDeleteDialog } from '@/components/common/ReassignOnDeleteDialog'
import { SortableList } from '@/components/common/LazySortableList'
import { queryBlocked } from '@/components/common/query-blocked'
import { Badge, Button, Input, Select, toast } from '@/components/ui'
import { COLOR_PRESETS } from '@/lib/settings/palette'
import { usePermission } from '@/hooks/use-permission'
import {
  useCreatePipeline,
  useCreateStage,
  useDeletePipeline,
  useDeleteStage,
  usePipelines,
  useReorderStages,
  useUpdatePipeline,
  useUpdateStage,
} from '@/features/pipeline/hooks/use-pipelines'
import { STAGE_TYPES, type PipelineStage } from '@/types'
import { SectionIntro } from '../components/SettingsLayout'

export function PipelinesSettingsPage() {
  const { canSection } = usePermission()
  const pipelines = usePipelines()
  const create = useCreatePipeline()
  const update = useUpdatePipeline()
  const remove = useDeletePipeline()
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [pendingPipeline, setPendingPipeline] = useState<string | null>(null)
  if (!canSection('pipelines')) return <NoAccess />
  const blocked = queryBlocked(pipelines)
  if (blocked) return blocked
  const rows = pipelines.data ?? []
  const current = rows.find((row) => row.id === (selected ?? rows.find((row) => row.isDefault)?.id)) ?? rows[0]
  const otherStages = rows.filter((row) => row.id !== current?.id).flatMap((row) => row.stages)
  return (
    <div className="space-y-4">
      <SectionIntro title="Pipelines & stages" description="Each pipeline keeps at least one won stage and one lost stage." />
      <ControlRow>
        <ControlField grow label="New pipeline">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Pipeline name" />
        </ControlField>
        <Button className="shrink-0" onClick={() => name.trim() && create.mutate({ name: name.trim(), isDefault: rows.length === 0 }, { onSuccess: () => { setName(''); toast.success('Pipeline created') } })}>Add pipeline</Button>
        <ControlField label="Pipeline">
          <Select value={current?.id ?? ''} options={rows.map((row) => ({ value: row.id, label: row.name }))} onValueChange={setSelected} />
        </ControlField>
        {current && !current.isDefault ? <Button className="shrink-0" variant="outline" onClick={() => update.mutate({ id: current.id, patch: { isDefault: true } })}>Make default</Button> : null}
        {current && !current.isDefault ? <Button className="shrink-0" variant="outline" onClick={() => setPendingPipeline(current.id)}>Delete</Button> : null}
      </ControlRow>
      {current ? <StageEditor pipelineId={current.id} stages={current.stages} /> : null}
      <ReassignOnDeleteDialog
        open={pendingPipeline !== null}
        onOpenChange={(open) => !open && setPendingPipeline(null)}
        title="Delete pipeline"
        name={current?.name ?? ''}
        count={current?.stages.reduce((sum, stage) => sum + (stage.usageCount ?? 0), 0) ?? 0}
        options={otherStages.map((stage) => ({ value: stage.id, label: stage.name }))}
        loading={remove.isPending}
        onConfirm={(replacementId) => pendingPipeline && remove.mutate(replacementId ? { id: pendingPipeline, replacementId } : pendingPipeline, { onSuccess: () => { setPendingPipeline(null); toast.success('Pipeline deleted') } })}
      />
    </div>
  )
}

function StageEditor({ pipelineId, stages }: { pipelineId: string; stages: PipelineStage[] }) {
  const create = useCreateStage()
  const update = useUpdateStage()
  const remove = useDeleteStage()
  const reorder = useReorderStages()
  const [name, setName] = useState('')
  const [pending, setPending] = useState<PipelineStage | null>(null)
  return (
    <div className="space-y-3">
      <ControlRow>
        <ControlField grow label="New stage">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Stage name" />
        </ControlField>
        <Button className="shrink-0" onClick={() => name.trim() && create.mutate({ pipelineId, name: name.trim(), color: COLOR_PRESETS[0], probability: 10, type: 'open', order: stages.length + 1 }, { onSuccess: () => setName('') })}>Add stage</Button>
      </ControlRow>
      <SortableList
        items={stages}
        onReorder={(orderedIds) => reorder.mutateAsync({ pipelineId, orderedIds })}
        renderItem={(stage) => (
          <ControlRow>
            <ControlField grow label="Name">
              <Input defaultValue={stage.name} onBlur={(event) => event.target.value !== stage.name && update.mutate({ id: stage.id, patch: { name: event.target.value } })} />
            </ControlField>
            <ControlField className="w-28" label="Probability">
              <Input type="number" inputMode="numeric" defaultValue={stage.probability} onBlur={(event) => update.mutate({ id: stage.id, patch: { probability: Number(event.target.value) } })} />
            </ControlField>
            <ControlField label="Type">
              <Select value={stage.type} options={STAGE_TYPES.map((type) => ({ value: type, label: type }))} onValueChange={(type) => update.mutate({ id: stage.id, patch: { type: type as PipelineStage['type'] } })} />
            </ControlField>
            <Badge>{stage.usageCount ?? 0}</Badge>
            <ColorPicker value={stage.color} onChange={(color) => update.mutate({ id: stage.id, patch: { color } })} />
            <Button className="shrink-0" variant="outline" onClick={() => setPending(stage)}>Delete</Button>
          </ControlRow>
        )}
      />
      <ReassignOnDeleteDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Delete stage"
        name={pending?.name ?? ''}
        count={pending?.usageCount ?? 0}
        options={stages.filter((stage) => stage.id !== pending?.id).map((stage) => ({ value: stage.id, label: stage.name }))}
        loading={remove.isPending}
        onConfirm={(replacementId) => pending && remove.mutate(replacementId ? { id: pending.id, replacementId } : pending.id, { onSuccess: () => setPending(null) })}
      />
    </div>
  )
}
