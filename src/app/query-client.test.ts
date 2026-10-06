import { afterEach, describe, expect, it, vi } from 'vitest'
import { toast } from '@/components/ui'
import { ApiError } from '@/services/api/errors'
import { createQueryClient, shouldRetryQuery } from './query-client'

afterEach(() => vi.restoreAllMocks())

describe('shouldRetryQuery', () => {
  it('never retries errors that would fail again', () => {
    for (const code of ['FORBIDDEN', 'NOT_FOUND', 'VALIDATION', 'CONFLICT', 'unauthorized'] as const) {
      expect(shouldRetryQuery(0, new ApiError(code, 'nope')), code).toBe(false)
    }
  })

  it('retries transient failures a bounded number of times', () => {
    const flaky = new Error('Network error')
    expect(shouldRetryQuery(0, flaky)).toBe(true)
    expect(shouldRetryQuery(1, flaky)).toBe(true)
    expect(shouldRetryQuery(2, flaky)).toBe(false)
  })
})

describe('global mutation error toast', () => {
  async function failMutation(meta?: { silent?: boolean; errorTitle?: string }) {
    const client = createQueryClient()
    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () => Promise.reject(new ApiError('FORBIDDEN', 'You cannot do that.')),
        meta,
      })
      .execute(undefined)
      .catch(() => undefined)
  }

  it('shows the error with the mutation’s title', async () => {
    const spy = vi.spyOn(toast, 'error').mockReturnValue('t')
    await failMutation({ errorTitle: 'Could not save' })
    expect(spy).toHaveBeenCalledWith('Could not save', { description: 'You cannot do that.' })
  })

  it('falls back to a generic title', async () => {
    const spy = vi.spyOn(toast, 'error').mockReturnValue('t')
    await failMutation()
    expect(spy).toHaveBeenCalledWith('Action failed', { description: 'You cannot do that.' })
  })

  it('stays quiet for silent mutations', async () => {
    const spy = vi.spyOn(toast, 'error').mockReturnValue('t')
    await failMutation({ silent: true })
    expect(spy).not.toHaveBeenCalled()
  })
})
