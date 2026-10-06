import type { MockState } from '../core/store'
import { SEED_TENANTS } from './people'
import { createFaker, DEFAULT_SEED, type SeedEnv } from './rng'
import { emptyTables, seedEmptyTenant, seedTenant } from './tenant'

export interface SeedOptions {
  seed?: number
  /** Dates in the data are relative to this moment. Defaults to the current time. */
  now?: Date
}

/** Builds the whole in-memory database. The same `seed` and `now` always give the same data. */
export function createSeedState(options: SeedOptions = {}): MockState {
  const now = options.now ?? new Date()
  const faker = createFaker(options.seed ?? DEFAULT_SEED)
  const state: MockState = { tables: emptyTables(), counters: {} }
  for (const spec of SEED_TENANTS) {
    const env: SeedEnv = {
      faker,
      now,
      tenantId: spec.tenantId,
      key: spec.key,
      scale: spec.scale,
    }
    seedTenant(state, env, spec)
  }
  return state
}

export { seedEmptyTenant, SEED_TENANTS }
export { createFaker, DEFAULT_SEED }
export type { SeedEnv }
