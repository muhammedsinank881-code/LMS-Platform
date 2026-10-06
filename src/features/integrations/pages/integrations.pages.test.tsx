import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/services/api'
import { USERS, setupMock, tables, teardownMock } from '@/services/mock/__tests__/helpers'
import { Harness } from '@/test/capture-harness'
import { signIn, signOut } from '@/test/capture-session'
import { IntegrationsPage } from './IntegrationsPage'

beforeEach(() => {
  setupMock()
  signIn(USERS.arjun, 'admin')
})
afterEach(() => {
  teardownMock()
  signOut()
})

const renderPage = () => render(<Harness><IntegrationsPage /></Harness>)
const cardOf = async (name: string) => (await screen.findByRole('heading', { name })).closest('li') as HTMLElement

describe('integrations page', () => {
  it('shows a card per provider with status, and a banner for broken connections', async () => {
    renderPage()
    expect(await cardOf('WhatsApp Business')).toHaveTextContent('Connected')
    expect(await cardOf('Google Ads')).toHaveTextContent('Error')
    expect(await cardOf('Instagram Lead Ads')).toHaveTextContent('Expired')
    expect(await cardOf('LinkedIn Lead Gen')).toHaveTextContent('Not connected')
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(8)
    const banner = await screen.findByRole('alert')
    expect(banner).toHaveTextContent('2 integrations need attention')
    expect(banner).toHaveTextContent(/Reconnect the account/)
  })

  it('connects a provider through the stepper drawer', async () => {
    await api.integrations.disconnect('website')
    const user = userEvent.setup()
    renderPage()
    await user.click(within(await cardOf('Website')).getByRole('button', { name: 'Connect Website' }))
    const drawer = await screen.findByRole('dialog', { name: /Connect Website/ })
    expect(await within(drawer).findByRole('navigation', { name: 'Connection steps' })).toBeInTheDocument()
    await waitFor(() => expect(tables().integrations.find((row) => row.id === 'int-website')?.status).toBe('connecting'))

    const next = within(drawer).getByRole('button', { name: 'Next' })
    expect(next).toBeDisabled()
    await user.type(within(drawer).getByLabelText(/Website domain/), 'https://shop.example.com/about')
    await user.click(next)
    expect((await within(drawer).findByLabelText('Tracking snippet') as HTMLTextAreaElement).value).toContain('track.js')
    await user.click(within(drawer).getByRole('button', { name: /connect/i }))

    await waitFor(() => expect(tables().integrations.find((row) => row.id === 'int-website')).toMatchObject({ status: 'connected', accountLabel: 'shop.example.com' }))
    expect(tables().integrationEvents.some((event) => event.integrationId === 'int-website' && event.type === 'connected')).toBe(true)
  })

  it('releases a half-finished connection when the drawer is cancelled', async () => {
    await api.integrations.disconnect('website')
    const user = userEvent.setup()
    renderPage()
    await user.click(within(await cardOf('Website')).getByRole('button', { name: 'Connect Website' }))
    const drawer = await screen.findByRole('dialog', { name: /Connect Website/ })
    await waitFor(() => expect(tables().integrations.find((row) => row.id === 'int-website')?.status).toBe('connecting'))
    await user.click(within(drawer).getByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(tables().integrations.find((row) => row.id === 'int-website')?.status).toBe('not_connected'))
  })

  it('manages a connection: health, activity log, reconnect after an error', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(within(await cardOf('Google Ads')).getByRole('button', { name: 'Manage Google Ads' }))
    const drawer = await screen.findByRole('dialog', { name: /Google Ads/ })
    expect(within(drawer).getByText('Needs attention')).toBeInTheDocument()
    expect(within(drawer).getByText(/Suggested fix:/)).toBeInTheDocument()

    await user.click(within(drawer).getByRole('tab', { name: 'Activity' }))
    expect(await within(drawer).findByRole('list', { name: 'Recent activity' })).toHaveTextContent('Google Ads rejected the request.')

    await user.click(within(drawer).getByRole('tab', { name: 'Overview' }))
    await user.click(within(drawer).getAllByRole('button', { name: 'Reconnect' })[0])
    const oauth = await screen.findByRole('group', { name: /Google Ads sign-in \(simulated\)/ })
    await user.click(within(oauth).getByRole('button', { name: 'Allow access' }))
    await waitFor(() => expect(tables().integrations.find((row) => row.id === 'int-google_ads')?.status).toBe('connected'), { timeout: 5000 })
  })

  it('warns what stops working before disconnecting, then disconnects', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(within(await cardOf('WhatsApp Business')).getByRole('button', { name: 'Manage WhatsApp Business' }))
    const drawer = await screen.findByRole('dialog', { name: /WhatsApp Business/ })
    await user.click(within(drawer).getByRole('button', { name: 'Disconnect' }))
    const confirm = await screen.findByRole('dialog', { name: 'Disconnect WhatsApp Business?' })
    expect(confirm).toHaveTextContent(/can no longer send or receive WhatsApp messages/)
    await user.click(within(confirm).getByRole('button', { name: 'Disconnect' }))
    await waitFor(() => expect(tables().integrations.find((row) => row.id === 'int-whatsapp')).toMatchObject({ status: 'not_connected', config: null }))
  })

  it('masks the WhatsApp token in the settings panel', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(within(await cardOf('WhatsApp Business')).getByRole('button', { name: 'Manage WhatsApp Business' }))
    const drawer = await screen.findByRole('dialog', { name: /WhatsApp Business/ })
    await user.click(within(drawer).getByRole('tab', { name: 'Settings' }))
    expect(await within(drawer).findByText('Access token ending in k 2 9 x')).toBeInTheDocument()
    expect(within(drawer).getByText('••••k29x')).toBeInTheDocument()
  })

  it('shows No access for a role without the Integrations section', async () => {
    signIn(USERS.neha, 'manager')
    renderPage()
    expect(await screen.findByText(/don't have access/i)).toBeInTheDocument()
  })
})
