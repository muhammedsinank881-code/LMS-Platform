import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import {
  LEAD_FILTER_FIELDS,
  type DealFilterField,
  type DealListParams,
  type FilterCondition,
  type LeadFilterField,
  type LeadListParams,
} from '@/types'
import type { BoardKind } from '../lib/board-model'

const PAGE = 20

const DEAL_FIELDS: readonly DealFilterField[] = [
  'leadId',
  'ownerId',
  'pipelineId',
  'stageId',
  'product',
  'value',
  'probability',
  'expectedCloseDate',
  'createdAt',
  'sourceId',
  'priority',
  'score',
  'scoreCategory',
  'tags',
  'position',
]

function withField<F extends string>(filter: FilterCondition<string>, field: F): FilterCondition<F> {
  return { ...filter, field } as FilterCondition<F>
}

function collect<F extends string>(
  filters: FilterCondition<string>[],
  allowed: ReadonlySet<string>,
  rename: Readonly<Record<string, F>>,
  pipelineId: string,
  stageId?: string,
): FilterCondition<F>[] {
  const next: FilterCondition<F>[] = []
  for (const filter of filters) {
    const renamed = rename[filter.field]
    const field = renamed ?? (allowed.has(filter.field) ? (filter.field as F) : null)
    if (field) next.push(withField(filter, field))
  }
  next.push({ field: 'pipelineId' as F, operator: 'equals', value: pipelineId })
  if (stageId) next.push({ field: 'stageId' as F, operator: 'equals', value: stageId })
  return next
}

const leadFields = new Set<string>(LEAD_FILTER_FIELDS)
const dealFields = new Set<string>(DEAL_FIELDS)

export function leadParams(
  pipelineId: string,
  search: string,
  filters: FilterCondition<string>[],
  stageId?: string,
): LeadListParams {
  return {
    search: search || undefined,
    pageSize: PAGE,
    sort: [{ field: 'position', direction: 'asc' }],
    filters: collect<LeadFilterField>(filters, leadFields, { value: 'budget', ownerId: 'assignedTo' }, pipelineId, stageId),
  }
}

export function dealParams(
  pipelineId: string,
  search: string,
  filters: FilterCondition<string>[],
  stageId?: string,
): DealListParams {
  return {
    search: search || undefined,
    pageSize: PAGE,
    sort: [{ field: 'position', direction: 'asc' }],
    filters: collect<DealFilterField>(filters, dealFields, {}, pipelineId, stageId),
  }
}

export function columnParams(
  board: BoardKind,
  pipelineId: string,
  stageId: string,
  search: string,
  filters: FilterCondition<string>[],
): LeadListParams | DealListParams {
  return board === 'leads'
    ? leadParams(pipelineId, search, filters, stageId)
    : dealParams(pipelineId, search, filters, stageId)
}

export function useStageColumn(
  board: BoardKind,
  pipelineId: string,
  stageId: string,
  search: string,
  filters: FilterCondition<string>[],
) {
  const { keys, ready } = useWorkspace()
  const params = columnParams(board, pipelineId, stageId, search, filters)
  return useInfiniteQuery({
    queryKey: keys.pipelineBoard.column(board, pipelineId, stageId, params),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (board === 'leads') {
        return api.leads.list({ ...leadParams(pipelineId, search, filters, stageId), page: pageParam })
      }
      return api.deals.list({ ...dealParams(pipelineId, search, filters, stageId), page: pageParam })
    },
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
    enabled: ready && Boolean(pipelineId && stageId),
  })
}

export function useBoardSummary(board: BoardKind, pipelineId: string, search: string, filters: FilterCondition<string>[]) {
  const { keys, ready } = useWorkspace()
  const leads = leadParams(pipelineId, search, filters)
  const deals = dealParams(pipelineId, search, filters)
  return useQuery({
    queryKey: board === 'leads' ? keys.leads.stageSummary(leads) : keys.deals.summary(deals),
    queryFn: () => (board === 'leads' ? api.leads.getStageSummary(leads) : api.deals.getSummary(deals)),
    enabled: ready && Boolean(pipelineId),
  })
}
