import { getMockNow } from '../config'
import { createSeedState, type SeedOptions } from '../seed'
import type { MockState } from './store'

let state: MockState | null = null

/** The one in-memory database. Built on first use and lost on reload, like a dev server restart. */
export function getMockState(): MockState {
  state ??= createSeedState({ now: getMockNow() })
  return state
}

/** Rebuilds the database from the seed. Used by tests and the dev "reset data" switch. */
export function resetMockDb(options: SeedOptions = {}): MockState {
  state = createSeedState({ now: getMockNow(), ...options })
  return state
}
