import { describe, expect, it } from 'vitest'
import { toListFilters } from './to-list-filters'
import type { FilterDraft, FilterFieldConfig } from './operators'

const fields: FilterFieldConfig[] = [
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'budget', label: 'Budget', type: 'currency' },
  { id: 'createdAt', label: 'Created', type: 'date' },
  { id: 'statusId', label: 'Status', type: 'select', options: [{ value: 's1', label: 'New' }] },
  { id: 'tags', label: 'Tags', type: 'multi-select', options: [{ value: 'VIP', label: 'VIP' }] },
  { id: 'assignedTo', label: 'Owner', type: 'user', options: [{ value: 'u1', label: 'Riya' }] },
  { id: 'isDuplicate', label: 'Duplicate', type: 'boolean' },
]

describe('toListFilters', () => {
  it('converts a text contains draft', () => {
    const drafts: FilterDraft[] = [{ field: 'name', operator: 'contains', value: 'Riya' }]
    expect(toListFilters(fields, drafts)).toEqual([
      { field: 'name', operator: 'contains', value: 'Riya' },
    ])
  })

  it('coerces currency numbers and between pairs', () => {
    expect(
      toListFilters(fields, [
        { field: 'budget', operator: 'gt', value: '50000' },
        { field: 'budget', operator: 'between', value: ['100', '200'] },
      ]),
    ).toEqual([
      { field: 'budget', operator: 'gt', value: 50000 },
      { field: 'budget', operator: 'between', value: [100, 200] },
    ])
  })

  it('keeps date presets and date strings', () => {
    expect(
      toListFilters(fields, [
        { field: 'createdAt', operator: 'date_preset', value: 'this_month' },
        { field: 'createdAt', operator: 'gt', value: '2026-01-01' },
      ]),
    ).toEqual([
      { field: 'createdAt', operator: 'date_preset', value: 'this_month' },
      { field: 'createdAt', operator: 'gt', value: '2026-01-01' },
    ])
  })

  it('converts select, multi-select, user and boolean', () => {
    expect(
      toListFilters(fields, [
        { field: 'statusId', operator: 'equals', value: 's1' },
        { field: 'tags', operator: 'in', value: ['VIP'] },
        { field: 'assignedTo', operator: 'equals', value: 'u1' },
        { field: 'isDuplicate', operator: 'equals', value: 'true' },
      ]),
    ).toEqual([
      { field: 'statusId', operator: 'equals', value: 's1' },
      { field: 'tags', operator: 'in', value: ['VIP'] },
      { field: 'assignedTo', operator: 'equals', value: 'u1' },
      { field: 'isDuplicate', operator: 'equals', value: true },
    ])
  })

  it('drops incomplete rows', () => {
    expect(
      toListFilters(fields, [
        { field: 'name', operator: 'contains', value: '' },
        { field: 'name', operator: 'is_empty' },
      ]),
    ).toEqual([{ field: 'name', operator: 'is_empty' }])
  })
})
