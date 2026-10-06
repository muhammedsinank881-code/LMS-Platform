import { isPaginated } from '@/lib/optimistic'

interface QueryLike {
  isPending: boolean
  isFetching: boolean
  isError: boolean
  error: Error | null
  data: unknown
}

const PREVIEW_ITEMS = 2

function describe(data: unknown): string {
  if (isPaginated(data)) return `${data.total} total (page ${data.page}/${data.pageCount})`
  if (Array.isArray(data)) return `${data.length} items`
  return data === undefined ? 'no data' : 'object'
}

/** Trims long lists so the preview stays readable. */
function preview(data: unknown): unknown {
  if (isPaginated(data)) return { ...data, items: data.items.slice(0, PREVIEW_ITEMS) }
  if (Array.isArray(data)) return data.slice(0, PREVIEW_ITEMS)
  return data
}

/** One row of the data check: state, count and a raw JSON preview. */
export function DevQuery({ label, query }: { label: string; query: QueryLike }) {
  let state = describe(query.data)
  if (query.isPending) state = 'loading…'
  else if (query.isError) state = `ERROR: ${query.error?.message ?? 'unknown'}`
  else if (isEmpty(query.data)) state = `empty (${state})`

  return (
    <details>
      <summary>
        <strong>{label}</strong>: {state}
        {query.isFetching && !query.isPending ? ' (refreshing)' : ''}
      </summary>
      <pre>{query.isError ? String(query.error) : JSON.stringify(preview(query.data), null, 2)}</pre>
    </details>
  )
}

function isEmpty(data: unknown): boolean {
  if (isPaginated(data)) return data.total === 0
  return Array.isArray(data) && data.length === 0
}
