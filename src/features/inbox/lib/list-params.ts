import type { ConversationFilterField, ConversationListParams, FilterCondition, UserId } from '@/types'
import type { InboxFilters } from './inbox-filters'

export function inboxListParams(filters: InboxFilters, userId: UserId): ConversationListParams {
  const conditions: FilterCondition<ConversationFilterField>[] = []
  if (filters.channel !== 'all') {
    conditions.push({ field: 'channel', operator: 'equals', value: filters.channel })
  }
  if (filters.status !== 'all') {
    conditions.push({ field: 'status', operator: 'equals', value: filters.status })
  }
  if (filters.unreadOnly) {
    conditions.push({ field: 'unreadCount', operator: 'gt', value: 0 })
  }
  if (filters.assignedToMe) {
    conditions.push({ field: 'assignedTo', operator: 'equals', value: userId })
  }
  if (filters.unassigned) {
    conditions.push({ field: 'assignedTo', operator: 'is_empty' })
  }
  const dated = messageDateFilter(filters.from, filters.to)
  if (dated) conditions.push(dated)
  return {
    pageSize: 50,
    search: filters.search || undefined,
    filters: conditions.length > 0 ? conditions : undefined,
  }
}

function dayBound(day: string, end: boolean): string {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, date ?? 1, end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0).toISOString()
}

function messageDateFilter(from: string, to: string): FilterCondition<ConversationFilterField> | null {
  const start = from ? dayBound(from, false) : null
  const end = to ? dayBound(to, true) : null
  if (start && end) return { field: 'lastMessageAt', operator: 'between', value: [start, end] }
  if (start) return { field: 'lastMessageAt', operator: 'gt', value: new Date(Date.parse(start) - 1).toISOString() }
  if (end) return { field: 'lastMessageAt', operator: 'lt', value: new Date(Date.parse(end) + 1).toISOString() }
  return null
}
