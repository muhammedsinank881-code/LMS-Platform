import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryKeys } from '@/lib/queryKeys'
import { ApiError } from '@/services/api/errors'
import { api } from '@/services'
import { ACME_TENANT_ID, USERS, actAs, setupMock, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import type { FollowUp, Paginated } from '@/types'
import { useRescheduleFollowUp } from './use-followup-mutations'

beforeEach(() => {
  setupMock()
  actAs(USERS.arjun)
  useAuthStore.setState({
    user: {
      id: USERS.arjun,
      tenantId: ACME_TENANT_ID,
      name: 'Arjun',
      email: 'arjun@example.in',
      role: 'admin',
      teamId: null,
      avatarUrl: null,
    },
    tenant: {
      id: ACME_TENANT_ID,
      name: 'Acme',
      slug: 'acme',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    tenants: [],
    token: 'test',
    intentionalSignOut: false,
  })
})

afterEach(() => {
  teardownMock()
  useAuthStore.setState({ user: null, tenant: null, tenants: [], token: null, intentionalSignOut: false })
  vi.restoreAllMocks()
})

describe('useRescheduleFollowUp', () => {
  it('moves the due date immediately and rolls it back when the save fails', async () => {
    const page = await api.followUps.list({ pageSize: 1 })
    const followUp = page.items[0]
    const keys = createQueryKeys({ tenantId: ACME_TENANT_ID, userId: USERS.arjun, role: 'admin' })
    const listKey = keys.followUps.list({ pageSize: 1 })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const cached: Paginated<FollowUp> = { ...page, items: [followUp] }
    client.setQueryData(listKey, cached)
    const nextDue = '2026-12-01T10:00:00.000Z'

    vi.spyOn(api.followUps, 'reschedule').mockImplementation(async () => {
      const during = client.getQueryData<Paginated<FollowUp>>(listKey)
      expect(during?.items[0]?.dueAt).toBe(nextDue)
      throw new ApiError('unknown', 'Simulated failure')
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useRescheduleFollowUp(), { wrapper })
    result.current.mutate({ id: followUp.id, input: { dueAt: nextDue } })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData<Paginated<FollowUp>>(listKey)?.items[0]?.dueAt).toBe(followUp.dueAt)
  })
})
