import { formatINR } from '@/lib/format'
import type { CampaignMetrics, CampaignStatus } from '@/types'
import { HIGH_CPL_FACTOR } from './flags'
import { budgetUsage, pacingStatus } from './pacing'

export interface Insight {
  tone: 'good' | 'warn' | 'info'
  text: string
}

export interface InsightInput {
  metrics: CampaignMetrics
  tenantAvgCpl: number | null
  status: CampaignStatus
  budget: number
  /** All-time spend. Null when spend is hidden. */
  spent: number | null
  projectedSpend: number | null
}

/**
 * Plain-language read of how a campaign is doing, in priority order. Spend-based advice is left
 * out when spend is hidden, so nothing leaks through the wording.
 */
export function campaignInsights(input: InsightInput): Insight[] {
  const { metrics: m, tenantAvgCpl, status, budget, spent, projectedSpend } = input
  const out: Insight[] = []
  if (m.leads === 0) {
    out.push({
      tone: status === 'active' ? 'warn' : 'info',
      text: status === 'active' ? 'No leads came in during this period. Check the ads and targeting.' : 'No leads in this period.',
    })
  }
  if (spent !== null) {
    const usage = budgetUsage(spent, budget)
    if (usage.state === 'over') out.push({ tone: 'warn', text: `Over budget by ${formatINR(spent - budget)}. Pause or raise the budget.` })
    else if (usage.state === 'warning') out.push({ tone: 'warn', text: 'More than 80% of the budget is used.' })
    if (pacingStatus(projectedSpend, budget) === 'over' && usage.state !== 'over') {
      out.push({ tone: 'warn', text: 'At the current pace this campaign will overspend before it ends.' })
    }
  }
  if (m.cpl !== null && tenantAvgCpl) {
    const ratio = m.cpl / tenantAvgCpl
    if (ratio > HIGH_CPL_FACTOR) {
      out.push({ tone: 'warn', text: `Cost per lead is ${Math.round((ratio - 1) * 100)}% above the workspace average.` })
    } else if (ratio < 0.8) {
      out.push({ tone: 'good', text: `Cost per lead is ${Math.round((1 - ratio) * 100)}% below the workspace average.` })
    }
  }
  if (m.roas !== null && m.spend) {
    if (m.roas < 1) out.push({ tone: 'warn', text: `Every ₹1 spent returned ₹${m.roas.toFixed(2)}. It is not paying for itself yet.` })
    else if (m.roas >= 3) out.push({ tone: 'good', text: `Strong return: every ₹1 spent returned ₹${m.roas.toFixed(2)}.` })
  }
  if (m.leads >= 5 && m.qualified === 0) {
    out.push({ tone: 'warn', text: 'Leads are coming in but none qualified. Review lead quality.' })
  }
  if (out.length === 0 && m.leads > 0) out.push({ tone: 'info', text: 'Nothing unusual. Performance is in line with your workspace.' })
  return out
}
