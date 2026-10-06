import { QueryClient } from '@tanstack/react-query'
import { beforeEach, describe, expect, it } from 'vitest'
import { patchOptimistically, rollbackOptimistic } from './optimistic'

interface Row {
  id: string
  status: string
}

const page = (items: Row[]) => ({ items, total: items.length, page: 1, pageSize: 25, pageCount: 1 })
const mark = (row: Row): Row => ({ ...row, status: 'won' })

let client: QueryClient
beforeEach(() => {
  client = new QueryClient()
  client.setQueryData(['x', 'list', { page: 1 }], page([{ id: 'a', status: 'new' }, { id: 'b', status: 'new' }]))
  client.setQueryData(['x', 'list', { page: 2 }], page([{ id: 'c', status: 'new' }]))
  client.setQueryData(['x', 'detail', 'a'], { id: 'a', status: 'new' })
  client.setQueryData(['x', 'board'], [{ id: 'a', status: 'new' }])
})

describe('patchOptimistically', () => {
  it('patches the entity in pages, arrays and details, leaving others alone', async () => {
    await patchOptimistically<Row>(client, [['x']], 'a', mark)
    expect(client.getQueryData<ReturnType<typeof page>>(['x', 'list', { page: 1 }])?.items).toEqual([
      { id: 'a', status: 'won' },
      { id: 'b', status: 'new' },
    ])
    expect(client.getQueryData(['x', 'detail', 'a'])).toEqual({ id: 'a', status: 'won' })
    expect(client.getQueryData(['x', 'board'])).toEqual([{ id: 'a', status: 'won' }])
    expect(client.getQueryData<ReturnType<typeof page>>(['x', 'list', { page: 2 }])?.items[0].status).toBe('new')
  })

  it('only snapshots caches it changed, and rolls them back', async () => {
    const snapshot = await patchOptimistically<Row>(client, [['x']], 'a', mark)
    expect(snapshot).toHaveLength(3)
    rollbackOptimistic(client, snapshot)
    expect(client.getQueryData(['x', 'detail', 'a'])).toEqual({ id: 'a', status: 'new' })
    expect(client.getQueryData<ReturnType<typeof page>>(['x', 'list', { page: 1 }])?.items[0].status).toBe('new')
  })

  it('does nothing for an id that is not cached', async () => {
    expect(await patchOptimistically<Row>(client, [['x']], 'zzz', mark)).toEqual([])
  })

  it('tolerates a missing snapshot on rollback', () => {
    expect(() => rollbackOptimistic(client, undefined)).not.toThrow()
  })
})
