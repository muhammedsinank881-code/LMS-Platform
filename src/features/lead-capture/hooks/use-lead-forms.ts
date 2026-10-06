import { useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { FormStatus, LeadFormInput, PublicSubmitInput } from '@/types'

export function useLeadForms() {
  const { keys, ready } = useWorkspace()
  return useQuery({ queryKey: keys.leadForms.list, queryFn: () => api.leadForms.list(), enabled: ready })
}

export function useFormSubmissions(id: string | null) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.leadForms.submissions(id ?? ''),
    queryFn: () => api.leadForms.submissions(id as string),
    enabled: ready && id !== null,
  })
}

export function useSaveLeadForm() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { id: string | null; values: LeadFormInput }) =>
      input.id ? api.leadForms.update(input.id, input.values) : api.leadForms.create(input.values),
    onSuccess: () => invalidate('leadForms', 'auditLogs'),
    meta: { errorTitle: 'Could not save the form' },
  })
}

export function useSetFormStatus() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: { id: string; status: FormStatus }) => api.leadForms.setStatus(input.id, input.status),
    onSuccess: () => invalidate('leadForms', 'auditLogs'),
    meta: { errorTitle: 'Could not update the form' },
  })
}

export function useDuplicateForm() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => api.leadForms.duplicate(id),
    onSuccess: () => invalidate('leadForms', 'auditLogs'),
    meta: { errorTitle: 'Could not duplicate the form' },
  })
}

/** Public page: no workspace, no session. Keyed by form id alone and never cached for long. */
export function usePublicForm(id: string) {
  return useQuery({
    queryKey: ['public-form', id],
    queryFn: () => api.leadForms.getPublic(id),
    retry: false,
    staleTime: 60_000,
  })
}

export function useSubmitPublicForm(id: string) {
  return useMutation({
    mutationFn: (input: PublicSubmitInput) => api.leadForms.submitPublic(id, input),
    // The page shows its own inline errors, so skip the global error toast.
    meta: { silent: true },
  })
}
