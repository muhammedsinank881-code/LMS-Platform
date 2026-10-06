import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { api } from '@/services'
import { ApiError } from '@/services/api/errors'
import { ACME_TENANT_ID, USERS, actAs, setupMock, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import { DashboardPage } from './DashboardPage'

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/dashboard']}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return render(<DashboardPage />, { wrapper })
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

describe('DashboardPage', () => {
  it('keeps the other widgets when one query fails', async () => {
    vi.spyOn(api.reports, 'leadsOverTime').mockRejectedValue(new ApiError('unknown', 'Simulated network error.'))
    renderPage()
    expect(await screen.findByText('Total leads', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(await screen.findByText('Could not load this report')).toBeInTheDocument()
  })

  it('uses the salesperson layout for own scope', async () => {
    useAuthStore.setState({ user: { ...useAuthStore.getState().user!, role: 'salesperson' } })
    actAs(USERS.ananya, { role: 'salesperson' })
    renderPage()
    expect(await screen.findByText('My leads', {}, { timeout: 4000 })).toBeInTheDocument()
    expect(screen.queryByText('Team leaderboard')).not.toBeInTheDocument()
  })
})
