import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ACME_TENANT_ID, actAs, setupMock, teardownMock, USERS } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import { StudentProfilePage } from './StudentProfilePage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/student/profile']}>
        <StudentProfilePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  setupMock()
  actAs('user-student')
  useAuthStore.setState({
    user: {
      id: 'user-student',
      tenantId: ACME_TENANT_ID,
      name: 'Sinan',
      email: 'student@leadflow.test',
      role: 'student',
      teamId: null,
      avatarUrl: null,
    },
    tenant: {
      id: ACME_TENANT_ID,
      name: 'Acme Digital',
      slug: 'acme',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    tenants: [],
    token: 'student-test-token',
    intentionalSignOut: false,
  })
})

afterEach(() => {
  teardownMock()
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
})

describe('StudentProfilePage', () => {
  it('shows protected account fields read-only and saves the student’s own career links', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Student Profile' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sinan' })).toBeInTheDocument()
    expect(screen.getAllByText('student@leadflow.test')).toHaveLength(2)
    expect(screen.getAllByText('Need to update your official information?').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Add links' }))
    await user.type(screen.getByLabelText('GitHub profile URL'), 'https://github.com/sinan')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByRole('link', { name: /https:\/\/github\.com\/sinan/ })).toHaveAttribute(
      'href',
      'https://github.com/sinan',
    )
  })

  it('does not expose the student profile to another role', () => {
    actAs(USERS.arjun)
    useAuthStore.setState((state) => ({
      ...state,
      user: state.user ? { ...state.user, id: USERS.arjun, role: 'admin' } : null,
    }))
    renderPage()

    expect(screen.getByText("You don't have access to this page")).toBeInTheDocument()
  })

  it('offers a separate flow to add an external certificate', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByRole('heading', { name: 'Student Profile' })
    await user.click(screen.getByRole('button', { name: 'Add certificate' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('This record is separate from certificates issued through LeadFlow LMS.')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Certificate title/), 'Web Accessibility')
    await user.type(screen.getByLabelText(/Issuing organization/), 'Example Institute')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Add certificate' }))
    expect(await screen.findByText('Web Accessibility')).toBeInTheDocument()
  })
})
