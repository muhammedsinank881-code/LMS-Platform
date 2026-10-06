import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import { SaveBarContext, type SaveState } from '../components/use-save-bar'
import { ScoringSettingsPage } from './ScoringSettingsPage'

configure({ asyncUtilTimeout: 5000 })
vi.setConfig({ testTimeout: 30000 })

let savedState: SaveState | null = null

function Harness({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  return (
    <QueryClientProvider client={client}>
      <SaveBarContext.Provider value={{ setSave: (state) => (savedState = state) }}>
        <MemoryRouter>{children}</MemoryRouter>
      </SaveBarContext.Provider>
    </QueryClientProvider>
  )
}

function signIn(userId: string, role: 'admin' | 'salesperson') {
  actAs(userId)
  useAuthStore.setState({
    user: { id: userId, tenantId: ACME_TENANT_ID, name: 'Tester', email: 't@example.in', role, teamId: null, avatarUrl: null },
    tenant: { id: ACME_TENANT_ID, name: 'Acme', slug: 'acme', currency: 'INR', timezone: 'Asia/Kolkata', onboardingCompleted: true, createdAt: '2026-01-01T00:00:00.000Z' },
    tenants: [],
    token: 'test',
    intentionalSignOut: false,
  })
}

beforeEach(() => {
  setupMock()
  savedState = null
  signIn(USERS.arjun, 'admin')
})

afterEach(() => {
  teardownMock()
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
})

const renderPage = () =>
  render(
    <Harness>
      <ScoringSettingsPage />
    </Harness>,
  )

describe('ScoringSettingsPage', () => {
  it('lists rules in plain language with how many leads match each', async () => {
    renderPage()
    expect(await screen.findByText(/Budget greater than 1,00,000: \+20/)).toBeInTheDocument()
    expect((await screen.findAllByText(/\d+ leads/)).length).toBeGreaterThan(0)
    expect(screen.getByText(/WhatsApp replies greater than 0: \+5/)).toBeInTheDocument()
  })

  it('adds a rule from the drawer with a live preview', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Add rule' }))
    const drawer = await screen.findByRole('dialog')
    await user.type(within(drawer).getByLabelText(/Name/), 'Big spender')
    const points = within(drawer).getByLabelText(/Points/)
    await user.clear(points)
    await user.type(points, '12')
    expect(within(drawer).getByText(/Preview:/).parentElement).toHaveTextContent('Every lead: +12')
    await user.click(within(drawer).getByRole('button', { name: 'Add rule' }))
    await waitFor(() => expect(tables().scoringRules.some((r) => r.name === 'Big spender' && r.points === 12)).toBe(true))
  })

  it('rejects a rule with zero points', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Add rule' }))
    const drawer = await screen.findByRole('dialog')
    await user.type(within(drawer).getByLabelText(/Name/), 'No points')
    const points = within(drawer).getByLabelText(/Points/)
    await user.clear(points)
    await user.type(points, '0')
    await user.click(within(drawer).getByRole('button', { name: 'Add rule' }))
    expect(await within(drawer).findByText('Points cannot be 0.')).toBeInTheDocument()
  })

  it('previews the hot, warm and cold split and validates thresholds', async () => {
    const user = userEvent.setup()
    renderPage()
    const hot = await screen.findByLabelText('Hot at or above')
    expect(await screen.findByText(/^Hot: \d+$/)).toBeInTheDocument()
    await user.clear(hot)
    await user.type(hot, '30')
    expect(await screen.findByText('Warm must be lower than hot, both between 0 and 100.')).toBeInTheDocument()
    await waitFor(() => expect(savedState?.dirty).toBe(true))
  })

  it('saves decay settings through the sticky save bar', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('switch', { name: 'Lower the score after inactivity' }))
    await waitFor(() => expect(savedState?.dirty).toBe(true))
    savedState?.save()
    await waitFor(() => expect(tables().tenantSettings.find((t) => t.tenantId === ACME_TENANT_ID)?.scoringDecay?.enabled).toBe(true))
  })

  it('tests a lead and shows the exact breakdown', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('combobox', { name: 'Lead to score' }))
    await user.click((await screen.findAllByRole('option'))[0])
    expect(await screen.findByText(/^Total \d+$/)).toBeInTheDocument()
  })

  it('recalculates all leads with progress and a summary', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Recalculate all leads' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Recalculate' }))
    expect(await screen.findByText(/changed category\./, {}, { timeout: 10000 })).toBeInTheDocument()
    expect(screen.getByText(/leads checked/)).toBeInTheDocument()
  })

  it('keeps salespeople out', async () => {
    signIn(USERS.ananya, 'salesperson')
    renderPage()
    expect((await screen.findAllByText(/access/i)).length).toBeGreaterThan(0)
    expect(screen.queryByText('Scoring rules')).not.toBeInTheDocument()
  })
})
