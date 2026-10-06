import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { InfiniteData } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createQueryKeys } from '@/lib/queryKeys'
import { ApiError } from '@/services/api/errors'
import { api } from '@/services'
import { ACME_TENANT_ID, USERS, actAs, setupMock, tables, teardownMock } from '@/services/mock/__tests__/helpers'
import { useAuthStore } from '@/store/auth-store'
import type { Lead, Paginated } from '@/types'
import { leadCard } from '../lib/board-model'
import { columnParams } from './use-stage-column'
import { useBoardMove } from './use-board-move'

type LeadPages = InfiniteData<Paginated<Lead>, number>

function pages(items: Lead[]): LeadPages {
  return {
    pageParams: [1],
    pages: [{ items, total: items.length, page: 1, pageSize: 20, pageCount: 1 }],
  }
}

function ids(data: LeadPages | undefined): string[] {
  return data?.pages.flatMap((page) => page.items.map((item) => item.id)) ?? []
}

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

describe('useBoardMove', () => {
  it('previews a move and restores the card when the save fails', async () => {
    const stages = tables().stages.filter((stage) => stage.tenantId === ACME_TENANT_ID)
    const open = stages.filter((stage) => stage.type === 'open')
    const lead = tables().leads.find((item) => item.stageId === open[0]?.id)
    const destination = open.find((stage) => stage.id !== lead?.stageId && stage.pipelineId === lead?.pipelineId)
    if (!lead || !destination) throw new Error('Seed is missing an open lead and a second stage')

    const keys = createQueryKeys({ tenantId: ACME_TENANT_ID, userId: USERS.arjun, role: 'admin' })
    const paramsFor = (stageId: string) => columnParams('leads', lead.pipelineId, stageId, '', [])
    const sourceKey = keys.pipelineBoard.column('leads', lead.pipelineId, lead.stageId, paramsFor(lead.stageId))
    const destKey = keys.pipelineBoard.column('leads', lead.pipelineId, destination.id, paramsFor(destination.id))
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    client.setQueryData(sourceKey, pages([lead]))
    client.setQueryData(destKey, pages([]))

    vi.spyOn(api.leads, 'moveStage').mockImplementation(async () => {
      expect(ids(client.getQueryData(destKey))).toContain(lead.id)
      throw new ApiError('unknown', 'Simulated failure')
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useBoardMove('leads', lead.pipelineId, '', []), { wrapper })
    const snapshot = result.current.preview(leadCard(lead), destination.id, 1)
    result.current.mutation.mutate({
      card: leadCard(lead),
      toStageId: destination.id,
      fromStageId: lead.stageId,
      position: 1,
      snapshot,
    })

    await waitFor(() => expect(result.current.mutation.isError).toBe(true))
    expect(ids(client.getQueryData(sourceKey))).toEqual([lead.id])
    expect(ids(client.getQueryData(destKey))).toEqual([])
  })

  it('restores the original column when a pending move is cancelled', () => {
    const stages = tables().stages.filter((stage) => stage.tenantId === ACME_TENANT_ID)
    const open = stages.filter((stage) => stage.type === 'open')
    const lost = stages.find((stage) => stage.type === 'lost' && stage.pipelineId === open[0]?.pipelineId)
    const lead = tables().leads.find((item) => item.stageId === open[0]?.id)
    if (!lead || !lost) throw new Error('Seed is missing a lead and a lost stage')

    const keys = createQueryKeys({ tenantId: ACME_TENANT_ID, userId: USERS.arjun, role: 'admin' })
    const paramsFor = (stageId: string) => columnParams('leads', lead.pipelineId, stageId, '', [])
    const sourceKey = keys.pipelineBoard.column('leads', lead.pipelineId, lead.stageId, paramsFor(lead.stageId))
    const destKey = keys.pipelineBoard.column('leads', lead.pipelineId, lost.id, paramsFor(lost.id))
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    client.setQueryData(sourceKey, pages([lead]))
    client.setQueryData(destKey, pages([]))
    const moveStage = vi.spyOn(api.leads, 'moveStage')

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => useBoardMove('leads', lead.pipelineId, '', []), { wrapper })
    const snapshot = result.current.preview(leadCard(lead), lost.id, 1)
    expect(ids(client.getQueryData(destKey))).toContain(lead.id)
    result.current.rollback(snapshot)
    expect(ids(client.getQueryData(sourceKey))).toEqual([lead.id])
    expect(ids(client.getQueryData(destKey))).toEqual([])
    expect(moveStage).not.toHaveBeenCalled()
  })
})
