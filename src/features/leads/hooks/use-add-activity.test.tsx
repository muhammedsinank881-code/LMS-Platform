import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createQueryKeys } from '@/lib/queryKeys'
import { ApiError } from '@/services/api/errors'
import { api } from '@/services'
import { ACME_TENANT_ID, USERS, actAs, setupMock, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import type { Lead, Paginated, Activity } from '@/types'
import type { InfiniteData } from '@tanstack/react-query'
import { useAddLeadActivity } from './use-lead-mutations'

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

describe('useAddLeadActivity', () => {
  it('shows the activity immediately and rolls it back when the save fails', async () => {
    const lead = (await api.leads.list({ pageSize: 1 })).items[0]
    const keys = createQueryKeys({ tenantId: ACME_TENANT_ID, userId: USERS.arjun, role: 'admin' })
    const activityKey = keys.leads.activities(lead.id, { pageSize: 20 })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const empty: InfiniteData<Paginated<Activity>> = {
      pages: [{ items: [], total: 0, page: 1, pageSize: 20, pageCount: 0 }],
      pageParams: [1],
    }
    client.setQueryData(activityKey, empty)
    client.setQueryData(keys.leads.detail(lead.id), lead)

    vi.spyOn(api.leads, 'addActivity').mockImplementation(async () => {
      expect(JSON.stringify(client.getQueryData(activityKey))).toContain('Optimistic note')
      throw new ApiError('unknown', 'Simulated failure')
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useAddLeadActivity(), { wrapper })
    result.current.mutate({ id: lead.id, input: { type: 'note', data: { text: 'Optimistic note' } } })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(JSON.stringify(client.getQueryData(activityKey))).not.toContain('Optimistic note')
    expect(client.getQueryData<Lead>(keys.leads.detail(lead.id))?.lastContactedAt).toBe(lead.lastContactedAt)
  })
})
