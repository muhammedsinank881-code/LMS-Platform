import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui'
import { CurrencyText } from '@/components/common/CurrencyText'
import { SourceIcon } from '@/components/common/SourceIcon'
import { EMPTY_VALUE } from '@/lib/format/shared'
import type { AnswerValue, CustomFieldDefinition, Lead, QualificationQuestion } from '@/types'
import { useLeadActivities, usePinnedNotes } from '../../../hooks/use-leads'
import { campaignById, sourceById, type LeadLookups } from '../../../types'
import { FollowUpTime, RelativeTime } from '../../RelativeTime'
import { toTimelineLookups } from '../timeline-lookups'
import { TimelineItem } from '@/components/common/timeline'

const QUALIFICATION_LABEL = {
  qualified: 'Qualified',
  not_qualified: 'Not qualified',
  needs_info: 'Needs more information',
} as const

export function OverviewTab({
  lead,
  lookups,
  fields,
  questions,
}: {
  lead: Lead
  lookups: LeadLookups
  fields: CustomFieldDefinition[]
  questions: QualificationQuestion[]
}) {
  const latest = useLeadActivities(lead.id, { pageSize: 1 })
  const pinned = usePinnedNotes(lead.id)
  const source = sourceById(lookups, lead.sourceId)
  const campaign = campaignById(lookups, lead.campaignId)
  const timeline = toTimelineLookups(lookups)
  const answered = questions.filter((question) => isAnswered(lead.qualificationAnswers[question.id])).length
  const activity = latest.data?.items[0]

  return (
    <div className="space-y-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
            <Fact label="Phone" value={lead.phone} />
            <Fact label="WhatsApp" value={lead.whatsapp} />
            <Fact label="Email" value={lead.email} />
            <Fact label="Location" value={lead.location} />
            <Fact label="Requirement" value={lead.requirement} />
            <Fact label="Product" value={lead.productInterest} />
            <div>
              <dt className="text-xs text-muted-foreground">Budget</dt>
              <dd><CurrencyText amount={lead.budget} /></dd>
            </div>
            <Fact label="Lead type" value={lead.leadType.toUpperCase()} />
            <div>
              <dt className="text-xs text-muted-foreground">Source</dt>
              <dd className="flex items-center gap-2">
                {source ? <SourceIcon icon={source.icon} /> : null}
                {source?.name ?? EMPTY_VALUE}
              </dd>
            </div>
            <Fact label="Campaign" value={campaign?.name} />
          </dl>
        </CardContent>
      </Card>

      {fields.length > 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Custom fields</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => (
                <Fact key={field.id} label={field.label} value={formatCustom(lead.customFields[field.key])} />
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Qualification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{QUALIFICATION_LABEL[lead.qualificationStatus]}</p>
            <p className="text-muted-foreground">
              Answered {answered} of {questions.length}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Next follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <FollowUpTime value={lead.nextFollowUpAt} />
            <p className="mt-1 text-xs text-muted-foreground">
              Last contacted <RelativeTime value={lead.lastContactedAt} />
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Latest activity</CardTitle>
          </CardHeader>
          <CardContent>
            {latest.isLoading ? <Skeleton className="h-10 w-full" /> : null}
            {latest.isError ? <EmptyState size="sm" title="Couldn't load activity" /> : null}
            {activity ? <TimelineItem activity={activity} lookups={timeline} /> : null}
            {!latest.isLoading && !activity ? <p className="text-sm text-muted-foreground">No activity yet.</p> : null}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>AI summary</CardTitle>
            <Badge tone="primary">AI</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">AI summary arrives in Phase 3.</p>
          </CardContent>
        </Card>
      </div>

      {pinned.data && pinned.data.length > 0 ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle>Pinned notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pinned.data.map((item) => (
              <TimelineItem key={item.id} activity={item} lookups={timeline} pinned />
            ))}
          </CardContent>
        </Card>
      ) : null}

    </div>
  )
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{value || EMPTY_VALUE}</dd>
    </div>
  )
}

function formatCustom(value: Lead['customFields'][string]): string {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ') || EMPTY_VALUE
  return String(value)
}

function isAnswered(value: AnswerValue | undefined): boolean {
  if (value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}
