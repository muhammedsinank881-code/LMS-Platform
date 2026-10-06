import { describe, expect, it } from 'vitest'
import type { UserId } from '@/types'
import { inboxListParams } from './list-params'

const userId = 'user-1' as UserId
const base = {
  channel: 'all' as const,
  unreadOnly: false,
  assignedToMe: false,
  unassigned: false,
  status: 'open' as const,
  search: '',
  from: '',
  to: '',
}

describe('inboxListParams date filter', () => {
  it('leaves last-message date off when both days are empty', () => {
    const params = inboxListParams(base, userId)
    expect(params.filters?.some((item) => item.field === 'lastMessageAt')).toBe(false)
  })

  it('filters last message time between the chosen days', () => {
    const params = inboxListParams({ ...base, from: '2026-10-01', to: '2026-10-04' }, userId)
    const dated = params.filters?.find((item) => item.field === 'lastMessageAt')
    expect(dated?.operator).toBe('between')
    if (dated?.operator !== 'between') return
    expect(new Date(String(dated.value[0])).getDate()).toBe(1)
    expect(new Date(String(dated.value[1])).getDate()).toBe(4)
  })
})
