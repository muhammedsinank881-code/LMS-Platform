import { describe, expect, it } from 'vitest'
import { DEFAULT_PERMISSION_MATRIX, can, diffMatrix, getDataScope } from '@/lib/permissions'
import { importTargets } from '@/features/leads/config/import-targets'
import { customLeadFilterFields } from '@/features/leads/config/lead-filter-fields'
import { activeFields, fieldKeyFromLabel, uniqueOptions } from '@/lib/settings/custom-field'
import { reorderIds } from '@/lib/settings/reorder'
import { keepsWonAndLost } from '@/lib/settings/terminal'
import { summarizeAuditChange } from '@/lib/settings/audit-summary'
import { pickAssignee } from '@/lib/assignment'
import { makeAssignmentRule, makeLead, makeUser } from '@/test/factories'
import type { CustomFieldDefinition, PermissionMatrix } from '@/types'

describe('tenant permission matrix', () => {
  it('changes access when a custom matrix is passed', () => {
    const custom: PermissionMatrix = {
      ...DEFAULT_PERMISSION_MATRIX,
      salesperson: {
        ...DEFAULT_PERMISSION_MATRIX.salesperson,
        leads: { scope: 'team', actions: ['view', 'export'] },
      },
    }
    expect(can({ role: 'salesperson' }, 'leads', 'export', custom)).toBe(true)
    expect(can({ role: 'salesperson' }, 'leads', 'create', custom)).toBe(false)
    expect(getDataScope({ role: 'salesperson' }, 'leads', custom)).toBe('team')
  })

  it('diffs only the cells that changed', () => {
    const next: PermissionMatrix = {
      ...DEFAULT_PERMISSION_MATRIX,
      salesperson: {
        ...DEFAULT_PERMISSION_MATRIX.salesperson,
        leads: { scope: 'own', actions: ['view'] },
      },
    }
    const changes = diffMatrix(DEFAULT_PERMISSION_MATRIX, next)
    expect(changes.some((change) => change.key === 'salesperson.leads.actions')).toBe(true)
  })
})

describe('settings helpers', () => {
  it('reorders ids and can roll back to the previous order', () => {
    const start = ['a', 'b', 'c']
    const next = reorderIds(start, 'a', 'c')
    expect(next).toEqual(['b', 'c', 'a'])
    expect(reorderIds(next, 'a', 'b')).toEqual(start)
  })

  it('requires a won and a lost entry to remain', () => {
    const items = [
      { id: 'open', type: 'open' },
      { id: 'won', type: 'won' },
      { id: 'lost', type: 'lost' },
    ]
    expect(keepsWonAndLost(items, 'won')).toBe(false)
    expect(keepsWonAndLost(items, 'open')).toBe(true)
  })

  it('builds a stable key and rejects duplicate options', () => {
    expect(fieldKeyFromLabel('GST Number')).toBe('gst_number')
    expect(uniqueOptions(['A', 'a'])).toBeNull()
    expect(uniqueOptions(['A', 'B'])).toEqual(['A', 'B'])
  })

  it('hides archived fields from filters and import targets', () => {
    const fields = [
      field('lead', 'site', false),
      field('lead', 'old', true),
      field('deal', 'contract', false),
    ]
    expect(customLeadFilterFields(fields).map((item) => item.id)).toEqual(['cf:site'])
    expect(importTargets(fields).map((item) => item.id)).toContain('cf:site')
    expect(importTargets(fields).map((item) => item.id)).not.toContain('cf:old')
    expect(activeFields(fields, 'deal').map((item) => item.key)).toEqual(['contract'])
  })

  it('summarizes a before and after value', () => {
    expect(
      summarizeAuditChange({
        action: 'settings_changed',
        previousValue: { status: 'New' },
        newValue: { status: 'Qualified' },
      }),
    ).toContain('New → Qualified')
  })

  it('uses the fallback assignee when no rule matches', () => {
    const result = pickAssignee(makeLead(), [], [makeUser({ id: 'owner' })], [], new Date(), { userId: 'owner' })
    expect(result).toMatchObject({ userId: 'owner', ruleId: null, reason: 'Fallback assignee' })
  })

  it('picks the higher average score before a lower one', () => {
    const rules = [
      makeAssignmentRule({
        distribution: 'highest_score',
        pool: { teamId: null, userIds: ['low', 'high'], matchLanguage: false, matchLocation: false },
      }),
    ]
    const users = [makeUser({ id: 'low', workload: 0 }), makeUser({ id: 'high', workload: 1 })]
    const leads = [
      makeLead({ id: 'L-1', assignedTo: 'high', score: 90 }),
      makeLead({ id: 'L-2', assignedTo: 'low', score: 10 }),
    ]
    expect(pickAssignee(makeLead({ id: 'L-3' }), rules, users, leads).userId).toBe('high')
  })
})

function field(entity: 'lead' | 'deal', key: string, archived: boolean): CustomFieldDefinition {
  return {
    id: key,
    tenantId: 't',
    entity,
    key,
    label: key,
    type: 'text',
    options: [],
    required: false,
    order: 1,
    archived,
  }
}
