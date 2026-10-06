import { createConfigHooks, createOrderedConfigHooks } from '@/hooks/create-config-hooks'
import { api } from '@/services'

/** Lead statuses and sources are data: every select, filter and board reads them from here. */
const statuses = createOrderedConfigHooks({
  name: 'statuses',
  label: 'status',
  client: api.statuses,
  invalidates: ['leads', 'pipelineBoard', 'reports', 'auditLogs'],
})

const sources = createConfigHooks({
  name: 'sources',
  label: 'source',
  client: api.sources,
  invalidates: ['leads', 'auditLogs'],
})

export const useStatuses = statuses.useList
export const useCreateStatus = statuses.useCreate
export const useUpdateStatus = statuses.useUpdate
export const useDeleteStatus = statuses.useDelete
export const useReorderStatuses = statuses.useReorder

export const useSources = sources.useList
export const useCreateSource = sources.useCreate
export const useUpdateSource = sources.useUpdate
export const useDeleteSource = sources.useDelete
