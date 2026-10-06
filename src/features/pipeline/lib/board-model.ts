import type { Deal, Lead, PipelineStage, Priority, ScoreCategory } from '@/types'
import { reorderWithinColumn, type Positioned } from '@/lib/pipeline'

export type BoardKind = 'leads' | 'deals'

export interface BoardCardModel {
  id: string
  kind: 'lead' | 'deal'
  name: string
  company: string | null
  value: number
  ownerId: string | null
  score: number
  scoreCategory: ScoreCategory
  priority: Priority
  nextFollowUpAt: string | null
  sourceId: string
  stageEnteredAt: string
  stageId: string
  pipelineId: string
  position: number
  href: string
  leadId: string
  dealId: string | null
  lead: Lead | null
  deal: Deal | null
}

export function leadCard(lead: Lead): BoardCardModel {
  return {
    id: lead.id,
    kind: 'lead',
    name: lead.name,
    company: lead.company,
    value: lead.budget ?? 0,
    ownerId: lead.assignedTo,
    score: lead.score,
    scoreCategory: lead.scoreCategory,
    priority: lead.priority,
    nextFollowUpAt: lead.nextFollowUpAt,
    sourceId: lead.sourceId,
    stageEnteredAt: lead.stageEnteredAt,
    stageId: lead.stageId,
    pipelineId: lead.pipelineId,
    position: lead.position,
    href: `/leads/${lead.id}`,
    leadId: lead.id,
    dealId: null,
    lead,
    deal: null,
  }
}

export function dealCard(deal: Deal, lead: Lead | undefined): BoardCardModel {
  return {
    id: deal.id,
    kind: 'deal',
    name: deal.title,
    company: lead?.company ?? lead?.name ?? null,
    value: deal.value,
    ownerId: deal.ownerId,
    score: lead?.score ?? 0,
    scoreCategory: lead?.scoreCategory ?? 'cold',
    priority: lead?.priority ?? 'medium',
    nextFollowUpAt: lead?.nextFollowUpAt ?? null,
    sourceId: lead?.sourceId ?? '',
    stageEnteredAt: deal.stageEnteredAt,
    stageId: deal.stageId,
    pipelineId: deal.pipelineId,
    position: deal.position,
    href: `/deals/${deal.id}`,
    leadId: deal.leadId,
    dealId: deal.id,
    lead: lead ?? null,
    deal,
  }
}

/** Position for a card dropped at `index` in a column (the card may already be in the list). */
export function positionAt(items: readonly Positioned[], id: string, index: number): number {
  const rest = items.filter((item) => item.id !== id)
  const tail = (rest.at(-1)?.position ?? 0) + 1
  const withCard = [...rest, { id, position: tail }]
  const from = withCard.length - 1
  const to = Math.max(0, Math.min(index, from))
  return reorderWithinColumn(withCard, from, to).position
}

export function stageHeaderClass(stage: Pick<PipelineStage, 'type'>): string {
  if (stage.type === 'won') return 'border-success/40 bg-success/5'
  if (stage.type === 'lost') return 'border-destructive/40 bg-destructive/5'
  if (stage.type === 'invalid') return 'border-border bg-muted/60'
  return 'border-border bg-surface'
}
