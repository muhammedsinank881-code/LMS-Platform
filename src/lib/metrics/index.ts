import type { Deal, DealsSummary, PipelineStage, PipelineValue } from '@/types'

export * from './campaign'
export * from './pacing'
export * from './flags'
export * from './velocity'
export * from './cohort'
export * from './response'
export * from './forecast'
export * from './attribution'
export * from './targets'

type StageRef = Pick<PipelineStage, 'id' | 'type'>
type DealValueRef = Pick<Deal, 'value' | 'probability' | 'stageId'>

export {
  avgDealValue,
  averageResponseTime,
  conversionRate,
  followUpCompletionRate,
  groupBy,
  groupByDay,
  groupSeries,
  percentChange,
  previousPeriod,
  sumPerformance,
  winRate,
} from '../report-metrics'
export type { DealOutcome } from '../report-metrics'

const weightedValue = (deal: DealValueRef) => (deal.value * deal.probability) / 100

/**
 * Open pipeline only: deals sitting in won or lost stages are not pipeline. `weighted` scales
 * each deal by its own probability.
 */
export function computePipelineValue(
  deals: readonly DealValueRef[],
  stages: readonly StageRef[],
): PipelineValue {
  const openStageIds = new Set(stages.filter((stage) => stage.type === 'open').map((s) => s.id))
  const open = deals.filter((deal) => openStageIds.has(deal.stageId))
  return {
    total: open.reduce((sum, deal) => sum + deal.value, 0),
    weighted: open.reduce((sum, deal) => sum + weightedValue(deal), 0),
    count: open.length,
  }
}

/** Pipeline totals plus a count/total/weighted row for every stage (Kanban column headers). */
export function summarizeDeals(
  deals: readonly DealValueRef[],
  stages: readonly StageRef[],
): DealsSummary {
  const byStage = stages.map((stage) => {
    const inStage = deals.filter((deal) => deal.stageId === stage.id)
    return {
      stageId: stage.id,
      count: inStage.length,
      total: inStage.reduce((sum, deal) => sum + deal.value, 0),
      weighted: inStage.reduce((sum, deal) => sum + weightedValue(deal), 0),
    }
  })
  return { ...computePipelineValue(deals, stages), byStage }
}
export * from './insights'
