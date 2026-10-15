import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ACME_TENANT_ID, actAs, setupMock, teardownMock } from '@/services/mock/__tests__/helpers'
import type { Role } from '@/types'
import { useAuthStore } from '@/store/auth-store'
import { useUiStore } from '@/store/ui-store'
import { CommandPalette } from '@/components/common/CommandPalette'
import { Topbar } from './Topbar'

function setCurrentUser(role: Role) {
  actAs('user-arjun', { role })
  useAuthStore.setState({
    user: {
      id: 'user-arjun',
      tenantId: ACME_TENANT_ID,
      name: 'Test User',
      email: 'test@example.com',
      role,
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
    token: 'test-token',
    intentionalSignOut: false,
  })
}

function CurrentPath() {
  const location = useLocation()
  return <output aria-label="Current path">{location.pathname}</output>
}

function renderWithProviders(component: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        {component}
        <CurrentPath />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  setupMock()
})

afterEach(() => {
  teardownMock()
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
  useUiStore.setState({ commandPaletteOpen: false })
})

describe('student navbar', () => {
  it('hides Add for students while retaining it for administrators', async () => {
    setCurrentUser('student')
    renderWithProviders(<Topbar onOpenNav={() => {}} />)

    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument()

    setCurrentUser('admin')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })
  })

  it('shows only student sidebar destinations and navigates to the selected student route', async () => {
    setCurrentUser('student')
    useUiStore.setState({ commandPaletteOpen: true })
    const user = userEvent.setup()
    renderWithProviders(<CommandPalette />)

    expect(screen.getByRole('option', { name: 'My Courses' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Leads' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'My Courses' }))
    expect(screen.getByLabelText('Current path')).toHaveTextContent('/student/courses')
  })

  it('keeps administrator search destinations unchanged', async () => {
    setCurrentUser('admin')
    useUiStore.setState({ commandPaletteOpen: true })
    const user = userEvent.setup()
    renderWithProviders(<CommandPalette />)

    expect(screen.getByRole('option', { name: 'Leads' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'My Courses' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: 'Leads' }))
    expect(screen.getByLabelText('Current path')).toHaveTextContent('/leads')
  })
})
