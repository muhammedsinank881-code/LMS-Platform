import { CurrencyText } from '@/components/common/CurrencyText'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatDate } from '@/lib/format'
import type { Deal } from '@/types'

export function DealCard({
  deal,
  leadName,
  ownerName,
  stage,
}: {
  deal: Deal
  leadName: string
  ownerName: string
  stage?: { name: string; color: string }
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium text-foreground">{deal.title}</p>
        <p className="truncate text-sm text-muted-foreground">{leadName}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {stage ? <StatusBadge name={stage.name} color={stage.color} /> : null}
        <CurrencyText amount={deal.value} />
      </div>
      <p className="text-sm text-muted-foreground">
        {ownerName} · {formatDate(deal.expectedCloseDate)}
      </p>
    </div>
  )
}
