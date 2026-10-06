import { QueryState } from './QueryState'

/** Loading or error stand-in for a query. Returns null when the query can render. */
export function queryBlocked(query: {
  isLoading: boolean
  isError: boolean
  refetch: () => unknown
}) {
  if (!query.isLoading && !query.isError) return null
  return (
    <QueryState
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => void query.refetch()}
    />
  )
}
