import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ACME_TENANT_ID, USERS, actAs, setupMock, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import { PipelinePage } from './PipelinePage'

function installMatchMedia() {
  if (typeof window.matchMedia === 'function') return
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/pipeline']}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return render(<PipelinePage />, { wrapper })
}

beforeEach(() => {
  installMatchMedia()
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
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
})

describe('PipelinePage', () => {
  it('opens the lost-reason dialog and restores the card when cancelled', async () => {
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never })
    renderPage()
    const column = await screen.findByRole('region', { name: 'New Lead' }, { timeout: 8000 })
    const [action] = await within(column).findAllByRole('button', { name: /Actions for / }, { timeout: 4000 })
    if (!action) throw new Error('New Lead has no cards')
    const name = action.getAttribute('aria-label') ?? ''

    await user.click(action)
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Change stage' }))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Lost' }))

    expect(await screen.findByRole('heading', { name: 'Why was this lead lost?' })).toBeInTheDocument()
    expect(within(column).queryByRole('button', { name })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByRole('heading', { name: 'Why was this lead lost?' })).not.toBeInTheDocument()
    expect(within(column).getByRole('button', { name })).toBeInTheDocument()
  }, 60000)
})
