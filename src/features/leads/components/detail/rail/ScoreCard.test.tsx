import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { calculateLeadScore, DEFAULT_SCORING_THRESHOLDS } from '@/lib/scoring'
import { renderWithProviders } from '@/test/render'
import { makeLead, makeScoringRule } from '@/test/factories'
import { ScoreCard } from './ScoreCard'

const rules = [
  makeScoringRule({
    id: 'r-fb',
    name: 'Facebook source',
    order: 1,
    points: 10,
    conditions: [{ field: 'sourceId', operator: 'equals', value: 'source-facebook' }],
  }),
  makeScoringRule({
    id: 'r-budget',
    name: 'Budget above ₹1L',
    order: 2,
    points: 20,
    conditions: [{ field: 'budget', operator: 'gt', value: 100_000 }],
  }),
]

describe('ScoreCard', () => {
  it('renders the breakdown from calculateLeadScore', () => {
    const lead = makeLead({ sourceId: 'source-facebook', budget: 250_000 })
    const result = calculateLeadScore(lead, rules, DEFAULT_SCORING_THRESHOLDS)
    renderWithProviders(
      <ScoreCard
        canEdit
        lead={{ ...lead, score: result.score, scoreCategory: result.category, scoreBreakdown: result.breakdown }}
        thresholds={DEFAULT_SCORING_THRESHOLDS}
        onRecalculate={vi.fn()}
      />,
    )

    expect(screen.getByText('Facebook source')).toBeInTheDocument()
    expect(screen.getByText('+10')).toBeInTheDocument()
    expect(screen.getByText('Budget above ₹1L')).toBeInTheDocument()
    expect(screen.getByText('+20')).toBeInTheDocument()
    expect(screen.getByText(`Total ${result.score}`)).toBeInTheDocument()
    expect(screen.getByText(/Hot at 70/)).toBeInTheDocument()
  })
})
