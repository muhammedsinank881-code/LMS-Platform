import { describe, expect, it } from 'vitest'
import {
  parseListUrlState,
  serializeListUrlState,
  type ListUrlState,
} from './list-url-state'

const sample: ListUrlState<'name' | 'budget'> = {
  search: 'ananya',
  filters: [
    { field: 'name', operator: 'contains', value: 'ananya' },
    { field: 'budget', operator: 'gt', value: 50000 },
  ],
  sort: [{ field: 'budget', direction: 'desc' }],
  page: 2,
  pageSize: 50,
  viewId: 'view-hot',
  mode: 'card',
}

describe('list url state', () => {
  it('round-trips parse and serialize', () => {
    const params = serializeListUrlState(sample)
    const parsed = parseListUrlState<'name' | 'budget'>(params, {
      sort: [{ field: 'name', direction: 'asc' }],
      pageSize: 25,
    })
    expect(parsed).toEqual(sample)
  })

  it('omits default page, pageSize, sort and table mode', () => {
    const params = serializeListUrlState({
      search: '',
      filters: [],
      sort: [{ field: 'createdAt', direction: 'desc' }],
      page: 1,
      pageSize: 25,
      viewId: null,
      mode: 'table',
    })
    expect(params.toString()).toBe('')
  })

  it('keeps follow-up view keys when filters change', () => {
    const current = new URLSearchParams('display=calendar&period=2026-10-04&bucket=overdue&scope=mine')
    const params = serializeListUrlState(
      {
        search: 'rahul',
        filters: [],
        sort: [{ field: 'createdAt', direction: 'desc' }],
        page: 1,
        pageSize: 25,
        viewId: null,
        mode: 'table',
      },
      {},
      current,
    )
    expect(params.get('q')).toBe('rahul')
    expect(params.get('display')).toBe('calendar')
    expect(params.get('period')).toBe('2026-10-04')
    expect(params.get('bucket')).toBe('overdue')
    expect(params.get('scope')).toBe('mine')
  })

  it('recovers from invalid filter JSON', () => {
    const params = new URLSearchParams('f=not-json&q=hi')
    const parsed = parseListUrlState(params)
    expect(parsed.search).toBe('hi')
    expect(parsed.filters).toEqual([])
  })
})
