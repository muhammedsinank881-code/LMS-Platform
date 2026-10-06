import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportTable, type ReportColumn } from '@/components/common/ReportTable'
import { renderWithProviders } from '@/test/render'
import type { BreakdownMetricsRow, Campaign, CampaignMetrics } from '@/types'
import { AdSetBreakdownTable } from './detail/AdSetBreakdownTable'
import { BudgetProgress } from './detail/BudgetProgress'
import { parseSpendCsv } from '../lib/spend-csv'
import { PerformanceFlag } from './PerformanceFlag'

const metrics = (patch: Partial<CampaignMetrics> = {}): CampaignMetrics => ({
  spend: 1000,
  leads: 10,
  qualified: 5,
  deals: 2,
  wonDeals: 1,
  revenue: 5000,
  cpl: 100,
  cac: 1000,
  roas: 5,
  costPerQualified: 200,
  conversionRate: 10,
  ...patch,
})

const campaign = (patch: Partial<Campaign> = {}): Campaign => ({
  id: 'c1',
  tenantId: 't',
  name: 'Camp',
  platform: 'facebook',
  objective: 'leads',
  status: 'active',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-01-31T00:00:00.000Z',
  budget: 1000,
  ownerId: 'u',
  tags: [],
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...patch,
})

describe('AdSetBreakdownTable', () => {
  const rows: BreakdownMetricsRow[] = [
    {
      id: 's1',
      name: 'Metro audience',
      status: 'active',
      metrics: metrics(),
      children: [{ id: 'a1', name: 'Carousel A', status: 'active', metrics: metrics(), children: [] }],
    },
  ]

  it('expands and collapses ads from the keyboard', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <AdSetBreakdownTable rows={rows} isLoading={false} isError={false} onRetry={() => undefined} spendHidden={false} />,
    )
    const toggle = screen.getByRole('button', { name: /Metro audience/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryAllByText('Carousel A').filter((el) => el.closest('table'))).toHaveLength(0)
    toggle.focus()
    await user.keyboard('{Enter}')
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByText('Carousel A').some((el) => el.closest('table'))).toBe(true)
    await user.keyboard(' ')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows Restricted instead of spend when hidden', () => {
    renderWithProviders(
      <AdSetBreakdownTable rows={rows} isLoading={false} isError={false} onRetry={() => undefined} spendHidden />,
    )
    expect(screen.getAllByText('Restricted').length).toBeGreaterThan(0)
  })
})

describe('BudgetProgress', () => {
  const now = new Date('2026-01-10T00:00:00.000Z')

  it('says nothing is wrong under 80%', () => {
    renderWithProviders(<BudgetProgress campaign={campaign()} spent={500} hidden={false} now={now} />)
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('warns above 80% and highlights over budget with text', () => {
    const { unmount } = renderWithProviders(<BudgetProgress campaign={campaign()} spent={850} hidden={false} now={now} />)
    expect(screen.getByRole('status')).toHaveTextContent(/more than 80%/i)
    unmount()
    renderWithProviders(<BudgetProgress campaign={campaign()} spent={1200} hidden={false} now={now} />)
    expect(screen.getByRole('status')).toHaveTextContent(/over budget/i)
  })

  it('projects spend to the end date and hides it without view-spend', () => {
    const { unmount } = renderWithProviders(<BudgetProgress campaign={campaign()} spent={500} hidden={false} now={now} />)
    expect(screen.getByText(/Projected/)).toBeInTheDocument()
    unmount()
    renderWithProviders(<BudgetProgress campaign={campaign()} spent={null} hidden now={now} />)
    expect(screen.getByText('Restricted')).toBeInTheDocument()
  })
})

describe('PerformanceFlag', () => {
  it('explains why a campaign is flagged, in text', () => {
    renderWithProviders(<PerformanceFlag metrics={metrics({ cpl: 400, roas: 0.4 })} tenantAvgCpl={100} />)
    const flag = screen.getByText('Needs attention')
    expect(flag.closest('[aria-label]')?.getAttribute('aria-label')).toMatch(/Cost per lead.*Return on ad spend/)
  })

  it('renders nothing for a healthy campaign', () => {
    const { container } = renderWithProviders(<PerformanceFlag metrics={metrics()} tenantAvgCpl={100} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('ReportTable', () => {
  interface Row {
    name: string
    value: number | null
  }
  const columns: ReportColumn<Row>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.name, sortValue: (r) => r.name },
    { id: 'value', header: 'Value', align: 'right', cell: (r) => r.value ?? '—', sortValue: (r) => r.value },
  ]
  const rows: Row[] = [
    { name: 'b', value: 2 },
    { name: 'a', value: null },
    { name: 'c', value: 9 },
  ]

  it('sorts by a header button, keeping empty values last, and exposes aria-sort', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ReportTable caption="t" columns={columns} rows={rows} getKey={(r) => r.name} />)
    const body = () => screen.getAllByRole('row').slice(1).map((row) => row.textContent)
    await user.click(screen.getByRole('button', { name: 'Value' }))
    expect(body()).toEqual(['c9', 'b2', 'a—'])
    expect(screen.getByRole('columnheader', { name: /Value/ })).toHaveAttribute('aria-sort', 'descending')
    await user.click(screen.getByRole('button', { name: 'Value' }))
    expect(body()).toEqual(['b2', 'c9', 'a—'])
  })
})

describe('parseSpendCsv', () => {
  it('reads loosely named headers', () => {
    const { rows, error } = parseSpendCsv('Date,Spend,Ad Set,Notes\n2026-01-02,"1,500",Metro,hello\n')
    expect(error).toBeNull()
    expect(rows).toEqual([{ date: '2026-01-02', amount: '1,500', adSet: 'Metro', notes: 'hello' }])
  })

  it('rejects a file without the required columns or rows', () => {
    expect(parseSpendCsv('foo,bar\n1,2').error).toMatch(/date.*amount/)
    expect(parseSpendCsv('date,amount\n').error).toMatch(/no rows/)
  })
})
