import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from '@/components/ui'
import { getErrorMessage, isPermanentError } from '@/services/api/errors'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Skip the global error toast, for mutations whose caller shows the error itself. */
      silent?: boolean
      /** Names the action in the toast title, e.g. "Could not change status". */
      errorTitle?: string
    }
  }
}

const MAX_QUERY_RETRIES = 2

/** Retry transient failures only: a FORBIDDEN, NOT_FOUND or invalid request fails the same way again. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  return failureCount < MAX_QUERY_RETRIES && !isPermanentError(error)
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.silent) return
        toast.error(mutation.meta?.errorTitle ?? 'Action failed', {
          description: getErrorMessage(error),
        })
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  })
}
