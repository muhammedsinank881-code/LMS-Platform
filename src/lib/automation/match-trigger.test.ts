import { describe, expect, it } from 'vitest'
import type { AutomationTrigger, DomainEvent, EventData } from '@/types'
import { matchTrigger } from './match-trigger'

function event(type: DomainEvent['type'], data: EventData = {}): DomainEvent {
  return {
    id: 'e1',
    tenantId: 't',
    type,
    entity: { kind: 'lead', id: 'L-1' },
    occurredAt: '2026-09-10T10:00:00.000Z',
    data,
    chain: { chainId: 'c', depth: 0, causedBy: [] },
  }
}

const match = (trigger: AutomationTrigger, e: DomainEvent) => matchTrigger(e, { trigger })

describe('matchTrigger', () => {
  it('never matches a different event type', () => {
    expect(match({ type: 'deal_won' }, event('deal_lost'))).toBe(false)
  })

  it('lead_created filters by source', () => {
    expect(match({ type: 'lead_created', sourceIds: [] }, event('lead_created', { sourceId: 'a' }))).toBe(true)
    expect(match({ type: 'lead_created', sourceIds: ['a'] }, event('lead_created', { sourceId: 'a' }))).toBe(true)
    expect(match({ type: 'lead_created', sourceIds: ['b'] }, event('lead_created', { sourceId: 'a' }))).toBe(false)
  })

  it('lead_updated needs the field to have changed', () => {
    const t: AutomationTrigger = { type: 'lead_updated', field: 'budget' }
    expect(match(t, event('lead_updated', { changedFields: ['budget', 'name'] }))).toBe(true)
    expect(match(t, event('lead_updated', { changedFields: ['name'] }))).toBe(false)
  })

  it('status_changed matches from/to, null meaning any', () => {
    const t: AutomationTrigger = { type: 'status_changed', fromStatusId: null, toStatusId: 'won' }
    expect(match(t, event('status_changed', { fromStatusId: 'x', toStatusId: 'won' }))).toBe(true)
    expect(match(t, event('status_changed', { fromStatusId: 'x', toStatusId: 'lost' }))).toBe(false)
    expect(match({ type: 'status_changed', fromStatusId: 'a', toStatusId: null }, event('status_changed', { fromStatusId: 'b', toStatusId: 'c' }))).toBe(false)
  })

  it('lead_assigned optionally filters by user', () => {
    expect(match({ type: 'lead_assigned', toUserId: null }, event('lead_assigned', { toUserId: 'u' }))).toBe(true)
    expect(match({ type: 'lead_assigned', toUserId: 'v' }, event('lead_assigned', { toUserId: 'u' }))).toBe(false)
  })

  it('score_crossed respects direction', () => {
    const up: AutomationTrigger = { type: 'score_crossed', threshold: 70, direction: 'up' }
    const down: AutomationTrigger = { type: 'score_crossed', threshold: 70, direction: 'down' }
    const either: AutomationTrigger = { type: 'score_crossed', threshold: 70, direction: 'either' }
    const rising = event('score_crossed', { fromScore: 60, toScore: 75 })
    const falling = event('score_crossed', { fromScore: 75, toScore: 60 })
    const staying = event('score_crossed', { fromScore: 80, toScore: 90 })
    expect([match(up, rising), match(up, falling), match(up, staying)]).toEqual([true, false, false])
    expect([match(down, rising), match(down, falling)]).toEqual([false, true])
    expect([match(either, rising), match(either, falling), match(either, staying)]).toEqual([true, true, false])
  })

  it('lead_not_contacted compares idle time against hours or days', () => {
    const hours: AutomationTrigger = { type: 'lead_not_contacted', amount: 2, unit: 'hours' }
    expect(match(hours, event('lead_not_contacted', { idleMinutes: 119 }))).toBe(false)
    expect(match(hours, event('lead_not_contacted', { idleMinutes: 120 }))).toBe(true)
    const days: AutomationTrigger = { type: 'lead_not_contacted', amount: 1, unit: 'days' }
    expect(match(days, event('lead_not_contacted', { idleMinutes: 1439 }))).toBe(false)
    expect(match(days, event('lead_not_contacted', { idleMinutes: 1440 }))).toBe(true)
  })

  it('followup events', () => {
    expect(match({ type: 'followup_overdue' }, event('followup_overdue'))).toBe(true)
    const done: AutomationTrigger = { type: 'followup_completed', followUpType: 'call' }
    expect(match(done, event('followup_completed', { followUpType: 'call' }))).toBe(true)
    expect(match(done, event('followup_completed', { followUpType: 'demo' }))).toBe(false)
  })

  it('deal events', () => {
    const t: AutomationTrigger = { type: 'deal_stage_changed', pipelineId: 'p', fromStageId: null, toStageId: 's2' }
    expect(match(t, event('deal_stage_changed', { pipelineId: 'p', toStageId: 's2', fromStageId: 's1' }))).toBe(true)
    expect(match(t, event('deal_stage_changed', { pipelineId: 'q', toStageId: 's2' }))).toBe(false)
    expect(match({ type: 'deal_won' }, event('deal_won'))).toBe(true)
    expect(match({ type: 'deal_lost' }, event('deal_lost'))).toBe(true)
  })

  it('message_received and form_submitted', () => {
    expect(match({ type: 'message_received', channel: null }, event('message_received', { channel: 'email' }))).toBe(true)
    expect(match({ type: 'message_received', channel: 'whatsapp' }, event('message_received', { channel: 'email' }))).toBe(false)
    expect(match({ type: 'form_submitted', formId: 'f' }, event('form_submitted', { formId: 'f' }))).toBe(true)
    expect(match({ type: 'form_submitted', formId: 'f' }, event('form_submitted', { formId: 'g' }))).toBe(false)
  })

  it('import_completed', () => {
    expect(match({ type: 'import_completed' }, event('import_completed'))).toBe(true)
  })

  it('scheduled only matches an actual slot', () => {
    const t: AutomationTrigger = { type: 'scheduled', frequency: 'daily', time: '09:00', weekday: 1 }
    const slot = new Date(2026, 8, 10, 9, 0, 0, 0).toISOString()
    const off = new Date(2026, 8, 10, 9, 30, 0, 0).toISOString()
    expect(match(t, event('scheduled', { firedAt: slot }))).toBe(true)
    expect(match(t, event('scheduled', { firedAt: off }))).toBe(false)
    expect(match(t, event('scheduled'))).toBe(false)
    const weekly: AutomationTrigger = { type: 'scheduled', frequency: 'weekly', time: '09:00', weekday: 1 }
    const monday = new Date(2026, 8, 7, 9, 0, 0, 0).toISOString()
    expect(match(weekly, event('scheduled', { firedAt: monday }))).toBe(true)
    expect(match(weekly, event('scheduled', { firedAt: slot }))).toBe(false)
  })
})
