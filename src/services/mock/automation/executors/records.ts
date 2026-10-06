import { addDays } from 'date-fns'
import { ApiError } from '@/services/api/errors'
import { createCustomerFromLead } from '../../resources/leads/convert'
import { moveDealStage } from '../../resources/deal-stage'
import { createDealRecord } from '../../resources/deals'
import { dealOf, interpolate, leadOf, type ExecutorGroup } from './types'

export const recordExecutors: ExecutorGroup<'create_customer' | 'create_deal' | 'move_deal_stage'> = {
  create_customer(ctx, _action, target) {
    const lead = leadOf(ctx, target)
    if (lead.convertedToCustomerId) return `${lead.name} is already a customer (${lead.convertedToCustomerId})`
    try {
      const { customer } = createCustomerFromLead(ctx, lead.id as typeof lead.id)
      return `Created customer ${customer.id}`
    } catch (error) {
      if (error instanceof ApiError && error.code === 'CONFLICT') return error.message
      throw error
    }
  },
  create_deal(ctx, action, target) {
    const lead = leadOf(ctx, target)
    const deal = createDealRecord(ctx, {
      title: interpolate(ctx, action.title, target) || `${lead.name} deal`,
      leadId: lead.id,
      value: action.value ?? lead.budget ?? 0,
      expectedCloseDate: addDays(ctx.now, 30).toISOString(),
      product: lead.productInterest ?? 'General',
      pipelineId: action.pipelineId,
      stageId: action.stageId,
    })
    return `Created deal ${deal.id}`
  },
  move_deal_stage(ctx, action, target) {
    const deal = dealOf(ctx, target)
    const stage = ctx.db.get('stages', action.stageId, 'Stage')
    if (deal.stageId === stage.id) return `Deal already in ${stage.name}`
    moveDealStage(ctx, deal.id, { stageId: stage.id }, (context, id) => context.db.get('deals', id, 'Deal'))
    return `Moved ${deal.id} to ${stage.name}`
  },
}
