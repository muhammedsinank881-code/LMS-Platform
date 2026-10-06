import { describe, expect, it } from 'vitest'
import type { AudienceCount, MessageTemplate } from '@/types'
import { INITIAL_WIZARD, scheduleAt, stepError, toBroadcastInput, type WizardState } from './broadcast-wizard'

const NOW = new Date('2026-10-04T06:00:00.000Z')
const template = { id: 't1', variables: ['lead.name', 'offer'] } as MessageTemplate
const count = (patch: Partial<AudienceCount> = {}): AudienceCount => ({
  total: 10,
  optedOut: 2,
  missingNumber: 1,
  eligible: 7,
  ...patch,
})
const state = (patch: Partial<WizardState> = {}): WizardState => ({ ...INITIAL_WIZARD, ...patch })

describe('broadcast wizard steps', () => {
  it('needs a template first', () => {
    expect(stepError(0, state(), undefined, undefined, [], NOW)).toMatch(/template/i)
    expect(stepError(0, state({ templateId: 't1' }), template, undefined, [], NOW)).toBeNull()
  })

  it('blocks the audience step until the eligible count (after opt-outs) is above zero', () => {
    const audience = { kind: 'tag', tag: 'vip' } as const
    expect(stepError(1, state(), template, undefined, [], NOW)).toMatch(/who/i)
    expect(stepError(1, state({ audience }), template, undefined, [], NOW)).toMatch(/counting/i)
    expect(stepError(1, state({ audience }), template, count({ eligible: 0, optedOut: 10 }), [], NOW)).toMatch(/no one/i)
    expect(stepError(1, state({ audience }), template, count(), [], NOW)).toBeNull()
  })

  it('validates the variable mapping', () => {
    const bad = state({ variableMap: { 'lead.name': 'lead.name', offer: '' } })
    expect(stepError(2, bad, template, count(), [], NOW)).toMatch(/map every variable/i)
    const good = state({ variableMap: { 'lead.name': 'lead.name', offer: 'text:20% off' } })
    expect(stepError(2, good, template, count(), [], NOW)).toBeNull()
  })

  it('requires a future time when scheduling for later', () => {
    expect(stepError(4, state({ mode: 'now' }), template, count(), [], NOW)).toBeNull()
    expect(stepError(4, state({ mode: 'later' }), template, count(), [], NOW)).toMatch(/future/i)
    expect(stepError(4, state({ mode: 'later', date: '2020-01-01', time: '10:00' }), template, count(), [], NOW)).toMatch(/future/i)
    expect(stepError(4, state({ mode: 'later', date: '2030-01-01', time: '10:00' }), template, count(), [], NOW)).toBeNull()
  })

  it('needs a name to confirm, and builds the input', () => {
    expect(stepError(5, state(), template, count(), [], NOW)).toMatch(/name/i)
    const ready = state({
      name: ' Diwali ',
      templateId: 't1',
      audience: { kind: 'tag', tag: 'vip' },
      variableMap: { offer: 'text:x' },
    })
    expect(toBroadcastInput(ready)).toMatchObject({ name: 'Diwali', schedule: { mode: 'now', at: null } })
    expect(toBroadcastInput(state())).toBeNull()
  })

  it('turns a local date and time into a timestamp, or null', () => {
    expect(scheduleAt('', '10:00')).toBeNull()
    expect(scheduleAt('2030-01-01', '10:00')).toMatch(/^2030-01-01T/)
  })
})
