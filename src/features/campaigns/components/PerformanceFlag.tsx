import { TriangleAlert } from 'lucide-react'
import { Badge, Tooltip } from '@/components/ui'
import { underperformerFlags } from '@/lib/metrics'
import type { CampaignMetrics } from '@/types'

/**
 * "Needs attention" marker for a high CPL or a ROAS under 1. The tooltip, and the text of the
 * badge itself, say why, so the meaning does not rely on colour.
 */
export function PerformanceFlag({
  metrics,
  tenantAvgCpl,
}: {
  metrics: Pick<CampaignMetrics, 'spend' | 'cpl' | 'roas'>
  tenantAvgCpl: number | null
}) {
  const flags = underperformerFlags(metrics, tenantAvgCpl)
  if (flags.length === 0) return null
  const reason = flags.map((flag) => flag.reason).join(' ')
  return (
    <Tooltip content={reason}>
      <Badge tone="warning" size="sm" tabIndex={0} aria-label={`Needs attention. ${reason}`}>
        <TriangleAlert className="h-3 w-3" aria-hidden="true" />
        Needs attention
      </Badge>
    </Tooltip>
  )
}
