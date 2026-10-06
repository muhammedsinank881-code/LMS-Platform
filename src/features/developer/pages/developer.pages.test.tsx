import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { USERS, setupMock, tables, teardownMock } from '@/services/mock/__tests__/helpers'
import { Harness } from '@/test/capture-harness'
import { signIn, signOut, stubClipboard } from '@/test/capture-session'
import { ApiKeysWebhooksPage } from './ApiKeysWebhooksPage'

beforeEach(() => {
  setupMock()
  signIn(USERS.arjun, 'admin')
})
afterEach(() => {
  teardownMock()
  signOut()
})

const renderPage = (route = '/settings/api-keys') =>
  render(
    <Harness route={route}>
      <ApiKeysWebhooksPage />
    </Harness>,
  )

describe('API keys tab', () => {
  it('reveals the key once, then shows only the prefix and last 4', async () => {
    const user = userEvent.setup()
    const clipboard = stubClipboard()
    renderPage()
    await user.click(await screen.findByRole('button', { name: /Create key/ }))
    const dialog = await screen.findByRole('dialog', { name: /Create an API key/ })
    await user.type(within(dialog).getByLabelText(/Name/), 'Zapier')
    await user.click(within(dialog).getByRole('checkbox', { name: /Read Leads/ }))
    await user.click(within(dialog).getByRole('button', { name: 'Create key' }))

    const reveal = await screen.findByRole('dialog', { name: /Your new API key/ })
    expect(within(reveal).getByRole('alert')).toHaveTextContent(/will not be shown again/)
    const secret = (within(reveal).getByLabelText('API key') as HTMLInputElement).value
    expect(secret).toMatch(/^lf_live_[A-Za-z0-9]{32}$/)

    await user.click(within(reveal).getByRole('button', { name: /Copy api key/i }))
    expect(clipboard.written).toEqual([secret])
    expect(await within(reveal).findByRole('status')).toHaveTextContent('Copied to clipboard')

    await user.click(within(reveal).getByRole('button', { name: 'I have saved it' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: /Your new API key/ })).not.toBeInTheDocument())
    expect(document.body.textContent).not.toContain(secret)
    const card = (await screen.findByRole('heading', { name: 'Zapier' })).closest('li') as HTMLElement
    expect(within(card).getByText(`${secret.slice(0, 12)}••••${secret.slice(-4)}`)).toBeInTheDocument()
    expect(within(card).getByText('leads:read')).toBeInTheDocument()
  })

  it('blocks a key with no scopes', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByRole('button', { name: /Create key/ }))
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/Name/), 'No scopes')
    await user.click(within(dialog).getByRole('button', { name: 'Create key' }))
    expect(await within(dialog).findByText('Pick at least one scope')).toBeInTheDocument()
    expect(tables().apiKeys.some((key) => key.name === 'No scopes')).toBe(false)
  })

  it('revokes after confirming', async () => {
    const user = userEvent.setup()
    renderPage()
    const card = (await screen.findByRole('heading', { name: 'CRM data sync' })).closest('li') as HTMLElement
    await user.click(within(card).getByRole('button', { name: /Revoke/ }))
    const confirm = await screen.findByRole('dialog', { name: /Revoke/ })
    await user.click(within(confirm).getByRole('button', { name: 'Revoke key' }))
    await waitFor(() => expect(tables().apiKeys.find((key) => key.name === 'CRM data sync')?.status).toBe('revoked'))
    expect(await within(card).findByText('Revoked')).toBeInTheDocument()
  })

  it('offers a cURL snippet with the key masked', async () => {
    const user = userEvent.setup()
    renderPage()
    const card = (await screen.findByRole('heading', { name: 'CRM data sync' })).closest('li') as HTMLElement
    await user.click(within(card).getByRole('button', { name: /Test with cURL/ }))
    const dialog = await screen.findByRole('dialog', { name: /Test with cURL/ })
    const snippet = (within(dialog).getByLabelText('cURL command') as HTMLTextAreaElement).value
    expect(snippet).toContain('Authorization: Bearer lf_live_9fK2••••')
    expect(snippet).toMatch(/x7Qa/)
  })
})

describe('webhooks tab', () => {
  it('rejects an http URL, then shows the signing secret once on create', async () => {
    const user = userEvent.setup()
    renderPage('/settings/api-keys?tab=webhooks')
    await user.click(await screen.findByRole('button', { name: /Add endpoint/ }))
    const drawer = await screen.findByRole('dialog', { name: /Add a webhook endpoint/ })
    const url = within(drawer).getByLabelText(/Endpoint URL/)
    await user.clear(url)
    await user.type(url, 'http://insecure.example.com')
    await user.click(within(drawer).getByRole('button', { name: 'Add endpoint' }))
    expect(await within(drawer).findByText('The URL must start with https://')).toBeInTheDocument()

    await user.clear(url)
    await user.type(url, 'https://hooks.example.com/new')
    await user.click(within(drawer).getByRole('button', { name: 'Add endpoint' }))
    const reveal = await screen.findByRole('dialog', { name: /Your signing secret/ })
    const secret = (within(reveal).getByLabelText('Signing secret') as HTMLInputElement).value
    expect(secret).toMatch(/^whsec_/)
    await user.click(within(reveal).getByRole('button', { name: 'I have saved it' }))
    await waitFor(() => expect(document.body.textContent).not.toContain(secret))
    expect(await screen.findByText('https://hooks.example.com/new')).toBeInTheDocument()
  })

  it('shows a paused endpoint with its reason, and redacted secrets in the delivery log', async () => {
    const user = userEvent.setup()
    renderPage('/settings/api-keys?tab=webhooks')
    expect(await screen.findByText('Paused')).toBeInTheDocument()
    expect(screen.getByText(/Paused automatically after 5 failed deliveries/)).toBeInTheDocument()
    const card = (await screen.findByRole('heading', { name: 'Warehouse sync' })).closest('li') as HTMLElement
    await user.click(within(card).getByRole('button', { name: /Deliveries/ }))
    const drawer = await screen.findByRole('dialog', { name: /Deliveries/ })
    const rows = await within(drawer).findAllByRole('button', { name: /lead.created/ })
    await user.click(rows[0])
    expect(await within(drawer).findByText('Request payload')).toBeInTheDocument()
    expect(within(drawer).getByText(/X-LeadFlow-Signature: t=\d+,v1=[0-9a-f]{64}/)).toBeInTheDocument()
    expect(within(drawer).getByText(/Secrets such as header values and tokens are redacted/)).toBeInTheDocument()
  })

  it('shows the payload reference and developer docs with the contract note', async () => {
    const user = userEvent.setup()
    renderPage('/settings/api-keys?tab=webhooks')
    expect(await screen.findByRole('heading', { name: 'Payload reference' })).toBeInTheDocument()
    expect(screen.getAllByText('lead.created').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('tab', { name: 'Developer docs' }))
    expect(await screen.findByText(/target contract/)).toBeInTheDocument()
    expect(screen.getAllByText('/api/leads').length).toBeGreaterThan(0)
    expect(screen.getByText('JavaScript (Node)')).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
  })
})

describe('permissions', () => {
  it('shows No access to a role without the API keys section', async () => {
    signIn(USERS.neha, 'manager')
    renderPage()
    expect(await screen.findByText(/don't have access/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Create key/ })).not.toBeInTheDocument()
  })
})
