import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LeadScoreBadge } from '@/components/common/LeadScoreBadge'
import { UserAvatarCell } from '@/components/common/UserAvatarCell'
import { Badge, Button, Select } from '@/components/ui'
import { formatDate } from '@/lib/format'
import type { Lead } from '@/types'
import { statusById, userById, type LeadLookups } from '../../types'

export function LeadDetailHeader({
  lead,
  lookups,
  backTo,
  lostReasonName,
  canEdit,
  canAssign,
  prevId,
  nextId,
  onStatus,
  onAssign,
  onNavigate,
}: {
  lead: Lead
  lookups: LeadLookups
  backTo: string
  lostReasonName?: string
  canEdit: boolean
  canAssign: boolean
  prevId: string | null
  nextId: string | null
  onStatus: (statusId: string) => void
  onAssign: () => void
  onNavigate: (id: string) => void
}) {
  const statuses = [...lookups.statuses].sort((a, b) => a.order - b.order)
  const owner = userById(lookups, lead.assignedTo)
  const current = statusById(lookups, lead.statusId)
  const lost = current?.type === 'lost'

  return (
    <header className="space-y-2">
      <div className="flex items-center gap-2">
        <Link to={{ pathname: '/leads', search: backTo }} className="text-sm font-medium text-primary hover:underline">
          Back to leads
        </Link>
        <span className="text-xs text-muted-foreground">{lead.id}</span>
        <div className="ml-auto flex items-center gap-1">
          <Button type="button" variant="outline" size="icon-sm" aria-label="Previous lead" disabled={!prevId} onClick={() => prevId && onNavigate(prevId)}>
            <ChevronLeft />
          </Button>
          <Button type="button" variant="outline" size="icon-sm" aria-label="Next lead" disabled={!nextId} onClick={() => nextId && onNavigate(nextId)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold leading-7 text-foreground">{lead.name}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{lead.company ?? 'No company'}</span>
            <UserAvatarCell name={owner?.name} src={owner?.avatarUrl} />
            <Button type="button" variant="ghost" size="sm" onClick={onAssign} disabled={!canAssign}>
              Reassign
            </Button>
            <span>Created {formatDate(lead.createdAt)}</span>
            {lost && lostReasonName ? <span className="text-destructive">Lost: {lostReasonName}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Status"
            size="sm"
            disabled={!canEdit}
            value={lead.statusId}
            options={statuses.map((status) => ({
              value: status.id,
              label: status.name,
              disabled: Boolean(lead.convertedToCustomerId) && status.type === 'won',
            }))}
            onValueChange={onStatus}
          />
          <LeadScoreBadge score={lead.score} category={lead.scoreCategory} />
          {lead.convertedToCustomerId ? (
            <Badge tone="success">
              <Link to={`/customers/${lead.convertedToCustomerId}`}>Customer</Link>
            </Badge>
          ) : null}
        </div>
      </div>
    </header>
  )
}
