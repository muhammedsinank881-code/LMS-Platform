import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ExternalLink, StickyNote } from 'lucide-react'
import { LeadScoreBadge } from '@/components/common/LeadScoreBadge'
import { LostReasonDialog } from '@/components/common/LostReasonDialog'
import { ACTIVITY_META } from '@/components/common/timeline/activity-meta'
import { Avatar, Button, Select, Skeleton, Textarea, toast } from '@/components/ui'
import { useChangeLeadStatus } from '@/features/leads/hooks/use-change-lead-status'
import { useLead, useLeadActivities } from '@/features/leads/hooks/use-leads'
import { useLeadLookups } from '@/features/leads/hooks/use-lead-lookups'
import { useAddLeadActivity } from '@/features/leads/hooks/use-lead-mutations'
import { usePermission } from '@/hooks/use-permission'
import { formatRelative } from '@/lib/format'
import { useUiStore } from '@/store/ui-store'
import type { Conversation, LeadId } from '@/types'
import { UnlinkedLeadCard } from './UnlinkedLeadCard'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 border-b border-border p-4 last:border-b-0">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium">{children}</dd>
    </div>
  )
}

function AddNote({ leadId }: { leadId: LeadId }) {
  const add = useAddLeadActivity()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const field = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (open) field.current?.focus()
  }, [open])
  if (!open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <StickyNote /> Add note
      </Button>
    )
  }
  return (
    <div className="w-full space-y-2">
      <Textarea ref={field} aria-label="Lead note" rows={3} value={text} onChange={(event) => setText(event.target.value)} />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!text.trim()}
          loading={add.isPending}
          onClick={() =>
            add.mutate(
              { id: leadId, input: { type: 'note', data: { text: text.trim() } } },
              {
                onSuccess: () => {
                  setText('')
                  setOpen(false)
                  toast.success('Note added to the lead')
                },
              },
            )
          }
        >
          Save note
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export function LeadInfoPanel({ conversation }: { conversation: Conversation }) {
  const lead = useLead(conversation.leadId)
  const activities = useLeadActivities(conversation.leadId, { pageSize: 6 })
  const { lookups, lostReasons } = useLeadLookups()
  const change = useChangeLeadStatus()
  const { can } = usePermission()
  const openFollowUp = useUiStore((state) => state.openFollowUp)
  const [lostFor, setLostFor] = useState<string | null>(null)

  if (!conversation.leadId) {
    return (
      <div className="h-full overflow-y-auto">
        <UnlinkedLeadCard conversation={conversation} />
      </div>
    )
  }
  if (lead.isLoading) {
    return (
      <div className="space-y-3 p-4" aria-busy="true" aria-label="Loading lead">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }
  const data = lead.data
  if (!data) return <p className="p-4 text-sm text-muted-foreground">This lead is no longer available.</p>
  const owner = lookups.users.find((user) => user.id === data.assignedTo)
  const canEdit = can('leads', 'edit')
  const items = activities.data?.items ?? []

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Avatar name={data.name} size="lg" />
        <div className="min-w-0 flex-1">
          <Link to={`/leads/${data.id}`} className="block truncate text-sm font-semibold hover:underline">
            {data.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{data.company ?? 'No company'}</p>
          <div className="mt-1.5">
            <LeadScoreBadge score={data.score} category={data.scoreCategory} />
          </div>
        </div>
        <Button asChild size="icon-sm" variant="outline">
          <Link to={`/leads/${data.id}`} aria-label="Open lead">
            <ExternalLink />
          </Link>
        </Button>
      </div>

      <Section title="Status">
        <Select
          aria-label="Change status"
          value={data.statusId}
          disabled={!canEdit}
          onValueChange={(statusId) => {
            const next = lookups.statuses.find((item) => item.id === statusId)
            if (next?.type === 'lost') setLostFor(statusId)
            else change.mutate({ id: data.id, statusId })
          }}
          options={[...lookups.statuses]
            .sort((a, b) => a.order - b.order)
            .map((item) => ({
              value: item.id,
              label: item.type === 'won' ? `${item.name} (convert on lead page)` : item.name,
              disabled: item.type === 'won',
            }))}
        />
        <dl className="space-y-1.5 pt-1">
          <Row label="Owner">{owner?.name ?? 'Unassigned'}</Row>
          <Row label="Next follow-up">
            {data.nextFollowUpAt ? formatRelative(data.nextFollowUpAt) : <span className="text-warning">None scheduled</span>}
          </Row>
          <Row label="Last contact">{data.lastContactedAt ? formatRelative(data.lastContactedAt) : 'Never'}</Row>
        </dl>
      </Section>

      <Section title="Quick actions">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => openFollowUp({ leadIds: [data.id], lockLead: true })}>
            <CalendarClock /> Follow-up
          </Button>
          {canEdit ? <AddNote leadId={data.id} /> : null}
        </div>
      </Section>

      <Section title="Recent activity">
        {activities.isLoading ? <Skeleton className="h-20 w-full" /> : null}
        {!activities.isLoading && items.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : null}
        <ol className="space-y-3">
          {items.map((item) => {
            const meta = ACTIVITY_META[item.type]
            const Icon = meta.icon
            return (
              <li key={item.id} className="flex gap-2.5">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{formatRelative(item.createdAt)}</p>
                </div>
              </li>
            )
          })}
        </ol>
        <Button asChild size="sm" variant="link">
          <Link to={`/leads/${data.id}?tab=timeline`}>View full timeline</Link>
        </Button>
      </Section>

      <LostReasonDialog
        open={lostFor !== null}
        onOpenChange={(open) => !open && setLostFor(null)}
        reasons={lostReasons}
        loading={change.isPending}
        onConfirm={({ lostReasonId, note }) => {
          if (!lostFor) return
          change.mutate({ id: data.id, statusId: lostFor, lostReasonId, note }, { onSuccess: () => setLostFor(null) })
        }}
      />
    </div>
  )
}
