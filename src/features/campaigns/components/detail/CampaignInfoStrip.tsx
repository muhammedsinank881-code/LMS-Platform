import { CalendarDays, Tag, User, Wallet } from 'lucide-react'
import { Badge } from '@/components/ui'
import { useDirectory } from '@/features/team/hooks/use-team'
import { formatDate, formatINR } from '@/lib/format'
import type { Campaign } from '@/types'

const DAY = 86_400_000

function timeLeft(campaign: Campaign, now: Date): string {
  if (campaign.status === 'completed') return 'Finished'
  if (!campaign.endDate) return 'No end date'
  const days = Math.ceil((Date.parse(campaign.endDate) - now.getTime()) / DAY)
  if (days < 0) return `Ended ${-days} day${days === -1 ? '' : 's'} ago`
  if (days === 0) return 'Ends today'
  return `${days} day${days === 1 ? '' : 's'} left`
}

/** The facts people ask first: who owns it, how much, when, and how long is left. */
export function CampaignInfoStrip({ campaign, now = new Date() }: { campaign: Campaign; now?: Date }) {
  const directory = useDirectory()
  const owner = directory.data?.find((user) => user.id === campaign.ownerId)?.name ?? '—'
  const items = [
    { icon: User, label: 'Owner', value: owner },
    { icon: Wallet, label: 'Budget', value: formatINR(campaign.budget) },
    { icon: CalendarDays, label: 'Runs', value: `${formatDate(campaign.startDate)} to ${campaign.endDate ? formatDate(campaign.endDate) : 'open'}` },
    { icon: CalendarDays, label: 'Time left', value: timeLeft(campaign, now) },
  ]
  return (
    <div className="space-y-2">
      <dl className="grid grid-cols-2 gap-2 rounded-md border border-border bg-surface p-3 md:grid-cols-4">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="truncate text-sm font-medium">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
      {campaign.tags.length > 0 ? (
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="h-3.5 w-3.5" aria-hidden="true" />
          {campaign.tags.map((tag) => <Badge key={tag} size="sm" tone="neutral">{tag}</Badge>)}
        </p>
      ) : null}
    </div>
  )
}
