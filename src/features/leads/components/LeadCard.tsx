import { CurrencyText } from '@/components/common/CurrencyText'
import { LeadScoreBadge } from '@/components/common/LeadScoreBadge'
import { SourceIcon } from '@/components/common/SourceIcon'
import { StatusBadge } from '@/components/common/StatusBadge'
import { UserAvatarCell } from '@/components/common/UserAvatarCell'
import { formatPhone } from '@/lib/phone'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { Lead } from '@/types'
import { campaignById, sourceById, statusById, userById, type LeadLookups } from '../types'
import { LeadRowActions, type LeadRowActionsProps } from './LeadRowActions'
import { LeadDetailLink } from './LeadDetailLink'
import { FollowUpTime } from './RelativeTime'

export interface LeadCardProps extends Omit<LeadRowActionsProps, 'lead'> {
  lead: Lead
  lookups: LeadLookups
}

export function LeadCard({ lead, lookups, ...actions }: LeadCardProps) {
  const status = statusById(lookups, lead.statusId)
  const source = sourceById(lookups, lead.sourceId)
  const owner = userById(lookups, lead.assignedTo)
  const campaign = campaignById(lookups, lead.campaignId)
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <LeadDetailLink id={lead.id} className="truncate font-medium text-foreground hover:underline">
            {lead.name}
          </LeadDetailLink>
          <p className="truncate text-xs text-muted-foreground">{lead.company ?? EMPTY_VALUE}</p>
          <p className="mt-1 text-xs text-muted-foreground">{lead.id}</p>
        </div>
        <LeadRowActions lead={lead} {...actions} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {status ? <StatusBadge name={status.name} color={status.color} /> : null}
        <LeadScoreBadge score={lead.score} category={lead.scoreCategory} />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Phone</dt>
          <dd>
            {lead.phone ? (
              <a className="text-primary hover:underline" href={`tel:${lead.phone}`}>
                {formatPhone(lead.phone)}
              </a>
            ) : (
              EMPTY_VALUE
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Budget</dt>
          <dd>
            <CurrencyText amount={lead.budget} />
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Source</dt>
          <dd className="flex items-center gap-1">
            {source ? <SourceIcon icon={source.icon} /> : null}
            {source?.name ?? EMPTY_VALUE}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Campaign</dt>
          <dd className="truncate">{campaign?.name ?? EMPTY_VALUE}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Assigned</dt>
          <dd>
            <UserAvatarCell name={owner?.name} src={owner?.avatarUrl} />
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">Next follow-up</dt>
          <dd>
            <FollowUpTime value={lead.nextFollowUpAt} />
          </dd>
        </div>
      </dl>
    </div>
  )
}
