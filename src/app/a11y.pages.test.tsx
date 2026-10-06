import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import axe from 'axe-core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { FollowUpsPage } from '@/features/followups/pages/FollowUpsPage'
import { LeadDetailPage } from '@/features/leads/pages/LeadDetailPage'
import { LeadsPage } from '@/features/leads/pages/LeadsPage'
import { PipelinePage } from '@/features/pipeline/pages/PipelinePage'
import { SaveBarContext, type SaveState } from '@/features/settings/components/use-save-bar'
import { ProfileSettingsPage } from '@/features/settings/pages/ProfileSettingsPage'
import { ScoringSettingsPage } from '@/features/settings/pages/ScoringSettingsPage'
import { AutomationsPage } from '@/features/automations/pages/AutomationsPage'
import { api } from '@/services'
import { ACME_TENANT_ID, USERS, actAs, setupMock, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'

function Harness({ children, path, pattern }: { children: ReactNode; path: string; pattern: string }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  const [, setSave] = useState<SaveState | null>(null)
  return (
    <QueryClientProvider client={client}>
      <SaveBarContext.Provider value={{ setSave }}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={pattern} element={children} />
          </Routes>
        </MemoryRouter>
      </SaveBarContext.Provider>
    </QueryClientProvider>
  )
}

async function expectClean(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      // jsdom does not compute Tailwind colors, so contrast is checked on the tokens instead.
      'color-contrast': { enabled: false },
    },
  })
  const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical')
  expect(
    blocking.map((item) => ({
      id: item.id,
      nodes: item.nodes.slice(0, 3).map((node) => node.html),
    })),
  ).toEqual([])
}

beforeEach(() => {
  setupMock()
  actAs(USERS.arjun)
  useAuthStore.setState({
    user: {
      id: USERS.arjun,
      tenantId: ACME_TENANT_ID,
      name: 'Arjun',
      email: 'arjun@example.in',
      role: 'admin',
      teamId: null,
      avatarUrl: null,
    },
    tenant: {
      id: ACME_TENANT_ID,
      name: 'Acme',
      slug: 'acme',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    tenants: [],
    token: 'test',
    intentionalSignOut: false,
  })
})

afterEach(() => {
  teardownMock()
  vi.restoreAllMocks()
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
})

describe('page accessibility', () => {
  it('login', async () => {
    const view = render(<Harness path="/login" pattern="/login"><LoginPage /></Harness>)
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    await expectClean(view.container)
  })

  it('dashboard', async () => {
    const view = render(<Harness path="/dashboard" pattern="/dashboard"><DashboardPage /></Harness>)
    expect(await screen.findByText('Total leads', {}, { timeout: 4000 })).toBeInTheDocument()
    await expectClean(view.container)
  })

  it('leads list', async () => {
    const view = render(<Harness path="/leads" pattern="/leads"><LeadsPage /></Harness>)
    expect(await screen.findByRole('heading', { name: 'Leads' }, { timeout: 4000 })).toBeInTheDocument()
    await expectClean(view.container)
  })

  it('lead detail', async () => {
    const page = await api.leads.list({ pageSize: 1 })
    const id = page.items[0]?.id
    expect(id).toBeTruthy()
    const view = render(
      <Harness path={`/leads/${id}`} pattern="/leads/:id">
        <LeadDetailPage />
      </Harness>,
    )
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 4000 })).toBeInTheDocument()
    await expectClean(view.container)
  })

  it('follow-ups', async () => {
    const view = render(<Harness path="/follow-ups" pattern="/follow-ups"><FollowUpsPage /></Harness>)
    expect(await screen.findByRole('heading', { name: 'Follow-ups' }, { timeout: 4000 })).toBeInTheDocument()
    await expectClean(view.container)
  })

  it('pipeline', async () => {
    const view = render(<Harness path="/pipeline" pattern="/pipeline"><PipelinePage /></Harness>)
    expect(await screen.findByRole('heading', { name: 'Pipeline' }, { timeout: 4000 })).toBeInTheDocument()
    await expectClean(view.container)
  })

  it('settings profile', async () => {
    const view = render(<Harness path="/settings/profile" pattern="/settings/profile"><ProfileSettingsPage /></Harness>)
    expect(await screen.findByRole('heading', { name: 'Profile' }, { timeout: 4000 })).toBeInTheDocument()
    await expectClean(view.container)
  })

  it('automations list', async () => {
    const view = render(<Harness path="/automations" pattern="/automations"><AutomationsPage /></Harness>)
    expect(await screen.findByRole('heading', { name: 'Automations' }, { timeout: 4000 })).toBeInTheDocument()
    await screen.findAllByRole('switch', {}, { timeout: 4000 })
    await expectClean(view.container)
  })

  it('settings scoring', async () => {
    const view = render(<Harness path="/settings/scoring" pattern="/settings/scoring"><ScoringSettingsPage /></Harness>)
    expect(await screen.findByRole('heading', { name: 'Scoring rules' }, { timeout: 4000 })).toBeInTheDocument()
    await screen.findByLabelText('Hot at or above', {}, { timeout: 4000 })
    await expectClean(view.container)
  })
})
