import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render'
import { LeadForm } from './LeadForm'
import type { LeadLookups } from '../../types'

const lookups: LeadLookups = {
  statuses: [{ id: 'status-new', tenantId: 't', name: 'New', color: '#6366f1', order: 1, type: 'open' }],
  sources: [
    {
      id: 'source-manual',
      tenantId: 't',
      key: 'manual',
      name: 'Manual entry',
      icon: 'PenLine',
      isActive: true,
    },
  ],
  campaigns: [],
  tags: [],
  users: [],
}

describe('LeadForm', () => {
  it('requires a name and a contact method', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithProviders(
      <LeadForm
        mode="create"
        lookups={lookups}
        customFields={[]}
        onSubmit={onSubmit}
        onCancel={() => undefined}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Create lead' }))
    expect(await screen.findByText(/Name must be at least 2 characters/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('normalizes an Indian phone number on blur', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <LeadForm
        mode="create"
        lookups={lookups}
        customFields={[]}
        onSubmit={vi.fn()}
        onCancel={() => undefined}
      />,
    )
    const phone = screen.getByLabelText('Phone')
    await user.type(phone, '9876543210')
    await user.tab()
    expect(phone).toHaveValue('+919876543210')
  })
})
