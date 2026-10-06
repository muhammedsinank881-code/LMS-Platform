import type { DateRange, FilterCondition } from '@/types'

export function listHref(path: string, filters: FilterCondition[]): string {
  if (filters.length === 0) return path
  const params = new URLSearchParams()
  params.set('f', JSON.stringify(filters))
  return `${path}?${params.toString()}`
}

const equals = (field: string, value: string): FilterCondition => ({ field, operator: 'equals', value })

export function hotLeadsHref(): string {
  return listHref('/leads', [equals('scoreCategory', 'hot')])
}

export function createdHref(range: DateRange): string {
  return listHref('/leads', [{ field: 'createdAt', operator: 'between', value: [range.from, range.to] }])
}

export function qualifiedHref(range: DateRange): string {
  return listHref('/leads', [equals('qualificationStatus', 'qualified'), { field: 'createdAt', operator: 'between', value: [range.from, range.to] }])
}

export function stageTypeHref(type: 'open' | 'won' | 'lost'): string {
  return listHref('/deals', [equals('stageType', type)])
}

export function leadFieldHref(field: 'sourceId' | 'statusId' | 'assignedTo' | 'campaignId' | 'location', value: string): string {
  return listHref('/leads', [equals(field, value)])
}

export function dealStageHref(stageId: string): string {
  return listHref('/deals', [equals('stageId', stageId)])
}

export const OVERDUE_FOLLOWUPS = '/follow-ups?bucket=overdue'
export const TODAY_FOLLOWUPS = '/follow-ups?bucket=today'
