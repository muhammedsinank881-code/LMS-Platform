import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ACME_TENANT_ID, actAs, setupMock, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import { StudentJobsPage } from './StudentJobsPage'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <StudentJobsPage />
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
    tenant: null,
    tenants: [],
    token: 'student-test-token',
    intentionalSignOut: false,
  })
})

afterEach(() => {
  teardownMock()
  useAuthStore.setState({
    user: null,
    tenant: null,
    tenants: [],
    token: null,
    intentionalSignOut: false,
  })
})

describe('StudentJobsPage', () => {
  it('shows explicitly labelled LMS demo jobs and the student application count', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Junior Software Developer' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'React.js Developer' })).toBeInTheDocument()
    expect(screen.getAllByText('LMS job portal (demo)').length).toBeGreaterThan(0)
    expect(screen.getByText('Jobs you applied to')).toBeInTheDocument()
    expect(screen.getByRole('status', { name: '0 jobs applied to' })).toBeInTheDocument()
    expect(screen.queryByText('No job listings are available')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View profile CV status' })).toHaveAttribute(
      'href',
      '/student/profile',
    )
  })

  it('combines title, arrangement, employment type, location and salary filters', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'React.js Developer' })

    await user.type(screen.getByRole('textbox', { name: /Search by job name/ }), 'React.js')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Work arrangement' }), 'hybrid')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Employment type' }), 'full-time')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Location' }), 'Bengaluru, India')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Salary range' }), '6-plus')

    expect(screen.getByRole('heading', { name: 'React.js Developer' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Junior Software Developer' })).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 7 demo jobs')).toBeInTheDocument()
  })

  it('records a demo application once and updates the student-specific count', async () => {
    const user = userEvent.setup()
    renderPage()
    const jobHeading = await screen.findByRole('heading', { name: 'Junior Software Developer' })
    const jobCard = jobHeading.closest('[class*="rounded-md border"]')
    expect(jobCard).not.toBeNull()
    const card = within(jobCard as HTMLElement)
    await user.click(card.getByRole('button', { name: 'Record demo application' }))

    expect(await card.findByText('Applied')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('status', { name: '1 job applied to' })).toBeInTheDocument()
    })
    expect(screen.getByText('Application saved in this demo session')).toBeInTheDocument()
  })

  it('clears search and filters', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: 'React.js Developer' })
    await user.selectOptions(screen.getByRole('combobox', { name: 'Work arrangement' }), 'remote')
    expect(screen.queryByRole('heading', { name: 'React.js Developer' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByRole('heading', { name: 'React.js Developer' })).toBeInTheDocument()
  })

  it('does not expose the student job page to other roles', () => {
    useAuthStore.setState((state) => ({
      ...state,
      user: state.user ? { ...state.user, role: 'admin' } : null,
    }))

    renderPage()

    expect(screen.getByText("You don't have access to this page")).toBeInTheDocument()
  })
})
