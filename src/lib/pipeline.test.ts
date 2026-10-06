import { describe, expect, it } from 'vitest'
import { makeStage } from '@/test/factories'
import { computePipelineValue } from './metrics'
import {
  buildStageHistory,
  canMoveToStage,
  computeExpectedRevenue,
  computeStageTotals,
  getDaysInStage,
  reorderWithinColumn,
  summarizeBoard,
} from './pipeline'

const stages = [
  makeStage({ id: 'new', order: 1, probability: 10, type: 'open' }),
  makeStage({ id: 'proposal', order: 2, probability: 50, type: 'open' }),
  makeStage({ id: 'won', order: 3, probability: 100, type: 'won' }),
  makeStage({ id: 'lost', order: 4, probability: 0, type: 'lost' }),
  makeStage({ id: 'junk', order: 5, probability: 0, type: 'invalid' }),
]

describe('computeStageTotals', () => {
  it('sums count, value, and weighted value per stage', () => {
    const totals = computeStageTotals(
      [
        { stageId: 'new', value: 100_000 },
        { stageId: 'proposal', value: 200_000, probability: 80 },
        { stageId: 'won', value: 50_000, probability: 100 },
      ],
      stages,
    )
    expect(totals.map((row) => [row.stageId, row.count, row.total, row.weighted])).toEqual([
      ['new', 1, 100_000, 10_000],
      ['proposal', 1, 200_000, 160_000],
      ['won', 1, 50_000, 50_000],
      ['lost', 0, 0, 0],
      ['junk', 0, 0, 0],
    ])
  })
})

describe('computeExpectedRevenue', () => {
  it('rounds value times probability', () => {
    expect(computeExpectedRevenue(100_000, 25)).toBe(25_000)
    expect(computeExpectedRevenue(100, 33)).toBe(33)
  })
})

describe('summarizeBoard', () => {
  it('keeps weighted pipeline value to open stages across pipelines', () => {
    const sales = [
      makeStage({ id: 's-open', pipelineId: 'sales', probability: 50, type: 'open' }),
      makeStage({ id: 's-won', pipelineId: 'sales', probability: 100, type: 'won' }),
    ]
    const enterprise = [
      makeStage({ id: 'e-open', pipelineId: 'enterprise', probability: 20, type: 'open' }),
      makeStage({ id: 'e-lost', pipelineId: 'enterprise', probability: 0, type: 'lost' }),
    ]
    const items = [
      { stageId: 's-open', value: 100_000, probability: 50 },
      { stageId: 's-won', value: 999_000, probability: 100 },
      { stageId: 'e-open', value: 200_000, probability: 20 },
      { stageId: 'e-lost', value: 50_000, probability: 0 },
    ]
    const summary = summarizeBoard(items, [...sales, ...enterprise])
    expect(summary).toMatchObject({ total: 300_000, weighted: 90_000, count: 2 })
    expect(computePipelineValue(
      items.map((item) => ({ value: item.value, probability: item.probability, stageId: item.stageId })),
      [...sales, ...enterprise],
    )).toEqual({ total: 300_000, weighted: 90_000, count: 2 })
  })
})

describe('getDaysInStage', () => {
  it('counts whole days since the stage was entered', () => {
    const now = new Date('2026-10-04T06:00:00.000Z')
    expect(getDaysInStage({ stageEnteredAt: '2026-10-01T06:00:00.000Z' }, now)).toBe(3)
    expect(getDaysInStage({ stageEnteredAt: '2026-10-04T01:00:00.000Z' }, now)).toBe(0)
  })
})

describe('buildStageHistory', () => {
  it('attributes each span to the person who moved it there', () => {
    const now = new Date('2026-10-10T00:00:00.000Z')
    const spans = buildStageHistory(
      '2026-10-01T00:00:00.000Z',
      'won',
      [
        { at: '2026-10-04T00:00:00.000Z', actorId: 'u1', fromStageId: 'new', toStageId: 'proposal' },
        { at: '2026-10-08T00:00:00.000Z', actorId: 'u2', fromStageId: 'proposal', toStageId: 'won' },
      ],
      now,
    )
    expect(spans).toEqual([
      { stageId: 'new', enteredAt: '2026-10-01T00:00:00.000Z', exitedAt: '2026-10-04T00:00:00.000Z', actorId: null, days: 3 },
      { stageId: 'proposal', enteredAt: '2026-10-04T00:00:00.000Z', exitedAt: '2026-10-08T00:00:00.000Z', actorId: 'u1', days: 4 },
      { stageId: 'won', enteredAt: '2026-10-08T00:00:00.000Z', exitedAt: null, actorId: 'u2', days: 2 },
    ])
  })
})

describe('canMoveToStage', () => {
  const open = stages[0]
  const proposal = stages[1]
  const won = stages[2]
  const lost = stages[3]
  const invalid = stages[4]
  const other = makeStage({ id: 'other', pipelineId: 'enterprise', type: 'open' })

  it('blocks a move into another pipeline', () => {
    expect(canMoveToStage({ kind: 'deal', pipelineId: 'pipeline-1' }, open, other)).toMatchObject({
      allowed: false,
      dialog: 'none',
    })
  })

  it('asks for the dialog each terminal stage requires', () => {
    const lead = { kind: 'lead' as const, pipelineId: 'pipeline-1' }
    const deal = { kind: 'deal' as const, pipelineId: 'pipeline-1' }
    expect(canMoveToStage(lead, open, proposal).dialog).toBe('none')
    expect(canMoveToStage(lead, open, lost).dialog).toBe('lost-reason')
    expect(canMoveToStage(lead, open, won).dialog).toBe('convert')
    expect(canMoveToStage(deal, open, won).dialog).toBe('close-won')
    expect(canMoveToStage(lead, open, invalid).dialog).toBe('confirm')
    expect(canMoveToStage(deal, won, open).dialog).toBe('confirm')
    expect(canMoveToStage(deal, open, open).dialog).toBe('none')
  })
})

describe('reorderWithinColumn', () => {
  const items = [
    { id: 'a', position: 1 },
    { id: 'b', position: 2 },
    { id: 'c', position: 3 },
  ]

  it('places a card between neighbors without rewriting them', () => {
    expect(reorderWithinColumn(items, 0, 2)).toEqual({ id: 'a', position: 2.5, needsCompact: false })
    expect(reorderWithinColumn(items, 2, 0)).toEqual({ id: 'c', position: 0.5, needsCompact: false })
    expect(reorderWithinColumn(items, 1, 1)).toEqual({ id: 'b', position: 2, needsCompact: false })
  })

  it('asks for a compact when the gap can no longer be halved', () => {
    const tight = [
      { id: 'a', position: 1 },
      { id: 'b', position: 1 + 1e-8 },
      { id: 'c', position: 2 },
    ]
    expect(reorderWithinColumn(tight, 2, 1).needsCompact).toBe(true)
  })
})
