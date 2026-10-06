import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services'
import { createConfigHooks } from '@/hooks/create-config-hooks'
import { useWorkspace } from '@/hooks/use-workspace'

const templates = createConfigHooks({
  name: 'templates',
  label: 'template',
  client: api.templates,
  invalidates: ['conversations', 'auditLogs'],
})

const PENDING_POLL_MS = 2_000

/** The template list. While any template waits for review it refetches, so approval shows up live. */
export function useTemplates() {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.config.list('templates'),
    queryFn: () => api.templates.listAll(),
    enabled: ready,
    staleTime: 60_000,
    refetchInterval: (query) =>
      query.state.data?.some((template) => template.status === 'pending') ? PENDING_POLL_MS : false,
  })
}

export const useCreateTemplate = templates.useCreate
export const useUpdateTemplate = templates.useUpdate
export const useDeleteTemplate = templates.useDelete

function useTemplateAction(
  action: (id: string) => Promise<unknown>,
  errorTitle: string,
) {
  const queryClient = useQueryClient()
  const { keys } = useWorkspace()
  return useMutation({
    mutationFn: action,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.config.list('templates') }),
        queryClient.invalidateQueries({ queryKey: keys.auditLogs.all }),
      ]),
    meta: { errorTitle },
  })
}

export function useSubmitTemplate() {
  return useTemplateAction((id) => api.templates.submitForApproval(id), 'Could not submit template')
}

export function useCloneTemplate() {
  return useTemplateAction((id) => api.templates.clone(id), 'Could not clone template')
}
