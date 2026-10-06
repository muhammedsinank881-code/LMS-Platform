import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import type { Conversation } from '@/types'
import { WhatsAppComposer } from './WhatsAppComposer'

const HOUR = 3_600_000

function renderComposer(windowExpiresAt: string | null, status: Conversation['status'] = 'open') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const conversation: Conversation = {
    id: 'conv-1',
    tenantId: 't1',
    leadId: null,
    channel: 'whatsapp',
    assignedTo: null,
    status,
    contactName: 'Unknown',
    contactPhone: '+919876543210',
    contactEmail: null,
    subject: null,
    lastMessageAt: new Date().toISOString(),
    lastMessagePreview: '',
    unreadCount: 0,
    windowExpiresAt,
    emailDraft: null,
    createdAt: new Date().toISOString(),
  }
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <WhatsAppComposer conversation={conversation} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const inHours = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString()

describe('WhatsAppComposer 24-hour window', () => {
  it('is locked when the window has expired: text disabled, reason and "expired … ago" label shown', () => {
    renderComposer(inHours(-3))
    expect(screen.getByLabelText('WhatsApp message')).toBeDisabled()
    expect(screen.getByText(/24-hour window closed/i)).toBeInTheDocument()
    expect(screen.getByText(/expired 3h ago/i)).toBeInTheDocument()
    expect(screen.getByText(/only allows approved templates/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send a template' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Attach file' })).not.toBeInTheDocument()
  })

  it('is locked when there was never an inbound message', () => {
    renderComposer(null)
    expect(screen.getByLabelText('WhatsApp message')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send a template' })).toBeInTheDocument()
  })

  it('allows free text with a countdown while the window is open', () => {
    renderComposer(inHours(4))
    expect(screen.getByLabelText('WhatsApp message')).toBeEnabled()
    expect(screen.getByText(/free-form replies are open/i)).toHaveTextContent(/3h/)
    expect(screen.queryByRole('button', { name: 'Send a template' })).not.toBeInTheDocument()
  })

  it('warns when the window is about to close but still allows text', () => {
    renderComposer(new Date(Date.now() + 25 * 60_000).toISOString())
    expect(screen.getByLabelText('WhatsApp message')).toBeEnabled()
    expect(screen.getByText(/closes in/i)).toHaveTextContent(/only templates can be sent/i)
  })

  it('shows the Enter-to-send setting while writing', () => {
    renderComposer(inHours(4))
    expect(screen.getByText(/Enter to send/i)).toBeInTheDocument()
  })

  it('tells the user to reopen a closed conversation', () => {
    renderComposer(inHours(4), 'closed')
    expect(screen.getByLabelText('WhatsApp message')).toBeDisabled()
    expect(screen.getByPlaceholderText(/reopen it to reply/i)).toBeInTheDocument()
  })
})
