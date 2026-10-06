import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render'
import { CompleteFollowUpDialog } from './CompleteFollowUpDialog'

describe('CompleteFollowUpDialog', () => {
  it('records the outcome and offers the next follow-up', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    renderWithProviders(<CompleteFollowUpDialog open onOpenChange={() => undefined} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: 'No answer' }))
    await user.click(screen.getByRole('switch', { name: 'Schedule next follow-up' }))
    await user.click(screen.getByRole('button', { name: 'Mark done' }))

    expect(onConfirm).toHaveBeenCalledWith({
      outcome: 'no_answer',
      note: '',
      scheduleNext: true,
    })
  })
})
