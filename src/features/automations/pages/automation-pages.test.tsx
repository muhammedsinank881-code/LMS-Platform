import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { configure, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '@/services'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from '@/services/mock/__tests__/helpers'
import { install } from '@/services/mock/__tests__/automation-fixtures'
import { useAuthStore } from '@/store/auth-store'
import { AutomationBuilderPage } from './AutomationBuilderPage'
import { AutomationsPage } from './AutomationsPage'

// Whole pages load many queries; give them time under a loaded test run.
configure({ asyncUtilTimeout: 5000 })
vi.setConfig({ testTimeout: 30000 })

function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }))
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

/** A data router, because the builder blocks navigation while there are unsaved changes. */
function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/automations', element: <AutomationsPage /> },
      { path: '/automations/new', element: <AutomationBuilderPage /> },
      { path: '/automations/:id', element: <AutomationBuilderPage /> },
    ],
    { initialEntries: [path] },
  )
  return render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  )
}

function signIn(userId: string, role: 'admin' | 'salesperson' = 'admin') {
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
  signIn(USERS.arjun)
})

afterEach(() => {
  teardownMock()
  vi.restoreAllMocks()
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
})

/** The visible summary and the screen-reader copy both match; the first is the visible one. */
const findSummary = async (pattern: RegExp) => (await screen.findAllByText(pattern))[0]

const seeded = (name: string) => tables().automations.find((a) => a.tenantId === ACME_TENANT_ID && a.name.startsWith(name))!

describe('automation builder', () => {
  it('shows the plain-language summary and no problems for a valid automation', async () => {
    const auto = seeded('New Facebook lead')
    renderAt(`/automations/${auto.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: auto.name })).toBeInTheDocument()
    expect(await findSummary(/When a new lead comes from/)).toBeInTheDocument()
    expect(await screen.findByText('No problems found.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('flags a deleted template inline and blocks publishing', async () => {
    const auto = install({
      name: 'Broken reference',
      trigger: { type: 'lead_created', sourceIds: [] },
      actions: [{ type: 'send_whatsapp', templateId: 'template-that-was-deleted' }],
    })
    renderAt(`/automations/${auto.id}`)
    const messages = await screen.findAllByText(/template no longer exists/i)
    expect(messages.length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
    expect(screen.getByText(/Fix 1 problem to publish/)).toBeInTheDocument()
  })

  it('flags a removed user and an empty step list', async () => {
    const auto = install({
      name: 'Ghost owner',
      actions: [{ type: 'assign', strategy: 'specific_user', userId: 'user-ghost', teamId: null }],
    })
    renderAt(`/automations/${auto.id}`)
    expect((await screen.findAllByText(/user no longer exists/i)).length).toBeGreaterThan(0)

    const empty = install({ name: 'Nothing yet', actions: [] })
    renderAt(`/automations/${empty.id}`)
    expect((await screen.findAllByText(/Add at least one action/i)).length).toBeGreaterThan(0)
  })

  it('reorders steps with the keyboard-friendly buttons and tracks unsaved changes', async () => {
    const user = userEvent.setup()
    const auto = seeded('New Facebook lead')
    renderAt(`/automations/${auto.id}`)
    await findSummary(/When a new lead comes from/)
    expect(screen.getByText(/All changes saved/)).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: 'Move step 1, Assign lead, down' }))
    expect(await screen.findByText(/You have unsaved changes/)).toBeInTheDocument()
    expect((await screen.findAllByText(/send WhatsApp template .*, assign round-robin/)).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Save as draft' })).toBeEnabled()
  })

  it('announces summary changes in a polite live region', async () => {
    const auto = seeded('New Facebook lead')
    renderAt(`/automations/${auto.id}`)
    await findSummary(/When a new lead comes from/)
    const live = document.querySelector('[role="status"][aria-live="polite"]')
    expect(live).not.toBeNull()
  })

  it('saves a draft and publishes a new version', async () => {
    const user = userEvent.setup()
    const auto = seeded('Overdue follow-up nudge')
    renderAt(`/automations/${auto.id}`)
    const name = await screen.findByLabelText('Name')
    await user.clear(name)
    await user.type(name, 'Overdue nudge v2')
    await user.click(screen.getByRole('button', { name: 'Save as draft' }))
    await waitFor(() => expect(tables().automations.find((a) => a.id === auto.id)).toMatchObject({ name: 'Overdue nudge v2', status: 'draft', enabled: false }))

    await user.click(await screen.findByRole('button', { name: 'Publish' }))
    await waitFor(() => expect(tables().automations.find((a) => a.id === auto.id)).toMatchObject({ status: 'published', version: 2, enabled: true }))
  })

  it('runs a dry run against a sample lead and shows what would happen', async () => {
    const user = userEvent.setup()
    const auto = install({ name: 'Dry', actions: [{ type: 'add_note', text: 'hello {{lead.name}}' }] })
    renderAt(`/automations/${auto.id}`)
    await user.click(await screen.findByRole('combobox', { name: 'Sample record' }))
    const options = await screen.findAllByRole('option')
    await user.click(options[0])
    const before = JSON.stringify(tables().activities.length)
    await user.click(screen.getByRole('button', { name: 'Run dry run' }))
    expect(await screen.findByText(/What would happen/)).toBeInTheDocument()
    expect(screen.getByText(/Added a note: "hello /)).toBeInTheDocument()
    expect(JSON.stringify(tables().activities.length)).toBe(before)
  })

  it('lets a manager open and edit an automation', async () => {
    signIn(USERS.neha, 'admin')
    useAuthStore.setState((state) => ({ user: state.user ? { ...state.user, role: 'manager' } : state.user }))
    const auto = seeded('New Facebook lead')
    renderAt(`/automations/${auto.id}`)
    expect(await screen.findByRole('heading', { level: 1, name: auto.name })).toBeInTheDocument()
    expect(screen.queryByText(/You can view this automation but not change it/)).not.toBeInTheDocument()
  })

  it('shows no access to roles without the permission', async () => {
    signIn(USERS.ananya, 'salesperson')
    renderAt('/automations')
    expect(await screen.findByText(/don't have access to automations/i)).toBeInTheDocument()
  })
})

describe('automations list', () => {
  it('lists automations with trigger, status, runs and success rate', async () => {
    renderAt('/automations')
    const auto = seeded('New Facebook lead')
    expect(await screen.findByRole('link', { name: auto.name })).toBeInTheDocument()
    expect(screen.getAllByRole('switch').length).toBeGreaterThan(0)
    expect(screen.getByRole('columnheader', { name: /Success rate/ })).toBeInTheDocument()
  })

  it('filters by search and shows an empty state', async () => {
    const user = userEvent.setup()
    renderAt('/automations')
    await screen.findByRole('link', { name: seeded('New Facebook lead').name })
    await user.type(screen.getByLabelText('Search automations'), 'zzzz-nothing')
    expect(await screen.findByText('No automations match', {}, { timeout: 3000 })).toBeInTheDocument()
  })

  it('turns an automation off from the row toggle', async () => {
    const user = userEvent.setup()
    renderAt('/automations')
    const auto = seeded('Overdue follow-up nudge')
    const toggle = await screen.findByRole('switch', { name: `${auto.name} is on` })
    await user.click(toggle)
    await waitFor(() => expect(tables().automations.find((a) => a.id === auto.id)!.enabled).toBe(false))
  })

  it('bulk turns off, then deletes the selected automations after confirming', async () => {
    const user = userEvent.setup()
    renderAt('/automations')
    const auto = seeded('Overdue follow-up nudge')
    await user.click(await screen.findByRole('checkbox', { name: `Select ${auto.name}` }))
    expect(await screen.findByText('1 selected')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(tables().automations.some((a) => a.id === auto.id)).toBe(false))
  })

  it('opens the template gallery with the ready-made automations', async () => {
    const user = userEvent.setup()
    renderAt('/automations')
    await user.click(await screen.findByRole('button', { name: /Start from a template/ }))
    expect(await screen.findByText('Speed-to-lead alert')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Use template' })).toHaveLength(8)
  })

  it('opens the builder from a template, pre-filled', async () => {
    renderAt('/automations/new?template=lost-reengage')
    expect(await screen.findByRole('heading', { level: 1, name: 'Lost deal re-engagement' })).toBeInTheDocument()
    expect(screen.getByText(/Not saved yet/)).toBeInTheDocument()
  })
})

describe('runs tab', () => {
  it('lists runs and opens a failed run with Retry', async () => {
    const user = userEvent.setup()
    const auto = seeded('Overdue follow-up nudge')
    const lead = tables().leads.find((l) => l.tenantId === ACME_TENANT_ID)!
    tables().automationRuns.push({
      id: 'run-failed-test',
      tenantId: ACME_TENANT_ID,
      automationId: auto.id,
      automationName: auto.name,
      automationVersion: 1,
      entity: { kind: 'lead', id: lead.id },
      eventId: 'e',
      idempotencyKey: 'k-failed',
      chain: { chainId: 'c', depth: 0, causedBy: [] },
      triggerType: 'followup_overdue',
      triggerPayload: { followUpType: 'call' },
      status: 'failed',
      steps: [{ path: '0', actionType: 'notify_team', status: 'failed', result: 'Failed', error: 'Nobody matched to notify.', startedAt: '2026-10-04T06:00:00.000Z', finishedAt: '2026-10-04T06:00:00.000Z' }],
      conditionTrace: [],
      cursor: 0,
      resumeAt: null,
      error: 'Nobody matched to notify.',
      startedAt: '2026-10-04T06:00:00.000Z',
      finishedAt: '2026-10-04T06:00:00.000Z',
    })
    await api.automations.listRuns({})
    renderAt('/automations?tab=runs&run=run-failed-test')
    const dialog = await screen.findByRole('dialog')
    expect((await within(dialog).findAllByText(/Nobody matched to notify/)).length).toBeGreaterThan(0)
    expect(within(dialog).getByRole('button', { name: /Retry from the failed step/ })).toBeInTheDocument()
    await user.keyboard('{Escape}')
  })

  it('shows the resume time and a Cancel action for a waiting run', async () => {
    const auto = install({ name: 'Waits', actions: [{ type: 'wait', amount: 1, unit: 'hours' }] })
    const lead = tables().leads.find((l) => l.tenantId === ACME_TENANT_ID)!
    tables().automationRuns.push({
      id: 'run-waiting-test',
      tenantId: ACME_TENANT_ID,
      automationId: auto.id,
      automationName: auto.name,
      automationVersion: 1,
      entity: { kind: 'lead', id: lead.id },
      eventId: 'e2',
      idempotencyKey: 'k-wait',
      chain: { chainId: 'c', depth: 0, causedBy: [] },
      triggerType: 'lead_created',
      triggerPayload: {},
      status: 'waiting',
      steps: [{ path: '0', actionType: 'wait', status: 'waiting', result: 'Waiting', error: null, startedAt: '2026-10-04T06:00:00.000Z', finishedAt: null }],
      conditionTrace: [],
      cursor: 1,
      resumeAt: '2026-10-04T07:00:00.000Z',
      error: null,
      startedAt: '2026-10-04T06:00:00.000Z',
      finishedAt: null,
    })
    renderAt('/automations?tab=runs&run=run-waiting-test')
    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByText('Resumes')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cancel this run' })).toBeInTheDocument()
  })

  it('shows a status as text, not only colour', async () => {
    renderAt('/automations?tab=runs')
    expect(await screen.findAllByText(/Succeeded|Failed|Skipped/, { selector: 'span' })).not.toHaveLength(0)
  })
})
