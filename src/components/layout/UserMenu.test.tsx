import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { ACME_TENANT_ID, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import { UserMenu } from './UserMenu'
import { STUDENT_NAV_ITEMS } from './student-nav-config'

function renderMenu() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function setCurrentUser(role: 'admin' | 'student') {
  useAuthStore.setState({
    user: {
      id: `${role}-user`,
      tenantId: ACME_TENANT_ID,
      name: 'Test User',
      email: 'test@example.com',
      role,
      teamId: null,
      avatarUrl: null,
    },
    tenant: null,
    tenants: [],
    token: 'test-token',
    intentionalSignOut: false,
  })
}

afterEach(() => {
  teardownMock()
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
})

describe('UserMenu', () => {
  it('shows students their own profile and hides workspace settings', async () => {
    setCurrentUser('student')
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: 'Account menu for Test User' }))

    expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveAttribute('href', '/student/profile')
    expect(screen.queryByRole('menuitem', { name: 'Settings' })).not.toBeInTheDocument()
    expect(STUDENT_NAV_ITEMS.some((item) => item.path === '/student/profile')).toBe(false)
  })

  it('keeps the existing profile and settings entries for administrators', async () => {
    setCurrentUser('admin')
    const user = userEvent.setup()
    renderMenu()

    await user.click(screen.getByRole('button', { name: 'Account menu for Test User' }))

    expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute('href', '/settings')
  })
})
