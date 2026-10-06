import { describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render'
import type { LostReason } from '@/types'
import { LostReasonDialog } from './LostReasonDialog'

const reasons: LostReason[] = [
  { id: 'price', tenantId: 't', name: 'Price too high', isActive: true, order: 1 },
  { id: 'other', tenantId: 't', name: 'Other', isActive: true, order: 2 },
]

describe('LostReasonDialog', () => {
  it('requires a reason and reverts when cancelled', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    renderWithProviders(
      <LostReasonDialog open reasons={reasons} onOpenChange={() => undefined} onConfirm={onConfirm} onCancel={onCancel} />,
    )

    const submit = screen.getByRole('button', { name: 'Mark lost' })
    expect(submit).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('requires free text for Other and submits the chosen reason', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderWithProviders(
      <LostReasonDialog open reasons={reasons} onOpenChange={() => undefined} onConfirm={onConfirm} />,
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Other' }))
    const submit = screen.getByRole('button', { name: 'Mark lost' })
    expect(submit).toBeDisabled()
    fireEvent.change(screen.getByLabelText(/Describe the reason/), {
      target: { value: 'Went with a local vendor' },
    })
    await user.click(submit)
    expect(onConfirm).toHaveBeenCalledWith({
      lostReasonId: 'other',
      note: 'Went with a local vendor',
    })
  })
})
