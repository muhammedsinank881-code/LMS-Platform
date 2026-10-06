import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useInvalidate, useWorkspace } from '@/hooks/use-workspace'
import { api } from '@/services'
import type { CompanyInput } from '@/services/api/customers'
import type {
  CompanyListParams,
  CreateCustomerInput,
  CustomerId,
  CustomerListParams,
  UpdateCustomerInput,
} from '@/types'

export function useCustomers(params?: CustomerListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.customers.list(params),
    queryFn: () => api.customers.list(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useCustomer(id: CustomerId | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.customers.detail(id ?? ''),
    queryFn: () => api.customers.get(id as CustomerId),
    enabled: ready && Boolean(id),
  })
}

/** The originating lead's full activity history. */
export function useCustomerTimeline(id: CustomerId | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.customers.timeline(id ?? ''),
    queryFn: () => api.customers.getTimeline(id as CustomerId),
    enabled: ready && Boolean(id),
  })
}

export function useCompanies(params?: CompanyListParams) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.customers.companies(params),
    queryFn: () => api.customers.listCompanies(params),
    enabled: ready,
    placeholderData: keepPreviousData,
  })
}

export function useCompany(id: string | null | undefined) {
  const { keys, ready } = useWorkspace()
  return useQuery({
    queryKey: keys.customers.company(id ?? ''),
    queryFn: () => api.customers.getCompany(id ?? ''),
    enabled: ready && Boolean(id),
  })
}

export function useCreateCustomer() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => api.customers.create(input),
    onSuccess: () => invalidate('customers', 'auditLogs'),
    meta: { errorTitle: 'Could not create customer' },
  })
}

export function useUpdateCustomer() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: CustomerId; patch: UpdateCustomerInput }) =>
      api.customers.update(id, patch),
    onSuccess: () => invalidate('customers', 'auditLogs'),
    meta: { errorTitle: 'Could not update customer' },
  })
}

export function useDeleteCustomer() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: CustomerId) => api.customers.delete(id),
    onSuccess: () => invalidate('customers', 'leads', 'auditLogs'),
    meta: { errorTitle: 'Could not delete customer' },
  })
}

export function useCreateCompany() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (input: CompanyInput) => api.customers.createCompany(input),
    onSuccess: () => invalidate('customers'),
    meta: { errorTitle: 'Could not create company' },
  })
}

export function useUpdateCompany() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CompanyInput> }) =>
      api.customers.updateCompany(id, patch),
    onSuccess: () => invalidate('customers'),
    meta: { errorTitle: 'Could not save company' },
  })
}
