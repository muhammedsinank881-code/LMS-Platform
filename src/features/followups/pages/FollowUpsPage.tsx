import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, ShieldOff } from 'lucide-react'
import { RoleGate } from '@/components/common/RoleGate'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button, EmptyState, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger, toast } from '@/components/ui'
import { usePermission } from '@/hooks/use-permission'
import { groupFollowUps } from '@/lib/followup-groups'
import { useLeads } from '@/features/leads/hooks/use-leads'
import { useSources } from '@/features/settings/hooks/use-lead-config'
import { useDirectory } from '@/features/team/hooks/use-team'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'
import type { FilterCondition, FollowUp, FollowUpFilterField, Lead } from '@/types'
import { BucketStrip } from '../components/BucketStrip'
import { FollowUpBulkBar } from '../components/FollowUpBulkBar'
const FollowUpCalendar = lazy(() =>
  import('../components/calendar/FollowUpCalendar').then((mod) => ({ default: mod.FollowUpCalendar })),
)
import { CompleteFollowUpDialog } from '../components/CompleteFollowUpDialog'
import { FollowUpFilters } from '../components/FollowUpFilters'
import { FollowUpGroups } from '../components/FollowUpGroups'
import { RescheduleDialog } from '../components/RescheduleDialog'
import { useFollowUpBuckets, useFollowUps } from '../hooks/use-followups'
import {
  useCompleteFollowUp,
  useRescheduleFollowUp,
  useSnoozeFollowUp,
  useUpdateFollowUp,
} from '../hooks/use-followup-mutations'
import { useFollowUpUrlState } from '../hooks/use-followup-url-state'

function withOpen(filters: FilterCondition<FollowUpFilterField>[]): FilterCondition<FollowUpFilterField>[] {
  return [...filters.filter((filter) => filter.field !== 'status'), { field: 'status', operator: 'not_equals', value: 'done' }]
}

export function FollowUpsPage() {
  const url = useFollowUpUrlState()
  const [params, setParams] = useSearchParams()
  const { getScope, can } = usePermission()
  const scope = getScope('followups')
  const userId = useAuthStore((state) => state.user?.id ?? '')
  const openFollowUp = useUiStore((state) => state.openFollowUp)
  const filters = useMemo(() => {
    if (url.scope !== 'mine' || !userId) return url.filters
    return [
      ...url.filters.filter((filter) => filter.field !== 'assigneeId'),
      { field: 'assigneeId' as const, operator: 'equals' as const, value: userId },
    ]
  }, [url.filters, url.scope, userId])
  const queryFilters = useMemo(() => withOpen(filters), [filters])
  const list = useFollowUps({ search: url.search || undefined, filters: queryFilters, pageSize: 200, sort: url.sort })
  const buckets = useFollowUpBuckets({ search: url.search || undefined, filters: queryFilters })
  const leads = useLeads({ pageSize: 200 })
  const directory = useDirectory()
  const sources = useSources()
  const complete = useCompleteFollowUp()
  const reschedule = useRescheduleFollowUp()
  const snooze = useSnoozeFollowUp()
  const update = useUpdateFollowUp()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [target, setTarget] = useState<FollowUp | null>(null)
  const [dialog, setDialog] = useState<'complete' | 'reschedule' | 'bulk-complete' | 'bulk-reschedule' | null>(null)
  const grouped = useMemo(() => {
    const now = new Date()
    return { now, groups: groupFollowUps(list.data?.items ?? [], now) }
  }, [list.data?.items])
  const { now, groups } = grouped
  const counts = buckets.data ?? { overdue: 0, today: 0, tomorrow: 0, upcoming: 0 }
  const openCount = counts.overdue + counts.today + counts.tomorrow + counts.upcoming
  const visibleCount = (url.bucket ? groups[url.bucket] : Object.values(groups).flat()).length

  useEffect(() => {
    if (params.get('compose') !== '1') return
    openFollowUp()
    const next = new URLSearchParams(params)
    next.delete('compose')
    setParams(next, { replace: true })
  }, [openFollowUp, params, setParams])

  const leadById = useMemo(
    () => new Map<string, Lead>((leads.data?.items ?? []).map((lead) => [lead.id, lead])),
    [leads.data?.items],
  )
  const userById = useMemo(() => new Map((directory.data ?? []).map((user) => [user.id, user])), [directory.data])
  const leadName = (id: string) => leadById.get(id)?.name ?? id
  const contact = (id: string) => {
    const lead = leadById.get(id)
    return { phone: lead?.phone, email: lead?.email, whatsapp: lead?.whatsapp }
  }

  const filteredEmpty = Boolean(url.search || url.filters.length || url.bucket || url.scope === 'mine')
  const users = (directory.data ?? []).map((user) => ({ id: user.id, name: user.name }))

  return (
    <RoleGate
      resource="followups"
      fallback={<EmptyState icon={ShieldOff} title="You don't have access to follow-ups" />}
    >
      <PageHeader
        className="mb-2"
        title="Follow-ups"
        description="Everything due, overdue, and still ahead."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {scope === 'team' || scope === 'all' ? (
              <Tabs value={url.scope} onValueChange={(value) => url.setExtra({ scope: value === 'mine' ? 'mine' : 'team' })}>
                <TabsList>
                  <TabsTrigger value="mine">My follow-ups</TabsTrigger>
                  <TabsTrigger value="team">Team follow-ups</TabsTrigger>
                </TabsList>
                <TabsContent value="mine" forceMount className="sr-only">My follow-ups</TabsContent>
                <TabsContent value="team" forceMount className="sr-only">Team follow-ups</TabsContent>
              </Tabs>
            ) : null}
            <Tabs value={url.display} onValueChange={(value) => url.setExtra({ display: value === 'calendar' ? 'calendar' : 'list' })}>
              <TabsList>
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
              <TabsContent value="list" forceMount className="sr-only">List</TabsContent>
              <TabsContent value="calendar" forceMount className="sr-only">Calendar</TabsContent>
            </Tabs>
            <RoleGate resource="followups" action="create">
              <Button onClick={() => openFollowUp()}>
                <Plus /> Schedule
              </Button>
            </RoleGate>
          </div>
        }
      />
      <div className="space-y-2">
        <BucketStrip counts={counts} active={url.bucket} onChange={(bucket) => url.setExtra({ bucket })} />
        <FollowUpFilters
          search={url.search}
          filters={url.filters}
          users={users}
          sources={(sources.data ?? []).map((source) => ({ id: source.id, name: source.name }))}
          onSearch={url.setSearch}
          onFilters={url.setFilters}
        />
        {list.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}
        {list.isError ? (
          <EmptyState tone="destructive" title="Couldn't load follow-ups" action={<Button variant="outline" onClick={() => void list.refetch()}>Retry</Button>} />
        ) : null}
        {!list.isLoading && !list.isError && visibleCount === 0 ? (
          <EmptyState
            title={filteredEmpty || openCount > 0 ? 'No follow-ups match' : 'All caught up 🎉'}
            description={filteredEmpty || openCount > 0 ? 'Try another bucket or clear the filters.' : 'Nothing is due right now.'}
            action={filteredEmpty ? <Button variant="outline" onClick={() => { url.setSearch(''); url.setFilters([]); url.setExtra({ bucket: null, scope: 'team' }) }}>Clear filters</Button> : null}
          />
        ) : null}
        {!list.isLoading && !list.isError && visibleCount > 0 && url.display === 'list' ? (
          <FollowUpGroups
            groups={groups}
            active={url.bucket}
            now={now}
            leadName={leadName}
            assigneeName={(id) => {
              const user = userById.get(id)
              return user ? { name: user.name, avatar: user.avatarUrl } : null
            }}
            contact={contact}
            selected={selected}
            onSelectedChange={(id, checked) => {
              setSelected((current) => {
                const next = new Set(current)
                if (checked) next.add(id)
                else next.delete(id)
                return next
              })
            }}
            onComplete={(item) => { setTarget(item); setDialog('complete') }}
            onReschedule={(item) => { setTarget(item); setDialog('reschedule') }}
            onSnooze={(id, minutes) => snooze.mutate({ id, minutes })}
          />
        ) : null}
        {!list.isLoading && !list.isError && url.display === 'calendar' ? (
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <FollowUpCalendar
            items={url.bucket ? groups[url.bucket] : list.data?.items ?? []}
            period={url.period}
            span={url.span}
            leadName={leadName}
            leadContact={contact}
            now={now}
            onPeriodChange={(period) => url.setExtra({ period })}
            onSpanChange={(span) => url.setExtra({ span })}
            onCreateAt={(dueAt) => can('followups', 'create') && openFollowUp({ dueAt })}
            onReschedule={(id, dueAt) => reschedule.mutate({ id, input: { dueAt } })}
            onAskReschedule={(item) => { setTarget(item); setDialog('reschedule') }}
            onComplete={(item) => { setTarget(item); setDialog('complete') }}
            onSnooze={(id, minutes) => snooze.mutate({ id, minutes })}
          />
          </Suspense>
        ) : null}
        {(list.data?.total ?? 0) > (list.data?.items.length ?? 0) ? (
          <p className="text-xs text-muted-foreground">Showing the first {list.data?.items.length} of {list.data?.total}. Narrow the filters to see the rest.</p>
        ) : null}
      </div>
      <FollowUpBulkBar
        count={selected.size}
        users={users}
        busy={complete.isPending || reschedule.isPending || update.isPending}
        onClear={() => setSelected(new Set())}
        onDone={() => setDialog('bulk-complete')}
        onReschedule={() => setDialog('bulk-reschedule')}
        onReassign={async (assigneeId) => {
          await Promise.all([...selected].map((id) => update.mutateAsync({ id, patch: { assigneeId } })))
          toast.success('Follow-ups reassigned')
          setSelected(new Set())
        }}
      />
      <CompleteFollowUpDialog
        open={dialog === 'complete' || dialog === 'bulk-complete'}
        title={dialog === 'bulk-complete' ? `Complete ${selected.size} follow-ups` : 'Complete follow-up'}
        loading={complete.isPending}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={async (result) => {
          const ids = dialog === 'bulk-complete' ? [...selected] : target ? [target.id] : []
          await Promise.all(ids.map((id) => complete.mutateAsync({ id, outcome: result.outcome, note: result.note })))
          if (result.scheduleNext && target) {
            openFollowUp({ leadIds: [target.leadId], lockLead: true, type: target.type, assigneeId: target.assigneeId })
          }
          setDialog(null)
          setSelected(new Set())
          toast.success('Follow-up completed')
        }}
      />
      <RescheduleDialog
        key={target?.id ?? 'bulk'}
        open={dialog === 'reschedule' || dialog === 'bulk-reschedule'}
        initialDueAt={target?.dueAt}
        loading={reschedule.isPending}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={async (dueAt, reason) => {
          const ids = dialog === 'bulk-reschedule' ? [...selected] : target ? [target.id] : []
          await Promise.all(ids.map((id) => reschedule.mutateAsync({ id, input: { dueAt, reason } })))
          setDialog(null)
          setSelected(new Set())
          toast.success('Follow-up rescheduled')
        }}
      />
    </RoleGate>
  )
}
