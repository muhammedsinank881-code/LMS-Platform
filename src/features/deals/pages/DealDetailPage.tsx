import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CurrencyText } from '@/components/common/CurrencyText'
import { LostReasonDialog } from '@/components/common/LostReasonDialog'
import { RoleGate } from '@/components/common/RoleGate'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Timeline } from '@/components/common/timeline'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, EmptyState, Select, Skeleton, Stepper, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@/components/ui'
import { useAuditLogs } from '@/features/audit/hooks/use-audit-logs'
import { useFollowUps } from '@/features/followups/hooks/use-followups'
import { FollowUpItem } from '@/features/followups/components/FollowUpItem'
import { useLead } from '@/features/leads/hooks/use-leads'
import { useLeadLookups } from '@/features/leads/hooks/use-lead-lookups'
import { usePipelines } from '@/features/pipeline/hooks/use-pipelines'
import { buildStageHistory, computeExpectedRevenue, getDaysInStage } from '@/lib/pipeline'
import { formatDate } from '@/lib/format'
import { useUiStore } from '@/store/ui-store'
import { isDealId, type DealId } from '@/types'
import { CloseWonDialog } from '@/features/pipeline/components/CloseWonDialog'
import { useDeal, useMoveDealStage } from '../hooks/use-deals'
import { useAddDealNote, useDealActivities, useReopenDeal } from '../hooks/use-deal-actions'
import { DealDrawer } from '../components/DealDrawer'

export function DealDetailPage() {
  const { id = '' } = useParams()
  const dealId = isDealId(id) ? id : undefined
  const deal = useDeal(dealId)
  const pipelines = usePipelines()
  const lead = useLead(deal.data?.leadId)
  const { lookups, lostReasons } = useLeadLookups()
  const activities = useDealActivities(dealId)
  const move = useMoveDealStage()
  const reopen = useReopenDeal()
  const addNote = useAddDealNote()
  const [note, setNote] = useState('')
  const [edit, setEdit] = useState(false)
  const [pending, setPending] = useState<'lost' | 'won' | 'reopen' | null>(null)
  const [target, setTarget] = useState('')
  const openFollowUp = useUiStore((state) => state.openFollowUp)
  const followUps = useFollowUps(dealId ? { filters: [{ field: 'dealId', operator: 'equals', value: dealId }], pageSize: 50 } : undefined)
  const audit = useAuditLogs(dealId ? { filters: [{ field: 'entity', operator: 'equals', value: 'deal' }, { field: 'entityId', operator: 'equals', value: dealId }], pageSize: 50 } : undefined)

  if (!dealId) return <EmptyState title="Deal not found" />
  if (deal.isLoading) return <Skeleton className="h-40 w-full" />
  if (deal.isError || !deal.data) {
    return <EmptyState tone="destructive" title="Couldn't load this deal" action={<Button variant="outline" onClick={() => void deal.refetch()}>Retry</Button>} />
  }

  const record = deal.data
  const pipeline = pipelines.data?.find((item) => item.id === record.pipelineId)
  const stages = [...(pipeline?.stages ?? [])].sort((a, b) => a.order - b.order)
  const current = stages.find((stage) => stage.id === record.stageId)
  const openStages = stages.filter((stage) => stage.type === 'open')
  const history = buildStageHistory(
    record.createdAt,
    record.stageId,
    (activities.data?.items ?? []).flatMap((item) =>
      item.type === 'stage_changed'
        ? [{ at: item.createdAt, actorId: item.actorId, fromStageId: item.data.fromStageId, toStageId: item.data.toStageId }]
        : [],
    ),
    new Date(),
  )
  const choose = (stageId: string) => {
    const stage = stages.find((item) => item.id === stageId)
    if (!stage || stage.id === record.stageId) return
    setTarget(stageId)
    if (stage.type === 'lost') setPending('lost')
    else if (stage.type === 'won') setPending('won')
    else if (current && current.type !== 'open') setPending('reopen')
    else move.mutate({ id: record.id, stageId })
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={record.title}
        breadcrumbs={[{ label: 'Deals', to: '/deals' }, { label: record.title }]}
        actions={<RoleGate resource="deals" action="edit"><Button size="sm" variant="outline" onClick={() => setEdit(true)}>Edit</Button></RoleGate>}
      />
      <div className="flex flex-wrap items-center gap-3">
        <CurrencyText amount={record.value} className="text-lg font-semibold" />
        <Select aria-label="Stage" value={record.stageId} onValueChange={choose} options={stages.map((stage) => ({ value: stage.id, label: stage.name }))} />
        {current ? <StatusBadge name={current.name} color={current.color} /> : null}
        {current && current.type !== 'open' ? (
          <RoleGate resource="deals" action="edit">
            <Button size="sm" variant="outline" onClick={() => { setTarget(openStages[0]?.id ?? ''); setPending('reopen') }}>Reopen</Button>
          </RoleGate>
        ) : null}
      </div>
      <Stepper aria-label="Pipeline stages" steps={stages.map((stage) => ({ id: stage.id, label: stage.name }))} currentStep={Math.max(0, stages.findIndex((stage) => stage.id === record.stageId))} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-2 pt-4 text-sm">
            <p>Product {record.product}</p>
            <p>Probability {record.probability}%</p>
            <p>Expected close {formatDate(record.expectedCloseDate)}</p>
            <p>Lead <Link className="text-primary hover:underline" to={`/leads/${record.leadId}`}>{lead.data?.name ?? record.leadId}</Link></p>
            {record.customerId ? <p>Customer <Link className="text-primary hover:underline" to={`/customers/${record.customerId}`}>{record.customerId}</Link></p> : null}
            {record.customFields.contract_url ? <p>Contract {String(record.customFields.contract_url)}</p> : null}
          </TabsContent>
          <TabsContent value="timeline" className="pt-4">
            <Timeline
              items={activities.data?.items ?? []}
              lookups={{
                status: (statusId) => lookups.statuses.find((status) => status.id === statusId),
                stage: (stageId) => stages.find((stage) => stage.id === stageId),
                userName: (userId) => lookups.users.find((user) => user.id === userId)?.name ?? 'Someone',
                sourceName: (sourceId) => lookups.sources.find((source) => source.id === sourceId)?.name ?? sourceId,
              }}
              chip={null}
              showSystem
              onChipChange={() => undefined}
              onShowSystemChange={() => undefined}
              readOnly
            />
          </TabsContent>
          <TabsContent value="followups" className="space-y-2 pt-4">
            <Button size="sm" onClick={() => openFollowUp({ leadIds: [record.leadId], lockLead: true, dealId: record.id })}>Schedule follow-up</Button>
            {(followUps.data?.items ?? []).map((item) => (
              <FollowUpItem
                key={item.id}
                followUp={item}
                leadName={lead.data?.name ?? record.leadId}
                now={new Date()}
                actions={{ onComplete: () => undefined, onReschedule: () => undefined, onSnooze: () => undefined }}
              />
            ))}
            {followUps.data?.items.length === 0 ? <EmptyState size="sm" title="No follow-ups for this deal" /> : null}
          </TabsContent>
          <TabsContent value="notes" className="space-y-3 pt-4">
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note" />
            <Button size="sm" disabled={!note.trim()} loading={addNote.isPending} onClick={() => addNote.mutate({ id: record.id, text: note }, { onSuccess: () => setNote('') })}>Add note</Button>
            {(activities.data?.items ?? []).filter((item) => item.type === 'note').map((item) => (
              <p key={item.id} className="text-sm">{item.type === 'note' ? item.data.text : ''}</p>
            ))}
          </TabsContent>
          <TabsContent value="audit" className="space-y-2 pt-4 text-sm">
            {(audit.data?.items ?? []).map((entry) => (
              <p key={entry.id}>{entry.action} · {formatDate(entry.createdAt)}</p>
            ))}
            {audit.isError ? <EmptyState size="sm" title="Audit log is restricted" /> : null}
          </TabsContent>
        </Tabs>
        <aside className="space-y-3 rounded-lg border border-border p-4 text-sm">
          <p>Expected revenue <CurrencyText amount={computeExpectedRevenue(record.value, record.probability)} /></p>
          <p>Probability {record.probability}%</p>
          <p>{getDaysInStage(record, new Date())} days in this stage</p>
          <h3 className="font-medium">Stage history</h3>
          <ul className="space-y-2">
            {history.map((span) => (
              <li key={`${span.stageId}-${span.enteredAt}`}>
                {stages.find((stage) => stage.id === span.stageId)?.name ?? span.stageId} · {span.days}d
                {span.actorId ? ` · ${lookups.users.find((user) => user.id === span.actorId)?.name ?? 'Someone'}` : ''}
              </li>
            ))}
          </ul>
          {record.lostReasonId ? <p>Lost reason {(lostReasons ?? []).find((reason) => reason.id === record.lostReasonId)?.name}</p> : null}
          {record.lostCompetitor ? <p>Competitor {record.lostCompetitor}</p> : null}
        </aside>
      </div>
      <LostReasonDialog
        open={pending === 'lost'}
        reasons={lostReasons ?? []}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={({ lostReasonId, note: lostNote }) => {
          move.mutate({ id: record.id as DealId, stageId: target, lostReasonId, lostNote })
          setPending(null)
        }}
      />
      <CloseWonDialog
        open={pending === 'won'}
        value={record.value}
        loading={move.isPending}
        onOpenChange={(open) => !open && setPending(null)}
        onConfirm={(input) => {
          move.mutate({ id: record.id, stageId: target, ...input })
          setPending(null)
        }}
      />
      <ConfirmDialog
        open={pending === 'reopen'}
        onOpenChange={(open) => !open && setPending(null)}
        title="Reopen this deal?"
        description="The deal returns to an open stage. The customer stays converted."
        confirmLabel="Reopen"
        onConfirm={() => {
          if (target) reopen.mutate({ id: record.id, input: { stageId: target } })
          setPending(null)
        }}
      />
      <DealDrawer open={edit} deal={record} onOpenChange={setEdit} />
    </div>
  )
}
